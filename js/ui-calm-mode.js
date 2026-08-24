/* ============================================================
   ui-calm-mode.js — fullscreen ambient view of the aquatic
   background (fish/plants/water) with no UI, for visitors who
   just want to watch, not read.

   Ambient sound is opt-in only — no royalty-free track is bundled
   (this session's network egress policy blocked pixabay.com/osf.io/
   doi.org while researching one, and a downloaded audio asset needs
   its own license to be checked and documented, not assumed safe).
   Instead the "underwater" soundscape is synthesised at runtime with
   the Web Audio API: a lowpass-filtered noise bed (continuous water
   rumble) plus randomly-timed short pitched blips (bubbles). No
   external file, no hosting cost, no licensing question, loops
   forever with no seam — and it only ever starts from a real click
   (entering calm mode, or toggling the sound button), which is what
   browser autoplay policy requires for AudioContext anyway.
   ============================================================ */

(function () {
  var btn  = document.getElementById('ar-calm-btn');
  var exit = document.getElementById('ar-calm-exit');
  var soundBtn = document.getElementById('ar-calm-sound');
  if (!btn || !exit) return;

  var SOUND_KEY = 'ar_calm_sound';
  var audioCtx = null, masterGain = null, noiseSource = null, bubbleTimer = null;

  function soundWanted() {
    try { return localStorage.getItem(SOUND_KEY) === 'on'; } catch (e) { return false; }
  }
  function setSoundWanted(on) {
    try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch (e) {}
  }

  function playBubble() {
    if (!audioCtx) return;
    var t = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    osc.type = 'sine';
    var startFreq = 180 + Math.random() * 140;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.3, t + 0.18);
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }
  function scheduleBubble() {
    if (!audioCtx) return;
    bubbleTimer = setTimeout(function () {
      playBubble();
      scheduleBubble();
    }, 2200 + Math.random() * 5200);
  }

  function startAudio() {
    if (audioCtx) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(audioCtx.destination);

    /* Brown-ish noise (integrated white noise) reads as a soft, deep
       "water" rumble rather than hissy white noise — then a low
       lowpass shaves off anything that would read as static. */
    var len = audioCtx.sampleRate * 2;
    var buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    var filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;

    var noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.5;

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();

    scheduleBubble();
  }
  function stopAudio() {
    if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }
    if (noiseSource) { try { noiseSource.stop(); } catch (e) {} noiseSource = null; }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    masterGain = null;
  }

  function setSoundUI(on) {
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function enter() {
    document.body.classList.add('calm-mode');
    btn.setAttribute('aria-pressed', 'true');
    /* Only auto-starts audio if the visitor turned it on last time —
       this click is itself the user gesture AudioContext needs, so
       starting it here (not after an async delay) is what keeps it
       inside browser autoplay rules. */
    if (soundWanted()) { startAudio(); setSoundUI(true); }
  }
  function leave() {
    document.body.classList.remove('calm-mode');
    btn.setAttribute('aria-pressed', 'false');
    stopAudio();
    setSoundUI(false);
  }

  btn.addEventListener('click', enter);
  exit.addEventListener('click', leave);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('calm-mode')) leave();
  });

  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      if (audioCtx) {
        stopAudio();
        setSoundUI(false);
        setSoundWanted(false);
      } else {
        startAudio();
        setSoundUI(true);
        setSoundWanted(true);
      }
    });
  }
})();
