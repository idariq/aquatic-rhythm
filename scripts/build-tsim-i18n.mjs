/**
 * Builds localized HTML for the Tank Cycle Simulator — a self-contained
 * single-file interactive page (like know-your-rhythm) whose engine logic
 * (~1400 lines: addLog narration, insight-group rotations, guide hints,
 * end-of-run report/coaching generation) is embedded as inline JS string
 * literals, not DOM-templated HTML. Gets its own script (largest/most
 * varied string surface of any interactive tool translated so far —
 * ternaries, message arrays, a multi-branch advice generator — so uses
 * exact-substring matching via subOnce()/subAll() rather than kyr's
 * positional regex, since string shapes here are too heterogeneous for a
 * single consistent pattern).
 *
 * Source: translations/<lang>/tank-simulator.json — bespoke schema
 * {head, briefing, setup, expected, brief, end, app, engine{...}}.
 *
 * subOnce() requires the old text to appear EXACTLY once in the working
 * buffer before replacing — throws loudly otherwise, so a stale/mismatched
 * catalog entry fails the build instead of silently no-opping.
 *
 * Usage:
 *   node scripts/build-tsim-i18n.mjs --lang id
 *   node scripts/build-tsim-i18n.mjs --all
 */
import fs from 'fs';
import path from 'path';

const ROOT      = path.join(import.meta.dirname, '..');
const ART_DIR   = path.join(ROOT, 'articles');
const TRANS_DIR = path.join(ROOT, 'translations');
const BASE_URL  = 'https://aquaticrhythm.com';
const LANGUAGES = ['id', 'ja'];
const SLUG      = 'tank-simulator';

const args    = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const langArg = langIdx !== -1 ? args[langIdx + 1] : undefined;
const doAll   = args.includes('--all');

// Shared site nav chrome — kept in sync manually with build-kyr-i18n.mjs /
// build-ara-i18n.mjs's equivalents by design (each script owns its own
// page template's copy).
const BNAV_LABELS = {
  id: { home: 'Beranda', reading: 'Panduan', tools: 'Alat', log: 'Catatan', logAria: 'Catatan Penjaga' },
  ja: { home: 'ホーム', reading: 'ガイド', tools: 'ツール', log: '記録', logAria: 'キーパーの記録' }
};

const RH_SHEET = {
  id: {
    closeAria: 'Tutup obrolan', subLbl: 'Pendamping Akuarium', resetAria: 'Reset percakapan',
    welcome: 'Ceritakan apa yang Anda lihat — air, perilaku, apa pun yang berubah — dan kita bisa memahaminya bersama sebelum memperbaiki apa pun.',
    also_pre: 'Rhyssa yang sama — juga ada di ', also_post: ' jika Anda lebih suka.',
    placeholder: 'Tanyakan tentang akuarium Anda…', msgAria: 'Pesan untuk Rhyssa', sendAria: 'Kirim',
    note: 'AI bisa saja salah — untuk keadaan darurat pada ikan, konsultasikan dengan spesialis',
    chatAria: 'Obrolan dengan Rhyssa', threadAria: 'Percakapan dengan Rhyssa'
  },
  ja: {
    closeAria: 'チャットを閉じる', subLbl: 'アクアリウムコンパニオン', resetAria: '会話をリセット',
    welcome: '見えているものを教えてください。水、行動、変わったことなら何でも構いません。何かを直す前に、一緒に読み解いていきましょう。',
    also_pre: '同じRhyssaは、', also_post: 'でもご利用いただけます。',
    placeholder: '水槽について質問する…', msgAria: 'Rhyssaへのメッセージ', sendAria: '送信',
    note: 'AIは間違えることがあります。魚の緊急事態では、専門家に相談してください',
    chatAria: 'Rhyssaとチャット', threadAria: 'Rhyssaとの会話'
  }
};

function subOnce(h, oldStr, newStr, label) {
  const i1 = h.indexOf(oldStr);
  if (i1 === -1) throw new Error(`[${label}] NOT FOUND: ${JSON.stringify(oldStr.slice(0, 80))}`);
  const i2 = h.indexOf(oldStr, i1 + 1);
  if (i2 !== -1) throw new Error(`[${label}] AMBIGUOUS (multiple matches): ${JSON.stringify(oldStr.slice(0, 80))}`);
  return h.slice(0, i1) + newStr + h.slice(i1 + oldStr.length);
}

function subAll(h, oldStr, newStr, expectedCount, label) {
  const count = h.split(oldStr).length - 1;
  if (count !== expectedCount) throw new Error(`[${label}] expected ${expectedCount} matches, found ${count}: ${JSON.stringify(oldStr.slice(0, 80))}`);
  return h.split(oldStr).join(newStr);
}

function buildHreflangTags(lang) {
  const lines = [];
  lines.push(`<link rel="alternate" hreflang="en" href="${BASE_URL}/articles/${SLUG}">`);
  for (const l of LANGUAGES) lines.push(`<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/articles/${SLUG}">`);
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/articles/${SLUG}">`);
  return lines.join('\n');
}

function patchHead(h, t, lang) {
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/, (_, a, b) => `${a}${lang}${b}`);
  h = subOnce(h, '<title>Tank Cycle Simulator — Interactive Nitrogen Cycle — Aquatic Rhythm</title>', `<title>${t.head.title}</title>`, 'head.title');
  h = subAll(h, 'An interactive simulation of the nitrogen cycle. Choose your setup, learn what to expect, and watch how the tank responds to your decisions.', t.head.description, 4, 'head.description');
  h = subOnce(h, `<link rel="canonical" href="https://aquaticrhythm.com/articles/tank-simulator">`,
    `<link rel="canonical" href="${BASE_URL}/${lang}/articles/${SLUG}">`, 'head.canonical');
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(lang);
  h = subOnce(h, `<link rel="canonical" href="${BASE_URL}/${lang}/articles/${SLUG}">`,
    `<link rel="canonical" href="${BASE_URL}/${lang}/articles/${SLUG}">\n${hreflang}`, 'head.hreflang');
  h = subOnce(h, `<meta property="og:url" content="https://aquaticrhythm.com/articles/tank-simulator">`,
    `<meta property="og:url" content="${BASE_URL}/${lang}/articles/${SLUG}">`, 'head.ogUrl');
  h = subOnce(h, `<meta name="twitter:url" content="https://aquaticrhythm.com/articles/tank-simulator">`,
    `<meta name="twitter:url" content="${BASE_URL}/${lang}/articles/${SLUG}">`, 'head.twitterUrl');
  h = subAll(h, 'Tank Cycle Simulator — Interactive Nitrogen Cycle — Aquatic Rhythm', t.head.title, 3, 'head.titleVariants');
  h = subOnce(h, `"url":"https://aquaticrhythm.com/articles/tank-simulator"`, `"url":"${BASE_URL}/${lang}/articles/${SLUG}"`, 'head.jsonldUrl');
  return h;
}

function patchBnav(h, lang) {
  const b = BNAV_LABELS[lang];
  h = subOnce(h,
    '<a href="/" class="bnav-item" aria-label="Home">',
    `<a href="/${lang}/" class="bnav-item" aria-label="${b.home}">`, 'bnav.home.a');
  h = subOnce(h, '<span>Home</span>', `<span>${b.home}</span>`, 'bnav.home.span');
  h = subOnce(h,
    '<a href="/reading" class="bnav-item" aria-label="Reading">',
    `<a href="/${lang}/reading" class="bnav-item" aria-label="${b.reading}">`, 'bnav.reading.a');
  h = subOnce(h, '<span>Reading</span>', `<span>${b.reading}</span>`, 'bnav.reading.span');
  h = subOnce(h,
    '<a href="/tools" class="bnav-item active" aria-current="page" aria-label="Tools">',
    `<a href="/${lang}/?p=tools" class="bnav-item active" aria-current="page" aria-label="${b.tools}">`, 'bnav.tools.a');
  h = subOnce(h, '<span>Tools</span>', `<span>${b.tools}</span>`, 'bnav.tools.span');
  h = subOnce(h,
    '<a href="/journal" class="bnav-item" aria-label="Keeper\'s Log">',
    `<a href="/${lang}/?p=journal" class="bnav-item" aria-label="${b.logAria}">`, 'bnav.journal.a');
  h = subOnce(h, '<span>Log</span>', `<span>${b.log}</span>`, 'bnav.journal.span');
  return h;
}

