/* ============================================================
   ui-calm-mode.js — fullscreen ambient view of the aquatic
   background (fish/plants/water) with no UI, for visitors who
   just want to watch, not read.
   ============================================================ */

(function () {
  var btn  = document.getElementById('ar-calm-btn');
  var exit = document.getElementById('ar-calm-exit');
  if (!btn || !exit) return;

  function enter() {
    document.body.classList.add('calm-mode');
    btn.setAttribute('aria-pressed', 'true');
  }
  function leave() {
    document.body.classList.remove('calm-mode');
    btn.setAttribute('aria-pressed', 'false');
  }

  btn.addEventListener('click', enter);
  exit.addEventListener('click', leave);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('calm-mode')) leave();
  });
})();
