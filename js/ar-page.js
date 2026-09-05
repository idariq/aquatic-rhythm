/* ar-page.js — shared nav + Rhyssa FAB logic for standalone article/tool pages */
(function () {

  /* ── NAV BURGER ── */
  var burger = document.getElementById('burger');
  var nmob   = document.getElementById('nmob');
  if (burger && nmob) {
    burger.addEventListener('click', function () {
      var o = burger.classList.toggle('open');
      nmob.classList.toggle('open', o);
      burger.setAttribute('aria-expanded', o);
      nmob.setAttribute('aria-hidden', !o);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) {
        burger.classList.remove('open');
        nmob.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        nmob.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ── SETTINGS BUTTON + SETTINGS PANEL ── */
  (function(){
    /* Settings panel chrome — was hardcoded English on every locale (bug
       found 2026-08-18, user video). Values here mirror SETTINGS in
       scripts/build-homepage-i18n.py so the JS-injected article panel and
       the homepage's own static panel read identically. */
    var stgLang = (document.documentElement.lang || 'en').split('-')[0];
    var AR_STG_STRINGS = {
      en: {
        settings: 'Settings', close_aria: 'Close settings',
        theme_label: 'Theme', theme_system: 'System', theme_light: 'Light', theme_dark: 'Dark',
        language_label: 'Language',
        ecosystem_label: 'Ecosystem',
        fauna_label: 'Fauna', fauna_sub: 'Fish &amp; animals', fauna_aria: 'Show fauna',
        flora_label: 'Flora', flora_sub: 'Plants &amp; driftwood', flora_aria: 'Show flora',
        motion_label: 'Reduce Motion', motion_sub: 'Pauses background animations', motion_aria: 'Reduce motion',
        units_label: 'Units',
        temp_label: 'Temperature', temp_group_aria: 'Temperature unit',
        vol_label: 'Volume', vol_group_aria: 'Volume unit', vol_litres: 'Litres', vol_usgal: 'US Gal',
        log_label: 'Keeper\'s Log',
        entry_order_label: 'Entry Order', entry_order_sub: 'Newest or oldest first', entry_sort_aria: 'Entry sort order',
        newest: 'Newest', oldest: 'Oldest',
        wc_alert_label: 'Water Change Alert', wc_alert_sub: 'Warn after this many days',
        wc_alert_aria: 'Days before water change alert',
        privacy_label: 'Privacy',
        analytics_label: 'Usage Analytics', analytics_sub: 'Helps improve the app',
        analytics_aria: 'Enable usage analytics',
        about_privacy: 'Privacy', about_terms: 'Terms', about_about: 'About', about_support: 'Support'
      },
      id: {
        settings: 'Pengaturan', close_aria: 'Tutup pengaturan',
        theme_label: 'Tema', theme_system: 'Sistem', theme_light: 'Terang', theme_dark: 'Gelap',
        language_label: 'Bahasa',
        ecosystem_label: 'Ekosistem',
        fauna_label: 'Fauna', fauna_sub: 'Ikan &amp; hewan', fauna_aria: 'Tampilkan fauna',
        flora_label: 'Flora', flora_sub: 'Tumbuhan &amp; kayu apung', flora_aria: 'Tampilkan flora',
        motion_label: 'Kurangi Gerakan', motion_sub: 'Menjeda animasi latar belakang', motion_aria: 'Kurangi gerakan',
        units_label: 'Satuan',
        temp_label: 'Suhu', temp_group_aria: 'Satuan suhu',
        vol_label: 'Volume', vol_group_aria: 'Satuan volume', vol_litres: 'Liter', vol_usgal: 'Galon AS',
        log_label: 'Catatan Penjaga',
        entry_order_label: 'Urutan Entri', entry_order_sub: 'Terbaru atau terlama dulu', entry_sort_aria: 'Urutan entri',
        newest: 'Terbaru', oldest: 'Terlama',
        wc_alert_label: 'Peringatan Ganti Air', wc_alert_sub: 'Peringatkan setelah sekian hari',
        wc_alert_aria: 'Jumlah hari sebelum peringatan ganti air',
        privacy_label: 'Privasi',
        analytics_label: 'Analitik Penggunaan', analytics_sub: 'Membantu meningkatkan aplikasi',
        analytics_aria: 'Aktifkan analitik penggunaan',
        about_privacy: 'Kebijakan Privasi', about_terms: 'Syarat Penggunaan', about_about: 'Tentang', about_support: 'Dukungan'
      },
      ja: {
        settings: '設定', close_aria: '設定を閉じる',
        theme_label: 'テーマ', theme_system: 'システム', theme_light: 'ライト', theme_dark: 'ダーク',
        language_label: '言語',
        ecosystem_label: 'エコシステム',
        fauna_label: '動物', fauna_sub: '魚と生き物', fauna_aria: '動物を表示',
        flora_label: '植物', flora_sub: '水草と流木', flora_aria: '植物を表示',
        motion_label: 'モーション削減', motion_sub: '背景アニメーションを一時停止', motion_aria: 'モーションを削減',
        units_label: '単位',
        temp_label: '水温', temp_group_aria: '温度単位',
        vol_label: '水量', vol_group_aria: '容量単位', vol_litres: 'リットル', vol_usgal: '米ガロン',
        log_label: 'キーパーの記録',
        entry_order_label: '記録の並び順', entry_order_sub: '新しい順または古い順', entry_sort_aria: '記録の並び順',
        newest: '新しい順', oldest: '古い順',
        wc_alert_label: '水換えアラート', wc_alert_sub: '指定日数後に通知',
        wc_alert_aria: '水換えアラートまでの日数',
        privacy_label: 'プライバシー',
        analytics_label: '利用状況分析', analytics_sub: 'アプリの改善に役立ちます',
        analytics_aria: '利用状況分析を有効にする',
        about_privacy: 'プライバシー', about_terms: '利用規約', about_about: 'サイトについて', about_support: '支援'
      }
    };
    function T(key) {
      return (AR_STG_STRINGS[stgLang] && AR_STG_STRINGS[stgLang][key]) || AR_STG_STRINGS.en[key] || key;
    }

    var GA_ID = 'G-8MDN065WNW';
    var GEAR_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>';

    /* Inject settings button into standard nav (articles / tank-builder) */
    var nav = document.querySelector('nav:not(.bnav)');
    if (nav && !nav.querySelector('.ar-settings-btn')) {
      var btn = document.createElement('button');
      btn.className = 'ar-settings-btn';
      btn.id = 'ar-settings-btn';
      btn.setAttribute('aria-label', T('settings'));
      btn.setAttribute('aria-expanded', 'false');
      btn.title = T('settings');
      btn.innerHTML = GEAR_SVG;
      var bg = nav.querySelector('.nbg');
      if (bg) nav.insertBefore(btn, bg); else nav.appendChild(btn);
    }

    /* Inject settings panel + backdrop (once) */
    if (!document.getElementById('ar-settings-panel')) {
      var bd = document.createElement('div');
      bd.className = 'ar-settings-backdrop';
      bd.id = 'ar-settings-backdrop';
      bd.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bd);

      var panel = document.createElement('aside');
      panel.className = 'ar-settings-panel';
      panel.id = 'ar-settings-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', T('settings'));
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML =
        '<div class="ar-stg-head">' +
          '<div class="ar-stg-head-left">' +
            '<svg class="ar-stg-head-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
              '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>' +
            '</svg>' +
            '<span class="ar-stg-title">' + T('settings') + '</span>' +
          '</div>' +
          '<button class="ar-stg-close" id="ar-stg-close" aria-label="' + T('close_aria') + '"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m6 6 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<div class="ar-stg-body">' +
          '<div class="ar-stg-section">' +
            '<span class="ar-stg-label">' + T('theme_label') + '</span>' +
            '<div class="ar-stg-theme-seg" role="group" aria-label="' + T('theme_label') + '">' +
              '<button class="ar-stg-theme-btn" type="button" data-theme-choice="system">' + T('theme_system') + '</button>' +
              '<button class="ar-stg-theme-btn" type="button" data-theme-choice="light">' + T('theme_light') + '</button>' +
              '<button class="ar-stg-theme-btn" type="button" data-theme-choice="dark">' + T('theme_dark') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="ar-stg-divider"></div>' +
          '<div class="ar-stg-section">' +
            '<span class="ar-stg-label">' + T('language_label') + '</span>' +
            '<div class="ar-stg-lang-list" id="ar-stg-lang-list"></div>' +
          '</div>' +
          '<div class="ar-stg-divider"></div>' +
          '<div class="ar-stg-section">' +
            '<span class="ar-stg-label">' + T('ecosystem_label') + '</span>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('fauna_label') + '</span><span class="ar-stg-row-sub">' + T('fauna_sub') + '</span></div><input class="ar-stg-toggle" type="checkbox" id="ar-stg-fauna" role="switch" aria-label="' + T('fauna_aria') + '"></div>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('flora_label') + '</span><span class="ar-stg-row-sub">' + T('flora_sub') + '</span></div><input class="ar-stg-toggle" type="checkbox" id="ar-stg-flora" role="switch" aria-label="' + T('flora_aria') + '"></div>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('motion_label') + '</span><span class="ar-stg-row-sub">' + T('motion_sub') + '</span></div><input class="ar-stg-toggle" type="checkbox" id="ar-stg-motion" role="switch" aria-label="' + T('motion_aria') + '"></div>' +
          '</div>' +
          '<div class="ar-stg-divider"></div>' +
          '<div class="ar-stg-section">' +
            '<span class="ar-stg-label">' + T('units_label') + '</span>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('temp_label') + '</span></div><div class="ar-stg-seg" role="group" aria-label="' + T('temp_group_aria') + '"><button class="ar-stg-seg-btn" data-unit-temp="C">°C</button><button class="ar-stg-seg-btn" data-unit-temp="F">°F</button></div></div>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('vol_label') + '</span></div><div class="ar-stg-seg" role="group" aria-label="' + T('vol_group_aria') + '"><button class="ar-stg-seg-btn" data-unit-vol="L">' + T('vol_litres') + '</button><button class="ar-stg-seg-btn" data-unit-vol="gal">' + T('vol_usgal') + '</button></div></div>' +
          '</div>' +
          '<div class="ar-stg-divider"></div>' +
          '<div class="ar-stg-section">' +
            '<span class="ar-stg-label">' + T('log_label') + '</span>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('entry_order_label') + '</span><span class="ar-stg-row-sub">' + T('entry_order_sub') + '</span></div><div class="ar-stg-seg" role="group" aria-label="' + T('entry_sort_aria') + '"><button class="ar-stg-seg-btn" data-sort="desc">' + T('newest') + '</button><button class="ar-stg-seg-btn" data-sort="asc">' + T('oldest') + '</button></div></div>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('wc_alert_label') + '</span><span class="ar-stg-row-sub">' + T('wc_alert_sub') + '</span></div><input class="ar-stg-num-input" type="number" id="ar-stg-wc-days" min="3" max="60" value="14" aria-label="' + T('wc_alert_aria') + '"></div>' +
          '</div>' +
          '<div class="ar-stg-divider"></div>' +
          '<div class="ar-stg-section">' +
            '<span class="ar-stg-label">' + T('privacy_label') + '</span>' +
            '<div class="ar-stg-row"><div class="ar-stg-row-info"><span class="ar-stg-row-label">' + T('analytics_label') + '</span><span class="ar-stg-row-sub">' + T('analytics_sub') + '</span></div><input class="ar-stg-toggle" type="checkbox" id="ar-stg-analytics" role="switch" aria-label="' + T('analytics_aria') + '"></div>' +
          '</div>' +
          '<div class="ar-stg-divider"></div>' +
          '<div class="ar-stg-about">' +
            '<div class="ar-stg-about-links">' +
              '<a href="' + (stgLang === 'en' ? '/privacy' : '/' + stgLang + '/?p=privacy') + '" class="ar-stg-about-link">' + T('about_privacy') + '</a>' +
              '<span class="ar-stg-dot">·</span>' +
              '<a href="' + (stgLang === 'en' ? '/terms' : '/' + stgLang + '/?p=terms') + '" class="ar-stg-about-link">' + T('about_terms') + '</a>' +
              '<span class="ar-stg-dot">·</span>' +
              '<a href="' + (stgLang === 'en' ? '/about' : '/' + stgLang + '/?p=about') + '" class="ar-stg-about-link">' + T('about_about') + '</a>' +
              '<span class="ar-stg-dot">·</span>' +
              '<a href="https://ko-fi.com/aquaticrhythm" class="ar-stg-about-link" rel="noopener noreferrer">' + T('about_support') + '</a>' +
            '</div>' +
            '<span class="ar-stg-version">Aquatic Rhythm · aquaticrhythm.com</span>' +
          '</div>' +
        '</div>';
      document.body.appendChild(panel);
    }

    /* References */
    var panel    = document.getElementById('ar-settings-panel');
    var backdrop = document.getElementById('ar-settings-backdrop');
    var closeBtn = document.getElementById('ar-stg-close');
    var stgFauna     = document.getElementById('ar-stg-fauna');
    var stgFlora     = document.getElementById('ar-stg-flora');
    var stgMotion    = document.getElementById('ar-stg-motion');
    var stgAnalytics = document.getElementById('ar-stg-analytics');
    var stgWcDays    = document.getElementById('ar-stg-wc-days');

    /* ── Language ──
       window.__arI18n (set inline by the build for translated pages) carries
       { basePath, avail } — avail is the list of non-English locales that
       actually have a ready translation for THIS page. When it's absent
       (untranslated pages) or a locale isn't in it, that locale falls back
       to the English version of the same page rather than disappearing. */
    var AR_LANGS = [
      { code: 'en', label: 'English' },
      { code: 'id', label: 'Bahasa Indonesia' },
      { code: 'ja', label: '日本語' }
    ];
    function arInferBasePath() {
      var parts = location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
      if (parts.length && ['id', 'ja'].indexOf(parts[0]) !== -1) parts.shift();
      return parts.join('/');
    }
    function renderLangSection() {
      var list = document.getElementById('ar-stg-lang-list');
      if (!list) return;
      var cur = (document.documentElement.getAttribute('lang') || 'en').split('-')[0];
      var info = window.__arI18n || {};
      var basePath = typeof info.basePath === 'string' ? info.basePath : arInferBasePath();
      var avail = info.avail || [];
      list.innerHTML = AR_LANGS.map(function (l) {
        if (l.code === cur) {
          return '<span class="ar-stg-lang-opt active" aria-current="page">' + l.label + '</span>';
        }
        var hasTranslation = l.code === 'en' || avail.indexOf(l.code) !== -1;
        var url = hasTranslation && l.code !== 'en'
          ? '/' + l.code + (basePath ? '/' + basePath : '')
          : '/' + basePath;
        var suffix = hasTranslation ? '' : ' <span class="ar-stg-lang-fallback">(EN)</span>';
        return '<a class="ar-stg-lang-opt" href="' + url + '">' + l.label + suffix + '</a>';
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
      panel.querySelectorAll('[data-unit-temp]').forEach(function(b) { b.classList.toggle('active', b.dataset.unitTemp === tempUnit); });
      var volUnit = localStorage.getItem('ar_unit_vol') || 'L';
      panel.querySelectorAll('[data-unit-vol]').forEach(function(b) { b.classList.toggle('active', b.dataset.unitVol === volUnit); });
      var sort = localStorage.getItem('ar_jn_sort') || 'desc';
      panel.querySelectorAll('[data-sort]').forEach(function(b) { b.classList.toggle('active', b.dataset.sort === sort); });
    }

    /* body{overflow:hidden} alone is a known cross-browser trap on
       mobile: on some Android WebViews/embedded browsers it doesn't
       just block background scroll, it also stops touch-scroll from
       reaching this panel's own overflow-y:auto — the whole page
       becomes untouchable, panel included. position:fixed + restoring
       scroll position on close is the standard robust fix.

       BUT: app-shell pages (tank-builder/tank-simulator/community-
       stress-lab) already set body{overflow:hidden} permanently in
       their own CSS — there's no background scroll position to
       protect there in the first place, since body never scrolls on
       those pages regardless of this panel's state. Toggling
       body.style.position='fixed' there anyway — on a body that also
       has an explicit height:100dvh rule — is a known trigger for
       mobile Chrome to mis-cache the dynamic viewport height at
       whatever browser-toolbar state happened to be showing at that
       instant. Bug found 2026-08-24 (user video): tank-builder's
       RESET/SEE REPORT buttons shift upward after opening Settings
       and changing the theme, leaving a gap below them where the
       button bar used to sit flush — traced to this lock/unlock cycle
       running unnecessarily on an already-non-scrolling body, not to
       the theme switch itself. Skip the whole position:fixed hack
       when body is already non-scrolling by page design; regular
       articles (body scrolls normally, overflow-y not hidden) are
       unaffected and keep the original lock. */
    var scrollLockY = 0;
    var skippedLock = false;
    function lockBodyScroll() {
      skippedLock = getComputedStyle(document.body).overflowY === 'hidden';
      if (skippedLock) return;
      scrollLockY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollLockY + 'px';
      document.body.style.width = '100%';
    }
    function unlockBodyScroll() {
      if (skippedLock) { skippedLock = false; return; }
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollLockY);
    }

    function openSettings() {
      panel.classList.add('open');
      panel.removeAttribute('aria-hidden');
      if (backdrop) { backdrop.classList.add('open'); backdrop.removeAttribute('aria-hidden'); }
      lockBodyScroll();
      syncToggles();
    }
    function closeSettings() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); }
      unlockBodyScroll();
    }

    /* Wire all settings trigger buttons */
    ['ar-settings-btn', 'tb-settings-btn'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', openSettings);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSettings);
    if (backdrop) backdrop.addEventListener('click', closeSettings);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closeSettings();
    });

    /* ── Back-button intercept ──
       Without this, Android back (hardware/gesture) exits the page
       entirely instead of just closing the panel — same pattern as
       js/rhyssa-fab-ext.js's chat sheet / js/ui-settings.js. */
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
      if (panel.classList.contains('open')) closeSettings();
    }, true);

    /* Fauna */
    if (stgFauna) stgFauna.addEventListener('change', function() { localStorage.setItem('ar_fauna', stgFauna.checked ? '1' : '0'); });

    /* Flora */
    if (stgFlora) stgFlora.addEventListener('change', function() { localStorage.setItem('ar_flora', stgFlora.checked ? '1' : '0'); });

    /* Reduce Motion */
    function applyReduceMotion(on) {
      document.body.classList.toggle('ar-reduce-motion', on);
      localStorage.setItem('ar_reduce_motion', on ? '1' : '0');
    }
    if (stgMotion) stgMotion.addEventListener('change', function() { applyReduceMotion(stgMotion.checked); });
    if (localStorage.getItem('ar_reduce_motion') === '1') applyReduceMotion(true);

    /* Unit segments */
    panel.querySelectorAll('[data-unit-temp]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        localStorage.setItem('ar_unit_temp', btn.dataset.unitTemp);
        panel.querySelectorAll('[data-unit-temp]').forEach(function(b) { b.classList.toggle('active', b === btn); });
      });
    });
    panel.querySelectorAll('[data-unit-vol]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        localStorage.setItem('ar_unit_vol', btn.dataset.unitVol);
        panel.querySelectorAll('[data-unit-vol]').forEach(function(b) { b.classList.toggle('active', b === btn); });
      });
    });

    /* Sort segments */
    panel.querySelectorAll('[data-sort]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        localStorage.setItem('ar_jn_sort', btn.dataset.sort);
        panel.querySelectorAll('[data-sort]').forEach(function(b) { b.classList.toggle('active', b === btn); });
      });
    });

    /* Water change threshold */
    if (stgWcDays) {
      stgWcDays.addEventListener('change', function() {
        var v = parseInt(stgWcDays.value, 10);
        if (v >= 3 && v <= 60) { localStorage.setItem('ar_wc_threshold', String(v)); }
        else { stgWcDays.value = localStorage.getItem('ar_wc_threshold') || '14'; }
      });
    }

    /* Analytics */
    function applyAnalyticsOpt(enabled) {
      localStorage.setItem('ar_analytics_opt', enabled ? '0' : '1');
      window['ga-disable-' + GA_ID] = !enabled;
    }
    if (stgAnalytics) stgAnalytics.addEventListener('change', function() { applyAnalyticsOpt(stgAnalytics.checked); });
    if (localStorage.getItem('ar_analytics_opt') === '1') { window['ga-disable-' + GA_ID] = true; }

    /* Expose for lab inline scripts */
    window.__arOpenSettings  = openSettings;
    window.__arCloseSettings = closeSettings;
  })();

  /* ── RHYSSA FAB + SHEET ── */
  var rhLang = (document.documentElement.lang || 'en').split('-')[0];
  var RH_STRINGS = {
    en: { newChat: 'New chat', deleteConv: 'Delete conversation', writeOwn: 'Write my own…' },
    id: { newChat: 'Obrolan baru', deleteConv: 'Hapus percakapan', writeOwn: 'Tulis sendiri…' },
    ja: { newChat: '新しいチャット', deleteConv: '会話を削除', writeOwn: '自分で入力…' }
  };
  function RHT(key) {
    return (RH_STRINGS[rhLang] && RH_STRINGS[rhLang][key]) || RH_STRINGS.en[key] || key;
  }

  var WORKER_URL = 'https://api.aquaticrhythm.com/chat';
  var STORE_KEY  = 'rh_thread';  /* legacy — migration source only */
  var CONVS_KEY  = 'rh_convs';  /* shared with SPA sheet */
  var isStreaming = false;
  var isTouch = window.matchMedia('(hover:none) and (pointer:coarse)').matches;

  var fab = document.getElementById('rh-fab');
  var bd  = document.getElementById('rh-backdrop');
  var sh  = document.getElementById('rh-sheet');
  var thr = document.getElementById('rh-sheet-thread');
  var frm = document.getElementById('rh-sheet-form');
  var inp = document.getElementById('rh-sheet-inp');
  var snd = document.getElementById('rh-sheet-send');
  var cls = document.getElementById('rh-sheet-cls');
  var wel = document.getElementById('rh-sheet-welcome');

  if (!fab || !sh) return;

  /* Hide old clear button — tabs + new conv replace it */
  var clr = document.getElementById('rh-sheet-clear');
  if (clr) clr.style.display = 'none';

  /* ── Inject tabs strip after sheet head (if not already present) ── */
  var tabsEl     = document.getElementById('rh-tabs');
  var tabsList   = document.getElementById('rh-tabs-list');
  var tabsNewBtn = document.getElementById('rh-tabs-new');

  if (!tabsEl) {
    tabsEl = document.createElement('div');
    tabsEl.id = 'rh-tabs';
    tabsEl.setAttribute('aria-label', 'Conversations');

    tabsList = document.createElement('div');
    tabsList.id = 'rh-tabs-list';
    tabsList.setAttribute('role', 'tablist');

    tabsNewBtn = document.createElement('button');
    tabsNewBtn.id = 'rh-tabs-new';
    tabsNewBtn.type = 'button';
    tabsNewBtn.setAttribute('aria-label', 'New conversation');
    tabsNewBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

    tabsEl.appendChild(tabsList);
    tabsEl.appendChild(tabsNewBtn);

    var shHead = sh.querySelector('.rh-sheet-head');
    if (shHead && shHead.nextSibling) {
      sh.insertBefore(tabsEl, shHead.nextSibling);
    } else {
      sh.insertBefore(tabsEl, thr);
    }
  }

  /* Inline styles — resilient to CSS cache */
  tabsEl.style.cssText = 'display:flex;align-items:center;gap:.4rem;padding:.3rem .85rem .28rem;border-bottom:1px solid var(--th-line);overflow-x:auto;scrollbar-width:none;flex-shrink:0';
  tabsList.style.cssText = 'display:flex;gap:.3rem;flex:1;min-width:0;overflow:hidden';
  tabsNewBtn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;background:none;border:1px solid var(--th-line);border-radius:20px;color:var(--th-ink-3);cursor:pointer;padding:.22rem .55rem;line-height:1;flex-shrink:0;-webkit-tap-highlight-color:transparent';

  /* ── Storage — multi-conversation (shared with SPA sheet via rh_convs) ── */
  function genId() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

  function getConvs() {
    try { return JSON.parse(localStorage.getItem(CONVS_KEY) || 'null') || null; }
    catch (e) { return null; }
  }

  function saveConvs(data) {
    try { localStorage.setItem(CONVS_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function initConvs() {
    var data = getConvs();
    if (data && data.list && data.list.length) return data;
    /* Migrate legacy rh_thread on first load */
    var old = null;
    try { old = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
    var id = genId();
    data = { activeId: id, list: [{ id: id, title: '', messages: (old && old.messages) ? old.messages : [] }] };
    saveConvs(data);
    return data;
  }

  function getThread() {
    var data = initConvs();
    for (var i = 0; i < data.list.length; i++) {
      if (data.list[i].id === data.activeId) return data.list[i];
    }
    return data.list[0] || { id: '', title: '', messages: [] };
  }

  function saveThread(s) {
    var data = initConvs();
    for (var i = 0; i < data.list.length; i++) {
      if (data.list[i].id === data.activeId) {
        data.list[i].messages = s.messages;
        saveConvs(data);
        return;
      }
    }
  }

  /* ── Date helpers ── */
  function dayKey(ts) { return new Date(ts).toDateString(); }
  function fmtDay(ts) {
    var d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    var yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    var opts = { day: 'numeric', month: 'long' };
    if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
    return d.toLocaleDateString(undefined, opts);
  }

  /* ── Markdown → HTML (safe, matches SPA sheet) ── */
  function mdToHTML(raw) {
    var display = raw
      .replace(/\[opt\][\s\S]*?\[\/opt\]/g, '')
      .replace(/\s*\[opt\][\s\S]*$/, '')
      .trim();
    var s = display.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/\[([^\]]+)\]\(\s*(\/[^)]*)\s*\)/g, '<a href="$2" style="color:var(--th-accent);text-decoration:underline;text-underline-offset:2px">$1</a>');
    s = s.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    var lines = s.split('\n'), out = [], inUL = false, inOL = false, inP = false;
    function closeAll() {
      if (inUL) { out.push('</ul>'); inUL = false; }
      if (inOL) { out.push('</ol>'); inOL = false; }
      if (inP)  { out.push('</p>');  inP  = false; }
    }
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (!t) { closeAll(); continue; }
      if (/^---+$/.test(t)) { closeAll(); out.push('<hr>'); continue; }
      var ulM = t.match(/^[-*]\s+([\s\S]*)/);
      if (ulM) {
        if (inP) { out.push('</p>'); inP = false; }
        if (inOL) { out.push('</ol>'); inOL = false; }
        if (!inUL) { out.push('<ul>'); inUL = true; }
        out.push('<li>' + ulM[1] + '</li>'); continue;
      }
      var olM = t.match(/^\d+[.)]\s+([\s\S]*)/);
      if (olM) {
        if (inP) { out.push('</p>'); inP = false; }
        if (inUL) { out.push('</ul>'); inUL = false; }
        if (!inOL) { out.push('<ol>'); inOL = true; }
        out.push('<li>' + olM[1] + '</li>'); continue;
      }
      if (inUL) { out.push('</ul>'); inUL = false; }
      if (inOL) { out.push('</ol>'); inOL = false; }
      if (!inP) { out.push('<p>'); inP = true; } else { out.push('<br>'); }
      out.push(t);
    }
    closeAll();
    return out.join('') || '<p>' + display.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + '</p>';
  }

  /* ── Interactive option buttons ── */
  function extractOptions(raw) {
    var opts = [], re = /\[opt\]([\s\S]*?)\[\/opt\]/g, m;
    while ((m = re.exec(raw)) !== null) { var t = m[1].trim(); if (t) opts.push(t); }
    return opts.slice(0, 4);
  }

  function addOptionButtons(wrap, options, onPick) {
    if (!options || !options.length) return;
    var group = document.createElement('div');
    group.style.cssText = 'display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem;padding-top:.5rem;border-top:1px solid var(--th-line)';
    var btnBase = 'font-size:var(--fs-2xs);padding:.32rem .75rem;background:var(--th-accent-soft);border:1px solid var(--th-accent-border);border-radius:20px;color:var(--th-ink);cursor:pointer;font-family:inherit;letter-spacing:.01em;text-align:left;line-height:1.4;-webkit-tap-highlight-color:transparent';
    options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = btnBase;
      btn.textContent = opt;
      btn.addEventListener('click', function () { group.remove(); onPick(opt); });
      group.appendChild(btn);
    });
    var writeBtn = document.createElement('button');
    writeBtn.type = 'button';
    writeBtn.style.cssText = 'font-size:var(--fs-2xs);padding:.32rem .75rem;background:none;border:1px solid var(--th-line);border-radius:20px;color:var(--th-ink-4);cursor:pointer;font-family:inherit;letter-spacing:.01em;text-align:left;line-height:1.4;font-style:italic;-webkit-tap-highlight-color:transparent';
    writeBtn.textContent = RHT('writeOwn');
    writeBtn.addEventListener('click', function () { group.remove(); if (inp) inp.focus(); });
    group.appendChild(writeBtn);
    wrap.appendChild(group);
  }

  /* ── Tab management ── */
  function renderTabs() {
    if (!tabsList) return;
    var data = initConvs();
    tabsList.innerHTML = '';
    var styleInactive = 'display:inline-flex;align-items:center;gap:.28rem;padding:.22rem .65rem;border-radius:20px;border:1px solid var(--th-line);color:var(--th-ink-3);cursor:pointer;font-size:var(--fs-2xs);font-family:inherit;white-space:nowrap;max-width:140px;flex-shrink:0;-webkit-tap-highlight-color:transparent;background:var(--th-surface-2)';
    var styleActive   = 'display:inline-flex;align-items:center;gap:.28rem;padding:.22rem .65rem;border-radius:20px;border:1px solid var(--th-accent-border);color:var(--th-accent);cursor:pointer;font-size:var(--fs-2xs);font-family:inherit;white-space:nowrap;max-width:140px;flex-shrink:0;-webkit-tap-highlight-color:transparent;background:var(--th-accent-soft)';
    data.list.forEach(function (conv) {
      var isActive = conv.id === data.activeId;
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.style.cssText = isActive ? styleActive : styleInactive;
      var titleSpan = document.createElement('span');
      titleSpan.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:90px;display:block';
      titleSpan.textContent = conv.title || RHT('newChat');
      tab.appendChild(titleSpan);
      // Always render delete, even as the only/first conversation —
      // deleteConv() already handles that case by resetting it to a
      // fresh empty conversation, so there's no reason to force a "New
      // chat" detour first just to make a delete button appear (user
      // report 2026-09-05).
      var del = document.createElement('button');
      del.type = 'button';
      del.setAttribute('aria-label', RHT('deleteConv'));
      del.style.cssText = 'background:none;border:none;color:var(--th-ink-4);cursor:pointer;font-size:var(--fs-sm-md);padding:0;line-height:1;flex-shrink:0;-webkit-tap-highlight-color:transparent';
      del.textContent = '×';
      ;(function (id) {
        del.addEventListener('click', function (e) { e.stopPropagation(); deleteConv(id); });
      }(conv.id));
      tab.appendChild(del);
      ;(function (id) {
        tab.addEventListener('click', function () {
          var cur = getConvs();
          if (cur && id !== cur.activeId) switchConv(id);
        });
      }(conv.id));
      tabsList.appendChild(tab);
    });
  }

  function switchConv(id) {
    var data = initConvs(); data.activeId = id; saveConvs(data);
    renderTabs(); renderThread();
  }

  function newConv() {
    var data = initConvs();
    var id = genId();
    data.list.push({ id: id, title: '', messages: [] });
    data.activeId = id;
    saveConvs(data);
    renderTabs(); renderThread();
    if (inp) { inp.value = ''; inp.style.height = 'auto'; inp.focus(); }
  }

  function deleteConv(id) {
    var data = initConvs();
    var idx = -1;
    for (var i = 0; i < data.list.length; i++) {
      if (data.list[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;
    data.list.splice(idx, 1);
    if (!data.list.length) {
      var newId = genId();
      data.list.push({ id: newId, title: '', messages: [] });
      data.activeId = newId;
    } else if (data.activeId === id) {
      data.activeId = data.list[Math.min(idx, data.list.length - 1)].id;
    }
    saveConvs(data); renderTabs(); renderThread();
  }

  /* ── Thread rendering ── */
  function appendSep(ts) {
    var sep = document.createElement('div');
    sep.className = 'rh-date-sep';
    sep.innerHTML = '<span>' + fmtDay(ts) + '</span>';
    thr.appendChild(sep);
  }

  function appendBubble(role, text) {
    var wrap = document.createElement('div');
    wrap.className = 'rh-bubble ' + (role === 'assistant' ? 'rh-bubble-rh' : 'rh-bubble-you');
    var who = document.createElement('span');
    who.className = 'rh-bubble-who';
    who.textContent = role === 'assistant' ? 'Rhyssa' : 'You';
    var body = document.createElement('div');
    body.className = 'rh-bubble-body';
    if (text) {
      body.innerHTML = role === 'assistant'
        ? mdToHTML(text)
        : '<p>' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + '</p>';
    }
    wrap.appendChild(who);
    wrap.appendChild(body);
    thr.appendChild(wrap);
    return body;
  }

  function showTyping() {
    var d = document.createElement('div');
    d.className = 'rh-typing'; d.id = 'rh-ti';
    d.innerHTML = '<span></span><span></span><span></span>';
    thr.appendChild(d); thr.scrollTop = thr.scrollHeight;
  }
  function hideTyping() { var t = document.getElementById('rh-ti'); if (t) t.remove(); }

  function renderThread() {
    var msgs = getThread().messages;
    Array.from(thr.children).forEach(function (el) {
      if (el.id !== 'rh-sheet-welcome') el.remove();
    });
    if (!msgs.length) {
      if (wel) wel.style.display = '';
      var chips = document.getElementById('rh-suggest-chips');
      if (chips) chips.style.display = '';
      return;
    }
    if (wel) wel.style.display = 'none';
    var chips = document.getElementById('rh-suggest-chips');
    if (chips) chips.style.display = 'none';
    var lastDay = null;
    msgs.forEach(function (m) {
      var mDay = dayKey(m.ts || Date.now());
      if (mDay !== lastDay) { appendSep(m.ts || Date.now()); lastDay = mDay; }
      appendBubble(m.role, m.content);
    });
    thr.scrollTop = thr.scrollHeight;
  }

  /* ── Tank context + ctx pill ── */
  function getTankContext() {
    try {
      var d = JSON.parse(localStorage.getItem('ar_journal') || '{}');
      var ts = d.tanks || [];
      if (!ts.length) return null;
      var a = ts.find(function (t) { return t.id === d.activeTankId; }) || ts[0];
      if (!a || !a.profile) return null;
      var p = a.profile;
      return { volume: p.volume || null, unit: p.unit || 'L', type: p.type || null };
    } catch (e) { return null; }
  }

  function updateCtxPill() {
    var titleGroup = sh.querySelector('.rh-sheet-title-group');
    if (!titleGroup) return;
    var pill = titleGroup.querySelector('.rh-ctx-pill');
    var ctx = getTankContext();
    if (!ctx) { if (pill) pill.remove(); return; }
    if (!pill) {
      pill = document.createElement('span');
      pill.className = 'rh-ctx-pill';
      pill.style.cssText = 'display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-3xs);padding:2px 7px;border-radius:20px;background:var(--th-accent-soft);border:1px solid var(--th-accent-border);color:var(--th-accent);font-family:inherit;letter-spacing:.02em;margin-top:.2rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      titleGroup.appendChild(pill);
    }
    var parts = [];
    if (ctx.volume) parts.push(ctx.volume + (ctx.unit || 'L'));
    if (ctx.type) parts.push(ctx.type);
    pill.textContent = parts.join(' ') || 'Tank connected';
  }

  /* ── Visual viewport fix (Android Chrome address bar) ── */
  function fitSheet() {
    if (!window.visualViewport || window.innerWidth >= 721) return;
    sh.style.top = '0px'; sh.style.bottom = 'auto';
    sh.style.height = Math.round(window.visualViewport.height) + 'px';
    thr.scrollTop = thr.scrollHeight;
  }

  /* body{overflow:hidden} alone is a known cross-browser trap on
     mobile: on some Android WebViews/embedded browsers it doesn't just
     block background scroll, it also stops touch-scroll from reaching
     the sheet's own overflow-y:auto thread. position:fixed + restoring
     scroll position on close is the standard robust fix.

     Same app-shell exception as the Settings panel's copy of this
     function above (see its comment for the full 2026-08-24 bug
     writeup) — skip the position:fixed hack on pages where body is
     already permanently overflow:hidden (tank-builder/tank-simulator/
     community-stress-lab), since there's no scroll to protect there
     and toggling it anyway can mis-cache height:100dvh on mobile. */
  var scrollLockY = 0;
  var skippedLock = false;
  function lockBodyScroll() {
    skippedLock = getComputedStyle(document.body).overflowY === 'hidden';
    if (skippedLock) return;
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.width = '100%';
  }
  function unlockBodyScroll() {
    if (skippedLock) { skippedLock = false; return; }
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockY);
  }

  /* ── Open / close ── */
  function openSheet() {
    sh.classList.add('open'); sh.removeAttribute('aria-hidden');
    if (bd) { bd.classList.add('open'); }
    fab.setAttribute('aria-expanded', 'true');
    fab.classList.add('active');
    lockBodyScroll();
    fitSheet();
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitSheet);
    updateCtxPill(); renderTabs(); renderThread();
    setTimeout(function () { if (inp) inp.focus(); }, 80);
  }

  function closeSheet() {
    sh.classList.remove('open'); sh.setAttribute('aria-hidden', 'true');
    if (bd) { bd.classList.remove('open'); }
    fab.setAttribute('aria-expanded', 'false');
    fab.classList.remove('active');
    unlockBodyScroll();
    if (window.innerWidth < 721) { sh.style.top = ''; sh.style.bottom = ''; sh.style.height = ''; }
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', fitSheet);
    fab.focus();
  }

  /* Expose for rhyssa-fab-ext.js back-button intercept */
  window.__rhCloseSheet = closeSheet;
  window.__rhOpenSheet  = openSheet;

  /* ── Event wiring ── */
  fab.addEventListener('click', function () {
    sh.classList.contains('open') ? closeSheet() : openSheet();
  });
  if (bd) bd.addEventListener('click', closeSheet);
  if (cls) cls.addEventListener('click', closeSheet);
  if (tabsNewBtn) tabsNewBtn.addEventListener('click', newConv);

  /* Nav "Companion" links (top nav + mobile menu) used to navigate to a
     separate full-page Rhyssa experience (pg-companion / /companion). That
     page was removed 2026-09-05 — one Rhyssa design only, this sheet — so
     these links now just open the same sheet instead of leaving the
     article. Matches both the English clean path (/companion, /rhyssa)
     and the id/ja query-param form (?p=companion, ?p=rhyssa). */
  document.querySelectorAll(
    '.nlinks a[href*="companion"], .nlinks a[href*="rhyssa"], .nmob a[href*="companion"], .nmob a[href*="rhyssa"]'
  ).forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (burger && nmob) {
        burger.classList.remove('open'); nmob.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false'); nmob.setAttribute('aria-hidden', 'true');
      }
      openSheet();
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sh.classList.contains('open')) closeSheet();
  });

  /* Suggest chips — draft the message into the input instead of sending
     it straight away, so the user can edit or pick a different chip
     before committing (user request 2026-09-05: chips were sending
     immediately on click, no chance to review first). */
  var chipsEl = document.getElementById('rh-suggest-chips');
  if (chipsEl) {
    chipsEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.rh-suggest-chip');
      if (!chip) return;
      var msg = chip.dataset.msg || chip.textContent.trim();
      if (!msg || !inp) return;
      inp.value = msg;
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    });
  }

  /* Input auto-grow */
  if (inp) {
    inp.addEventListener('input', function () {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
    });
    if (!isTouch) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSubmit(); }
      });
    }
  }
  if (frm) frm.addEventListener('submit', function (e) { e.preventDefault(); doSubmit(); });

  function doSubmit() {
    var text = inp ? inp.value.trim() : '';
    if (!text) return;
    inp.value = ''; inp.style.height = 'auto';
    sendMsg(text);
  }

  /* ── Send message ── */
  function sendMsg(text) {
    if (isStreaming || !text.trim()) return;
    if (wel) wel.style.display = 'none';
    var chips = document.getElementById('rh-suggest-chips');
    if (chips) chips.style.display = 'none';

    var now = Date.now();
    var s = getThread();
    var prevLen = s.messages.length;
    s.messages.push({ role: 'user', content: text, ts: now });
    saveThread(s);

    /* Auto-title first message */
    if (!prevLen) {
      var convData = initConvs();
      for (var ci = 0; ci < convData.list.length; ci++) {
        if (convData.list[ci].id === convData.activeId && !convData.list[ci].title) {
          convData.list[ci].title = text.slice(0, 28) + (text.length > 28 ? '…' : '');
          saveConvs(convData); renderTabs(); break;
        }
      }
    }

    if (prevLen === 0 || dayKey((s.messages[prevLen - 1] || {}).ts || 0) !== dayKey(now)) appendSep(now);
    appendBubble('user', text);
    thr.scrollTop = thr.scrollHeight;
    showTyping();
    if (snd) snd.disabled = true;
    isStreaming = true;

    var msgHistory = s.messages.map(function (m) { return { role: m.role, content: m.content }; });

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgHistory, tankContext: getTankContext() })
    }).then(function (res) {
      hideTyping();
      if (!res.ok || !res.body) throw new Error('status ' + res.status);
      var replyTs = Date.now();
      var p = appendBubble('assistant', '');
      var responseText = '';
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = '';

      function feedLine(line) {
        if (!line.startsWith('data: ')) return;
        var d = line.slice(6).trim();
        if (d === '[DONE]') return;
        try {
          var pr = JSON.parse(d);
          if (pr.type === 'error') { responseText = responseText || '—'; return; }
          var delta = (pr.delta && pr.delta.text) ? pr.delta.text : '';
          if (delta) { responseText += delta; p.innerHTML = mdToHTML(responseText); thr.scrollTop = thr.scrollHeight; }
        } catch (e) {}
      }

      function read() {
        return reader.read().then(function (chunk) {
          if (chunk.done) {
            buf += dec.decode(chunk.value || new Uint8Array(0), { stream: false });
            buf.split('\n').forEach(feedLine); buf = '';
            if (!responseText) {
              responseText = 'Something went wrong on my end — let\'s try that again in a moment.';
              p.innerHTML = mdToHTML(responseText);
            }
            /* Strip [opt] markers before saving to history */
            var cleanResponse = responseText.replace(/\[opt\][\s\S]*?\[\/opt\]/g, '').trim() || responseText;
            var s2 = getThread();
            s2.messages.push({ role: 'assistant', content: cleanResponse, ts: replyTs });
            saveThread(s2);
            /* Render option buttons if present */
            var opts = extractOptions(responseText);
            if (opts.length) addOptionButtons(p.parentNode, opts, function (chosen) { sendMsg(chosen); });
            if (snd) snd.disabled = false;
            isStreaming = false;
            if (inp) inp.focus();
            return;
          }
          buf += dec.decode(chunk.value, { stream: true });
          var lines = buf.split('\n'); buf = lines.pop() || '';
          lines.forEach(feedLine);
          return read();
        });
      }
      return read();
    }).catch(function () {
      hideTyping();
      appendBubble('assistant', 'Something went wrong on my end — let\'s try that again in a moment.');
      if (snd) snd.disabled = false;
      isStreaming = false;
    });
  }

})();