function patchRhyssaSheet(h, lang) {
  const c = RH_SHEET[lang];
  h = subAll(h, 'aria-label="Chat with Rhyssa"', `aria-label="${c.chatAria}"`, 2, 'rh.chatAria');
  h = subOnce(h, 'aria-label="Close chat"', `aria-label="${c.closeAria}"`, 'rh.closeAria');
  h = subOnce(h, '<span class="rh-sheet-sub">Aquarium Companion</span>', `<span class="rh-sheet-sub">${c.subLbl}</span>`, 'rh.subLbl');
  h = subOnce(h, 'aria-label="Reset conversation" title="Reset conversation"', `aria-label="${c.resetAria}" title="${c.resetAria}"`, 'rh.resetAria');
  h = subOnce(h, '<p class="rh-sheet-welcome-txt">Tell me what you see — water, behaviour, anything that changed — and we can read it together before we fix anything.</p>',
    `<p class="rh-sheet-welcome-txt">${c.welcome}</p>`, 'rh.welcome');
  h = subOnce(h, '>Same Rhyssa — also on <a href="https://chatgpt.com/g/g-6a09401c8ef48191b18deb53565a7fe1-rhyssa-aquarium-companion" target="_blank" rel="noopener" style="color:var(--th-accent);text-decoration:none">ChatGPT ↗</a> if you prefer.</p>',
    `>${c.also_pre}<a href="https://chatgpt.com/g/g-6a09401c8ef48191b18deb53565a7fe1-rhyssa-aquarium-companion" target="_blank" rel="noopener" style="color:var(--th-accent);text-decoration:none">ChatGPT ↗</a>${c.also_post}</p>`, 'rh.also');
  h = subOnce(h, 'placeholder="Ask about your tank…" rows="1" maxlength="1200" aria-label="Message to Rhyssa"',
    `placeholder="${c.placeholder}" rows="1" maxlength="1200" aria-label="${c.msgAria}"`, 'rh.placeholder');
  h = subOnce(h, 'id="rh-sheet-send" aria-label="Send"', `id="rh-sheet-send" aria-label="${c.sendAria}"`, 'rh.sendAria');
  h = subOnce(h, '<p class="rh-sheet-note">AI can be wrong — for fish emergencies, consult a specialist</p>',
    `<p class="rh-sheet-note">${c.note}</p>`, 'rh.note');
  h = subOnce(h, 'role="log" aria-live="polite" aria-label="Conversation with Rhyssa">',
    `role="log" aria-live="polite" aria-label="${c.threadAria}">`, 'rh.threadAria');
  return h;
}

function patchBriefing(h, t) {
  const b = t.briefing;
  h = subOnce(h, '<span class="brief-eyebrow">Aquatic Rhythm Lab</span>', `<span class="brief-eyebrow">${b.eyebrow}</span>`, 'briefing.eyebrow');
  h = subOnce(h, '<h1 class="brief-title">Cycle your<br><em>first tank.</em></h1>', `<h1 class="brief-title">${b.titleHtml}</h1>`, 'briefing.title');
  h = subOnce(h, '<p class="brief-body">Every new aquarium goes through the same invisible process — bacteria slowly building up, ammonia and nitrite rising then falling, the water finding its balance. Choose your setup and watch it happen at your own pace.</p>',
    `<p class="brief-body">${b.body}</p>`, 'briefing.body');
  const rhy = [
    ['Ammonia', 'Fish waste breaks down into toxic ammonia — the cycle begins here'],
    ['Nitrite', 'Bacteria convert ammonia — nitrite rises before it falls'],
    ['Nitrate', 'The safer end product — removed with regular water changes'],
    ['Bacteria', 'The colony that drives the cycle — needs time to establish'],
    ['Fish', 'Optional from day one — higher stakes, closer attention needed']
  ];
  rhy.forEach(([name, desc], i) => {
    const r = b.rhythms[i];
    h = subOnce(h, `>${name}</span><span class="brief-rhy-desc">${desc}</span>`,
      `>${r.name}</span><span class="brief-rhy-desc">${r.desc}</span>`, `briefing.rhythm.${i}`);
  });
  h = subOnce(h, '<p class="brief-note">A simplified model for learning — real tanks vary. Use this to understand the process, not predict exact timelines.</p>',
    `<p class="brief-note">${b.note}</p>`, 'briefing.note');
  h = subOnce(h, '<button class="brief-btn" id="btn-briefing-enter">Set up your simulation &#x2192;</button>',
    `<button class="brief-btn" id="btn-briefing-enter">${b.btn}</button>`, 'briefing.btn');
  return h;
}

// The "expected outcome" sentence concatenates size/method/weeks/welfare/plant
// fragments — id's word order (adjective-noun, "with X and Y — expect Z")
// carries over cleanly from the English source, but ja needs different
// wrapping/punctuation (no ASCII period after weeksWord, which already ends
// in "。"; <strong> wraps only the numeral, not the trailing "週間の…" tail;
// no space between size adjective and "水槽"). Kept as literal per-language
// branches here rather than forcing one shared template — same reasoning as
// build-kyr-i18n.mjs's QNUM_TEMPLATE/STATIC_QNUM per-language functions.
function expectedStatic(lang, ex, szLabel, mtLabel, wk, welfareNote, plNote) {
  if (lang === 'ja') {
    return `<strong>${szLabel}${ex.tankWord}</strong>${ex.and}<strong>${mtLabel}</strong>${ex.expect}<strong>${wk}</strong>${ex.weeksWord}${welfareNote}${ex.afterWelfare}${plNote}`;
  }
  // id/default: noun-adjective order ("akuarium kecil", not "kecil akuarium").
  return `${ex.prefix}<strong>${ex.tankWord} ${szLabel}</strong>${ex.and}<strong>${mtLabel}</strong>${ex.expect}<strong>${wk}${ex.weeksWord}</strong>.${welfareNote}${ex.afterWelfare}${plNote}`;
}

function expectedDynamic(lang, ex) {
  if (lang === 'ja') {
    return `'<strong>'+szLabel+'${ex.tankWord}</strong>${ex.and}<strong>'+mtLabel+'</strong>${ex.expect}<strong>'+wk+'</strong>${ex.weeksWord}'+welfareNote+'${ex.afterWelfare}'+plNote;`;
  }
  return `'${ex.prefix}<strong>${ex.tankWord} '+szLabel+'</strong>${ex.and}<strong>'+mtLabel+'</strong>${ex.expect}<strong>'+wk+'${ex.weeksWord}</strong>.'+welfareNote+'${ex.afterWelfare}'+plNote;`;
}

