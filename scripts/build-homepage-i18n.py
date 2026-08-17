#!/usr/bin/env python3
"""
One-off builder for localized homepage SPA shells (ms/id/ja/index.html).

Unlike scripts/build-i18n.mjs (which templates individual articles from
translations/<lang>/<slug>.json on every run), index.html is NOT part of
that recurring pipeline — it's a single hand-maintained file translated
once here from a units JSON drafted for this task. Re-run this script only
if index.html's structure changes and the localized copies need resyncing.

Phase 1 scope: nav (top/mobile/bottom/settings/PWA prompt), meta/head,
pg-home, pg-companion (chat shell text only), pg-terms, pg-privacy,
pg-about — translated. pg-reading, pg-tools, pg-journal, pg-tank-log are
left in English (flagged in a comment in the output) — their JS-driven
interactive strings need a different i18n mechanism, tracked separately.

Usage: python3 scripts/build-homepage-i18n.py
Reads: index.html, translations/homepage/<lang>.json
Writes: <lang>/index.html for lang in ms, id, ja
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
UNITS_DIR = ROOT / "translations" / "homepage"

LANGUAGES = ["ms", "id", "ja"]
LANG_LABEL = {"en": "EN", "ms": "MS", "id": "ID", "ja": "JA"}

TITLE = {
    "ms": "Aquatic Rhythm — Penjagaan Ekologi untuk Akuarium Kecil",
    "id": "Aquatic Rhythm — Perawatan Ekologis untuk Akuarium Kecil",
    "ja": "Aquatic Rhythm — 小型水槽のための生態学的なケア",
}
DESCRIPTION = {
    "ms": "Ekologi akuarium rumah yang tenang dan mesra mudah alih. ARA (Aquatic Rhythm Alignment) menggabungkan Panduan bermodul, makmal interaktif, Rhyssa di laman ini, dan log peribadi dalam peranti. Akses ChatGPT pilihan tersedia untuk penjaga yang lebih suka.",
    "id": "Ekologi akuarium rumah yang tenang dan ramah perangkat seluler. ARA (Aquatic Rhythm Alignment) menyatukan Panduan bermodul, laboratorium interaktif, Rhyssa di situs ini, dan jurnal pribadi di perangkat. Akses ChatGPT opsional tersedia bagi yang lebih menyukainya.",
    "ja": "落ち着いた、モバイルフレンドリーな家庭用水槽の生態学。ARA（Aquatic Rhythm Alignment）が、モジュール式のガイド、対話型ラボ、このサイト上のRhyssa、そして端末内のプライベートな記録をひとつにまとめる。ChatGPT経由のオプションアクセスも利用できる。",
}
OG_DESC = {
    "ms": "Dibina untuk penjaga yang mengambil berat secara mendalam dan tidak selalu ada masa untuk menunjukkannya. Panduan tenang berasaskan ekologi untuk akuarium kecil — dengan ARA, alat, dan Rhyssa.",
    "id": "Dibuat untuk penjaga yang peduli secara mendalam dan tidak selalu punya waktu untuk menunjukkannya. Panduan tenang berbasis ekologi untuk akuarium kecil — dengan ARA, alat, dan Rhyssa.",
    "ja": "深く気にかけていても、それを示す時間がいつもあるとは限らないキーパーのために作られた。小型水槽のための、落ち着いた生態学重視のガイド — ARA、ツール、そしてRhyssaとともに。",
}
OG_IMAGE_ALT = {
    "ms": "Aquatic Rhythm — panduan ekologi untuk akuarium rumah",
    "id": "Aquatic Rhythm — panduan ekologi untuk akuarium rumah",
    "ja": "Aquatic Rhythm — 家庭用水槽のための生態学ガイド",
}
WEBSITE_ALT_NAME = {
    "ms": "Penjagaan ekologi untuk akuarium kecil",
    "id": "Perawatan ekologis untuk akuarium kecil",
    "ja": "小型水槽のための生態学的なケア",
}
WEBSITE_DESC = {
    "ms": "Aquatic Rhythm membantu penjaga memahami ekologi akuarium sistem tertutup — kimia air, biologi, dan waktu — menggunakan ARA dan panduan praktikal.",
    "id": "Aquatic Rhythm membantu penjaga memahami ekologi akuarium sistem tertutup — kimia air, biologi, dan waktu — menggunakan ARA dan panduan praktis.",
    "ja": "Aquatic Rhythmは、ARAと実践的なガイドを用いて、閉鎖系水槽の生態 — 水質、生物、そしてタイミング — を読み解く手助けをする。",
}
LOGO_ARIA = {
    "ms": "Aquatic Rhythm — penjagaan ekologi untuk akuarium kecil",
    "id": "Aquatic Rhythm — perawatan ekologis untuk akuarium kecil",
    "ja": "Aquatic Rhythm — 小型水槽のための生態学的なケア",
}

NAV = {
    "ms": {"home": "Laman Utama", "reading": "Panduan", "companion": "Rakan", "companionMobile": "Rakan AI",
           "tools": "Alat", "toolsMobile": "Makmal &amp; Alat", "log": "Catatan", "about": "Tentang",
           "privacy": "Dasar Privasi", "terms": "Terma Penggunaan", "menu": "Menu"},
    "id": {"home": "Beranda", "reading": "Panduan", "companion": "Pendamping", "companionMobile": "Pendamping AI",
           "tools": "Alat", "toolsMobile": "Lab &amp; Alat", "log": "Catatan", "about": "Tentang",
           "privacy": "Kebijakan Privasi", "terms": "Syarat Penggunaan", "menu": "Menu"},
    "ja": {"home": "ホーム", "reading": "ガイド", "companion": "コンパニオン", "companionMobile": "AIコンパニオン",
           "tools": "ツール", "toolsMobile": "ラボ&amp;ツール", "log": "記録", "about": "サイトについて",
           "privacy": "プライバシーポリシー", "terms": "利用規約", "menu": "メニュー"},
}

BNAV_ARIA = {
    "ms": {"home": "Laman Utama", "reading": "Panduan", "tools": "Makmal &amp; Alat", "log": "Log Penjaga"},
    "id": {"home": "Beranda", "reading": "Panduan", "tools": "Lab &amp; Alat", "log": "Log Penjaga"},
    "ja": {"home": "ホーム", "reading": "ガイド", "tools": "ラボ&amp;ツール", "log": "キーパーの記録"},
}


def load_units(lang):
    with open(UNITS_DIR / f"{lang}.json", encoding="utf-8") as f:
        return json.load(f)


TRANS_DIR = ROOT / "translations"


def ready_article_title(lang, slug):
    """Return the translated ogTitle for a "ready" article, or None if this
    slug isn't translated for this language (matches build-i18n.mjs's
    getTranslatedSlugs() status==="ready" filter)."""
    p = TRANS_DIR / lang / f"{slug}.json"
    if not p.exists():
        return None
    d = json.loads(p.read_text(encoding="utf-8"))
    if d.get("_meta", {}).get("status") != "ready":
        return None
    return d.get("head", {}).get("ogTitle") or None


def replace_once(html, pattern, repl_fn, label, flags=0):
    new_html, n = re.subn(pattern, repl_fn, html, count=1, flags=flags)
    if n == 0:
        print(f"  WARNING: pattern not found for {label}", file=sys.stderr)
    return new_html


def fix_asset_paths(h):
    for rel in ["favicon.png", "css/style.css", "css/kofi-sheet.css",
                "js/ecosystem.js", "js/fauna.js", "js/ui.js", "js/ui-eco-toggle.js",
                "js/ui-reading-pathways.js", "js/ui-rhyssa-sheet.js", "js/ui-rhyssa-page.js",
                "js/ui-settings.js", "js/kofi-sheet.js", "js/rhyssa-fab-ext.js"]:
        h = h.replace(f'"{rel}?v=', f'"/{rel}?v=')
        h = h.replace(f'href="{rel}"', f'href="/{rel}"')
    return h


def build_head(h, lang):
    h = replace_once(h, r'(<html lang=")[^"]*(")', lambda m: m.group(1) + lang + m.group(2), "html lang")
    h = replace_once(h, r'<title>[^<]*</title>', lambda m: f"<title>{TITLE[lang]}</title>", "title")
    h = replace_once(h, r'(<meta name="description" id="meta-desc" content=")[^"]*(")',
                      lambda m: m.group(1) + DESCRIPTION[lang] + m.group(2), "meta description")
    h = replace_once(h, r'(<link rel="canonical" href=")[^"]*(")',
                      lambda m: m.group(1) + f"https://aquaticrhythm.com/{lang}/" + m.group(2), "canonical")
    # hreflang tags — inject after canonical
    hreflang_lines = [f'<link rel="alternate" hreflang="en" href="https://aquaticrhythm.com/">']
    for l in LANGUAGES:
        hreflang_lines.append(f'<link rel="alternate" hreflang="{l}" href="https://aquaticrhythm.com/{l}/">')
    hreflang_lines.append('<link rel="alternate" hreflang="x-default" href="https://aquaticrhythm.com/">')
    hreflang = "\n" + "\n".join(hreflang_lines)
    h = replace_once(h, r'(<link rel="canonical"[^>]*>)', lambda m: m.group(1) + hreflang, "hreflang inject")
    # JSON-LD @graph — inLanguage + alternateName + description
    h = replace_once(h, r'("alternateName":")[^"]*(")',
                      lambda m: m.group(1) + WEBSITE_ALT_NAME[lang] + m.group(2), "jsonld alternateName")
    h = replace_once(h, r'("description":"Aquatic Rhythm helps keepers[^"]*")',
                      lambda m: '"description":"' + WEBSITE_DESC[lang] + '"', "jsonld description")
    h = replace_once(h, r'("inLanguage":")[^"]*(")',
                      lambda m: m.group(1) + lang + m.group(2), "jsonld inLanguage")
    # OG / twitter
    h = replace_once(h, r'(<meta property="og:locale" content=")[^"]*(")',
                      lambda m: m.group(1) + lang + m.group(2), "og:locale")
    h = replace_once(h, r'(<meta property="og:url" content=")[^"]*(")',
                      lambda m: m.group(1) + f"https://aquaticrhythm.com/{lang}/" + m.group(2), "og:url")
    h = replace_once(h, r'(<meta property="og:title" content=")[^"]*(")',
                      lambda m: m.group(1) + TITLE[lang].replace(" — ", " — ") + m.group(2), "og:title")
    h = replace_once(h, r'(<meta property="og:description" content=")[^"]*(")',
                      lambda m: m.group(1) + OG_DESC[lang] + m.group(2), "og:description")
    h = replace_once(h, r'(<meta property="og:image:alt" content=")[^"]*(")',
                      lambda m: m.group(1) + OG_IMAGE_ALT[lang] + m.group(2), "og:image:alt")
    h = replace_once(h, r'(<meta name="twitter:url" content=")[^"]*(")',
                      lambda m: m.group(1) + f"https://aquaticrhythm.com/{lang}/" + m.group(2), "twitter:url")
    h = replace_once(h, r'(<meta name="twitter:title" content=")[^"]*(")',
                      lambda m: m.group(1) + TITLE[lang] + m.group(2), "twitter:title")
    h = replace_once(h, r'(<meta name="twitter:description" content=")[^"]*(")',
                      lambda m: m.group(1) + OG_DESC[lang] + m.group(2), "twitter:description")
    h = replace_once(h, r'(<meta name="twitter:image:alt" content=")[^"]*(")',
                      lambda m: m.group(1) + OG_IMAGE_ALT[lang] + m.group(2), "twitter:image:alt")
    if lang == "ja":
        noto = ('\n<link rel="preload" as="style" '
                'href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" '
                'onload="this.onload=null;this.rel=\'stylesheet\'">'
                '\n<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400&display=swap" rel="stylesheet"></noscript>')
        h = re.sub(r'(<link rel="stylesheet" href="/css/kofi-sheet\.css\?v=\d+">)',
                    lambda m: m.group(1) + noto, h, count=1)
    return h


def build_nav(h, lang):
    nav = NAV[lang]
    bnav = BNAV_ARIA[lang]

    h = replace_once(h, r'(<a href="/" class="nl" data-page="home" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + LOGO_ARIA[lang] + m.group(2), "logo aria (desktop nav)")

    h = replace_once(h, r'(<ul class="nlinks">)[\s\S]*?(<\/ul>)', lambda m: f"""{m.group(1)}
    <li><a href="/" data-page="home">{nav['home']}</a></li>
    <li><a href="/{lang}/reading" data-page="reading">{nav['reading']}</a></li>
    <li><a href="/companion" data-page="companion">{nav['companion']}</a></li>
    <li><a href="/tools" data-page="tools">{nav['tools']}</a></li>
    <li><a href="/journal" data-page="journal">{nav['log']}</a></li>
    <li><a href="/about" data-page="about">{nav['about']}</a></li>
  {m.group(2)}""", "desktop nlinks")

    h = replace_once(h, r'(<button class="nbg" id="burger" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + nav['menu'] + m.group(2), "burger aria")

    h = replace_once(h, r'(<div class="nmob" id="nmob"[^>]*>\s*<ul>)[\s\S]*?(<\/ul>)', lambda m: f"""{m.group(1)}
    <li><a href="/" data-page="home">{nav['home']}</a></li>
    <li><a href="/{lang}/reading" data-page="reading">{nav['reading']}</a></li>
    <li><a href="/companion" data-page="companion">{nav['companionMobile']}</a></li>
    <li><a href="/tools" data-page="tools">{nav['toolsMobile']}</a></li>
    <li><a href="/journal" data-page="journal">{nav['log']}</a></li>
    <li><a href="/about" data-page="about">{nav['about']}</a></li>
    <li><a href="/privacy" data-page="privacy">{nav['privacy']}</a></li>
    <li><a href="/terms" data-page="terms">{nav['terms']}</a></li>
  {m.group(2)}""", "mobile nav ul")

    # Bottom nav (bnav) — Home / Reading / Tools / Log, each has aria-label + .bnav-label span
    h = replace_once(h, r'(data-page="home" data-bnav="home" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + bnav['home'] + m.group(2), "bnav home aria")
    h = replace_once(h, r'(data-page="reading" data-bnav="reading" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + bnav['reading'] + m.group(2), "bnav reading aria")
    h = replace_once(h, r'(data-page="tools" data-bnav="tools" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + bnav['tools'] + m.group(2), "bnav tools aria")
    h = replace_once(h, r'(data-page="journal" data-bnav="journal" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + bnav['log'] + m.group(2), "bnav log aria")
    # bnav-label spans, in document order: home, reading, tools, journal
    labels = [nav['home'], nav['reading'], nav['tools'], nav['log']]
    it = iter(labels)
    h = re.sub(r'(<span class="bnav-label">)[^<]*(</span>)',
               lambda m: m.group(1) + next(it) + m.group(2), h)

    return h


def build_home(h, lang, u):
    x = u["home"]

    h = replace_once(h, r'(<h1 class="dxl">)[\s\S]*?(<\/h1>)',
                      lambda m: m.group(1) + x["hero_h1"] + m.group(2), "hero h1")
    h = replace_once(h, r'(<p class="hk">)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["hero_sub"] + m.group(2), "hero sub")
    h = replace_once(h, r'(<a href="/reading" class="btn bf"[^>]*>)[^<]*(<\/a>)',
                      lambda m: m.group(1) + x["hero_cta"] + m.group(2), "hero cta")

    h = replace_once(h, r'(<p class="home-keeper-lead">)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["keeper_lead"] + m.group(2), "keeper lead")
    h = replace_once(h, r'(<p class="home-keeper-body">)[\s\S]*?(<\/p>\s*<p class="home-keeper-body">)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["keeper_body1"] + m.group(2) + x["keeper_body2"] + m.group(3),
                      "keeper body 1+2")

    h = replace_once(h, r'(<span class="ey">)How this site thinks(<\/span>)',
                      lambda m: m.group(1) + x["ara_ey"] + m.group(2), "ara ey")
    h = replace_once(h, r'(<p class="home-ara-lead">)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["ara_lead"] + m.group(2), "ara lead")
    h = replace_once(h, r'(<span>Without this lens<\/span>\s*<p>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["reframe_without_text"] + m.group(2), "reframe without")
    h = h.replace(">Without this lens<", f">{x['reframe_without_label']}<")
    h = replace_once(h, r'(<span>With ARA<\/span>\s*<p>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["reframe_with_text"] + m.group(2), "reframe with")
    h = h.replace(">With ARA<", f">{x['reframe_with_label']}<")
    h = h.replace(">Four questions before any action<", f">{x['principles_label']}<")
    h = replace_once(h, r'(<li>)<strong>Timing<\/strong>[\s\S]*?(<\/li>)',
                      lambda m: m.group(1) + x["principle_timing"] + m.group(2), "principle timing")
    h = replace_once(h, r'(<li>)<strong>Capacity<\/strong>[\s\S]*?(<\/li>)',
                      lambda m: m.group(1) + x["principle_capacity"] + m.group(2), "principle capacity")
    h = replace_once(h, r'(<li>)<strong>Rhythm<\/strong>[\s\S]*?(<\/li>)',
                      lambda m: m.group(1) + x["principle_rhythm"] + m.group(2), "principle rhythm")
    h = replace_once(h, r'(<li>)<strong>Observation<\/strong>[\s\S]*?(<\/li>)',
                      lambda m: m.group(1) + x["principle_observation"] + m.group(2), "principle observation")
    h = replace_once(h, r'(<a href="/articles/ara-full-framework" class="btn bf">)[^<]*(<\/a>)',
                      lambda m: m.group(1) + x["ara_foot_cta"] + m.group(2), "ara foot cta")

    h = h.replace(">Four areas to explore<", f">{x['offers_ey']}<")
    h = replace_once(h, r'(<h2 class="pst" id="home-offers-title">)[\s\S]*?(<\/h2>)',
                      lambda m: m.group(1) + x["offers_h2"] + m.group(2), "offers h2")
    h = replace_once(h, r'(id="home-offers-title">[\s\S]*?<\/h2>\s*<p class="bt"[^>]*>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["offers_lead"] + m.group(2), "offers lead")

    h = h.replace('<span class="home-tile-tag">Reading</span>', f'<span class="home-tile-tag">{x["tile1_tag"]}</span>')
    h = h.replace('<h3>Modular ecology guides</h3>', f'<h3>{x["tile1_h3"]}</h3>')
    h = replace_once(h, r'(data-page="reading">\s*<span class="home-tile-tag">[^<]*<\/span>\s*<h3>[^<]*<\/h3>\s*<p>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["tile1_p"] + m.group(2), "tile1 p")
    h = h.replace('<span class="home-tile-cta">Browse Reading →</span>', f'<span class="home-tile-cta">{x["tile1_cta"]}</span>')

    h = h.replace('<span class="home-tile-tag">Labs &amp; tools</span>', f'<span class="home-tile-tag">{x["tile2_tag"]}</span>')
    h = h.replace('<h3>Try decisions on screen first</h3>', f'<h3>{x["tile2_h3"]}</h3>')
    h = replace_once(h, r'(data-page="tools">\s*<span class="home-tile-tag">[^<]*<\/span>\s*<h3>[^<]*<\/h3>\s*<p>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["tile2_p"] + m.group(2), "tile2 p")
    h = h.replace('<span class="home-tile-cta">Open Labs &amp; tools →</span>', f'<span class="home-tile-cta">{x["tile2_cta"]}</span>')

    h = h.replace('<span class="home-tile-tag">Companion</span>', f'<span class="home-tile-tag">{x["tile3_tag"]}</span>')
    h = h.replace('<h3>Rhyssa — a thinking partner</h3>', f'<h3>{x["tile3_h3"]}</h3>')
    h = replace_once(h, r'(<h3>Rhyssa[^<]*<\/h3>\s*<p>)An AI companion[\s\S]*?(<a href="https://chatgpt\.com[^"]*"[^>]*>)ChatGPT ↗(<\/a>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["tile3_p_pre"] + m.group(2) + x["tile3_p_link"] + m.group(3) + x["tile3_p_post"] + m.group(4),
                      "tile3 p")
    h = h.replace('<span class="home-tile-cta">Chat with Rhyssa →</span>', f'<span class="home-tile-cta">{x["tile3_cta"]}</span>')

    h = h.replace('<span class="home-tile-tag">Keeper\'s Log</span>', f'<span class="home-tile-tag">{x["tile4_tag"]}</span>')
    h = h.replace('<h3>A quiet log on your device</h3>', f'<h3>{x["tile4_h3"]}</h3>')
    h = replace_once(h, r'(data-page="journal">\s*<span class="home-tile-tag">[^<]*<\/span>\s*<h3>[^<]*<\/h3>\s*<p>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["tile4_p"] + m.group(2), "tile4 p")
    h = h.replace('<span class="home-tile-cta">Open Log →</span>', f'<span class="home-tile-cta">{x["tile4_cta"]}</span>')

    # SEO-links nav (screen-reader/crawler-only, visually clipped — css/style.css
    # .seo-links). Articles that ARE translated get their href pointed at the
    # localized copy and their anchor text swapped for the real translated
    # title (pulled live from translations/<lang>/<slug>.json so it can never
    # drift from the actual shipped article title). Articles/pages that are
    # NOT translated yet (tank-simulator, community-stress-lab, ara-full-framework,
    # /rhyssa) are left pointing at the English original — a live English link
    # beats a broken or mismatched-language one.
    h = h.replace('<a href="/reading">Reading — Aquarium Guides</a>',
                  f'<a href="/{lang}/reading">{x["tile1_tag"]} — {x["tile1_h3"]}</a>')

    def seo_link_sub(m):
        slug = m.group(1)
        text = m.group(2)
        title = ready_article_title(lang, slug)
        if title is None:
            return m.group(0)
        return f'<a href="/{lang}/articles/{slug}">{title}</a>'

    h = re.sub(r'<a href="/articles/([a-z0-9-]+)">([^<]*)</a>', seo_link_sub, h)

    return h


def build_companion(h, lang, u):
    x = u["companion"]
    h = replace_once(h, r'(<span class="rh-page-name">Rhyssa<\/span>\s*<span class="rh-page-sub">)[^<]*(<\/span>)',
                      lambda m: m.group(1) + x["sub"] + m.group(2), "companion sub")
    h = replace_once(h, r'(<button class="rh-hist-btn" id="rh-cp-back" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + x["back_aria"] + m.group(2), "companion back aria")
    h = replace_once(h, r'(<button class="rh-new-btn" id="rh-cp-new" aria-label=")[^"]*(" title=")[^"]*(")',
                      lambda m: m.group(1) + x["new_aria"] + m.group(2) + x["new_aria"] + m.group(3), "companion new aria")
    h = replace_once(h, r'(<p class="rh-welcome-text">)[^<]*(<\/p>)',
                      lambda m: m.group(1) + x["welcome"] + m.group(2), "companion welcome")

    starters = [
        ("Something looks off in my tank — I'm not sure where to start reading it", "Something looks off", "starter1_data", "starter1_btn"),
        ("Can you explain the nitrogen cycle in plain terms?", "Nitrogen cycle", "starter2_data", "starter2_btn"),
        ("I'm setting up my first aquarium — what should I know?", "First tank setup", "starter3_data", "starter3_btn"),
        ("My fish seem stressed. Where do I start?", "Fish seem stressed", "starter4_data", "starter4_btn"),
    ]
    for en_data, en_btn, data_key, btn_key in starters:
        h = h.replace(f'data-starter="{en_data}">{en_btn}<',
                       f'data-starter="{x[data_key]}">{x[btn_key]}<')

    h = replace_once(h, r'(<textarea id="rh-cp-inp" class="rh-page-inp" placeholder=")[^"]*(")',
                      lambda m: m.group(1) + x["placeholder"] + m.group(2), "companion placeholder")
    h = replace_once(h, r'(<button type="submit" class="rh-page-send" id="rh-cp-send" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + x["send_aria"] + m.group(2), "companion send aria")
    h = replace_once(h, r'(<p class="rh-page-note">)[^<]*(<\/p>)',
                      lambda m: m.group(1) + x["note"] + m.group(2), "companion note")
    return h


def build_terms(h, lang, u):
    x = u["terms"]
    h = replace_once(h, r'(<div id="pg-terms" class="page"><div class="pl">\s*<section class="privh pad cap"><div class="sr"><span class="ey">)[^<]*(<\/span><h1[^>]*>)[^<]*(<\/h1><span class="privdate">)[^<]*(<\/span>)',
                      lambda m: m.group(1) + x["h1"] + m.group(2) + x["h1"] + m.group(3) + x["date"] + m.group(4),
                      "terms header")

    sections = [
        ("h_overview", "Overview", "p_overview", None),
        ("h_offers", "What Aquatic Rhythm offers", None, None),
        ("h_noadvice", "No professional advice", None, None),
        ("h_ailimits", "AI limitations", None, None),
        ("h_ip", "Intellectual property", "p_ip", None),
        ("h_liability", "Limitation of liability", "p_liability", None),
        ("h_changes", "Changes to these terms", None, None),
    ]
    for h_key, en_heading, *_ in sections:
        h = h.replace(f'<h3>{en_heading}</h3>', f'<h3>{x[h_key]}</h3>', 1)

    h = replace_once(h, r'(<h3>' + re.escape(x["h_overview"]) + r'<\/h3><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_overview"] + m.group(2), "terms overview body")
    h = replace_once(h, r'(<h3>' + re.escape(x["h_offers"]) + r'<\/h3><p>)[\s\S]*?(<\/p><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_offers1"] + m.group(2) + x["p_offers2"] + m.group(3), "terms offers body")
    h = replace_once(h, r'(<h3>' + re.escape(x["h_noadvice"]) + r'<\/h3><p>)[\s\S]*?(<\/p><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_noadvice1"] + m.group(2) + x["p_noadvice2"] + m.group(3), "terms noadvice body")
    h = replace_once(h, r'(<h3>' + re.escape(x["h_ailimits"]) + r'<\/h3><p>)[\s\S]*?(<\/p><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_ailimits1"] + m.group(2) + x["p_ailimits2"] + m.group(3), "terms ailimits body")
    h = replace_once(h, r'(<h3>' + re.escape(x["h_ip"]) + r'<\/h3><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_ip"] + m.group(2), "terms ip body")
    h = replace_once(h, r'(<h3>' + re.escape(x["h_liability"]) + r'<\/h3><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_liability"] + m.group(2), "terms liability body")
    h = replace_once(h, r'(<h3>' + re.escape(x["h_changes"]) + r'<\/h3><p>)[\s\S]*?Write to us at (<a[^>]*><span[^>]*data-cfemail="[^"]*">)\[email&#160;protected\](<\/span><\/a><\/p><\/div>)',
                      lambda m: m.group(1) + x["p_changes_pre"] + m.group(2) + '[email&#160;protected]' + m.group(3),
                      "terms changes body")
    return h


def build_privacy(h, lang, u):
    x = u["privacy"]
    h = replace_once(h, r'(<div id="pg-privacy" class="page"><div class="pl">\s*<section class="privh pad cap"><div class="sr"><span class="ey">)[^<]*(<\/span><h1[^>]*>)[^<]*(<\/h1><span class="privdate">)[^<]*(<\/span>)',
                      lambda m: m.group(1) + x["h1"] + m.group(2) + x["h1"] + m.group(3) + x["date"] + m.group(4),
                      "privacy header")

    headings = [("h_overview", "Overview"), ("h_direct", "Information we collect directly"),
                ("h_third", "Third-party services"), ("h_cookies", "Cookies"),
                ("h_rights", "Your rights"), ("h_children", "Children"),
                ("h_changes", "Changes to this policy")]
    for h_key, en_heading in headings:
        h = h.replace(f'<h3>{en_heading}</h3>', f'<h3>{x[h_key]}</h3>', 1)

    h = replace_once(h, r'(<h3>' + re.escape(x["h_overview"]) + r'<\/h3><p>)[\s\S]*?Questions can be directed to (<a[^>]*><span[^>]*data-cfemail="[^"]*">)\[email&#160;protected\](<\/span><\/a><\/p><\/div>)',
                      lambda m: m.group(1) + x["p_overview_pre"] + m.group(2) + '[email&#160;protected]' + m.group(3),
                      "privacy overview body")

    h = replace_once(h, r'(<h3>' + re.escape(x["h_direct"]) + r'<\/h3><p>)[\s\S]*?(<\/p><ul><li><strong[^>]*>)Email contact(<\/strong>)[\s\S]*?(<\/li><li><strong[^>]*>)Feedback or survey forms(<\/strong>)[\s\S]*?(<\/li><\/ul><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: (m.group(1) + x["p_direct_intro"] + m.group(2) + x["li_direct1_label"] + m.group(3)
                                 + x["li_direct1_text"] + m.group(4) + x["li_direct2_label"] + m.group(5)
                                 + x["li_direct2_text"] + m.group(6) + x["p_direct_end"] + m.group(7)),
                      "privacy direct body")

    h = replace_once(h,
        r'(<h3>' + re.escape(x["h_third"]) + r'<\/h3><p>)[\s\S]*?(<\/p><ul>'
        r'<li><strong[^>]*>)GitHub Pages(<\/strong>)[\s\S]*?(<\/li>'
        r'<li><strong[^>]*>)ChatGPT / OpenAI(<\/strong>)[\s\S]*?(<\/li>'
        r'<li><strong[^>]*>)Google Search Console(<\/strong>)[\s\S]*?(<\/li>'
        r'<li><strong[^>]*>)Google Analytics(<\/strong>)[\s\S]*?(<\/li>'
        r'<li><strong[^>]*>)Ko-fi \(optional tips\)(<\/strong>)[\s\S]*?(<\/li><\/ul><\/div>)',
        lambda m: (m.group(1) + x["p_third_intro"] + m.group(2) + x["li_third1_label"] + m.group(3) + x["li_third1_text"]
                   + m.group(4) + x["li_third2_label"] + m.group(5) + x["li_third2_text"]
                   + m.group(6) + x["li_third3_label"] + m.group(7) + x["li_third3_text"]
                   + m.group(8) + x["li_third4_label"] + m.group(9) + x["li_third4_text"]
                   + m.group(10) + x["li_third5_label"] + m.group(11) + x["li_third5_text"] + m.group(12)),
        "privacy third-party body")

    h = replace_once(h, r'(<h3>' + re.escape(x["h_cookies"]) + r'<\/h3><p>)[\s\S]*?(<\/p><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_cookies1"] + m.group(2) + x["p_cookies2"] + m.group(3), "privacy cookies body")

    h = replace_once(h, r'(<h3>' + re.escape(x["h_rights"]) + r'<\/h3><p>)[\s\S]*?Write to us at (<a[^>]*><span[^>]*data-cfemail="[^"]*">)\[email&#160;protected\](<\/span><\/a>\.<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_rights_pre"] + m.group(2) + '[email&#160;protected]' + m.group(3),
                      "privacy rights body")

    h = replace_once(h, r'(<h3>' + re.escape(x["h_children"]) + r'<\/h3><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_children"] + m.group(2), "privacy children body")
    h = replace_once(h, r'(<h3>' + re.escape(x["h_changes"]) + r'<\/h3><p>)[\s\S]*?(<\/p><\/div>)',
                      lambda m: m.group(1) + x["p_changes"] + m.group(2), "privacy changes body")
    return h


def build_about(h, lang, u):
    x = u["about"]
    h = replace_once(h, r'(<div id="pg-about" class="page">[\s\S]*?<span class="ey">)About(<\/span>)',
                      lambda m: m.group(1) + x["ey"] + m.group(2), "about ey")
    h = replace_once(h, r'(<h1 class="dlg"[^>]*>)Where this<br>came from\.(<\/h1>)',
                      lambda m: m.group(1) + x["h1"] + m.group(2), "about h1")
    h = replace_once(h, r'(margin-top:1\.8rem">)Aquatic Rhythm did not begin[\s\S]*?not unfamiliar\.(<\/p>)',
                      lambda m: m.group(1) + x["intro_italic"] + m.group(2), "about intro italic")
    h = replace_once(h, r'(margin-top:2\.4rem">)What follows is a personal account\.(<\/p>)',
                      lambda m: m.group(1) + x["intro_small"] + m.group(2), "about intro small")

    body_map = [
        ("There are people who come to this hobby looking for something to tend.", "b1_p1"),
        ("Aquariums. Terrariums. Paludariums. Closed ecosystems of all kinds.", "b1_p2"),
        ("Something small and alive. A world that fits inside a room. A corner of daily life made quieter, more present, more grounded.", "b1_p3"),
        ("At first, it works.", "b1_p4"),
        ("But no one warns them about the other part.", "b2_p1"),
        ("The day something stops looking the way it was supposed to look. A patch that appears. A plant that loses its shape. Water that feels off in a way that is hard to name.", "b2_p2"),
        ("And then quietly, almost without noticing, the motivation begins to follow.", "b2_p3"),
        ("When it stopped looking the way it was supposed to look, the wanting to be near it went too.", "b2_quote"),
        ("Not indifference. Not laziness. Just the quiet collapse of something that was only held together by how beautiful it felt to look at.", "b2_p4"),
        ("Then life fills the space where attention used to live. Weeks pass. Sometimes more.", "b3_p1"),
        ("The guilt was real. But it was wrapped around something else. Something I could not name at the time. Maybe the hope that the next time could be different.", "b3_quote"),
        ("That feeling is where this project actually began.", "b3_p2"),
        ("The hobby is not short of people offering answers. New products. Better technique. More precise parameters. The implication is always the same.", "b4_p1"),
        ("No one was talking about the welfare of the person holding the tank. Everyone was selling something. But the thing that was actually breaking was not for sale.", "b4_quote"),
        ("A lot of people quietly give up on something they love. Not because they stopped caring. But because no one told them that caring inconsistently is still caring.", "b4_p2"),
        ("Aquatic Rhythm grew from that recognition. It is a small, independent project. Not a company. The content and tools here are free to use.", "b5_p1"),
        ("What it offers is a perspective and a companion shaped by it. A way of reading closed ecosystems that begins with ecological reality, holds human reality inside it, and does not treat the gap between them as a failure waiting to be corrected.", "b5_p2"),
        ("If you have ever cared imperfectly for a tank and still hoped the next week could feel lighter, this work was written with you in mind.", "b5_italic"),
        ("If this project has been useful, optional tips on Ko-fi help cover hosting and time for guides and tools. Nothing here is paywalled; support is entirely your choice.", "kofi_p"),
        ("Independent project — feedback welcome. Aquatic Rhythm stays open to revision as living rooms and living tanks keep teaching.", "final"),
    ]
    for en_text, key in body_map:
        h = h.replace(f">{en_text}<", f">{x[key]}<", 1)

    h = h.replace(">Support on Ko-fi →<", f">{x['kofi_cta']}<", 1)
    return h


def build_shared_footer(h, lang, u):
    """Footer tagline + subfooter labels appear identically in every pg-* section
    (including the still-English pg-reading/pg-tools/pg-journal/pg-tank-log)."""
    nav = NAV[lang]
    x = u["nav_extra"]
    h = h.replace(">Aligned with living systems.<", ">" + x["footer_tagline"] + "<")
    h = re.sub(r'(<a href="/privacy" data-page="privacy" class="sflink">)[^<]*(<\/a>)',
               lambda m: m.group(1) + nav['privacy'] + m.group(2), h)
    h = re.sub(r'(<a href="/terms" data-page="terms" class="sflink">)[^<]*(<\/a>)',
               lambda m: m.group(1) + nav['terms'] + m.group(2), h)
    h = re.sub(r'(<a href="/about" data-page="about" class="sflink">)[^<]*(<\/a>)',
               lambda m: m.group(1) + nav['about'] + m.group(2), h)
    h = re.sub(r'(<a href="https://ko-fi\.com/aquaticrhythm" class="sflink" data-kofi-open[^>]*>)[^<]*(<\/a>)',
               lambda m: m.group(1) + x['subfooter_support'] + m.group(2), h)
    h = re.sub(r'(<a href="mailto:hello@aquaticrhythm\.com" class="sflink">)[^<]*(<\/a>)',
               lambda m: m.group(1) + x['subfooter_contact'] + m.group(2), h)
    return h


def build_pwa_settings(h, lang, u):
    x = u["nav_extra"]
    h = replace_once(h, r'(<button class="ar-settings-btn" id="ar-settings-btn" aria-label=")[^"]*(" aria-expanded="false" title=")[^"]*(")',
                      lambda m: m.group(1) + x["settings_aria"] + m.group(2) + x["settings_aria"] + m.group(3),
                      "settings btn aria+title")
    h = replace_once(h, r'(<strong>)Keep your guides offline(<\/strong>)',
                      lambda m: m.group(1) + x["pwa_title"] + m.group(2), "pwa title")
    h = replace_once(h, r'(<span>)Read, reference ARA, and consult Rhyssa without a connection\.(<\/span>)',
                      lambda m: m.group(1) + x["pwa_body"] + m.group(2), "pwa body")
    h = replace_once(h, r'(<button class="pip-install" id="pip-install">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + x["pwa_install"] + m.group(2), "pwa install")
    h = replace_once(h, r'(<button class="pip-dismiss" id="pip-dismiss" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + x["pwa_dismiss_aria"] + m.group(2), "pwa dismiss aria")
    return h


def apply_scoped(h, start_id, end_id, transform, lang, u, label):
    """Extract the substring between two `id="pg-*"` div starts, run `transform`
    on ONLY that substring, splice the result back in. This is critical: several
    sections translate the same English heading (e.g. "Overview") to the same
    target word, and an unscoped whole-document replace_once(count=1) will latch
    onto the FIRST section's already-translated heading, then scan forward
    through unrelated content looking for the SECOND section's closing anchor —
    silently consuming and destroying everything (including the next <div id="...">
    boundary) in between. Verified this actually happened for terms/privacy before
    this scoping fix was added.
    """
    start_marker = f'<div id="{start_id}"'
    end_marker = f'<div id="{end_id}"'
    ia = h.find(start_marker)
    ib = h.find(end_marker, ia + 1)
    if ia == -1 or ib == -1:
        print(f"  WARNING: could not locate section bounds for {label} ({start_id} -> {end_id})", file=sys.stderr)
        return h
    section = h[ia:ib]
    new_section = transform(section, lang, u)
    return h[:ia] + new_section + h[ib:]


def main():
    src = SRC.read_text(encoding="utf-8")
    for lang in LANGUAGES:
        units_path = UNITS_DIR / f"{lang}.json"
        if not units_path.exists():
            print(f"skip {lang}: {units_path} not found yet")
            continue
        u = json.loads(units_path.read_text(encoding="utf-8"))
        print(f"building {lang}/index.html ...")
        h = src
        h = fix_asset_paths(h)
        h = build_head(h, lang)
        h = build_nav(h, lang)
        h = build_pwa_settings(h, lang, u)
        h = apply_scoped(h, "pg-home", "pg-companion", build_home, lang, u, "home")
        h = apply_scoped(h, "pg-companion", "pg-terms", build_companion, lang, u, "companion")
        h = apply_scoped(h, "pg-terms", "pg-privacy", build_terms, lang, u, "terms")
        h = apply_scoped(h, "pg-privacy", "pg-about", build_privacy, lang, u, "privacy")
        h = apply_scoped(h, "pg-about", "pg-reading", build_about, lang, u, "about")
        h = build_shared_footer(h, lang, u)
        out_dir = ROOT / lang
        out_dir.mkdir(exist_ok=True)
        (out_dir / "index.html").write_text(h, encoding="utf-8")
        print(f"  wrote {out_dir / 'index.html'}")
        # Sanity check: every pg-* id from the English source must still be present
        # exactly once, and the file's total pg-* div count must be unchanged.
        src_ids = re.findall(r'id="(pg-[a-z-]+)"', src)
        out_ids = re.findall(r'id="(pg-[a-z-]+)"', (out_dir / "index.html").read_text(encoding="utf-8"))
        if src_ids != out_ids:
            print(f"  ERROR: pg-* section id list changed for {lang}! src={src_ids} out={out_ids}", file=sys.stderr)


if __name__ == "__main__":
    main()
