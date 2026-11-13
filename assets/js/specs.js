/* Details: five detail tabs and two cards that are always in view, Dream Ananta beside what you usually get.
   Choosing a tab changes both cards together: photographs crossfade, titles, lines and spec lists swap.
   No hover behaviour, nothing hidden behind a switch. Arrow keys move between the tabs. */
(function () {
  'use strict';
  var tablist = document.querySelector('.cmp-tabs');
  var board = document.getElementById('cmp-board');
  if (!tablist || !board) return;
  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var sides = Array.prototype.slice.call(board.querySelectorAll('.cmp-side'));
  var current = -1;

  function paintSide(side, tab, which, label) {
    var title = tab.dataset[which + 'Title'] || '';
    side.querySelector('[data-title]').textContent = title;
    side.querySelector('[data-short]').textContent = tab.dataset[which + 'Short'] || '';
    var point = tab.dataset.point;
    side.querySelectorAll('.cmp-shot').forEach(function (img) { img.classList.toggle('is-on', img.dataset.point === point); });
    side.querySelectorAll('.cmp-points').forEach(function (ul) { ul.hidden = ul.dataset.point !== point; });
    var zoom = side.querySelector('.cmp-zoom');
    zoom.dataset.image = tab.dataset[which + 'Src'];
    zoom.dataset.caption = title + ' · ' + label;
  }
  function select(index, focus) {
    if (index === current) return;
    current = index;
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    board.setAttribute('aria-labelledby', tabs[index].id);
    paintSide(sides[0], tabs[index], 'a', 'Dream Ananta');
    paintSide(sides[1], tabs[index], 'u', 'what you usually get');
    // a short rise on the text so the change reads as one movement
    board.classList.remove('is-swapping');
    void board.offsetWidth;
    board.classList.add('is-swapping');
    if (focus) tabs[index].focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(index); });
    tab.addEventListener('keydown', function (event) {
      var k = event.key, next = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') next = 0;
      else if (k === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      select(next, true);
    });
  });

  select(0);
})();
