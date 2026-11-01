/* الشخصية المساعدة «أستاذ كيرلس يقول» — رسائل مكتوبة مسبقًا في config.js (ليست ذكاءً اصطناعيًا) */
(function(){
  var s=document.currentScript,page=s.getAttribute('data-page')||'home',logo=s.getAttribute('data-logo')||'';
  var C=window.PLATFORM||{},tips=(C.tips&&C.tips[page])||[],i=-1;
  var css=document.createElement('style');
  css.textContent='#hlp{position:fixed;bottom:12px;left:12px;z-index:50;display:flex;flex-direction:column;align-items:flex-start;gap:8px;max-width:min(320px,calc(100vw - 24px));font-family:Cairo,system-ui,Tahoma,sans-serif;direction:rtl}'+
  '#hlp .b{background:#fff;color:#14284B;border:2px solid #D4AF37;border-radius:14px;padding:10px 12px;font-size:15px;line-height:1.7;box-shadow:0 4px 18px rgba(0,0,0,.25)}'+
  '#hlp .b small{display:block;color:#9A6B00;font-weight:800;margin-bottom:2px}#hlp .b button{font:inherit;font-weight:700;font-size:13px;margin-top:6px;margin-inline-end:6px;padding:6px 10px;border-radius:8px;border:1px solid #1F3E78;background:#fff;color:#1F3E78;cursor:pointer}'+
  '#hlp .a{width:58px;height:58px;border-radius:50%;border:3px solid #D4AF37;background:#fff;padding:0;cursor:pointer;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.3)}#hlp .a img{width:100%;height:100%;object-fit:cover}';
  document.head.appendChild(css);
  var w=document.createElement('div');w.id='hlp';
  w.innerHTML='<div class="b" role="status" aria-live="polite" hidden></div><button class="a" type="button" aria-label="أستاذ كيرلس يقول: اضغط لرسالة"><img src="'+logo+'" alt="" onerror="this.style.display=\'none\'"></button>';
  document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(w);setTimeout(function(){if(tips.length&&w.querySelector('.b').hidden&&!w.dataset.used)next();},1800);});
  var b=function(){return w.querySelector('.b');};
  function say(t){w.dataset.used=1;b().hidden=false;b().innerHTML='<small>أستاذ كيرلس يقول:</small>'+t+'<br>'+(tips.length>1?'<button type="button" data-n>نصيحة تانية</button>':'')+'<button type="button" data-x>إغلاق</button>';}
  function next(){i=(i+1)%tips.length;say(tips[i]);}
  w.addEventListener('click',function(e){var t=e.target;if(t.closest('.a')){if(b().hidden){tips.length?next():0;}else b().hidden=true;}else if(t.hasAttribute('data-n'))next();else if(t.hasAttribute('data-x'))b().hidden=true;});
  window.Helper={say:say};
})();
