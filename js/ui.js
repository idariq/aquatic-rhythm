/* ============================================================
   ui.js — cursor, nav, hybrid routing, scroll reveal,
            reading progress bar, eco toggle
   ============================================================ */

(function () {

  var hasSpaPages = !!document.querySelector('.page');

  /* ── CURSOR ── */
  var cd = document.getElementById('cd'), cr = document.getElementById('cr');
  var mx = 0, my = 0, rx = 0, ry = 0;
  var hasHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (hasHover && cd && cr) {
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cd.style.left = mx + 'px'; cd.style.top = my + 'px';
    }, { passive: true });

    (function cursorLoop() {
      if (!window.AR_PAUSED) {
        rx += (mx - rx) * .09;
        ry += (my - ry) * .09;
        cr.style.left = rx + 'px';
        cr.style.top  = ry + 'px';
      }
      requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a,button,.ac,.qi,.sl2,.spp,.pc').forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('hov'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('hov'); });
    });
  }

  /* ── MOBILE NAV ── */
  var bg = document.getElementById('burger'), nm = document.getElementById('nmob');

  function closeMenu() {
    if (!bg || !nm) return;
    bg.classList.remove('open');
    nm.classList.remove('open');
    bg.setAttribute('aria-expanded', 'false');
    nm.setAttribute('aria-hidden', 'true');
  }

  if (bg && nm) {
    bg.addEventListener('click', function () {
      var o = bg.classList.toggle('open');
      nm.classList.toggle('open', o);
      bg.setAttribute('aria-expanded', o);
      nm.setAttribute('aria-hidden', !o);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) closeMenu();
    }, { passive: true });
  }

  /* ── PAGE ROUTING (SPA root page + standalone fallback) ── */
  var pageMap = {
    '':            'home',
    '/':           'home',
    '/rhyssa':     'companion',
    '/rhyssa/':    'companion',
    '/companion':  'companion',
    '/companion/': 'companion',
    '/about':      'about',
    '/about/':     'about',
    '/privacy':    'privacy',
    '/privacy/':   'privacy',
    '/terms':      'terms',
    '/terms/':     'terms',
    '/reading':    'reading',
    '/reading/':   'reading',
    '/tools':      'tools',
    '/tools/':     'tools',
    '/journal':    'journal',
    '/journal/':   'journal',
    '/tank-log':   'tank-log',
    '/tank-log/':  'tank-log'
  };

  var titleMap = {
    'home':      'Aquatic Rhythm — Ecological Care for Small Aquariums',
    'ara':       'Aquatic Rhythm Alignment — Reading Aquarium Ecology',
    'companion': 'Rhyssa — AI Aquarium Companion',
    'about':     'About — Aquatic Rhythm',
    'privacy':   'Privacy Policy — Aquatic Rhythm',
    'terms':     'Terms of Use — Aquatic Rhythm',
    'reading':   'Reading — Aquarium Ecology Guides',
    'tools':     'Labs & Tools — Aquatic Rhythm',
    'journal':   'Keeper\'s Log — Aquatic Rhythm',
    'tank-log':  'Keeper\'s Log — Aquatic Rhythm'
  };

  var descMap = {
    'home':      'Aquatic Rhythm — calm ecology guides for home aquariums. ARA (Aquatic Rhythm Alignment) is the reasoning behind Reading, tools, Rhyssa, and your private keeper\'s log.',
    'ara':       'Explore Aquatic Rhythm Alignment (ARA) — a self-paced tour of the framework: scope and four foundational assumptions, five ecological rhythms, three phases (with false maturity and phase regression), five alignment principles, seven alignment domains, observation practice with the 3-Day and 7-Day rules, and a note on the Malaysian context that shaped it.',
    'companion': 'Rhyssa — AI aquarium companion on Aquatic Rhythm, shaped by ARA. Chat in the site; optional ChatGPT link for keepers who prefer it.',
    'about':     'Why Aquatic Rhythm exists — from uneven advice to a calmer, ecology-first way of reading small tanks.',
    'privacy':   'Privacy Policy for Aquatic Rhythm. What we collect, how it is handled, and what it means for you.',
    'terms':     'Terms of Use for Aquatic Rhythm and Rhyssa. Written plainly, without unnecessary complexity.',
    'reading':   'Short aquarium ecology guides — modular, mobile-friendly, grounded in ARA. Expand a title for details; simulators live under Labs & tools.',
    'tools':     'Interactive aquarium simulators and planners. Try decisions on screen before you make them in the tank.',
    'journal':   'A keeper\'s log for your aquarium. Observe, reflect, and track your ARA rhythm — stored privately on your device.',
    'tank-log':  'Your aquarium\'s keeper log — ARA phase, rhythm, tank family, and private entries. Stored on your device.'
  };

  /* Only routes actually translated so far (home/companion/about/privacy/terms —
     see scripts/build-homepage-i18n.py phase 1). Untranslated routes (reading,
     tools, journal, tank-log, ara) intentionally fall through to the English
     titleMap/descMap above, since their in-page content is still English too —
     title/lang should never claim a translation the content doesn't have. */
  var titleMapByLang = {
    id: {
      home: 'Aquatic Rhythm — Perawatan Ekologis untuk Akuarium Kecil',
      companion: 'Rhyssa — Pendamping AI Akuarium',
      about: 'Tentang — Aquatic Rhythm',
      privacy: 'Kebijakan Privasi — Aquatic Rhythm',
      terms: 'Syarat Penggunaan — Aquatic Rhythm'
    },
    ja: {
      home: 'Aquatic Rhythm — 小型水槽のための生態学的なケア',
      companion: 'Rhyssa — AI水槽コンパニオン',
      about: 'サイトについて — Aquatic Rhythm',
      privacy: 'プライバシーポリシー — Aquatic Rhythm',
      terms: '利用規約 — Aquatic Rhythm'
    }
  };

  var descMapByLang = {
    id: {
      home: 'Aquatic Rhythm — panduan ekologi yang tenang untuk akuarium rumah. ARA (Aquatic Rhythm Alignment) adalah pemikiran di balik Panduan, alat, Rhyssa, dan jurnal pribadi Anda.',
      companion: 'Rhyssa — pendamping AI akuarium di Aquatic Rhythm, dibentuk oleh ARA. Mengobrol langsung di situs ini; tautan ChatGPT opsional bagi yang lebih menyukainya.',
      about: 'Mengapa Aquatic Rhythm ada — dari saran yang tidak konsisten menuju cara memahami akuarium kecil yang lebih tenang, berbasis ekologi.',
      privacy: 'Kebijakan Privasi untuk Aquatic Rhythm. Apa yang kami kumpulkan, bagaimana itu ditangani, dan apa artinya bagi Anda.',
      terms: 'Syarat Penggunaan untuk Aquatic Rhythm dan Rhyssa. Ditulis dengan jelas, tanpa kerumitan yang tidak perlu.'
    },
    ja: {
      home: 'Aquatic Rhythm — 家庭用水槽のための落ち着いた生態学ガイド。ARA（Aquatic Rhythm Alignment）が、ガイド、ツール、Rhyssa、そしてあなたの個人記録の背後にある考え方。',
      companion: 'Rhyssa — ARAによって形づくられた、Aquatic Rhythm上のAI水槽コンパニオン。このサイト内でチャットでき、希望者向けにChatGPTへのリンクもオプションで利用可能。',
      about: 'Aquatic Rhythmが存在する理由 — ばらつきのあるアドバイスから、より落ち着いた生態学重視の小型水槽の読み解き方へ。',
      privacy: 'Aquatic Rhythmのプライバシーポリシー。何を収集し、どう扱われ、あなたにとって何を意味するか。',
      terms: 'Aquatic RhythmとRhyssaの利用規約。不要な複雑さを避け、平易に記述。'
    }
  };

  var pageLang = document.documentElement.lang || 'en';

  function localizedTitle(id) {
    return (titleMapByLang[pageLang] && titleMapByLang[pageLang][id]) || titleMap[id];
  }

  function localizedDesc(id) {
    return (descMapByLang[pageLang] && descMapByLang[pageLang][id]) || descMap[id];
  }

  function updateMeta(id) {
    var desc = document.getElementById('meta-desc');
    var d = localizedDesc(id);
    if (desc && d) desc.setAttribute('content', d);
  }

  function setMetaTag(selector, content) {
    if (!content) return;
    var el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  }

  /** Keeps og:* and twitter:* in sync with SPA route (crawlers and shares). */
  function updateSocialMeta(id) {
    var title = localizedTitle(id);
    var desc = localizedDesc(id);
    if (!title || !desc) return;
    var path = id === 'home' ? '/' : '/' + id;
    var url = 'https://aquaticrhythm.com' + path;
    setMetaTag('meta[property="og:type"]', 'website');
    setMetaTag('meta[property="og:url"]', url);
    setMetaTag('meta[property="og:title"]', title);
    setMetaTag('meta[property="og:description"]', desc);
    setMetaTag('meta[name="twitter:url"]', url);
    setMetaTag('meta[name="twitter:title"]', title);
    setMetaTag('meta[name="twitter:description"]', desc);
  }

  function updateBottomNav(id) {
    var navId = id === 'tank-log' ? 'journal' : id;
    document.querySelectorAll('.bnav-item').forEach(function (item) {
      var tab = item.getAttribute('data-bnav');
      item.classList.toggle('active', tab === navId);
      item.setAttribute('aria-current', tab === navId ? 'page' : 'false');
    });
  }

  function closeAllReadingAccordions() {
    var root = document.getElementById('pg-reading');
    if (!root) return;
    root.querySelectorAll('.rd-card--acc.is-expanded').forEach(function (card) {
      card.classList.remove('is-expanded');
      var btn = card.querySelector('.rd-card-hit');
      var panel = card.querySelector('.rd-card-panel');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
  }

  function initReadingAccordionTitles() {
    var root = document.getElementById('pg-reading');
    if (!root) return;
    root.querySelectorAll('.rd-card--acc').forEach(function (card) {
      var hitText = card.querySelector('.rd-card-hit-text');
      var h2 = card.querySelector('.rd-card-panel .rd-card-title');
      if (!hitText || !h2 || hitText.childNodes.length) return;
      var mainTitle = '';
      var subtitle = '';
      h2.childNodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() && !mainTitle) {
          mainTitle = node.textContent.trim();
        } else if (node.nodeName === 'EM') {
          subtitle = node.textContent.trim();
        }
      });
      if (!mainTitle) mainTitle = h2.textContent.replace(/\s+/g, ' ').trim();
      hitText.appendChild(document.createTextNode(mainTitle));
      if (subtitle) {
        var sub = document.createElement('span');
        sub.className = 'rd-hit-sub';
        sub.textContent = subtitle;
        hitText.appendChild(sub);
      }
      var tagsSrc = card.querySelector('.rd-card-panel .rd-card-tags');
      if (tagsSrc) {
        var tagsClone = tagsSrc.cloneNode(true);
        tagsClone.className = 'rd-hit-tags';
        hitText.appendChild(tagsClone);
      }
    });
  }

  /* Client-side filter for the /reading accordion list — matches the query
     against each card's full text (title, description, tags) via
     textContent, which still works while the panel is display:none, so no
     dependence on accordion open/close state or on initReadingAccordionTitles
     having run yet. A category with zero matching cards hides itself rather
     than showing an empty header. */
  function filterReadingCards(query) {
    var root = document.getElementById('pg-reading');
    if (!root) return;
    var q = (query || '').trim().toLowerCase();
    root.classList.toggle('rd-searching', !!q);
    var anyVisible = false;
    root.querySelectorAll('.rd-cat').forEach(function (cat) {
      var catHasVisible = false;
      cat.querySelectorAll('.rd-card--acc').forEach(function (card) {
        var match = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.classList.toggle('rd-hidden', !match);
        if (match) catHasVisible = true;
      });
      cat.classList.toggle('rd-cat--empty', !catHasVisible);
      if (catHasVisible) anyVisible = true;
      if (!q) {
        var wrap = cat.querySelector('.rd-cards.rd-acc-wrap');
        if (wrap && wrap._rdPages) setReadingPage(wrap, 0, { animate: false });
      }
    });
    var empty = document.getElementById('rd-search-empty');
    if (empty) empty.hidden = !q || anyVisible;
  }

  /* Pagination for long /reading categories — groups cards into pages of
     RD_PAGE_SIZE with dot navigation (click a dot, or swipe on touch)
     instead of one long scroll. Categories with RD_PAGE_SIZE cards or fewer
     are left untouched (no dots). Search (filterReadingCards above)
     disables pagination for its duration via the .rd-searching class on
     #pg-reading — CSS reveals every rd-page-hidden card that still matches
     the query, so results are never trapped on an unseen page; clearing the
     query resets each category back to page 1. */
  var RD_PAGE_SIZE = 8;
  var RD_PAGE_FADE_MS = 160;
  var RD_SWIPE_MS = 220;

  /* Core page swap, shared by the dot-click fade path (setReadingPage
     below) and the swipe-drag path (initReadingSwipe below): toggles which
     cards are rd-page-hidden, updates the active dot, and — since pages
     have uneven card counts, so switching page changes the wrap's height —
     scrolls by however much the dots row just moved, so the row the user
     touched stays under their finger/cursor instead of the whole page
     jumping. Both callers apply this while the wrap is not visibly
     changing (fully faded out, or fully slid off-screen), so the
     compensating scroll is never itself seen happening. */
  function applyReadingPageDOM(wrap, pageIdx) {
    var dotsEl = wrap._rdDots;
    var anchorTop = dotsEl ? dotsEl.getBoundingClientRect().top : null;
    wrap._rdCurrentPage = pageIdx;
    wrap._rdPages.forEach(function (pageCards, i) {
      pageCards.forEach(function (card) {
        card.classList.toggle('rd-page-hidden', i !== pageIdx);
      });
    });
    if (dotsEl) {
      Array.prototype.forEach.call(dotsEl.children, function (dot, i) {
        dot.classList.toggle('active', i === pageIdx);
      });
      if (anchorTop !== null) {
        var delta = dotsEl.getBoundingClientRect().top - anchorTop;
        if (delta) window.scrollBy(0, delta);
      }
    }
  }

  /* Switches a category to pageIdx via a cross-fade (dot click, and the
     non-interactive paths below — initial paint, search-clear reset —
     which pass { animate:false } to skip the fade and apply instantly). */
  function setReadingPage(wrap, pageIdx, opts) {
    var animate = !opts || opts.animate !== false;
    if (!animate) { applyReadingPageDOM(wrap, pageIdx); return; }
    wrap.classList.add('rd-page-fade');
    setTimeout(function () {
      applyReadingPageDOM(wrap, pageIdx);
      requestAnimationFrame(function () { wrap.classList.remove('rd-page-fade'); });
    }, RD_PAGE_FADE_MS);
  }

  var RD_NAV_HEIGHT = 68;

  /* After a swipe commits to a new page, scroll so the category's first
     card sits just under the fixed nav — a swipe is often made partway
     down a long card list, and landing on the new page's first card
     (rather than wherever the old scroll position happens to now show)
     means the keeper never has to scroll back up to see it from the top. */
  function scrollReadingWrapToTop(wrap) {
    var top = wrap.getBoundingClientRect().top + window.pageYOffset - RD_NAV_HEIGHT - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  /* Touch swipe for paginated categories — the cards track the finger 1:1
     during the drag (translateX, no transition) instead of only reacting
     once the finger lifts, with rubber-band resistance past the first/last
     page. On release: past the distance threshold, the current page slides
     fully off in the swipe direction, the page swap (applyReadingPageDOM)
     happens while it's off-screen — positioned at the opposite edge first
     — then it slides in to rest; short of the threshold, it just springs
     back to place with nothing swapped. A vertical-scroll intent (the
     touch's dy exceeds its dx early on) releases the gesture back to the
     page instead of claiming it, so swiping to scroll past a category
     still works normally. */
  function initReadingSwipe(wrap, root) {
    var startX = null, startY = null, dragX = 0, decided = null, width = 0;

    wrap.addEventListener('touchstart', function (e) {
      if (root.classList.contains('rd-searching')) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragX = 0;
      decided = null;
      width = wrap.getBoundingClientRect().width;
      wrap.style.transition = 'none';
    }, { passive: true });

    wrap.addEventListener('touchmove', function (e) {
      if (startX === null) return;
      var curDx = e.touches[0].clientX - startX;
      var curDy = e.touches[0].clientY - startY;
      if (decided === null) {
        if (Math.abs(curDx) < 8 && Math.abs(curDy) < 8) return;
        decided = Math.abs(curDx) > Math.abs(curDy);
        if (!decided) { startX = null; return; }
      }
      e.preventDefault();
      dragX = curDx;
      var cur = wrap._rdCurrentPage;
      var atStart = cur === 0 && dragX > 0;
      var atEnd = cur === wrap._rdPages.length - 1 && dragX < 0;
      wrap.style.transform = 'translateX(' + (atStart || atEnd ? dragX * .3 : dragX) + 'px)';
    }, { passive: false });

    wrap.addEventListener('touchend', function () {
      if (startX === null) return;
      startX = null;
      if (!decided) return;

      var cur = wrap._rdCurrentPage;
      var threshold = Math.max(44, width * .18);
      var goNext = dragX < -threshold && cur < wrap._rdPages.length - 1;
      var goPrev = dragX > threshold && cur > 0;

      wrap.style.transition = 'transform ' + RD_SWIPE_MS + 'ms ease';
      if (!goNext && !goPrev) {
        wrap.style.transform = 'translateX(0)';
        setTimeout(function () { wrap.style.transition = ''; wrap.style.transform = ''; }, RD_SWIPE_MS + 20);
        return;
      }

      var dir = goNext ? -1 : 1;
      wrap.style.transform = 'translateX(' + (dir * width) + 'px)';
      setTimeout(function () {
        wrap.style.transition = 'none';
        wrap.style.transform = 'translateX(' + (-dir * width) + 'px)';
        applyReadingPageDOM(wrap, cur + (goNext ? 1 : -1));
        scrollReadingWrapToTop(wrap);
        void wrap.offsetWidth; // force reflow so the next transform starts from here
        wrap.style.transition = 'transform ' + RD_SWIPE_MS + 'ms ease';
        wrap.style.transform = 'translateX(0)';
        setTimeout(function () { wrap.style.transition = ''; wrap.style.transform = ''; }, RD_SWIPE_MS + 20);
      }, RD_SWIPE_MS);
    });
  }

  function paginateReadingCards() {
    var root = document.getElementById('pg-reading');
    if (!root) return;
    root.querySelectorAll('.rd-cat').forEach(function (cat) {
      var wrap = cat.querySelector('.rd-cards.rd-acc-wrap');
      if (!wrap || wrap.dataset.rdPaginated) return;
      wrap.dataset.rdPaginated = '1';
      var cards = Array.prototype.slice.call(wrap.querySelectorAll('.rd-card--acc'));
      if (cards.length <= RD_PAGE_SIZE) return;

      // Even-sized pages (remainder spread across the first few) instead of
      // fixed RD_PAGE_SIZE chunks — a flat chunk size leaves a lonely
      // 1-card last page for e.g. 33 cards (8,8,8,8,1), which made the
      // height swing (and the resulting jump before the fix above) far
      // worse than switching between two ~7-card pages.
      var totalPages = Math.ceil(cards.length / RD_PAGE_SIZE);
      var baseSize = Math.floor(cards.length / totalPages);
      var remainder = cards.length % totalPages;
      wrap._rdPages = [];
      var idx = 0;
      for (var p = 0; p < totalPages; p++) {
        var size = baseSize + (p < remainder ? 1 : 0);
        wrap._rdPages.push(cards.slice(idx, idx + size));
        idx += size;
      }

      var dots = document.createElement('div');
      dots.className = 'rd-page-dots';
      dots.setAttribute('role', 'tablist');
      dots.setAttribute('aria-label', 'Pages');
      for (var i = 0; i < totalPages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'rd-page-dot';
        dot.setAttribute('aria-label', 'Page ' + (i + 1) + ' of ' + totalPages);
        dot.addEventListener('click', (function (idx) {
          return function () { setReadingPage(wrap, idx); };
        })(i));
        dots.appendChild(dot);
      }
      wrap.parentNode.insertBefore(dots, wrap.nextSibling);
      wrap._rdDots = dots;
      setReadingPage(wrap, 0, { animate: false });

      initReadingSwipe(wrap, root);
    });
  }

  (function () {
    var input = document.getElementById('rd-search');
    var clearBtn = document.getElementById('rd-search-clear');
    if (!input) return;
    input.addEventListener('input', function () {
      filterReadingCards(input.value);
      if (clearBtn) clearBtn.classList.toggle('visible', !!input.value);
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        filterReadingCards('');
        clearBtn.classList.remove('visible');
        input.focus();
      });
    }
  }());

  function go(id, push) {
    var path = id === 'home' ? '/' : '/' + id;

    if (!hasSpaPages) {
      if (push !== false) window.location.href = path;
      return;
    }

    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    var t = document.getElementById('pg-' + id);
    if (!t) return;
    t.classList.add('active');
    document.body.setAttribute('data-active-page', id);
    window.scrollTo({ top: 0, behavior: 'auto' });
    closeMenu();
    updateBottomNav(id);
    setTimeout(function () { observeScrollReveal(t); }, 80);
    if (id === 'companion' && typeof window.__rhCompanionInit === 'function') {
      setTimeout(window.__rhCompanionInit, 80);
    }
    if ((id === 'journal' || id === 'tank-log') && typeof window.__loadJournal === 'function') {
      window.__loadJournal();
    }
    if (window.__araModTick) setTimeout(window.__araModTick, 100);

    if (id !== 'reading') closeAllReadingAccordions();
    else {
      closeAllReadingAccordions();
      initReadingAccordionTitles();
      paginateReadingCards();
      var rdSearchInput = document.getElementById('rd-search');
      var rdSearchClear = document.getElementById('rd-search-clear');
      if (rdSearchInput) { rdSearchInput.value = ''; filterReadingCards(''); }
      if (rdSearchClear) rdSearchClear.classList.remove('visible');
    }

    if (localizedTitle(id)) document.title = localizedTitle(id);
    updateMeta(id);
    updateSocialMeta(id);

    if (push !== false) history.pushState({ page: id }, '', path);

    var can = document.querySelector('link[rel="canonical"]');
    if (can) can.setAttribute('href', 'https://aquaticrhythm.com' + path);

    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', { page_path: path, page_title: id });
    }

    setTimeout(updateReadingProgress, 100);
  }

  window.go = go;

  /* ── Home hero: override .hero min-height on mobile (cache-resilient) ── */
  (function () {
    var hero = document.querySelector('.home-hero');
    if (!hero) return;
    function applyHeroFix() {
      if (window.innerWidth < 900) {
        hero.style.minHeight = 'auto';
        hero.style.display = 'block';
        hero.style.alignItems = 'flex-start';
        hero.style.paddingTop = 'calc(68px + clamp(1.75rem, 7vh, 3.5rem))';
        hero.style.paddingBottom = 'clamp(2rem, 6vh, 3.25rem)';
      } else {
        hero.style.minHeight = '100svh';
        hero.style.display = 'flex';
        hero.style.alignItems = 'center';
        hero.style.paddingTop = '68px';
        hero.style.paddingBottom = '0';
      }
    }
    applyHeroFix();
    window.addEventListener('resize', applyHeroFix, { passive: true });
  }());

  if (hasSpaPages) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('[data-page]');
      if (!link) return;
      e.preventDefault();
      go(link.getAttribute('data-page'));
    });

    window.addEventListener('popstate', function (e) {
      if (window.__rhSuppressSpaNav) { window.__rhSuppressSpaNav = false; return; }
      var id = (e.state && e.state.page) ? e.state.page : pageMap[location.pathname] || 'home';
      go(id, false);
    });

    (function () {
      var params = new URLSearchParams(location.search);
      var pParam = params.get('p');
      var id = (pParam && pageMap['/' + pParam]) ? pageMap['/' + pParam] : pageMap[location.pathname] || 'home';
      if (pParam) {
        /* Preserve the locale prefix (/id/, /ja/) when cleaning the URL —
           this used to always rewrite to the bare English path ("/tools"),
           so a ja/id reader landing here via a "?p=" link (e.g. the
           Settings language switcher preserving their current tab) would
           silently lose their locale from the address bar, then bounce to
           English on refresh. Bug found 2026-08-18 (user video). */
        var pathParts = location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
        var localePrefix = (pathParts.length && ['id', 'ja'].indexOf(pathParts[0]) !== -1) ? '/' + pathParts[0] : '';
        var cleanPath = localePrefix + '/' + pParam;
        try { history.replaceState({ page: id }, '', cleanPath); } catch (e) {}
      }
      var active = document.querySelector('.page.active');
      if (active) active.classList.remove('active');
      var t = document.getElementById('pg-' + id);
      if (t) {
        t.classList.add('active');
        document.body.setAttribute('data-active-page', id);
        updateBottomNav(id);
        if (localizedTitle(id)) document.title = localizedTitle(id);
        updateMeta(id);
        updateSocialMeta(id);
        try { history.replaceState({ page: id }, '', location.pathname); } catch (e) {}
        var path = id === 'home' ? '/' : '/' + id;
        var can = document.querySelector('link[rel="canonical"]');
        if (can) can.setAttribute('href', 'https://aquaticrhythm.com' + path);
        if (typeof gtag !== 'undefined') {
          gtag('event', 'page_view', { page_path: path, page_title: localizedTitle(id) || id });
        }
        if (window.__araModTick && id === 'ara') setTimeout(window.__araModTick, 120);
        /* Landing directly on journal/tank-log (fresh load, refresh, PWA
           resume, bookmark) skipped go()'s lazy-loader entirely — the page
           rendered with an empty tank list and every button silently did
           nothing, since js/ui-journal.js never loaded. Bug found
           2026-08-18 (user report: "sometimes can't add aquarium"). */
        if ((id === 'journal' || id === 'tank-log') && typeof window.__loadJournal === 'function') {
          window.__loadJournal();
        }
      }
    })();
  }

  /* ── SCROLL REVEAL ── */
  var currentObserver = null;

  function observeScrollReveal(scope) {
    scope = scope || document;
    scope.querySelectorAll('.sr').forEach(function (el) { el.classList.remove('in'); });
    if (currentObserver) currentObserver.disconnect();
    currentObserver = new IntersectionObserver(function (entries, ob) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ob.unobserve(e.target); }
      });
    }, { threshold: .07, rootMargin: '0px 0px -24px 0px' });
    scope.querySelectorAll('.sr').forEach(function (el) { currentObserver.observe(el); });
  }

  (function () {
    var active = hasSpaPages ? document.querySelector('.page.active') : document;
    if (active) observeScrollReveal(active);
  })();

  var RHYSSA_GPT_URL = 'https://chatgpt.com/g/g-6a09401c8ef48191b18deb53565a7fe1-rhyssa-aquarium-companion';

  function rhCopyToClipboard(text, onOk, onFail) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onOk).catch(function () { if (onFail) onFail(); });
      return;
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onOk();
    } catch (err) {
      if (onFail) onFail();
    }
  }

  function rhFlashLabel(el, labelText, ms) {
    var lbl = el.querySelector('.rh-copy-lbl, .rh-chip-lbl');
    if (!lbl) return;
    if (!lbl.getAttribute('data-rh-orig')) lbl.setAttribute('data-rh-orig', lbl.textContent);
    lbl.textContent = labelText;
    clearTimeout(el._rhFlashT);
    el._rhFlashT = setTimeout(function () {
      lbl.textContent = lbl.getAttribute('data-rh-orig') || '';
    }, ms || 1800);
  }

  document.addEventListener('click', function (e) {
    var pasteEl = e.target.closest('[data-rh-paste]');
    if (pasteEl) {
      e.preventDefault();
      var pasteText = pasteEl.getAttribute('data-rh-paste');
      if (!pasteText) return;
      rhCopyToClipboard(pasteText, function () {
        pasteEl.classList.add('rh-copied');
        rhFlashLabel(pasteEl, 'Copied', 2000);
        setTimeout(function () { pasteEl.classList.remove('rh-copied'); }, 2000);
      });
      return;
    }
    var copyGpt = e.target.closest('[data-copy-rhyssa]');
    if (copyGpt) {
      e.preventDefault();
      rhCopyToClipboard(RHYSSA_GPT_URL, function () {
        rhFlashLabel(copyGpt, 'Copied', 2000);
      });
      return;
    }
    if (e.target.closest('.rd-card-go')) return;
    var hit = e.target.closest('.rd-card-hit');
    if (!hit) return;
    var card = hit.closest('.rd-card--acc');
    var root = document.getElementById('pg-reading');
    if (!card || !root || !root.contains(card)) return;
    e.preventDefault();
    var go = card.querySelector('.rd-card-go');
    if (go && go.href) window.location.href = go.href;
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var pg = document.getElementById('pg-reading');
    if (!pg || !pg.classList.contains('active')) return;
    closeAllReadingAccordions();
  });

  initReadingAccordionTitles();
  paginateReadingCards();

  /* ── READING PROGRESS ── */
  var _rpBar  = document.getElementById('reading-progress');
  var _rpFill = document.getElementById('reading-progress-fill');
  function updateReadingProgress() {
    if (!_rpFill) return;
    var page = hasSpaPages ? document.querySelector('.page.active') : document.documentElement;
    if (!page) return;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docH = (page.scrollHeight || document.documentElement.scrollHeight) - window.innerHeight;
    if (docH <= 0) { _rpBar && _rpBar.classList.remove('visible'); return; }
    var pct = Math.min(100, Math.max(0, (scrollTop / docH) * 100));
    _rpFill.style.width = pct + '%';
    if (_rpBar) _rpBar.classList.toggle('visible', pct > 0);
  }

  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  updateReadingProgress();

  /* ────────────────────────────────────────────────────────────
     The following sections used to live in this file and have
     been extracted into sibling scripts loaded after ui.js
     (defer order preserved by index.html):

       • ECOSYSTEM TOGGLE        → js/ui-eco-toggle.js
       • READING PATHWAYS        → js/ui-reading-pathways.js
       • JOURNAL                 → js/ui-journal.js
       • RHYSSA BOTTOM SHEET     → js/ui-rhyssa-sheet.js
       • RHYSSA COMPANION PAGE   → js/ui-rhyssa-page.js
       • SETTINGS PANEL          → js/ui-settings.js

     They are top-level IIFEs that talk to ui.js only through
     window.go / window.__arApplyFauna / window.__arApplyFlora,
     so the extraction is behaviour-preserving.
     ──────────────────────────────────────────────────────────── */
})();