function patchSetup(h, t, lang) {
  const s = t.setup;
  h = subOnce(h, '<h2 class="ot">Set up your tank</h2>', `<h2 class="ot">${s.heading}</h2>`, 'setup.heading');
  h = subOnce(h, '<p class="om-compact" style="text-align:center;margin-bottom:.35rem">Choose size, method, and plants — then run a fish-safe cycle at your own pace.</p>',
    `<p class="om-compact" style="text-align:center;margin-bottom:.35rem">${s.sub}</p>`, 'setup.sub');
  h = subOnce(h, '<summary>About this simulation</summary>', `<summary>${s.disclosureSummary}</summary>`, 'setup.disclosureSummary');
  h = subOnce(h, '<p>Every new aquarium goes through the same invisible process — bacteria slowly building up, ammonia and nitrite rising then falling, the water finding its balance. This simulator lets you watch that happen and make decisions along the way. No experience needed.</p>',
    `<p>${s.disclosureBody}</p>`, 'setup.disclosureBody');
  h = subOnce(h, '<span class="setup-section-label">Tank size</span>', `<span class="setup-section-label">${s.sizeLabel}</span>`, 'setup.sizeLabel');
  const sizes = [
    ['Small', 'Under 40L · Parameters swing faster · Less room for error'],
    ['Medium', '40–120L · More water volume · More forgiving of mistakes'],
    ['Large', '120L+ · Dilution helps enormously · Slower parameter swings']
  ];
  sizes.forEach(([name, desc], i) => {
    const v = s.sizes[i];
    h = subOnce(h, `<span class="sopt-name">${name}</span>\n          <span class="sopt-desc">${desc}</span>`,
      `<span class="sopt-name">${v.name}</span>\n          <span class="sopt-desc">${v.desc}</span>`, `setup.size.${i}`);
  });
  h = subOnce(h, '<span class="setup-section-label">Cycling method</span>', `<span class="setup-section-label">${s.methodLabel}</span>`, 'setup.methodLabel');
  const methods = [
    ['Fishless', 'Add ammonia without fish · Bacteria grow safely · Easier to manage'],
    ['Fish-in', 'Fish in the tank from the start · Need feeding · Higher stakes']
  ];
  methods.forEach(([name, desc], i) => {
    const v = s.methods[i];
    h = subOnce(h, `<span class="sopt-name">${name}</span>\n          <span class="sopt-desc">${desc}</span>`,
      `<span class="sopt-name">${v.name}</span>\n          <span class="sopt-desc">${v.desc}</span>`, `setup.method.${i}`);
  });
  h = subOnce(h, '<p><strong>Fishless cycling is the gentler option.</strong> You add ammonia to feed the bacteria — no fish involved. The bacteria grow at their own pace, and when the cycle is done, the tank is ready for fish.</p>',
    `<p>${s.fishlessNote}</p>`, 'setup.fishlessNote');
  h = subOnce(h, '<p><strong>Fish-in cycling is more demanding.</strong> Ammonia and nitrite will rise before bacteria can process them. Your fish will feel it — clamped fins, hiding, surface breathing. Small water changes help, but this method requires close attention.</p>',
    `<p>${s.fishinWarn}</p>`, 'setup.fishinWarn');
  h = subOnce(h, '<span class="setup-section-label">Starting plants?</span>', `<span class="setup-section-label">${s.plantsLabel}</span>`, 'setup.plantsLabel');
  const plants = [
    ['Yes', 'Absorbs nitrate · Adds oxygen · Competes with algae'],
    ['No plants', 'Simpler setup · Nitrate accumulates faster']
  ];
  plants.forEach(([name, desc], i) => {
    const v = s.plants[i];
    h = subOnce(h, `<span class="sopt-name">${name}</span>\n          <span class="sopt-desc">${desc}</span>`,
      `<span class="sopt-name">${v.name}</span>\n          <span class="sopt-desc">${v.desc}</span>`, `setup.plants.${i}`);
  });
  h = subOnce(h, '<summary>Inside the simulator</summary>', `<summary>${s.disclosure2Summary}</summary>`, 'setup.disclosure2Summary');
  h = subOnce(h, '<p>Three equipment toggles — heater, filter, and light — are on by default. Try turning one off to see what happens. There is a one-time bacteria starter (Seed). Use <strong style="color:var(--th-ink-2);font-weight:500">Status</strong> / <strong style="color:var(--th-ink-2);font-weight:500">Log</strong> on mobile to switch between guidance and the day-by-day log.</p>',
    `<p>${s.disclosure2Body}</p>`, 'setup.disclosure2Body');
  h = subOnce(h, '<button class="obtn op" id="btn-begin" style="width:100%;margin-top:1rem">Begin →</button>',
    `<button class="obtn op" id="btn-begin" style="width:100%;margin-top:1rem">${s.beginBtn}</button>`, 'setup.beginBtn');
  // Default expected-text box (matches small/fishless/yes defaults) — regenerated from updateExpected() template pieces.
  const ex = t.expected;
  const defaultSentence = expectedStatic(lang, ex, ex.sizeLabels.small, ex.methodLabels.fishless, '3–4', ex.welfareNote, ex.plantsYesNote);
  h = subOnce(h,
    '<p id="expected-text">With a <strong>small tank</strong>, <strong>fishless cycling</strong>, and <strong>plants</strong> — expect the cycle to complete in roughly <strong>3–4 weeks</strong>. Ammonia will peak first, then nitrite, then both will fall as bacteria establish. Plants will help keep nitrate manageable.</p>',
    `<p id="expected-text">${defaultSentence}</p>`,
    'setup.expectedDefault');
  return h;
}

function patchBrief(h, t) {
  const b = t.brief;
  h = subOnce(h, '<h2 class="ot" style="margin-bottom:.35rem">Before you begin</h2>', `<h2 class="ot" style="margin-bottom:.35rem">${b.heading}</h2>`, 'brief.heading');
  h = subOnce(h, '<p class="om" style="font-size:var(--fs-xs);margin-bottom:0;color:var(--th-ink-4)">Essentials below — details inside the guide.</p>',
    `<p class="om" style="font-size:var(--fs-xs);margin-bottom:0;color:var(--th-ink-4)">${b.sub}</p>`, 'brief.sub');
  h = subOnce(h, 'One simulated day every 8 seconds. Pause, read the log, and use <strong style="color:var(--th-ink-2);font-weight:500">+1d</strong> when you want time to jump ahead.',
    b.intro, 'brief.intro');
  h = subOnce(h, '<summary>Full guide — controls &amp; rules</summary>', `<summary>${b.disclosureSummary}</summary>`, 'brief.disclosureSummary');
  const tips = [
    ['Time', 'Let it run. The log explains what is happening as it unfolds.'],
    ['Equipment', 'Heater, filter, and light are on by default. Tap any of them to toggle off — and see what actually happens to the cycle.'],
    ['Fish-in only', 'Feed every 1–2 days. After 4 days without food fish begin to weaken — stressed fish are less tolerant of ammonia.'],
    ['Bacteria starter', 'Seed works once. Use it after a few days — bacteria need some ammonia present first before seeding helps.'],
    ['Pause and skip', 'Pause to read carefully. Use <strong style="color:var(--th-ink-3);font-weight:500">+1d</strong> in the top bar to skip forward one day when you are waiting.']
  ];
  tips.forEach(([k, body], i) => {
    const v = b.tips[i];
    h = subOnce(h, `<div class="brief-tip-k">${k}</div>\n            <p>${body}</p>`,
      `<div class="brief-tip-k">${v.k}</div>\n            <p>${v.body}</p>`, `brief.tip.${i}`);
  });
  h = subOnce(h, '<div class="goal-card-h">What you are trying to do</div>', `<div class="goal-card-h">${b.goalHeading}</div>`, 'brief.goalHeading');
  h = subOnce(h, 'Get ammonia and nitrite down to near zero — and keep them there for three days in a row. That means your bacteria colony is mature enough to process waste continuously. You will see <em style="color:rgba(61,214,232,.95);font-style:normal">Stable ✓</em> in the bacteria panel when the cycle is complete.',
    b.goalP1, 'brief.goalP1');
  h = subOnce(h, 'The cycle crashes if ammonia or nitrite stays too high for too long — or if fish go without food. There is no time limit. The biology moves at its own pace.',
    b.goalP2, 'brief.goalP2');
  h = subOnce(h, '<button class="obtn op" id="btn-brief-go" style="width:100%">Start the simulation →</button>',
    `<button class="obtn op" id="btn-brief-go" style="width:100%">${b.btn}</button>`, 'brief.btn');
  return h;
}

function patchEnd(h, t) {
  const e = t.end;
  h = subOnce(h, '<h2 class="ot" id="ov-title">The cycle didn\'t complete this time.</h2>', `<h2 class="ot" id="ov-title">${e.titleDefault}</h2>`, 'end.titleDefault');
  h = subOnce(h, '<div class="rpt-heading">Simulation report</div>', `<div class="rpt-heading">${e.reportHeading}</div>`, 'end.reportHeading');
  h = subOnce(h, '<summary>Reflection &amp; coaching</summary>', `<summary>${e.reflectionSummary}</summary>`, 'end.reflectionSummary');
  h = subOnce(h, '<div class="goal-card-h">Next best action</div>', `<div class="goal-card-h">${e.goalHeading}</div>`, 'end.goalHeading');
  h = subOnce(h, '<p>Take the stable settings from this simulation, then use the same setup on your real tank for 7 days (feeding, water changes, and a consistent lighting schedule).</p>',
    `<p>${e.goalBody}</p>`, 'end.goalBody');
  h = subOnce(h, '<button class="obtn op" id="btn-restart" style="width:100%;margin:0">Try again</button>',
    `<button class="obtn op" id="btn-restart" style="width:100%;margin:0">${e.retryBtn}</button>`, 'end.retryBtn');
  h = subOnce(h, 'data-cta="simulator_to_new_tank">Apply this to real tank →</a>', `data-cta="simulator_to_new_tank">${e.applyBtn}</a>`, 'end.applyBtn');
  h = subOnce(h, '<a href="/tools" class="obtn os" style="width:100%;margin:0;text-align:center;box-sizing:border-box">Back to tools</a>',
    `<a href="/tools" class="obtn os" style="width:100%;margin:0;text-align:center;box-sizing:border-box">${e.backToolsBtn}</a>`, 'end.backToolsBtn');
  return h;
}

