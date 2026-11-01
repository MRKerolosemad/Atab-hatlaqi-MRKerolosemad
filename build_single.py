import re,json,base64,io
from PIL import Image
R=lambda p:open(p,encoding='utf-8').read()
im=Image.open('assets/logo.png').convert('RGBA');im=im.resize((240,round(im.height*240/im.width)),Image.LANCZOS)
b=io.BytesIO();im.save(b,'PNG',optimize=True);LOGO='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
q=R('js/quiz.js').replace("$('prn').addEventListener('click',function(){window.print();});","$('prn').addEventListener('click',function(){parent.postMessage({printCert:$('certArea').outerHTML},'*');});")
assert 'printCert' in q
JS={'js/physics.js':R('js/physics.js'),'js/resistors.js':R('js/resistors.js'),'js/quiz.js':q}
for f in ['config','questions','experiments','store','helper','video','mixed','teacher','qa-data','qa','grades','power','tri','register']:JS['js/%s.js'%f]=R('js/%s.js'%f)
CSS={'css/app.css':R('css/app.css')}
NAV='''<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var h=a.getAttribute('href')||'',k=/summary\\.html$/.test(h)?'summary':/register\\.html$/.test(h)?'register':/ohm\\.html$/.test(h)?'ohm':/resistors\\.html$/.test(h)?'res':/mixed\\.html$/.test(h)?'mixed':/teacher\\.html$/.test(h)?'teacher':/power-lab\\.html$/.test(h)?'powerlab':/power\\.html$/.test(h)?'power':/ask\\.html$/.test(h)?'ask':/grade3\\.html$/.test(h)?'grade3':/quiz\\.html/.test(h)?'quiz':/index\\.html$/.test(h)?'home':null;if(k){e.preventDefault();parent.postMessage({go:k},'*');}});</script>'''
def inline(path):
    s=R(path)
    s=re.sub(r'<script src="[^"]*layout\.js"[^>]*></script>\n?','',s)
    s=re.sub(r'<link rel="stylesheet" href="[^"]*brand\.css">\n?','',s)
    s=re.sub(r'<link rel="stylesheet" href="\.{0,2}/?(?:\.\./)?css/app\.css">',lambda m:'<style>'+CSS['css/app.css']+'</style>',s)
    s=re.sub(r'<script src="(?:\.\./)?(js/[^"]+)"([^>]*)></script>',lambda m:'<script'+m.group(2)+'>'+JS[m.group(1)]+'</script>',s)
    s=re.sub(r'(?:\.\./)?assets/logo\.png',LOGO,s)
    return s.replace('</body>',NAV+'</body>')
pages={'home':inline('index.html'),'grade3':inline('grade3.html'),'ohm':inline('labs/ohm.html'),'res':inline('labs/resistors.html'),'mixed':inline('labs/mixed.html'),'power':inline('labs/power.html'),'powerlab':inline('labs/power-lab.html'),'summary':inline('summary.html'),'register':inline('register.html'),'ask':inline('ask.html'),'quiz':inline('quiz.html'),'teacher':inline('teacher.html')}
for k,v in pages.items(): assert 'src="js/' not in v and 'href="css/' not in v and 'layout.js' not in v,k
FAV='data:image/png;base64,'+base64.b64encode(open('assets/favicon-64.png','rb').read()).decode()
data=json.dumps(pages,ensure_ascii=False).replace('</','<\\/')
shell='''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>أتعب هتلاقي – أستاذ كيرلس عماد</title><meta name="theme-color" content="#14284B"><link rel="icon" href="'''+FAV+'''">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Reem+Kufi:wght@600;700&display=swap">
<style>'''+CSS['css/app.css']+'''
html,body{height:100%;margin:0;overflow:hidden}
.top{background:#14284B;border-bottom:4px solid #D4AF37;color:#fff;padding:6px 10px;display:flex;flex-direction:column;gap:6px}
.brand{display:flex;align-items:center;gap:10px}.brand img{width:44px;height:44px;border-radius:50%;background:#fff}
.brand b{font-family:var(--f-display);font-size:17px;display:block;line-height:1.3}.brand span{color:#E9D28A;font-size:13px}
.nv{display:flex;gap:6px;overflow-x:auto}.nv button{flex:none;font:inherit;font-weight:700;font-size:14px;color:#fff;background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:8px 12px;min-height:40px;cursor:pointer}
.nv button[aria-current=page]{background:#D4AF37;color:#14284B;border-color:#D4AF37}
#fr{display:block;width:100%;border:0;height:calc(100% - 104px);height:calc(100dvh - 104px);background:var(--bg)}
#certArea{position:fixed;left:-99999px;top:0;width:1000px}
@media print{#certArea{position:absolute;inset:0;width:auto}.top,#fr{display:none}html,body{overflow:visible;height:auto}}
</style></head><body>
<div class="top"><div class="brand"><img src="'''+LOGO+'''" alt="شعار أتعب هتلاقي"><div><b>أتعب هتلاقي – أستاذ كيرلس عماد</b><span>أتعب تعويض ربنا كبير</span></div></div>
<nav class="nv" aria-label="التنقل الرئيسي"><button data-k="home">الرئيسية</button><button data-k="grade3">الصف الثالث الإعدادي</button><button data-k="summary">الملخص</button><button data-k="ask">اسألني سؤال</button><button data-k="quiz">الاختبارات والشهادات</button><button data-k="register">سجّل الآن</button></nav></div>
<iframe id="fr" title="محتوى المنصة"></iframe><div id="certArea"></div>
<script>
var PAGES='''+data+''';
var fr=document.getElementById('fr'),cur='';function ld(){try{return JSON.parse(localStorage.getItem('atab')||'{}');}catch(e){return {};}}
function go(k){if(!PAGES[k])k='home';if(k!==cur){cur=k;fr.srcdoc=PAGES[k].replace('<head>','<head><script>window.__ATAB='+JSON.stringify(ld())+'<\\/script>');}
 Array.prototype.forEach.call(document.querySelectorAll('.nv button'),function(b){if(b.dataset.k===k)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(location.hash!=='#'+k)history.replaceState(null,'','#'+k);}
document.querySelector('.nv').addEventListener('click',function(e){if(e.target.dataset.k)go(e.target.dataset.k);});
window.addEventListener('message',function(e){var d=e.data||{};if(d.go)go(d.go);else if(d.save){try{localStorage.setItem('atab',JSON.stringify(d.save));}catch(x){}}else if(d.printCert){document.getElementById('certArea').innerHTML=d.printCert;setTimeout(function(){window.print();},150);}});
window.addEventListener('hashchange',function(){go(location.hash.slice(1));});
go(location.hash.slice(1)||'home');
</script></body></html>'''
open('/mnt/user-data/outputs/atab-hatlaqi-single.html','w',encoding='utf-8').write(shell)
print(len(shell)//1024,'KB')
