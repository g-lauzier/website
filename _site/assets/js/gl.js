/* Guillaume Lauzier — Site Scripts */

/* ── SECTOR ACCORDION ── */
document.addEventListener('DOMContentLoaded', function () {

  /* Sector cards */
  const cards = document.querySelectorAll('.gl-sector-card');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      const isActive = card.classList.contains('active');
      cards.forEach(function (c) { c.classList.remove('active'); });
      if (!isActive) card.classList.add('active');
    });
  });

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
