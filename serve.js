const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 5000;
const ROOT = path.resolve(path.join(__dirname, '_site'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.pdf':  'application/pdf',
};

const COMPRESSIBLE = new Set([
  '.html', '.css', '.js', '.json', '.svg', '.xml', '.txt'
]);

const IMMUTABLE_DIRS = new Set(['assets']);
const STREAM_THRESHOLD = 1024 * 1024;          // 1 MB → stream instead of buffer
const COMPRESS_MAX_SIZE = 5 * 1024 * 1024;     // 5 MB → don't try to gzip
const GZIP_CACHE_MAX_ENTRIES = 100;            // bounded LRU
const GZIP_CACHE_MAX_BYTES = 32 * 1024 * 1024; // 32 MB total cap

// Canonical CSP — kept in sync with cloudflare.toml.
const CSP = "default-src 'self'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://js.hcaptcha.com https://*.hcaptcha.com https://www.googletagmanager.com; frame-src https://*.hcaptcha.com https://www.googletagmanager.com; connect-src 'self' https://formspree.io https://*.hcaptcha.com https://www.google-analytics.com; form-action 'self' https://formspree.io; base-uri 'self'; object-src 'none'; frame-ancestors 'self'";

// Security headers applied to every response (200/206/304/404/405/500).
function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': CSP,
  };
}

// ── Bounded LRU gzip cache, keyed by filePath + mtimeMs ─────────────────────
const gzipCache = new Map();
let gzipCacheBytes = 0;

function cacheKey(filePath, mtimeMs) {
  return filePath + '@' + mtimeMs;
}

function gzipCacheGet(key) {
  if (!gzipCache.has(key)) return null;
  const v = gzipCache.get(key);
  // Bump recency
  gzipCache.delete(key);
  gzipCache.set(key, v);
  return v;
}

function gzipCacheSet(key, buf) {
  if (gzipCache.has(key)) {
    gzipCacheBytes -= gzipCache.get(key).length;
    gzipCache.delete(key);
  }
  gzipCache.set(key, buf);
  gzipCacheBytes += buf.length;
  while (
    (gzipCache.size > GZIP_CACHE_MAX_ENTRIES || gzipCacheBytes > GZIP_CACHE_MAX_BYTES)
    && gzipCache.size > 0
  ) {
    const oldestKey = gzipCache.keys().next().value;
    const oldest = gzipCache.get(oldestKey);
    gzipCache.delete(oldestKey);
    gzipCacheBytes -= oldest.length;
  }
}

function safeStat(filePath) {
  try { return fs.statSync(filePath); } catch (e) { return null; }
}

function resolveFilePath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch (e) { return null; }

  let resolved = path.resolve(path.join(ROOT, decoded));
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) return null;

  let stat = safeStat(resolved);
  if (stat && stat.isDirectory()) {
    resolved = path.join(resolved, 'index.html');
    stat = safeStat(resolved);
  }
  if (stat && stat.isFile()) return { path: resolved, stat };

  let htmlPath = resolved + '.html';
  stat = safeStat(htmlPath);
  if (stat && stat.isFile()) return { path: htmlPath, stat };

  if (!decoded.includes('.')) {
    htmlPath = path.join(resolved, 'index.html');
    stat = safeStat(htmlPath);
    if (stat && stat.isFile()) return { path: htmlPath, stat };
  }

  return null;
}

function isImmutableAsset(urlPath) {
  const parts = urlPath.split('/').filter(Boolean);
  return parts.length > 0 && IMMUTABLE_DIRS.has(parts[0]);
}

function generateETag(stat) {
  return '"' + stat.size.toString(36) + '-' + stat.mtimeMs.toString(36) + '"';
}

