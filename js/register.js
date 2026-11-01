(function(){
var $=function(i){return document.getElementById(i);},C=window.PLATFORM;
$('gr').innerHTML=STAGES.map(function(s){return '<option'+(s.status==='open'?' selected':'')+'>'+s.title+'</option>';}).join('')+'<option>أخرى</option>';
$('note').textContent=C.endpoint?'تُرسل بياناتك إلى أستاذك فقط ولا تُنشر ولا تُشارك مع أي جهة أخرى، ولا نحفظها على جهازك.':'التسجيل يتم عبر رسالة واتساب تكتبها أنت وتضغط إرسال بنفسك. لا يُرسل شيء تلقائيًا.';
function digits(t){return String(t).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace(/\s|-/g,'');}
function get(){return {name:$('nm').value.trim(),grade:$('gr').value,phone:digits($('ph').value),note:$('nt').value.trim()};}
function msg(d){return 'طلب تسجيل في منصة أتعب هتلاقي\nالاسم: '+(d.name||'—')+'\nالصف: '+d.grade+(d.phone?'\nرقم التواصل: '+d.phone:'')+(d.note?'\nرسالة: '+d.note:'');}
function wa(){$('wa').href='https://wa.me/'+C.waNumber+'?text='+encodeURIComponent(msg(get()));}
['nm','gr','ph','nt'].forEach(function(i){$(i).addEventListener('input',wa);$(i).addEventListener('change',wa);});wa();
function valid(){var d=get(),ok=true;
  $('eNm').hidden=d.name.length>=3;if(d.name.length<3){$('eNm').textContent='اكتب اسمك (3 حروف على الأقل).';ok=false;}
  var badPh=d.phone&&!/^(\+?20|0)?1[0125]\d{8}$/.test(d.phone);$('ePh').hidden=!badPh;if(badPh){$('ePh').textContent='رقم الهاتف غير صحيح (مثال: 01012345678).';ok=false;}
  $('eCs').hidden=$('cs').checked;if(!$('cs').checked)ok=false;return ok?d:null;}
$('go').addEventListener('click',function(){
  var d=valid(),st=$('st');if(!d)return;st.hidden=false;
  if(!C.endpoint){st.className='fb info';st.innerHTML='لم يتم تفعيل الإرسال التلقائي بعد. اضغط زر واتساب لإرسال طلبك لأستاذك.';return;}
  $('go').disabled=true;st.className='fb info';st.textContent='جارٍ إرسال طلبك…';
  fetch(C.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({type:'register',name:d.name.slice(0,60),grade:d.grade,phone:d.phone.slice(0,14),note:d.note.slice(0,300)})})
   .then(function(){st.className='fb ok';st.textContent='تم إرسال طلبك إلى أستاذ كيرلس، وسيتواصل معك بإذن الله.';},function(){st.className='fb no';st.textContent='تعذّر الإرسال (تأكد من الإنترنت). جرّب زر واتساب.';$('go').disabled=false;});
});
})();
