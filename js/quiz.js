(function(){
var $=function(i){return document.getElementById(i);},CFG=window.PLATFORM;
var pass=+(new URLSearchParams(location.search).get('pass'))||CFG.passPercent; if(pass<1||pass>100)pass=CFG.passPercent;
var cur=null,items=[],idx=0,name='',phone='';
function L(t){return String(t).replace(/\{\{(.*?)\}\}/g,'<span class="ltr">$1</span>');}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function show(id){['vStart','vQ','vR'].forEach(function(v){$(v).hidden=v!==id;});window.scrollTo(0,0);}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function stars(n){return n?'⭐'.repeat(n):'☆';}
function summary(){var d=Store.get(),b=d.best||{},pts=0,st=0;QUIZZES.forEach(function(z){if(b[z.id]){pts+=b[z.id].pts;st+=b[z.id].stars;}});
  $('sum').innerHTML='نجومك: <b>'+st+' / '+QUIZZES.length*3+' ⭐</b> — نقاطك: <b>'+pts+'</b>'+(QUIZZES.some(function(z){return b[z.id]&&b[z.id].badge;})?'<br>شاراتك: '+QUIZZES.filter(function(z){return b[z.id]&&b[z.id].badge;}).map(function(z){return '🏅 '+z.badge;}).join(' ، '):'');}
$('passTxt').textContent=pass+'%';
$('priv').textContent=CFG.endpoint?'عند إنهاء الاختبار يُرسل اسمك ودرجتك ونقاط الضعف إلى أستاذك كيرلس لمتابعتك. النقاط والنجوم تُحفظ على جهازك فقط.':'اسمك ودرجتك لا تُرسل تلقائيًا لأي جهة، ويمكنك إرسالها لأستاذك بنفسك بزر واتساب بعد الاختبار. النقاط والنجوم تُحفظ على جهازك فقط.';
summary();
$('qlist').innerHTML=QUIZZES.map(function(z,i){return '<button class="btn" type="button" data-i="'+i+'" style="text-align:start">'+z.title+' <small>('+z.questions.length+' أسئلة)</small></button>';}).join('');
$('qlist').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  name=$('sname').value.trim();
  phone=$('sphone').value.trim();
  var nameWords=name.split(/\s+/).filter(function(w){return w.length>0;});
  var phoneOk=/^(010|011|012|015)\d{8}$/.test(phone);
  var valid=true;
  if(nameWords.length<3){$('nameErr').hidden=false;$('sname').focus();valid=false;}else{$('nameErr').hidden=true;}
  if(!phoneOk){$('phoneErr').hidden=false;if(valid)$('sphone').focus();valid=false;}else{$('phoneErr').hidden=true;}
  if(!valid)return;
  start(+b.dataset.i);});
