/* Details (Compare copy): five points, one common photograph, and a Dream Ananta / Conventional switch.
   Click a point to select it (no hover). Switch the mode and the photograph, the caption and the spec list
   all change to that side of the comparison. Touch: the points are a collapsible list; tap one and its
   photograph opens right there, tap again to fold it away. */
(function () {
  'use strict';
  var section = document.getElementById('details');
  var list = document.querySelector('[data-spec]');
  var stage = document.getElementById('spec-stage');
  if (!section || !list || !stage) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.spec-item'));
  var shots = Array.prototype.slice.call(stage.querySelectorAll('.spec-shot'));
  var modeBtns = Array.prototype.slice.call(section.querySelectorAll('.spec-mode-btn'));
  var badge = stage.querySelector('[data-spec-badge]');
  var stageTitle = stage.querySelector('[data-spec-title]');
  var stageText = stage.querySelector('[data-spec-text]');
  var zoom = stage.querySelector('.spec-zoom');
  var narrow = matchMedia('(max-width:1000px)');
  var LABEL = {ananta: 'Dream Ananta', usual: 'Conventional spec'};
  var mode = 'ananta';
  var current = 0;

  function paint() {
    var usual = mode === 'usual';
    section.classList.toggle('mode-usual', usual);
    modeBtns.forEach(function (b) {
      var on = b.dataset.mode === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    shots.forEach(function (s) {
      s.classList.toggle('is-on', Number(s.dataset.point) === current && s.dataset.mode === mode);
    });
    // Each point is named for what that side actually gives
    items.forEach(function (it) {
      var t = it.dataset[mode + 'Title'];
      if (t) it.querySelector('.spec-title').textContent = t;
    });
    var item = items[current];
    var title = item.querySelector('.spec-title').textContent;
    stageTitle.textContent = title;
    stageText.textContent = item.dataset[mode + 'Short'] || '';
    badge.textContent = LABEL[mode];
    zoom.dataset.image = item.dataset[mode + 'Src'];
    zoom.dataset.caption = title + ' · ' + LABEL[mode];

    items.forEach(function (it) {
      var on = it.classList.contains('is-on');
      var tab = it.querySelector('.spec-tab');
      tab.setAttribute('aria-pressed', String(on));
      if (narrow.matches) tab.setAttribute('aria-expanded', String(on)); else tab.removeAttribute('aria-expanded');
      // Touch layout: the one-line description and the photograph follow the mode too
      var short = it.querySelector('.spec-short');
      if (short) short.textContent = it.dataset[mode + 'Short'] || '';
      var photo = it.querySelector('.spec-photo');
      var img = photo && photo.querySelector('img');
      var src = it.dataset[mode + 'Src'];
      if (img && img.getAttribute('src') !== src) {
        img.src = src;
        img.alt = it.dataset[mode + 'Alt'] || '';
      }
      if (photo) {
        photo.dataset.image = src;
        photo.dataset.caption = it.querySelector('.spec-title').textContent + ' · ' + LABEL[mode];
      }
    });
  }
  function select(index) {
    current = index;
    items.forEach(function (item, i) { item.classList.toggle('is-on', i === index); });
    paint();
  }
  // Touch: after the lists settle, make sure the opened point is on screen (only moves the page if it has to)
  function keepInView(item) {
    setTimeout(function () {
      var header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      var r = item.getBoundingClientRect();
      if (r.top < header + 6 || r.bottom > innerHeight - 6) {
        var y = r.top + scrollY - header - 12;
        if (window.anantaGlideTo) window.anantaGlideTo(y); else scrollTo({top: y, behavior: 'smooth'});
      }
    }, 540);
  }

  items.forEach(function (item, index) {
    var tab = item.querySelector('.spec-tab');
    tab.addEventListener('click', function () {
      if (narrow.matches) {
        if (item.classList.contains('is-on')) { item.classList.remove('is-on'); paint(); }
        else { select(index); keepInView(item); }
        return;
      }
      select(index);
    });
    tab.addEventListener('keydown', function (event) {
      var k = event.key;
      var step = (k === 'ArrowDown' || k === 'ArrowRight') ? 1 : (k === 'ArrowUp' || k === 'ArrowLeft') ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      var next = (index + step + items.length) % items.length;
      items[next].querySelector('.spec-tab').focus();
      if (!narrow.matches) select(next);
    });
  });

  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.mode === mode) return;
      mode = b.dataset.mode;
      section.classList.remove('mode-swap');
      void section.offsetWidth;
      section.classList.add('mode-swap');
      paint();
    });
  });

  // Coming back to a wide screen with every point folded: show the current photograph again
  function onResize() { if (!narrow.matches && !list.querySelector('.is-on')) select(current); else paint(); }
  if (narrow.addEventListener) narrow.addEventListener('change', onResize); else narrow.addListener(onResize);

  select(0);
})();
