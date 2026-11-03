/* Dream Ananta — static page interactions. No external UI dependencies. */
(function () {
  'use strict';
  var $ = function (s, scope) { return (scope || document).querySelector(s); };
  var $$ = function (s, scope) { return Array.from((scope || document).querySelectorAll(s)); };
  function track(event, data) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({event:event},data || {})); }
  var menu = $('#mobile-menu'), toggle = $('.menu-toggle');
  toggle.addEventListener('click', function () { if(menu.open){menu.close();return;} menu.show(); document.body.classList.add('menu-open');$('main').inert=true;$('footer').inert=true;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close navigation'); });
  menu.addEventListener('close', function () { document.body.classList.remove('menu-open');$('main').inert=false;$('footer').inert=false;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.focus(); });
  document.addEventListener('keydown',function(e){if(!menu.open)return;if(e.key==='Escape'){menu.close();return;}if(e.key==='Tab'){var list=[toggle].concat($$('a',menu));var i=list.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();list[list.length-1].focus();}else if(!e.shiftKey&&(i===list.length-1||i===-1)){e.preventDefault();toggle.focus();}}});
  $$('#mobile-menu a').forEach(function (link) { link.addEventListener('click', function () { menu.close(); }); });
  $$('[data-dismiss]').forEach(function (button) { button.addEventListener('click', function () { button.closest('dialog').close(); }); });
  $$('dialog').forEach(function (dialog) {
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });
  // Navigation follows the section being read; all sections remain reachable.
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('.desktop-nav a').forEach(function (a) {
          if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current','location');
          else a.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-15% 0px -65% 0px',threshold:0});
    $$('.desktop-nav a').forEach(function (a) { var s=$(a.hash); if (s) observer.observe(s); });
  }
  // Full sheets retain floor names and original area schedules from the brochure.
  var sheets = {
    C: {height:'G+8', options:[['2','Ground floor'],['3','1st floor'],['4','2nd, 4th, 6th & 8th floors'],['5','3rd, 5th & 7th floors']]},
    D: {height:'B+G+8', options:[['6','Odd & even floor layouts']]},
    E: {height:'B+G+8', options:[['7','Odd & even floor layouts']]}
  };
  var block='C', level=$('#floor-level'), floorImage=$('#floor-image');
  function renderSheet() {
    var title='Block '+block+' · '+sheets[block].height+' · '+level.options[level.selectedIndex].text;
    floorImage.src='assets/images/curated/floor-preview-'+level.value+'.webp';
    floorImage.alt=title+' — original floor-plan sheet with area schedule';
    $('#floor-caption').textContent=title;
    $('.plan-sheet').setAttribute('aria-label','Enlarge '+title);
    $('#floor-panel').setAttribute('aria-labelledby','block-'+block.toLowerCase());
  }
  function selectBlock(value) {
    block=value;
    $$('[data-block]').forEach(function (tab) { var selected=tab.dataset.block===block;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1; });
    level.replaceChildren();
    sheets[block].options.forEach(function (entry) { var option=document.createElement('option');option.value=entry[0];option.textContent=entry[1];level.appendChild(option); });
    renderSheet();
  }
  var tabs=$$('[data-block]');
  tabs.forEach(function (tab,index) {
    tab.addEventListener('click',function () {selectBlock(tab.dataset.block);});
    tab.addEventListener('keydown',function (e) {
      var destination;
      if (e.key==='ArrowRight') destination=(index+1)%tabs.length;
      if (e.key==='ArrowLeft') destination=(index+tabs.length-1)%tabs.length;
      if (e.key==='Home') destination=0;
      if (e.key==='End') destination=tabs.length-1;
      if (destination!==undefined) {e.preventDefault();selectBlock(tabs[destination].dataset.block);tabs[destination].focus();}
    });
  });
  level.addEventListener('change',renderSheet);
  // Image viewer: wheel, pinch, double-tap and +/− zoom up to 6×, drag to pan, never off-screen.
  var viewer=$('#image-dialog'), dialogImage=$('#dialog-image'), scroll=$('.image-scroll');
  var z={s:1,x:0,y:0}, MAX=6, pointers=new Map(), pinch=null, lastTap=0;
  function apply(animate) {
    var cw=scroll.clientWidth, ch=scroll.clientHeight, w=dialogImage.offsetWidth*z.s, h=dialogImage.offsetHeight*z.s, l=dialogImage.offsetLeft, t=dialogImage.offsetTop;
    if (z.s<=1) { z.s=1; z.x=0; z.y=0; }
    else {
      z.x = w>cw ? Math.min(-l, Math.max(cw-l-w, z.x)) : (cw-w)/2-l;
      z.y = h>ch ? Math.min(-t, Math.max(ch-t-h, z.y)) : (ch-h)/2-t;
    }
    dialogImage.classList.toggle('is-animating', Boolean(animate));
    dialogImage.style.transform='translate('+z.x+'px,'+z.y+'px) scale('+z.s+')';
    scroll.classList.toggle('is-zoomed', z.s>1);
  }
  function zoomAt(px, py, next, animate) {
    // Keep the point under the cursor (or between the fingers) still while scaling.
    next=Math.max(1, Math.min(MAX, next));
    var l=dialogImage.offsetLeft, t=dialogImage.offsetTop, qx=(px-l-z.x)/z.s, qy=(py-t-z.y)/z.s;
    z.x=px-l-next*qx; z.y=py-t-next*qy; z.s=next; apply(animate);
  }
  function local(e) { var r=scroll.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
  function resetZoom() { z={s:1,x:0,y:0}; pointers.clear(); pinch=null; apply(false); }
  scroll.addEventListener('wheel', function (e) { e.preventDefault(); var p=local(e); zoomAt(p.x, p.y, z.s*Math.exp(-e.deltaY*0.0018), false); }, {passive:false});
  scroll.addEventListener('pointerdown', function (e) {
    scroll.setPointerCapture(e.pointerId); pointers.set(e.pointerId, local(e));
    if (pointers.size===2) { var pts=Array.from(pointers.values()); pinch={d:Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y), s:z.s}; }
  });
  scroll.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    var prev=pointers.get(e.pointerId), p=local(e); pointers.set(e.pointerId, p);
    if (pointers.size===2 && pinch) { var pts=Array.from(pointers.values()); var d=Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y); zoomAt((pts[0].x+pts[1].x)/2, (pts[0].y+pts[1].y)/2, pinch.s*d/pinch.d, false); }
    else if (pointers.size===1 && z.s>1) { z.x+=p.x-prev.x; z.y+=p.y-prev.y; apply(false); }
  });
  function lift(e) {
    if (!pointers.has(e.pointerId)) return;
    var p=pointers.get(e.pointerId); pointers.delete(e.pointerId); if (pointers.size<2) pinch=null;
    // Double tap / double click: zoom in to 2.5× at that point, or back to fit.
    if (e.type==='pointerup' && pointers.size===0) { var now=Date.now(); if (now-lastTap<300) { if (z.s>1) resetZoom(); else zoomAt(p.x, p.y, 2.5, true); lastTap=0; } else lastTap=now; }
  }
  scroll.addEventListener('pointerup', lift); scroll.addEventListener('pointercancel', lift);
  $$('[data-zoom]').forEach(function (button) { button.addEventListener('click', function () { zoomAt(scroll.clientWidth/2, scroll.clientHeight/2, z.s*(button.dataset.zoom==='1'?1.6:1/1.6), true); }); });
  addEventListener('resize', function () { if (viewer.open) apply(false); });
  function showImage(src,caption) {
    resetZoom();dialogImage.src=src;dialogImage.alt=caption;$('#image-caption').textContent=caption;viewer.showModal();track('image_view',{image:caption});
  }
  $$('[data-image]').forEach(function (button) {button.addEventListener('click',function () {showImage(button.dataset.image,button.dataset.caption);});});
  $$('[data-enlarge]').forEach(function (button) {button.addEventListener('click',function () {showImage(floorImage.src.replace('floor-preview-','floor-sheet-'),$('#floor-caption').textContent);});});
  dialogImage.addEventListener('load',function () {apply(false);});
  viewer.addEventListener('close',resetZoom);
  // Only one location category expands at a time.
  var accordions=$$('.distances details');
  accordions.forEach(function (detail) {detail.addEventListener('toggle',function () {if (detail.open) accordions.forEach(function (other) {if (other!==detail) other.open=false;});});});
  var legal=$('#legal-dialog');
  $$('[data-legal]').forEach(function (button) {button.addEventListener('click',function () {
    var privacy=button.dataset.legal==='privacy';
    $('#legal-title').textContent=privacy?'Privacy notice':'Terms & disclaimer';
    $('#legal-copy').innerHTML=privacy?'<p>The details you enter are used to answer your enquiry and arrange a site visit with Jain Group. When you submit, your details are sent to our enquiry service to arrange a callback. A successful enquiry unlocks the brochure on this browser.</p><p>Your contact details are not stored in browser storage. A brochure access flag is saved on this browser after a confirmed enquiry. The page retains the original Google Tag Manager integration, which may process page and interaction data.</p>':'<p>This page is for information only and does not constitute an offer or contract. All renderings are artist’s impressions. Plans, amenities, areas, prices, specifications and availability are indicative and subject to approvals and the agreement for sale.</p><p>Travel times are approximate. Verify project details against the registered documents and West Bengal RERA records before booking. RERA identifier carried over from the original page: WBRERA/P/NOR/2026/004487.</p>';
    legal.showModal();
  });});
})();