function patchAppChrome(h, t, lang) {
  const a = t.app;
  h = subAll(h, 'aria-label="Menu" aria-expanded="false" title="Menu"', `aria-label="${a.settingsAria}" aria-expanded="false" title="${a.settingsTitle}"`, 1, 'app.settingsBtn');
  h = subOnce(h, '<span class="t-day" id="t-day">Day 1</span>', `<span class="t-day" id="t-day">${a.day1}</span>`, 'app.tday');
  h = subOnce(h, '<span class="t-status" id="t-status">Setting up</span>', `<span class="t-status" id="t-status">${a.settingUp}</span>`, 'app.tstatus');
  h = subOnce(h, 'onclick="skipDay()" title="Skip one day">+1d</button>', `onclick="skipDay()" title="${a.skipTitle}">${a.skipBtn}</button>`, 'app.skipBtn');
  h = subOnce(h, '<button class="btn-sm btn-pp" id="btn-pp">⏸ Pause</button>', `<button class="btn-sm btn-pp" id="btn-pp">${a.pauseBtn}</button>`, 'app.pauseBtn');
  h = subOnce(h, "btn.textContent=running?'⏸ Pause':'▶ Resume';", `btn.textContent=running?'${a.pauseBtn}':'${a.resumeBtn}';`, 'app.pauseToggle');
  h = subOnce(h, "pp.textContent='⏸ Pause';", `pp.textContent='${a.pauseBtn}';`, 'app.pauseResetDefault');
  h = subOnce(h, '<span class="pc-lbl">Ammonia <span class="pc-unit">ppm</span></span>', `<span class="pc-lbl">${a.ammoniaLbl} <span class="pc-unit">ppm</span></span>`, 'app.ammoniaLbl');
  h = subOnce(h, '<span class="pc-lbl">Nitrite <span class="pc-unit">ppm</span></span>', `<span class="pc-lbl">${a.nitriteLbl} <span class="pc-unit">ppm</span></span>`, 'app.nitriteLbl');
  h = subOnce(h, '<span class="pc-lbl">Nitrate <span class="pc-unit">ppm</span></span>', `<span class="pc-lbl">${a.nitrateLbl} <span class="pc-unit">ppm</span></span>`, 'app.nitrateLbl');
  h = subOnce(h, '<span class="pc-lbl">Fish</span>', `<span class="pc-lbl">${a.fishLbl}</span>`, 'app.fishLbl');
  h = subOnce(h, '<span class="pc-lbl">Plants</span>', `<span class="pc-lbl">${a.plantsLbl}</span>`, 'app.plantsLbl');
  h = subOnce(h, '<span id="tmsg-txt">Setting up...</span>', `<span id="tmsg-txt">${a.settingUpDots}</span>`, 'app.settingUpDots');
  h = subOnce(h, 'data-tip="Keeps water at 26°C. Bacteria grow ~50% faster at optimal temperature.">', `data-tip="${a.heaterTip}">`, 'app.heaterTip');
  h = subOnce(h, '<span class="eq-lbl">Heater</span>', `<span class="eq-lbl">${a.heaterLbl}</span>`, 'app.heaterLbl');
  h = subOnce(h, 'data-tip="Where bacteria live. Without it, the cycle almost cannot complete.">', `data-tip="${a.filterTip}">`, 'app.filterTip');
  h = subOnce(h, '<span class="eq-lbl">Filter</span>', `<span class="eq-lbl">${a.filterLbl}</span>`, 'app.filterLbl');
  h = subOnce(h, 'data-tip="Tap to cycle: Off → Low → Med → High. Affects plants and algae.">', `data-tip="${a.lightTip}">`, 'app.lightTip');
  h = subOnce(h, '<span class="eq-lbl">Light</span>', `<span class="eq-lbl">${a.lightLbl}</span>`, 'app.lightLbl');
  h = subOnce(h, '<span class="eq-temp" id="eq-light-lbl">Med</span>', `<span class="eq-temp" id="eq-light-lbl">${t.engine.misc.med}</span>`, 'app.lightLblDefault');
  h = subOnce(h, 'role="tablist" aria-label="Simulator panels">', `role="tablist" aria-label="${a.simTabsAria}">`, 'app.simTabsAria');
  h = subOnce(h, 'id="tab-sim-status">Status</button>', `id="tab-sim-status">${a.statusTab}</button>`, 'app.statusTab');
  h = subOnce(h, 'id="tab-sim-log">Log</button>', `id="tab-sim-log">${a.logTab}</button>`, 'app.logTab');
  h = subOnce(h, 'color:var(--th-ink-5)">Bacteria Colony</span>', `color:var(--th-ink-5)">${a.bacteriaColony}</span>`, 'app.bacteriaColony');
  h = subOnce(h, 'id="bac-status" style="font-size:var(--fs-sm);letter-spacing:.03em;color:var(--th-ink-4)">Seeding</span>',
    `id="bac-status" style="font-size:var(--fs-sm);letter-spacing:.03em;color:var(--th-ink-4)">${a.seeding}</span>`, 'app.bacStatusDefault');
  h = subOnce(h, 'min-width:54px;letter-spacing:.01em;line-height:1.3">Nitrosomonas<br>', `min-width:54px;letter-spacing:.01em;line-height:1.3">${a.nitrosomonasLbl}<br>`, 'app.nitrosomonasLbl');
  h = subOnce(h, 'min-width:54px;letter-spacing:.01em;line-height:1.3">Nitrospira<br>', `min-width:54px;letter-spacing:.01em;line-height:1.3">${a.nitrospiraLbl}<br>`, 'app.nitrospiraLbl');
  h = subOnce(h, 'text-transform:uppercase">Stable days</span>', `text-transform:uppercase">${a.stableDaysLbl}</span>`, 'app.stableDaysLbl');
  h = subOnce(h, 'color:var(--th-ink-4);line-height:1.4">3 consecutive days with ammonia and nitrite near zero — then the cycle is complete.</span>',
    `color:var(--th-ink-4);line-height:1.4">${a.stableDaysNote}</span>`, 'app.stableDaysNote');
  h = subOnce(h, '<span class="ib-lbl">What is happening</span>', `<span class="ib-lbl">${a.whatsHappening}</span>`, 'app.whatsHappening');
  h = subOnce(h, '<span class="ib-txt" id="ib-txt">Your tank is ready. The cycle will begin when you add an ammonia source.</span>',
    `<span class="ib-txt" id="ib-txt">${a.insightDefault}</span>`, 'app.insightDefault');
  h = subOnce(h, '<span class="ml-lbl">Recent activity</span>', `<span class="ml-lbl">${a.recentActivity}</span>`, 'app.recentActivity');
  h = subAll(h, '<span class="ld">Day 1</span><span>Tank set up. Ready to begin cycling.</span>',
    `<span class="ld">${a.day1}</span><span>${a.logDefault}</span>`, 2, 'app.logDefault');
  h = subOnce(h, 'text-align:center">How much water to change?</div>', `text-align:center">${a.waterPickerQ}</div>`, 'app.waterPickerQ');
  h = subOnce(h, '>Cancel</button></div>', `>${a.cancelBtn}</button></div>`, 'app.cancelBtn');
  h = subOnce(h, '<span class="an" id="act-source-name">Add ammonia</span>\n      <span class="ah">Starts cycle</span>',
    `<span class="an" id="act-source-name">${a.sourceAmmonia}</span>\n      <span class="ah">${a.sourceStart}</span>`, 'app.actSource');
  h = subOnce(h, '</svg></span><span class="an">Feed</span><span class="ah">Fish-in only</span>',
    `</svg></span><span class="an">${a.feedName}</span><span class="ah">${a.feedHintDefault}</span>`, 'app.actFeed');
  h = subOnce(h, '</svg></span><span class="an">Water change</span><span class="ah">Choose amount</span>',
    `</svg></span><span class="an">${a.waterChangeName}</span><span class="ah">${a.waterChangeHint}</span>`, 'app.actWater');
  h = subOnce(h, '</svg></span><span class="an">Add plants</span><span class="ah">Buffers nitrate</span>',
    `</svg></span><span class="an">${a.plantName}</span><span class="ah">${a.plantHint}</span>`, 'app.actPlant');
  h = subOnce(h, '</svg></span><span class="an">Seed</span><span class="ah">Bacteria starter</span>',
    `</svg></span><span class="an">${a.seedName}</span><span class="ah">${a.seedHint}</span>`, 'app.actSeed');
  return h;
}

