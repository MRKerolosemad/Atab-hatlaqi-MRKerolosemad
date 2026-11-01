(function(){
var $=function(i){return document.getElementById(i);},P=Phys,f=P.fmt,SUB=['₁','₂','₃','₄'];
var st={mode:'series',n:3,V:12,same:true,Rs:[6,6,6,6]};
function L(t){return '<span class="ltr">'+t+'</span>';}
function act(){return st.Rs.slice(0,st.n);}
function isSame(a){return st.same||a.every(function(x){return x===a[0];});}
function box(cx,y,w,txt){return '<rect class="bgf" x="'+(cx-w/2-4)+'" y="'+(y-18)+'" width="'+(w+8)+'" height="36"/><rect class="rb" x="'+(cx-w/2)+'" y="'+(y-15)+'" width="'+w+'" height="30" rx="6"/><text x="'+cx+'" y="'+(y+5)+'" text-anchor="middle">'+txt+'</text>';}
function battery(){return '<rect class="bgf" x="14" y="126" width="52" height="46"/><line class="pl" x1="20" y1="136" x2="60" y2="136" stroke-width="4"/><line class="pl" x1="30" y1="154" x2="50" y2="154" stroke-width="7"/><text class="cap" x="72" y="140">+</text><text class="cap" x="72" y="164">−</text><text class="cap" x="40" y="190" text-anchor="middle">'+st.V+' V</text>';}
function draw(r){
  var a=act(),n=a.length,s='';
  if(st.mode==='series'){
    var slot=260/n,bw=Math.min(66,slot-14);
    s+='<path class="w" d="M40 130 V60 H380 V240 H40 V170"/>'+battery();
    a.forEach(function(R,i){var cx=90+slot*(i+.5);s+=box(cx,60,bw,f(R)+' Ω')+'<text class="cap" x="'+cx+'" y="34" text-anchor="middle">R'+SUB[i]+'</text><text class="cap" x="'+cx+'" y="92" text-anchor="middle">'+f(r.branches[i].V)+' V</text>';});
    s+='<polygon points="373,150 387,150 380,164" fill="var(--c-i)"/><text class="ci" x="210" y="160" text-anchor="middle" font-size="16">I = '+f(r.I)+' A</text>';
  }else{
    var ys=a.map(function(_,i){return n===1?140:50+i*(180/(n-1));});
    s+='<path class="w" d="M40 130 V'+ys[0]+' H110 M110 '+ys[0]+' V'+ys[n-1]+' M330 '+ys[0]+' V'+ys[n-1]+' M330 '+ys[n-1]+' V272 H40 V170"/>'+battery();
    a.forEach(function(R,i){var y=ys[i];s+='<path class="w" d="M110 '+y+' H330"/>'+box(220,y,76,'R'+SUB[i]+'='+f(R)+'Ω')+'<text class="ci" x="116" y="'+(y-8)+'" font-size="12">I'+SUB[i]+'='+f(r.branches[i].I)+' A</text>';});
    s+='<text class="ci" x="40" y="116" font-size="13" text-anchor="start">I = '+f(r.I)+' A</text>';
  }
  $('circ').innerHTML=s;
}
function steps(r){
  var a=act(),n=a.length,V=st.V,same=isSame(a),R=a[0],ser=st.mode==='series',h=[];
  if(ser) h.push(['المقاومة المكافئة',same?'R̃ = R × n = '+f(R)+' × '+n+' = '+f(r.Req)+' Ω':'R̃ = R₁ + R₂ + … = '+a.map(f).join(' + ')+' = '+f(r.Req)+' Ω']);
  else h.push(['المقاومة المكافئة',same?'R̃ = R ÷ n = '+f(R)+' ÷ '+n+' = '+f(r.Req)+' Ω':'1/R̃ = 1/R₁ + 1/R₂ + … ⟹ R̃ = '+f(r.Req)+' Ω']);
  h.push(['شدة التيار الكلي','I = V ÷ R̃ = '+V+' ÷ '+f(r.Req)+' = '+f(r.I)+' A']);
  if(ser){
    h.push(['التيار متساوٍ في كل مقاومة','I₁ = I₂ = … = I = '+f(r.I)+' A']);
    h.push(['فرق الجهد على كل مقاومة',same?'V₁ = V ÷ n = '+V+' ÷ '+n+' = '+f(V/n)+' V':a.map(function(x,i){return 'V'+SUB[i]+' = I × R'+SUB[i]+' = '+f(r.I)+' × '+f(x)+' = '+f(r.I*x)+' V';}).join(' ، ')]);
    h.push(['التحقق','V₁ + V₂ + … = '+f(P.sum(r.branches.map(function(b){return b.V;})))+' V = V ✓']);
  }else{
    h.push(['فرق الجهد متساوٍ على كل مقاومة','V₁ = V₂ = … = V = '+V+' V']);
    h.push(['التيار في كل مقاومة',same?'I₁ = I ÷ n = '+f(r.I)+' ÷ '+n+' = '+f(r.I/n)+' A':a.map(function(x,i){return 'I'+SUB[i]+' = V ÷ R'+SUB[i]+' = '+V+' ÷ '+f(x)+' = '+f(V/x)+' A';}).join(' ، ')]);
    h.push(['التحقق','I₁ + I₂ + … = '+f(P.sum(r.branches.map(function(b){return b.I;})))+' A = I ✓']);
  }
  $('steps').innerHTML=h.map(function(x){return '<li>'+x[0]+':<span class="f">'+x[1]+'</span></li>';}).join('');
}
function render(){
  var a=act(),r=P.analyze(st.mode,a,st.V);
  Array.prototype.forEach.call(document.querySelectorAll('#mode button'),function(b){b.setAttribute('aria-pressed',b.dataset.m===st.mode);});
  Array.prototype.forEach.call(document.querySelectorAll('#num button'),function(b){b.setAttribute('aria-pressed',+b.dataset.n===st.n);});
  $('bV').textContent=st.V+' V';$('sv').value=st.V;$('same').checked=st.same;
  $('tReq').textContent=f(r.Req)+' Ω';$('tI').textContent=f(r.I)+' A';$('tV').textContent=st.V+' V';
  $('insight').innerHTML=st.mode==='series'
   ?'على التوالي: المقاومة المكافئة '+L(f(r.Req)+' Ω')+' <b>أكبر</b> من أكبر مقاومة منفردة '+L(f(Math.max.apply(null,a))+' Ω')+'، والتيار واحد في كل المقاومات، والجهد يتوزع.'
   :'على التوازي: المقاومة المكافئة '+L(f(r.Req)+' Ω')+' <b>أقل</b> من أصغر مقاومة منفردة '+L(f(Math.min.apply(null,a))+' Ω')+'، والجهد واحد على كل مقاومة، والتيار يتوزع.';
  $('tb').innerHTML=r.branches.map(function(b,i){return '<tr><td>R'+SUB[i]+'</td><td>'+f(b.R)+'</td><td>'+f(b.V)+'</td><td>'+f(b.I)+'</td></tr>';}).join('');
  draw(r);steps(r);
  var s=P.analyze('series',a,st.V),p=P.analyze('parallel',a,st.V);
  $('cmp').innerHTML='<tr><th>المقاومة المكافئة</th><td>'+f(s.Req)+' Ω</td><td>'+f(p.Req)+' Ω</td></tr><tr><th>شدة التيار الكلي</th><td>'+f(s.I)+' A</td><td>'+f(p.I)+' A</td></tr><tr><th>مقارنتها بالمقاومة الواحدة</th><td>أكبر</td><td>أقل</td></tr><tr><th>الهدف من التوصيل</th><td>مقاومة مكافئة كبيرة</td><td>مقاومة مكافئة صغيرة</td></tr><tr><th>التيار</th><td>متساوٍ في كل مقاومة</td><td>يتوزع على المقاومات</td></tr><tr><th>فرق الجهد</th><td>يتوزع على المقاومات</td><td>متساوٍ على كل مقاومة</td></tr>';
}
function sliders(){
  var h='';for(var i=0;i<st.n;i++)h+='<div class="srow" style="margin-top:10px"><label for="r'+i+'"><span>المقاومة R'+SUB[i]+'</span><span class="badge ltr" id="rb'+i+'">'+f(st.Rs[i])+' Ω</span></label><input type="range" id="r'+i+'" min="1" max="100" step="1" value="'+st.Rs[i]+'"></div>';
  $('rs').innerHTML=h;
  for(var k=0;k<st.n;k++)(function(k){$('r'+k).addEventListener('input',function(e){var v=+e.target.value;if(st.same)st.Rs=[v,v,v,v];else st.Rs[k]=v;for(var j=0;j<st.n;j++){$('r'+j).value=st.Rs[j];$('rb'+j).textContent=f(st.Rs[j])+' Ω';}render();});})(k);
}
$('mode').addEventListener('click',function(e){if(e.target.dataset.m){st.mode=e.target.dataset.m;render();}});
$('num').addEventListener('click',function(e){if(e.target.dataset.n){st.n=+e.target.dataset.n;sliders();render();}});
$('sv').addEventListener('input',function(e){st.V=+e.target.value;render();});
$('same').addEventListener('change',function(e){st.same=e.target.checked;if(st.same){st.Rs=[st.Rs[0],st.Rs[0],st.Rs[0],st.Rs[0]];sliders();}render();});
/* التحدي: أنواع الأسئلة المتوقعة في الامتحان */
var ch=null,pk=null,lastT='';
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function num(){return Number($('cha').value.replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace('٫','.').replace(',','.'));}
function sol(c){var ser=c.mode==='series',n=c.n,R=c.R,V=c.V,Rq=c.Req;
  if(c.type==='req')return ser?'R̃ = R × n = '+R+' × '+n+' = '+f(Rq)+' Ω':'R̃ = R ÷ n = '+R+' ÷ '+n+' = '+f(Rq)+' Ω';
  if(c.type==='single')return ser?'R = R̃ ÷ n = '+f(Rq)+' ÷ '+n+' = '+R+' Ω':'R = R̃ × n = '+f(Rq)+' × '+n+' = '+R+' Ω';
  var I=V/Rq;
  if(c.type==='current')return 'R̃ = '+(ser?R+' × '+n:R+' ÷ '+n)+' = '+f(Rq)+' Ω ، I = V ÷ R̃ = '+V+' ÷ '+f(Rq)+' = '+f(I)+' A ثم '+(ser?'التيار في كل مقاومة = '+f(I)+' A':'التيار في كل مقاومة = '+f(I)+' ÷ '+n+' = '+f(I/n)+' A');
  return ser?'V₁ = V ÷ n = '+V+' ÷ '+n+' = '+f(V/n)+' V':'الجهد على كل مقاومة = جهد المصدر = '+V+' V';}
function newCh(){
  var mode=pick(['series','parallel']),n,R,type;
  do{type=pick(['req','single','current','voltage']);}while(type===lastT);lastT=type;
  do{n=pick([2,3,4]);R=pick(mode==='series'?[2,3,4,5,10,20,25]:[6,12,24,30,60]);}while(mode==='parallel'&&R%n!==0);
  var V=pick([12,24,45,60]),Rq=mode==='series'?R*n:R/n,I=V/Rq;
  ch={type:type,mode:mode,n:n,R:R,V:V,Req:Rq};pk=null;
  var M='<b>'+(mode==='series'?'على التوالي':'على التوازي')+'</b>',base='وُصلت '+n+' مقاومات متماثلة ';
  var q={req:base+'قيمة كل منها <span class="ltr">'+R+' Ω</span> '+M+' مع مصدر <span class="ltr">'+V+' V</span>. توقّع أولًا، ثم احسب المقاومة المكافئة.',
    single:base+M+' فكانت المقاومة المكافئة لها <span class="ltr">'+f(Rq)+' Ω</span>. احسب قيمة المقاومة الواحدة.',
    current:base+'قيمة كل منها <span class="ltr">'+R+' Ω</span> '+M+' مع مصدر <span class="ltr">'+V+' V</span>. احسب شدة التيار المار في كل مقاومة.',
    voltage:base+'قيمة كل منها <span class="ltr">'+R+' Ω</span> '+M+' مع مصدر <span class="ltr">'+V+' V</span>. احسب فرق الجهد بين طرفي كل مقاومة.'}[type];
  ch.ans={req:Rq,single:R,current:mode==='series'?I:I/n,voltage:mode==='series'?V/n:V}[type];ch.unit={req:'Ω',single:'Ω',current:'A',voltage:'V'}[type];
  $('chq').innerHTML=q;$('chu').textContent=ch.unit;$('chpw').hidden=type!=='req';$('cha').value='';$('chf').hidden=true;
  Array.prototype.forEach.call(document.querySelectorAll('#chp button'),function(b){b.setAttribute('aria-pressed','false');});
}
$('chp').addEventListener('click',function(e){if(e.target.dataset.p){pk=e.target.dataset.p;Array.prototype.forEach.call(document.querySelectorAll('#chp button'),function(b){b.setAttribute('aria-pressed',b===e.target);});}});
$('chk').addEventListener('click',function(){
  var fb=$('chf'),x=$('cha').value.trim()===''?NaN:num();fb.hidden=false;
  if(isNaN(x)||(ch.type==='req'&&!pk)){fb.className='fb info';fb.textContent=ch.type==='req'?'اختر توقعك واكتب قيمة المقاومة المكافئة أولًا.':'اكتب إجابتك أولًا.';return;}
  var okV=Math.abs(x-ch.ans)<0.01,okP=true;
  if(ch.type==='req')okP=pk===(ch.mode==='series'?'more':'less');
  fb.className='fb '+(okP&&okV?'ok':'no');
  fb.innerHTML=(ch.type==='req'?(okP?'توقعك صحيح. ':'توقعك غير صحيح: ')+(ch.mode==='series'?'على التوالي تكون المقاومة المكافئة أكبر من R.':'على التوازي تكون المقاومة المكافئة أقل من R.')+'<br>':'')+(okV?'حسابك صحيح، أحسنت.':'الحل الصحيح:')+'<span class="ltr" style="display:block;text-align:center">'+sol(ch)+'</span>';
});
$('chn').addEventListener('click',newCh);
$('cha2').addEventListener('click',function(){st.mode=ch.mode;st.n=ch.n;st.same=true;st.Rs=[ch.R,ch.R,ch.R,ch.R];st.V=ch.V;sliders();render();$('circ').scrollIntoView({behavior:'smooth',block:'center'});});
sliders();render();newCh();
})();
