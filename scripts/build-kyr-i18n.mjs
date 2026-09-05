/**
 * Builds localized HTML for the "Keeper Readiness Check" reflective quiz —
 * a self-contained single-file interactive page (like community-stress-lab)
 * whose quiz content (7 questions + the reflect() scoring/copy engine) is
 * embedded as inline JS string literals, not DOM-templated HTML. Doesn't
 * fit build-i18n.mjs's article template, build-ara-i18n.mjs's ara-art/
 * ara-hub template, or build-csl-i18n.mjs's external-shared-JS pattern —
 * gets its own script.
 *
 * Source: translations/<lang>/keeper-readiness-check.json — bespoke schema
 * {head, intro, screen, result, questions[], reflect{titles,paras,closings,phases}}.
 *
 * The Q[] array is fully REGENERATED from the questions[] JSON (safe —
 * we control the output format). The reflect() function's string literals
 * are replaced BY POSITION via ordered regex (title=/paras.push(/closing=/
 * phase=), which preserves the if/else-if conditional structure exactly —
 * no risk from duplicate/substring-overlapping text across languages.
 *
 * Usage:
 *   node scripts/build-kyr-i18n.mjs --lang id
 *   node scripts/build-kyr-i18n.mjs --all
 *   node scripts/build-kyr-i18n.mjs --patch-english
 */
import fs from 'fs';
import path from 'path';

const ROOT      = path.join(import.meta.dirname, '..');
const ART_DIR   = path.join(ROOT, 'articles');
const TRANS_DIR = path.join(ROOT, 'translations');
const BASE_URL  = 'https://aquaticrhythm.com';
const LANGUAGES = ['id', 'ja'];
const SLUG      = 'keeper-readiness-check';

const args    = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const langArg = langIdx !== -1 ? args[langIdx + 1] : undefined;
const doAll   = args.includes('--all');

// ── Shared site nav chrome — same values as build-ara-i18n.mjs's
// NAV_LABELS/BNAV_LABELS (kept in sync manually across build scripts by
// design, mirroring each script's distinct page template). ────────────────
const NAV_LABELS = {
  id: {
    logoAria: 'Aquatic Rhythm — perawatan ekologis untuk akuarium kecil',
    home: 'Beranda', reading: 'Panduan', companion: 'Pendamping', companionMobile: 'Pendamping AI',
    tools: 'Alat', toolsMobile: 'Lab &amp; Alat', log: 'Catatan', about: 'Tentang',
    privacy: 'Kebijakan Privasi', terms: 'Syarat Penggunaan', menu: 'Menu'
  },
  ja: {
    logoAria: 'Aquatic Rhythm — 小型水槽のための生態学的なケア',
    home: 'ホーム', reading: 'ガイド', companion: 'コンパニオン', companionMobile: 'AIコンパニオン',
    tools: 'ツール', toolsMobile: 'ラボ&amp;ツール', log: '記録', about: 'サイトについて',
    privacy: 'プライバシーポリシー', terms: '利用規約', menu: 'メニュー'
  }
};

const BNAV_LABELS = {
  id: { home: 'Beranda', reading: 'Panduan', tools: 'Alat', log: 'Catatan', logAria: 'Catatan Penjaga' },
  ja: { home: 'ホーム', reading: 'ガイド', tools: 'ツール', log: '記録', logAria: 'キーパーの記録' }
};

// Per-language "Question N of TOTAL" progress label — a JS format string,
// not simple data, since concatenation order/particles differ per language.
const QNUM_TEMPLATE = {
  id: (i) => `document.getElementById('kyr-q-num').textContent='Pertanyaan '+(${i})+' dari '+Q.length;`,
  ja: (i) => `document.getElementById('kyr-q-num').textContent='質問 '+(${i})+' / '+Q.length;`
};
// Same format, but as a literal string for the static HTML placeholder
// (visible before JS runs) — must match QNUM_TEMPLATE's rendered output.
const STATIC_QNUM = {
  id: (n, total) => `Pertanyaan ${n} dari ${total}`,
  ja: (n, total) => `質問 ${n} / ${total}`
};

