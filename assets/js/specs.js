/* Details: five points, the Ananta photograph and, beneath it, what you usually get instead.
   Desktop: click a point (no hover). The large photograph, its caption and the conventional strip under it all
   change together, and the point opens to show the two spec lists side by side.
   Touch: the points are a collapsible list. Tap one and its photographs and lists open right there; tap again to fold. */
(function () {
  'use strict';
  var list = document.querySelector('[data-spec]');
  var stage = document.getElementById('spec-stage');
  if (!list || !stage) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.spec-item'));
  var shots = Array.prototype.slice.call(stage.querySelectorAll('.spec-shot'));
  var usualShots = Array.prototype.slice.call(stage.querySelectorAll('.spec-usual-shot'));
  var stageTitle = stage.querySelector('[data-spec-title]');
  var stageText = stage.querySelector('[data-spec-text]');
  var usualTitle = stage.querySelector('[data-usual-title]');
  var usualText = stage.querySelector('[data-usual-short]');
  var zoom = stage.querySelector('.spec-zoom');
  var thumb = stage.querySelector('.spec-usual-thumb');
  var narrow = matchMedia('(max-width:1000px)');

  function sync() {
    items.forEach(function (item) {
      var tab = item.querySelector('.spec-tab');
      var on = item.classList.contains('is-on');
      tab.setAttribute('aria-pressed', String(on));
      if (narrow.matches) tab.setAttribute('aria-expanded', String(on)); else tab.removeAttribute('aria-expanded');
    });
  }
  function select(index) {
    items.forEach(function (item, i) {
      item.classList.toggle('is-on', i === index);
      if (shots[i]) shots[i].classList.toggle('is-on', i === index);
      if (usualShots[i]) usualShots[i].classList.toggle('is-on', i === index);
    });
    var item = items[index];
    var title = item.querySelector('.spec-title').textContent;
    stageTitle.textContent = title;
    stageText.textContent = item.querySelector('.spec-short').textContent;
    usualTitle.textContent = item.dataset.usualTitle || '';
    usualText.textContent = item.dataset.usualShort || '';
    zoom.dataset.image = item.dataset.anantaSrc;
    zoom.dataset.caption = title;
    thumb.dataset.image = item.dataset.usualSrc;
    thumb.dataset.caption = (item.dataset.usualTitle || '') + ' · what you usually get';
    sync();
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
        if (item.classList.contains('is-on')) { item.classList.remove('is-on'); sync(); }
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

  // Coming back to a wide screen with every point folded: show the first photograph again
  function onResize() { if (!narrow.matches && !list.querySelector('.is-on')) select(0); sync(); }
  if (narrow.addEventListener) narrow.addEventListener('change', onResize); else narrow.addListener(onResize);

  select(0);
})();
