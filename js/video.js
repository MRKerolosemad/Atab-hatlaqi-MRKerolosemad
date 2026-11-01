/* يعرض فيديو الدرس من يوتيوب (الروابط في config.js) أسفل الصفحة */
(function(){
  var s=document.currentScript,key=s.getAttribute('data-video'),C=window.PLATFORM||{},url=(C.videos&&C.videos[key])||'';
  function id(u){var m=u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:'';}
  document.addEventListener('DOMContentLoaded',function(){
    var d=document.createElement('section');d.setAttribute('style','max-width:1080px;margin:16px auto;padding:16px;border:1px solid #D2DDE8;border-radius:14px;background:rgba(127,127,127,.08);font-family:Cairo,system-ui,Tahoma,sans-serif;direction:rtl;color:inherit');
    var v=id(url),h='<h3 style="margin:0 0 8px;font-size:18px">🎬 فيديو شرح الدرس</h3>';
    if(v)h+='<div style="position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden"><iframe src="https://www.youtube.com/embed/'+v+'" title="فيديو شرح الدرس" allowfullscreen loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div><p style="margin:10px 0 0"><a href="'+url+'" target="_blank" rel="noopener" style="font-weight:800">افتح الفيديو على يوتيوب ↗</a></p>';
    else h+='<p style="margin:0;opacity:.8">سيُضاف فيديو الشرح قريبًا على قناة أستاذ كيرلس.</p>';
    if(C.channelUrl)h+='<p style="margin:8px 0 0"><a href="'+C.channelUrl+'" target="_blank" rel="noopener" style="font-weight:800">قناة أستاذ كيرلس على يوتيوب ↗</a></p>';
    d.innerHTML=h;var m=document.querySelector('main');(m||document.body).appendChild(d);
  });
})();