// Rhyssa chat sheet (#rh-sheet) chrome — this is the ONE Rhyssa chat UI
// site-wide (the separate full-page Companion experience this used to be
// read from, translations/homepage/<lang>.json's "companion" section, was
// removed 2026-09-05 and consolidated into this sheet, taking that key
// with it). Self-contained here now, same pattern as build-tb-i18n.mjs /
// build-tsim-i18n.mjs's own RH_SHEET — values match what "companion" used
// to hold, plus the 5 suggest-chip labels/messages added to the shared
// article template the same day.
const RH_SHEET = {
  id: {
    back_aria: 'Tutup obrolan', sub: 'Pendamping Akuarium', new_aria: 'Percakapan baru',
    welcome: 'Ceritakan apa yang Anda lihat — air, perilaku, apa pun yang berubah — dan kita bisa memahaminya bersama sebelum memperbaiki apa pun.',
    chip1Label: 'Ada yang tidak beres', chip1Msg: 'Ada yang terlihat tidak beres di akuarium saya — saya tidak yakin harus menyimpulkan apa.',
    chip2Label: 'Ikan terlihat stres', chip2Msg: 'Ikan saya terlihat stres atau berperilaku berbeda dari biasanya.',
    chip3Label: 'Air terlihat berbeda', chip3Msg: 'Air saya terlihat berbeda hari ini — tidak yakin apakah ini masalah.',
    chip4Label: 'Akuarium baru', chip4Msg: 'Saya sedang menyiapkan akuarium baru dan tidak yakin apa yang perlu saya ketahui.',
    chip5Label: 'Sekadar mengamati', chip5Msg: 'Saya hanya mengamati akuarium saya. Tidak ada yang mendesak — sekadar mengamati.',
    placeholder: 'Tanyakan tentang akuarium Anda…', send_aria: 'Kirim',
    note: 'AI bisa saja salah — untuk keadaan darurat pada ikan, konsultasikan dengan spesialis'
  },
  ja: {
    back_aria: 'チャットを閉じる', sub: 'アクアリウムの相棒', new_aria: '新しい会話',
    welcome: '見えているものを教えてください。水、行動、変わったことなら何でも構いません。何かを直す前に、一緒に読み解いていきましょう。',
    chip1Label: '何かおかしい', chip1Msg: '水槽の様子が何かおかしい気がしますが、どう考えればいいのか分かりません。',
    chip2Label: '魚がストレスを感じている', chip2Msg: 'うちの魚がストレスを感じているようで、いつもと様子が違います。',
    chip3Label: '水の様子が違う', chip3Msg: '今日は水の様子がいつもと違いますが、問題かどうか分かりません。',
    chip4Label: '新しい水槽', chip4Msg: '新しい水槽をセットアップ中で、何を知っておくべきか分かりません。',
    chip5Label: 'ただ見守っている', chip5Msg: '特に急ぎではありませんが、水槽をただ見守っています。',
    placeholder: '水槽について質問する…', send_aria: '送信',
    note: 'AIは間違えることがあります。魚の緊急事態では、専門家に相談してください'
  }
};