function parseRange(rangeHeader, size) {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;
  const spec = rangeHeader.slice(6).split(',')[0].trim();
  const dash = spec.indexOf('-');
  if (dash === -1) return null;
  let start = spec.slice(0, dash);
  let end = spec.slice(dash + 1);
  if (start === '' && end === '') return null;
  if (start === '') {
    const suffix = parseInt(end, 10);
    if (isNaN(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = parseInt(start, 10);
    end = end === '' ? size - 1 : parseInt(end, 10);
    if (isNaN(start) || isNaN(end)) return null;
  }
  if (start < 0 || end >= size || start > end) return null;
  return { start, end };
}

function serveError(res, code, message) {
  res.writeHead(code, Object.assign(
    { 'Content-Type': 'text/plain; charset=utf-8' },
    securityHeaders()
  ));
  res.end(message);
}

function serve404(res) {
  const notFound = path.join(ROOT, '404.html');
  fs.readFile(notFound, function (err, data) {
    if (err) {
      res.writeHead(404, Object.assign(
        { 'Content-Type': 'text/plain; charset=utf-8' },
        securityHeaders()
      ));
      res.end('404 Not Found');
    } else {
      res.writeHead(404, Object.assign(
        { 'Content-Type': 'text/html; charset=utf-8' },
        securityHeaders()
      ));
      res.end(data);
    }
  });
}

http.createServer(function (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    serveError(res, 405, 'Method Not Allowed');
    return;
  }

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const result = resolveFilePath(urlPath);
  if (!result) { serve404(res); return; }

  const filePath = result.path;
  const fileStat = result.stat;
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const etag = generateETag(fileStat);

  const headers = Object.assign({
    'Content-Type': mime,
    'Vary': 'Accept-Encoding',
    'ETag': etag,
    'Last-Modified': fileStat.mtime.toUTCString(),
    'Accept-Ranges': 'bytes',
  }, securityHeaders());

  if (isImmutableAsset(urlPath)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (ext === '.html') {
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  } else {
    headers['Cache-Control'] = 'public, max-age=86400';
  }

  // Conditional GET
  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];
  if (ifNoneMatch && ifNoneMatch === etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  if (!ifNoneMatch && ifModifiedSince) {
    const modDate = new Date(ifModifiedSince);
    if (!isNaN(modDate.getTime()) && fileStat.mtime <= modDate) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
  }

  // HEAD: don't read body
  if (req.method === 'HEAD') {
    headers['Content-Length'] = fileStat.size;
    res.writeHead(200, headers);
    res.end();
    return;
  }

  // Range request (videos, large downloads) → 206 Partial Content, streamed
  const range = parseRange(req.headers['range'], fileStat.size);
  if (range) {
    headers['Content-Range'] = `bytes ${range.start}-${range.end}/${fileStat.size}`;
    headers['Content-Length'] = (range.end - range.start) + 1;
    delete headers['Vary'];
    res.writeHead(206, headers);
    fs.createReadStream(filePath, { start: range.start, end: range.end })
      .on('error', () => res.destroy())
      .pipe(res);
    return;
  }

  // Large files → stream, no gzip
  if (fileStat.size > STREAM_THRESHOLD) {
    headers['Content-Length'] = fileStat.size;
    res.writeHead(200, headers);
    fs.createReadStream(filePath)
      .on('error', () => res.destroy())
      .pipe(res);
    return;
  }

  // Small files → buffer + gzip if compressible
  fs.readFile(filePath, function (err, data) {
    if (err) { serveError(res, 500, 'Internal Server Error'); return; }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const wantsGzip = COMPRESSIBLE.has(ext)
      && data.length > 1024
      && data.length <= COMPRESS_MAX_SIZE
      && acceptEncoding.includes('gzip');

    if (wantsGzip) {
      const key = cacheKey(filePath, fileStat.mtimeMs);
      const cached = gzipCacheGet(key);
      const sendGz = function (compressed) {
        headers['Content-Encoding'] = 'gzip';
        headers['Content-Length'] = compressed.length;
        res.writeHead(200, headers);
        res.end(compressed);
      };
      if (cached) { sendGz(cached); return; }
      zlib.gzip(data, { level: 6 }, function (err, compressed) {
        if (err) {
          headers['Content-Length'] = data.length;
          res.writeHead(200, headers);
          res.end(data);
          return;
        }
        gzipCacheSet(key, compressed);
        sendGz(compressed);
      });
      return;
    }

    headers['Content-Length'] = data.length;
    res.writeHead(200, headers);
    res.end(data);
  });

}).listen(PORT, '0.0.0.0', function () {
  console.log('Server running on port ' + PORT);
});
