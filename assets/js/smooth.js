/* Nav links and in-page buttons glide to their section instead of jumping. */
(function () {
  'use strict';
  var raf = 0, root = document.documentElement;
  function offset() { return parseFloat(getComputedStyle(root).scrollPaddingTop) || 0; }
  function stop() { cancelAnimationFrame(raf); root.style.scrollBehavior = ''; }
  function glideTo(y) {
    cancelAnimationFrame(raf);
    var from = scrollY, max = root.scrollHeight - innerHeight;
    y = Math.max(0, Math.min(max, y));
    var d = y - from;
    if (Math.abs(d) < 2) return;
    var dur = Math.min(1000, Math.max(650, Math.abs(d) * .32)), t0 = performance.now();
    root.style.scrollBehavior = 'auto';
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      scrollTo(0, from + d * e);
      if (p < 1) raf = requestAnimationFrame(step); else root.style.scrollBehavior = '';
    })(t0);
  }
  window.anantaGlideTo = glideTo;
  ['wheel', 'touchstart', 'keydown'].forEach(function (type) { addEventListener(type, stop, {passive: true}); });
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey) return;
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : root;
    if (!target) return;
    event.preventDefault();
    var y = id && id !== 'top' ? target.getBoundingClientRect().top + scrollY - offset() : 0;
    glideTo(y);
    if (id && history.pushState) history.pushState(null, '', '#' + id);
  });
})();
