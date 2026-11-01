/* محرك البحث في قاعدة الأسئلة (بدون ذكاء اصطناعي ولا إنترنت) */
var QAEngine=(function(){
  var STOP={ما:1,ماذا:1,هو:1,هي:1,هل:1,ايه:1,اي:1,يعني:1,لماذا:1,ليه:1,ازاي:1,كيف:1,لي:1,لو:1,انا:1,ممكن:1,اشرح:1,شرح:1,عايز:1,عاوز:1,اعرف:1,في:1,من:1,عن:1,كم:1,الي:1,ان:1};
  function norm(s){return String(s).replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace(/[؟?!.,،:؛()«»"'\/×÷=]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();}
  function stem(t){t=t.replace(/^و(?=ال)/,'').replace(/^(بال|لل|ال)/,'');return t;}
  function toks(s){return norm(s).split(' ').map(stem).filter(function(t){return t&&!STOP[t];});}
  function prep(data){return data.map(function(e){var seen={};e._k=e.k.map(function(x){return toks(x);}).filter(function(a){var j=a.join(' ');if(!a.length||seen[j])return false;return seen[j]=1;});e._t=toks(e.t);return e;});}
  function search(q,data){
    var qt=toks(q),set={};qt.forEach(function(t){set[t]=1;});var res=[];
    data.forEach(function(e){var sc=0;
      e._k.forEach(function(a){if(a.every(function(t){return set[t];}))sc+=a.length===1?2:3+a.length;});
      e._t.forEach(function(t){if(set[t])sc+=1;});
      if(sc>0)res.push({e:e,s:sc});});
    res.sort(function(a,b){return b.s-a.s;});
    return {top:res[0]&&res[0].s>=3?res[0].e:null,related:res.slice(res[0]&&res[0].s>=3?1:0,4).filter(function(r){return r.s>=2;}).map(function(r){return r.e;}).slice(0,3)};
  }
  return {norm:norm,prep:prep,search:search};
})();
if(typeof module!=='undefined')module.exports=QAEngine;
