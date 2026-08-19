/* Ko-fi embed sheet — opens from [data-kofi-open]; safe on pages without markup (no-op). */
(function () {
  function init() {
    var backdrop = document.getElementById('kofi-backdrop');
    var sheet = document.getElementById('kofi-sheet');
    var iframe = document.getElementById('kofi-embed-iframe');
    var closeBtn = document.getElementById('kofi-sheet-close');
    if (!backdrop || !sheet || !iframe) return;

    var EMBED_URL = 'https://ko-fi.com/aquaticrhythm/?hidefeed=true&widget=true&embed=true';

    function loadIframe() {
      if (iframe.getAttribute('src')) return;
      iframe.setAttribute('src', EMBED_URL);
    }

    function openSheet() {
      loadIframe();
      backdrop.classList.add('open');
      sheet.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      sheet.setAttribute('aria-hidden', 'false');
      document.body.classList.add('kofi-sheet-open');
      if (closeBtn) {
        try {
          closeBtn.focus();
        } catch (e) {}
      }
    }

    function closeSheet() {
      backdrop.classList.remove('open');
      sheet.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('kofi-sheet-open');
    }

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-kofi-open]');
      if (!opener) return;
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      openSheet();
    });

    backdrop.addEventListener('click', closeSheet);
    if (closeBtn) {
      closeBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        closeSheet();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!sheet.classList.contains('open')) return;
      closeSheet();
    });

    /* ── Back-button intercept ──
       Without this, Android back (hardware/gesture) exits the page
       entirely instead of just closing the sheet — same pattern as
       js/rhyssa-fab-ext.js / js/ui-settings.js. */
    var kofiInHistory = false;
    new MutationObserver(function () {
      var open = sheet.classList.contains('open');
      if (open && !kofiInHistory) {
        kofiInHistory = true;
        history.pushState({ kofiSheet: true }, '');
      } else if (!open && kofiInHistory) {
        history.back();
      }
    }).observe(sheet, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('popstate', function () {
      if (!kofiInHistory) return;
      kofiInHistory = false;
      window.__rhSuppressSpaNav = true;
      if (sheet.classList.contains('open')) closeSheet();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