function patchEngine(h, t) {
  const e = t.engine;
  // ── addLog narration (unique full-sentence matches) ──
  const addLogPairs = [
    ['Ammonia source is running low — organic matter has nearly finished decomposing. Add more ammonia if the cycle is not yet established.', e.ammLow],
    ['Ammonia source exhausted. No new ammonia is entering the tank. Bacteria will process what remains.', e.ammDone],
    ['Day 5 without food. Fish begin showing stress — clamped fins, reduced movement. Glycogen stores are depleted.', e.hungry5],
    ['Fish critically malnourished. Muscle tissue is being metabolised. Immune function is failing.', e.hungry7],
    ['Ammonia above 3 ppm is beginning to inhibit Nitrospira activity. High ammonia is not just dangerous for fish — at extreme levels it also slows the second stage of the cycle.', e.inhib],
    ['Ammonia spike detected. This can happen when organic matter decomposes faster than bacteria can process — a normal part of an unstable cycle.', e.spikeAmmonia],
    ['Nitrite spike. Nitrosomonas are converting ammonia faster than Nitrospira can process the nitrite. The second colony is still establishing.', e.spikeNitrite],
    ['Plants are not receiving light. Without photosynthesis they cannot grow — and will begin to decay, adding to the organic load.', e.noLight],
    ['Algae is proliferating. High light intensity combined with elevated nitrate creates ideal conditions for rapid algae growth.', e.algaeBloom],
    ['Cycle established. Parameters have been stable for several consecutive days. Both colonies are self-sustaining.', e.cycleEstablished],
    ['The fish have died from starvation and stress. Without regular feeding, metabolic function collapsed.', e.fishStarved],
    ['Heater on. Tank temperature returning to 26°C. Bacterial activity will increase.', e.heaterOn],
    ['Heater off. Water temperature will begin to drop. Below 20°C, bacterial growth slows significantly.', e.heaterOff],
    ['Filter on. Water circulation restored. Bacteria colonising filter media will resume processing.', e.filterOn],
    ['Filter off. Bacteria on the media are losing their oxygen supply — they are aerobic and depend on oxygenated water flowing through the filter. Without it, the colony becomes dormant. The cycle will stall.', e.filterOff],
    ['Bacteria starter already added.', e.seedAlready],
    ['Bacteria starter added. Nitrosomonas and Nitrospira seeded onto surfaces. Expect noticeably faster colonisation.', e.seedAdded],
    ['Light off. Plants will begin to suffer — photosynthesis requires light. Algae will shift toward low-light tolerant species.', e.light0],
    ['Low light. Plants grow slowly. Diatoms (brown algae) may increase — they thrive under low light conditions.', e.light1],
    ['Medium light. A good balance for most planted tanks. Algae is manageable if nutrients are not excessive.', e.light2],
    ['High light. Plants grow faster — but so does algae, especially if CO₂ and nutrients are not matched. Watch for outbreaks.', e.light3],
    ['Ammonia source is already sufficient.', e.ammSourceSufficient],
    ['The tank is carrying enough fish for now.', e.enoughFishNow],
    ['Nothing to feed yet — no fish in a fishless cycle.', e.nothingToFeedFishless],
    ['Add fish first.', e.addFishFirst],
    ['Fed again. Excess food decomposes faster than bacteria can process — ammonia is rising.', e.fedAgainOverfeed],
    ['Overfeeding. Uneaten food is polluting the water. Bacteria cannot keep up with this load.', e.overfeeding],
    ['Tank is well planted.', e.tankWellPlanted],
    ['Plants added. Will absorb nitrate over time.', e.plantsAddedGood],
    ['A brown film is forming on surfaces — diatom algae (Bacillariophyceae). Normal in new tanks. They feed on silicates and excess light. Will fade as the tank matures.', e.diatomStart]
  ];
  addLogPairs.forEach(([oldS, newS], i) => { h = subOnce(h, oldS, newS, `engine.addLog.${i}`); });

  h = subOnce(h, "'Temperature at '+S.temp.toFixed(0)+'°C. Bacterial metabolism is slowing — Nitrospira are especially temperature-sensitive.'",
    `'${e.coldTemp.split('{temp}')[0]}'+S.temp.toFixed(0)+'${e.coldTemp.split('{temp}')[1]}'`, 'engine.coldTemp');

  h = subOnce(h, "addLog('Ammonia added. Cycle progressing.'+( S.ammSource===1?' Bacteria will begin arriving soon.':''),'');",
    `addLog('${e.ammoniaAdded}'+( S.ammSource===1?'${e.bacteriaArriving}':''),'');`, 'engine.ammoniaAdded');
  h = subOnce(h, "addLog('Added a fish. Total: '+S.fish+'.'+( S.fish>2?' Watch ammonia carefully.':''),S.fish>2?'warn':'');",
    `addLog('${e.fishAdded.split('{n}')[0]}'+S.fish+'${e.fishAdded.split('{n}')[1]}'+( S.fish>2?'${e.watchAmmoniaCarefully}':''),S.fish>2?'warn':'');`, 'engine.fishAdded');
  h = subOnce(h, "? 'Fed. Bacteria are processing waste — parameters should stay stable.'\n        : 'Fed. Waste is adding to ammonia load.';",
    `? '${e.fedProcessing}'\n        : '${e.fedAddingLoad}';`, 'engine.feedMsg');

  // ── cycleLight labels/messages ──
  h = subOnce(h, "var labels=['Off','Low','Med','High'];", `var labels=['${t.engine.misc.off}','${t.engine.misc.low}','${t.engine.misc.med}','${t.engine.misc.high}'];`, 'engine.lightLabels');

  h = subOnce(h, "addLog('Tank ready. Heater, filter, and light are on by default — tap to toggle. Watch the bacteria bar as the cycle progresses. The log will explain what is happening.','');",
    `addLog('${e.readyMessage}','');`, 'engine.readyMessage', );

  return h;
}

// Matches dayConcat() below in spirit — the "Day 0" placeholder text embedded
// in insightGroups[2][0] (patched further down) and the runtime
// txt.replace('Day 0', 'Day '+s.day) call in getInsight() must use the same
// literal fragment per language, or the runtime replace silently no-ops.
function dayZeroText(lang) { return lang === 'ja' ? '0日目' : 'Hari 0'; }

