/* Quiet fade-up as sections enter the viewport. Content stays visible without JS or with reduced motion. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var targets = document.querySelectorAll('.section-top, .section-intro, .project-facts > div, .portrait, .highlights-copy, .plan-controls, #floor-panel, .details-lead, .detail-row, .all-amenities, .loc > div, .legacy-heading, .legacy-intro, .legacy-stats > div, .visit-grid > *, .footer-grid > div');
  document.documentElement.classList.add('reveal-ready');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
  targets.forEach(function (el) {
    // Siblings in a row arrive one after another.
    var index = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--reveal-delay', Math.min(index, 5) * 90 + 'ms');
    el.classList.add('reveal');
    observer.observe(el);
  });

  // Legacy figures climb with the scroll: "20+", "7,000+", "6 Mn", "Top 100" keep their wording.
  var stats = document.querySelector('.legacy-stats');
  if (!stats) return;
  var counters = Array.prototype.map.call(stats.querySelectorAll('strong'), function (el) {
    var m = el.textContent.match(/^(\D*)([\d,]+)(.*)$/);
    return m && {el: el, prefix: m[1], target: Number(m[2].replace(/,/g, '')), comma: m[2].indexOf(',') > -1, suffix: m[3], shown: 0};
  }).filter(Boolean);
  function format(c, value) {
    var n = Math.round(value);
    return c.prefix + (c.comma ? n.toLocaleString('en-IN') : String(n)) + c.suffix;
  }
  var ticking = false;
  function update() {
    ticking = false;
    var rect = stats.getBoundingClientRect();
    // 0 when the row enters at the bottom, 1 once it has risen 55% of the screen.
    var base = (innerHeight - rect.top) / (innerHeight * 0.55);
    counters.forEach(function (c, i) {
      var p = Math.max(0, Math.min(1, base - i * 0.06));
      var eased = 1 - Math.pow(1 - p, 3);
      if (eased > c.shown) { c.shown = eased; c.el.textContent = format(c, c.target * eased); }
    });
  }
  counters.forEach(function (c) { c.el.setAttribute('aria-label', format(c, c.target)); c.el.textContent = format(c, 0); });
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive: true});
  update();
})();
