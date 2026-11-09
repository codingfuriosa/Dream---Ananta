/* Scroll progress, browsable amenities and compact maps. */
(function () {
 'use strict';
 var $=function(s,r){return(r||document).querySelector(s);},$$=function(s,r){return Array.from((r||document).querySelectorAll(s));};
 var pageFill=$('#page-progress-fill'), beam=pageFill.parentNode, hero=$('.hero'), frame=false;
 // The progress line is a beam of light; at the very end it blooms from the centre.
 // Over the hero the navbar floats on the image (until the first ~100px of scroll) and the
 // quick-contact bar waits until two-thirds of the hero has passed.
 function pageProgress(){ending();var max=document.documentElement.scrollHeight-innerHeight;var p=max>0?Math.min(1,scrollY/max):0;beam.style.setProperty('--p',p.toFixed(4));beam.classList.toggle('is-complete',p>.995);if(hero){document.body.classList.toggle('hero-top',scrollY<Math.min(100,innerHeight*.12));document.body.classList.toggle('at-hero',scrollY<hero.offsetHeight*.65);}frame=false;}
 // Once the dark part of the closing image (below its cream lead-in) or the footer is on screen, the
 // header and the phone quick-contact bar step aside.
 var strip=$('.horizon-strip');
 function ending(){if(!strip)return;var lead=parseFloat(getComputedStyle(strip).getPropertyValue('--lead'))||0;document.body.classList.toggle('at-footer',strip.getBoundingClientRect().top+lead<innerHeight);}
 addEventListener('scroll',function(){if(!frame){frame=true;requestAnimationFrame(pageProgress);}},{passive:true});addEventListener('resize',pageProgress);pageProgress();
 $$('[data-scroll-controls]').forEach(function(controls){
  var track=document.getElementById(controls.dataset.scrollControls),items=Array.from(track.children),count=$('.scroll-count',controls),fill=$('.scroll-line>span',controls),previous=$('[data-direction="-1"]',controls),next=$('[data-direction="1"]',controls);
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function spacing(){return items.length>1?items[1].offsetLeft-items[0].offsetLeft:track.clientWidth;}
  function update(){var max=track.scrollWidth-track.clientWidth;var progress=max>0?Math.max(0,Math.min(1,track.scrollLeft/max)):1;var index=Math.min(items.length-1,Math.round(track.scrollLeft/spacing()));if(progress>.995)index=items.length-1;count.textContent=String(index+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');fill.style.width=(Math.max(1/items.length,progress)*100)+'%';previous.disabled=track.scrollLeft<3;next.disabled=track.scrollLeft>=max-3;}
  var raf=0,gliding=false,settle=0,soft=matchMedia('(hover:hover) and (min-width:1001px)');
  function glide(to){cancelAnimationFrame(raf);var max=track.scrollWidth-track.clientWidth;to=Math.max(0,Math.min(max,to));var from=track.scrollLeft,d=to-from;if(reduced||Math.abs(d)<2){track.scrollLeft=to;return;}gliding=true;var t0=performance.now(),dur=Math.min(950,Math.max(520,Math.abs(d)*.55));track.style.scrollSnapType='none';(function step(now){var p=Math.min(1,(now-t0)/dur),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;track.scrollLeft=from+d*e;if(p<1)raf=requestAnimationFrame(step);else{track.style.scrollSnapType='';gliding=false;}})(t0);}
  function move(direction){var i=Math.round(track.scrollLeft/spacing());glide((i+direction)*spacing());}
  // Mouse: drag the row, and it settles on the nearest image when released (touch keeps native swiping).
  var drag=null,dragged=false;
  track.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;cancelAnimationFrame(raf);drag={x:e.clientX,left:track.scrollLeft};dragged=false;});
  addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x;if(!dragged&&Math.abs(dx)>6){dragged=true;track.style.scrollSnapType='none';track.classList.add('is-dragging');}if(dragged)track.scrollLeft=drag.left-dx;});
  addEventListener('pointerup',function(){if(!drag)return;var was=dragged;drag=null;track.classList.remove('is-dragging');if(was){glide(Math.round(track.scrollLeft/spacing())*spacing());setTimeout(function(){dragged=false;},0);}});
  track.addEventListener('click',function(e){if(dragged){e.preventDefault();e.stopPropagation();}},true);
  $$('[data-direction]',controls).forEach(function(button){button.addEventListener('click',function(){move(Number(button.dataset.direction));});});
  track.addEventListener('scroll',function(){requestAnimationFrame(update);if(gliding||drag||!soft.matches)return;clearTimeout(settle);settle=setTimeout(function(){var to=Math.round(track.scrollLeft/spacing())*spacing();if(Math.abs(to-track.scrollLeft)>3)glide(to);},170);},{passive:true});
  track.addEventListener('keydown',function(event){if(event.target!==track)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
  if('ResizeObserver'in window)new ResizeObserver(update).observe(track);else addEventListener('resize',update);
  update();
 });
 var categoryDetails=$$('.acc details');categoryDetails.forEach(function(detail){detail.addEventListener('toggle',function(){if(detail.open)categoryDetails.forEach(function(other){if(other!==detail)other.open=false;});});});
 var mapTabs=$$('[data-map]');
 function chooseMap(tab){mapTabs.forEach(function(other){var selected=other===tab;other.setAttribute('aria-selected',String(selected));other.tabIndex=selected?0:-1;$('[data-view="'+other.dataset.map+'"]').hidden=!selected;});if(tab.dataset.map==='google'){var iframe=$('[data-view="google"] iframe');if(!iframe.getAttribute('src'))iframe.src=iframe.dataset.src;}}
 mapTabs.forEach(function(tab,index){tab.addEventListener('click',function(){chooseMap(tab);});tab.addEventListener('keydown',function(event){if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();var other=mapTabs[(index+1)%mapTabs.length];chooseMap(other);other.focus();}});});
 // Close the fullscreen menu when either bottom action is used as well.
 $$('.mobile-menu-bottom a').forEach(function(a){a.addEventListener('click',function(){$('#mobile-menu').close();});});
})();(function(){
 // The runway's vanishing point sits at (1439, 615) in the 2200×1114 artwork. Each element pins it
 // to a horizontal centre and a chosen height (data-horizon-y, 0–1; data-horizon-y-wide above phone
 // width), scaling just enough to cover.
 var artWidth=2200,artHeight=1114,lightX=1439,lightY=615,wide=matchMedia('(min-width:701px)');
 function alignHorizons(){document.querySelectorAll('.horizon-strip,[data-horizon]').forEach(function(el){var w=el.clientWidth,h=el.clientHeight,fy=parseFloat((wide.matches&&el.dataset.horizonYWide)||el.dataset.horizonY||'.5');
  // A lead-in (--lead) above the visible part shifts the horizon down so it keeps its place on the last screen
  var lead=parseFloat(getComputedStyle(el).getPropertyValue('--lead'))||0;if(lead&&h>lead)fy=(lead+fy*(h-lead))/h;var scale=Math.max(w/(2*Math.min(lightX,artWidth-lightX)),(h*fy)/lightY,(h*(1-fy))/(artHeight-lightY));el.style.backgroundSize=(artWidth*scale)+'px '+(artHeight*scale)+'px';el.style.backgroundPosition=(w/2-lightX*scale)+'px '+(h*fy-lightY*scale)+'px';});}
 // At the very end the closing image and the footer fill the screen together, so the page always ends on
 // the dark image with the logo at the top. CSS sizes the strip against the tallest screen height (100lvh);
 // the script only reports the footer's height.
 var strip=document.querySelector('.horizon-strip'),footer=document.querySelector('.footer');
 function fitEnding(){if(!strip||!footer)return;strip.style.setProperty('--footer-h',footer.offsetHeight+'px');}
 function refit(){fitEnding();alignHorizons();}
 // The closing mark lights up gradually: --glow is 0 as the strip enters the screen and 1 once it reaches the top.
 function glow(){if(!strip)return;var t=strip.getBoundingClientRect().top,p=Math.max(0,Math.min(1,1-t/innerHeight));strip.style.setProperty('--glow',(p*p).toFixed(3));}
 addEventListener('scroll',function(){requestAnimationFrame(glow);},{passive:true});
 addEventListener('resize',function(){fitEnding();alignHorizons();});fitEnding();alignHorizons();glow();
 // Web fonts change the footer's height: measure again once they (and the page) have loaded.
 addEventListener('load',refit);if(document.fonts)document.fonts.ready.then(refit);
 var directory=Array.from(document.querySelectorAll('.amenity-directory details'));directory.forEach(function(d){d.addEventListener('toggle',function(){if(d.open)directory.forEach(function(o){if(o!==d)o.open=false;});});});
})();
/* Floor level: a styled menu that mirrors the native select (which stays for no-JS and keeps the change logic). */
(function(){
 'use strict';
 var select=document.getElementById('floor-level');if(!select)return;
 var wrap=document.createElement('div');wrap.className='fselect';
 var button=document.createElement('button');button.type='button';button.className='fselect-btn';button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
 var value=document.createElement('span');
 button.appendChild(value);button.insertAdjacentHTML('beforeend','<svg viewBox="0 0 12 8" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg>');
 var list=document.createElement('ul');list.className='fselect-list';list.setAttribute('role','listbox');list.id='floor-level-list';list.tabIndex=-1;
 var label=document.querySelector('label[for="floor-level"]');if(label){label.id='floor-level-label';button.setAttribute('aria-labelledby','floor-level-label '+'floor-level-value');label.addEventListener('click',function(e){e.preventDefault();button.focus();});}
 value.id='floor-level-value';
 select.parentNode.insertBefore(wrap,select);wrap.appendChild(select);wrap.appendChild(button);wrap.appendChild(list);
 select.classList.add('fselect-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
 var active=0;
 function build(){
  list.innerHTML='';
  Array.prototype.forEach.call(select.options,function(o,i){var li=document.createElement('li');li.setAttribute('role','option');li.id='floor-opt-'+i;li.textContent=o.text;li.setAttribute('aria-selected',String(i===select.selectedIndex));li.addEventListener('click',function(){choose(i);close();button.focus();});list.appendChild(li);});
  value.textContent=select.options[select.selectedIndex]?select.options[select.selectedIndex].text:'';
  // A single layout needs no menu.
  button.disabled=select.options.length<2;wrap.classList.toggle('is-single',select.options.length<2);
 }
 function mark(i){active=i;Array.prototype.forEach.call(list.children,function(li,k){li.classList.toggle('is-active',k===i);});if(list.children[i])button.setAttribute('aria-activedescendant',list.children[i].id);}
 function choose(i){if(i===select.selectedIndex)return;select.selectedIndex=i;select.dispatchEvent(new Event('change',{bubbles:true}));build();}
 function open(){wrap.classList.add('is-open');button.setAttribute('aria-expanded','true');mark(select.selectedIndex);}
 function close(){wrap.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');}
 button.addEventListener('click',function(){wrap.classList.contains('is-open')?close():open();});
 button.addEventListener('keydown',function(e){
  var n=select.options.length,isOpen=wrap.classList.contains('is-open');
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!isOpen){open();return;}mark((active+(e.key==='ArrowDown'?1:n-1))%n);}
  else if((e.key==='Enter'||e.key===' ')&&isOpen){e.preventDefault();choose(active);close();}
  else if(e.key==='Escape'&&isOpen){e.preventDefault();close();}
  else if(e.key==='Tab')close();
 });
 document.addEventListener('click',function(e){if(!wrap.contains(e.target))close();});
 // Switching blocks replaces the options: rebuild to match.
 new MutationObserver(build).observe(select,{childList:true});
 select.addEventListener('change',build);
 build();
})();
/* Plans: the container starts zoomed out and grows with the scroll, from the moment the section appears
   until the container is well up the screen. */
(function(){
 'use strict';
 var section=document.getElementById('plans'),panel=document.getElementById('floor-panel');
 if(!section||!panel||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var START=.68,ticking=false;
 function update(){ticking=false;var top=section.getBoundingClientRect().top;
  // 0 as the section's top enters at the bottom of the screen, 1 once the container's top reaches 30% of it
  var gap=panel.getBoundingClientRect().top-top,span=Math.max(1,innerHeight*.7+gap),p=Math.max(0,Math.min(1,(innerHeight-top)/span));
  var eased=1-Math.pow(1-p,2);panel.style.scale=(START+(1-START)*eased).toFixed(4);}
 addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();
})();
