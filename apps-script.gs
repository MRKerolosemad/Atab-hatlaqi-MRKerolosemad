/* استقبال الدرجات في Google Sheet + إرسال إيميل لك + عدّاد زيارات المنصة + تغذية لوحة المتابعة.
   الخطوات في README (قسم «استقبال الدرجات على الإيميل ولوحة المتابعة»). */
var SECRET = 'غيّر-كلمة-السر-هذه';   // كلمة سر لوحة المتابعة (اخترها بنفسك)
var NOTIFY = '';                      // اتركه فارغًا ليصلك الإيميل على بريد حسابك، أو اكتب بريدًا آخر
function safe(v){ v = String(v == null ? '' : v).slice(0, 300); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function visitsSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet(), s = ss.getSheetByName('الزيارات');
  if (!s) { s = ss.insertSheet('الزيارات'); s.appendRow(['الوقت', 'الجهاز (رقم عشوائي مجهول)', 'الصفحة']); }
  return s;
}
function regSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet(), s = ss.getSheetByName('التسجيل');
  if (!s) { s = ss.insertSheet('التسجيل'); s.appendRow(['الوقت', 'الاسم', 'الصف', 'الهاتف', 'رسالة']); }
  return s;
}
function doPost(e){
  var d = JSON.parse(e.postData.contents);
  if (d.type === 'register') {
    var nm = safe(String(d.name).slice(0, 60)), gr = safe(d.grade), ph = safe(String(d.phone).slice(0, 14)), nt = safe(String(d.note).slice(0, 300));
    regSheet().appendRow([new Date(), nm, gr, ph, nt]);
    MailApp.sendEmail(NOTIFY || Session.getEffectiveUser().getEmail(), 'طلب تسجيل جديد: ' + nm, 'الاسم: ' + nm + '\nالصف: ' + gr + '\nالهاتف: ' + (ph || 'لم يكتب') + '\nرسالة: ' + (nt || '—'));
    return ContentService.createTextOutput('ok');
  }
  if (d.type === 'visit') { visitsSheet().appendRow([new Date(), safe(String(d.dev).slice(0, 40)), safe(d.page)]); return ContentService.createTextOutput('ok'); }
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['الوقت','الاسم','الاختبار','الصحيحة','الكلي','النسبة','ناجح','نقاط الضعف']);
  var name = safe(String(d.name).slice(0, 60)), quiz = safe(d.quiz);
  sh.appendRow([new Date(), name, quiz, Number(d.ok) || 0, Number(d.total) || 0, Number(d.pct) || 0, d.passed ? 'نعم' : 'لا', safe(d.weak)]);
  var to = NOTIFY || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, 'نتيجة جديدة: ' + name + ' – ' + (Number(d.pct) || 0) + '%',
    'الاسم: ' + name + '\nالاختبار: ' + quiz + '\nالدرجة: ' + d.ok + ' من ' + d.total + ' (' + d.pct + '%)\nالحالة: ' + (d.passed ? 'ناجح' : 'لم ينجح بعد') + '\nنقاط تحتاج مراجعة: ' + (d.weak || 'لا يوجد'));
  return ContentService.createTextOutput('ok');
}
function visitStats(){
  var v = visitsSheet().getDataRange().getValues(), now = Date.now(), week = 0, uniq = {}, days = {};
  for (var i = 1; i < v.length; i++) {
    var t = new Date(v[i][0]).getTime(); uniq[v[i][1]] = 1;
    if (now - t < 7 * 864e5) { week++; var k = Utilities.formatDate(new Date(t), Session.getScriptTimeZone(), 'yyyy-MM-dd'); days[k] = (days[k] || 0) + 1; }
  }
  return {total: Math.max(0, v.length - 1), week: week, unique: Object.keys(uniq).length, days: days};
}
function doGet(e){
  var out = ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON), p = e.parameter || {};
  if (p.pub) return out.setContent(JSON.stringify({total: visitStats().total}));   // رقم عام فقط (إجمالي الزيارات)
  if (p.key !== SECRET) return out.setContent(JSON.stringify({error: 'denied'}));
  var v = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getDataRange().getValues(), rows = [];
  for (var i = 1; i < v.length; i++) rows.push({time: v[i][0], name: v[i][1], quiz: v[i][2], ok: v[i][3], total: v[i][4], pct: v[i][5], passed: v[i][6] === 'نعم', weak: v[i][7]});
  var rv = regSheet().getDataRange().getValues(), regs = [];
  for (var j = 1; j < rv.length; j++) regs.push({time: rv[j][0], name: rv[j][1], grade: rv[j][2], phone: rv[j][3], note: rv[j][4]});
  return out.setContent(JSON.stringify({rows: rows, visits: visitStats(), regs: regs}));
}
