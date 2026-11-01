/**
 * محرك العالم العلمي التفاعلي (Interactive Science Universe)
 * يدعم الماوس واللمس (Pointer Events)، تأثير البارالاكس، فيزياء تنافر الجزيئات، وموجات الصدمة الضوئية
 */
(function() {
  var canvas = document.getElementById('universeCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var hero = document.getElementById('scienceUniverseHero');
  var atomStage = document.getElementById('atomStage');
  var atom3D = document.getElementById('atom3D');

  // الكشف عن رغبة تقليل الحركة
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var width = 0;
  var height = 0;
  var particles = [];
  var shockwaves = [];
  var animFrameId = null;
  var isTabActive = true;

  // حالة المؤشر (ماوس أو لمس)
  var pointer = {
    x: -9999,
    y: -9999,
    active: false,
    radius: 120
  };

  // زوايا البارالاكس مع التنعيم (Interpolation / Lerp)
  var targetTiltX = 0;
  var targetTiltY = 0;
  var currentTiltX = 0;
  var currentTiltY = 0;

  // ألوان الجزيئات العلمية
  var particleColors = [
    'rgba(0, 240, 255, 0.75)',   // أزرق سماوي كهربي
    'rgba(212, 175, 55, 0.75)',  // ذهبي براق
    'rgba(96, 165, 250, 0.75)',  // أزرق نيون
    'rgba(255, 255, 255, 0.8)',   // أبيض ناصع
    'rgba(251, 191, 36, 0.65)'   // كهرماني
  ];

  function resize() {
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    var dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initParticles();
  }

  function initParticles() {
    particles = [];
    var isMobile = width < 768;
    var count = isMobile ? 35 : 70;
    if (prefersReducedMotion) count = 15;

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2.5 + 1.2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        alpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  // إنشاء موجة ضوئية منبثقة (Shockwave Energy Pulse)
  function createShockwave(originX, originY) {
    shockwaves.push({
      x: originX,
      y: originY,
      radius: 10,
      maxRadius: Math.min(width, height) * 0.65,
      alpha: 1,
      speed: 6.5,
      color: '#00F0FF'
    });

    // إطلاق سحابة من الشرر اللامع حول النواة
    for (var i = 0; i < 18; i++) {
      var angle = (Math.PI * 2 / 18) * i;
      var speed = Math.random() * 3.5 + 2;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: '#FDE047',
        alpha: 1,
        isSpark: true,
        life: 1
      });
    }

    if (window.GameAudio && !window.GameAudio.isMuted()) {
      window.GameAudio.star();
    }
  }

  // حلقة الرسم والتحريك (Render Loop)
  function loop() {
    if (!isTabActive) return;

    ctx.clearRect(0, 0, width, height);

    // تنعيم حركة البارالاكس للذرة
    if (!prefersReducedMotion && atom3D) {
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      atom3D.style.transform = 'rotateX(' + currentTiltX.toFixed(2) + 'deg) rotateY(' + currentTiltY.toFixed(2) + 'deg)';
    }

    // رسم وتحديث موجات الطاقة
    for (var s = shockwaves.length - 1; s >= 0; s--) {
      var sw = shockwaves[s];
      sw.radius += sw.speed;
      sw.alpha -= 0.018;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(s, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 18;
      ctx.shadowColor = sw.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // رسم وتحديث حركة الجزيئات مع فيزياء التنافر
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];

      if (p.isSpark) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        p.alpha = Math.max(0, p.life);

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        continue;
      }

      if (!prefersReducedMotion) {
        p.x += p.vx;
        p.y += p.vy;

        // ارتداد لطيف عند الحواف
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // تنافر طبيعي ناعم عند اقتراب مؤشر الماوس أو اللمس
        if (pointer.active) {
          var dx = p.x - pointer.x;
          var dy = p.y - pointer.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < pointer.radius && dist > 0) {
            var force = (pointer.radius - dist) / pointer.radius;
            var steerX = (dx / dist) * force * 3.5;
            var steerY = (dy / dist) * force * 3.5;
            p.x += steerX;
            p.y += steerY;
          }
        }

        // نبض البريق
        p.pulseVal += p.pulseSpeed;
        p.alpha = 0.35 + Math.sin(p.pulseVal) * 0.3;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    animFrameId = requestAnimationFrame(loop);
  }

  // تتبع الماوس واللمس عبر Pointer Events الموحدة
  function handlePointerMove(e) {
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    var px = e.clientX - rect.left;
    var py = e.clientY - rect.top;

    pointer.x = px;
    pointer.y = py;
    pointer.active = true;

    // حساب زوايا البارالاكس بالنسبة لمركز البطل
    var centerX = rect.width / 2;
    var centerY = 180; // مركز الذرة التقريبي

    var normX = (px - centerX) / (rect.width / 2);
    var normY = (py - centerY) / 200;

    normX = Math.max(-1, Math.min(1, normX));
    normY = Math.max(-1, Math.min(1, normY));

    targetTiltY = normX * 22;  // دوران حول محور Y
    targetTiltX = -normY * 18; // دوران حول محور X
  }

  function handlePointerLeave() {
    pointer.active = false;
    targetTiltX = 0;
    targetTiltY = 0;
  }

  function handleAtomTrigger(e) {
    if (e) {
      e.preventDefault();
    }
    if (!atomStage || !hero) return;
    var rect = atomStage.getBoundingClientRect();
    var heroRect = hero.getBoundingClientRect();
    var originX = (rect.left + rect.right) / 2 - heroRect.left;
    var originY = (rect.top + rect.bottom) / 2 - heroRect.top;

    createShockwave(originX, originY);
  }

  // تشغيل وإيقاف التحريك عند التبديل بين التبويبات لتوفير البطارية والمعالج
  function handleVisibilityChange() {
    if (document.hidden) {
      isTabActive = false;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    } else {
      isTabActive = true;
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(loop);
      }
    }
  }

  // التهيئة وربط الأحداث
  function init() {
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (hero) {
      hero.addEventListener('pointermove', handlePointerMove, { passive: true });
      hero.addEventListener('pointerleave', handlePointerLeave, { passive: true });
      hero.addEventListener('pointercancel', handlePointerLeave, { passive: true });
    }

    if (atomStage) {
      atomStage.addEventListener('pointerdown', handleAtomTrigger);
      // دعم إمكانية الوصول بلوحة المفاتيح
      atomStage.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAtomTrigger();
        }
      });
    }

    resize();
    animFrameId = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