function start(i){
  cur=QUIZZES[i];idx=0;
  items=shuffle(cur.questions.map(function(q){var o=q.o.map(function(t,k){return {t:t,c:k===q.a};});return {q:q,o:shuffle(o),pick:-1};})); /* كل سؤال يُحتسب مرة واحدة */
  show('vQ');ask();
}
function ask(){
  var it=items[idx];$('qn').textContent='السؤال '+(idx+1)+' من '+items.length;$('pr').style.width=(idx/items.length*100)+'%';
  $('qtxt').innerHTML=L(it.q.q);
  if(it.q.diag){$('qdiag').innerHTML=it.q.diag;$('qdiag').hidden=false;}else{$('qdiag').innerHTML='';$('qdiag').hidden=true;}
  $('nx').textContent=idx===items.length-1?'إنهاء الاختبار':'التالي';$('nx').disabled=it.pick<0;
  $('qo').innerHTML=it.o.map(function(o,k){return '<button type="button" class="opt" data-k="'+k+'" aria-pressed="'+(it.pick===k)+'">'+L(o.t)+'</button>';}).join('');
}
$('qo').addEventListener('click',function(e){var b=e.target.closest('.opt');if(!b)return;items[idx].pick=+b.dataset.k;ask();});
$('nx').addEventListener('click',function(){if(items[idx].pick<0)return;if(idx<items.length-1){idx++;ask();}else finish();});
function level(p){for(var i=0;i<CFG.levels.length;i++)if(p>=CFG.levels[i].min)return CFG.levels[i];return CFG.levels[CFG.levels.length-1];}
function finish(){
  var ok=items.filter(function(it){return it.o[it.pick].c;}).length,n=items.length,pc=Math.round(ok/n*100),passed=pc>=pass;
  var wrong={};items.forEach(function(it){if(!it.o[it.pick].c)wrong[it.q.t]=(wrong[it.q.t]||0)+1;});var wt=Object.keys(wrong);
  $('rt').textContent=passed?'أحسنت يا '+name+'! لقد نجحت':'نتيجتك يا '+name;
  $('rOk').textContent=ok;$('rNo').textContent=n-ok;$('rPc').textContent=pc+'%';
  $('rMsg').textContent=passed?'درجتك '+ok+' من '+n+' وحد النجاح '+pass+'%.':CFG.retryMessage+' (حد النجاح '+pass+'%)';
  /* النقاط والنجوم */
  var pts=ok*10+(passed?20:0),sc=pc>=90?3:pc>=80?2:passed?1:0,d=Store.get();d.best=d.best||{};var old=d.best[cur.id]||{pts:0,stars:0,badge:false},newB=passed&&!old.badge;
  d.best[cur.id]={pts:Math.max(old.pts,pts),stars:Math.max(old.stars,sc),badge:old.badge||passed};Store.set(d);summary();
  $('rGame').innerHTML=stars(sc)+' &nbsp; +'+pts+' نقطة'+(newB?'<br>🏅 حصلت على شارة «'+cur.badge+'»!':'')+'<br><small>تُحتسب أعلى نتيجة لك في كل اختبار.</small>';
  /* تحليل الأخطاء */
  $('rAnBox').hidden=!wt.length;
  $('rAn').innerHTML=wt.sort(function(a,b){return wrong[b]-wrong[a];}).map(function(t){var T=TAGS[t]||[t,''];return '<div class="rev no"><b>'+esc(T[0])+'</b> — أخطأت في '+wrong[t]+' من الأسئلة<br><span class="lead">'+esc(T[1])+'</span></div>';}).join('');
  /* الشهادة */
  $('certWrap').hidden=!passed;
  if(passed){var lv=level(pc);$('cT').textContent=cur.certTitle;$('cN').textContent=name;$('cS').innerHTML='الدرجة: '+ok+' من '+n+' ('+pc+'%) – '+lv.label;$('cP').textContent=lv.phrase;$('cD').textContent=new Date().toLocaleDateString('ar-EG');}
  $('rev').innerHTML=items.map(function(it,i){var good=it.o[it.pick].c,right=it.o.filter(function(o){return o.c;})[0];
    return '<div class="rev '+(good?'ok':'no')+'"><b>'+(i+1)+'. '+L(it.q.q)+'</b>'+(it.q.diag?'<div style="max-width:380px;margin:8px 0">'+it.q.diag+'</div>':'')+'<br>إجابتك: '+L(it.o[it.pick].t)+(good?' ✓':' ✗ — الصحيحة: '+L(right.t))+'<br><span class="lead">'+L(it.q.e)+'</span></div>';}).join('');
  /* الإرسال للأستاذ */
  var weakL=wt.map(function(t){return (TAGS[t]||[t])[0];}),payload={name:name.slice(0,60),quiz:cur.title,ok:ok,total:n,pct:pc,passed:passed,weak:weakL.join('، ')};
  var msg='نتيجة «'+cur.title+'»\nالاسم: '+name+'\nالدرجة: '+ok+' من '+n+' ('+pc+'%)\nالحالة: '+(passed?'ناجح':'لم ينجح بعد')+(weakL.length?'\nنقاط تحتاج مراجعة: '+weakL.join('، '):'');
  var wa='https://wa.me/'+CFG.waNumber+'?text='+encodeURIComponent(msg);
  $('rSend').innerHTML='<span id="sst"></span><br><a class="btn alt" style="display:inline-block;text-decoration:none;margin-top:8px" target="_blank" rel="noopener" href="'+wa+'">أرسل نتيجتك لأستاذك على واتساب</a>';
  if(CFG.endpoint){$('sst').textContent='جارٍ إرسال نتيجتك لأستاذك…';
    fetch(CFG.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(function(){$('sst').textContent='تم إرسال نتيجتك إلى أستاذك كيرلس.';},function(){$('sst').textContent='تعذّر الإرسال التلقائي (تأكد من الإنترنت). استخدم زر واتساب.';});
  }else $('sst').textContent='يمكنك إرسال نتيجتك لأستاذك:';
  /* إرسال إلى Google Sheets (قاعدة بيانات الطلاب) */
  var GS_URL='https://script.google.com/macros/s/AKfycbw5oRkgj34sY_lRjLZ6Y12MLf4HUzSDvBTDIklp-wJGF66PIr1duq2MwWOYh1e7xiSBAw/exec';
  fetch(GS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({studentName:name,studentPhone:phone,quizTitle:cur.title,score:ok})}).catch(function(){});
  if(window.Helper)Helper.say(passed?CFG.helperPass:CFG.helperFail);
  show('vR');
}
$('retry').addEventListener('click',function(){start(QUIZZES.indexOf(cur));});
$('home').addEventListener('click',function(){show('vStart');});
$('prn').addEventListener('click',function(){window.print();});
})();
