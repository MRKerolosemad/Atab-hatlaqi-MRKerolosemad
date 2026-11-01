(function(){
var $=function(i){return document.getElementById(i);},P=Phys;
function f(x){return (Math.round(x*10000)/10000).toLocaleString('en-US',{maximumFractionDigits:4});}
function num(id){var v=String($(id).value).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace('٫','.').replace(',','.').trim();return v===''?NaN:Number(v);}
function L(t){return '<span class="ltr">'+t+'</span>';}
/* 1) حاسبة */
var unk='P',UN={P:'W',E:'J',t:'s'};
function calc(){
  ['P','E','t'].forEach(function(k){$('in'+k.toUpperCase()).hidden=(k===unk);});
  Array.prototype.forEach.call(document.querySelectorAll('#unk button'),function(b){b.setAttribute('aria-pressed',b.dataset.u===unk);});
  var o=$('calcOut'),p=num('vP')*$('uP').value,e=num('vE')*$('uE').value,t=num('vT')*$('uT').value,h=[];
  var need={P:[e,t],E:[p,t],t:[e,p]}[unk];
  if(need.some(function(x){return isNaN(x)||x<=0;})){o.className='fb info res';o.textContent='اكتب قيمًا موجبة في الخانات الظاهرة.';return;}
  if(unk==='P'){var r=P.powerP(e,t);
    h.push('تحويل الوحدات: E = '+f(e)+' J ، t = '+f(t)+' s');h.push('P = E ÷ t = '+f(e)+' ÷ '+f(t)+' = <b class="big">'+f(r)+' W</b>');h.push('= '+f(r/1000)+' kW');}
  else if(unk==='E'){var r=P.powerE(p,t);
    h.push('تحويل الوحدات: P = '+f(p)+' W ، t = '+f(t)+' s');h.push('E = P × t = '+f(p)+' × '+f(t)+' = <b class="big">'+f(r)+' J</b>');h.push('= '+f(r/1000)+' kJ = '+f(r/P.KWH)+' kW.h');}
  else{var r=P.powerT(e,p);
    h.push('تحويل الوحدات: E = '+f(e)+' J ، P = '+f(p)+' W');h.push('t = E ÷ P = '+f(e)+' ÷ '+f(p)+' = <b class="big">'+f(r)+' s</b>');h.push('= '+f(r/60)+' min = '+f(r/3600)+' h');}
  o.className='fb ok res';o.innerHTML=h.map(function(x){return '<div>'+L(x)+'</div>';}).join('');
}
$('unk').addEventListener('click',function(e){if(e.target.dataset.u){unk=e.target.dataset.u;calc();}});
['vP','vE','vT','uP','uE','uT'].forEach(function(i){$(i).addEventListener('input',calc);$(i).addEventListener('change',calc);});
/* 2) التكلفة */
var DEV=[['مصباح LED',12],['مصباح CFL',20],['كمبيوتر محمول',50],['تلفاز',100],['مروحة (وسط المدى 50–100)',75],['مدفأة كهربائية (وسط 1–2 kW)',1500],['مكواة ملابس (وسط 1–2.5 kW)',1750],['جهاز تكييف (وسط 1.5–2.5 kW)',2000],['جهاز آخر (اكتب القدرة)',0]];
function fillDev(id,def){$(id).innerHTML=DEV.map(function(d,i){return '<option value="'+i+'"'+(i===def?' selected':'')+'>'+d[0]+(d[1]?' – '+d[1]+' W':'')+'</option>';}).join('');}
fillDev('d1',0);fillDev('d2',1);$('p1').value=12;$('p2').value=20;
function dev(n){var c=P.cost(num('p'+n),num('h'+n),num('days'),num('price'));return c;}
function cost(){
  var a=dev(1),b=dev(2);if([a.E,a.cost,b.E,b.cost].some(function(x){return isNaN(x)||x<0;})){$('cmpMsg').textContent='تأكد من كتابة أرقام صحيحة.';return;}
  [[a,'o1',1],[b,'o2',2]].forEach(function(x){var c=x[0];$(x[1]).innerHTML=[L('P = '+f(num('p'+x[2]))+' ÷ 1000 = '+f(c.kW)+' kW'),L('t = '+f(num('h'+x[2]))+' × '+f(num('days'))+' = '+f(c.hours)+' h'),L('E = '+f(c.kW)+' × '+f(c.hours)+' = <b>'+f(c.E)+' kW.h</b>'),L('التكلفة = '+f(c.E)+' × '+f(num('price'))+' = <b class="big">'+f(Math.round(c.cost*100)/100)+' جنيه</b>')].map(function(t){return '<div>'+t+'</div>';}).join('');});
  var m=Math.max(a.cost,b.cost,0.0001);
  $('bars').innerHTML='<div class="bar" style="width:'+Math.max(8,a.cost/m*100)+'%">'+f(Math.round(a.cost*100)/100)+'</div><div class="bar o" style="width:'+Math.max(8,b.cost/m*100)+'%">'+f(Math.round(b.cost*100)/100)+'</div>';
  var n1=DEV[$('d1').value][0].split(' (')[0],n2=DEV[$('d2').value][0].split(' (')[0];
  $('cmpMsg').innerHTML=Math.abs(a.cost-b.cost)<0.005?'تكلفة الجهازين متساوية.':'الأقل تكلفة: <b>'+(a.cost<b.cost?n1+' (الأول)':n2+' (الثاني)')+'</b>، والفرق '+L(f(Math.round(Math.abs(a.cost-b.cost)*100)/100)+' جنيه')+' في الشهر. كلما قلّت القدرة أو عدد الساعات قلّت التكلفة.';
}
[1,2].forEach(function(n){$('d'+n).addEventListener('change',function(){var d=DEV[$('d'+n).value];if(d[1])$('p'+n).value=d[1];cost();});$('p'+n).addEventListener('input',function(){$('d'+n).value=DEV.length-1;cost();});$('h'+n).addEventListener('input',cost);});
$('days').addEventListener('input',cost);$('price').addEventListener('input',cost);
/* 3) ماذا يحدث للقدرة */
function pw(){var fe=+$('fe').value,ft=+$('ft').value,p1=P.powerP(200,20),p2=P.powerP(200*fe,20*ft),k=p2/p1;
  var m=Math.max(p1,p2);
  $('pw').innerHTML='<div class="ltr">E₁ = 200 J ، t₁ = 20 s ← P₁ = 10 W</div><div class="bar" style="width:'+Math.max(8,p1/m*100)+'%">P₁ = '+f(p1)+' W</div><div class="ltr" style="margin-top:8px">E₂ = '+f(200*fe)+' J ، t₂ = '+f(20*ft)+' s ← P₂ = '+f(p2)+' W</div><div class="bar o" style="width:'+Math.max(8,p2/m*100)+'%">P₂ = '+f(p2)+' W</div>';
  $('pwMsg').innerHTML=Math.abs(k-1)<1e-9?'القدرة لم تتغير.':(k>1?'تزداد القدرة إلى ':'تقل القدرة إلى ')+L('P₂ = '+f(k)+' × P₁');}
$('fe').addEventListener('change',pw);$('ft').addEventListener('change',pw);
$('cases').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;$('fe').value=b.dataset.e;$('ft').value=b.dataset.t;pw();});
/* 4) التحدي */
var ch=null;function pick(a){return a[Math.floor(Math.random()*a.length)];}
function newCh(){var type=pick(['P','E','t','cost','P','E','cost']),q,ans,unit,sol;
  if(type==='P'){var Pw=pick([100,150,500,1500,2000]),tm=pick([1,2,5,10]),E=Pw*tm*60;q='جهاز يستهلك '+L(f(E)+' J')+' خلال '+L(tm+' min')+'. احسب قدرته.';ans=Pw;unit='W';sol='t = '+tm+' × 60 = '+(tm*60)+' s<br>P = E ÷ t = '+f(E)+' ÷ '+(tm*60)+' = '+f(Pw)+' W';}
  else if(type==='E'){var Pw2=pick([60,88,100,250,1000]),tm2=pick([1,2,5,10]);ans=Pw2*tm2*60/1000;q='احسب الطاقة الكهربية بوحدة kJ التي يستهلكها جهاز قدرته '+L(Pw2+' W')+' في '+L(tm2+' min')+'.';unit='kJ';sol='t = '+(tm2*60)+' s<br>E = P × t = '+Pw2+' × '+(tm2*60)+' = '+f(Pw2*tm2*60)+' J = '+f(ans)+' kJ';}
  else if(type==='t'){var Pw3=pick([100,250,500,1000]),tm3=pick([1,2,5,10]);var E3=Pw3*tm3*60;ans=tm3;q='جهاز قدرته '+L(Pw3+' W')+' استهلك طاقة مقدارها '+L(f(E3)+' J')+'. احسب زمن التشغيل بالدقيقة.';unit='min';sol='t = E ÷ P = '+f(E3)+' ÷ '+Pw3+' = '+(tm3*60)+' s = '+tm3+' min';}
  else{var Pw4=pick([100,200,500,1000,2000]),h4=pick([1,2,4,5,10]);var c=P.cost(Pw4,h4,30,1.55);ans=Math.round(c.cost*100)/100;q='جهاز قدرته '+L(Pw4+' W')+' يعمل '+L(h4+' h')+' يوميًا لمدة 30 يومًا. احسب تكلفة الاستهلاك (سعر الكيلووات.ساعة 1.55 جنيه).';unit='جنيه';sol='P = '+(Pw4/1000)+' kW ، t = '+h4+' × 30 = '+(h4*30)+' h<br>E = '+(Pw4/1000)+' × '+(h4*30)+' = '+f(c.E)+' kW.h<br>التكلفة = '+f(c.E)+' × 1.55 = '+f(ans)+' جنيه';}
  ch={ans:ans,unit:unit,sol:sol};$('chq').innerHTML=q;$('chu').textContent=unit;$('cha').value='';$('chf').hidden=true;}
$('chk').addEventListener('click',function(){var fb=$('chf'),x=num('cha');fb.hidden=false;if(isNaN(x)){fb.className='fb info';fb.textContent='اكتب إجابتك أولًا.';return;}
  var ok=Math.abs(x-ch.ans)<=Math.max(0.011,Math.abs(ch.ans)*0.001);fb.className='fb '+(ok?'ok':'no');fb.innerHTML=(ok?'إجابة صحيحة، أحسنت!':'ليست صحيحة. الحل:')+'<span class="ltr" style="display:block;text-align:center">'+ch.sol+'</span><b class="ltr" style="display:block;text-align:center">الإجابة = '+f(ch.ans)+' '+ch.unit+'</b>';});
$('chn').addEventListener('click',newCh);
calc();cost();pw();newCh();
})();
