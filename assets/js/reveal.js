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

  // Legacy figures count up from 0 once the row is well in view: "20+", "7,000+", "6 Mn", "Top 100" keep their wording.
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
  // A slow, even climb (2.8s each, gently staggered) so the progression can be followed.
  var DURATION = 2800, STAGGER = 220, started = false;
  function run(start) {
    var done = true;
    counters.forEach(function (c, i) {
      var p = Math.max(0, Math.min(1, (performance.now() - start - i * STAGGER) / DURATION));
      var eased = 1 - Math.pow(1 - p, 2);
      c.el.textContent = format(c, c.target * eased);
      if (p < 1) done = false;
    });
    if (!done) requestAnimationFrame(function () { run(start); });
  }
  function check() {
    if (started || stats.getBoundingClientRect().top > innerHeight * 0.7) return;
    started = true; removeEventListener('scroll', check);
    // Let the row finish fading in, so the count is seen from 0.
    setTimeout(function () { run(performance.now()); }, 500);
  }
  counters.forEach(function (c) { c.el.setAttribute('aria-label', format(c, c.target)); c.el.textContent = format(c, 0); });
  addEventListener('scroll', check, {passive: true});
  check();
})();
