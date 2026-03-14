/* Guillaume Lauzier — Site Scripts */

/* ── THEME SWITCHER ── */
(function () {
  var html = document.documentElement;
  var STORE = 'gl-theme';
  var THEMES = ['light', 'grey', 'dark'];

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'dark';
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORE, theme);
    document.querySelectorAll('.gl-theme-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-gl-theme') === theme);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var saved = localStorage.getItem(STORE) || 'dark';
    applyTheme(saved);

    document.querySelectorAll('.gl-theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTheme(btn.getAttribute('data-gl-theme'));
      });
    });
  });
})();

document.addEventListener('DOMContentLoaded', function () {

  /* Mobile hamburger menu */
  const hamburger = document.getElementById('gl-hamburger');
  const navLinks  = document.getElementById('gl-nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Alignment toggle */
  const toggle = document.getElementById('gl-align-toggle');
  if (toggle) {
    const knob    = toggle.querySelector('.gl-toggle-knob');
    const feeText = document.getElementById('gl-toggle-fee');
    const eqText  = document.getElementById('gl-toggle-eq');
    const feePanel = document.getElementById('gl-panel-fee');
    const eqPanel  = document.getElementById('gl-panel-eq');
    let isEquity = false;

    function updateToggle() {
      if (isEquity) {
        toggle.classList.add('on');
        feeText.classList.remove('active');
        eqText.classList.add('active');
        feePanel.classList.add('hidden');
        eqPanel.classList.remove('hidden');
      } else {
        toggle.classList.remove('on');
        feeText.classList.add('active');
        eqText.classList.remove('active');
        feePanel.classList.remove('hidden');
        eqPanel.classList.add('hidden');
      }
    }

    toggle.addEventListener('click', function () {
      isEquity = !isEquity;
      updateToggle();
    });

    updateToggle();
  }

  /* Post hero carousel */
  const carousel = document.querySelector('.gl-post-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.gl-post-carousel-slide');
    const dots   = carousel.querySelectorAll('.gl-post-carousel-dot');
    const prev   = carousel.querySelector('.gl-post-carousel-prev');
    const next   = carousel.querySelector('.gl-post-carousel-next');
    let current  = 0;

    function goTo(idx) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    /* Auto-advance every 5s */
    let timer = setInterval(function () { goTo(current + 1); }, 5000);
    carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
    carousel.addEventListener('mouseleave', function () {
      timer = setInterval(function () { goTo(current + 1); }, 5000);
    });
  }

  /* Pitch form success state */
  const pitchForm = document.getElementById('gl-pitch-form');
  if (pitchForm) {
    pitchForm.addEventListener('submit', function (e) {
      const action = pitchForm.getAttribute('action');
      if (!action || action === '#') {
        e.preventDefault();
        pitchForm.style.display = 'none';
        const success = document.getElementById('gl-pitch-success');
        if (success) success.style.display = 'block';
      }
    });
  }

});
