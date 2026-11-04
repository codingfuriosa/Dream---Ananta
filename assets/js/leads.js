(function(){
 'use strict';
 var config=window.ANANTA_LEADS||{},accessKey='ananta_access',receiptKey='ananta_enquiry_receipt';
 var dialog=document.getElementById('brochure-dialog');
 // One enquiry, from either form, unlocks the brochure and the floor plans on this browser:
 // localStorage first, a year-long cookie as backup.
 function unlocked(){
  try{if(localStorage.getItem(accessKey)==='confirmed')return true;}catch(e){}
  return document.cookie.split('; ').indexOf(accessKey+'=confirmed')>-1;
 }
 function remember(){
  try{localStorage.setItem(accessKey,'confirmed');}catch(e){}
  document.cookie=accessKey+'=confirmed; max-age=31536000; path=/; SameSite=Lax';
  document.documentElement.classList.remove('is-locked');
 }
 function download(){var a=document.createElement('a');a.href=config.brochure;a.download='Dream-Ananta-Brochure.pdf';document.body.appendChild(a);a.click();a.remove();window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'brochure_download'});}
 function refresh(){document.querySelectorAll('[data-brochure]').forEach(function(button){button.setAttribute('aria-haspopup',unlocked()?'false':'dialog');});}
 document.querySelectorAll('[data-brochure]').forEach(function(button){button.addEventListener('click',function(){if(unlocked())download();else dialog.showModal();});});
 addEventListener('pageshow',refresh);refresh();
 // Locked plans: View plans, or trying to enlarge a sheet, opens the floor-plans enquiry.
 var plansDialog=document.getElementById('plans-dialog');
 // Delegated, so the buttons of a block switched in later work too
 document.addEventListener('click',function(e){if(!e.target.closest('[data-plans]'))return;if(unlocked())document.documentElement.classList.remove('is-locked');else plansDialog.showModal();});
 document.addEventListener('click',function(e){if(!document.documentElement.classList.contains('is-locked')||!e.target.closest('[data-enlarge]'))return;e.preventDefault();e.stopImmediatePropagation();plansDialog.showModal();},true);
 // Back from the thank-you page after a brochure enquiry: start the download here, then tidy the address.
 if(new URLSearchParams(location.search).get('brochure')==='download'){
  history.replaceState(null,'',location.pathname+location.hash);
  if(unlocked())setTimeout(download,500);
 }
 // "Book a site visit" lands on the form; if images shift the page mid-scroll, settle on it again.
 var enquiry=document.getElementById('enquiry');
 document.querySelectorAll('a[href="#enquiry"]').forEach(function(link){link.addEventListener('click',function(){
  setTimeout(function(){var top=enquiry.getBoundingClientRect().top,want=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;if(Math.abs(top-want)>12)enquiry.scrollIntoView({block:'start'});},1100);
 });});

 // Phone numbers from anywhere: keep what people type tidy, then store it in international form.
 // A bare 10-digit number is read as Indian (+91); otherwise the country code is taken as typed.
 function tidy(v){return v.replace(/[^\d+\s()-]/g,'').replace(/(?!^)\+/g,'');}
 function normalise(v){var raw=v.trim(),d=raw.replace(/\D/g,'');if(!d)return '';if(raw.startsWith('+'))return '+'+d;if(d.startsWith('00'))return '+'+d.slice(2);if(d.length===10)return '+91'+d;if(d.length===11&&d.startsWith('0'))return '+91'+d.slice(1);return '+'+d;}
 var checks={
  name:function(v){v=v.trim();if(v.length<2)return 'Please enter your full name.';if(!/^[\p{L} .'-]+$/u.test(v))return 'Please use letters only.';return '';},
  mobile:function(v){var d=v.replace(/\D/g,'');if(!d)return 'Please enter your mobile number.';if(d.length<8||d.length>15)return 'Please enter a valid number, with the country code if outside India.';return '';},
  email:function(v){v=v.trim();if(!v)return '';if(!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v))return 'Please check your email address, e.g. name@example.com.';return '';}
 };

 document.querySelectorAll('[data-form]').forEach(function(form){
  var status=form.querySelector('[data-ferr]'),submit=form.querySelector('[type=submit]');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  function show(input,message){
   var field=input.closest('.fld'),err=form.querySelector('[data-err="'+input.name+'"]');
   if(err)err.textContent=message;
   input.setAttribute('aria-invalid',String(Boolean(message)));
   if(field)field.classList.toggle('is-valid',!message&&input.value.trim()!=='');
  }
  var mobile=form.querySelector('[name=mobile]');
  // Only digits, spaces, brackets, dashes and a leading + can be typed.
  mobile.addEventListener('input',function(){var clean=tidy(mobile.value);if(clean!==mobile.value)mobile.value=clean;if(mobile.getAttribute('aria-invalid')==='true')show(mobile,checks.mobile(normalise(clean)));});
  ['name','mobile','email'].forEach(function(key){
   var input=form.querySelector('[name='+key+']');
   input.addEventListener('blur',function(){if(input.value.trim()!==''||input.getAttribute('aria-invalid')==='true')show(input,checks[key](key==='mobile'?normalise(input.value):input.value));});
   if(key!=='mobile')input.addEventListener('input',function(){if(input.getAttribute('aria-invalid')==='true')show(input,checks[key](input.value));});
  });
  form.querySelectorAll('.pill').forEach(function(button){button.addEventListener('click',function(){var on=button.getAttribute('aria-pressed')!=='true';form.querySelectorAll('.pill').forEach(function(p){p.setAttribute('aria-pressed',String(p===button&&on));});});});
  form.querySelector('[name=consent]').addEventListener('change',function(e){if(e.target.checked)form.querySelector('[data-err=consent]').textContent='';});

  form.addEventListener('submit',async function(e){
   e.preventDefault();if(submit.disabled)return;status.textContent='';
   var fields={name:form.querySelector('[name=name]'),mobile:mobile,email:form.querySelector('[name=email]')};
   var values={name:fields.name.value.trim(),mobile:normalise(mobile.value),email:fields.email.value.trim()};
   var consent=form.querySelector('[name=consent]').checked,selected=form.querySelector('.pill[aria-pressed=true]'),first=null;
   Object.keys(fields).forEach(function(key){var message=checks[key](values[key]);show(fields[key],message);if(message&&!first)first=fields[key];});
   form.querySelector('[data-err=consent]').textContent=consent?'':'Please agree so we may contact you about Ananta.';
   if(first){first.focus();return;}
   if(!consent){form.querySelector('[name=consent]').focus();return;}
   if(form.querySelector('[name=company]').value)return;
   // Unlock the brochure on this browser and move on to the thank-you page. No contact data is persisted.
   function complete(){
    remember();
    try{sessionStorage.setItem(receiptKey,JSON.stringify({intent:form.dataset.intent,confirmedAt:Date.now()}));}catch(storageError){}
    window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'generate_lead',form:form.dataset.intent});
    location.assign(config.thankYou+'?intent='+encodeURIComponent(form.dataset.intent));
   }
   // No lead destination is configured yet: complete the visitor's journey without sending anything.
   if(!config.endpoint){complete();return;}
   var label=submit.textContent;submit.disabled=true;submit.textContent='Sending your enquiry…';
   var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},20000);
   try{
    var payload={name:values.name,mobile:values.mobile,email:values.email,configuration:selected?selected.dataset.v:null,consent:true,intent:form.dataset.intent,project:'Ananta at Dream Gurukul',source:'ananta-landing',page_url:location.href};
    var response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
    if(!response.ok)throw new Error('Lead service rejected request');
    var result=await response.json();if(result.success!==true)throw new Error('Lead not confirmed');
    // With a destination set, only its confirmed response unlocks the brochure.
    complete();
   }catch(error){status.textContent='We could not confirm your enquiry. Please try again or call '+(matchMedia('(max-width:700px)').matches?'+91 73531 50777':'+91 73531 58222')+'.';}
   finally{clearTimeout(timer);submit.disabled=false;submit.textContent=label;}
  });
 });
})();