function patchEngine2(h, t, lang) {
  const e = t.engine;
  // ── insightGroups (12 groups × 3 msgs, in document order) ──
  const groupsEn = [
    ['The tank is ready. Add an ammonia source to begin the nitrogen cycle.', '💧 An empty tank has no biology yet. Ammonia is what brings bacteria in.', 'Fishless cycling is the kinder method — no fish experience the difficult early weeks.'],
    ['🐠 The tank is ready. Add your first fish to begin the cycle.', 'Watch ammonia closely once fish are added — they produce waste continuously.', 'Start with fewer fish than you plan to keep. The cycle will be easier to manage.'],
    ["🔬 Day '+0+'. Bacteria are beginning to seed onto surfaces. Invisible but already working.", 'The early days look quiet — but colonisation has begun on filter media and substrate.', '⏳ Nothing to do right now. This phase is about time, not action.'],
    ['Ammonia is rising. This is normal — bacteria are not yet numerous enough to process it.', '🟡 Elevated ammonia is the first sign the cycle is fuelling. Resist the urge to intervene.', 'The bacteria feeding on ammonia (Nitrosomonas) are multiplying now. Give them time.'],
    ['⚠️ Ammonia is getting high. If fish are present, a small water change will help.', 'High ammonia damages fish gills directly. It does not need to be lethal to cause harm.', 'A 10-15% water change dilutes ammonia without washing away bacteria. Small and steady.'],
    ['Nitrite is rising — Nitrosomonas are converting ammonia successfully. Stage one is working.', '🟠 Nitrite spike means stage one is working. Nitrospira — the dominant second-stage bacteria — are still establishing.', 'This is the most dangerous phase for fish — nitrite blocks oxygen uptake in the blood.'],
    ['🔴 Nitrite is very high. If fish are present, a water change is needed now.', 'High nitrite causes brown blood disease in fish — haemoglobin cannot carry oxygen.', 'Nitrospira are slower to establish than Nitrosomonas. This is why nitrite peaks after ammonia. Patience.'],
    ['🌱 Bacterial colonies are reaching maturity. The end of the cycle is getting close.', 'Both stages are now active. Parameters should begin stabilising soon.', 'Watch for ammonia and nitrite falling together — that is the sign the cycle is completing.'],
    ['✅ Cycle established. The tank is now self-sustaining. Well done.', '🎉 Both bacterial colonies are stable and processing continuously.', 'Nitrate will accumulate from here — monitor it and change water regularly.'],
    ['Nitrate is building. Regular partial water changes will keep it manageable.', '💧 A weekly 15-25% water change is the most effective nitrate control.', 'Live plants absorb nitrate too — a well-planted tank needs fewer water changes.'],
    ['⚠️ Multiple water changes this early may be slowing progress.', 'Each large water change removes some bacteria along with the ammonia.', 'Smaller, less frequent changes are better during an active cycle.'],
    ['😰 Fish are showing stress. Surface breathing is an early warning.', 'Stressed fish have suppressed immunity — disease risk increases.', 'Check ammonia and nitrite. One of them is likely the cause.'],
    ['🌡️ Temperature is dropping. Bacterial growth slows significantly below 22°C.', 'Nitrospira are especially cold-sensitive — below 22°C the second stage slows significantly.', 'Turn the heater on to restore optimal conditions (25-27°C).'],
    ['🌀 No filter running. Bacteria are losing their primary colonisation surface.', 'Without circulation, dissolved oxygen drops — bacteria become less active.', 'Even a simple sponge filter makes a significant difference to cycling speed.']
  ];
  h = subOnce(h, "'🔬 Day '+0+'. Bacteria are beginning to seed onto surfaces. Invisible but already working.'",
    `'${t.engine.insightGroups[2][0].replace('{day}', "'+0+'")}'`, 'engine.insight.2.0');
  h = subOnce(h, "return txt.replace('Day '+0,'Day '+s.day);",
    `return txt.replace('${dayZeroText(lang)}',${dayConcat(lang, 's.day')});`, 'engine.insightDayReplace');
  groupsEn.forEach((msgs, gi) => {
    msgs.forEach((oldS, mi) => {
      if (gi === 2 && mi === 0) return; // handled above (contains +0+ concatenation, not a plain literal)
      const newS = t.engine.insightGroups[gi][mi];
      h = subOnce(h, `'${oldS.replace(/'/g, "\\'")}'`, `'${newS.replace(/'/g, "\\'")}'`, `engine.insight.${gi}.${mi}`);
    });
  });
  const idleEn = ['The system is still settling. This is normal.', '🔬 Biology works on its own schedule.', 'Every stable tank went through exactly this phase.', 'The best thing you can do right now is watch.'];
  idleEn.forEach((oldS, i) => { h = subOnce(h, oldS, e.idle[i], `engine.idle.${i}`); });
  return h;
}

function patchEngine3(h, t) {
  const e = t.engine, g = t.engine.genLog;
  h = subOnce(h, "addLog('Ammonia critically high.'+( S.fish>0?' Fish in acute danger — gills are being damaged.':''),'danger');",
    `addLog('${g.ammCritical}'+( S.fish>0?'${g.ammCriticalFishSuffix}':''),'danger');`, 'genLog.ammCritical');
  h = subOnce(h, "addLog('Ammonia elevated. Bacteria are building but not yet sufficient.','warn');", `addLog('${g.ammElevated}','warn');`, 'genLog.ammElevated');
  h = subOnce(h, "addLog('Nitrite spike. Nitrospira colonies are still establishing — this is the normal mid-cycle pattern, but dangerous for fish.','warn');", `addLog('${g.no2Spike}','warn');`, 'genLog.no2Spike');
  h = subOnce(h, "addLog('Nitrate accumulating. A partial water change would help.','warn');", `addLog('${g.no3Building}','warn');`, 'genLog.no3Building');
  h = subOnce(h, "addLog('Parameters stable. Bacterial colonies are self-sustaining.','good');", `addLog('${g.paramsStable}','good');`, 'genLog.paramsStable');
  h = subOnce(h, "addLog('Nitrosomonas colonies growing. Nitrite will begin rising soon.','');", `addLog('${g.nitrosomonasGrowing}','');`, 'genLog.nitrosomonasGrowing');
  h = subOnce(h, "addLog('Nitrospira colonies are growing. Nitrite should begin falling soon.','');", `addLog('${g.nitrospiraGrowing}','');`, 'genLog.nitrospiraGrowing');
  h = subOnce(h,
    "addLog('Fish showing stress signs — slower movement, reduced colour. Health: '+((S.fishHealth||100)).toFixed(0)+'%.','warn');",
    `addLog('${g.fishStressSigns.split('{pct}')[0]}'+((S.fishHealth||100)).toFixed(0)+'${g.fishStressSigns.split('{pct}')[1]}','warn');`, 'genLog.fishStressSigns');
  h = subOnce(h,
    "addLog('Fish in poor condition. Immune function compromised — disease risk rising. Health: '+((S.fishHealth||100)).toFixed(0)+'%.','danger');",
    `addLog('${g.fishPoorCondition.split('{pct}')[0]}'+((S.fishHealth||100)).toFixed(0)+'${g.fishPoorCondition.split('{pct}')[1]}','danger');`, 'genLog.fishPoorCondition');

  const narrEn = [
    'Day 3. Invisible activity has begun. Ammonia-oxidising bacteria are seeding from the air, water, and any surfaces you introduced.',
    'Bacterial colonies are microscopic at this stage. You cannot see them, but they are there — multiplying slowly on filter media and substrate.',
    'Nitrite appearing is a sign the first stage is working. Nitrosomonas are converting ammonia — Nitrospira now have substrate to establish on.',
    'Week two. The most difficult waiting period. Parameters may look chaotic — this is normal. The biology is reorganising itself.',
    'In a real tank, colonies reach self-sustaining density around weeks 3-4. This simulation runs faster — but the biology it models is the same.',
    'Day 25. Some cycles complete by now — others take 6-8 weeks. If parameters are still unstable, the system is still working.'
  ];
  narrEn.forEach((oldS, i) => { h = subOnce(h, oldS, e.narratives[i], `genLog.narrative.${i}`); });

  h = subOnce(h, "addLog('Diatoms are receding. As the cycle stabilises, competing algae and reduced silicates make conditions less favourable for them.','good');",
    `addLog('${e.diatomFade}','good');`, 'genLog.diatomFade');
  return h;
}

