/* الحسابات الفيزيائية مستقلة عن الواجهة (قابلة للاختبار بـ node) */
var Phys=(function(){
  function sum(a){return a.reduce(function(x,y){return x+y;},0);}
  function fmt(x){return String(Math.round(x*100)/100);}
  function current(V,R){return V/R;}
  function series(Rs){return sum(Rs);}
  function parallel(Rs){return 1/sum(Rs.map(function(r){return 1/r;}));}
  function analyze(mode,Rs,V){
    var Req=mode==='series'?series(Rs):parallel(Rs), I=V/Req;
    var br=Rs.map(function(R){return mode==='series'?{R:R,V:I*R,I:I}:{R:R,V:V,I:V/R};});
    return {mode:mode,Req:Req,I:I,V:V,branches:br};
  }
  /* الدوائر المختلطة (مقاومات متماثلة داخل كل مجموعة، بقانونَي R×n وR÷n فقط):
     A = R1 على التوالي مع n مقاومات متماثلة R على التوازي
     B = m فروع متماثلة على التوازي، في كل فرع مقاومتان متماثلتان R على التوالي
     C = مجموعتان على التوالي، في كل مجموعة مقاومتان متماثلتان على التوازي (Ra و Rb) */
  function mixed(t,p,V){
    var Req,I,parts=[],g={};
    if(t==='A'){g.n=p.n;g.p=p.R/p.n;Req=p.R1+g.p;I=V/Req;g.V1=I*p.R1;g.Vg=V-g.V1;g.Ib=I/p.n;
      parts.push({R:p.R1,V:g.V1,I:I});for(var i=0;i<p.n;i++)parts.push({R:p.R,V:g.Vg,I:g.Ib});}
    else if(t==='B'){g.m=p.m;g.Rf=p.R*2;Req=g.Rf/p.m;I=V/Req;g.Ib=I/p.m;g.Vr=V/2;
      for(var j=0;j<p.m*2;j++)parts.push({R:p.R,V:g.Vr,I:g.Ib});}
    else{g.pa=p.Ra/2;g.pb=p.Rb/2;Req=g.pa+g.pb;I=V/Req;g.Va=I*g.pa;g.Vb=I*g.pb;g.Ib=I/2;
      parts.push({R:p.Ra,V:g.Va,I:g.Ib},{R:p.Ra,V:g.Va,I:g.Ib},{R:p.Rb,V:g.Vb,I:g.Ib},{R:p.Rb,V:g.Vb,I:g.Ib});}
    return {t:t,Req:Req,I:I,V:V,parts:parts,g:g};
  }
  /* القدرة والطاقة: P=E/t ، E=P×t ، t=E/P ، 1 kW.h = 3.6×10^6 J */
  var KWH=3.6e6;
  function powerP(E,t){return E/t;}
  function powerE(P,t){return P*t;}
  function powerT(E,P){return E/P;}
  function kwh(Pw,hours){return Pw/1000*hours;}
  function cost(Pw,hPerDay,days,price){var e=kwh(Pw,hPerDay*days);return {kW:Pw/1000,hours:hPerDay*days,E:e,cost:e*price};}
  return {powerP:powerP,powerE:powerE,powerT:powerT,kwh:kwh,cost:cost,KWH:KWH,mixed:mixed,sum:sum,fmt:fmt,current:current,series:series,parallel:parallel,analyze:analyze};
})();
if(typeof module!=='undefined')module.exports=Phys;
