/**
 * محرك لعبة خريطة الرحلة التعليمية - مادة العلوم للصف الثالث الإعدادي
 * منصة «أتعب هتلاقي – أستاذ كيرلس عماد»
 */
(function() {
  var DATA = window.JOURNEY_DATA;
  var Audio = window.GameAudio;

  // مفتاح التخزين المحلي
  var STORAGE_KEY = 'atab_journey_save_v1';

  // حالة اللعبة الافتراضية
  var state = {
    playerName: 'بطل العلوم',
    totalPoints: 0,
    stageStars: {}, // { 1: 3, 2: 2, ... }
    stageHighScores: {},
    unlockedStage: 1,
    badges: []
  };

  // حالة المرحلة الحالية أثناء اللعب
  var currentStage = null;
  var currentQIndex = 0;
  var stageCorrectAnswers = 0;
  var stagePointsEarned = 0;
  var currentStreak = 0;
  var isAnswered = false;
  var currentShuffledOptions = [];

  // استرجاع البيانات المحفوظة
  function loadState() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        state = Object.assign(state, parsed);
      } else {
        // فحص ما إذا كان هناك اسم مدخل مسبقًا في صفحة الاختبارات
        var oldName = localStorage.getItem('atab_quiz_name');
        if (oldName) state.playerName = oldName;
      }
    } catch (e) {
      console.warn('Could not load saved state', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save state', e);
    }
  }

  function getRank(totalStars) {
    var ranks = DATA.ranks;
    var currentRank = ranks[0];
    for (var i = 0; i < ranks.length; i++) {
      if (totalStars >= ranks[i].stars) {
        currentRank = ranks[i];
      }
    }
    return currentRank;
  }

  function getTotalStars() {
    var total = 0;
    for (var s in state.stageStars) {
      total += (state.stageStars[s] || 0);
    }
    return total;
  }

  function L(text) {
    return String(text).replace(/\{\{(.*?)\}\}/g, '<span class="ltr">$1</span>');
  }

  // تحديث لوحة تحكم البطل العلوية
  function updateHub() {
    var totalStars = getTotalStars();
    var maxStars = DATA.stages.length * 3;
    var rank = getRank(totalStars);

    var nameEl = document.getElementById('hubPlayerName');
    if (nameEl) nameEl.textContent = state.playerName;

    var rankEl = document.getElementById('hubPlayerRank');
    if (rankEl) {
      rankEl.innerHTML = '<span style="color:' + rank.color + '">' + rank.icon + ' ' + rank.title + '</span>';
    }

    var ptsEl = document.getElementById('hubTotalPoints');
    if (ptsEl) ptsEl.textContent = state.totalPoints.toLocaleString();

    var starsEl = document.getElementById('hubTotalStars');
    if (starsEl) starsEl.textContent = totalStars + ' / ' + maxStars;

    var completedStages = 0;
    for (var i = 1; i <= DATA.stages.length; i++) {
      if ((state.stageStars[i] || 0) > 0) completedStages++;
    }
    var stagesCountEl = document.getElementById('hubCompletedStages');
    if (stagesCountEl) stagesCountEl.textContent = completedStages + ' / ' + DATA.stages.length;

    var fillEl = document.getElementById('hubProgressFill');
    if (fillEl) {
      var pct = Math.min(100, Math.round((totalStars / maxStars) * 100));
      fillEl.style.width = pct + '%';
    }

    var soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.textContent = Audio.isMuted() ? '🔇' : '🔊';
      soundBtn.title = Audio.isMuted() ? 'تشغيل الصوت' : 'كتم الصوت';
    }
  }

  // رسم المسار الكهربي المتعرج والعقد
  function renderMap() {
    var list = document.getElementById('mapStagesList');
    if (!list) return;

    list.innerHTML = '';
    var stages = DATA.stages;

    stages.forEach(function(stg) {
      var starsEarned = state.stageStars[stg.id] || 0;
      var isUnlocked = stg.id <= state.unlockedStage;
      var isCompleted = starsEarned > 0;
      var isCurrent = (stg.id === state.unlockedStage && !isCompleted) || (stg.id === state.unlockedStage);

      var row = document.createElement('div');
      row.className = 'stage-row';

      var nodeBtn = document.createElement('button');
      nodeBtn.type = 'button';
      nodeBtn.className = 'stage-node-btn' + 
        (isCompleted ? ' completed' : '') + 
        (!isUnlocked ? ' locked' : '') + 
        (isCurrent && !isCompleted ? ' current' : '');
      nodeBtn.setAttribute('data-id', stg.id);
      nodeBtn.setAttribute('aria-label', stg.title + (isUnlocked ? '' : ' (مقفل)'));

      if (!isUnlocked) {
        nodeBtn.disabled = true;
      }

      // رقم المرحلة
      var numSpan = document.createElement('span');
      numSpan.className = 'node-num';
      numSpan.textContent = stg.id;
      nodeBtn.appendChild(numSpan);

      // أيقونة المرحلة
      var iconSpan = document.createElement('span');
      iconSpan.className = 'node-icon';
      iconSpan.textContent = stg.icon;
      nodeBtn.appendChild(iconSpan);

      // نجوم المرحلة
      var starsDiv = document.createElement('div');
      starsDiv.className = 'node-stars';
      for (var s = 1; s <= 3; s++) {
        var starItem = document.createElement('span');
        starItem.textContent = '★';
        if (s <= starsEarned) starItem.className = 'earned';
        starsDiv.appendChild(starItem);
      }
      nodeBtn.appendChild(starsDiv);

      // بطاقة تلميح العنوان بجانب المحطة
      var tooltip = document.createElement('div');
      tooltip.className = 'stage-tooltip';
      tooltip.textContent = stg.title;

      row.appendChild(nodeBtn);
      row.appendChild(tooltip);
      list.appendChild(row);

      nodeBtn.addEventListener('click', function() {
        if (!isUnlocked) return;
        Audio.click();
        openStageIntro(stg);
      });
    });

    drawConduits();
  }

  // رسم أسلاك الطاقة التوصيلية بين المحطات
  function drawConduits() {
    var svg = document.getElementById('mapPathSvg');
    var list = document.getElementById('mapStagesList');
    if (!svg || !list) return;

    // إعادة ضبط الحجم
    svg.setAttribute('width', list.offsetWidth);
    svg.setAttribute('height', list.offsetHeight);

    var btns = list.querySelectorAll('.stage-node-btn');
    if (btns.length < 2) return;

    var pathsHtml = '';
    var listRect = list.getBoundingClientRect();

    for (var i = 0; i < btns.length - 1; i++) {
      var b1 = btns[i];
      var b2 = btns[i + 1];

      var r1 = b1.getBoundingClientRect();
      var r2 = b2.getBoundingClientRect();

      var x1 = (r1.left + r1.right) / 2 - listRect.left;
      var y1 = (r1.top + r1.bottom) / 2 - listRect.top;
      var x2 = (r2.left + r2.right) / 2 - listRect.left;
      var y2 = (r2.top + r2.bottom) / 2 - listRect.top;

      var cx1 = x1;
      var cy1 = (y1 + y2) / 2;
      var cx2 = x2;
      var cy2 = (y1 + y2) / 2;

      var d = 'M ' + x1 + ' ' + y1 + ' C ' + cx1 + ' ' + cy1 + ', ' + cx2 + ' ' + cy2 + ', ' + x2 + ' ' + y2;

      var nextStageUnlocked = (i + 2) <= state.unlockedStage;
      var strokeColor = nextStageUnlocked ? '#D4AF37' : '#B0C0D4';
      var strokeWidth = nextStageUnlocked ? '5' : '3';
      var dashArray = nextStageUnlocked ? 'none' : '8,6';

      pathsHtml += '<path d="' + d + '" stroke="' + strokeColor + '" stroke-width="' + strokeWidth + '" stroke-dasharray="' + dashArray + '" fill="none" stroke-linecap="round"/>';
    }

    svg.innerHTML = pathsHtml;
  }

  window.addEventListener('resize', drawConduits);

  // فتح شاشة التحدي للمرحلة
  function openStageIntro(stage) {
    currentStage = stage;
    currentQIndex = 0;
    stageCorrectAnswers = 0;
    stagePointsEarned = 0;
    currentStreak = 0;
    isAnswered = false;

    var modal = document.getElementById('challengeModal');
    var overlay = document.getElementById('modalOverlay');

    document.getElementById('modalStageTag').textContent = 'المرحلة ' + stage.id + ' • ' + stage.subtitle;
    document.getElementById('modalStageTitle').textContent = stage.icon + ' ' + stage.title;
    document.getElementById('modalStageDesc').textContent = stage.summary;

    showQuestionScreen();
    overlay.hidden = false;
  }

  function showQuestionScreen() {
    var q = currentStage.questions[currentQIndex];
    var totalQ = currentStage.questions.length;
    isAnswered = false;

    // شريط تقدم أسئلة المرحلة
    var bar = document.getElementById('modalQProgressBar');
    bar.innerHTML = '';
    for (var i = 0; i < totalQ; i++) {
      var step = document.createElement('div');
      step.className = 'q-step' + (i === currentQIndex ? ' active' : (i < currentQIndex ? ' done' : ''));
      bar.appendChild(step);
    }

    document.getElementById('modalQCounter').textContent = 'المهمة ' + (currentQIndex + 1) + ' من ' + totalQ;
    document.getElementById('modalQText').innerHTML = L(q.q);

    var diagBox = document.getElementById('modalQDiag');
    if (diagBox) {
      if (q.diag) {
        diagBox.innerHTML = q.diag;
        diagBox.hidden = false;
      } else {
        diagBox.innerHTML = '';
        diagBox.hidden = true;
      }
    }

    // التلميح
    var hintContent = document.getElementById('modalHintContent');
    hintContent.textContent = q.hint;
    hintContent.className = 'hint-content';

    // توزيع الخيارات عشوائيًا بالكامل حتى لا تكون الإجابة دائمًا في الخيار الأول
    currentShuffledOptions = q.options.map(function(optText, origIdx) {
      return {
        text: optText,
        isCorrect: (origIdx === q.ans)
      };
    });

    for (var i = currentShuffledOptions.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = currentShuffledOptions[i];
      currentShuffledOptions[i] = currentShuffledOptions[j];
      currentShuffledOptions[j] = temp;
    }

    // خيارات الإجابة
    var optGrid = document.getElementById('modalOptionsGrid');
    optGrid.innerHTML = '';
    var letters = ['أ', 'ب', 'جـ', 'د'];

    currentShuffledOptions.forEach(function(item, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt-btn';
      btn.innerHTML = '<span class="opt-letter">' + letters[idx] + '</span> <span>' + L(item.text) + '</span>';
      
      btn.addEventListener('click', function() {
        if (isAnswered) return;
        chooseAnswer(idx, q);
      });

      optGrid.appendChild(btn);
    });

    document.getElementById('modalExplanationCard').style.display = 'none';
    document.getElementById('modalNextQBtn').style.display = 'none';
  }

  function chooseAnswer(selectedIdx, question) {
    isAnswered = true;
    var isCorrect = currentShuffledOptions[selectedIdx].isCorrect;
    var optBtns = document.querySelectorAll('#modalOptionsGrid .opt-btn');

    optBtns.forEach(function(btn, i) {
      btn.disabled = true;
      if (currentShuffledOptions[i].isCorrect) {
        btn.classList.add('correct');
      } else if (i === selectedIdx) {
        btn.classList.add('incorrect');
      }
    });

    var explCard = document.getElementById('modalExplanationCard');
    explCard.style.display = 'block';
    explCard.className = 'explanation-card ' + (isCorrect ? 'ok' : 'no');

    if (isCorrect) {
      stageCorrectAnswers++;
      currentStreak++;
      var streakBonus = (currentStreak > 1) ? (currentStreak * 25) : 0;
      var earned = 100 + streakBonus;
      stagePointsEarned += earned;

      Audio.correct();
      explCard.innerHTML = '<b>إجابة رائعة وصحيحة! 🎉 (+ ' + earned + ' نقطة)</b><br>' + L(question.explanation);
    } else {
      currentStreak = 0;
      Audio.wrong();
      explCard.innerHTML = '<b>إجابة غير دقيقة 💡</b><br>' + L(question.explanation);
    }

    var nextBtn = document.getElementById('modalNextQBtn');
    nextBtn.style.display = 'block';
    var isLast = (currentQIndex === currentStage.questions.length - 1);
    nextBtn.textContent = isLast ? 'عرض نتائج المرحلة 🏆' : 'المهمة التالية ←';
  }

  function nextQuestionOrFinish() {
    Audio.click();
    if (currentQIndex < currentStage.questions.length - 1) {
      currentQIndex++;
      showQuestionScreen();
    } else {
      finishStage();
    }
  }

  // انتهاء المرحلة واحتساب النجوم
  function finishStage() {
    var totalQ = currentStage.questions.length;
    var pct = Math.round((stageCorrectAnswers / totalQ) * 100);

    var earnedStars = 0;
    if (stageCorrectAnswers === totalQ) {
      earnedStars = 3;
      stagePointsEarned += 150; // بونص 3 نجوم كاملة
    } else if (stageCorrectAnswers >= 2) {
      earnedStars = 2;
      stagePointsEarned += 75;
    } else if (stageCorrectAnswers >= 1) {
      earnedStars = 1;
      stagePointsEarned += 25;
    }

    // حفظ التقدم وتحديث النجوم إذا كانت أفضل
    var prevStars = state.stageStars[currentStage.id] || 0;
    if (earnedStars > prevStars) {
      state.stageStars[currentStage.id] = earnedStars;
    }

    state.totalPoints += stagePointsEarned;

    // فتح المرحلة التالية إذا نال نجمة واحدة على الأقل
    if (earnedStars >= 1 && currentStage.id === state.unlockedStage && state.unlockedStage < DATA.stages.length) {
      state.unlockedStage = currentStage.id + 1;
    }

    // التحقق من الأوسمة
    checkBadges();
    saveState();
    updateHub();
    renderMap();

    // إظهار شاشة التتويج
    showStageCompletionScreen(earnedStars, stagePointsEarned, pct);
  }

  function showStageCompletionScreen(stars, points, pct) {
    document.getElementById('modalChallengeView').style.display = 'none';
    var compView = document.getElementById('modalCompletionView');
    compView.style.display = 'block';

    var titleEl = document.getElementById('compStageTitle');
    var msgEl = document.getElementById('compStageMsg');
    var starsWrap = document.getElementById('compStarsWrap');

    starsWrap.innerHTML = '';
    for (var i = 1; i <= 3; i++) {
      var star = document.createElement('span');
      star.textContent = '★';
      star.className = 'star-anim ' + (i <= stars ? 'active pop' : 'empty pop');
      starsWrap.appendChild(star);
    }

    document.getElementById('compEarnedPoints').textContent = '+ ' + points + ' نقطة';

    if (stars === 3) {
      titleEl.textContent = 'أداء خارق! العلامة الكاملة ⭐⭐⭐';
      msgEl.textContent = 'أتقنت مهمات «' + currentStage.title + '» بكفاءة علمية مذهلة!';
      Audio.win();
      triggerConfetti();
    } else if (stars >= 1) {
      titleEl.textContent = 'أحسنت! اجتزت المرحلة بنجاح 🎉';
      msgEl.textContent = 'حصلت على ' + stars + ' نجوم من 3. يمكنك دائمًا إعادتها لاحقًا للحصول على النجوم الذهبية الثلاث!';
      Audio.levelUp();
    } else {
      titleEl.textContent = 'لا بأس بالمحاولة!';
      msgEl.textContent = '«أتعب تعويض ربنا كبير» — راجع الشروحات وجرب مرة أخرى للوصول إلى النجوم.';
      Audio.wrong();
    }
  }

  // فحص الأوسمة واستحقاقها
  function checkBadges() {
    var totalStars = getTotalStars();
    var b = state.badges;

    function addB(name) {
      if (b.indexOf(name) === -1) {
        b.push(name);
      }
    }

    if (totalStars >= 1) addB('شرارة البداية');
    if ((state.stageStars[1] || 0) >= 1 && (state.stageStars[2] || 0) >= 1) addB('حارس الجهد والتيار');
    if ((state.stageStars[4] || 0) === 3) addB('عبقري أوم');
    if ((state.stageStars[5] || 0) >= 2 && (state.stageStars[6] || 0) >= 2) addB('مهندس الدوائر');
    if ((state.stageStars[7] || 0) >= 1) addB('خبير الطاقة والقدرة');
    if (totalStars >= 24) addB('أسطورة الفيزياء 👑');
  }

  // فتح نافذة الأوسمة
  function openBadgesModal() {
    Audio.click();
    var modal = document.getElementById('badgesModal');
    var grid = document.getElementById('badgesGrid');
    grid.innerHTML = '';

    var allBadges = [
      { name: 'شرارة البداية', icon: '⚡', desc: 'الحصول على أول نجمة في الخريطة' },
      { name: 'حارس الجهد والتيار', icon: '🔋', desc: 'اجتياز مرحلتي شدة التيار وفرق الجهد' },
      { name: 'عبقري أوم', icon: '📐', desc: 'الحصول على 3 نجوم كاملة في معمل قانون أوم' },
      { name: 'مهندس الدوائر', icon: '🔌', desc: 'إتقان توصيل المقاومات والدوائر المختلطة' },
      { name: 'خبير الطاقة والقدرة', icon: '💡', desc: 'إتقان حسابات القدرة والطاقة الكهربية وتكلفة الاستهلاك' },
      { name: 'أسطورة الفيزياء 👑', icon: '🏆', desc: 'جمع 24 نجمة كاملة في كل مراحل الخريطة' }
    ];

    allBadges.forEach(function(item) {
      var isUnlocked = state.badges.indexOf(item.name) !== -1;
      var card = document.createElement('div');
      card.className = 'badge-card' + (isUnlocked ? ' unlocked' : '');
      card.innerHTML = '<span class="b-icon">' + item.icon + '</span>' +
                       '<h4>' + item.name + '</h4>' +
                       '<small>' + item.desc + '</small>' +
                       (isUnlocked ? '<br><b style="color:var(--j-gold);font-size:11px">✓ مُكتسب</b>' : '');
      grid.appendChild(card);
    });

    document.getElementById('modalOverlay').hidden = false;
    document.getElementById('challengeModal').hidden = true;
    document.getElementById('certModal').hidden = true;
    modal.hidden = false;
  }

  // فتح شهادة بطل الخريطة
  function openCertModal() {
    Audio.click();
    var totalStars = getTotalStars();
    var certModal = document.getElementById('certModal');
    var rank = getRank(totalStars);

    document.getElementById('certNameOut').textContent = state.playerName;
    document.getElementById('certStarsOut').textContent = totalStars + ' / ' + (DATA.stages.length * 3);
    document.getElementById('certPtsOut').textContent = state.totalPoints.toLocaleString();
    document.getElementById('certRankOut').textContent = rank.title;
    document.getElementById('certDateOut').textContent = new Date().toLocaleDateString('ar-EG');

    document.getElementById('modalOverlay').hidden = false;
    document.getElementById('challengeModal').hidden = true;
    document.getElementById('badgesModal').hidden = true;
    certModal.hidden = false;
  }

  function closeModal() {
    Audio.click();
    document.getElementById('modalOverlay').hidden = true;
    document.getElementById('challengeModal').hidden = false;
    document.getElementById('challengeModal').style.display = 'flex';
    document.getElementById('modalChallengeView').style.display = 'block';
    document.getElementById('modalCompletionView').style.display = 'none';
    document.getElementById('badgesModal').hidden = true;
    document.getElementById('certModal').hidden = true;
  }

  // تعديل اسم الطالب
  function promptEditName() {
    Audio.click();
    var newName = prompt('اكتب اسمك ثلاثيًا لتسجيله في بطاقة التحدي وشهادة الإنجاز:', state.playerName);
    if (newName && newName.trim()) {
      state.playerName = newName.trim();
      saveState();
      updateHub();
    }
  }

  // إعادة ضبط الرحلة
  function resetJourney() {
    Audio.click();
    if (confirm('هل ترغب حقًا في إعادة رحلة المغامرة من البداية وتصفير النجوم والنقاط؟')) {
      state.totalPoints = 0;
      state.stageStars = {};
      state.stageHighScores = {};
      state.unlockedStage = 1;
      state.badges = [];
      saveState();
      updateHub();
      renderMap();
      alert('تمت إعادة ضبط الرحلة بنجاح. بالتوفيق يا بطل!');
    }
  }

  // محرك الكونفيتي البصري عالي الكفاءة
  function triggerConfetti() {
    var canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var particles = [];
    var colors = ['#D4AF37', '#1F3E78', '#0A8585', '#E9D28A', '#10B981', '#EC4899'];

    for (var i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        r: Math.random() * 6 + 4,
        d: Math.random() * 80 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0
      });
    }

    var animId;
    var startTime = Date.now();

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var allDone = true;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) * 1.5;
        p.x += Math.sin(p.tiltAngle) * 2;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        if (p.y < canvas.height + 20) {
          allDone = false;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      }

      if (!allDone && (Date.now() - startTime < 3500)) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animId);
      }
    }

    draw();
  }

  // التهيئة عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    loadState();
    updateHub();
    renderMap();

    // أزرار التحكم
    var editBtn = document.getElementById('editNameBtn');
    if (editBtn) editBtn.addEventListener('click', promptEditName);

    var soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', function() {
        Audio.toggleMute();
        updateHub();
      });
    }

    var resetBtn = document.getElementById('resetJourneyBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetJourney);

    var badgesBtn = document.getElementById('viewBadgesBtn');
    if (badgesBtn) badgesBtn.addEventListener('click', openBadgesModal);

    var certBtn = document.getElementById('viewCertBtn');
    if (certBtn) certBtn.addEventListener('click', openCertModal);

    var closeBtns = document.querySelectorAll('.close-modal-trigger');
    closeBtns.forEach(function(b) {
      b.addEventListener('click', closeModal);
    });

    var hintBtn = document.getElementById('modalHintToggleBtn');
    if (hintBtn) {
      hintBtn.addEventListener('click', function() {
        Audio.click();
        var h = document.getElementById('modalHintContent');
        h.classList.toggle('show');
      });
    }

    var nextBtn = document.getElementById('modalNextQBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', nextQuestionOrFinish);
    }

    var replayBtn = document.getElementById('compReplayBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', function() {
        Audio.click();
        openStageIntro(currentStage);
      });
    }

    var nextStageBtn = document.getElementById('compNextStageBtn');
    if (nextStageBtn) {
      nextStageBtn.addEventListener('click', function() {
        Audio.click();
        closeModal();
      });
    }

    var printCertBtn = document.getElementById('printJourneyCertBtn');
    if (printCertBtn) {
      printCertBtn.addEventListener('click', function() {
        document.body.classList.add('printing-diploma');
        window.print();
        setTimeout(function() {
          document.body.classList.remove('printing-diploma');
        }, 1200);
      });
    }
  });

})();
