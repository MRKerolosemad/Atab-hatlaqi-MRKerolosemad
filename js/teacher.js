(function(){
var $=function(i){return document.getElementById(i);},C=window.PLATFORM;
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function avg(a){return a.length?Math.round(a.reduce(function(x,y){return x+y;},0)/a.length):0;}
function fd(t){var d=new Date(t);return isNaN(d)?esc(t):d.toLocaleString('ar-EG');}
function renderVisits(v){v=v||{};$('v1').textContent=v.total==null?'—':v.total;$('v2').textContent=v.week==null?'—':v.week;$('v3').textContent=v.unique==null?'—':v.unique;var ks=Object.keys(v.days||{}).sort().reverse();$('vd').innerHTML=ks.length?ks.map(function(k){return '<tr><td>'+esc(k)+'</td><td>'+v.days[k]+'</td></tr>';}).join(''):'<tr><td colspan="2">لا توجد زيارات مسجلة بعد</td></tr>';}
function renderRegs(g){g=g||[];$('rc').textContent=g.length;$('tg').innerHTML=g.length?g.slice().reverse().map(function(r){return '<tr><td>'+fd(r.time)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.grade)+'</td><td class="ltr">'+esc(r.phone||'—')+'</td><td>'+esc(r.note||'—')+'</td></tr>';}).join(''):'<tr><td colspan="5">لا توجد طلبات تسجيل بعد</td></tr>';}
function render(rows,visits,regs){renderVisits(visits);renderRegs(regs);
  $('login').hidden=true;$('dash').hidden=false;
  var st={},qz={},wk={};
  rows.forEach(function(r){var s=st[r.name]=st[r.name]||{n:0,best:0,last:r.time};s.n++;s.best=Math.max(s.best,r.pct);s.last=r.time;
    var q=qz[r.quiz]=qz[r.quiz]||{n:0,p:[],ok:0};q.n++;q.p.push(r.pct);if(r.passed)q.ok++;
    String(r.weak||'').split('،').forEach(function(w){w=w.trim();if(w)wk[w]=(wk[w]||0)+1;});});
  var all=rows.map(function(r){return r.pct;});
  $('k1').textContent=rows.length;$('k2').textContent=Object.keys(st).length;$('k3').textContent=avg(all)+'%';$('k4').textContent=rows.length?Math.round(rows.filter(function(r){return r.passed;}).length/rows.length*100)+'%':'0%';
  $('tq').innerHTML=Object.keys(qz).map(function(k){var q=qz[k];return '<tr><td>'+esc(k)+'</td><td>'+q.n+'</td><td>'+avg(q.p)+'%</td><td>'+Math.round(q.ok/q.n*100)+'%</td></tr>';}).join('')||'<tr><td colspan="4">لا توجد بيانات بعد</td></tr>';
  var wl=Object.keys(wk).sort(function(a,b){return wk[b]-wk[a];}).slice(0,8);
  $('tw').innerHTML=wl.length?wl.map(function(w){return '<div class="rev no"><b>'+esc(w)+'</b> — '+wk[w]+' مرة</div>';}).join(''):'<p class="lead">لا توجد أخطاء مسجلة بعد.</p>';
  $('ts').innerHTML=Object.keys(st).sort().map(function(k){var s=st[k];return '<tr><td>'+esc(k)+'</td><td>'+s.n+'</td><td>'+s.best+'%</td><td>'+fd(s.last)+'</td></tr>';}).join('');
  $('tr').innerHTML=rows.slice(-20).reverse().map(function(r){return '<tr><td>'+fd(r.time)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.quiz)+'</td><td>'+esc(r.pct)+'%</td><td>'+esc(r.weak||'—')+'</td></tr>';}).join('');
}
$('go').addEventListener('click',function(){
  var m=$('lmsg');if(!C.endpoint){m.textContent='لم يُضبط رابط استقبال الدرجات (endpoint) في ملف config.js بعد. راجع README.';return;}
  m.textContent='جارٍ التحميل…';
  fetch(C.endpoint+'?key='+encodeURIComponent($('pw').value)).then(function(r){return r.json();}).then(function(d){if(d.error){m.textContent='كلمة السر غير صحيحة.';return;}render(d.rows||[],d.visits,d.regs);}).catch(function(){m.textContent='تعذّر تحميل البيانات. تأكد من الإنترنت ومن نشر السكربت للجميع (Anyone).';});
});
$('pw').addEventListener('keydown',function(e){if(e.key==='Enter')$('go').click();});
})();