function patchEngine4(h, t) {
  const gu = t.engine.guide, w = t.engine.waterChange, r = t.engine.report, m = t.engine.misc;

  h = subOnce(h, "icon=S.fishless?'🧪':'🐠'; text=S.fishless?'Add an ammonia source to begin':'Add fish to begin the cycle';",
    `icon=S.fishless?'🧪':'🐠'; text=S.fishless?'${gu.addAmmonia}':'${gu.addFish}';`, 'guide.begin');
  h = subOnce(h, "icon='🥣'; text='Fish need feeding — don\\'t skip days';", `icon='🥣'; text='${gu.feedNeeded.replace(/'/g, "\\'")}';`, 'guide.feed');
  h = subOnce(h, "icon='⏳'; text='The cycle is seeding. Leave it alone for now.';", `icon='⏳'; text='${gu.seeding}';`, 'guide.seeding');
  h = subOnce(h, "icon='🚨'; text='Ammonia critical — water change now';", `icon='🚨'; text='${gu.ammoniaCritical}';`, 'guide.ammCritical');
  h = subOnce(h, "icon='💧'; text='Ammonia elevated — consider a water change';", `icon='💧'; text='${gu.ammoniaElevatedConsider}';`, 'guide.ammElevated');
  h = subOnce(h, "icon='⏳'; text='Bacteria are working — nothing to do but wait';", `icon='⏳'; text='${gu.bacteriaWorking}';`, 'guide.bacWorking');
  h = subOnce(h, "icon='💧'; text='Nitrate is building — the tank needs a water change';", `icon='💧'; text='${gu.nitrateBuilding}';`, 'guide.no3Building');
  h = subOnce(h, "icon='⛔'; text='Too many changes. Stop intervening — let bacteria recover.';", `icon='⛔'; text='${gu.tooManyChanges}';`, 'guide.tooManyChanges');

  h = subOnce(h,
    "msg=pct+'% water change. Parameters diluted. Bacteria remain on filter media — small changes like this have no meaningful impact on the colony.';",
    `msg=pct+'${w.small.replace('{pct}', '')}';`, 'wc.small');
  h = subOnce(h,
    "msg=pct+'% water change. Bacteria stay on filter surfaces. At this size, some chemistry shift is possible — and you have removed some ammonia the bacteria were processing. Expect a minor slowdown.';",
    `msg=pct+'${w.medium.replace('{pct}', '')}';`, 'wc.medium');
  h = subOnce(h,
    "msg=pct+'% water change. The colony is not washed out, but this size of change causes real chemistry disruption. Bacterial metabolism slows under sudden pH and mineral shifts. Ammonia substrate is also gone for a day or two.';",
    `msg=pct+'${w.large.replace('{pct}', '')}';`, 'wc.large');
  h = subOnce(h,
    "msg=pct+'% water change — near-complete reset. The colony survives, but chemistry shock, complete substrate loss, and physical disturbance to the filter will set it back noticeably. Reserve this for genuine emergencies only.';",
    `msg=pct+'${w.extreme.replace('{pct}', '')}';`, 'wc.extreme');

  // ── render()/showEnd()/buildReport() dynamic labels ──
  h = subOnce(h, "var st='Setting up';", `var st='${t.app.settingUp}';`, 'render.statusDefault');
  h = subOnce(h, "if(S.cycleOk)st='Cycle complete ✓';\n    else if(S.bacA>.5)st='Nearly cycled';\n    else if(S.bacA>.2)st='Cycle building';\n    else st='Early cycle';",
    `if(S.cycleOk)st='${m.cycleComplete}';\n    else if(S.bacA>.5)st='${m.nearlyCycled}';\n    else if(S.bacA>.2)st='${m.cycleBuilding}';\n    else st='${m.earlyCycle}';`, 'render.status');
  h = subOnce(h, "var txt=S.fishless?'Add an ammonia source to begin.':'🐠 Add fish to begin.';",
    `var txt=S.fishless?'${m.tmsgFishless}':'${m.tmsgFishIn}';`, 'render.tmsg');
  h = subOnce(h,
    "var stLabel=S.cycleOk?'Stable \\u2713':\n                sd>0?'Stabilising ('+sd+'/3)':\n                avgBac>.8?'Nearly there':\n                avgBac>.5?'Establishing':\n                avgBac>.2?'Growing':'Seeding';",
    `var stLabel=S.cycleOk?'${m.bacStable}':\n                sd>0?'${m.bacStabilising.split('{n}')[0]}'+sd+'${m.bacStabilising.split('{n}')[1]}':\n                avgBac>.8?'${m.bacNearlyThere}':\n                avgBac>.5?'${m.bacEstablishing}':\n                avgBac>.2?'${m.bacGrowing}':'${m.bacSeeding}';`, 'render.bacStatus');

  h = subOnce(h, "var titles={won:'Nicely done — the cycle is complete.',crashed:'The cycle didn\\'t complete this time.'};", `var titles={won:'${r.titleWon}',crashed:'${r.titleCrashed}'};`, 'showEnd.titles');
  h = subOnce(h, "document.getElementById('ov-title').textContent=titles[type]||'Simulation ended.';",
    `document.getElementById('ov-title').textContent=titles[type]||'${r.titleCrashed}';`, 'showEnd.titleFallback');
  h = subOnce(h,
    "var wcNote=S.totalWc>6?'Too frequent — repeated changes disrupt water chemistry and remove ammonia the colony needs':\n             S.totalWc===0?'None done — nitrate may have accumulated unchecked':\n             S.totalWc<=3?'Well managed — small and targeted':'Reasonable';",
    `var wcNote=S.totalWc>6?'${r.wcNoteFrequent}':\n             S.totalWc===0?'${r.wcNoteNone}':\n             S.totalWc<=3?'${r.wcNoteWell}':'${r.wcNoteReasonable}';`, 'report.wcNote');
  h = subOnce(h,
    "msg=S.fishless\n      ?'Day '+S.day+' — the bacteria colony established safely, with no losses along the way.'\n      :'Day '+S.day+' — the cycle completed successfully, fish and all.';",
    `msg=S.fishless\n      ?'${r.msgWonFishless.split('{day}')[0]}'+S.day+'${r.msgWonFishless.split('{day}')[1]}'\n      :'${r.msgWonFishIn.split('{day}')[0]}'+S.day+'${r.msgWonFishIn.split('{day}')[1]}';`, 'showEnd.msgWon');
  h = subOnce(h,
    "msg=S.fishHealth<=0\n      ?'The fish went without enough food for too long, and the accumulated stress proved fatal.'\n      :'Ammonia or nitrite built up to a level the fish couldn\\'t survive — a hard but common lesson in a first cycle.';",
    `msg=S.fishHealth<=0\n      ?'${r.msgCrashedStarved}'\n      :'${r.msgCrashedWater}';`, 'showEnd.msgCrashed');

  h = subOnce(h, "row('Days elapsed', S.day+' days', null, false);", `row('${r.rowDaysElapsed}', S.day+'${r.rowDaysValue.replace('{day}', '')}', null, false);`, 'report.rowDays');
  h = subOnce(h,
    "row('Method', S.fishless?'Fishless':'Fish-in',\n    S.fishless?'No animals exposed to ammonia stress':'Fish experienced elevated ammonia and nitrite',\n    !S.fishless&&type==='crashed');",
    `row('${r.rowMethod}', S.fishless?'${r.methodFishless}':'${r.methodFishIn}',\n    S.fishless?'${r.methodFishlessNote}':'${r.methodFishInNote}',\n    !S.fishless&&type==='crashed');`, 'report.rowMethod');
  h = subOnce(h, "row('Water changes', S.totalWc+' total', wcNote, wcWarn);",
    `row('${r.rowWaterChanges}', S.totalWc+'${r.waterChangesValue.replace('{n}', '')}', wcNote, wcWarn);`, 'report.rowWc');
  h = subOnce(h,
    "if(!S.fishless) row('Fish feeding',\n    feedWarn?'Insufficient':'Managed',\n    feedWarn?'Fish went '+S.daysSinceFed+' days unfed — need food every 1-4 days':'Good',\n    feedWarn);",
    `if(!S.fishless) row('${r.rowFishFeeding}',\n    feedWarn?'${r.feedInsufficient}':'${r.feedManaged}',\n    feedWarn?'${r.feedNoteInsufficient.split('{n}')[0]}'+S.daysSinceFed+'${r.feedNoteInsufficient.split('{n}')[1]}':'${r.feedNoteGood}',\n    feedWarn);`, 'report.rowFeed');
  h = subOnce(h,
    "row('Heater', S.heater?'On throughout':'Off at some point',\n    heatWarn?'Temperature fell — bacteria slow significantly below 22°C':'Stable temperature throughout',\n    heatWarn);",
    `row('${r.rowHeater}', S.heater?'${r.heaterOnThroughout}':'${r.heaterOffAtSomePoint}',\n    heatWarn?'${r.heatNoteFell}':'${r.heatNoteStable}',\n    heatWarn);`, 'report.rowHeater');
  h = subOnce(h,
    "row('Filter', S.filter?'On throughout':'Turned off',\n    filterWarn?'Without filter: bacteria lose primary surface area and oxygen':'Filter running — bacteria had full access to media',\n    filterWarn);",
    `row('${r.rowFilter}', S.filter?'${r.filterOnThroughout}':'${r.filterTurnedOff}',\n    filterWarn?'${r.filterNoteWithout}':'${r.filterNoteRunning}',\n    filterWarn);`, 'report.rowFilter');
  h = subOnce(h,
    "row('Bacteria starter', S.seeded?'Used':'Not used',\n    S.seeded?'Provided a head-start for colony seeding':null, false);",
    `row('${r.rowBacteriaStarter}', S.seeded?'${r.starterUsed}':'${r.starterNotUsed}',\n    S.seeded?'${r.starterNote}':null, false);`, 'report.rowStarter');
  h = subOnce(h,
    "row('Nitrosomonas (A)', (S.bacA*100).toFixed(0)+'%',\n    S.bacA>.75?'Fully established':S.bacA>.4?'Partially established':'Still seeding', S.bacA<.5);",
    `row('${r.rowNitrosomonas}', (S.bacA*100).toFixed(0)+'%',\n    S.bacA>.75?'${r.bacFullyEstablished}':S.bacA>.4?'${r.bacPartiallyEstablished}':'${r.bacStillSeeding}', S.bacA<.5);`, 'report.rowBacA');
  h = subOnce(h,
    "row('Nitrospira (B)', (S.bacB*100).toFixed(0)+'%',\n    S.bacB>.65?'Fully established':S.bacB>.3?'Growing':'Not yet active', S.bacB<.4);",
    `row('${r.rowNitrospira}', (S.bacB*100).toFixed(0)+'%',\n    S.bacB>.65?'${r.bacFullyEstablished}':S.bacB>.3?'${r.bacGrowing}':'${r.bacNotYetActive}', S.bacB<.4);`, 'report.rowBacB');

  h = subOnce(h,
    "var openings=['You did it — and more importantly, you did it the right way. The system had what it needed: time, stability, and a keeper who read it rather than fought it.','The cycle is complete. Every stable aquarium in the world got here through exactly this process. Now you know what it feels like from the inside.','Well done. Patience is the hardest part when something looks wrong. You practiced it here. That carries over into a real tank.'];",
    `var openings=['${r.openings[0].replace(/'/g, "\\'")}','${r.openings[1].replace(/'/g, "\\'")}','${r.openings[2].replace(/'/g, "\\'")}'];`, 'report.openings');
  h = subOnce(h,
    "var crashings=['This is not failure — it is data. The tank showed you something specific about what went wrong. That knowledge is worth more than a clean run.','Every experienced keeper has been here. What matters is understanding why. This report helps with that.','The cycle did not complete this time. Real tanks are more forgiving than simulations — and now you know what to watch for.'];",
    `var crashings=['${r.crashings[0].replace(/'/g, "\\'")}','${r.crashings[1].replace(/'/g, "\\'")}','${r.crashings[2].replace(/'/g, "\\'")}'];`, 'report.crashings');

  h = subOnce(h, "if(S.totalWc>6) advice='Water changes were frequent. The bacteria in your filter were not removed — but repeated large changes keep disrupting water chemistry and removing the ammonia the colony needs to grow on. Small, targeted changes only when parameters get dangerous is the better approach.';",
    `if(S.totalWc>6) advice='${r.adviceFrequentWc.replace(/'/g, "\\'")}';`, 'report.advice1');
  h = subOnce(h, "else if(filterWarn) advice='The filter was off for part of the run. In a real aquarium the filter is where most bacteria live. Without it, the biological foundation of the cycle collapses.';",
    `else if(filterWarn) advice='${r.adviceFilterOff.replace(/'/g, "\\'")}';`, 'report.advice2');
  h = subOnce(h, "else if(feedWarn) advice='Feeding was missed for too long. Fish need food every 1-4 days even during a difficult cycle. Starvation compounds ammonia stress — the two together are harder to recover from.';",
    `else if(feedWarn) advice='${r.adviceFeedMissed.replace(/'/g, "\\'")}';`, 'report.advice3');
  h = subOnce(h, "else if(heatWarn) advice='Temperature dropped significantly. Nitrospira — the dominant second-stage bacteria — are especially cold-sensitive — below 22\\u00b0C they slow dramatically. A reliable heater is one of the best investments in a new tank.';",
    `else if(heatWarn) advice='${r.adviceHeatDrop.replace(/'/g, "\\'")}';`, 'report.advice4');
  h = subOnce(h, "else if(type==='won'&&S.totalWc<=2) advice='Remarkably clean. Few changes, stable equipment, patient observation. In a real tank this approach produces the fastest and least stressful cycles.';",
    `else if(type==='won'&&S.totalWc<=2) advice='${r.adviceCleanWon.replace(/'/g, "\\'")}';`, 'report.advice5');
  h = subOnce(h, "else advice=type==='won'?'Everything was managed thoughtfully. Stable temperature, filter running, measured water changes. This is what good cycling looks like.':'Keep the filter running, maintain 25-27\\u00b0C, and resist large water changes during the early weeks. Those three things account for most cycling problems.';",
    `else advice=type==='won'?'${r.adviceManagedWon.replace(/'/g, "\\'")}':'${r.adviceGeneralCrash.replace(/'/g, "\\'")}';`, 'report.advice6');

  return h;
}

