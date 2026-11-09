/* Details: five points and one common photograph.
   Desktop: hover a point and the photograph beside the list changes.
   Touch: the points are a collapsible list. Tap one and its photograph opens right there; tap it again to fold it away. */
(function () {
  'use strict';
  var list = document.querySelector('[data-spec]');
  var stage = document.getElementById('spec-stage');
  if (!list || !stage) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.spec-item'));
  var shots = Array.prototype.slice.call(stage.querySelectorAll('.spec-shot'));
  var stageTitle = stage.querySelector('[data-spec-title]');
  var stageText = stage.querySelector('[data-spec-text]');
  var zoom = stage.querySelector('.spec-zoom');
  var canHover = matchMedia('(hover:hover) and (min-width:1001px)');
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
    });
    stageTitle.textContent = items[index].querySelector('.spec-title').textContent;
    stageText.textContent = items[index].querySelector('.spec-short').textContent;
    // The enlarge button always opens the photograph on show
    zoom.dataset.image = shots[index].getAttribute('src');
    zoom.dataset.caption = stageTitle.textContent;
    sync();
  }
  // Desktop only: if a click happens while the photograph is off screen, bring it into view
  function toStage() {
    var header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    var rect = stage.getBoundingClientRect();
    if (rect.top >= header && rect.bottom <= innerHeight) return;
    var lead = Math.max(24, Math.min(130, (innerHeight - header - rect.height) * 0.45));
    var y = rect.top + scrollY - header - lead;
    if (window.anantaGlideTo) window.anantaGlideTo(y); else scrollTo({top: y, behavior: 'smooth'});
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
    item.addEventListener('mouseenter', function () { if (canHover.matches) select(index); });
    tab.addEventListener('focus', function () { if (canHover.matches) select(index); });
    tab.addEventListener('click', function () {
      if (narrow.matches) {
        if (item.classList.contains('is-on')) { item.classList.remove('is-on'); sync(); }
        else { select(index); keepInView(item); }
        return;
      }
      select(index);
      if (canHover.matches) toStage();
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