function replaceOnce(html, pattern, fn) {
  let done = false;
  return html.replace(pattern, (...m) => {
    if (done) return m[0];
    done = true;
    return fn(...m);
  });
}

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildHreflangTags(lang) {
  const lines = [];
  lines.push(`<link rel="alternate" hreflang="en" href="${BASE_URL}/articles/${SLUG}">`);
  for (const l of LANGUAGES) {
    const tPath = path.join(TRANS_DIR, l, `${SLUG}.json`);
    if (!fs.existsSync(tPath)) continue;
    lines.push(`<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/articles/${SLUG}">`);
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/articles/${SLUG}">`);
  return lines.join('\n');
}

function patchHead(h, t, lang) {
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/, (_, a, b) => `${a}${lang}${b}`);
  h = replaceOnce(h, /<title>[^<]*<\/title>/, () => `<title>${t.head.title}</title>`);
  h = replaceOnce(h, /(<meta name="description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.description}${b}`);
  h = replaceOnce(h, /(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.ogTitle}${b}`);
  h = replaceOnce(h, /(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.ogDescription}${b}`);
  h = replaceOnce(h, /(<meta name="twitter:title" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.twitterTitle}${b}`);
  h = replaceOnce(h, /(<meta name="twitter:description" content=")[^"]*(")/, (_, a, b) => `${a}${t.head.twitterDescription}${b}`);

  const localUrl = `${BASE_URL}/${lang}/articles/${SLUG}`;
  h = replaceOnce(h, /(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);
  h = replaceOnce(h, /(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);
  h = replaceOnce(h, /(<meta name="twitter:url" content=")[^"]*(")/, (_, a, b) => `${a}${localUrl}${b}`);

  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(lang);
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/, (_, canon) => `${canon}\n${hreflang}`);

  h = replaceOnce(h, /("headline":")[^"]*(")/, (_, a, b) => `${a}${jsonLdEscape(t.head.title)}${b}`);
  h = replaceOnce(h, /("description":")[^"]*(","url")/, (_, a, b) => `${a}${jsonLdEscape(t.head.description)}${b}`);
  h = replaceOnce(h, /("url":")https:\/\/aquaticrhythm\.com\/articles\/keeper-readiness-check(")/, (_, a, b) => `${a}${BASE_URL}/${lang}/articles/${SLUG}${b}`);

  if (lang === 'ja') {
    const notoLink = `\n<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" rel="stylesheet"></noscript>`;
    h = h.replace(/(<\/style>)/, `$1${notoLink}`);
    h = h.replace(/(--sans:'Work Sans',system-ui,sans-serif)/, "--sans:'Work Sans','Noto Sans JP',system-ui,sans-serif");
  }
  return h;
}

function jsonLdEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function patchTopNav(h, lang) {
  const nav = NAV_LABELS[lang];
  h = replaceOnce(h, /(<a href="\/" class="nl" aria-label=")[^"]*(")/, (_, a, b) => `${a}${nav.logoAria}${b}`);
  h = replaceOnce(h, /(<ul class="nlinks">)[\s\S]*?(<\/ul>)/, (_, a, b) => `${a}
    <li><a href="/${lang}/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/${lang}/?p=companion">${nav.companion}</a></li>
    <li><a href="/${lang}/?p=tools">${nav.tools}</a></li>
    <li><a href="/${lang}/?p=journal">${nav.log}</a></li>
    <li><a href="/${lang}/?p=about">${nav.about}</a></li>
  ${b}`);
  h = replaceOnce(h, /(window\.__arI18n=\{basePath:'[^']*',avail:\[)[^\]]*(\]\};)/, (_, a, b) => `${a}${LANGUAGES.map(l => `"${l}"`).join(',')}${b}`);
  h = replaceOnce(h, /(<button class="nbg" id="burger" aria-label=")[^"]*(")/, (_, a, b) => `${a}${nav.menu}${b}`);
  h = replaceOnce(h, /(<div class="nmob" id="nmob"[^>]*>\s*<ul>)[\s\S]*?(<\/ul>)/, (_, a, b) => `${a}
    <li><a href="/${lang}/">${nav.home}</a></li>
    <li><a href="/${lang}/reading">${nav.reading}</a></li>
    <li><a href="/${lang}/?p=companion">${nav.companionMobile}</a></li>
    <li><a href="/${lang}/?p=tools">${nav.toolsMobile}</a></li>
    <li><a href="/${lang}/?p=journal">${nav.log}</a></li>
    <li><a href="/${lang}/?p=about">${nav.about}</a></li>
    <li><a href="/${lang}/?p=privacy">${nav.privacy}</a></li>
    <li><a href="/${lang}/?p=terms">${nav.terms}</a></li>
  ${b}`);
  return h;
}

function patchBnav(h, lang) {
  const b = BNAV_LABELS[lang];
  h = replaceOnce(h, /<a href="\/" class="bnav-item" aria-label="[^"]*">([\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, mid, z) => `<a href="/${lang}/" class="bnav-item" aria-label="${b.home}">${mid}${b.home}${z}`);
  h = replaceOnce(h, /<a href="\/reading" class="bnav-item([^"]*)" aria-current="page" aria-label="[^"]*">([\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, cls, mid, z) => `<a href="/${lang}/reading" class="bnav-item${cls}" aria-current="page" aria-label="${b.reading}">${mid}${b.reading}${z}`);
  h = replaceOnce(h, /<a href="\/tools" class="bnav-item" aria-label="[^"]*">([\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, mid, z) => `<a href="/${lang}/?p=tools" class="bnav-item" aria-label="${b.tools}">${mid}${b.tools}${z}`);
  h = replaceOnce(h, /<a href="\/journal" class="bnav-item" aria-label="[^"]*">([\s\S]*?<span>)[^<]*(<\/span>)/,
    (_, mid, z) => `<a href="/${lang}/?p=journal" class="bnav-item" aria-label="${b.logAria}">${mid}${b.log}${z}`);
  return h;
}

function patchRhyssaSheet(h, lang) {
  const c = RH_SHEET[lang];
  h = replaceOnce(h, /(id="rh-sheet-cls" aria-label=")[^"]*(")/, (_, a, b) => `${a}${c.back_aria}${b}`);
  h = replaceOnce(h, /(<span class="rh-sheet-sub">)[^<]*(<\/span>)/, (_, a, b) => `${a}${c.sub}${b}`);
  h = replaceOnce(h, /(id="rh-sheet-clear" aria-label=")[^"]*(" title=")[^"]*(")/, (_, a, mid, z) => `${a}${c.new_aria}${mid}${c.new_aria}${z}`);
  h = replaceOnce(h, /(<p class="rh-sheet-welcome-txt">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${c.welcome}${b}`);
  // Suggest chips (#rh-suggest-chips), added to the shared article template
  // 2026-09-05 — same exact-substring swap as build-i18n.mjs.
  const RH_CHIPS = [
    ["Something looks off in my tank — I'm not sure what to make of it.", "Something's off", 1],
    ["My fish seem stressed or are acting differently than usual.", "Fish seem stressed", 2],
    ["My water looks different today — not sure if it's a problem.", "Water looks different", 3],
    ["I'm setting up a new tank and I'm not sure what I should know.", "New tank", 4],
    ["I'm just sitting with my tank. Nothing urgent — just watching.", "Just watching", 5]
  ];
  for (const [enMsg, enLabel, n] of RH_CHIPS) {
    h = h.replace(`data-msg="${enMsg}">${enLabel}<`, `data-msg="${c[`chip${n}Msg`]}">${c[`chip${n}Label`]}<`);
  }
  h = replaceOnce(h, /(<textarea id="rh-sheet-inp"[^>]*placeholder=")[^"]*("[^>]*aria-label=")[^"]*(")/,
    (_, a, mid, z) => `${a}${c.placeholder}${mid}Rhyssa${z}`);
  h = replaceOnce(h, /(id="rh-sheet-send" aria-label=")[^"]*(")/, (_, a, b) => `${a}${c.send_aria}${b}`);
  h = replaceOnce(h, /(<p class="rh-sheet-note">)[^<]*(<\/p>)/, (_, a, b) => `${a}${c.note}${b}`);
  // "Same Rhyssa — also on ChatGPT..." was left English on every already-
  // shipped id/ja article — bug found 2026-08-18 (user video), not actually
  // a deliberate scope decision as previously assumed here.
  const also = lang === 'ja'
    ? { pre: '同じRhyssaは、', post: 'でもご利用いただけます。' }
    : { pre: 'Rhyssa yang sama — juga ada di ', post: ' jika Anda lebih suka.' };
  h = replaceOnce(h, /(>)Same Rhyssa — also on\s*(<a href="https:\/\/chatgpt\.com[^"]*"[^>]*>)ChatGPT ↗(<\/a>) if you prefer\./,
    (_, a, link, close) => `${a}${also.pre}${link}ChatGPT ↗${close}${also.post}`);
  return h;
}

function patchIntro(h, t) {
  const x = t.intro;
  h = replaceOnce(h, /(<span class="kyr-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${x.eyebrow}${b}`);
  h = replaceOnce(h, /(<h1 class="kyr-title">)[\s\S]*?(<\/h1>)/, (_, a, b) => `${a}${x.titleHtml}${b}`);
  h = replaceOnce(h, /(<p class="kyr-subtitle">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${x.subtitle}${b}`);
  let bi = 0;
  h = h.replace(/(<p class="kyr-body">)[\s\S]*?(<\/p>)/g, (_, a, b) => `${a}${x.body[bi++]}${b}`);
  h = replaceOnce(h, /(<p class="kyr-note">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${x.note}${b}`);
  h = replaceOnce(h, /(<button class="kyr-begin" id="kyr-begin-btn">)[^<]*(<\/button>)/, (_, a, b) => `${a}${x.beginBtn}${b}`);
  return h;
}

function patchScreenAndResult(h, t, lang) {
  const scr = t.screen, res = t.result;
  const qNumStatic = STATIC_QNUM[lang](1, 7);
  h = replaceOnce(h, /(<span class="kyr-q-num" id="kyr-q-num">)[^<]*(<\/span>)/, (_, a, b) => `${a}${qNumStatic}${b}`);
  h = replaceOnce(h, /(<button class="kyr-btn-back" id="kyr-btn-back">)[^<]*(<\/button>)/, (_, a, b) => `${a}${scr.backBtn}${b}`);

  h = replaceOnce(h, /(<span class="kyr-result-eyebrow">)[^<]*(<\/span>)/, (_, a, b) => `${a}${res.eyebrow}${b}`);
  let closeLabelSeen = 0;
  h = h.replace(/(<span class="kyr-q-close-label">)[^<]*(<\/span>)/g, (_, a, b) => {
    closeLabelSeen++;
    return `${a}${closeLabelSeen === 1 ? res.closeLabel : res.phaseLabel}${b}`;
  });
  h = replaceOnce(h, /(<div class="kyr-forgiveness-note">\s*<p>)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${res.forgivenessNote}${b}`);
  h = replaceOnce(h, /(<p class="kyr-note-end">)[\s\S]*?(<\/p>)/, (_, a, b) => `${a}${res.noteEnd}${b}`);
  h = replaceOnce(h, /(<button class="kyr-btn-restart" id="kyr-btn-restart">)[^<]*(<\/button>)/, (_, a, b) => `${a}${res.restartBtn}${b}`);
  h = replaceOnce(h, /(data-cta="rhythm_to_builder">)[^<]*(<\/a>)/, (_, a, b) => `${a}${res.nextActionLink}${b}`);
  h = replaceOnce(h, /<a href="\/reading" class="kyr-link-reading">[^<]*(<\/a>)/,
    (_, b) => `<a href="/${lang}/reading" class="kyr-link-reading">${res.backToReadingLink}${b}`);
  return h;
}

function renderQArray(questions) {
  const lines = questions.map((q, idx) => {
    const opts = q.opts.map(o =>
      `     {v:'${o.v}', l:'${esc(o.l)}', d:'${esc(o.d)}'}`
    ).join(',\n');
    return `  {id:'${q.id}',
   text:'${esc(q.text)}',
   sub:'${esc(q.sub)}',
   opts:[
${opts}
   ]}`;
  });
  return `var Q=[\n${lines.join(',\n')}\n];`;
}

function patchQuestionsAndReflect(h, t) {
  h = replaceOnce(h, /var Q=\[[\s\S]*?\n\];/, () => renderQArray(t.questions));

  const r = t.reflect;
  let i = 0;
  h = h.replace(/title='(?:[^'\\]|\\.)*';/g, () => `title='${esc(r.titles[i++])}';`);
  i = 0;
  h = h.replace(/paras\.push\('(?:[^'\\]|\\.)*'\);/g, () => `paras.push('${esc(r.paras[i++])}');`);
  i = 0;
  h = h.replace(/closing='(?:[^'\\]|\\.)*';/g, () => `closing='${esc(r.closings[i++])}';`);
  i = 0;
  h = h.replace(/phase='(?:[^'\\]|\\.)*';/g, () => `phase='${esc(r.phases[i++])}';`);

  return h;
}

function patchDynamicLabels(h, t, lang) {
  h = replaceOnce(h,
    /document\.getElementById\('kyr-q-num'\)\.textContent='Question '\+\(i\+1\)\+' of '\+Q\.length;/,
    () => QNUM_TEMPLATE[lang]('i+1'));
  h = replaceOnce(h,
    /nb\.textContent=i<Q\.length-1\?'[^']*':'[^']*';/,
    () => `nb.textContent=i<Q.length-1?'${esc(t.screen.nextBtnDefault)}':'${esc(t.screen.nextBtnLast)}';`);
  return h;
}

function buildLang(lang) {
  const tPath = path.join(TRANS_DIR, lang, `${SLUG}.json`);
  const t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
  const srcPath = path.join(ART_DIR, `${SLUG}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');

  h = patchHead(h, t, lang);
  h = patchTopNav(h, lang);
  h = patchBnav(h, lang);
  h = patchRhyssaSheet(h, lang);
  h = patchIntro(h, t);
  h = patchScreenAndResult(h, t, lang);
  h = patchQuestionsAndReflect(h, t);
  h = patchDynamicLabels(h, t, lang);
  h = localizeArticleLinks(h, lang);

  const outDir = path.join(ROOT, lang, 'articles');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${SLUG}.html`), h);
  console.log(`Built ${lang}/articles/${SLUG}.html`);
}

let readySlugsCache = {};
function getReadySlugsForLang(lang) {
  if (readySlugsCache[lang]) return readySlugsCache[lang];
  const dir = path.join(TRANS_DIR, lang);
  const ready = new Set();
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      try {
        const t = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (t._meta && t._meta.status === 'ready') ready.add(f.replace('.json', ''));
      } catch { /* skip */ }
    }
  }
  readySlugsCache[lang] = ready;
  return ready;
}

function localizeArticleLinks(h, lang) {
  const ready = getReadySlugsForLang(lang);
  return h.replace(/href="\/articles\/([a-z0-9-]+)"/g, (m, slug) =>
    ready.has(slug) ? `href="/${lang}/articles/${slug}"` : m);
}

function patchEnglishHreflang() {
  const srcPath = path.join(ART_DIR, `${SLUG}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');
  const before = h;
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags('en');
  h = replaceOnce(h, /(<link rel="canonical"[^>]*>)/, (_, canon) => `${canon}\n${hreflang}`);
  h = replaceOnce(h, /(window\.__arI18n=\{basePath:'[^']*',avail:\[)[^\]]*(\]\};)/, (_, a, b) => `${a}${LANGUAGES.map(l => `"${l}"`).join(',')}${b}`);
  if (h !== before) {
    fs.writeFileSync(srcPath, h, 'utf8');
    console.log(`  patched: articles/${SLUG}.html`);
  }
}

const patchEn = args.includes('--patch-english');

if (patchEn) {
  console.log('Patching English source file with hreflang…');
  patchEnglishHreflang();
  console.log('Done.');
} else if (doAll) {
  for (const lang of LANGUAGES) buildLang(lang);
} else if (langArg) {
  buildLang(langArg);
} else {
  console.error('Usage: node scripts/build-kyr-i18n.mjs --lang <id|ja> | --all | --patch-english');
  process.exit(1);
}
