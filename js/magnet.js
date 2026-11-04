/**
 * معمل القوى الكهربية والمغناطيسية - منصة أتعب هتلاقي
 * التفاعل الفيزيائي لتجربة أورستد، المغناطيس الكهربي، ومحاكي الجرس الكهربي
 */
(function() {
  // ---- 1. إدارة التبويبات ----
  window.switchTab = function(idx) {
    for (var i = 1; i <= 4; i++) {
      var btn = document.getElementById('tabBtn' + i);
      var pane = document.getElementById('pane' + i);
      if (btn) btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      if (pane) {
        if (i === idx) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      }
    }
    // إيقاف رنين الجرس إذا غادر الطالب التبويب
    if (idx !== 3 && window.stopBellRinging) {
      window.stopBellRinging();
    }
  };

  // ---- 2. تجربة هانز أورستد ----
  var oerstedState = {
    isClosed: false,
    isReversed: false,
    angle: 0
  };

  window.toggleOerstedSwitch = function() {
    oerstedState.isClosed = !oerstedState.isClosed;
    updateOerstedView();
  };

  window.reverseOerstedCurrent = function() {
    oerstedState.isReversed = !oerstedState.isReversed;
    updateOerstedView();
  };

  function updateOerstedView() {
    var blade = document.getElementById('oerstedSwitchBlade');
    var btnSwitch = document.getElementById('btnOerstedSwitch');
    var bulb = document.getElementById('oerstedBulb');
    var arrows = document.getElementById('oerstedArrows');
    var fieldLines = document.getElementById('oerstedFieldLines');
    var needle = document.getElementById('compassNeedle');
    var angleTxt = document.getElementById('needleAngleTxt');
    var note = document.getElementById('oerstedNote');
    var batText = document.getElementById('oerstedBatText');
    var arr1 = document.getElementById('arr1');
    var arr2 = document.getElementById('arr2');

    // تحديث نص البطارية وأسهم التيار
    if (oerstedState.isReversed) {
      if (batText) batText.textContent = '− بطارية + (معكوسة)';
      if (arr1) arr1.setAttribute('transform', 'rotate(180 230 170)');
      if (arr2) arr2.setAttribute('transform', 'rotate(180 370 170)');
    } else {
      if (batText) batText.textContent = '+ بطارية − (عادية)';
      if (arr1) arr1.removeAttribute('transform');
      if (arr2) arr2.removeAttribute('transform');
    }

    if (oerstedState.isClosed) {
      // المفتاح مغلق
      if (blade) {
        blade.setAttribute('y2', '12');
        blade.setAttribute('x2', '38');
        blade.setAttribute('stroke', 'var(--good)');
      }
      if (btnSwitch) {
        btnSwitch.textContent = 'فتح المفتاح (إيقاف التيار) ⏹️';
        btnSwitch.className = 'btn alt';
      }
      if (bulb) {
        bulb.setAttribute('fill', '#FFD54F');
        bulb.setAttribute('opacity', '1');
      }
      if (arrows) arrows.style.opacity = '1';
      if (fieldLines) fieldLines.style.opacity = '0.9';

      // زاوية الانحراف
      var targetAngle = oerstedState.isReversed ? -50 : 50;
      oerstedState.angle = targetAngle;
      if (needle) needle.style.transform = 'rotate(' + targetAngle + 'deg)';
      if (angleTxt) {
        angleTxt.textContent = (targetAngle > 0 ? '+' : '') + targetAngle + '° (انحرفت نحو ' + (targetAngle > 0 ? 'الشرق' : 'الغرب') + ')';
        angleTxt.style.color = 'var(--good)';
      }

      if (note) {
        note.className = 'fb ok';
        note.innerHTML = '<b>🎉 تجربة ناجحة (استنتاج أورستد):</b> عند غلق الدائرة ومرور التيار الكهربي، تولد حول السلك مجال مغناطيسي أثر على إبرة البوصلة وأدى إلى <b>انحرافها فورًا</b> بمقدار <b>' + Math.abs(targetAngle) + '°</b>. وعند عكس اتجاه التيار انحرفت الإبرة في الاتجاه المعاكس!';
      }

      // صوت خفيف إذا متاح
      if (window.GameAudio && !window.GameAudio.isMuted()) {
        window.GameAudio.click();
      }
    } else {
      // المفتاح مفتوح
      if (blade) {
        blade.setAttribute('y2', '-10');
        blade.setAttribute('x2', '35');
        blade.setAttribute('stroke', 'var(--bad)');
      }
      if (btnSwitch) {
        btnSwitch.textContent = 'غلق المفتاح (تشغيل التيار) ⚡';
        btnSwitch.className = 'btn';
      }
      if (bulb) {
        bulb.setAttribute('fill', '#9E9E9E');
        bulb.setAttribute('opacity', '0.6');
      }
      if (arrows) arrows.style.opacity = '0';
      if (fieldLines) fieldLines.style.opacity = '0';

      oerstedState.angle = 0;
      if (needle) needle.style.transform = 'rotate(0deg)';
      if (angleTxt) {
        angleTxt.textContent = '0° (محور الشمال الطبيعي N)';
        angleTxt.style.color = 'var(--c-i)';
      }

      if (note) {
        note.className = 'fb info';
        note.innerHTML = '<b>💡 الملاحظة العلمية:</b> انقطع التيار الكهربي؛ اختفى المجال المغناطيسي المتولد حول السلك وعادت إبرة البوصلة إلى وضعها الأصلي في اتجاه الشمال الجغرافي للأرض.';
      }
    }
  }

  // ---- 3. معمل المغناطيس الكهربي وونش الخردة ----
  var magState = {
    turns: 20,
    currentFactor: 2, // 1: 1.5V, 2: 3V, 3: 4.5V
    coreType: 'soft-iron',
    isPowered: true,
    mode: 'pins', // 'pins' أو 'crane'
    pinsData: []
  };

  window.setMagnetMode = function(mode) {
    magState.mode = mode;
    var btnPins = document.getElementById('btnModePins');
    var btnCrane = document.getElementById('btnModeCrane');
    if (btnPins) btnPins.setAttribute('aria-pressed', mode === 'pins' ? 'true' : 'false');
    if (btnCrane) btnCrane.setAttribute('aria-pressed', mode === 'crane' ? 'true' : 'false');
    renderPinsArea();
    updateMagnetSim();
  };

  window.toggleMagnetPower = function() {
    magState.isPowered = !magState.isPowered;
    var btn = document.getElementById('btnToggleMagnet');
    if (btn) {
      if (magState.isPowered) {
        btn.textContent = 'فصل التيار الكهربي ⏹️';
        btn.className = 'btn';
      } else {
        btn.textContent = 'توصيل التيار الكهربي ⚡';
        btn.className = 'btn alt';
      }
    }
    updateMagnetSim();
  };

  // رسم لفات الملف النحاسي على المسمار
  function renderCoilTurns(count) {
    var grp = document.getElementById('coilTurnsGroup');
    if (!grp) return;
    grp.innerHTML = '';

    var startX = 260;
    var endX = 490;
    var span = endX - startX;
    var step = span / Math.max(count, 1);

    for (var i = 0; i < count; i++) {
      var x = startX + i * step;
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M ' + x + ' 85 Q ' + (x + 8) + ' 113 ' + x + ' 141');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#D87A2B');
      path.setAttribute('stroke-width', count > 25 ? '4' : '6');
      path.setAttribute('stroke-linecap', 'round');
      grp.appendChild(path);
    }
  }

  // تهيئة عناصر الدبابيس في القاع
  function initPinsData() {
    magState.pinsData = [];
    var totalPins = 30;
    for (var i = 0; i < totalPins; i++) {
      magState.pinsData.push({
        id: i,
        baseLeft: 15 + Math.random() * 70, // النسبة المئوية على العرض
        baseBottom: 8 + Math.random() * 20, // الارتفاع عن القاع
        angle: (Math.random() - 0.5) * 80
      });
    }
  }
  initPinsData();

  function renderPinsArea() {
    var container = document.getElementById('pinsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (magState.mode === 'pins') {
      magState.pinsData.forEach(function(pin) {
        var el = document.createElement('div');
        el.className = 'pin-item';
        el.id = 'pin_' + pin.id;
        el.style.left = pin.baseLeft + '%';
        el.style.bottom = pin.baseBottom + 'px';
        el.style.transform = 'rotate(' + pin.angle + 'deg)';
        container.appendChild(el);
      });
    } else {
      // وضع ونش الخردة
      container.innerHTML = `
        <div id="craneScrapGroup" style="width:100%;height:100%;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end">
          <div id="scrapMetal" style="font-size:36px;transition:all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);position:absolute;bottom:20px;display:flex;gap:12px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3))">
            <span>🚗</span><span>🔩</span><span>⚙️</span><span>🛢️</span><span>🚜</span>
          </div>
          <div style="width:100%;background:#37474F;color:#fff;padding:6px;border-radius:6px;text-align:center;font-weight:700;font-size:13px">
            🚛 شاحنة نقل واستقبال الخردة في ساحة المصنع
          </div>
        </div>
      `;
    }
  }

  window.updateMagnetSim = function() {
    var turnsInp = document.getElementById('turnsRange');
    var curInp = document.getElementById('currentSelect');
    var coreInp = document.getElementById('coreSelect');

    if (turnsInp) magState.turns = parseInt(turnsInp.value, 10);
    if (curInp) magState.currentFactor = parseInt(curInp.value, 10);
    if (coreInp) magState.coreType = coreInp.value;

    // تحديث التسميات
    var turnsVal = document.getElementById('turnsVal');
    if (turnsVal) turnsVal.textContent = magState.turns + ' لفة';

    var magVoltsTxt = document.getElementById('magVoltsTxt');
    if (magVoltsTxt) {
      var v = (magState.currentFactor * 1.5).toFixed(1);
      magVoltsTxt.textContent = v + ' V (' + (magState.currentFactor === 1 ? 'عمود واحد' : magState.currentFactor + ' أعمدة') + ')';
    }

    // تحديث لون ونوع قلب المغناطيس في SVG
    var coreRect = document.getElementById('magCoreRect');
    var coreTip = document.getElementById('magCoreTip');
    if (coreRect && coreTip) {
      if (magState.coreType === 'soft-iron') {
        coreRect.setAttribute('fill', '#78909C');
        coreRect.setAttribute('stroke', '#37474F');
        coreTip.setAttribute('fill', '#546E7A');
      } else if (magState.coreType === 'steel') {
        coreRect.setAttribute('fill', '#37474F');
        coreRect.setAttribute('stroke', '#212121');
        coreTip.setAttribute('fill', '#263238');
      } else if (magState.coreType === 'wood') {
        coreRect.setAttribute('fill', '#8D6E63');
        coreRect.setAttribute('stroke', '#5D4037');
        coreTip.setAttribute('fill', '#6D4C41');
      } else if (magState.coreType === 'air') {
        coreRect.setAttribute('fill', 'none');
        coreRect.setAttribute('stroke', '#90A4AE');
        coreRect.setAttribute('stroke-dasharray', '4 4');
        coreTip.setAttribute('fill', 'none');
        coreTip.setAttribute('stroke', '#90A4AE');
      }
    }

    // إعادة رسم لفات السلك
    renderCoilTurns(magState.turns);

    // حساب القوة المغناطيسية
    var strength = 0;
    var coreFactor = 1.0;
    if (magState.coreType === 'soft-iron') coreFactor = 1.0;
    else if (magState.coreType === 'steel') coreFactor = 0.75;
    else if (magState.coreType === 'air') coreFactor = 0.12;
    else if (magState.coreType === 'wood') coreFactor = 0.0;

    if (magState.isPowered) {
      var turnPct = magState.turns / 35;
      var curPct = magState.currentFactor / 3;
      strength = Math.round(turnPct * curPct * coreFactor * 100);
    } else {
      // لو حديد صلب يحتفظ ببعض المغنطة المؤقتة
      if (magState.coreType === 'steel') {
        strength = 14;
      } else {
        strength = 0;
      }
    }

    // تحديث مؤشر القوة
    var strengthBar = document.getElementById('strengthBar');
    var strengthTxt = document.getElementById('strengthPctTxt');
    if (strengthBar) strengthBar.style.width = strength + '%';
    if (strengthTxt) strengthTxt.textContent = strength + '%';

    // أقطاب المغناطيس
    var poles = document.getElementById('magnetPolesG');
    if (poles) poles.style.opacity = (strength > 10) ? '1' : '0';

    // تطبيق حركة الدبابيس أو ونش الخردة
    var maxPins = Math.round((strength / 100) * 28);

    if (magState.mode === 'pins') {
      magState.pinsData.forEach(function(pin, i) {
        var el = document.getElementById('pin_' + pin.id);
        if (!el) return;
        if (i < maxPins && strength > 0) {
          // منجذب للمسمار (قريب من طرف المسمار في الأعلى)
          var targetX = 65 + (Math.random() - 0.5) * 16;
          var targetY = 120 + (Math.random() - 0.5) * 20;
          el.style.left = targetX + '%';
          el.style.bottom = targetY + 'px';
          el.style.transform = 'rotate(' + ((Math.random() - 0.5) * 60) + 'deg)';
          el.style.backgroundColor = '#FF7043';
        } else {
          // ساقط في القاع
          el.style.left = pin.baseLeft + '%';
          el.style.bottom = pin.baseBottom + 'px';
          el.style.transform = 'rotate(' + pin.angle + 'deg)';
          el.style.backgroundColor = '#78909C';
        }
      });
    } else {
      // وضع ونش الخردة
      var scrap = document.getElementById('scrapMetal');
      if (scrap) {
        if (strength >= 25 && magState.isPowered) {
          // مرفوعة في الهواء عند رأس المغناطيس
          scrap.style.bottom = '110px';
          scrap.style.transform = 'scale(1.15)';
        } else {
          // تسقط في الشاحنة
          scrap.style.bottom = '24px';
          scrap.style.transform = 'scale(1.0)';
        }
      }
    }

    // كتابة التقرير العلمي
    var fb = document.getElementById('magnetResultFb');
    if (fb) {
      if (!magState.isPowered) {
        if (magState.coreType === 'steel') {
          fb.className = 'fb info';
          fb.innerHTML = '<b>⚠️ الحديد الصلب يحتفظ بمغناطيسيته:</b> بعد قطع التيار، ظل المغناطيس يجذب القليل من الدبابيس؛ لذلك <b>لا يُفضل الحديد الصلب</b> ويُصنع قلب المغناطيس دائمًا من <b>الحديد المطاوع</b> لأنه يفقد مغناطيسيته بسرعة عند انقطاع التيار.';
        } else {
          fb.className = 'fb ok';
          fb.innerHTML = '<b>✅ انقطع التيار الكهربي (مغناطيس مؤقت):</b> فقد المغناطيس مغناطيسيته تمامًا وسقطت جميع الدبابيس والقطع الحديدية! هذا يثبت لماذا يُسمى المغناطيس الكهربي بـ «المغناطيس المؤقت».';
        }
      } else if (magState.coreType === 'wood') {
        fb.className = 'fb no';
        fb.innerHTML = '<b>❌ الخشب لا يتمغنط:</b> القوة صفر، ولم ينجذب أي دبوس! الخشب مادة غير مغناطيسية، ويلزم قلب من <b>الحديد المطاوع</b> لتركيز خطوط المجال المغناطيسي.';
      } else {
        fb.className = 'fb ok';
        fb.innerHTML = '<b>🧲 مغناطيس كهربي يعمل بنجاح:</b><br>' +
          '• <b>عدد لفات الملف:</b> ' + magState.turns + ' لفة (تناسب طردي).<br>' +
          '• <b>شدة التيار:</b> ' + (magState.currentFactor * 1.5).toFixed(1) + ' فولت.<br>' +
          '• <b>مادة القلب:</b> ' + (magState.coreType === 'soft-iron' ? 'حديد مطاوع (أفضل أداء)' : magState.coreType) + '.<br>' +
          '• <b>النتيجة:</b> القوة المغناطيسية <b>' + strength + '%</b> ' + (magState.mode === 'pins' ? 'وجذب <b>' + maxPins + ' دبوسًا</b>.' : 'ورفع حمولة الخردة بنجاح!');
      }
    }
  };

  // ---- 4. محاكي الجرس الكهربي (رنين متصل) ----
  var bellTimer = null;
  var isBellContinuous = false;
  var bellPhase = 0; // 0: اتصال ولمس، 1: اصطدام وانفصال

  function playBellDing() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var c = new AudioCtx();
      var osc = c.createOscillator();
      var gain = c.createGain();
      var now = c.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  window.startBellRinging = function() {
    if (bellTimer) return;
    var status = document.getElementById('bellStatusFb');
    if (status) {
      status.className = 'fb ok';
      status.innerHTML = '<b>🔔 الجرس يرن الآن (رنين متصل):</b><br>' +
        '1. يتمغنط قلب المغناطيس فيجذب الشريحة المرنة.<br>' +
        '2. تصطدم المطرقة بالناقوس وتنفصل الشريحة عن مسمار التوصيل فتُفتح الدائرة.<br>' +
        '3. يفقد المغناطيس مغناطيسيته المؤقتة فيعيده الزنبرك لموضعه ليغلق الدائرة مجددًا بسرعة فائقة!';
    }

    bellTimer = setInterval(function() {
      var arm = document.getElementById('bellArmatureGroup');
      var spark = document.getElementById('bellSpark');
      var glow = document.getElementById('bellMagGlow');
      var hammer = document.getElementById('bellHammerHead');

      if (bellPhase === 0) {
        // جذب واصطدام
        if (arm) arm.style.transform = 'rotate(10deg)';
        if (spark) spark.classList.add('on');
        if (glow) glow.style.opacity = '1';
        if (hammer) hammer.setAttribute('fill', '#D32F2F');
        playBellDing();
        bellPhase = 1;
      } else {
        // انفصال الدائرة وعودة بالزنبرك
        if (arm) arm.style.transform = 'rotate(0deg)';
        if (spark) spark.classList.remove('on');
        if (glow) glow.style.opacity = '0';
        if (hammer) hammer.setAttribute('fill', '#C23333');
        bellPhase = 0;
      }
    }, 70);
  };

  window.stopBellRinging = function() {
    if (isBellContinuous) return;
    if (bellTimer) {
      clearInterval(bellTimer);
      bellTimer = null;
    }
    var arm = document.getElementById('bellArmatureGroup');
    var spark = document.getElementById('bellSpark');
    var glow = document.getElementById('bellMagGlow');
    if (arm) arm.style.transform = 'rotate(0deg)';
    if (spark) spark.classList.remove('on');
    if (glow) glow.style.opacity = '0';

    var status = document.getElementById('bellStatusFb');
    if (status) {
      status.className = 'fb info';
      status.innerHTML = '<b>💡 توقف الجرس:</b> فُصل زر التشغيل وعادت الشريحة لموضعها الأصلي.';
    }
  };

  window.toggleBellContinuous = function() {
    isBellContinuous = !isBellContinuous;
    var btn = document.getElementById('btnBellToggle');
    if (isBellContinuous) {
      if (btn) {
        btn.textContent = 'إيقاف الرنين ⏹️';
        btn.className = 'btn';
      }
      window.startBellRinging();
    } else {
      if (btn) {
        btn.textContent = 'تشغيل مستمر 🔄';
        btn.className = 'btn alt';
      }
      if (bellTimer) {
        clearInterval(bellTimer);
        bellTimer = null;
      }
      var arm = document.getElementById('bellArmatureGroup');
      var spark = document.getElementById('bellSpark');
      var glow = document.getElementById('bellMagGlow');
      if (arm) arm.style.transform = 'rotate(0deg)';
      if (spark) spark.classList.remove('on');
      if (glow) glow.style.opacity = '0';
    }
  };

  // ---- 5. تحديات المعمل ----
  window.checkLabChallenge = function(q, ans, btn) {
    var fb = document.getElementById('fbChallenge' + q);
    var parent = btn.parentElement;
    var all = parent.querySelectorAll('.opt-btn');
    all.forEach(function(b) { b.style.opacity = '0.7'; });
    btn.style.opacity = '1';
    fb.style.display = 'block';

    if (q === 1) {
      if (ans === 1) {
        btn.style.borderColor = 'var(--good)';
        btn.style.background = 'var(--good-bg)';
        fb.className = 'feedback fb ok';
        fb.innerHTML = '🎉 إجابة عبقرية! كلاهما أقوى من W، لأن X زاد شدة التيار، وY زاد عدد اللفات، وكلا العاملين تناسبهما طردي مع قوة المغناطيس!';
      } else {
        btn.style.borderColor = 'var(--bad)';
        btn.style.background = 'var(--bad-bg)';
        fb.className = 'feedback fb no';
        fb.innerHTML = '❌ غير صحيح! قوة المغناطيس تتأثر بعدد اللفات وشدة التيار معًا بتناسب طردي.';
      }
    } else if (q === 2) {
      if (ans === 1) {
        btn.style.borderColor = 'var(--good)';
        btn.style.background = 'var(--good-bg)';
        fb.className = 'feedback fb ok';
        fb.innerHTML = '🎉 تحليل فيزيائي ممتاز! انفصال الشريحة يقطع التيار فيفقد المغناطيس مغناطيسيته المؤقتة، فيعيدها الزنبرك فورًا.';
      } else {
        btn.style.borderColor = 'var(--bad)';
        btn.style.background = 'var(--bad-bg)';
        fb.className = 'feedback fb no';
        fb.innerHTML = '❌ غير دقيق! السر يكمن في فتح الدائرة الكهربية وفقد المغناطيس لمغناطيسيته وسحب الزنبرك للشريحة.';
      }
    }
  };

  // التهيئة عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    renderPinsArea();
    updateMagnetSim();
  });
})();
