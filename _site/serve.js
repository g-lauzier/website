const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

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
};

const COMPRESSIBLE = new Set([
  '.html', '.css', '.js', '.json', '.svg', '.xml', '.txt'
]);

const IMMUTABLE_DIRS = new Set(['assets', 'revolution']);

const gzipCache = new Map();

function safeStat(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (e) {
    return null;
  }
}

function resolveFilePath(urlPath) {
  var decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (e) {
    return null;
  }

  var resolved = path.resolve(path.join(ROOT, decoded));
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
    return null;
  }

  var stat = safeStat(resolved);
  if (stat && stat.isDirectory()) {
    resolved = path.join(resolved, 'index.html');
    stat = safeStat(resolved);
  }
  if (stat && stat.isFile()) return { path: resolved, stat: stat };

  var htmlPath = resolved + '.html';
  stat = safeStat(htmlPath);
  if (stat && stat.isFile()) return { path: htmlPath, stat: stat };

  if (!decoded.includes('.')) {
    htmlPath = path.join(resolved, 'index.html');
    stat = safeStat(htmlPath);
    if (stat && stat.isFile()) return { path: htmlPath, stat: stat };
  }

  return null;
}

function isImmutableAsset(urlPath) {
  var parts = urlPath.split('/').filter(Boolean);
  return parts.length > 0 && IMMUTABLE_DIRS.has(parts[0]);
}

function generateETag(stat) {
  return '"' + stat.size.toString(36) + '-' + stat.mtimeMs.toString(36) + '"';
}

function getGzipped(filePath, data, callback) {
  var cached = gzipCache.get(filePath);
  if (cached) {
    callback(null, cached);
    return;
  }
  zlib.gzip(data, { level: 6 }, function(err, compressed) {
    if (!err) {
      gzipCache.set(filePath, compressed);
    }
    callback(err, compressed);
  });
}

http.createServer(function (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  var urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  var result = resolveFilePath(urlPath);

  if (!result) {
    var notFound = path.join(ROOT, '404.html');
    fs.readFile(notFound, function(err, data) {
      if (err) {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      }
    });
    return;
  }

  var filePath = result.path;
  var fileStat = result.stat;
  var ext = path.extname(filePath).toLowerCase();
  var mime = MIME[ext] || 'application/octet-stream';
  var etag = generateETag(fileStat);

  var headers = {
    'Content-Type': mime,
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Accept-Encoding',
    'ETag': etag,
    'Last-Modified': fileStat.mtime.toUTCString(),
  };

  if (isImmutableAsset(urlPath)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (ext === '.html') {
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  } else {
    headers['Cache-Control'] = 'public, max-age=86400';
  }

  var ifNoneMatch = req.headers['if-none-match'];
  var ifModifiedSince = req.headers['if-modified-since'];
  if (ifNoneMatch && ifNoneMatch === etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  if (!ifNoneMatch && ifModifiedSince) {
    var modDate = new Date(ifModifiedSince);
    if (fileStat.mtime <= modDate) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
  }

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }

    if (req.method === 'HEAD') {
      headers['Content-Length'] = data.length;
      res.writeHead(200, headers);
      res.end();
      return;
    }

    var acceptEncoding = req.headers['accept-encoding'] || '';
    if (COMPRESSIBLE.has(ext) && data.length > 1024 && acceptEncoding.includes('gzip')) {
      getGzipped(filePath, data, function(err, compressed) {
        if (err) {
          headers['Content-Length'] = data.length;
          res.writeHead(200, headers);
          res.end(data);
          return;
        }
        headers['Content-Encoding'] = 'gzip';
        headers['Content-Length'] = compressed.length;
        res.writeHead(200, headers);
        res.end(compressed);
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
