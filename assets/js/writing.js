/* Progressive enhancement: the complete archive remains readable without JS. */
(function () {
  'use strict';

  var grid = document.getElementById('writing-grid');
  var topic = document.getElementById('writing-topic');
  var filter = document.getElementById('writing-filter');
  var more = document.getElementById('writing-more');
  var button = document.getElementById('writing-load-more');
  var status = document.getElementById('writing-results');
  var empty = document.getElementById('writing-empty');
  if (!grid || !topic || !filter || !more || !button || !status || !empty) return;

  var batchSize = 12;
  var limit = batchSize;
  var entries = Array.from(grid.querySelectorAll('[data-writing-card]')).map(function (card) {
    return { element: card, topics: JSON.parse(card.getAttribute('data-topics') || '[]') };
  });
  var matches = entries;

  function render() {
    matches = entries.filter(function (entry) {
      return topic.value === 'all' || entry.topics.indexOf(topic.value) !== -1;
    });
    var shown = 0;
    entries.forEach(function (entry) {
      var matchesTopic = topic.value === 'all' || entry.topics.indexOf(topic.value) !== -1;
      entry.element.hidden = !matchesTopic || shown >= limit;
      if (matchesTopic) shown += 1;
    });
    var visible = Math.min(limit, matches.length);
    status.textContent = 'Showing ' + visible + ' of ' + matches.length + ' field note' + (matches.length === 1 ? '' : 's');
    more.hidden = visible >= matches.length;
    empty.hidden = matches.length !== 0;
  }

  topic.addEventListener('change', function () {
    limit = batchSize;
    render();
  });

  // Browsers can restore a previous selection after the initial script runs.
  window.addEventListener('pageshow', render);

  button.addEventListener('click', function () {
    var firstNew = matches[limit];
    limit += batchSize;
    render();
    // Put keyboard and screen-reader users at the start of the newly revealed set.
    if (firstNew) firstNew.element.querySelector('a').focus({ preventScroll: true });
  });

  render();
  filter.hidden = false;
})();
