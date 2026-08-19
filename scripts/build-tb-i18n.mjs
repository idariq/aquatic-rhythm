/**
 * Builds localized HTML for Tank Builder — a self-contained single-file
 * interactive page (like tank-simulator) whose engine logic (~2000 lines)
 * is inline JS, PLUS a large embedded species/plant/hardscape reference
 * database (`var ECOSYSTEM={...}`, 151 entries) and a small enum-value
 * display-label dictionary (`var TB_ENUM_LABELS={...}`).
 *
 * Unlike tank-simulator's pure exact-substring approach, ECOSYSTEM and
 * TB_ENUM_LABELS are reconstructed via JSON.parse/merge/stringify — far
 * safer than regex substitution inside a ~145KB single-line minified blob.
 * Everything else (static HTML chrome, engine UI strings) uses subOnce/
 * subAll exact-substring matching, same as build-tsim-i18n.mjs.
 *
 * ECOSYSTEM translatable fields (rest of each entry — name/latin/size_cm/
 * temp/ph/etc — stays English/numeric, read programmatically or is
 * scientific reference data per CLAUDE.md convention):
 *   FISH/INVERTEBRATES: diet, substrate_pref (fish only), notes_detail, caution
 *   PLANTS: about, notes
 *   HARDSCAPE: notes
 *   SETUP_STYLES: label, desc
 *
 * TB_ENUM_LABELS: only VALUES are translated — KEYS are raw data values
 * (e.g. "Beginner", "soft-medium") read verbatim by comparison logic
 * elsewhere (item.care_level==='Beginner') and must stay byte-identical.
 *
 * Source: translations/<lang>/tank-builder.json — bespoke schema
 * {head, briefing, topBand, tabs, rack, eco, brandInfo, speciesInfo,
 *  dropdown, reportOverlay, statusBar, compat, eqCategories, canvasHints,
 *  report, images, enums, ecosystem{FISH,INVERTEBRATES,PLANTS,HARDSCAPE,SETUP_STYLES}}.
 *
 * Usage:
 *   node scripts/build-tb-i18n.mjs --lang id
 *   node scripts/build-tb-i18n.mjs --all
 */
import fs from 'fs';
import path from 'path';

const ROOT      = path.join(import.meta.dirname, '..');
const ART_DIR   = path.join(ROOT, 'articles');
const TRANS_DIR = path.join(ROOT, 'translations');
const BASE_URL  = 'https://aquaticrhythm.com';
const LANGUAGES = ['id', 'ja'];
const SLUG      = 'tank-builder';

const args    = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
const langArg = langIdx !== -1 ? args[langIdx + 1] : undefined;
const doAll   = args.includes('--all');

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
    welcome: '見えているものを教えてください —— 水、行動、変わったことなら何でも —— 何かを直す前に、一緒に読み解いていきましょう。',
    also_pre: '同じRhyssaは、', also_post: 'でもご利用いただけます。',
    placeholder: '水槽について質問する…', msgAria: 'Rhyssaへのメッセージ', sendAria: '送信',
    note: 'AIは間違えることがあります —— 魚の緊急事態では、専門家に相談してください',
    chatAria: 'Rhyssaとチャット', threadAria: 'Rhyssaとの会話'
  }
};

const KOFI_SHEET = {
  id: { title: 'Dukungan', sub: 'Tip opsional — dikelola di Ko-fi', linkout: 'Buka terpisah ↗', closeAria: 'Tutup panel dukungan' },
  ja: { title: 'サポート', sub: '任意のご支援——Ko-fiで対応', linkout: '別ウィンドウで開く ↗', closeAria: 'サポートパネルを閉じる' }
};

function subOnce(h, oldStr, newStr, label) {
  const i1 = h.indexOf(oldStr);
  if (i1 === -1) throw new Error(`[${label}] NOT FOUND: ${JSON.stringify(oldStr.slice(0, 100))}`);
  const i2 = h.indexOf(oldStr, i1 + 1);
  if (i2 !== -1) throw new Error(`[${label}] AMBIGUOUS (multiple matches): ${JSON.stringify(oldStr.slice(0, 100))}`);
  return h.slice(0, i1) + newStr + h.slice(i1 + oldStr.length);
}

function subAll(h, oldStr, newStr, expectedCount, label) {
  const count = h.split(oldStr).length - 1;
  if (count !== expectedCount) throw new Error(`[${label}] expected ${expectedCount} matches, found ${count}: ${JSON.stringify(oldStr.slice(0, 100))}`);
  return h.split(oldStr).join(newStr);
}

function buildHreflangTags(lang) {
  const lines = [];
  lines.push(`<link rel="alternate" hreflang="en" href="${BASE_URL}/articles/${SLUG}">`);
  for (const l of LANGUAGES) lines.push(`<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/articles/${SLUG}">`);
  lines.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/articles/${SLUG}">`);
  return lines.join('\n');
}

// ── ECOSYSTEM reconstruction (JSON manipulation, not regex) ──────────────
function patchEcosystem(h, t) {
  const m = h.match(/var ECOSYSTEM=(\{.*?\});\n\n\/\* Display-label/s);
  if (!m) throw new Error('ECOSYSTEM blob not found');
  const en = JSON.parse(m[1]);
  const tr = t.ecosystem;

  const PROSE_FIELDS = {
    FISH: ['diet', 'substrate_pref', 'notes_detail', 'caution'],
    INVERTEBRATES: ['diet', 'notes_detail', 'caution'],
    PLANTS: ['about', 'notes'],
    HARDSCAPE: ['notes']
  };
  for (const cat of Object.keys(PROSE_FIELDS)) {
    for (const key of Object.keys(en[cat])) {
      const trEntry = tr[cat] && tr[cat][key];
      if (!trEntry) throw new Error(`ECOSYSTEM: missing ${cat}.${key} in translation`);
      for (const field of PROSE_FIELDS[cat]) {
        if (en[cat][key][field] === undefined) continue;
        if (trEntry[field] === undefined) throw new Error(`ECOSYSTEM: missing ${cat}.${key}.${field} in translation`);
        en[cat][key][field] = trEntry[field];
      }
    }
  }
  for (const key of Object.keys(en.SETUP_STYLES)) {
    const trEntry = tr.SETUP_STYLES && tr.SETUP_STYLES[key];
    if (!trEntry) throw new Error(`ECOSYSTEM: missing SETUP_STYLES.${key} in translation`);
    en.SETUP_STYLES[key].label = trEntry.label;
    en.SETUP_STYLES[key].desc = trEntry.desc;
  }

  const newBlob = 'var ECOSYSTEM=' + JSON.stringify(en) + ';';
  return h.slice(0, m.index) + newBlob + h.slice(m.index + m[0].length - '\n\n/* Display-label'.length);
}

