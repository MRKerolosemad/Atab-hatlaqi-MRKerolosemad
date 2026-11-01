(function(){
var $=function(i){return document.getElementById(i);},P=Phys,f=P.fmt,SUB=['₁','₂','₃','₄','₅','₆'];
var EX=[{t:'A',R1:4,R:12,n:3,V:12},{t:'B',R:3,m:2,V:12},{t:'C',Ra:6,Rb:4,V:10}];
var st={t:'A',R1:4,R:12,n:3,m:2,Ra:6,Rb:4,V:12};
function prm(){return st.t==='A'?{R1:st.R1,R:st.R,n:st.n}:st.t==='B'?{R:st.R,m:st.m}:{Ra:st.Ra,Rb:st.Rb};}
function box(cx,y,w,txt){return '<rect class="bgf" x="'+(cx-w/2-4)+'" y="'+(y-18)+'" width="'+(w+8)+'" height="36"/><rect class="rb" x="'+(cx-w/2)+'" y="'+(y-15)+'" width="'+w+'" height="30" rx="6"/><text x="'+cx+'" y="'+(y+4)+'" text-anchor="middle" font-size="11">'+txt+'</text>';}
function bat(){return '<rect class="bgf" x="14" y="126" width="52" height="46"/><line class="pl" x1="20" y1="136" x2="60" y2="136" stroke-width="4"/><line class="pl" x1="30" y1="154" x2="50" y2="154" stroke-width="7"/><text class="cap" x="72" y="140">+</text><text class="cap" x="72" y="164">−</text>';}
function cur(x,y,v){return '<text class="ci" x="'+x+'" y="'+y+'" font-size="11">I='+f(v)+'A</text>';}
function ysFor(k,a,b){var r=[];for(var i=0;i<k;i++)r.push(k===1?(a+b)/2:a+i*(b-a)/(k-1));return r;}
function draw(r){
  var s=bat(),pt=r.parts,g=r.g,i;
  if(st.t==='A'){
    var ys=ysFor(st.n,100,210),yl=ys[ys.length-1];
    s+='<path class="w" d="M40 130 V50 H200 V'+yl+' M380 '+ys[0]+' V'+yl+' V250 H40 V170'+ys.map(function(y){return ' M200 '+y+' H380';}).join('')+'"/>'+box(120,50,70,'R₁='+f(st.R1)+'Ω')+cur(80,36,r.I);
    ys.forEach(function(y,k){s+=box(290,y,76,'R'+SUB[k+1]+'='+f(st.R)+'Ω')+cur(206,y-8,g.Ib);});
  }else if(st.t==='B'){
    var yb=ysFor(st.m,85,215),ye=yb[yb.length-1];
    s+='<path class="w" d="M40 130 V'+yb[0]+' H100 V'+ye+' M350 '+yb[0]+' V'+ye+' V262 H40 V170'+yb.map(function(y){return ' M100 '+y+' H350';}).join('')+'"/>';
    yb.forEach(function(y,k){s+=box(170,y,66,'R'+SUB[2*k]+'='+f(st.R)+'Ω')+box(285,y,66,'R'+SUB[2*k+1]+'='+f(st.R)+'Ω')+cur(104,y-22,g.Ib);});
  }else{
    s+='<path class="w" d="M40 130 V90 H70 V170 M70 90 H190 M70 170 H190 M190 90 V170 M190 130 H230 M230 90 V170 M230 90 H350 M230 170 H350 M350 90 V170 M350 130 H395 V250 H40 V170"/>'+box(130,90,56,'R₁='+f(st.Ra)+'Ω')+box(130,170,56,'R₂='+f(st.Ra)+'Ω')+box(290,90,56,'R₃='+f(st.Rb)+'Ω')+box(290,170,56,'R₄='+f(st.Rb)+'Ω');
    s+=cur(74,76,g.Ib)+cur(74,156,g.Ib)+cur(234,76,g.Ib)+cur(234,156,g.Ib);
  }
  s+='<text class="ci" x="210" y="283" text-anchor="middle" font-size="14">I = '+f(r.I)+' A &#160; V = '+st.V+' V</text>';
  $('circ').innerHTML=s;
}
function steps(r){
  var g=r.g,V=st.V,h;
  if(st.t==='A')h=[['المجموعة المتوازية ('+st.n+' مقاومات متماثلة)','R₂₃ = R ÷ n = '+f(st.R)+' ÷ '+st.n+' = '+f(g.p)+' Ω'],['المقاومة المكافئة (توالٍ)','R̃ = R₁ + R₂₃ = '+f(st.R1)+' + '+f(g.p)+' = '+f(r.Req)+' Ω'],['التيار الكلي','I = V ÷ R̃ = '+V+' ÷ '+f(r.Req)+' = '+f(r.I)+' A'],['الجهد على R₁','V₁ = I × R₁ = '+f(r.I)+' × '+f(st.R1)+' = '+f(g.V1)+' V'],['الجهد على المجموعة المتوازية (يساوي جهد كل مقاومة فيها)','V₂₃ = V − V₁ = '+V+' − '+f(g.V1)+' = '+f(g.Vg)+' V'],['التيار في كل مقاومة متوازية','I₂ = I ÷ n = '+f(r.I)+' ÷ '+st.n+' = '+f(g.Ib)+' A'],['التحقق','V₁ + V₂₃ = '+f(g.V1+g.Vg)+' V = V ✓']];
  else if(st.t==='B')h=[['كل فرع: مقاومتان متماثلتان على التوالي','R_فرع = R × n = '+f(st.R)+' × 2 = '+f(g.Rf)+' Ω'],['الفروع المتماثلة على التوازي ('+st.m+' فروع)','R̃ = R_فرع ÷ m = '+f(g.Rf)+' ÷ '+st.m+' = '+f(r.Req)+' Ω'],['التيار الكلي','I = V ÷ R̃ = '+V+' ÷ '+f(r.Req)+' = '+f(r.I)+' A'],['التيار في كل فرع (وهو نفسه في كل مقاومة داخله)','I_فرع = I ÷ m = '+f(r.I)+' ÷ '+st.m+' = '+f(g.Ib)+' A'],['الجهد على كل مقاومة (توالٍ داخل الفرع)','V₁ = V ÷ 2 = '+V+' ÷ 2 = '+f(g.Vr)+' V'],['التحقق','V₁ + V₂ = '+f(2*g.Vr)+' V = V ✓']];
  else h=[['المجموعة الأولى (مقاومتان متماثلتان على التوازي)','R₁₂ = R ÷ n = '+f(st.Ra)+' ÷ 2 = '+f(g.pa)+' Ω'],['المجموعة الثانية','R₃₄ = '+f(st.Rb)+' ÷ 2 = '+f(g.pb)+' Ω'],['المقاومة المكافئة (توالٍ)','R̃ = R₁₂ + R₃₄ = '+f(g.pa)+' + '+f(g.pb)+' = '+f(r.Req)+' Ω'],['التيار الكلي','I = V ÷ R̃ = '+V+' ÷ '+f(r.Req)+' = '+f(r.I)+' A'],['الجهد على كل مجموعة','V₁₂ = I × R₁₂ = '+f(g.Va)+' V ، V₃₄ = I × R₃₄ = '+f(g.Vb)+' V'],['التيار في كل مقاومة','I = '+f(r.I)+' ÷ 2 = '+f(g.Ib)+' A'],['التحقق','V₁₂ + V₃₄ = '+f(g.Va+g.Vb)+' V = V ✓']];
  $('steps').innerHTML=h.map(function(x){return '<li>'+x[0]+':<span class="f">'+x[1]+'</span></li>';}).join('');
}
function seg(id,vals,cur,key,label){return '<span class="lbl">'+label+'</span><div class="seg" id="'+id+'">'+vals.map(function(v){return '<button type="button" data-k="'+key+'" data-v="'+v+'" aria-pressed="'+(v===cur)+'">'+v+'</button>';}).join('')+'</div>';}
function sl(id,key,label,max){return '<div class="srow" style="margin-top:10px"><label for="'+id+'"><span>'+label+'</span><span class="badge ltr" id="b'+id+'">'+f(st[key])+' Ω</span></label><input type="range" id="'+id+'" data-k="'+key+'" min="1" max="'+max+'" value="'+st[key]+'"></div>';}
function ctrls(){
  var h=st.t==='A'?sl('x1','R1','المقاومة R₁',40)+sl('x2','R','المقاومة الواحدة R (في المجموعة المتوازية)',60)+seg('sn',[2,3],st.n,'n','عدد المقاومات المتوازية n')
   :st.t==='B'?sl('x2','R','المقاومة الواحدة R (كل المقاومات متماثلة)',40)+seg('sm',[2,3],st.m,'m','عدد الفروع المتوازية m')
   :sl('x3','Ra','قيمة كل مقاومة في المجموعة الأولى',40)+sl('x4','Rb','قيمة كل مقاومة في المجموعة الثانية',40);
  $('rs').innerHTML=h;
  Array.prototype.forEach.call($('rs').querySelectorAll('input'),function(e){e.addEventListener('input',function(){st[e.dataset.k]=+e.value;$('b'+e.id).textContent=f(+e.value)+' Ω';render();});});
  Array.prototype.forEach.call($('rs').querySelectorAll('.seg button'),function(b){b.addEventListener('click',function(){st[b.dataset.k]=+b.dataset.v;ctrls();render();});});
}
function render(){
  var r=P.mixed(st.t,prm(),st.V);
  Array.prototype.forEach.call(document.querySelectorAll('#top button'),function(b){b.setAttribute('aria-pressed',b.dataset.t===st.t);});
  $('bV').textContent=st.V+' V';$('sv').value=st.V;
  $('tReq').textContent=f(r.Req)+' Ω';$('tI').textContent=f(r.I)+' A';$('tV').textContent=st.V+' V';
  $('tb').innerHTML=r.parts.map(function(b,i){return '<tr><td>R'+SUB[i]+'</td><td>'+f(b.R)+'</td><td>'+f(b.V)+'</td><td>'+f(b.I)+'</td></tr>';}).join('');
  draw(r);steps(r);
}
$('top').addEventListener('click',function(e){var b=e.target.closest('button');if(b&&b.dataset.t){st.t=b.dataset.t;ctrls();render();}});
$('ex').addEventListener('click',function(e){if(e.target.dataset.e!==undefined){var x=EX[+e.target.dataset.e];for(var k in x)st[k]=x[k];ctrls();render();}});
$('sv').addEventListener('input',function(e){st.V=+e.target.value;render();});
/* التحدي */
var CH=[{t:'A',R1:2,R:6,n:3,V:12},{t:'A',R1:10,R:20,n:2,V:30},{t:'B',R:2,m:2,V:12},{t:'B',R:5,m:2,V:20},{t:'B',R:6,m:3,V:12},{t:'C',Ra:6,Rb:6,V:12},{t:'C',Ra:4,Rb:8,V:12}],last=-1,ch=null;
function desc(c){return c.t==='A'?'مقاومة <span class="ltr">R₁ = '+c.R1+' Ω</span> على التوالي مع '+c.n+' مقاومات متماثلة قيمة كل منها <span class="ltr">'+c.R+' Ω</span> موصلة على التوازي':c.t==='B'?c.m+' فروع متماثلة على التوازي، في كل فرع مقاومتان متماثلتان قيمة كل منهما <span class="ltr">'+c.R+' Ω</span> على التوالي':'مجموعتان على التوالي، في كل مجموعة مقاومتان متماثلتان على التوازي، قيمة كل مقاومة في الأولى <span class="ltr">'+c.Ra+' Ω</span> وفي الثانية <span class="ltr">'+c.Rb+' Ω</span>';}
function newCh(){var k;do{k=Math.floor(Math.random()*CH.length);}while(k===last);last=k;ch=CH[k];var p=ch.t==='A'?{R1:ch.R1,R:ch.R,n:ch.n}:ch.t==='B'?{R:ch.R,m:ch.m}:{Ra:ch.Ra,Rb:ch.Rb},r=P.mixed(ch.t,p,ch.V);
  ch.kind=Math.random()<.5?'req':'I';ch.ans=ch.kind==='req'?r.Req:r.I;
  $('chq').innerHTML='دائرة: '+desc(ch)+(ch.kind==='req'?'. احسب المقاومة المكافئة.':' مع مصدر <span class="ltr">'+ch.V+' V</span>. احسب شدة التيار الكلي.');
  $('cu').textContent=ch.kind==='req'?'Ω':'A';$('cha').value='';$('chf').hidden=true;}
$('chk').addEventListener('click',function(){var fb=$('chf'),x=Number($('cha').value.replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace('٫','.').replace(',','.'));fb.hidden=false;
  if(!$('cha').value.trim()||isNaN(x)){fb.className='fb info';fb.textContent='اكتب إجابتك أولًا.';return;}
  var ok=Math.abs(x-ch.ans)<0.01;fb.className='fb '+(ok?'ok':'no');fb.innerHTML=(ok?'إجابة صحيحة، أحسنت!':'ليست صحيحة. الإجابة الصحيحة:')+' <span class="ltr">'+f(ch.ans)+' '+(ch.kind==='req'?'Ω':'A')+'</span><br>جرّب الشكل نفسه في المعمل بالأعلى لترى الخطوات.';});
$('chn').addEventListener('click',newCh);
ctrls();render();newCh();
})();
