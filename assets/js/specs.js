/* Details: five detail tabs and two cards that are always in view, Dream Ananta beside what you usually get.
   Desktop: choosing a tab changes both cards together: photographs crossfade, titles, lines and spec lists swap.
   Phones and tablets: the tabs become a collapsible list; the two cards open right under the chosen point
   (tap it again to fold them away). Click and keyboard only; nothing happens on hover. */
(function () {
  'use strict';
  var tablist = document.querySelector('.cmp-tabs');
  var board = document.getElementById('cmp-board');
  if (!tablist || !board) return;
  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var sides = Array.prototype.slice.call(board.querySelectorAll('.cmp-side'));
  var narrow = matchMedia('(max-width:1000px)');
  var current = -1;
  var folded = false;

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
  // Where the cards live: after the whole row on desktop, right under the chosen point on phones
  function place() {
    if (narrow.matches) { if (current >= 0) tabs[current].insertAdjacentElement('afterend', board); }
    else if (board.previousElementSibling !== tablist) tablist.insertAdjacentElement('afterend', board);
  }
  function sync() {
    tabs.forEach(function (t, i) {
      var on = i === current && !(narrow.matches && folded);
      t.setAttribute('aria-selected', String(i === current));
      t.classList.toggle('is-open', on);
      t.tabIndex = (i === current) ? 0 : -1;
      if (narrow.matches) t.setAttribute('aria-expanded', String(on)); else t.removeAttribute('aria-expanded');
    });
    board.hidden = narrow.matches && folded;
  }
  function select(index, focus) {
    folded = false;
    if (index !== current) {
      current = index;
      board.setAttribute('aria-labelledby', tabs[index].id);
      paintSide(sides[0], tabs[index], 'a', 'Dream Ananta');
      paintSide(sides[1], tabs[index], 'u', 'what you usually get');
      board.classList.remove('is-swapping');
      void board.offsetWidth;
      board.classList.add('is-swapping');
    }
    place();
    sync();
    if (focus) tabs[index].focus();
  }
  // Phones: once the cards have opened, make sure the chosen point is on screen (only moves the page if it has to)
  function keepInView(tab) {
    setTimeout(function () {
      var header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      var r = tab.getBoundingClientRect();
      if (r.top < header + 6) {
        var y = r.top + scrollY - header - 12;
        if (window.anantaGlideTo) window.anantaGlideTo(y); else scrollTo({top: y, behavior: 'smooth'});
      }
    }, 80);
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      if (narrow.matches && index === current) { folded = !folded; sync(); return; }
      select(index);
      if (narrow.matches) keepInView(tab);
    });
    tab.addEventListener('keydown', function (event) {
      var k = event.key, next = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') next = 0;
      else if (k === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      if (narrow.matches) tabs[next].focus(); else select(next, true);
    });
  });

  // Phones only: which photograph sits at the top of the open point. Both spec lists stay in view regardless.
  var section = document.getElementById('details');
  Array.prototype.slice.call(document.querySelectorAll('.spec-mode-btn')).forEach(function (b, _, all) {
    b.addEventListener('click', function () {
      all.forEach(function (o) { var on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', String(on)); });
      section.classList.toggle('mode-usual', b.dataset.mode === 'usual');
    });
  });

  function onResize() { folded = false; place(); sync(); }
  if (narrow.addEventListener) narrow.addEventListener('change', onResize); else narrow.addListener(onResize);

  select(0);
})();