function patchEnumLabels(h, t) {
  const m = h.match(/var TB_ENUM_LABELS=(\{.*?\});\n/s);
  if (!m) throw new Error('TB_ENUM_LABELS blob not found');
  const en = JSON.parse(m[1]);
  const tr = t.enums;
  for (const field of Object.keys(en)) {
    if (!tr[field]) throw new Error(`enums: missing field ${field} in translation`);
    for (const key of Object.keys(en[field])) {
      if (tr[field][key] === undefined) throw new Error(`enums: missing ${field}.${key} in translation`);
      en[field][key] = tr[field][key];
    }
  }
  const newBlob = 'var TB_ENUM_LABELS=' + JSON.stringify(en) + ';\n';
  return h.slice(0, m.index) + newBlob + h.slice(m.index + m[0].length);
}

function patchHead(h, t, lang) {
  h = h.replace(/(<html[^>]*\slang=")[^"]*(")/, (_, a, b) => `${a}${lang}${b}`);
  h = subOnce(h, '<title>Tank Builder — Aquatic Rhythm</title>', `<title>${t.head.title}</title>`, 'head.title');
  h = subAll(h, 'Build your first freshwater aquarium. Choose fish you love and discover what they need.', t.head.description, 4, 'head.description');
  h = subOnce(h, `<link rel="canonical" href="https://aquaticrhythm.com/articles/tank-builder">`,
    `<link rel="canonical" href="${BASE_URL}/${lang}/articles/${SLUG}">`, 'head.canonical');
  h = h.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, '');
  const hreflang = buildHreflangTags(lang);
  h = subOnce(h, `<link rel="canonical" href="${BASE_URL}/${lang}/articles/${SLUG}">`,
    `<link rel="canonical" href="${BASE_URL}/${lang}/articles/${SLUG}">\n${hreflang}`, 'head.hreflang');
  h = subOnce(h, `<meta property="og:url" content="https://aquaticrhythm.com/articles/tank-builder">`,
    `<meta property="og:url" content="${BASE_URL}/${lang}/articles/${SLUG}">`, 'head.ogUrl');
  h = subOnce(h, `<meta name="twitter:url" content="https://aquaticrhythm.com/articles/tank-builder">`,
    `<meta name="twitter:url" content="${BASE_URL}/${lang}/articles/${SLUG}">`, 'head.twitterUrl');
  h = subAll(h, 'Tank Builder — Aquatic Rhythm', t.head.title, 3, 'head.titleVariants');
  h = subOnce(h, `"url":"https://aquaticrhythm.com/articles/tank-builder"`, `"url":"${BASE_URL}/${lang}/articles/${SLUG}"`, 'head.jsonldUrl');
  return h;
}

function patchArI18n(h, lang) {
  return subOnce(h,
    '<!-- ── BOTTOM NAV (PWA) ── -->\n<nav class="bnav" id="bnav" aria-label="Main navigation">',
    `<script>window.__arI18n={basePath:'articles/${SLUG}',avail:["id","ja"]};</script>\n<!-- ── BOTTOM NAV (PWA) ── -->\n<nav class="bnav" id="bnav" aria-label="Main navigation">`,
    'arI18n');
}

function patchBnav(h, lang) {
  const b = BNAV_LABELS[lang];
  h = subOnce(h, '<a href="/" class="bnav-item" aria-label="Home">', `<a href="/${lang}/" class="bnav-item" aria-label="${b.home}">`, 'bnav.home.a');
  h = subOnce(h, '<span>Home</span>', `<span>${b.home}</span>`, 'bnav.home.span');
  h = subOnce(h, '<a href="/reading" class="bnav-item" aria-label="Reading">', `<a href="/${lang}/reading" class="bnav-item" aria-label="${b.reading}">`, 'bnav.reading.a');
  h = subOnce(h, '<span>Reading</span>', `<span>${b.reading}</span>`, 'bnav.reading.span');
  h = subOnce(h, '<a href="/tools" class="bnav-item active" aria-current="page" aria-label="Tools">', `<a href="/${lang}/?p=tools" class="bnav-item active" aria-current="page" aria-label="${b.tools}">`, 'bnav.tools.a');
  h = subOnce(h, '<span>Tools</span>', `<span>${b.tools}</span>`, 'bnav.tools.span');
  h = subOnce(h, '<a href="/journal" class="bnav-item" aria-label="Keeper\'s Log">', `<a href="/${lang}/?p=journal" class="bnav-item" aria-label="${b.logAria}">`, 'bnav.journal.a');
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

function patchKofiSheet(h, lang) {
  const c = KOFI_SHEET[lang];
  h = subOnce(h, '<span id="kofi-sheet-title-tb" class="kofi-sheet-title">Support</span>', `<span id="kofi-sheet-title-tb" class="kofi-sheet-title">${c.title}</span>`, 'kofi.title');
  h = subOnce(h, '<span class="kofi-sheet-sub">Optional tips — handled on Ko-fi</span>', `<span class="kofi-sheet-sub">${c.sub}</span>`, 'kofi.sub');
  h = subOnce(h, 'class="kofi-sheet-linkout">Open separately ↗</a>', `class="kofi-sheet-linkout">${c.linkout}</a>`, 'kofi.linkout');
  h = subOnce(h, 'id="kofi-sheet-close" aria-label="Close support panel">', `id="kofi-sheet-close" aria-label="${c.closeAria}">`, 'kofi.closeAria');
  h = subOnce(h, 'title="Support Aquatic Rhythm on Ko-fi">', 'title="Support Aquatic Rhythm on Ko-fi">', 'kofi.iframeTitle.noop');
  return h;
}

function patchBriefing(h, t) {
  const b = t.briefing;
  h = subOnce(h, '<span class="brief-eyebrow">Aquatic Rhythm Lab</span>', `<span class="brief-eyebrow">${b.eyebrow}</span>`, 'briefing.eyebrow');
  h = subOnce(h, '<h1 class="brief-title">Build your<br><em>first tank.</em></h1>', `<h1 class="brief-title">${b.titleHtml}</h1>`, 'briefing.title');
  h = subOnce(h, '<p class="brief-body">Start anywhere. Choose fish you love and discover what they need — or build your equipment setup and see what it can support. Use the tabs to move between equipment, livestock, plants, and hardscape; the tank visual responds to all of them.</p>',
    `<p class="brief-body">${b.body}</p>`, 'briefing.body');
  const panels = [
    ['Start with fish', 'Pick species you want to keep. See what equipment they need.'],
    ['Start with equipment', 'Build your setup first. See what species it can support.']
  ];
  panels.forEach(([title, desc], i) => {
    const v = b.panels[i];
    h = subOnce(h, `<span class="brief-panel-title">${title}</span>\n        <span class="brief-panel-desc">${desc}</span>`,
      `<span class="brief-panel-title">${v.title}</span>\n        <span class="brief-panel-desc">${v.desc}</span>`, `briefing.panel.${i}`);
  });
  const rhy = [
    ['Water', 'Filtration, flow, and water quality infrastructure'],
    ['Biological', 'Bacterial colony and nitrogen cycle stability'],
    ['Environmental', 'Temperature, light, and habitat conditions'],
    ['Livestock', 'Species compatibility and stocking demand'],
    ['Human', 'Maintenance demand and keeper commitment']
  ];
  rhy.forEach(([name, desc], i) => {
    const r = b.rhythms[i];
    h = subOnce(h, `>${name}</span><span class="brief-rhy-desc">${desc}</span>`,
      `>${r.name}</span><span class="brief-rhy-desc">${r.desc}</span>`, `briefing.rhythm.${i}`);
  });
  h = subOnce(h, '<p class="brief-note">The five rhythms are an ARA interpretive model — a lens for thinking, not a scientific measurement. They reflect patterns observed across the freshwater hobby.</p>',
    `<p class="brief-note">${b.note}</p>`, 'briefing.note');
  h = subOnce(h, '<button class="brief-btn" id="btn-enter">Enter the lab &#x2192;</button>', `<button class="brief-btn" id="btn-enter">${b.btn}</button>`, 'briefing.btn');
  return h;
}

function patchTopBand(h, t) {
  const tb = t.topBand;
  h = subOnce(h, '<label class="visually-hidden" for="tank-volume-select">Tank volume (litres)</label>', `<label class="visually-hidden" for="tank-volume-select">${tb.volumeLabel}</label>`, 'topBand.volumeLabel');
  h = subOnce(h, 'aria-label="Tank volume in litres">', `aria-label="${tb.volumeAria}">`, 'topBand.volumeAria');
  h = subOnce(h, '<div class="rhy-hdr"><span>ARA Rhythm</span></div>', `<div class="rhy-hdr"><span>${tb.rhyHeading}</span></div>`, 'topBand.rhyHeading');
  h = subOnce(h, 'role="group" aria-label="Five rhythm levels">', `role="group" aria-label="${tb.rhyBarsAria}">`, 'topBand.rhyBarsAria');
  const rl = tb.rhyLabels;
  h = subOnce(h, '<span class="rhy-lbl">Water</span>', `<span class="rhy-lbl">${rl.water}</span>`, 'topBand.rhyLbl.water');
  h = subOnce(h, '<span class="rhy-lbl">Biological</span>', `<span class="rhy-lbl">${rl.bio}</span>`, 'topBand.rhyLbl.bio');
  h = subOnce(h, '<span class="rhy-lbl">Environment</span>', `<span class="rhy-lbl">${rl.env}</span>`, 'topBand.rhyLbl.env');
  h = subOnce(h, '<span class="rhy-lbl">Livestock</span>', `<span class="rhy-lbl">${rl.live}</span>`, 'topBand.rhyLbl.live');
  h = subOnce(h, '<span class="rhy-lbl">Human</span>', `<span class="rhy-lbl">${rl.human}</span>`, 'topBand.rhyLbl.human');
  return h;
}

function patchTabs(h, t) {
  const tb = t.tabs;
  h = subOnce(h, 'data-tab="equipment">Equipment</button>', `data-tab="equipment">${tb.equipment}</button>`, 'tabs.equipment');
  h = subOnce(h, 'data-tab="livestock">Livestock</button>', `data-tab="livestock">${tb.livestock}</button>`, 'tabs.livestock');
  h = subOnce(h, 'data-tab="plants">Plants</button>', `data-tab="plants">${tb.plants}</button>`, 'tabs.plants');
  h = subOnce(h, 'data-tab="hardscape">Hardscape</button>', `data-tab="hardscape">${tb.hardscape}</button>`, 'tabs.hardscape');
  return h;
}

function patchRack(h, t) {
  const r = t.rack;
  const cats = ['Filtration', 'Circulation', 'Environment', 'Cooling', 'Substrate', 'Additions', 'Monitoring'];
  cats.forEach(c => { h = subOnce(h, `<div class="rack-cat">${c}</div>`, `<div class="rack-cat">${r.categories[c]}</div>`, `rack.cat.${c}`); });
  for (const [id, item] of Object.entries(r.items)) {
    const enItem = ENGLISH_RACK_ITEMS[id];
    // Match on the <eq-name>/<eq-role> text pair only — NOT the icon markup
    // in between (icons switched from emoji entities to inline <svg> once
    // already; matching past them again would just re-break on the next
    // icon-only redesign). Each name/role pair is unique sitewide.
    h = subOnce(h,
      `<span class="eq-name">${enItem.name}</span><span class="eq-role">${enItem.role}</span>`,
      `<span class="eq-name">${item.name}</span><span class="eq-role">${item.role}</span>`,
      `rack.item.${id}`);
  }
  return h;
}

const ENGLISH_RACK_ITEMS = {
  'filter-sponge': { name: 'Sponge Filter', role: 'Biological, gentle flow' },
  'filter-internal': { name: 'Internal Filter', role: 'Submersible, compact' },
  'filter-hang': { name: 'Hang-on Filter', role: 'Mechanical + biological' },
  'filter-canister': { name: 'Canister Filter', role: 'High capacity, external' },
  'filter-overflow': { name: 'Overflow Filter', role: 'Trickle/wet-dry, high O&#x2082;' },
  'powerhead': { name: 'Powerhead', role: 'Return pump / flow' },
  'wavemaker': { name: 'Wavemaker', role: 'Circulation, dead zones' },
  'airpump': { name: 'Air Pump', role: 'Oxygen + agitation' },
  'uv-sterilizer': { name: 'UV Sterilizer', role: 'Clarity + pathogen control' },
  'heater': { name: 'Heater', role: 'Stable temperature' },
  'light-basic': { name: 'Basic LED', role: 'Day/night cycle' },
  'light-planted': { name: 'Plant Light', role: 'Full spectrum, high output' },
  'timer': { name: 'Light Timer', role: 'Consistent photoperiod' },
  'chiller': { name: 'Aquarium Chiller', role: 'Precise temperature control' },
  'cooling-fan': { name: 'Cooling Fan', role: 'Evaporative cooling' },
  'sub-gravel': { name: 'Gravel', role: 'Neutral, forgiving' },
  'sub-sand': { name: 'Sand', role: 'Natural, soft substrate' },
  'sub-soil': { name: 'Aqua Soil', role: 'Nutrient-rich for plants' },
  'conditioner': { name: 'Water Conditioner', role: 'Neutralise chlorine' },
  'ammonia-source': { name: 'Ammonia Source', role: 'Fishless cycling' },
  'seed': { name: 'Bacteria Starter', role: 'Cycle head-start' },
  'lid': { name: 'Lid / Cover', role: 'Safety + reduces evaporation' },
  'ato': { name: 'Auto Top-Off', role: 'Replaces evaporated water' },
  'thermometer': { name: 'Thermometer', role: 'Verify temperature daily' },
  'testkit': { name: 'Test Kit', role: 'Read the nitrogen cycle' },
  'siphon': { name: 'Gravel Vacuum', role: 'Water change tool' }
};

function patchEco(h, t) {
  const e = t.eco;
  h = subOnce(h, '<div id="compat-strip">Compatibility notes will appear as you select species.</div>', `<div id="compat-strip">${e.compatDefault}</div>`, 'eco.compatDefault');
  h = subOnce(h, '<span class="tb-kofi-hint-txt">Planning here is free — tips help maintain labs like this.</span>', `<span class="tb-kofi-hint-txt">${e.kofiHint}</span>`, 'eco.kofiHint');
  h = subOnce(h, 'rel="noopener noreferrer" aria-label="Support on Ko-fi">Ko-fi</a>', `rel="noopener noreferrer" aria-label="${e.kofiLinkAria}">Ko-fi</a>`, 'eco.kofiLinkAria');
  h = subOnce(h, 'placeholder="Search fish &amp; invertebrates&#x2026;"', `placeholder="${e.searchPlaceholderDefault}"`, 'eco.searchPlaceholderDefault');
  h = subOnce(h, '<div class="eco-section-hdr">Fish &amp; Invertebrates</div>', `<div class="eco-section-hdr">${e.sectionHeaders.stock}</div>`, 'eco.sectionHeaders.stock');
  h = subOnce(h, '<div class="eco-section-hdr">Plants</div>', `<div class="eco-section-hdr">${e.sectionHeaders.plants}</div>`, 'eco.sectionHeaders.plants');
  h = subOnce(h, '<div class="eco-section-hdr">Hardscape</div>', `<div class="eco-section-hdr">${e.sectionHeaders.hardscape}</div>`, 'eco.sectionHeaders.hardscape');
  return h;
}

function patchStatusBarAndReportOverlay(h, t) {
  const s = t.statusBar, r = t.reportOverlay;
  h = subOnce(h, '<button id="btn-reset" type="button">Reset</button>', `<button id="btn-reset" type="button">${s.resetBtn}</button>`, 'statusBar.resetBtn');
  h = subOnce(h, '<button id="btn-submit" type="button">See report &#x2192;</button>', `<button id="btn-submit" type="button">${s.submitBtn}</button>`, 'statusBar.submitBtn');
  h = subOnce(h, 'id="btn-save-journal" class="tb-rpt-btn-primary" style="background:rgba(124,168,156,.88);border-color:rgba(124,168,156,.4)">Save plan to Keeper\'s Log</button>',
    `id="btn-save-journal" class="tb-rpt-btn-primary" style="background:rgba(124,168,156,.88);border-color:rgba(124,168,156,.4)">${r.saveBtn}</button>`, 'reportOverlay.saveBtn');
  h = subOnce(h, 'id="btn-try-again" class="tb-rpt-btn-primary">Try a different setup &#x2192;</button>', `id="btn-try-again" class="tb-rpt-btn-primary">${r.tryAgainBtn}</button>`, 'reportOverlay.tryAgainBtn');
  h = subOnce(h, '<a href="/tools" class="tb-rpt-btn-ghost">Back to tools</a>', `<a href="/tools" class="tb-rpt-btn-ghost">${r.backToolsLink}</a>`, 'reportOverlay.backToolsLink');
  return h;
}

// id puts the category word BEFORE the enum value ("Beban Tinggi", not
// "Tinggi Beban" — noun-adjective order breaks for a bare suffix here,
// same class of issue as tank-simulator's expectedStatic/dayConcat). ja's
// translated suffixes ("の負荷"/"の光量") were designed by the translation
// agent to work as trailing suffixes with め-form adjectives, so ja keeps
// the suffix shape; id switches to a prefix instead.
function loadTagExpr(lang, si) {
  if (lang === 'id') return `'Beban '+enumLabel('bioload',item.bioload)`;
  return `enumLabel('bioload',item.bioload)+'${si.loadSuffix}'`;
}
function lightTagExpr(lang, si) {
  if (lang === 'id') return `'Cahaya '+enumLabel('light',item.light)`;
  return `enumLabel('light',item.light)+'${si.lightSuffix}'`;
}

function patchEngineStrings(h, t, lang) {
  const bi = t.brandInfo, si = t.speciesInfo, dd = t.dropdown, cp = t.compat, ec = t.eqCategories,
    ch = t.canvasHints, rp = t.report, im = t.images, eco = t.eco;

  // ── search placeholders + chips (JS-generated, not static HTML) ──
  h = subOnce(h, "if(tab==='plants')el.placeholder='Search plants\\u2026';", `if(tab==='plants')el.placeholder='${eco.searchPlaceholderPlants}';`, 'js.searchPlaceholderPlants');
  h = subOnce(h, "else if(tab==='hardscape')el.placeholder='Search hardscape\\u2026';", `else if(tab==='hardscape')el.placeholder='${eco.searchPlaceholderHardscape}';`, 'js.searchPlaceholderHardscape');
  h = subOnce(h, "else el.placeholder='Search fish & invertebrates\\u2026';", `else el.placeholder='${eco.searchPlaceholderDefault}';`, 'js.searchPlaceholderDefault2');
  h = subOnce(h, "all.textContent='All';", `all.textContent='${eco.chips.all}';`, 'js.chipAll');
  h = subOnce(h,
    "var STYLES=[{k:'community',l:'Community'},{k:'planted',l:'Planted'},{k:'shrimp',l:'Shrimp'},\n   {k:'biotope',l:'Biotope'},{k:'coldwater',l:'Coldwater'},{k:'species',l:'Species'},\n   {k:'nano',l:'Nano'},{k:'blackwater',l:'Blackwater'}];",
    `var STYLES=[{k:'community',l:'${eco.chips.community}'},{k:'planted',l:'${eco.chips.planted}'},{k:'shrimp',l:'${eco.chips.shrimp}'},\n   {k:'biotope',l:'${eco.chips.biotope}'},{k:'coldwater',l:'${eco.chips.coldwater}'},{k:'species',l:'${eco.chips.species}'},\n   {k:'nano',l:'${eco.chips.nano}'},{k:'blackwater',l:'${eco.chips.blackwater}'}];`,
    'js.chips');

  // ── canvas hints ──
  h = subOnce(h, "ctx.fillText('Add a filter to establish your biological rhythm',W/2,ty+th/2);", `ctx.fillText('${ch.addFilterHint}',W/2,ty+th/2);`, 'js.addFilterHint');
  h = subOnce(h, "ctx.fillText('Select species below to populate your tank',W/2,ty+th*.5);ctx.restore();", `ctx.fillText('${ch.selectSpeciesHint}',W/2,ty+th*.5);ctx.restore();`, 'js.selectSpeciesHint');

  // ── equipment dropdown ──
  h = subOnce(h, "lbl.textContent=eq.brands.type==='named'?'Choose a brand':'Choose an option';", `lbl.textContent=eq.brands.type==='named'?'${dd.chooseBrand}':'${dd.chooseOption}';`, 'js.chooseBrand');
  h = subOnce(h, "x.setAttribute('aria-label','Close');", `x.setAttribute('aria-label','${dd.closeAria}');`, 'js.dropdownCloseAria');
  h = subOnce(h, "ub.textContent=chosen?'Use '+chosen.split(' ')[0]+' \\u2192':'Tap an option above';",
    `ub.textContent=chosen?'${dd.useBtnPrefix}'+chosen.split(' ')[0]+'${dd.useBtnSuffix}':'${dd.tapOption}';`, 'js.dropdownUseBtn');
  h = subOnce(h, "ab.textContent='Details \\u2192';", `ab.textContent='${dd.detailsBtn}';`, 'js.detailsBtn');
  h = subOnce(h, "sk.className='dq-btn-skip';sk.type='button';sk.textContent='Skip';", `sk.className='dq-btn-skip';sk.type='button';sk.textContent='${dd.skipBtn}';`, 'js.skipBtn');
  h = subOnce(h, "ub.classList.add('ready');ub.textContent='Use '+pick.split(' ')[0]+' \\u2192';",
    `ub.classList.add('ready');ub.textContent='${dd.useBtnPrefix}'+pick.split(' ')[0]+'${dd.useBtnSuffix}';`, 'js.syncBtnsUse');
  h = subOnce(h, "rb.style.color='rgba(220,100,60,.65)';rb.textContent='Remove';", `rb.style.color='rgba(220,100,60,.65)';rb.textContent='${dd.removeBtn}';`, 'js.removeBtn');

  // ── brand info overlay ──
  h = subOnce(h, "var info=BRAND_INFO[brandName]||{summary:'No detailed information available.',pros:[],cons:[],best_for:'',tier:'',tier_note:'',avoid_if:''};",
    `var info=BRAND_INFO[brandName]||{summary:'${bi.noInfo}',pros:[],cons:[],best_for:'',tier:'',tier_note:'',avoid_if:''};`, 'js.noInfo');
  h = subOnce(h, "if(info.summary)addSection('Overview',info.summary);", `if(info.summary)addSection('${bi.overview}',info.summary);`, 'js.biOverview');
  h = subOnce(h, "if(info.best_for)addSection('Best for',info.best_for);", `if(info.best_for)addSection('${bi.bestFor}',info.best_for);`, 'js.bestFor');
  h = subOnce(h, "addTags('Strengths',info.pros,'');addTags('Limitations',info.cons,'warn');", `addTags('${bi.strengths}',info.pros,'');addTags('${bi.limitations}',info.cons,'warn');`, 'js.strengthsLimitations');
  h = subOnce(h, "var pl=document.createElement('div');pl.className='bi-section-lbl';pl.textContent='Price tier';", `var pl=document.createElement('div');pl.className='bi-section-lbl';pl.textContent='${bi.priceTier}';`, 'js.priceTier');
  h = subOnce(h, "if(info.avoid_if){var av=document.createElement('div');av.className='bi-verdict';av.textContent='\\u26a0 Avoid if: '+info.avoid_if;body.appendChild(av);}",
    `if(info.avoid_if){var av=document.createElement('div');av.className='bi-verdict';av.textContent='\\u26a0 ${bi.avoidIfPrefix}'+info.avoid_if;body.appendChild(av);}`, 'js.avoidIf');
  h = subOnce(h, "disc.textContent='Brands listed are examples. Prices and availability vary by region.';", `disc.textContent='${bi.brandsDisclaimer}';`, 'js.brandsDisclaimer');
  h = subOnce(h, "useBtn.textContent='Use '+brandName.split(' ')[0]+' \\u2192';", `useBtn.textContent='${bi.useBtnPrefix}'+brandName.split(' ')[0]+'${bi.useBtnSuffix}';`, 'js.biUseBtn');
  h = subOnce(h, "var backBtn=document.createElement('button');backBtn.className='bi-btn-back';backBtn.textContent='\\u2190 Back';",
    `var backBtn=document.createElement('button');backBtn.className='bi-btn-back';backBtn.textContent='${bi.backBtn}';`, 'js.backBtn');
  h = subOnce(h, "if(biw){biw.style.height='';biw.style.display='';}\n  showBiEquipmentHero(eqId);", `if(biw){biw.style.height='';biw.style.display='';}\n  showBiEquipmentHero(eqId);`, 'js.noop.showBiHero');

  // ── species info overlay ──
  h = subOnce(h, "if(item.about)addSec('Overview',item.about);", `if(item.about)addSec('${bi.overview}',item.about);`, 'js.speciesOverview');
  h = subOnce(h, "if(item.temp)params.push('Temperature: '+item.temp[0]+'\\u2013'+item.temp[1]+'\\u00b0C');", `if(item.temp)params.push('${si.temperatureLbl}'+item.temp[0]+'\\u2013'+item.temp[1]+'\\u00b0C');`, 'js.temperatureLbl');
  h = subOnce(h, "if(item.ph)params.push('pH: '+item.ph[0]+'\\u2013'+item.ph[1]);", `if(item.ph)params.push('${si.phLbl}'+item.ph[0]+'\\u2013'+item.ph[1]);`, 'js.phLbl');
  h = subOnce(h, "if(item.hardness)params.push('Hardness: '+enumLabel('hardness',item.hardness));", `if(item.hardness)params.push('${si.hardnessLbl}'+enumLabel('hardness',item.hardness));`, 'js.hardnessLbl');
  h = subOnce(h, "if(item.size_cm)params.push('Max size: '+item.size_cm+'cm');", `if(item.size_cm)params.push('${si.maxSizeLbl}'+item.size_cm+'${si.cm}');`, 'js.maxSizeLbl');
  h = subOnce(h, "if(item.min_tank_l)params.push('Min tank: '+item.min_tank_l+'L');", `if(item.min_tank_l)params.push('${si.minTankLbl}'+item.min_tank_l+'L');`, 'js.minTankLbl');
  h = subOnce(h, "if(item.lifespan_yr)params.push('Lifespan: '+item.lifespan_yr+' yrs');", `if(item.lifespan_yr)params.push('${si.lifespanLbl}'+item.lifespan_yr+'${si.lifespanSuffix}');`, 'js.lifespanLbl');
  h = subOnce(h, "if(item.water_column)params.push('Swims: '+enumLabel('water_column',item.water_column));", `if(item.water_column)params.push('${si.swimsLbl}'+enumLabel('water_column',item.water_column));`, 'js.swimsLbl');
  h = subOnce(h, "if(item.region)params.push('Origin: '+item.region);", `if(item.region)params.push('${si.originLbl}'+item.region);`, 'js.originLbl');
  h = subOnce(h, "addTags('Parameters',params,'neutral');", `addTags('${si.parametersLbl}',params,'neutral');`, 'js.parametersLbl');
  h = subOnce(h, "if(item.schooling&&item.min_school>1)addSec('Schooling','Minimum '+item.min_school+' recommended. Lone fish become stressed and hide.');",
    `if(item.schooling&&item.min_school>1)addSec('${si.schoolingLbl}','${si.schoolingNotePrefix}'+item.min_school+'${si.schoolingNoteSuffix}');`, 'js.schoolingNote');
  h = subOnce(h, "if(item.notes_detail||item.notes)addSec('Notes',item.notes_detail||item.notes);", `if(item.notes_detail||item.notes)addSec('${si.notesLbl}',item.notes_detail||item.notes);`, 'js.notesLbl');
  h = subOnce(h, "if(item.diet)addSec('Diet',item.diet);", `if(item.diet)addSec('${si.dietLbl}',item.diet);`, 'js.dietLbl');
  h = subOnce(h, "if(item.substrate_pref)addSec('Substrate',item.substrate_pref);", `if(item.substrate_pref)addSec('${si.substrateLbl}',item.substrate_pref);`, 'js.substrateLbl');
  h = subOnce(h, "if(item.light)addSec('Light requirement',enumLabel('light',item.light)+(item.co2?' \\u2014 CO\\u2082 recommended':''));",
    `if(item.light)addSec('${si.lightReqLbl}',enumLabel('light',item.light)+(item.co2?'${si.co2Suffix}':''));`, 'js.lightReqLbl');
  h = subOnce(h, "if(eff.length)addTags('Water chemistry effects',eff,'warn');", `if(eff.length)addTags('${si.waterChemEffectsLbl}',eff,'warn');`, 'js.waterChemEffectsLbl');
  h = subOnce(h, "eff.push('Releases tannins \\u2014 amber water, lowers pH');", `eff.push('${si.tanninsNote}');`, 'js.tanninsNote');
  h = subOnce(h, "disc.textContent='Parameters reflect general community knowledge and may vary by breeding line or locality.';",
    `disc.textContent='${si.paramsDisclaimer}';`, 'js.paramsDisclaimer');
  h = subOnce(h, "var ab=document.createElement('button');ab.className='ph2-card-about';ab.textContent='About';", `var ab=document.createElement('button');ab.className='ph2-card-about';ab.textContent='${si.aboutBtn}';`, 'js.aboutBtn');
  h = subOnce(h, "if(item.schooling&&item.min_school>1)addTag('School '+item.min_school+'+','ok');", `if(item.schooling&&item.min_school>1)addTag('${si.schoolTagPrefix}'+item.min_school+'+','ok');`, 'js.schoolTag');
  h = subOnce(h, "if(item.bioload==='high'||item.bioload==='very-high')addTag(enumLabel('bioload',item.bioload)+' load','warn');",
    `if(item.bioload==='high'||item.bioload==='very-high')addTag(${loadTagExpr(lang, si)},'warn');`, 'js.loadSuffix');
  h = subOnce(h, "if(item.light)addTag(enumLabel('light',item.light)+' light');", `if(item.light)addTag(${lightTagExpr(lang, si)});`, 'js.lightSuffix');
  h = subOnce(h, "var qlbl=document.createElement('span');qlbl.className='ph2-qty-label';qlbl.textContent='Quantity';",
    `var qlbl=document.createElement('span');qlbl.className='ph2-qty-label';qlbl.textContent='${si.quantityLbl}';`, 'js.quantityLbl');
  h = subOnce(h, "if(sInfo){var qn=document.createElement('span');qn.className='ph2-qty-note';qn.textContent='Suggested: '+sInfo;qrow.appendChild(qn);}",
    `if(sInfo){var qn=document.createElement('span');qn.className='ph2-qty-note';qn.textContent='${si.suggestedPrefix}'+sInfo;qrow.appendChild(qn);}`, 'js.suggestedPrefix');
  h = subOnce(h, "addBtn.textContent=ph2Active[cat][k]?'\\u2715 Remove from setup':'+ Add to setup';",
    `addBtn.textContent=ph2Active[cat][k]?'${si.removeFromSetup}':'${si.addToSetup}';`, 'js.addRemoveSetup');

  // ── compatibility strip ──
  h = subOnce(h, "if(maxLo>minHi)msgs.push('Temperature conflict between selected species.');", `if(maxLo>minHi)msgs.push('${cp.tempConflict}');`, 'js.tempConflict');
  h = subOnce(h, "if(hasSoft&&hasHard)msgs.push('Hardness conflict \\u2014 soft and hard water species together.');", `if(hasSoft&&hasHard)msgs.push('${cp.hardnessConflict}');`, 'js.hardnessConflict');
  h = subOnce(h, "if(item&&item.min_tank_l&&item.min_tank_l>tankL)msgs.push(item.name+' needs '+item.min_tank_l+'L minimum.');",
    `if(item&&item.min_tank_l&&item.min_tank_l>tankL)msgs.push(item.name+'${cp.minTankNeeds}'+item.min_tank_l+'${cp.minTankSuffix}');`, 'js.minTank');
  h = subOnce(h, "if(qty<min)msgs.push(item.name+': need '+min+' (you have '+qty+').');",
    `if(qty<min)msgs.push(item.name+'${cp.schoolingNeed}'+min+'${cp.schoolingYouHave}'+qty+'${cp.schoolingClose}');`, 'js.schoolingMsg');
  h = subOnce(h, "if(totalBio>8&&!hasCanister&&hasFilter)msgs.push('High bioload \\u2014 canister or overflow filter recommended.');", `if(totalBio>8&&!hasCanister&&hasFilter)msgs.push('${cp.highBioload}');`, 'js.highBioload');
  h = subOnce(h, "if(totalBio>5&&!hasFilter)msgs.push('No filter selected \\u2014 add filtration before stocking.');", `if(totalBio>5&&!hasFilter)msgs.push('${cp.noFilterSelected}');`, 'js.noFilterSelected');
  h = subOnce(h, "if(!msgs.length){el.className='';el.textContent='\\u2713 No issues with current selection.';return;}", `if(!msgs.length){el.className='';el.textContent='${cp.noIssues}';return;}`, 'js.noIssues');
  h = subOnce(h, "window.alert('Create a tank in Keeper\\x27s Log first (main site \\u2192 Log), then save this plan again.');", `window.alert('${cp.saveErrorNoTank}');`, 'js.saveErrorNoTank');
  h = subOnce(h, "window.alert('Could not save \\u2014 storage may be blocked or full.');", `window.alert('${cp.saveErrorGeneric}');`, 'js.saveErrorGeneric');
  h = subOnce(h, "ok.textContent='Saved to '+((tank.profile&&tank.profile.name)||'your active tank')+' \\u2014 open Log (main site) to review My Setup.';",
    `ok.textContent='${cp.savedToPrefix}'+((tank.profile&&tank.profile.name)||'${cp.savedToFallback}')+'${cp.savedToSuffix}';`, 'js.savedToast');

  // ── equipment category label maps (2 identical maps) ──
  h = subAll(h,
    "{filtration:'Filtration',sterilization:'Sterilization',circulation:'Circulation',additions:'Additions',environment:'Environment',substrate:'Substrate',cooling:'Cooling'}",
    `{filtration:'${ec.Filtration}',sterilization:'${ec.Sterilization}',circulation:'${ec.Circulation}',additions:'${ec.Additions}',environment:'${ec.Environment}',substrate:'${ec.Substrate}',cooling:'${ec.Cooling}'}`,
    1, 'js.formatEqCatMap');
  h = subOnce(h,
    "filtration:{icon:'\\u2248',lbl:'Filtration'},\n    sterilization:{icon:'\\u2731',lbl:'Sterilization'},\n    circulation:{icon:'\\u224B',lbl:'Circulation'},\n    additions:{icon:'\\u2726',lbl:'Additions'},\n    environment:{icon:'\\u25CE',lbl:'Environment'},\n    substrate:{icon:'\\u25A4',lbl:'Substrate'},\n    cooling:{icon:'\\u2744',lbl:'Cooling'}",
    `filtration:{icon:'\\u2248',lbl:'${ec.Filtration}'},\n    sterilization:{icon:'\\u2731',lbl:'${ec.Sterilization}'},\n    circulation:{icon:'\\u224B',lbl:'${ec.Circulation}'},\n    additions:{icon:'\\u2726',lbl:'${ec.Additions}'},\n    environment:{icon:'\\u25CE',lbl:'${ec.Environment}'},\n    substrate:{icon:'\\u25A4',lbl:'${ec.Substrate}'},\n    cooling:{icon:'\\u2744',lbl:'${ec.Cooling}'}`,
    'js.heroEqCatMap');
  h = subOnce(h, "hero.innerHTML='<span class=\"bi-hero-icon\" aria-hidden=\"true\">'+c.icon+'</span><span class=\"bi-hero-lbl\">'+c.lbl+'</span><span class=\"bi-hero-sub\">Equipment</span>';",
    `hero.innerHTML='<span class="bi-hero-icon" aria-hidden="true">'+c.icon+'</span><span class="bi-hero-lbl">'+c.lbl+'</span><span class="bi-hero-sub">${ec.equipmentSub}</span>';`, 'js.heroEquipmentSub');

  // ── full report ──
  h = subOnce(h, "html+='<span class=\"tb-rpt-eyebrow\">ARA Report</span>';", `html+='<span class="tb-rpt-eyebrow">${rp.araReportEyebrow}</span>';`, 'js.araReportEyebrow');
  h = subOnce(h, "html+='<p class=\"tb-rpt-disclaimer\">The ARA rhythm model is a qualitative framework \\u2014 a thinking tool, not a scientific measurement.</p>';",
    `html+='<p class="tb-rpt-disclaimer">${rp.disclaimer}</p>';`, 'js.rptDisclaimer');
  h = subOnce(h, "var metaParts=[eqList.length+' equipment',stockList.length+' livestock'];", `var metaParts=[eqList.length+'${rp.metaEquipment}',stockList.length+'${rp.metaLivestock}'];`, 'js.metaEquipLive');
  h = subOnce(h, "if(plantList.length)metaParts.push(plantList.length+' plants');", `if(plantList.length)metaParts.push(plantList.length+'${rp.metaPlants}');`, 'js.metaPlants');
  h = subOnce(h, "if(hardList.length)metaParts.push(hardList.length+' hardscape');", `if(hardList.length)metaParts.push(hardList.length+'${rp.metaHardscape}');`, 'js.metaHardscape');
  h = subOnce(h, "html+='<div class=\"tb-rpt-profile\"><div class=\"tb-rpt-profile-h\">Five Rhythm Profile</div>';", `html+='<div class="tb-rpt-profile"><div class="tb-rpt-profile-h">${rp.fiveRhythmProfile}</div>';`, 'js.fiveRhythmProfile');
  h = subOnce(h,
    "var rhyData=[\n    {label:'Water',color:'rgba(61,214,232,',val:s.water,desc:s.water>70?'Filtration capacity well established.':s.water>40?'Basic filtration in place.':'Filtration needs attention before stocking.'},\n    {label:'Biological',color:'rgba(100,200,82,',val:s.bio,desc:s.bio>70?'Good biological surface area.':s.bio>40?'Bacterial colony can establish with cycling.':'Insufficient biological media.'},\n    {label:'Environmental',color:'rgba(220,160,60,',val:s.env,desc:s.env>70?'Temperature and photoperiod well controlled.':s.env>40?'Basic environmental control in place.':'Consistency of conditions needs attention.'},\n    {label:'Livestock',color:'rgba(180,120,200,',val:s.live,desc:s.live>70?'High stocking demand \\u2014 monitor parameters closely.':s.live>40?'Moderate stocking demand.':'Light stocking \\u2014 good starting point.'},\n    {label:'Human',color:'rgba(139,189,210,',val:s.human,desc:s.human>70?'Demanding setup requiring consistent attention.':s.human>40?'Moderate maintenance required.':'Relatively low maintenance.'}\n  ];",
    `var rhyData=[\n    {label:'${rp.rhythmLabels.water}',color:'rgba(61,214,232,',val:s.water,desc:s.water>70?'${rp.rhythmDesc.water[0]}':s.water>40?'${rp.rhythmDesc.water[1]}':'${rp.rhythmDesc.water[2]}'},\n    {label:'${rp.rhythmLabels.bio}',color:'rgba(100,200,82,',val:s.bio,desc:s.bio>70?'${rp.rhythmDesc.bio[0]}':s.bio>40?'${rp.rhythmDesc.bio[1]}':'${rp.rhythmDesc.bio[2]}'},\n    {label:'${rp.rhythmLabels.env}',color:'rgba(220,160,60,',val:s.env,desc:s.env>70?'${rp.rhythmDesc.env[0]}':s.env>40?'${rp.rhythmDesc.env[1]}':'${rp.rhythmDesc.env[2]}'},\n    {label:'${rp.rhythmLabels.live}',color:'rgba(180,120,200,',val:s.live,desc:s.live>70?'${rp.rhythmDesc.live[0]}':s.live>40?'${rp.rhythmDesc.live[1]}':'${rp.rhythmDesc.live[2]}'},\n    {label:'${rp.rhythmLabels.human}',color:'rgba(139,189,210,',val:s.human,desc:s.human>70?'${rp.rhythmDesc.human[0]}':s.human>40?'${rp.rhythmDesc.human[1]}':'${rp.rhythmDesc.human[2]}'}\n  ];`,
    'js.rhyData');
  h = subOnce(h, "html+='<div class=\"tb-rpt-section\"><div class=\"tb-rpt-section-h\">Stocking</div><div class=\"tb-rpt-stock\">';", `html+='<div class="tb-rpt-section"><div class="tb-rpt-section-h">${rp.sections.stocking}</div><div class="tb-rpt-stock">';`, 'js.sectionStocking');
  h = subOnce(h, "html+='<div class=\"tb-rpt-section\"><div class=\"tb-rpt-section-h\">Equipment</div><div class=\"tb-rpt-tags\">';", `html+='<div class="tb-rpt-section"><div class="tb-rpt-section-h">${rp.sections.equipment}</div><div class="tb-rpt-tags">';`, 'js.sectionEquipment');
  h = subOnce(h, "html+='<div class=\"tb-rpt-section\"><div class=\"tb-rpt-section-h\">Plants</div><div class=\"tb-rpt-tags\">';", `html+='<div class="tb-rpt-section"><div class="tb-rpt-section-h">${rp.sections.plants}</div><div class="tb-rpt-tags">';`, 'js.sectionPlants');
  h = subOnce(h, "html+='<div class=\"tb-rpt-section\"><div class=\"tb-rpt-section-h\">Hardscape</div><div class=\"tb-rpt-tags\">';", `html+='<div class="tb-rpt-section"><div class="tb-rpt-section-h">${rp.sections.hardscape}</div><div class="tb-rpt-tags">';`, 'js.sectionHardscape');
  h = subOnce(h, "html+='<div class=\"tb-rpt-callout\"><div class=\"tb-rpt-callout-h\">Next best action</div>';", `html+='<div class="tb-rpt-callout"><div class="tb-rpt-callout-h">${rp.nextBestAction}</div>';`, 'js.nextBestAction');
  h = subOnce(h,
    "html+='<p class=\"tb-rpt-callout-p\">'+(hasFilter?'Use this configuration, buy only the critical components first (filter + heater + test kit), then run a fishless cycle for the first 14 days before adding fish.':'Add one filter first, then repeat the rhythm check before choosing livestock. Without a filter, this plan is not ready for cycling yet.')+'</p></div>';",
    `html+='<p class="tb-rpt-callout-p">'+(hasFilter?'${rp.calloutHasFilter}':'${rp.calloutNoFilter}')+'</p></div>';`, 'js.callout');
  h = subOnce(h, "html+='<p class=\"tb-rpt-quote\">A rhythm established with patience becomes self-sustaining. What you have chosen here is the architecture of a living system.</p>';",
    `html+='<p class="tb-rpt-quote">${rp.closingQuote}</p>';`, 'js.closingQuote');

  // ── images ──
  h = subOnce(h, "b.setAttribute('aria-label','Photo '+(jj+1));", `b.setAttribute('aria-label','${im.photoAriaPrefix}'+(jj+1));`, 'js.photoAria');
  h = subOnce(h, "if(skeleton){skeleton.textContent='No image found';skeleton.style.display='flex';}", `if(skeleton){skeleton.textContent='${im.noImageFound}';skeleton.style.display='flex';}`, 'js.noImageFound');
  h = subOnce(h, '<div class="bi-img-skeleton" id="bi-img-skeleton">Loading image&#x2026;</div>',
    `<div class="bi-img-skeleton" id="bi-img-skeleton">${bi.loadingImage}</div>`, 'html.loadingImage');

  return h;
}

function buildLang(lang) {
  const tPath = path.join(TRANS_DIR, lang, `${SLUG}.json`);
  const t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
  const srcPath = path.join(ART_DIR, `${SLUG}.html`);
  let h = fs.readFileSync(srcPath, 'utf8');

  h = patchEcosystem(h, t);
  h = patchEnumLabels(h, t);
  h = patchHead(h, t, lang);
  h = patchArI18n(h, lang);
  h = patchBnav(h, lang);
  h = patchRhyssaSheet(h, lang);
  h = patchKofiSheet(h, lang);
  h = patchBriefing(h, t);
  h = patchTopBand(h, t);
  h = patchTabs(h, t);
  h = patchRack(h, t);
  h = patchEco(h, t);
  h = patchStatusBarAndReportOverlay(h, t);
  h = patchEngineStrings(h, t, lang);
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
  console.error('Usage: node scripts/build-tb-i18n.mjs --lang <id|ja> | --all');
  process.exit(1);
}
