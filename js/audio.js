/**
 * نظام المؤثرات الصوتية التفاعلية للعبة منصة أتعب هتلاقي
 * يعتمد بالكامل على Web Audio API دون الحاجة لأي ملفات صوتية خارجية
 */
window.GameAudio = (function() {
  var ctx = null;
  var isMuted = localStorage.getItem('atab_audio_muted') === 'true';

  function getContext() {
    if (!ctx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function playTone(freq, type, duration, startDelay, gainVal) {
    if (isMuted) return;
    try {
      var c = getContext();
      if (!c) return;
      var osc = c.createOscillator();
      var gain = c.createGain();
      var now = c.currentTime + (startDelay || 0);

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainVal || 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch(e) {
      // Audio not permitted or not supported
    }
  }

  return {
    isMuted: function() { return isMuted; },
    toggleMute: function() {
      isMuted = !isMuted;
      localStorage.setItem('atab_audio_muted', isMuted);
      return isMuted;
    },
    click: function() {
      playTone(600, 'sine', 0.05, 0, 0.08);
    },
    correct: function() {
      playTone(523.25, 'triangle', 0.12, 0, 0.15); // C5
      playTone(659.25, 'triangle', 0.15, 0.08, 0.18); // E5
      playTone(783.99, 'triangle', 0.18, 0.16, 0.2); // G5
      playTone(1046.50, 'sine', 0.35, 0.24, 0.22); // C6
    },
    wrong: function() {
      playTone(220, 'sawtooth', 0.18, 0, 0.15);
      playTone(180, 'sawtooth', 0.28, 0.1, 0.18);
    },
    star: function() {
      playTone(880, 'sine', 0.15, 0, 0.18);
      playTone(1318.5, 'triangle', 0.25, 0.1, 0.2);
    },
    win: function() {
      var chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      chords.forEach(function(freq, i) {
        playTone(freq, 'triangle', 0.4, i * 0.09, 0.2);
      });
      setTimeout(function() {
        playTone(1046.50, 'sine', 0.6, 0, 0.22);
        playTone(1318.51, 'sine', 0.8, 0, 0.25);
      }, 500);
    },
    levelUp: function() {
      playTone(440, 'triangle', 0.15, 0, 0.2);
      playTone(554.37, 'triangle', 0.15, 0.12, 0.2);
      playTone(659.25, 'triangle', 0.2, 0.24, 0.2);
      playTone(880, 'triangle', 0.45, 0.36, 0.25);
    }
  };
})();
