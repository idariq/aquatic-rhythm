/* ============================================================
   ui-settings.js
   Extracted from js/ui.js (PR #233) — behaviour unchanged.
   Settings panel: fauna/flora sync, motion, units, analytics opt-out, PWA install.
   ============================================================ */

/* ── SETTINGS PANEL ── */
(function () {
  var panel    = document.getElementById('ar-settings-panel');
  var backdrop = document.getElementById('ar-settings-backdrop');
  var openBtn  = document.getElementById('ar-settings-btn');
  var closeBtn = document.getElementById('ar-settings-close');
  var GA_ID    = 'G-8MDN065WNW';
  if (!panel || !openBtn) return;

  var stgFauna     = document.getElementById('stg-fauna');
  var stgFlora     = document.getElementById('stg-flora');
  var stgMotion    = document.getElementById('stg-motion');
  var stgAnalytics = document.getElementById('stg-analytics');
  var stgWcDays    = document.getElementById('stg-wc-days');

  /* body{overflow:hidden} alone is a known cross-browser trap on
     mobile: on some Android WebViews/embedded browsers it doesn't just
     block background scroll, it also stops touch-scroll from reaching
     this panel's own overflow-y:auto — the whole page becomes
     untouchable, panel included. position:fixed + restoring scroll
     position on close is the standard robust fix. */
  var scrollLockY = 0;
  function lockBodyScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.width = '100%';
  }
  function unlockBodyScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockY);
  }

  function openPanel() {
    panel.classList.add('open');
    panel.removeAttribute('aria-hidden');
    if (backdrop) { backdrop.classList.add('open'); backdrop.removeAttribute('aria-hidden'); }
    openBtn.setAttribute('aria-expanded', 'true');
    lockBodyScroll();
    try { syncToggles(); } catch (e) {}
    /* Re-render so the language links carry whichever SPA tab is
       currently open, not just the tab that was active on page load. */
    try { renderLangSection(); } catch (e) {}
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); }
    openBtn.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();
    openBtn.focus();
  }

  openBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (backdrop) backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  /* ── Back-button intercept ──
     Without this, Android back (hardware/gesture) exits the page
     entirely instead of just closing the panel — same pattern as
     js/rhyssa-fab-ext.js's chat sheet. */
  var stgInHistory = false;
  new MutationObserver(function () {
    var open = panel.classList.contains('open');
    if (open && !stgInHistory) {
      stgInHistory = true;
      history.pushState({ settingsPanel: true }, '');
    } else if (!open && stgInHistory) {
      history.back();
    }
  }).observe(panel, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('popstate', function () {
    if (!stgInHistory) return;
    stgInHistory = false;
    window.__rhSuppressSpaNav = true;
    if (panel.classList.contains('open')) closePanel();
  }, true);

  /* close panel when navigating via embedded links */
  panel.querySelectorAll('[data-page],[data-kofi-open]').forEach(function (el) {
    el.addEventListener('click', closePanel);
  });

  /* ── Language ──
     The homepage exists in all three locales, so unlike article/reading
     pages there's no "untranslated" case to fall back from — every locale
     is always available. Switching language used to always land on that
     locale's bare root regardless of which SPA tab (Reading/Tools/
     Companion/...) was open — bug found 2026-08-18 (user video). Carry
     the current tab across via the same "?p=<page>" query the SPA router
     already reads on load (js/ui.js), from document.body's
     data-active-page (set by that same router on every tab switch). */
  var AR_LANGS = [
    { code: 'en', label: 'English' },
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'ja', label: '日本語' }
  ];
  function renderLangSection() {
    var list = document.getElementById('ar-stg-lang-list');
    if (!list) return;
    var cur = (document.documentElement.getAttribute('lang') || 'en').split('-')[0];
    var activePage = document.body.getAttribute('data-active-page');
    var suffix = (activePage && activePage !== 'home') ? '?p=' + activePage : '';
    list.innerHTML = AR_LANGS.map(function (l) {
      if (l.code === cur) {
        return '<span class="ar-stg-lang-opt active" aria-current="page">' + l.label + '</span>';
      }
      var url = (l.code === 'en' ? '/' : '/' + l.code + '/') + suffix;
      return '<a class="ar-stg-lang-opt" href="' + url + '">' + l.label + '</a>';
    }).join('');
  }
  renderLangSection();

  /* ── Theme (light / dark / system) ──
     The anti-flash inline script in <head> already applied any stored
     choice before first paint; this just wires the UI + persistence. */
  var THEME_KEY = 'ar_theme';
  function getThemeChoice() {
    try { return localStorage.getItem(THEME_KEY) || 'system'; } catch (e) { return 'system'; }
  }
  function applyTheme(choice) {
    if (choice === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else if (choice === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }
  function syncThemeButtons() {
    var current = getThemeChoice();
    panel.querySelectorAll('[data-theme-choice]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.themeChoice === current);
    });
  }
  panel.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var choice = btn.dataset.themeChoice;
      try { localStorage.setItem(THEME_KEY, choice); } catch (e) {}
      applyTheme(choice);
      syncThemeButtons();
    });
  });
  syncThemeButtons();

  function syncToggles() {
    if (stgFauna)     stgFauna.checked     = localStorage.getItem('ar_fauna')         !== '0';
    if (stgFlora)     stgFlora.checked     = localStorage.getItem('ar_flora')         !== '0';
    if (stgMotion)    stgMotion.checked    = localStorage.getItem('ar_reduce_motion') === '1';
    if (stgAnalytics) stgAnalytics.checked = localStorage.getItem('ar_analytics_opt') !== '1';
    if (stgWcDays)    stgWcDays.value      = localStorage.getItem('ar_wc_threshold')  || '14';

    var tempUnit = localStorage.getItem('ar_unit_temp') || 'C';
    panel.querySelectorAll('[data-unit-temp]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.unitTemp === tempUnit);
    });

    var volUnit = localStorage.getItem('ar_unit_vol') || 'L';
    panel.querySelectorAll('[data-unit-vol]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.unitVol === volUnit);
    });

    var sort = localStorage.getItem('ar_jn_sort') || 'desc';
    panel.querySelectorAll('[data-sort]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.sort === sort);
    });

    var pwaRow      = document.getElementById('stg-pwa-row');
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (pwaRow) pwaRow.style.display = (!isStandalone && window.__arDeferredPWA) ? '' : 'none';
  }

  /* ── Fauna / Flora (sync with eco-toggle header) ── */
  if (stgFauna) {
    stgFauna.addEventListener('change', function () {
      if (typeof window.__arApplyFauna === 'function') window.__arApplyFauna(!stgFauna.checked);
    });
  }
  if (stgFlora) {
    stgFlora.addEventListener('change', function () {
      if (typeof window.__arApplyFlora === 'function') window.__arApplyFlora(!stgFlora.checked);
    });
  }

  /* Sync settings panel fauna/flora when header eco-toggle is used */
  var faunaHdrBtn = document.getElementById('fauna-btn');
  var floraHdrBtn = document.getElementById('flora-btn');
  if (faunaHdrBtn) {
    faunaHdrBtn.addEventListener('click', function () {
      if (stgFauna && panel.classList.contains('open')) {
        stgFauna.checked = localStorage.getItem('ar_fauna') !== '0';
      }
    });
  }
  if (floraHdrBtn) {
    floraHdrBtn.addEventListener('click', function () {
      if (stgFlora && panel.classList.contains('open')) {
        stgFlora.checked = localStorage.getItem('ar_flora') !== '0';
      }
    });
  }

  /* ── Reduce Motion ── */
  function applyReduceMotion(on) {
    document.body.classList.toggle('ar-reduce-motion', on);
    localStorage.setItem('ar_reduce_motion', on ? '1' : '0');
  }
  if (stgMotion) {
    stgMotion.addEventListener('change', function () { applyReduceMotion(stgMotion.checked); });
  }
  if (localStorage.getItem('ar_reduce_motion') === '1') applyReduceMotion(true);

  /* ── Unit segments ── */
  panel.querySelectorAll('[data-unit-temp]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      localStorage.setItem('ar_unit_temp', btn.dataset.unitTemp);
      panel.querySelectorAll('[data-unit-temp]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
    });
  });
  panel.querySelectorAll('[data-unit-vol]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      localStorage.setItem('ar_unit_vol', btn.dataset.unitVol);
      panel.querySelectorAll('[data-unit-vol]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
    });
  });

  /* ── Sort segments ── */
  panel.querySelectorAll('[data-sort]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      localStorage.setItem('ar_jn_sort', btn.dataset.sort);
      panel.querySelectorAll('[data-sort]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
    });
  });

  /* ── Water change threshold ── */
  if (stgWcDays) {
    stgWcDays.addEventListener('change', function () {
      var v = parseInt(stgWcDays.value, 10);
      if (v >= 3 && v <= 60) { localStorage.setItem('ar_wc_threshold', String(v)); }
      else { stgWcDays.value = localStorage.getItem('ar_wc_threshold') || '14'; }
    });
  }

  /* ── Analytics opt-out ── */
  function applyAnalyticsOpt(enabled) {
    localStorage.setItem('ar_analytics_opt', enabled ? '0' : '1');
    window['ga-disable-' + GA_ID] = !enabled;
  }
  if (stgAnalytics) {
    stgAnalytics.addEventListener('change', function () { applyAnalyticsOpt(stgAnalytics.checked); });
  }
  if (localStorage.getItem('ar_analytics_opt') === '1') { window['ga-disable-' + GA_ID] = true; }

  /* ── Export Journal ── */
  var stgExport = document.getElementById('stg-export');
  if (stgExport) {
    stgExport.addEventListener('click', function () {
      try {
        var raw  = localStorage.getItem('ar_journal');
        var data = raw ? JSON.parse(raw) : {};
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href     = url;
        a.download = 'aquatic-rhythm-journal-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1200);
      } catch (e) {}
    });
  }

  /* ── Import Journal ── */
  var stgImportFile = document.getElementById('stg-import-file');
  if (stgImportFile) {
    stgImportFile.addEventListener('change', function () {
      var file = stgImportFile.files && stgImportFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (evt) {
        try {
          var parsed = JSON.parse(evt.target.result);
          if (!parsed || typeof parsed !== 'object') throw new Error('invalid');
          localStorage.setItem('ar_journal', JSON.stringify(parsed));
          stgImportFile.value = '';
          closePanel();
          location.reload();
        } catch (e) {
          alert('Could not import — file does not appear to be a valid Aquatic Rhythm journal backup.');
        }
      };
      reader.readAsText(file);
    });
  }

  /* ── Clear Rhyssa chat ── */
  var stgClearRhyssa = document.getElementById('stg-clear-rhyssa');
  if (stgClearRhyssa) {
    stgClearRhyssa.addEventListener('click', function () {
      if (!confirm('Clear Rhyssa conversation history?')) return;
      localStorage.removeItem('rh_thread');
      localStorage.removeItem('rh_thread_companion');
      localStorage.removeItem('rh_convs');
    });
  }

  /* ── Reset all data ── */
  var stgResetAll = document.getElementById('stg-reset-all');
  if (stgResetAll) {
    stgResetAll.addEventListener('click', function () {
      if (!confirm('This will delete all your journal entries, settings, and chat history. This cannot be undone.\n\nContinue?')) return;
      localStorage.clear();
      location.reload();
    });
  }

  /* ── PWA install ── */
  window.addEventListener('beforeinstallprompt', function (e) {
    window.__arDeferredPWA = e;
  });
  var stgInstallPWA = document.getElementById('stg-install-pwa');
  if (stgInstallPWA) {
    stgInstallPWA.addEventListener('click', function () {
      if (!window.__arDeferredPWA) return;
      window.__arDeferredPWA.prompt();
      window.__arDeferredPWA.userChoice.then(function () {
        window.__arDeferredPWA = null;
        var pwaRow = document.getElementById('stg-pwa-row');
        if (pwaRow) pwaRow.style.display = 'none';
      });
    });
  }

})();
