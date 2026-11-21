/* Optional reading tools. The article itself remains complete without JavaScript. */
(function () {
  'use strict';

  var article = document.querySelector('.gl-article');
  if (!article || article.dataset.readingEnhanced) return;
  article.dataset.readingEnhanced = 'true';

  var content = article.querySelector('.gl-article-content');
  if (!content) return;
  var toc = article.querySelector('.gl-article-toc');
  var rail = article.querySelector('.gl-article-rail');
  var readingLayout = article.querySelector('.gl-article-reading-layout');
  var progress = article.querySelector('.gl-article-progress');
  var nav = document.querySelector('.gl-nav');
  var desktop = window.matchMedia ? window.matchMedia('(min-width: 1100px)') : null;
  var records = [];
  var tableHints = [];
  var framePending = false;
  var navHeight = -1;
  var scrollOffset = -1;
  var currentSection = null;

  function uniqueId(candidate) {
    while (document.getElementById(candidate)) candidate += '-section';
    return candidate;
  }

  var headings = Array.from(content.querySelectorAll('h2, h3'));
  var parentSection = false;
  headings.forEach(function (heading, index) {
    var label = heading.textContent.trim();
    if (!heading.id) heading.id = uniqueId('article-section-' + (index + 1));
    heading.tabIndex = -1;
    var record = { heading: heading, link: null };
    if (toc && headings.length >= 3) {
      if (heading.tagName === 'H2') parentSection = true;
      var item = document.createElement('li');
      if (heading.tagName === 'H3' && parentSection) item.className = 'is-subsection';
      var link = document.createElement('a');
      link.href = '#' + encodeURIComponent(heading.id);
      link.textContent = label;
      item.appendChild(link);
      toc.querySelector('ol').appendChild(item);
      record.link = link;
    }
    var anchor = document.createElement('a');
    anchor.className = 'gl-article-anchor';
    anchor.href = '#' + encodeURIComponent(heading.id);
    anchor.textContent = '#';
    anchor.setAttribute('aria-label', 'Link to section: ' + label);
    heading.appendChild(anchor);
    records.push(record);
  });

  if (toc && headings.length >= 3) {
    toc.hidden = false;
    article.classList.add('has-reading-guide');
    if (rail) rail.hidden = false;
    if (readingLayout) readingLayout.classList.add('has-toc');
    function syncContentsLayout() {
      toc.open = desktop ? desktop.matches : window.innerWidth >= 1100;
      queueReadingUpdate();
    }
    syncContentsLayout();
    if (desktop && desktop.addEventListener) desktop.addEventListener('change', syncContentsLayout);
    else if (desktop && desktop.addListener) desktop.addListener(syncContentsLayout);
    else window.addEventListener('resize', syncContentsLayout);
    toc.addEventListener('click', function (event) {
      if (!event.target.closest('a') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(desktop ? desktop.matches : window.innerWidth >= 1100)) toc.open = false;
    });
    toc.addEventListener('toggle', queueReadingUpdate);
  }

  var title = article.querySelector('.gl-article-title');
  if (title) title.tabIndex = -1;

  var languageNames = {
    js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
    python: 'Python', py: 'Python', ruby: 'Ruby', rb: 'Ruby', go: 'Go', rust: 'Rust',
    cpp: 'C++', c: 'C', csharp: 'C#', java: 'Java', swift: 'Swift', solidity: 'Solidity',
    bash: 'Bash', sh: 'Shell', shell: 'Shell', json: 'JSON', yaml: 'YAML', yml: 'YAML',
    html: 'HTML', css: 'CSS', sql: 'SQL', plaintext: 'Plain text', text: 'Plain text'
  };

  content.querySelectorAll('pre').forEach(function (block) {
    var host = block.closest('.highlighter-rouge') || block;
    var code = block.querySelector('code');
    var classes = host.className + ' ' + block.className + ' ' + (code ? code.className : '');
    var match = classes.match(/\blanguage-([\w+-]+)/);
    var language = match ? (languageNames[match[1]] || match[1]) : 'Plain text';
    var frame = document.createElement('div');
    frame.className = 'gl-article-code';
    var bar = document.createElement('div');
    bar.className = 'gl-article-code-bar';
    var label = document.createElement('span');
    label.textContent = language;
    bar.appendChild(label);
    host.before(frame);
    frame.appendChild(bar);
    frame.appendChild(host);
    block.tabIndex = 0;
    block.setAttribute('aria-label', language + ' code example');

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'gl-article-copy';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy ' + language + ' code');
      var status = document.createElement('span');
      status.className = 'gl-article-sr-only';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      bar.appendChild(button);
      bar.appendChild(status);
      button.addEventListener('click', async function () {
        button.disabled = true;
        status.textContent = '';
        try {
          await navigator.clipboard.writeText(code ? code.textContent : block.textContent);
          button.textContent = 'Copied';
          status.textContent = language + ' code copied.';
        } catch (error) {
          button.textContent = 'Copy failed';
          status.textContent = 'Copy is unavailable. Select the code and copy it manually.';
        }
        button.disabled = false;
        window.setTimeout(function () { button.textContent = 'Copy'; }, 2000);
      });
    }
  });

  var sectionLabel = 'Article';
  content.querySelectorAll('h2, h3, h4, h5, h6, table').forEach(function (element) {
    if (element.tagName !== 'TABLE') {
      var copy = element.cloneNode(true);
      copy.querySelectorAll('.gl-article-anchor').forEach(function (anchor) { anchor.remove(); });
      sectionLabel = copy.textContent.trim();
      return;
    }
    var wrap = element.closest('.gl-article-table-wrap');
    if (!wrap) return;
    var caption = element.querySelector('caption');
    wrap.setAttribute('aria-label', (caption ? caption.textContent.trim() : sectionLabel) + ' — scrollable table');
    var hint = document.createElement('p');
    hint.className = 'gl-article-table-hint';
    hint.textContent = 'Scroll horizontally to see all columns.';
    hint.hidden = true;
    wrap.after(hint);
    tableHints.push({ wrap: wrap, hint: hint });
  });

  function showUnavailableImage(img) {
    if (!img.isConnected) return;
    var originalLink = img.closest('a');
    var zoom = img.closest('.gl-article-zoom');
    var fallback = document.createElement('span');
    fallback.className = 'gl-article-media-unavailable';
    var label = document.createElement('span');
    label.className = 'gl-article-media-status';
    label.textContent = 'Original image unavailable';
    fallback.appendChild(label);
    if (img.alt.trim()) {
      var description = document.createElement('span');
      description.textContent = img.alt;
      fallback.appendChild(description);
    }
    var source = new URL(img.currentSrc || img.src, window.location.href);
    var canLink = !originalLink && /^(https?:)$/.test(source.protocol);
    var reference = document.createElement(canLink ? 'a' : 'span');
    reference.className = 'gl-article-media-reference';
    reference.textContent = 'Open original reference ↗';
    if (canLink) {
      reference.href = source.href;
      reference.target = '_blank';
      reference.rel = 'noopener';
    }
    fallback.appendChild(reference);
    (zoom || img).replaceWith(fallback);
    queueReadingUpdate();
  }

  content.querySelectorAll('img').forEach(function (img) {
    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    img.addEventListener('error', function () { showUnavailableImage(img); }, { once: true });
    img.addEventListener('load', queueReadingUpdate);
    if (img.complete && img.naturalWidth === 0) showUnavailableImage(img);
  });
  content.querySelectorAll('iframe').forEach(function (frame) {
    if (!frame.title) frame.title = 'Embedded media';
    if (!frame.hasAttribute('loading')) frame.loading = 'lazy';
  });

  /* Native dialog supplies focus containment and inert background behavior. */
  function addImageViewer() {
    var dialog = document.createElement('dialog');
    if (typeof dialog.showModal !== 'function') return;
    dialog.className = 'gl-article-image-dialog';
    var bar = document.createElement('div');
    bar.className = 'gl-article-image-dialog-bar';
    var label = document.createElement('p');
    label.id = uniqueId('gl-article-image-title');
    label.textContent = 'Image preview';
    dialog.setAttribute('aria-labelledby', label.id);
    var close = document.createElement('button');
    close.type = 'button';
    close.autofocus = true;
    close.textContent = 'Close ×';
    close.setAttribute('aria-label', 'Close image preview');
    bar.appendChild(label);
    bar.appendChild(close);
    var figure = document.createElement('figure');
    var preview = document.createElement('img');
    var caption = document.createElement('figcaption');
    var error = document.createElement('p');
    error.className = 'gl-article-media-unavailable';
    error.setAttribute('role', 'status');
    error.textContent = 'The full-size image is unavailable.';
    error.hidden = true;
    figure.appendChild(preview);
    figure.appendChild(caption);
    dialog.appendChild(bar);
    dialog.appendChild(figure);
    dialog.appendChild(error);
    article.appendChild(dialog);
    var opener = null;
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); dialog.close(); });
    dialog.addEventListener('close', function () {
      document.body.classList.remove('gl-article-image-open');
      preview.removeAttribute('src');
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    preview.addEventListener('error', function () { if (dialog.open) { preview.hidden = true; error.hidden = false; } });

    article.querySelectorAll('.gl-article-hero > img, .gl-article-content img').forEach(function (img) {
      function enhanceImage() {
        if (!img.isConnected || img.closest('a, button') || img.naturalWidth < 160 || img.naturalHeight < 100) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'gl-article-zoom';
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-label', 'Enlarge image' + (img.alt ? ': ' + img.alt : ''));
        var hint = document.createElement('span');
        hint.className = 'gl-article-zoom-hint';
        hint.textContent = 'Enlarge ↗';
        hint.setAttribute('aria-hidden', 'true');
        img.before(button);
        button.appendChild(img);
        button.appendChild(hint);
        button.addEventListener('click', function () {
          if (dialog.open) return;
          opener = button;
          preview.alt = img.alt;
          preview.hidden = false;
          error.hidden = true;
          preview.src = img.src;
          var sourceFigure = button.closest('figure');
          var sourceCaption = sourceFigure && sourceFigure.querySelector('figcaption');
          caption.textContent = sourceCaption ? sourceCaption.textContent.trim() : img.alt;
          caption.hidden = !caption.textContent;
          dialog.showModal();
          document.body.classList.add('gl-article-image-open');
          close.focus();
        });
      }
      img.addEventListener('load', enhanceImage);
      if (img.complete && img.naturalWidth > 0) enhanceImage();
    });
  }
  addImageViewer();

  article.querySelectorAll('.gl-article-carousel').forEach(function (carousel) {
    var slides = Array.from(carousel.querySelectorAll('.gl-article-slide'));
    var controls = carousel.querySelector('.gl-article-carousel-controls');
    if (slides.length < 2 || !controls) return;
    var status = controls.querySelector('[data-carousel-status]');
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.hidden = i !== current; });
      status.textContent = (current + 1) + ' / ' + slides.length;
      queueReadingUpdate();
    }
    controls.querySelector('[data-carousel-prev]').addEventListener('click', function () { show(current - 1); });
    controls.querySelector('[data-carousel-next]').addEventListener('click', function () { show(current + 1); });
    show(0);
    controls.hidden = false;
  });

  function updateReadingState() {
    framePending = false;
    var measuredHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    if (measuredHeight !== navHeight) {
      navHeight = measuredHeight;
      article.style.setProperty('--article-nav-height', navHeight + 'px');
    }
    var compactGuide = rail && !rail.hidden && !(desktop ? desktop.matches : window.innerWidth >= 1100);
    var guideHeight = compactGuide ? toc.querySelector('summary').getBoundingClientRect().height : 0;
    var top = navHeight + guideHeight + 28;
    if (top !== scrollOffset) {
      scrollOffset = top;
      article.style.setProperty('--article-scroll-offset', top + 'px');
    }
    var box = content.getBoundingClientRect();
    if (progress) {
      var distance = box.height - (window.innerHeight - top);
      var fraction = distance > 0 ? (top - box.top) / distance : (box.top <= top ? 1 : 0);
      fraction = box.height > 0 ? Math.max(0, Math.min(1, fraction)) : 0;
      progress.querySelector('span').style.transform = 'scaleX(' + fraction + ')';
      progress.hidden = false;
    }
    var active = null;
    records.forEach(function (record) {
      if (record.heading.getBoundingClientRect().top <= top + 12) active = record;
    });
    if (active !== currentSection) {
      records.forEach(function (record) {
        if (!record.link) return;
        if (record === active) record.link.setAttribute('aria-current', 'location');
        else record.link.removeAttribute('aria-current');
      });
      currentSection = active;
    }
    tableHints.forEach(function (entry) { entry.hint.hidden = entry.wrap.scrollWidth <= entry.wrap.clientWidth + 1; });
  }

  function queueReadingUpdate() {
    if (framePending) return;
    framePending = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(updateReadingState);
    else window.setTimeout(updateReadingState, 16);
  }

  window.addEventListener('scroll', queueReadingUpdate, { passive: true });
  window.addEventListener('resize', queueReadingUpdate);
  window.addEventListener('hashchange', queueReadingUpdate);
  window.addEventListener('pageshow', queueReadingUpdate);
  if (typeof ResizeObserver === 'function') {
    var observer = new ResizeObserver(queueReadingUpdate);
    observer.observe(content);
    if (nav) observer.observe(nav);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueReadingUpdate);
  queueReadingUpdate();
})();
