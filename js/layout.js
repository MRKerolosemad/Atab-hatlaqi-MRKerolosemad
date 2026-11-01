/* يحقن الشريط العلوي والتذييل في كل صفحة. لإضافة صفحة جديدة للقائمة: عدّل مصفوفة PAGES */
(function(){
  var s=document.currentScript, root=s.getAttribute('data-root')||'', cur=s.getAttribute('data-page')||'';
  var PAGES=[['index.html','الرئيسية'],['grade3.html','الصف الثالث الإعدادي'],['journey.html','رحلة النجوم 🚀'],['summary.html','الملخص'],['ask.html','اسألني سؤال'],['quiz.html','الاختبارات والشهادات'],['register.html','سجّل الآن']];
  /* أيقونة التطبيق + قابلية التثبيت (تعمل عند النشر على https) */
  (function(){var hd=document.head;function L(rel,href){var l=document.createElement('link');l.rel=rel;l.href=root+href;hd.appendChild(l);}
    L('manifest','manifest.webmanifest');L('icon','assets/icon-192.png');L('apple-touch-icon','assets/icon-192.png');
    var m=document.createElement('meta');m.name='theme-color';m.content='#14284B';hd.appendChild(m);
    if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register(root+'sw.js').catch(function(){});})();
  var nav=PAGES.map(function(p){return '<a href="'+root+p[0]+'"'+(p[0]===cur?' aria-current="page"':'')+'>'+p[1]+'</a>';}).join('');
  var h=document.createElement('header'); h.className='bn-head';
  h.innerHTML='<div class="bn-in"><img class="bn-logo" src="'+root+'assets/logo.png" alt="شعار أتعب هتلاقي – أستاذ كيرلس عماد" onerror="this.style.display=\'none\'"><div class="bn-t"><b>أتعب هتلاقي – أستاذ كيرلس عماد</b><span>أتعب تعويض ربنا كبير</span></div><nav class="bn-nav" aria-label="التنقل الرئيسي">'+nav+'</nav></div>';
  document.body.insertBefore(h,document.body.firstChild);
  document.addEventListener('DOMContentLoaded',function(){
    var f=document.createElement('footer'); f.className='bn-foot';
    var C=window.PLATFORM||{};f.innerHTML='<b>«الذين يزرعون بالدموع يحصدون بالابتهاج»</b>منصة أتعب هتلاقي التعليمية – أستاذ كيرلس عماد'+(C.phone?'<br>للتواصل: <a href="tel:'+C.phone+'" style="color:#E9D28A">'+C.phone+'</a>':'')+'<br>'+[['telegramUrl','تيليجرام'],['facebookUrl','فيسبوك'],['channelUrl','يوتيوب']].filter(function(x){return C[x[0]];}).map(function(x){return '<a href="'+C[x[0]]+'" target="_blank" rel="noopener" style="color:#E9D28A;margin:0 8px">'+x[1]+'</a>';}).join('');
    document.body.appendChild(f);
  });
})();