// ja counts days number-first ("N日目"), unlike id's word-first "Hari N" —
// same reasoning as expectedStatic/expectedDynamic above: per-language literal
// JS-concatenation fragments rather than one shared word-order template.
function dayConcat(lang, dayVarExpr) {
  if (lang === 'ja') return `${dayVarExpr}+'日目'`;
  return `'Hari '+${dayVarExpr}`;
}

function patchEngine5(h, t, lang) {
  const a = t.app, m = t.engine.misc;
  h = subOnce(h, "document.getElementById('t-day').textContent='Day '+S.day;", `document.getElementById('t-day').textContent=${dayConcat(lang, 'S.day')};`, 'engine.tdayLive');
  h = subOnce(h, "e.innerHTML='<span class=\"ld\">Day '+S.day+'</span><span>'+msg+'</span>';",
    `e.innerHTML='<span class="ld">'+${dayConcat(lang, 'S.day')}+'</span><span>'+msg+'</span>';`, 'engine.addLogDay');
  h = subOnce(h, "first.querySelector('.ld').textContent='Day '+S.day+' ×'+n;",
    `first.querySelector('.ld').textContent=${dayConcat(lang, 'S.day')}+' ×'+n;`, 'engine.addLogDayRepeat');
  h = subOnce(h, "if(lbl)lbl.textContent='Med';", `if(lbl)lbl.textContent='${m.med}';`, 'engine.medDefault');
  h = subOnce(h, "if(name)name.textContent=val==='fishless'?'Add ammonia':'Add fish';",
    `if(name)name.textContent=val==='fishless'?'${a.sourceAmmonia}':'${a.sourceFish}';`, 'engine.setupSourceName');
  h = subOnce(h, "document.getElementById('act-feed').querySelector('.ah').textContent=val==='fishless'?'More ammonia':'Adds ammonia';",
    `document.getElementById('act-feed').querySelector('.ah').textContent=val==='fishless'?'${a.feedMoreAmmonia}':'${a.feedAddsAmmonia}';`, 'engine.feedHintDynamic');
  h = subOnce(h, "if(srcName)srcName.textContent=S.fishless?'Add ammonia':'Add fish';",
    `if(srcName)srcName.textContent=S.fishless?'${a.sourceAmmonia}':'${a.sourceFish}';`, 'engine.beginSrcName');

  const ex = t.expected;
  h = subOnce(h,
    "var szLabel={small:'small',medium:'medium',large:'large'}[sz];",
    `var szLabel={small:'${ex.sizeLabels.small}',medium:'${ex.sizeLabels.medium}',large:'${ex.sizeLabels.large}'}[sz];`, 'expected.szLabel');
  h = subOnce(h, "var mtLabel=mt==='fishless'?'fishless cycling':'fish-in cycling';",
    `var mtLabel=mt==='fishless'?'${ex.methodLabels.fishless}':'${ex.methodLabels['fish-in']}';`, 'expected.mtLabel');
  h = subOnce(h, "var plNote=pl==='yes'?'Plants will help keep nitrate manageable.':'Without plants, monitor nitrate more closely.';",
    `var plNote=pl==='yes'?'${ex.plantsYesNote}':'${ex.plantsNoNote}';`, 'expected.plNote');
  h = subOnce(h, "var welfareNote=mt==='fishless'?' No animals will be harmed in the process.':'';",
    `var welfareNote=mt==='fishless'?'${ex.welfareNote}':'';`, 'expected.welfareNote');
  h = subOnce(h,
    "'With a <strong>'+szLabel+' tank</strong> and <strong>'+mtLabel+'</strong> — expect the cycle to complete in roughly <strong>'+wk+' weeks</strong>.'+welfareNote+' Ammonia peaks first, then nitrite, then both fall as bacteria establish. '+plNote;",
    expectedDynamic(lang, ex), 'expected.template');

  return h;
}

function buildLang(lang) {
  const tPath = path.join(TRANS_DIR, lang, `${SLUG}.json`);
  const t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
  const srcPath = path.join(ART_DIR, `${SLUG}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');

  h = patchHead(h, t, lang);
  h = patchBnav(h, lang);
  h = patchRhyssaSheet(h, lang);
  h = patchBriefing(h, t);
  h = patchSetup(h, t, lang);
  h = patchBrief(h, t);
  h = patchEnd(h, t);
  h = patchAppChrome(h, t, lang);
  h = patchEngine(h, t);
  h = patchEngine2(h, t, lang);
  h = patchEngine3(h, t);
  h = patchEngine4(h, t);
  h = patchEngine5(h, t, lang);
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
        const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (j._meta && j._meta.status === 'ready') ready.add(f.replace('.json', ''));
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

if (doAll) {
  for (const lang of LANGUAGES) buildLang(lang);
} else if (langArg) {
  buildLang(langArg);
} else {
  console.error('Usage: node scripts/build-tsim-i18n.mjs --lang <id|ja> | --all');
  process.exit(1);
}
