/* Quiet fade-up as sections enter the viewport. Content stays visible without JS or with reduced motion. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var targets = document.querySelectorAll('.section-top, .section-intro, .project-facts > div, .portrait, .highlights-copy, .plan-controls, #floor-panel, .details-head, .spec-stage, .spec-item, .all-amenities, .loc > div, .legacy-heading, .legacy-intro, .legacy-stats > div, .visit-grid > *, .footer-grid > div');
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

  // Overview facts count up as they arrive: ₹62 Lakhs, 15 min, 70% and the 2032 possession year.
  // Figures that are not plain counts (G+8, 2, 3 & 4 BHK) stay as they are.
  var facts = Array.prototype.map.call(document.querySelectorAll('.project-facts strong'), function (el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return null;
    var m = node.nodeValue.match(/^(₹?)(\d+)(\s*\D*)$/);
    if (!m) return null;
    var target = Number(m[2]);
    return {node: node, prefix: m[1], target: target, from: target > 1900 ? target - 12 : 0, suffix: m[3]};
  }).filter(Boolean);
  if (facts.length) {
    facts.forEach(function (f) { f.node.parentNode.setAttribute('aria-label', f.node.parentNode.textContent); f.node.nodeValue = f.prefix + f.from + f.suffix; });
    var factsRow = document.querySelector('.project-facts'), factsStarted = false;
    var countFacts = function () {
      if (factsStarted || factsRow.getBoundingClientRect().top > innerHeight * 0.88) return;
      factsStarted = true; removeEventListener('scroll', countFacts);
      var start = performance.now();
      (function step() {
        var running = false;
        facts.forEach(function (f, i) {
          var p = Math.max(0, Math.min(1, (performance.now() - start - i * 120) / 1400)), e = 1 - Math.pow(1 - p, 3);
          f.node.nodeValue = f.prefix + Math.round(f.from + (f.target - f.from) * e) + f.suffix;
          if (p < 1) running = true;
        });
        if (running) requestAnimationFrame(step);
      })();
    };
    addEventListener('scroll', countFacts, {passive: true});
    countFacts();
  }

  // The site-visit form's gold edge lights up once, the first time the form comes into view
  var visitForm = document.getElementById('enquiry');
  if (visitForm) {
    var formSeen = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      formSeen.disconnect();
      visitForm.classList.add('is-lit');
    }, {threshold: 0.45});
    formSeen.observe(visitForm);
  }

  // Legacy figures count up from 0 once the row is well in view: "20+", "7,000+", "6 Mn", "Top 100" keep their wording.
  var stats = document.querySelector('.legacy-stats');
  if (!stats) return;
  var counters = Array.prototype.map.call(stats.querySelectorAll('strong'), function (el) {
    var m = el.textContent.match(/^(\D*)([\d,]+)(.*)$/);
    return m && !el.hasAttribute('data-static') && {el: el, prefix: m[1], target: Number(m[2].replace(/,/g, '')), comma: m[2].indexOf(',') > -1, suffix: m[3], shown: 0};
  }).filter(Boolean);
  function format(c, value) {
    var n = Math.round(value);
    return c.prefix + (c.comma ? n.toLocaleString('en-IN') : String(n)) + c.suffix;
  }
  // A slow, even climb (2.8s each, gently staggered) so the progression can be followed.
  var DURATION = 1400, STAGGER = 120, started = false;
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
