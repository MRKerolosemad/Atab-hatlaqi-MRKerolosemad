/* تخزين النقاط والنجوم على جهاز الطالب فقط (بدون اسم). يعمل مع localStorage أو عبر الصفحة الأم في النسخة المنفردة */
window.Store={
  get:function(){if(window.__ATAB)return window.__ATAB;try{return JSON.parse(localStorage.getItem('atab')||'{}');}catch(e){return {};}},
  set:function(o){window.__ATAB=o;try{localStorage.setItem('atab',JSON.stringify(o));}catch(e){}try{if(parent!==window)parent.postMessage({save:o},'*');}catch(e){}}
};
