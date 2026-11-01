/* مثلثات القوانين التفاعلية. لإضافة مثلث: أضف عنصرًا في TRIS (top=القمة، l=يسار، r=يمين).
   القاعدة: القمة = اليسار × اليمين. غطِّ المجهول: إن بقي الاثنان جنب بعض اضرب، وإن بقي أحدهما فوق الآخر اقسم.
   مفتاح الحفظ: الحرف الكبير في الكلمة هو القمة. */
window.TRIS=[
 {id:'ohm',name:'قانون أوم',key:'VRi',ar:'فري',top:['V','فرق الجهد','فولت V'],l:['I','شدة التيار','أمبير A'],r:['R','المقاومة','أوم Ω']},
 {id:'power',name:'القدرة الكهربية',key:'pEt',ar:'بيت',top:['E','الطاقة','جول J'],l:['t','الزمن','ثانية s'],r:['P','القدرة','وات W']},
 {id:'charge',name:'شدة التيار والشحنة',key:'Qit',ar:'كِت',top:['Q','الشحنة','كولوم C'],l:['t','الزمن','ثانية s'],r:['I','شدة التيار','أمبير A']},
 {id:'pd',name:'فرق الجهد والشغل',key:'Wqv',ar:'وقف (و ق ف)',top:['W','الشغل (الطاقة)','جول J'],l:['Q','الشحنة','كولوم C'],r:['V','فرق الجهد','فولت V']},
 {id:'series',name:'المقاومة المكافئة على التوالي',key:'Mrn',ar:'مرن',top:['R′','المقاومة المكافئة','أوم Ω'],l:['R','المقاومة الواحدة','أوم Ω'],r:['n','عدد المقاومات','']},
 {id:'parallel',name:'المقاومة المكافئة على التوازي',key:'mRn',ar:'مرن',top:['R','المقاومة الواحدة','أوم Ω'],l:['R′','المقاومة المكافئة','أوم Ω'],r:['n','عدد المقاومات','']}
];
window.Tri={
  mount:function(id,tid,opt){
    var T=window.TRIS.filter(function(x){return x.id===tid;})[0],el=document.getElementById(id),sel=-1;if(!T||!el)return;
    var cells=[T.top,T.l,T.r];
    function formula(i){var t=T.top[0],a=T.l[0],b=T.r[0];if(i===0)return t+' = '+a+' × '+b;if(i===1)return a+' = '+t+' ÷ '+b;return b+' = '+t+' ÷ '+a;}
    function draw(){
      var pos=[[120,70],[82,150],[160,150]],h='<svg viewBox="0 0 240 200" class="tri-svg" role="group" aria-label="مثلث '+T.name+'"><polygon points="120,8 232,192 8,192" class="tri-p"/><line x1="59" y1="108" x2="181" y2="108" class="tri-l"/><line x1="120" y1="108" x2="120" y2="192" class="tri-l"/>';
      cells.forEach(function(c,i){var p=pos[i],hide=(sel===i),hit=i===0?'<polygon points="120,12 180,108 60,108" class="tri-h"/>':(i===1?'<polygon points="60,108 120,108 120,192 10,192" class="tri-h"/>':'<polygon points="120,108 180,108 230,192 120,192" class="tri-h"/>');
        h+='<g class="tri-c'+(hide?' on':'')+'" data-i="'+i+'" tabindex="0" role="button" aria-label="'+c[1]+(hide?' (المجهول)':'')+'" aria-pressed="'+hide+'">'+hit+'<text x="'+p[0]+'" y="'+(p[1]+6)+'" text-anchor="middle" class="tri-s">'+(hide?'؟':c[0])+'</text><text x="'+p[0]+'" y="'+(p[1]+24)+'" text-anchor="middle" class="tri-u">'+c[2]+'</text></g>';});
      h+='</svg><div class="tri-f ltr" aria-live="polite">'+(sel<0?'<span class="tri-hint">اضغط على الخانة المجهولة</span>':formula(sel))+'</div><div class="tri-k">مفتاح الحفظ: <b class="ltr">'+T.key+'</b> ← «'+T.ar+'» (الحرف الكبير هو القمة)</div>';
      el.innerHTML='<div class="tri-box"><h3>'+T.name+'</h3>'+h+'</div>';
    }
    el.addEventListener('click',function(e){var g=e.target.closest('.tri-c');if(!g)return;var i=+g.dataset.i;sel=(sel===i?-1:i);draw();});
    el.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.closest('.tri-c')){e.preventDefault();var i=+e.target.closest('.tri-c').dataset.i;sel=(sel===i?-1:i);draw();var g=el.querySelector('.tri-c[data-i="'+i+'"]');if(g)g.focus();}});
    draw();
  }
};
