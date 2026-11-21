/* Optional reading enhancements. The complete article remains usable without JS. */
(function () {
  'use strict';

  var article = document.querySelector('.gl-article');
  if (!article) return;

  var content = article.querySelector('.gl-article-content');
  var toc = article.querySelector('.gl-article-toc');

  if (content && toc) {
    var headings = Array.from(content.querySelectorAll('h2, h3'));
    if (headings.length >= 3) {
      var list = toc.querySelector('ol');
      var hasSections = headings.some(function (heading) { return heading.tagName === 'H2'; });

      headings.forEach(function (heading, index) {
        if (!heading.id) {
          var id = 'article-section-' + (index + 1);
          while (document.getElementById(id)) id += '-section';
          heading.id = id;
        }
        var item = document.createElement('li');
        if (hasSections && heading.tagName === 'H3') item.className = 'is-subsection';
        var link = document.createElement('a');
        link.href = '#' + encodeURIComponent(heading.id);
        link.textContent = heading.textContent;
        item.appendChild(link);
        list.appendChild(item);
      });

      toc.hidden = false;
    }
  }

  if (content) {
    content.querySelectorAll('pre').forEach(function (block) {
      block.tabIndex = 0;
      block.setAttribute('aria-label', 'Code example');
    });

    function showUnavailableImage(img) {
      if (!img.isConnected) return;
      var originalLink = img.closest('a');
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

      var reference = document.createElement(originalLink ? 'span' : 'a');
      reference.className = 'gl-article-media-reference';
      reference.textContent = 'Open original reference ↗';
      if (!originalLink) {
        reference.href = img.currentSrc || img.src;
        reference.target = '_blank';
        reference.rel = 'noopener';
      }
      fallback.appendChild(reference);
      img.replaceWith(fallback);
    }

    content.querySelectorAll('img').forEach(function (img) {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
      img.addEventListener('error', function () { showUnavailableImage(img); }, { once: true });
      if (img.complete && img.naturalWidth === 0) showUnavailableImage(img);
    });

    content.querySelectorAll('iframe').forEach(function (frame) {
      if (!frame.title) frame.title = 'Embedded media';
      if (!frame.hasAttribute('loading')) frame.loading = 'lazy';
    });
  }

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
    }

    controls.querySelector('[data-carousel-prev]').addEventListener('click', function () { show(current - 1); });
    controls.querySelector('[data-carousel-next]').addEventListener('click', function () { show(current + 1); });
    show(0);
    controls.hidden = false;
  });
})();
