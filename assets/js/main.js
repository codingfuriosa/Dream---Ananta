/* Ananta at Dream Gurukul — landing page. Vanilla JS, no libraries, native scrolling. */
(function () {
  'use strict';

  /* ===== CONFIG: check before going live ===== */
  var CONFIG = {
    endpoint: '/premiumhomesnearairport/submit.php', // same handler the teaser posts to
    thankYouUrl: 'thank-you.html',
    brochureUrl: 'assets/brochures/ananta-lifestyle.pdf',
    whatsapp: '919830029156',
    waText: 'Hi, I am interested in Ananta at Dream Gurukul. Please share details.',
    source: 'ananta-landing'
  };

  var CFG = {
    '2': { t: '2 BHK', r: '940 – 1,015 sq ft', p: '₹62 Lakhs onwards*' },
    '3': { t: '3 BHK', r: '1,075 – 1,405 sq ft', p: '₹72 Lakhs onwards*' },
    '4': { t: '4 BHK', r: '1,790 – 1,805 sq ft', p: '₹1.10 Cr onwards*' }
  };
  var PLANS = [
    { bhk: '2', block: 'D', area: '940', layout: '2 Bed · 2 Toilet', img: 'plan-2bhk-d-940.jpg' },
    { bhk: '2', block: 'E', area: '1,015', layout: '2 Bed · 2 Toilet', img: 'plan-2bhk-e-1015.jpg' },
    { bhk: '3', block: 'D', area: '1,075', layout: '3 Bed · 2 Toilet', img: 'plan-3bhk-d-1075.jpg' },
    { bhk: '3', block: 'E', area: '1,405', layout: '3 Bed · 3 Toilet', img: 'plan-3bhk-e-1405.jpg' },
    { bhk: '4', block: 'E', area: '1,805', layout: '4 Bed · 4 Toilet', img: 'plan-4bhk-e-1805.jpg' }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var t0 = Date.now();
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  function track(ev, p) { try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: ev }, p || {})); } catch (e) {} }

  /* UTM */
  var utm = {};
  try {
    try { utm = JSON.parse(sessionStorage.getItem('ananta_utm') || '{}'); } catch (e) {}
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { if (q.get(k)) utm[k] = q.get(k); });
    try { sessionStorage.setItem('ananta_utm', JSON.stringify(utm)); } catch (e) {}
  } catch (e) {}

  var wa = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.waText);
  $$('[data-wa]').forEach(function (a) { a.href = wa; });
  document.addEventListener('click', function (e) { var el = e.target.closest('[data-track]'); if (el) track(el.getAttribute('data-track')); });

  /* header + page progress */
  var header = $('#header'), bar = $('#progress');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('solid', y > 60);
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* layers */
  var stack = [];
  function topLayer() { return stack.length ? stack[stack.length - 1].el : null; }
  function open(el) {
    stack.push({ el: el, f: document.activeElement });
    el.classList.add('open'); document.body.style.overflow = 'hidden';
    var f = el.querySelector('input:not([tabindex="-1"]), [data-close]');
    setTimeout(function () { if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function close(el) {
    el = el || topLayer(); if (!el) return;
    el.classList.remove('open');
    var i = -1; stack.forEach(function (s, j) { if (s.el === el) i = j; });
    var s = i > -1 ? stack.splice(i, 1)[0] : null;
    if (!stack.length && !menu.classList.contains('open')) document.body.style.overflow = '';
    if (s && s.f && document.contains(s.f)) s.f.focus({ preventScroll: true });
  }
  $$('.modal, .lb').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) close(m); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (menu.classList.contains('open')) closeMenu(); else if (topLayer()) close(); }
    if (topLayer() && topLayer().id === 'lb') { if (e.key === 'ArrowRight') lbGo(1); if (e.key === 'ArrowLeft') lbGo(-1); }
  });

  /* mobile menu */
  var menu = $('#menu'), menuBtn = $('[data-menu-open]');
  function closeMenu() { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); if (!stack.length) document.body.style.overflow = ''; }
  menuBtn.addEventListener('click', function () { menu.classList.add('open'); menuBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; });
  $$('[data-menu-close]').forEach(function (el) { el.addEventListener('click', closeMenu); });

  /* lead sheet */
  var lead = $('#lead'), leadForm = $('form', lead);
  var COPY = {
    enquiry: ['Enquire about Ananta', 'Our advisor will get in touch.', 'Submit Enquiry'],
    brochure: ['Get the brochure', 'Plans and specifications in one PDF.', 'Send Me the Brochure'],
    floor_plan: ['Price for this plan', 'Shared with you on WhatsApp.', 'Get Price']
  };
  function openLead(kind, plan) {
    var c = COPY[kind] || COPY.enquiry;
    leadForm.setAttribute('data-intent', kind);
    leadForm.dataset.plan = plan ? plan.bhk + ' BHK, Block ' + plan.block + ', ' + plan.area + ' sq ft' : '';
    $('#lead-t').textContent = c[0]; $('[data-lead-sub]', lead).textContent = c[1];
    var b = $('button[type=submit]', leadForm); b.textContent = c[2]; b.setAttribute('data-label', c[2]);
    setPill(leadForm, plan ? plan.bhk + ' BHK' : '');
    open(lead); track('lead_open', { form: kind });
  }
  $$('[data-lead]').forEach(function (b) { b.addEventListener('click', function () { openLead(b.getAttribute('data-lead')); }); });

  /* legal */
  var legal = $('#legal');
  $$('[data-legal]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault(); var d = b.getAttribute('data-legal');
      $$('[data-doc]', legal).forEach(function (x) { x.hidden = x.getAttribute('data-doc') !== d; });
      open(legal);
    });
  });

  /* residences */
  var plansEl = $('#plans'), planModal = $('#plan'), curPlan = null;
  function card(p) {
    var a = document.createElement('article'); a.className = 'plan';
    a.innerHTML =
      '<button class="plan-img" type="button" aria-label="View ' + p.bhk + ' BHK floor plan, ' + p.area + ' sq ft"><img src="assets/images/' + p.img + '" alt="' + p.bhk + ' BHK floor plan, Block ' + p.block + '" loading="lazy"></button>' +
      '<div class="plan-body"><p class="plan-eb">' + p.bhk + ' BHK · Block ' + p.block + '</p>' +
      '<p class="plan-area">' + p.area + ' <small>sq ft</small></p><p class="plan-meta">' + p.layout + '</p>' +
      '<button class="link" type="button">Floor plan</button></div>';
    var go = function () { openPlan(p); };
    a.querySelector('.plan-img').addEventListener('click', go);
    a.querySelector('.link').addEventListener('click', go);
    return a;
  }
  function openPlan(p) {
    curPlan = p;
    var img = $('[data-pm="img"]', planModal); img.src = 'assets/images/' + p.img; img.alt = p.bhk + ' BHK floor plan, Block ' + p.block;
    $('[data-pm="eb"]', planModal).textContent = p.bhk + ' BHK · Block ' + p.block;
    $('[data-pm="area"]', planModal).textContent = p.area;
    $('[data-pm="block"]', planModal).textContent = 'Block ' + p.block;
    $('[data-pm="layout"]', planModal).textContent = p.layout;
    $('[data-pm="price"]', planModal).textContent = CFG[p.bhk].p;
    open(planModal); track('floorplan_view', { bhk: p.bhk, block: p.block, area: p.area });
  }
  $('[data-pm-price]', planModal).addEventListener('click', function () { close(planModal); openLead('floor_plan', curPlan); });
  var tabs = $$('.tab');
  function pick(bhk, focus) {
    tabs.forEach(function (t) { var on = t.getAttribute('data-bhk') === bhk; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on) { plansEl.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); } });
    $('[data-cfg="t"]').textContent = CFG[bhk].t; $('[data-cfg="r"]').textContent = CFG[bhk].r; $('[data-cfg="p"]').textContent = CFG[bhk].p;
    plansEl.innerHTML = '';
    plansEl.style.setProperty('--n', Math.max(2, PLANS.filter(function (p) { return p.bhk === bhk; }).length));
    PLANS.filter(function (p) { return p.bhk === bhk; }).forEach(function (p) { plansEl.appendChild(card(p)); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t.getAttribute('data-bhk')); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      pick(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].getAttribute('data-bhk'), true);
    });
  });
  pick('2');

  /* gallery: native horizontal scroll + thin progress line */
  var gal = $('#gal'), cards = $$('.g-card', gal), fill = $('#g-fill'), count = $('#g-count');
  var prev = $('[data-g="-1"]'), next = $('[data-g="1"]');
  function step() { return cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : gal.clientWidth; }
  function galUpdate() {
    var max = gal.scrollWidth - gal.clientWidth;
    var p = max > 0 ? gal.scrollLeft / max : 0;
    fill.style.width = (Math.max(p, 1 / cards.length) * 100) + '%';
    var i = Math.min(cards.length - 1, Math.round(gal.scrollLeft / step()));
    if (p > 0.995) i = cards.length - 1;
    count.textContent = pad(i + 1) + ' / ' + pad(cards.length);
    prev.disabled = gal.scrollLeft < 4; next.disabled = gal.scrollLeft > max - 4;
  }
  gal.addEventListener('scroll', function () { requestAnimationFrame(galUpdate); }, { passive: true });
  window.addEventListener('resize', galUpdate);
  $$('[data-g]').forEach(function (b) { b.addEventListener('click', function () { gal.scrollBy({ left: step() * +b.getAttribute('data-g'), behavior: 'smooth' }); }); });
  gal.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') next.click(); if (e.key === 'ArrowLeft') prev.click(); });
  // mouse drag on desktop
  var down = false, sx = 0, sl = 0, moved = false;
  gal.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = gal.scrollLeft; gal.classList.add('drag'); });
  window.addEventListener('mouseup', function () { if (!down) return; down = false; gal.classList.remove('drag'); });
  window.addEventListener('mousemove', function (e) { if (!down) return; var dx = e.pageX - sx; if (Math.abs(dx) > 4) moved = true; gal.scrollLeft = sl - dx; });
  galUpdate();

  /* lightbox */
  var lb = $('#lb'), lbImg = $('#lb-img'), items = [], li = 0;
  function lbShow(i) {
    li = (i + items.length) % items.length;
    lbImg.src = items[li].src; lbImg.alt = items[li].alt;
    $('#lb-cap').textContent = items[li].cap;
    $('#lb-c').textContent = items.length > 1 ? pad(li + 1) + ' / ' + pad(items.length) : '';
    $$('[data-lb]', lb).forEach(function (b) { b.hidden = items.length < 2; });
  }
  function lbGo(d) { if (items.length > 1) lbShow(li + d); }
  $$('[data-lb]', lb).forEach(function (b) { b.addEventListener('click', function () { lbGo(+b.getAttribute('data-lb')); }); });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) lbGo(d < 0 ? 1 : -1); tx = null; });
  cards.forEach(function (c, i) {
    c.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); moved = false; return; }
      items = cards.map(function (x) { var im = $('img', x); return { src: im.src, alt: im.alt, cap: $('b', x).textContent + ' · Artist’s impression' }; });
      lbShow(i); open(lb);
    });
  });

  /* location: one accordion open at a time + map tabs */
  var acc = $$('[data-acc] details');
  acc.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) acc.forEach(function (o) { if (o !== d) o.open = false; }); }); });
  var mtabs = $$('.map-tab');
  mtabs.forEach(function (t) {
    t.addEventListener('click', function () {
      mtabs.forEach(function (o) { var on = o === t; o.setAttribute('aria-selected', on); o.tabIndex = on ? 0 : -1; $('[data-view="' + o.getAttribute('data-map') + '"]').hidden = !on; });
      if (t.getAttribute('data-map') === 'google') { var f = $('[data-view="google"] iframe'); if (!f.src) f.src = f.getAttribute('data-src'); }
    });
  });
  $('[data-map-zoom]').addEventListener('click', function () { items = [{ src: 'assets/images/location-map.jpg', alt: 'Location map', cap: 'Location map · not to scale' }]; lbShow(0); open(lb); });

  /* legacy counters: count up as the section scrolls into view */
  var nums = $$('[data-count]');
  function fmt(n) { return n.toLocaleString('en-IN'); }
  var raf = new WeakMap();
  function setCount(el, v) { el.textContent = fmt(v) + (el.getAttribute('data-suffix') || ''); }
  function runCount(el) {
    var to = +el.getAttribute('data-count'), start = null, dur = 1800;
    cancelAnimationFrame(raf.get(el));
    function f(ts) {
      if (!start) start = ts;
      var k = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - k, 3);
      setCount(el, Math.round(to * e));
      if (k < 1) raf.set(el, requestAnimationFrame(f));
    }
    raf.set(el, requestAnimationFrame(f));
  }
  function resetCount(el) { cancelAnimationFrame(raf.get(el)); setCount(el, 0); }

  /* reveal + counters */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('.rv').forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) runCount(x.target); else resetCount(x.target); });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { co.observe(n); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
    nums.forEach(function (n) { setCount(n, +n.getAttribute('data-count')); });
  }

  /* pills */
  function setPill(form, v) { $$('.pill', form).forEach(function (p) { p.setAttribute('aria-pressed', p.getAttribute('data-v') === v ? 'true' : 'false'); }); }
  $$('.pills').forEach(function (g) {
    g.addEventListener('click', function (e) { var p = e.target.closest('.pill'); if (!p) return; setPill(g.closest('form'), p.getAttribute('aria-pressed') === 'true' ? '' : p.getAttribute('data-v')); });
  });

  /* forms */
  function norm(v) { return String(v || '').replace(/\D/g, '').replace(/^(?:91|0)(?=\d{10}$)/, '').slice(0, 10); }
  $$('[data-form]').forEach(function (form) {
    var mob = form.querySelector('[name=mobile]');
    mob.addEventListener('input', function () { var n = norm(mob.value); if (n !== mob.value) mob.value = n; });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type=submit]'); if (btn.disabled) return;
      var intent = form.getAttribute('data-intent');
      var sel = form.querySelector('.pill[aria-pressed="true"]');
      var em = form.querySelector('[name=email]');
      var f = { name: form.querySelector('[name=name]').value.trim(), mobile: norm(mob.value), email: em ? em.value.trim() : '', consent: form.querySelector('[name=consent]').checked, config: sel ? sel.getAttribute('data-v') : '' };
      var err = {};
      if (f.name.length < 2) err.name = 'Please enter your name.';
      if (!/^[6-9]\d{9}$/.test(f.mobile)) err.mobile = 'Enter a valid 10-digit mobile number.';
      if (em && !f.email) err.email = 'Please enter your email address.';
      else if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) err.email = 'Enter a valid email address.';
      if (!f.consent) err.consent = 'Please tick the box so we can contact you.';
      $$('[data-err]', form).forEach(function (p) { p.textContent = err[p.getAttribute('data-err')] || ''; });
      $$('input[name=name], input[name=mobile], input[name=email]', form).forEach(function (i) { i.setAttribute('aria-invalid', err[i.name] ? 'true' : 'false'); });
      var box = form.querySelector('[data-ferr]'); box.textContent = '';
      var keys = Object.keys(err);
      if (keys.length) { var first = form.querySelector('[name=' + keys[0] + ']'); if (first) first.focus(); track('form_validation_error', { form: intent, fields: keys.join(',') }); return; }
      var label = btn.getAttribute('data-label'); btn.disabled = true; btn.textContent = 'Sending…';
      function done() {
        track('generate_lead', { form: intent, configuration: f.config || 'unspecified', utm_source: utm.utm_source, utm_campaign: utm.utm_campaign });
        if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
        try { sessionStorage.setItem('ananta_lead_name', f.name.split(/\s+/)[0]); } catch (e) {}
        var url = CONFIG.thankYouUrl + '?type=' + encodeURIComponent(intent);
        if (CONFIG.brochureUrl && intent === 'brochure') url += '&pdf=' + encodeURIComponent(CONFIG.brochureUrl);
        setTimeout(function () { location.href = url; }, 200);
      }
      var hp = form.querySelector('[name=company]');
      if ((hp && hp.value) || Date.now() - t0 < 1500) { done(); return; }
      var payload = Object.assign({
        name: f.name, mobile: '+91' + f.mobile, email: f.email, configuration: f.config || null, intent: intent,
        plan: form.dataset.plan || null, project: 'Ananta at Dream Gurukul', consent: true,
        consent_text: 'Agreed to be contacted by Jain Group about this project', source: CONFIG.source,
        page_url: location.href, referrer: document.referrer || null, submitted_at: new Date().toISOString()
      }, utm);
      if (location.protocol === 'file:' || /(?:^|\.)github\.io$/.test(location.hostname) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || !CONFIG.endpoint) {
        var message = 'Hello, I would like to enquire about Ananta at Dream Gurukul.\nName: ' + f.name + '\nMobile: +91' + f.mobile + '\nEmail: ' + f.email + '\nInterest: ' + (f.config || 'Please advise') + '\nRequest: ' + intent + (payload.plan ? '\nPlan: ' + payload.plan : '');
        var handoff = document.createElement('a'); handoff.className = 'btn btn-p'; handoff.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(message); handoff.target = '_blank'; handoff.rel = 'noopener'; handoff.textContent = 'Continue on WhatsApp ↗';
        box.textContent = 'Your details are ready. Continue on WhatsApp and press Send to share your request with our advisor.'; box.appendChild(handoff);
        btn.disabled = false; btn.textContent = label; return;
      }
      fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); done(); })
        .catch(function (e) { btn.disabled = false; btn.textContent = label; box.textContent = 'Could not send. Please try again or call 73531 58222.'; track('form_submit_error', { form: intent, reason: String(e.message || e) }); });
    });
  });
})();
