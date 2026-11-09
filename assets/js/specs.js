/* Details: one common photograph and five points.
   Desktop: hover a point and the photograph changes (no clicking). Touch: tap a point and the page glides up to the photograph. */
(function () {
  'use strict';
  var list = document.querySelector('[data-spec]');
  var stage = document.getElementById('spec-stage');
  if (!list || !stage) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.spec-item'));
  var shots = Array.prototype.slice.call(stage.querySelectorAll('.spec-shot'));
  var stageTitle = stage.querySelector('[data-spec-title]');
  var zoom = stage.querySelector('.spec-zoom');
  var canHover = matchMedia('(hover:hover) and (min-width:1001px)');

  function select(index) {
    items.forEach(function (item, i) {
      var on = i === index;
      item.classList.toggle('is-on', on);
      item.querySelector('.spec-tab').setAttribute('aria-pressed', String(on));
      if (shots[i]) shots[i].classList.toggle('is-on', on);
    });
    stageTitle.textContent = items[index].querySelector('.spec-title').textContent;
    // The enlarge button always opens the photograph on show
    zoom.dataset.image = shots[index].getAttribute('src');
    zoom.dataset.caption = stageTitle.textContent;
  }
  // Glide up so the whole photograph shows, with a little of what sits above it
  function toStage(onlyIfHidden) {
    var header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    var rect = stage.getBoundingClientRect();
    if (onlyIfHidden && rect.top >= header && rect.bottom <= innerHeight) return;
    var lead = Math.max(24, Math.min(130, (innerHeight - header - rect.height) * 0.45));
    var y = rect.top + scrollY - header - lead;
    if (window.anantaGlideTo) window.anantaGlideTo(y); else scrollTo({top: y, behavior: 'smooth'});
  }

  items.forEach(function (item, index) {
    var tab = item.querySelector('.spec-tab');
    item.addEventListener('mouseenter', function () { if (canHover.matches) select(index); });
    tab.addEventListener('focus', function () { if (canHover.matches) select(index); });
    tab.addEventListener('click', function () {
      select(index);
      toStage(canHover.matches);
    });
    tab.addEventListener('keydown', function (event) {
      var step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      var next = (index + step + items.length) % items.length;
      items[next].querySelector('.spec-tab').focus();
      select(next);
    });
  });
  select(0);
})();
