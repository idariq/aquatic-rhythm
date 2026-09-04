#!/usr/bin/env python3
"""
One-off builder for localized homepage SPA shells (id/ja/index.html).

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
Writes: <lang>/index.html for lang in id, ja
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
UNITS_DIR = ROOT / "translations" / "homepage"

LANGUAGES = ["id", "ja"]
LANG_LABEL = {"en": "EN", "id": "ID", "ja": "JA"}

TITLE = {
    "id": "Aquatic Rhythm — Perawatan Ekologis untuk Akuarium Kecil",
    "ja": "Aquatic Rhythm — 小型水槽のための生態学的なケア",
}
DESCRIPTION = {
    "id": "Ekologi akuarium rumah yang tenang dan ramah perangkat seluler. ARA (Aquatic Rhythm Alignment) menyatukan Panduan bermodul, laboratorium interaktif, Rhyssa di situs ini, dan jurnal pribadi di perangkat. Akses ChatGPT opsional tersedia bagi yang lebih menyukainya.",
    "ja": "落ち着いた、モバイルフレンドリーな家庭用水槽の生態学。ARA（Aquatic Rhythm Alignment）が、モジュール式のガイド、対話型ラボ、このサイト上のRhyssa、そして端末内のプライベートな記録をひとつにまとめる。ChatGPT経由のオプションアクセスも利用できる。",
}
OG_DESC = {
    "id": "Dibuat untuk penjaga yang peduli secara mendalam dan tidak selalu punya waktu untuk menunjukkannya. Panduan tenang berbasis ekologi untuk akuarium kecil — dengan ARA, alat, dan Rhyssa.",
    "ja": "深く気にかけていても、それを示す時間がいつもあるとは限らないキーパーのために作られた。小型水槽のための、落ち着いた生態学重視のガイド — ARA、ツール、そしてRhyssaとともに。",
}
OG_IMAGE_ALT = {
    "id": "Aquatic Rhythm — panduan ekologi untuk akuarium rumah",
    "ja": "Aquatic Rhythm — 家庭用水槽のための生態学ガイド",
}
WEBSITE_ALT_NAME = {
    "id": "Perawatan ekologis untuk akuarium kecil",
    "ja": "小型水槽のための生態学的なケア",
}
WEBSITE_DESC = {
    "id": "Aquatic Rhythm membantu penjaga memahami ekologi akuarium sistem tertutup — kimia air, biologi, dan waktu — menggunakan ARA dan panduan praktis.",
    "ja": "Aquatic Rhythmは、ARAと実践的なガイドを用いて、閉鎖系水槽の生態 — 水質、生物、そしてタイミング — を読み解く手助けをする。",
}
LOGO_ARIA = {
    "id": "Aquatic Rhythm — perawatan ekologis untuk akuarium kecil",
    "ja": "Aquatic Rhythm — 小型水槽のための生態学的なケア",
}

NAV = {
    "id": {"home": "Beranda", "reading": "Panduan", "companion": "Pendamping", "companionMobile": "Pendamping AI",
           "tools": "Alat", "toolsMobile": "Lab &amp; Alat", "log": "Catatan", "about": "Tentang",
           "privacy": "Kebijakan Privasi", "terms": "Syarat Penggunaan", "menu": "Menu"},
    "ja": {"home": "ホーム", "reading": "ガイド", "companion": "コンパニオン", "companionMobile": "AIコンパニオン",
           "tools": "ツール", "toolsMobile": "ラボ&amp;ツール", "log": "記録", "about": "サイトについて",
           "privacy": "プライバシーポリシー", "terms": "利用規約", "menu": "メニュー"},
}

BNAV_ARIA = {
    "id": {"home": "Beranda", "reading": "Panduan", "tools": "Lab &amp; Alat", "log": "Log Penjaga"},
    "ja": {"home": "ホーム", "reading": "ガイド", "tools": "ラボ&amp;ツール", "log": "キーパーの記録"},
}

# Rhyssa chat sliding sheet (.rh-sheet) — shared sitewide UI, same convention
# as NAV/BNAV_ARIA. Was left entirely English on id/ja (bug found 2026-08-18,
# user video) even though the separate full Companion page's own chat shell
# (pg-companion, build_companion() below) was already translated — welcome/
# note/sub reuse that exact phrasing for consistency.
RH_SHEET = {
    "id": {
        "dialog_aria": "Chat dengan Rhyssa", "close_aria": "Tutup obrolan", "sub": "Pendamping Akuarium",
        "kofi_aria": "Dukungan di Ko-fi", "tabs_aria": "Percakapan", "new_conv_aria": "Percakapan baru",
        "thread_aria": "Percakapan dengan Rhyssa",
        "welcome": "Ceritakan apa yang Anda lihat — air, perilaku, apa pun yang berubah — dan kita bisa memahaminya bersama sebelum memperbaiki apa pun.",
        "chip1_label": "Ada yang tidak beres", "chip1_msg": "Ada yang terlihat tidak beres di akuarium saya — saya tidak yakin harus menyimpulkan apa.",
        "chip2_label": "Ikan terlihat stres", "chip2_msg": "Ikan saya terlihat stres atau berperilaku berbeda dari biasanya.",
        "chip3_label": "Air terlihat berbeda", "chip3_msg": "Air saya terlihat berbeda hari ini — tidak yakin apakah ini masalah.",
        "chip4_label": "Akuarium baru", "chip4_msg": "Saya sedang menyiapkan akuarium baru dan tidak yakin apa yang perlu saya ketahui.",
        "chip5_label": "Sekadar mengamati", "chip5_msg": "Saya hanya mengamati akuarium saya. Tidak ada yang mendesak — sekadar mengamati.",
        "also_pre": "Rhyssa yang sama — juga ada di ", "also_post": " jika Anda lebih suka.",
        "input_placeholder": "Tanyakan tentang akuarium Anda…", "input_aria": "Pesan untuk Rhyssa",
        "send_aria": "Kirim",
        "note": "AI bisa saja salah — untuk keadaan darurat pada ikan, konsultasikan dengan spesialis",
    },
    "ja": {
        "dialog_aria": "Rhyssaとチャット", "close_aria": "チャットを閉じる", "sub": "アクアリウムコンパニオン",
        "kofi_aria": "Ko-fiで支援", "tabs_aria": "会話", "new_conv_aria": "新しい会話",
        "thread_aria": "Rhyssaとの会話",
        "welcome": "見えているものを教えてください。水、行動、変わったことなら何でも構いません。何かを直す前に、一緒に読み解いていきましょう。",
        "chip1_label": "何かおかしい", "chip1_msg": "水槽の様子が何かおかしい気がしますが、どう考えればいいのか分かりません。",
        "chip2_label": "魚がストレスを感じている", "chip2_msg": "うちの魚がストレスを感じているようで、いつもと様子が違います。",
        "chip3_label": "水の様子が違う", "chip3_msg": "今日は水の様子がいつもと違いますが、問題かどうか分かりません。",
        "chip4_label": "新しい水槽", "chip4_msg": "新しい水槽をセットアップ中で、何を知っておくべきか分かりません。",
        "chip5_label": "ただ見守っている", "chip5_msg": "特に急ぎではありませんが、水槽をただ見守っています。",
        "also_pre": "同じRhyssaは、", "also_post": "でもご利用いただけます。",
        "input_placeholder": "水槽について質問する…", "input_aria": "Rhyssaへのメッセージ",
        "send_aria": "送信",
        "note": "AIは間違えることがあります。魚の緊急事態では、専門家に相談してください",
    },
}

# Settings panel chrome — shared sitewide UI (same convention as NAV/BNAV_ARIA
# above), not per-article content. Bug found 2026-08-18 (user video): this
# panel was never translated at all on id/ja, even though the gear button's
# own aria-label (nav_extra.settings_aria) already was.
SETTINGS = {
    "id": {
        "title": "Pengaturan", "close_aria": "Tutup pengaturan",
        "theme_label": "Tema", "theme_system": "Sistem", "theme_light": "Terang", "theme_dark": "Gelap",
        "language_label": "Bahasa",
        "ecosystem_label": "Ekosistem",
        "fauna_label": "Fauna", "fauna_sub": "Ikan &amp; hewan", "fauna_aria": "Tampilkan fauna",
        "flora_label": "Flora", "flora_sub": "Tumbuhan &amp; kayu apung", "flora_aria": "Tampilkan flora",
        "motion_label": "Kurangi Gerakan", "motion_sub": "Menjeda animasi latar belakang", "motion_aria": "Kurangi gerakan",
        "units_label": "Satuan",
        "temp_label": "Suhu", "temp_group_aria": "Satuan suhu",
        "vol_label": "Volume", "vol_group_aria": "Satuan volume", "vol_litres": "Liter", "vol_usgal": "Galon AS",
        "log_label": "Catatan Penjaga",
        "entry_order_label": "Urutan Entri", "entry_order_sub": "Terbaru atau terlama dulu", "entry_sort_aria": "Urutan entri",
        "newest": "Terbaru", "oldest": "Terlama",
        "wc_alert_label": "Peringatan Ganti Air", "wc_alert_sub": "Peringatkan setelah sekian hari",
        "wc_alert_aria": "Jumlah hari sebelum peringatan ganti air",
        "privacy_label": "Privasi",
        "analytics_label": "Analitik Penggunaan", "analytics_sub": "Membantu meningkatkan aplikasi",
        "analytics_aria": "Aktifkan analitik penggunaan",
        "data_label": "Data", "export_btn": "Ekspor Catatan", "import_btn": "Impor Catatan",
        "import_aria": "Impor berkas JSON jurnal",
        "clear_rhyssa_btn": "Hapus Obrolan Rhyssa", "reset_all_btn": "Setel Ulang Semua Data",
        "app_label": "Aplikasi", "install_btn": "Pasang Aplikasi", "install_sub": "Tambahkan ke layar utama",
    },
    "ja": {
        "title": "設定", "close_aria": "設定を閉じる",
        "theme_label": "テーマ", "theme_system": "システム", "theme_light": "ライト", "theme_dark": "ダーク",
        "language_label": "言語",
        "ecosystem_label": "エコシステム",
        "fauna_label": "動物", "fauna_sub": "魚と生き物", "fauna_aria": "動物を表示",
        "flora_label": "植物", "flora_sub": "水草と流木", "flora_aria": "植物を表示",
        "motion_label": "モーション削減", "motion_sub": "背景アニメーションを一時停止", "motion_aria": "モーションを削減",
        "units_label": "単位",
        "temp_label": "水温", "temp_group_aria": "温度単位",
        "vol_label": "水量", "vol_group_aria": "容量単位", "vol_litres": "リットル", "vol_usgal": "米ガロン",
        "log_label": "キーパーの記録",
        "entry_order_label": "記録の並び順", "entry_order_sub": "新しい順または古い順", "entry_sort_aria": "記録の並び順",
        "newest": "新しい順", "oldest": "古い順",
        "wc_alert_label": "水換えアラート", "wc_alert_sub": "指定日数後に通知",
        "wc_alert_aria": "水換えアラートまでの日数",
        "privacy_label": "プライバシー",
        "analytics_label": "利用状況分析", "analytics_sub": "アプリの改善に役立ちます",
        "analytics_aria": "利用状況分析を有効にする",
        "data_label": "データ", "export_btn": "記録をエクスポート", "import_btn": "記録をインポート",
        "import_aria": "ジャーナルのJSONファイルをインポート",
        "clear_rhyssa_btn": "Rhyssaのチャットを削除", "reset_all_btn": "すべてのデータをリセット",
        "app_label": "アプリ", "install_btn": "アプリをインストール", "install_sub": "ホーム画面に追加",
    },
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
    """Absolutise every relative asset reference.

    index.html is served from /, but the localized copies live at /id/ and
    /ja/, so a relative src="js/x.js" resolves to /id/js/x.js and 404s.

    This used to be a hardcoded list of filenames, and it drifted: when
    js/ui-calm-mode.js was added to index.html it was never added here, so
    calm mode silently 404'd on BOTH localized homepages while the English
    one worked. Derive the rewrite instead of listing it, so the next asset
    added to index.html is handled without touching this script.
    """
    h = re.sub(r'((?:src|href)=")((?:js|css|og|img)/)', r'\1/\2', h)
    h = h.replace('href="favicon.png"', 'href="/favicon.png"')
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
    h = replace_once(h, r'(<li>)<strong>Consistency<\/strong>[\s\S]*?(<\/li>)',
                      lambda m: m.group(1) + x["principle_rhythm"] + m.group(2), "principle rhythm")
    h = replace_once(h, r'(<li>)<strong>Observation<\/strong>[\s\S]*?(<\/li>)',
                      lambda m: m.group(1) + x["principle_observation"] + m.group(2), "principle observation")
    h = replace_once(h, r'(<p class="home-ara-psych-lead">)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["ara_psych"] + m.group(2), "ara psych lead")
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


def article_meta_tags(lang, slug):
    """(level_text, modules_time_text) pulled from the article's OWN already-
    shipped translations/<lang>/<slug>.json — reused verbatim rather than
    retranslated, so the reading-index badge can never drift from what the
    article itself displays.

    Which of metaTime/metaLevel actually holds the duration string versus
    the level string is NOT consistent across the site's own history:
    articles shipped before 2026-08-29 store the duration in metaLevel and
    the level text in metaTime (a historical mislabeling that build-i18n.mjs
    fills positionally regardless of name), while articles shipped from
    2026-08-29 onward use the fields as their names suggest. Detect the
    duration field directly instead of trusting either field's name — every
    duration string in every language contains a digit ("~7 min", "~7 menit",
    "約7分") and no level string ever does ("All levels", "Semua level",
    "Practical", "実践的", "入門・中級"). Found via a homepage rebuild that
    silently swapped the level/duration tags for every article shipped in the
    2026-08-29 session (PR #501)."""
    p = TRANS_DIR / lang / f"{slug}.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    intro = d["intro"]
    meta_time, meta_level = intro.get("metaTime", ""), intro.get("metaLevel", "")
    duration, level = (meta_time, meta_level) if re.search(r"[0-9]", meta_time) else (meta_level, meta_time)
    modules_time = f'{intro.get("metaModules", "")} · {duration}'
    return level, modules_time


def build_reading(h, lang, u):
    x = u["reading"]
    hdr = x["header"]
    misc = x["misc"]

    h = replace_once(h, r'(<span class="ey">)Reading(<\/span>)',
                      lambda m: m.group(1) + hdr["ey"] + m.group(2), "reading ey")
    h = replace_once(h, r'(<h1 class="dlg rd-reading-h1"[^>]*>)[\s\S]*?(<\/h1>)',
                      lambda m: m.group(1) + hdr["h1"] + m.group(2), "reading h1")
    h = replace_once(h, r'(<p class="bt sr d1"[^>]*>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + hdr["sub1"] + m.group(2), "reading sub1")
    h = replace_once(h,
        r'(<p class="bt sr d2"[^>]*>)This covers ecology, behaviour, keeper rhythm, and ARA\. If you.d rather try things hands-on, the interactive '
        r'(<a href="/tools"[^>]*>)Labs &amp; tools(<\/a>) live on their own tab\.(<\/p>)',
        lambda m: m.group(1) + hdr["sub2_pre"] + m.group(2) + hdr["sub2_link"] + m.group(3) + hdr["sub2_post"] + m.group(4),
        "reading sub2")

    # Reading-page search bar (added 2026-08-29, PR #492) — client-side
    # title/tag filter with no rd-* CSS class overlap with anything else on
    # the page, so plain literal replacement is safe here (unlike the
    # per-card blocks below, which need the split-and-rebuild approach
    # because multiple cards share the same class names).
    h = replace_once(h, r'(placeholder=")Search guides…(")',
                      lambda m: m.group(1) + misc["search_placeholder"] + m.group(2), "reading search placeholder")
    h = replace_once(h, r'(aria-label=")Search reading guides(")',
                      lambda m: m.group(1) + misc["search_aria"] + m.group(2), "reading search aria")
    h = replace_once(h, r'(aria-label=")Clear search(")',
                      lambda m: m.group(1) + misc["search_clear_aria"] + m.group(2), "reading search clear aria")
    h = replace_once(h, r'(<p class="rd-search-empty"[^>]*>)No guides match your search\. Try a different word\.(<\/p>)',
                      lambda m: m.group(1) + misc["search_empty"] + m.group(2), "reading search empty message")

    cat_labels = iter([c["label"] for c in x["categories"]])
    cat_descs = iter([c["desc"] for c in x["categories"]])
    h = re.sub(r'(<span class="rd-cat-label">)[^<]*(<\/span>)',
               lambda m: m.group(1) + next(cat_labels) + m.group(2), h)
    h = re.sub(r'(<p class="rd-cat-desc">)[^<]*(<\/p>)',
               lambda m: m.group(1) + next(cat_descs) + m.group(2), h)

    # Cards — split into individual per-card blocks (each has a unique href,
    # so no cross-card collision risk like the earlier terms/privacy bug) and
    # rebuild each one independently.
    parts = re.split(r'(?=<div class="rd-card-panel")', h)
    for i, block in enumerate(parts):
        href_m = re.search(r'href="/articles/([a-z0-9-]+)"', block)
        if not href_m:
            continue
        slug = href_m.group(1)
        card = x["cards"].get(slug)
        if not card:
            print(f"  WARNING: no reading-card translation for slug {slug}", file=sys.stderr)
            continue

        if slug == "keeper-readiness-check":
            level, modules_time = card["level_manual"], None
        else:
            level, modules_time = article_meta_tags(lang, slug)
        if slug == "fish-gasping-surface" and misc["urgent_tag"] not in level:
            # The English source appends "· Urgent" only in pg-reading's own
            # markup (the article's own meta tag is plain "All levels"). At
            # least one language's article JSON (ja) already bakes an urgent
            # marker into its own metaTime field independently — guard
            # against double-appending in that case.
            level = f'{level} · {misc["urgent_tag"]}'

        block = replace_once(block, r'(rd-tag-level">)[^<]*(<\/span>)',
                              lambda m: m.group(1) + level + m.group(2), f"{slug} level tag")
        if modules_time is not None:
            block = replace_once(block, r'(<span class="rd-tag">)[^<]*(<\/span>)',
                                  lambda m: m.group(1) + modules_time + m.group(2), f"{slug} modules/time tag")
        else:
            block = replace_once(block, r'(<span class="rd-tag">)[^<]*(<\/span>)',
                                  lambda m: m.group(1) + card["meta_manual"] + m.group(2), f"{slug} manual meta tag")
        if 'rd-tag-int">' in block:
            block = replace_once(block, r'(rd-tag-int">)[^<]*(<\/span>)',
                                  lambda m: m.group(1) + misc["interactive_tag"] + m.group(2), f"{slug} interactive tag")

        block = replace_once(block, r'(rd-card-title">)[\s\S]*?(<\/h2>)',
                              lambda m: m.group(1) + card["title"] + m.group(2), f"{slug} title")
        block = replace_once(block, r'(rd-card-desc-text">)[\s\S]*?(<\/p>)',
                              lambda m: m.group(1) + card["desc"] + m.group(2), f"{slug} desc")
        if "extra_cta" in card:
            block = replace_once(block, r'(rd-card-cta">)[^<]*(<\/span>)',
                                  lambda m: m.group(1) + card["extra_cta"] + m.group(2), f"{slug} extra cta")

        # "Open article →" CTA — bug found 2026-08-18: this link's href AND
        # text were never patched at all (the generic seo_link_sub catch-all
        # below doesn't match it either, since its regex requires ">"
        # immediately after the href attribute, but this tag has an
        # intervening class="rd-card-go bf"). Result: every expanded reading
        # card's CTA silently sent the reader to the English article even
        # when a ready translation existed, and the button text itself
        # never translated. Localize the href only when the target slug
        # actually has a ready translation (ready_article_title returns
        # None otherwise) — untranslated targets correctly keep the
        # English fallback path.
        target_href = f"/{lang}/articles/{slug}" if ready_article_title(lang, slug) is not None else f"/articles/{slug}"
        block = replace_once(block,
            r'<a href="/articles/' + re.escape(slug) + r'" class="rd-card-go bf">[^<]*</a>',
            lambda m, th=target_href: f'<a href="{th}" class="rd-card-go bf">{misc["open_article_cta"]}</a>',
            f"{slug} open-article cta")

        parts[i] = block
    h = "".join(parts)

    # Closing CTA panel (ARA blurb + 3 buttons + Ko-fi note) between the last
    # card and the footer.
    cc = x["closing_cta"]
    h = replace_once(h,
        r'(font-weight:300;color:var\(--th-ink-3\);line-height:1\.95;margin-bottom:1\.8rem">)'
        r'These guides grow out of Aquatic Rhythm Alignment \(ARA\) — a way to read tanks by phase, '
        r'rhythm, and ecological capacity instead of product checklists\.(<\/p>)',
        lambda m: m.group(1) + cc["intro_italic"] + m.group(2), "closing_cta intro")
    h = replace_once(h, r'(href="/articles/ara-full-framework"[^>]*>)Explore the framework →(<\/a>)',
                      lambda m: m.group(1) + cc["btn_framework"] + m.group(2), "closing_cta btn_framework")
    h = replace_once(h, r'(href="/companion"[^>]*>)Meet Rhyssa →(<\/a>)',
                      lambda m: m.group(1) + cc["btn_companion"] + m.group(2), "closing_cta btn_companion")
    h = replace_once(h, r'(href="/tools"[^>]*>)Labs &amp; tools →(<\/a>)',
                      lambda m: m.group(1) + cc["btn_tools"] + m.group(2), "closing_cta btn_tools")
    h = replace_once(h,
        r'(<p class="rd-kofi-note sr">)If these guides help your rhythm, optional tips help fund new reading and tools — everything here stays free\. '
        r'(<a href="https://ko-fi\.com/aquaticrhythm"[^>]*>)Support on Ko-fi(<\/a><\/p>)',
        lambda m: m.group(1) + cc["kofi_note"] + " " + m.group(2) + cc["kofi_link"] + m.group(3),
        "closing_cta kofi note")

    # "Reading" self-link + hidden crawler-discovery link block (identical
    # pattern/purpose to pg-home's .seo-links — see build_home() above).
    home = u["home"]
    h = h.replace('<a href="/reading">Reading — Aquarium Guides</a>',
                  f'<a href="/{lang}/reading">{home["tile1_tag"]} — {home["tile1_h3"]}</a>')

    def seo_link_sub(m):
        slug = m.group(1)
        text = m.group(2)
        title = ready_article_title(lang, slug)
        if title is None:
            return m.group(0)
        return f'<a href="/{lang}/articles/{slug}">{title}</a>'

    h = re.sub(r'<a href="/articles/([a-z0-9-]+)">([^<]*)</a>', seo_link_sub, h)

    return h


def build_tools(h, lang, u):
    """pg-tools is a small static landing page linking OUT to 3 interactive
    tool pages (tank-simulator, tank-builder, community-stress-lab) — none of
    which are in the "ready" translated-article set, so their hrefs/JS stay
    English (matching the same policy already applied to pg-home/pg-reading's
    links to these same 3 pages). The tool pages' own interactive JS
    (community-stress-lab.js etc.) is NOT touched by this function at all —
    it lives on those separate pages, not embedded here."""
    x = u["tools"]

    h = replace_once(h, r'(<span class="ey">)Labs &amp; Tools(<\/span>)',
                      lambda m: m.group(1) + x["ey"] + m.group(2), "tools ey")
    h = replace_once(h, r'(<h1 class="dlg"[^>]*>)Try it\.<br>[\s\S]*?(<\/h1>)',
                      lambda m: m.group(1) + x["h1"] + m.group(2), "tools h1")
    h = replace_once(h, r'(<p class="bt sr d1"[^>]*>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["sub"] + m.group(2), "tools sub")

    # Cards — scope each replacement to its OWN card block (bounded by its
    # unique href, up to the next tool-card's <a> or end of the grid). An
    # earlier version used unscoped title/desc/cta regexes here: since the
    # pattern doesn't care about the text content between the tags, an
    # already-translated slot keeps matching just as well as an untouched
    # one, so a plain count=1 replace_once always re-hits card 1's slot on
    # every loop iteration instead of advancing to the next card. Verified
    # this actually happened (card 1 ended up overwritten 3x with the last
    # card's title; cards 2 and 3 stayed raw English) before this fix.
    cards_meta = [(1, "tank-simulator"), (2, "tank-builder"), (3, "community-stress-lab"), (4, "rhythm-tracker")]
    for i, (n, slug) in enumerate(cards_meta):
        # Recompute positions against the CURRENT (possibly already-edited)
        # h each iteration — hrefs never change, but everything after an
        # edited card shifts, so stale precomputed offsets would corrupt
        # every card after the first.
        start = h.find(f'href="/articles/{slug}"')
        if i + 1 < len(cards_meta):
            end = h.find(f'href="/articles/{cards_meta[i + 1][1]}"')
        else:
            end = h.find('</div>\n\n      </div>', start)
        block = h[start:end]

        block = replace_once(block, r'(tool-card-tag">)[^<]*(<\/span>)',
                              lambda m, n=n: m.group(1) + x[f"card{n}_tag"] + m.group(2), f"tools card{n} tag")
        block = replace_once(block, r'(tool-card-title">)[^<]*(<\/h2>)',
                              lambda m, n=n: m.group(1) + x[f"card{n}_title"] + m.group(2), f"tools card{n} title")
        block = replace_once(block, r'(tool-card-desc">)[^<]*(<\/p>)',
                              lambda m, n=n: m.group(1) + x[f"card{n}_desc"] + m.group(2), f"tools card{n} desc")
        block = replace_once(block, r'(tool-card-cta">)[^<]*(<\/span>)',
                              lambda m, n=n: m.group(1) + x[f"card{n}_cta"] + m.group(2), f"tools card{n} cta")

        h = h[:start] + block + h[end:]

    h = replace_once(h,
        r'(font-size:var\(--fs-md\);color:var\(--th-ink-4\);line-height:1\.9">)'
        r'All tools grow from ARA — Aquatic Rhythm Alignment\. They simulate and plan, but they do not replace observation\.(<\/p>)',
        lambda m: m.group(1) + x["closing_note"] + m.group(2), "tools closing note")
    h = replace_once(h, r'(href="/articles/ara-full-framework"[^>]*>)Read the ARA framework →(<\/a>)',
                      lambda m: m.group(1) + x["closing_link"] + m.group(2), "tools closing link")
    h = replace_once(h, r'(<p>)Labs take steady time to build\.[\s\S]*?maintained\.(<\/p>)',
                      lambda m: m.group(1) + x["kofi_hint"] + m.group(2), "tools kofi hint")

    return h


def scoped_edit(h, start_marker, end_marker, edits, label):
    """Find start_marker...end_marker fresh in the CURRENT h (never cached
    positions — an earlier edit's length change would silently corrupt any
    precomputed offset), extract that slice, apply a list of (pattern, value,
    sublabel) replace_once edits scoped to ONLY that slice, splice back."""
    ia, ib = slice_between(h, start_marker, end_marker, label)
    if ia is None:
        return h
    block = h[ia:ib]
    for edit in edits:
        pattern, value, sublabel = edit[0], edit[1], edit[2]
        count_all = len(edit) > 3 and edit[3] == "all"
        if count_all:
            block = re.sub(pattern, lambda m, v=value: m.group(1) + v + m.group(2), block)
        else:
            block = t1(block, pattern, value, f"{label}/{sublabel}")
    return h[:ia] + block + h[ib:]


def build_journal_landing(h, lang, u):
    """pg-journal itself — a small landing page (header + an empty container
    that ui-journal.js fills with tank cards at runtime, untouched here)."""
    x = u["journal"]["landing"]
    h = replace_once(h, r'(<span class="ey">)Keeper\'s Log(<\/span>)',
                      lambda m: m.group(1) + x["ey"] + m.group(2), "journal landing ey")
    h = replace_once(h, r'(<h1 class="dlg"[^>]*>)Your<br>[\s\S]*?(<\/h1>)',
                      lambda m: m.group(1) + x["h1"] + m.group(2), "journal landing h1")
    h = replace_once(h, r'(<p class="bt sr d1"[^>]*>)[\s\S]*?(<\/p>)',
                      lambda m: m.group(1) + x["sub"] + m.group(2), "journal landing sub")
    return h


def build_tank_log_dashboard(h, lang, u):
    """The pg-tank-log dashboard — static card chrome (headers, buttons,
    empty states, filter bar). Everything rendered by ui-journal.js at
    runtime (actual entries, tank name/stats, computed summaries) is left
    untouched — out of scope for this pass, see commit message."""
    x = u["journal"]["dashboard"]

    h = replace_once(h, r'(aria-label=")Back to Keeper\'s Log(")',
                      lambda m: m.group(1) + x["back_aria"] + m.group(2), "dashboard back aria")
    h = replace_once(h, r'(data-page="journal">[\s\S]*?<span>)Keeper\'s Log(<\/span>)',
                      lambda m: m.group(1) + x["back_label"] + m.group(2), "dashboard back label")
    h = replace_once(h, r'(id="jn-tank-edit" aria-label=")Edit tank(" title=")Edit tank(")',
                      lambda m: m.group(1) + x["edit_tank"] + m.group(2) + x["edit_tank"] + m.group(3),
                      "dashboard edit tank")

    h = scoped_edit(h, 'id="jn-setup-card"', 'id="jn-inhabitants"', [
        (r'(tl-card-eyebrow">)My Setup(<\/span>)', x["setup_eyebrow"], "eyebrow"),
        (r'(<span>)No setup recorded yet\.(<\/span>)', x["setup_empty_text"], "empty text"),
        (r'(jn-setup-start-btn">)Record →(<\/button>)', x["setup_start_btn"], "start btn"),
    ], "dashboard setup card")
    # 3-group edit (aria-label + button text together) needs its own call since
    # scoped_edit's helper only supports 2-group (prefix, suffix) substitutions.
    ia, ib = slice_between(h, 'id="jn-setup-card"', 'id="jn-inhabitants"', "dashboard setup edit btn")
    if ia is not None:
        block = h[ia:ib]
        block = replace_once(block, r'(jn-setup-edit-btn" aria-label=")Edit setup(">)Edit(<\/button>)',
                              lambda m: m.group(1) + x["setup_edit_aria"] + m.group(2) + x["setup_edit_btn"] + m.group(3),
                              "dashboard setup edit btn")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-inhabitants"', 'id="jn-phase-card"', "dashboard family card")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(tl-card-eyebrow">)Tank Family(<\/span>)', x["family_eyebrow"], "family eyebrow")
        block = replace_once(block, r'(jn-family-edit-btn" aria-label=")Manage residents(">)Edit(<\/button>)',
                              lambda m: m.group(1) + x["family_edit_aria"] + m.group(2) + x["family_edit_btn"] + m.group(3),
                              "family edit btn")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-phase-card"', 'id="jn-weekly-insight-card"', "dashboard phase card")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(tl-card-eyebrow">)Cycle Stage(<\/div>)', x["phase_eyebrow"], "phase eyebrow")
        for step_key, en_text in [("phase_step_1", "Establishing"), ("phase_step_2", "Stabilising"),
                                   ("phase_step_3", "Optimising"), ("phase_step_4", "Sustaining")]:
            block = t1(block, rf'(jn-phase-journey-step">){en_text}(<\/span>)', x[step_key], step_key)
        block = t1(block, r'(id="jn-phase-note">)Write your first entry to get a cycle stage reading\.(<\/p>)',
                   x["phase_note_default"], "phase note default")
        block = t1(block, r'(>)Ask Rhyssa about this phase(<\/button>)', x["phase_rh_btn"], "phase rh btn")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-weekly-insight-card"', 'id="jn-param-charts"', "dashboard weekly insight")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(tl-card-eyebrow">)Rhyssa\'s Read(<\/span>)', x["weekly_insight_eyebrow"], "insight eyebrow")
        block = t1(block, r'(>)Discuss with Rhyssa →(<\/button>)', x["weekly_insight_btn"], "insight btn")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-param-charts"', 'id="jn-entry-cta-card"', "dashboard param charts")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(tl-card-eyebrow">)Parameter Trends(<\/span>)', x["param_charts_eyebrow"], "param eyebrow")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-entry-cta-card"', 'id="jn-no-entries"', "dashboard entry cta")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(id="jn-entry-cta-prompt">)What did you notice today\?(<\/p>)',
                   x["entry_cta_prompt_default"], "entry cta prompt")
        block = t1(block, r'(id="jn-entry-open-main">)Write today\'s entry(<\/button>)',
                   x["entry_cta_btn"], "entry cta btn")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-no-entries"', 'id="jn-has-entries"', "dashboard no entries")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(tl-empty-text">)No entries yet\.(<\/p>)', x["no_entries_text"], "no entries text")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-has-entries"', 'id="jn-entry-list"', "dashboard has entries header")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(tl-card-eyebrow"[^>]*>)Entries(<\/span>)', x["entries_eyebrow"], "entries eyebrow")
        block = t1(block, r'(id="jn-entry-open">)\+ New entry(<\/button>)', x["new_entry_btn"], "new entry btn")
        block = t1(block, r'(id="jn-entry-search" placeholder=")Search entries…(" autocomplete)',
                   x["search_placeholder"], "search placeholder")
        block = t1(block, r'(aria-label=")Search entries(")', x["search_aria"], "search aria")
        block = t1(block, r'(id="jn-filter-toggle" aria-label=")Filter entries(")',
                   x["filter_toggle_aria"], "filter toggle aria")
        block = t1(block, r'(jn-filter-label">)Period(<\/span>)', x["filter_period_label"], "filter period label")
        block = t1(block, r'(data-filter-days="0">)All time(<\/button>)', x["filter_period_all"], "filter period all")
        block = t1(block, r'(data-filter-days="7">)7 days(<\/button>)', x["filter_period_7"], "filter period 7")
        block = t1(block, r'(data-filter-days="30">)30 days(<\/button>)', x["filter_period_30"], "filter period 30")
        block = t1(block, r'(data-filter-days="90">)90 days(<\/button>)', x["filter_period_90"], "filter period 90")
        block = t1(block, r'(jn-filter-label">)Rhythm(<\/span>)', x["filter_rhythm_label"], "filter rhythm label")
        block = t1(block, r'(data-filter-state="consistent">)Consistent(<\/button>)', x["state_consistent"], "state consistent")
        block = t1(block, r'(data-filter-state="catching-up">)Catching up(<\/button>)', x["state_catching_up"], "state catching-up")
        block = t1(block, r'(data-filter-state="occasional">)Occasional(<\/button>)', x["state_occasional"], "state occasional")
        block = t1(block, r'(data-filter-state="just-starting">)Just starting(<\/button>)', x["state_just_starting"], "state just-starting")
        block = t1(block, r'(jn-filter-label">)Care done(<\/span>)', x["filter_care_label"], "filter care label")
        block = t1(block, r'(id="jn-filter-clear"[^>]*>)Clear all filters(<\/button>)', x["filter_clear_btn"], "filter clear btn")
        block = t1(block, r'(id="jn-filter-no-results"[^>]*>)No entries match these filters — try loosening them a little\.(<\/p>)',
                   x["filter_no_results"], "filter no results")
        h = h[:ia] + block + h[ib:]

    ia, ib = slice_between(h, 'id="jn-load-more"', 'class="tl-secondary-actions"', "dashboard load more + secondary")
    if ia is not None:
        # slice_between's ia points at the id attribute itself; walk back to
        # the start of that <button so the button's own text stays in-slice.
        btn_start = h.rfind("<button", 0, ia)
        block = h[btn_start:ib]
        block = t1(block, r'(id="jn-load-more"[^>]*>)Show older entries(<\/button>)', x["load_more_btn"], "load more btn")
        h = h[:btn_start] + block + h[ib:]

    ia, ib = slice_between(h, 'class="tl-secondary-actions"', "</main>", "dashboard secondary actions")
    if ia is not None:
        block = h[ia:ib]
        block = t1(block, r'(id="jn-export">)Export JSON(<\/button>)', x["export_json_btn"], "export json")
        block = t1(block, r'(id="jn-export-csv">)Export CSV(<\/button>)', x["export_csv_btn"], "export csv")
        block = t1(block, r'(id="jn-reset-tank">)Delete this tank(<\/button>)', x["delete_tank_btn"], "delete tank (secondary)")
        h = h[:ia] + block + h[ib:]

    return h


def build_kofi_sheet(h, lang, u):
    x = u["journal"]["kofi_sheet"]
    return scoped_edit(h, 'id="kofi-sheet"', '<!-- ── MODAL: Tank Setup', [
        (r'(id="kofi-sheet-title" class="kofi-sheet-title">)Support(<\/span>)', x["title"], "title"),
        (r'(kofi-sheet-sub">)Optional tips — handled on Ko-fi(<\/span>)', x["sub"], "sub"),
        (r'(kofi-sheet-linkout">)Open separately ↗(<\/a>)', x["linkout"], "linkout"),
        (r'(id="kofi-sheet-close" aria-label=")Close support panel(")', x["close_aria"], "close aria"),
    ], "kofi sheet")


def build_modal_setup(h, lang, u):
    x = u["journal"]["modal_setup"]
    dashboard_delete_tank_btn = u["journal"]["dashboard"]["delete_tank_btn"]
    return scoped_edit(h, 'id="mt-modal-setup"', '<!-- ── MODAL: Keeper', [
        (r'(mt-modal-title">)Set up your tank(<\/h2>)', x["title"], "title"),
        (r'(data-modal-close="mt-modal-setup" aria-label=")Close(")', x["close_aria"], "close aria"),
        (r'(id="mt-preview-cat">)Choose a size or brand below(<\/span>)', x["preview_cat_default"], "preview cat default"),
        (r'(data-stab="preset"[^>]*>)Popular(<\/button>)', x["tab_preset"], "tab preset"),
        (r'(data-stab="brand"[^>]*>)Branded(<\/button>)', x["tab_brand"], "tab brand"),
        (r'(data-stab="custom"[^>]*>)Custom(<\/button>)', x["tab_custom"], "tab custom"),
        (r'(margin:0">)Measurement unit(<\/span>)', x["unit_label"], "unit label"),
        (r'(data-dimunit="cm">)cm(<\/button>)', x["unit_cm"], "unit cm"),
        (r'(data-dimunit="in">)inches(<\/button>)', x["unit_in"], "unit in"),
        (r'(for="mt-dim-l">)Length(<\/label>)', x["length_label"], "length label"),
        (r'(for="mt-dim-w">)Width(<\/label>)', x["width_label"], "width label"),
        (r'(for="mt-dim-h">)Height(<\/label>)', x["height_label"], "height label"),
        (r'(margin:0">)Calculated volume(<\/span>)', x["calc_vol_label"], "calc vol label"),
        (r'(for="mt-inp-name">)Tank name(<\/label>)', x["name_label"], "name label"),
        (r'(id="mt-inp-name"[^>]*placeholder=")e\.g\. My Living Room Tank(")', x["name_placeholder"], "name placeholder"),
        (r'(for="mt-inp-type">)Tank type(<\/label>)', x["type_label"], "type label"),
        (r'(value="freshwater">)Freshwater(<\/option>)', x["type_freshwater"], "type freshwater"),
        (r'(value="planted">)Planted(<\/option>)', x["type_planted"], "type planted"),
        (r'(value="marine">)Marine / Reef(<\/option>)', x["type_marine"], "type marine"),
        (r'(value="brackish">)Brackish(<\/option>)', x["type_brackish"], "type brackish"),
        (r'(value="coldwater">)Coldwater(<\/option>)', x["type_coldwater"], "type coldwater"),
        (r'(value="paludarium">)Paludarium(<\/option>)', x["type_paludarium"], "type paludarium"),
        (r'(for="mt-inp-date">)Set up date (<span)', x["date_label"] + " ", "date label"),
        (rf'({re.escape(x["date_label"])} <span[^>]*>)\(optional\)(<\/span>)', x["optional"], "date optional"),
        (r'(mt-save-btn">)Save tank(<\/button>)', x["save_btn"], "save btn"),
        (r'(id="mt-setup-delete"[^>]*>)Delete this tank(<\/button>)', dashboard_delete_tank_btn, "delete tank (setup modal)"),
    ], "modal setup")


def build_modal_entry(h, lang, u):
    x = u["journal"]["modal_entry"]
    dx = u["journal"]["dashboard"]
    return scoped_edit(h, 'id="mt-modal-entry"', '<!-- ── MILESTONE', [
        (r'(mt-modal-title">)Today\'s entry(<\/h2>)', x["title"], "title"),
        (r'(data-modal-close="mt-modal-entry" aria-label=")Close(")', x["close_aria"], "close aria"),
        (r'(jn-form-question">)Your rhythm lately(<\/p>)', x["rhythm_question"], "rhythm question"),
        # Same 4 rhythm-state labels as the dashboard filter chips (dx below) —
        # reused rather than duplicated in the units schema, since the English
        # source itself repeats the identical 4 words in both places.
        (r'(data-state="consistent">)Consistent(<\/button>)', dx["state_consistent"], "state consistent (entry form)"),
        (r'(data-state="catching-up">)Catching up(<\/button>)', dx["state_catching_up"], "state catching-up (entry form)"),
        (r'(data-state="occasional">)Occasional(<\/button>)', dx["state_occasional"], "state occasional (entry form)"),
        (r'(data-state="just-starting">)Just starting(<\/button>)', dx["state_just_starting"], "state just-starting (entry form)"),
        (r'(for="jn-entry-obs">)What did you notice\?(<\/label>)', x["obs_question"], "obs question"),
        (r'(id="jn-entry-obs"[^>]*placeholder=")Fish are active today\. Plants growing well\. Water looks slightly green…(")',
         x["obs_placeholder"], "obs placeholder"),
        (r'(jn-form-question">)What did you do\? (<span)', x["care_question"] + " ", "care question"),
        (rf'({re.escape(x["care_question"])} <span[^>]*>)\(optional\)(<\/span>)', x["optional"], "care question optional"),
        (r'(data-care="water_change">)Water change(<\/button>)', x["care_water_change"], "care water_change"),
        (r'(data-care="filter">)Filter(<\/button>)', x["care_filter"], "care filter"),
        (r'(data-care="feeding">)Feeding(<\/button>)', x["care_feeding"], "care feeding"),
        (r'(data-care="top_up">)Topping up(<\/button>)', x["care_top_up"], "care top_up"),
        (r'(data-care="treatment">)Treatment(<\/button>)', x["care_treatment"], "care treatment"),
        (r'(data-care="dosing">)Dosing(<\/button>)', x["care_dosing"], "care dosing"),
        (r'(data-care="media">)Media change(<\/button>)', x["care_media"], "care media"),
        (r'(data-care="trimming">)Trimming(<\/button>)', x["care_trimming"], "care trimming"),
        (r'(data-care="nothing">)Just observed(<\/button>)', x["care_nothing"], "care nothing"),
        (r'(id="jn-care-more">)\+ 6 more(<\/button>)', x["care_more_btn"], "care more btn"),
        (r'(for="jn-treatment-note">)Product / dose (<span)', x["treatment_label"] + " ", "treatment label"),
        (rf'({re.escape(x["treatment_label"])} <span[^>]*>)\(optional\)(<\/span>)', x["optional"], "treatment label optional"),
        (r'(id="jn-treatment-note"[^>]*placeholder=")e\.g\. Easy Carbo 5ml, Seachem Prime 2ml(")',
         x["treatment_placeholder"], "treatment placeholder"),
        (r'(jn-params-note">)Water parameters (<span)', x["params_note"] + " ", "params note"),
        (rf'({re.escape(x["params_note"])} <span[^>]*>)\(optional\)(<\/span>)', x["optional"], "params note optional"),
        (r'(for="jn-param-ph">)pH(<\/label>)', x["param_ph"], "param ph"),
        (r'(for="jn-param-nh3">)NH₃ \(mg/L\)(<\/label>)', x["param_nh3"], "param nh3"),
        (r'(for="jn-param-no2">)NO₂ \(mg/L\)(<\/label>)', x["param_no2"], "param no2"),
        (r'(for="jn-param-no3">)NO₃ \(mg/L\)(<\/label>)', x["param_no3"], "param no3"),
        (r'(for="jn-param-temp">)Temp \(°C\)(<\/label>)', x["param_temp"], "param temp"),
        (r'(for="jn-param-gh">)GH \(°dH\)(<\/label>)', x["param_gh"], "param gh"),
        (r'(for="jn-param-kh">)KH \(°dH\)(<\/label>)', x["param_kh"], "param kh"),
        (r'(for="jn-param-sg">)Salinity / SG(<\/label>)', x["param_sg"], "param sg"),
        (r'(style="flex:1">)Save entry(<\/button>)', x["save_entry_btn"], "save entry btn"),
        (r'(id="jn-entry-delete-btn"[^>]*>)Delete(<\/button>)', x["delete_btn"], "delete btn"),
    ], "modal entry")


def build_toast_and_inhabitant(h, lang, u):
    tx = u["journal"]["toast"]
    x = u["journal"]["modal_inhabitant"]
    h = replace_once(h, r'(id="jn-toast-dismiss" aria-label=")Dismiss(")',
                      lambda m: m.group(1) + tx["dismiss_aria"] + m.group(2), "toast dismiss aria")
    return scoped_edit(h, 'id="mt-modal-inhabitant"', '<!-- ── GEAR MODAL', [
        (r'(mt-modal-title">)Tank Family(<\/h2>)', x["title"], "title (list view)"),
        (r'(data-modal-close="mt-modal-inhabitant" aria-label=")Close(")', x["close_aria"], "close aria (both views)", "all"),
        (r'(id="jn-inh-list-add"[^>]*>)\+ Add resident(<\/button>)', x["add_resident_btn"], "add resident btn"),
        (r'(id="jn-inh-back-btn"[^>]*>)← List(<\/button>)', x["back_list_btn"], "back list btn"),
        (r'(id="jn-inh-form-title">)Add resident(<\/h2>)', x["form_title_add"], "form title add"),
        (r'(jn-form-question">)Category(<\/p>)', x["category_question"], "category question"),
        (r'(data-cat="fish">)Fish(<\/button>)', x["cat_fish"], "cat fish"),
        (r'(data-cat="plant">)Plant(<\/button>)', x["cat_plant"], "cat plant"),
        (r'(data-cat="invertebrate">)Invertebrate(<\/button>)', x["cat_invertebrate"], "cat invertebrate"),
        (r'(data-cat="coral">)Coral(<\/button>)', x["cat_coral"], "cat coral"),
        (r'(data-cat="other">)Other(<\/button>)', x["cat_other"], "cat other"),
        (r'(for="jn-inh-common">)Common name (<span)', x["common_name_label"] + " ", "common name label"),
        (rf'({re.escape(x["common_name_label"])} <span[^>]*>)\(required\)(<\/span>)', x["required"], "common name required"),
        (r'(id="jn-inh-common"[^>]*placeholder=")e\.g\. Neon Tetra(")', x["common_name_placeholder"], "common name placeholder"),
        (r'(for="jn-inh-count">)Quantity(<\/label>)', x["quantity_label"], "quantity label"),
        (r'(for="jn-inh-name">)Personal name (<span)', x["personal_name_label"] + " ", "personal name label"),
        (rf'({re.escape(x["personal_name_label"])} <span[^>]*>)\(optional\)(<\/span>)', x["optional"], "personal name optional"),
        (r'(id="jn-inh-name"[^>]*placeholder=")e\.g\. Nemo, Goldie…(")', x["personal_name_placeholder"], "personal name placeholder"),
        (r'(for="jn-inh-species">)Scientific name (<span)', x["species_label"] + " ", "species label"),
        (rf'({re.escape(x["species_label"])} <span[^>]*>)\(auto-fills on suggestion\)(<\/span>)', x["species_hint"], "species hint"),
        (r'(id="jn-inh-species"[^>]*placeholder=")e\.g\. Paracheirodon innesi(")', x["species_placeholder"], "species placeholder"),
        (r'(for="jn-inh-date">)Date added(<\/label>)', x["date_added_label"], "date added label"),
        (r'(margin-bottom:\.55rem">)Status(<\/div>)', x["status_label"], "status label"),
        (r'(data-status="active">)Active(<\/button>)', x["status_active"], "status active"),
        (r'(data-status="rehomed">)Rehomed(<\/button>)', x["status_rehomed"], "status rehomed"),
        (r'(data-status="passed">)Passed(<\/button>)', x["status_passed"], "status passed"),
        (r'(margin-top:1\.2rem">)Add to tank(<\/button>)', x["add_to_tank_btn"], "add to tank btn"),
        (r'(id="jn-inh-delete-btn"[^>]*>)Remove resident(<\/button>)', x["remove_resident_btn"], "remove resident btn"),
    ], "modal inhabitant")


def build_modal_gear(h, lang, u):
    x = u["journal"]["modal_gear"]
    return scoped_edit(h, 'id="mt-modal-gear"', '<!-- ── MODAL BACKDROP', [
        (r'(mt-modal-title">)My Tank Setup(<\/h2>)', x["title"], "title"),
        (r'(data-modal-close="mt-modal-gear" aria-label=")Close(")', x["close_aria"], "close aria"),
        (r'(jn-form-section-label">)Equipment(<\/div>)', x["equipment_label"], "equipment label"),
        (r'(jn-setup-modal-hint">)Select what you actually have in this tank\.(<\/p>)', x["equipment_hint"], "equipment hint"),
        (r'(margin-top:1\.2rem">)Save Setup(<\/button>)', x["save_setup_btn"], "save setup btn"),
    ], "modal gear")


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


def build_rh_sheet(h, lang):
    """The Rhyssa chat sliding sheet (#rh-sheet) — a single shared element
    injected once in the page, not a pg-* section, so it can't go through
    apply_scoped(). Distinct from pg-companion's own full-page chat shell
    (translated separately by build_companion())."""
    r = RH_SHEET[lang]

    h = replace_once(h, r'(<div id="rh-sheet" class="rh-sheet" role="dialog" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + r["dialog_aria"] + m.group(2), "rh-sheet dialog aria")
    h = replace_once(h, r'(<button class="rh-sheet-back" id="rh-sheet-cls" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + r["close_aria"] + m.group(2), "rh-sheet close aria")
    h = replace_once(h, r'(<span class="rh-sheet-sub">)[^<]*(<\/span>)',
                      lambda m: m.group(1) + r["sub"] + m.group(2), "rh-sheet sub")
    h = replace_once(h, r'(class="rh-sheet-kofi" data-kofi-open rel="noopener noreferrer" aria-label=")[^"]*(" title=")[^"]*(")',
                      lambda m: m.group(1) + r["kofi_aria"] + m.group(2) + r["kofi_aria"] + m.group(3), "rh-sheet kofi")
    h = replace_once(h, r'(<div class="rh-tabs" id="rh-tabs" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + r["tabs_aria"] + m.group(2), "rh-sheet tabs aria")
    h = replace_once(h, r'(<button class="rh-tabs-new" id="rh-tabs-new" type="button" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + r["new_conv_aria"] + m.group(2), "rh-sheet new conv aria")
    h = replace_once(h, r'(<div class="rh-sheet-thread" id="rh-sheet-thread" role="log" aria-live="polite" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + r["thread_aria"] + m.group(2), "rh-sheet thread aria")
    h = replace_once(h, r'(<p class="rh-sheet-welcome-txt">)[^<]*(<\/p>)',
                      lambda m: m.group(1) + r["welcome"] + m.group(2), "rh-sheet welcome")

    # All 5 chips share identical markup shape (only data-msg/label content
    # differs), so a plain replace_once looped 5x would keep re-matching
    # chip 1 (structure-only regex, doesn't care what's already inside) —
    # same trap this file's own apply-per-card helpers document elsewhere.
    # A single re.sub pass with an incrementing counter advances through
    # all 5 in document order instead.
    chip_re = re.compile(r'<button type="button" class="rh-suggest-chip" data-msg="[^"]*">[^<]*</button>')
    chip_n = [0]
    def sub_chip(m):
        chip_n[0] += 1
        n = chip_n[0]
        if n > 5:
            return m.group(0)
        return (f'<button type="button" class="rh-suggest-chip" data-msg="{r[f"chip{n}_msg"]}">'
                f'{r[f"chip{n}_label"]}</button>')
    new_h, n_chips = chip_re.subn(sub_chip, h)
    if n_chips != 5:
        print(f"  WARNING: expected 5 rh-suggest-chip matches, found {n_chips}", file=sys.stderr)
    h = new_h

    h = replace_once(h,
        r'(<p class="rh-sheet-also">)Same Rhyssa — also on\s*(<a href="https://chatgpt\.com[^"]*"[^>]*>)ChatGPT ↗(</a>) if you prefer\.(</p>)',
        lambda m: m.group(1) + r["also_pre"] + m.group(2) + "ChatGPT ↗" + m.group(3) + r["also_post"] + m.group(4),
        "rh-sheet also")

    h = replace_once(h, r'(<textarea id="rh-sheet-inp" class="rh-sheet-inp" placeholder=")[^"]*("[^>]*aria-label=")[^"]*(")',
                      lambda m: m.group(1) + r["input_placeholder"] + m.group(2) + r["input_aria"] + m.group(3),
                      "rh-sheet input")
    h = replace_once(h, r'(<button type="submit" class="rh-sheet-send" id="rh-sheet-send" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + r["send_aria"] + m.group(2), "rh-sheet send aria")
    h = replace_once(h, r'(<p class="rh-sheet-note">)[^<]*(<\/p>)',
                      lambda m: m.group(1) + r["note"] + m.group(2), "rh-sheet note")

    return h


def build_settings_panel(h, lang, u):
    """The Settings panel body (Theme/Language/Ecosystem/Units/Keeper's Log/
    Privacy/Data/App) — a single shared panel injected once in the page, not
    a pg-* section, so it can't go through apply_scoped(). Was left entirely
    English on id/ja even though the gear button that opens it (settings_aria,
    handled in build_pwa_settings above) was already translated."""
    s = SETTINGS[lang]
    nav = NAV[lang]
    x = u["nav_extra"]

    h = replace_once(h, r'(<aside class="ar-settings-panel" id="ar-settings-panel" role="dialog" aria-modal="true" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + s["title"] + m.group(2), "stg panel aria")
    h = replace_once(h, r'(<span class="ar-stg-title">)[^<]*(<\/span>)',
                      lambda m: m.group(1) + s["title"] + m.group(2), "stg title")
    h = replace_once(h, r'(<button class="ar-stg-close" id="ar-settings-close" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + s["close_aria"] + m.group(2), "stg close aria")

    h = replace_once(h, r'(<span class="ar-stg-label">)Theme(<\/span>)\s*(<div class="ar-stg-theme-seg" role="group" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + s["theme_label"] + m.group(2) + "\n      " + m.group(3) + s["theme_label"] + m.group(4),
                      "stg theme label+group-aria")
    h = replace_once(h, r'(data-theme-choice="system">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + s["theme_system"] + m.group(2), "stg theme system")
    h = replace_once(h, r'(data-theme-choice="light">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + s["theme_light"] + m.group(2), "stg theme light")
    h = replace_once(h, r'(data-theme-choice="dark">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + s["theme_dark"] + m.group(2), "stg theme dark")

    h = replace_once(h, r'(<span class="ar-stg-label">)Language(<\/span>)',
                      lambda m: m.group(1) + s["language_label"] + m.group(2), "stg language label")

    h = replace_once(h, r'(<span class="ar-stg-label">)Ecosystem(<\/span>)',
                      lambda m: m.group(1) + s["ecosystem_label"] + m.group(2), "stg ecosystem label")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Fauna(<\/span>)(\s*<span class="ar-stg-row-sub">)Fish &amp; animals(<\/span>[\s\S]*?aria-label=")Show fauna(")',
        lambda m: m.group(1) + s["fauna_label"] + m.group(2) + m.group(3) + s["fauna_sub"] + m.group(4) + s["fauna_aria"] + m.group(5),
        "stg fauna")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Flora(<\/span>)(\s*<span class="ar-stg-row-sub">)Plants &amp; driftwood(<\/span>[\s\S]*?aria-label=")Show flora(")',
        lambda m: m.group(1) + s["flora_label"] + m.group(2) + m.group(3) + s["flora_sub"] + m.group(4) + s["flora_aria"] + m.group(5),
        "stg flora")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Reduce Motion(<\/span>)(\s*<span class="ar-stg-row-sub">)Pauses background animations(<\/span>[\s\S]*?aria-label=")Reduce motion(")',
        lambda m: m.group(1) + s["motion_label"] + m.group(2) + m.group(3) + s["motion_sub"] + m.group(4) + s["motion_aria"] + m.group(5),
        "stg motion")

    h = replace_once(h, r'(<span class="ar-stg-label">)Units(<\/span>)',
                      lambda m: m.group(1) + s["units_label"] + m.group(2), "stg units label")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Temperature(<\/span>[\s\S]*?aria-label=")Temperature unit(")',
        lambda m: m.group(1) + s["temp_label"] + m.group(2) + s["temp_group_aria"] + m.group(3), "stg temp")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Volume(<\/span>[\s\S]*?aria-label=")Volume unit(")',
        lambda m: m.group(1) + s["vol_label"] + m.group(2) + s["vol_group_aria"] + m.group(3), "stg volume")
    h = replace_once(h, r'(data-unit-temp="C">)[^<]*(<\/button>)', lambda m: m.group(1) + "°C" + m.group(2), "stg C")
    h = replace_once(h, r'(data-unit-temp="F">)[^<]*(<\/button>)', lambda m: m.group(1) + "°F" + m.group(2), "stg F")
    h = replace_once(h, r'(data-unit-vol="L">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + s["vol_litres"] + m.group(2), "stg litres")
    h = replace_once(h, r'(data-unit-vol="gal">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + s["vol_usgal"] + m.group(2), "stg usgal")

    h = replace_once(h, r"(<span class=\"ar-stg-label\">)Keeper's Log(</span>)",
                      lambda m: m.group(1) + s["log_label"] + m.group(2), "stg log label")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Entry Order(<\/span>)(\s*<span class="ar-stg-row-sub">)Newest or oldest first(<\/span>[\s\S]*?aria-label=")Entry sort order(")',
        lambda m: m.group(1) + s["entry_order_label"] + m.group(2) + m.group(3) + s["entry_order_sub"] + m.group(4) + s["entry_sort_aria"] + m.group(5),
        "stg entry order")
    h = replace_once(h, r'(data-sort="desc">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + s["newest"] + m.group(2), "stg newest")
    h = replace_once(h, r'(data-sort="asc">)[^<]*(<\/button>)',
                      lambda m: m.group(1) + s["oldest"] + m.group(2), "stg oldest")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Water Change Alert(<\/span>)(\s*<span class="ar-stg-row-sub">)Warn after this many days(<\/span>[\s\S]*?aria-label=")Days before water change alert(")',
        lambda m: m.group(1) + s["wc_alert_label"] + m.group(2) + m.group(3) + s["wc_alert_sub"] + m.group(4) + s["wc_alert_aria"] + m.group(5),
        "stg wc alert")

    h = replace_once(h, r'(<span class="ar-stg-label">)Privacy(<\/span>)',
                      lambda m: m.group(1) + s["privacy_label"] + m.group(2), "stg privacy label")
    h = replace_once(h,
        r'(<span class="ar-stg-row-label">)Usage Analytics(<\/span>)(\s*<span class="ar-stg-row-sub">)Helps improve the app(<\/span>[\s\S]*?aria-label=")Enable usage analytics(")',
        lambda m: m.group(1) + s["analytics_label"] + m.group(2) + m.group(3) + s["analytics_sub"] + m.group(4) + s["analytics_aria"] + m.group(5),
        "stg analytics")

    h = replace_once(h, r'(<span class="ar-stg-label">)Data(<\/span>)',
                      lambda m: m.group(1) + s["data_label"] + m.group(2), "stg data label")
    h = replace_once(h, r'(id="stg-export">[\s\S]*?<\/svg>\s*)Export Log(\s*<span)',
                      lambda m: m.group(1) + s["export_btn"] + m.group(2), "stg export btn")
    h = replace_once(h, r'(for="stg-import-file"[^>]*>[\s\S]*?<\/svg>\s*)Import Log(\s*<span)',
                      lambda m: m.group(1) + s["import_btn"] + m.group(2), "stg import btn")
    h = replace_once(h, r'(id="stg-import-file" class="ar-stg-import-input" accept="\.json,application/json" aria-label=")[^"]*(")',
                      lambda m: m.group(1) + s["import_aria"] + m.group(2), "stg import aria")
    h = replace_once(h, r'(id="stg-clear-rhyssa">[\s\S]*?<\/svg>\s*)Clear Rhyssa Chat',
                      lambda m: m.group(1) + s["clear_rhyssa_btn"], "stg clear rhyssa btn")
    h = replace_once(h, r'(id="stg-reset-all">[\s\S]*?<\/svg>\s*)Reset All Data',
                      lambda m: m.group(1) + s["reset_all_btn"], "stg reset all btn")

    h = replace_once(h, r'(<span class="ar-stg-label">)App(<\/span>)',
                      lambda m: m.group(1) + s["app_label"] + m.group(2), "stg app label")
    h = replace_once(h, r'(id="stg-install-pwa">[\s\S]*?<\/svg>\s*)Install App(\s*<span[^>]*>)Add to home screen(<\/span>)',
                      lambda m: m.group(1) + s["install_btn"] + m.group(2) + s["install_sub"] + m.group(3),
                      "stg install app")

    h = replace_once(h, r'(<a href="/privacy" data-page="privacy" class="ar-stg-about-link">)[^<]*(<\/a>)',
                      lambda m: m.group(1) + nav["privacy"] + m.group(2), "stg about privacy")
    h = replace_once(h, r'(<a href="/terms" data-page="terms" class="ar-stg-about-link">)[^<]*(<\/a>)',
                      lambda m: m.group(1) + nav["terms"] + m.group(2), "stg about terms")
    h = replace_once(h, r'(<a href="/about" data-page="about" class="ar-stg-about-link">)[^<]*(<\/a>)',
                      lambda m: m.group(1) + nav["about"] + m.group(2), "stg about about")
    h = replace_once(h, r'(<a href="https://ko-fi\.com/aquaticrhythm" class="ar-stg-about-link" data-kofi-open[^>]*>)[^<]*(<\/a>)',
                      lambda m: m.group(1) + x["subfooter_support"] + m.group(2), "stg about support")

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


def slice_between(h, start_marker, end_marker, label, from_idx=0):
    """Generic version of apply_scoped's boundary logic — takes raw marker
    strings (not just `<div id="pg-*">`) so it can scope arbitrarily-nested
    sub-blocks (a single modal, a single card) that repeat the same class
    names as their siblings. Returns (start_idx, end_idx) into h, or
    (None, None) with a warning if either marker isn't found."""
    ia = h.find(start_marker, from_idx)
    if ia == -1:
        print(f"  WARNING: start marker not found for {label}: {start_marker!r}", file=sys.stderr)
        return None, None
    ib = h.find(end_marker, ia + len(start_marker))
    if ib == -1:
        print(f"  WARNING: end marker not found for {label}: {end_marker!r}", file=sys.stderr)
        return None, None
    return ia, ib


def t1(block, pattern, value, label, flags=0):
    """replace_once shorthand for a block already scoped to a single unique
    element — pattern must have exactly one capture-free insertion point via
    a lambda; kept terse since build_journal has ~100 of these."""
    return replace_once(block, pattern, lambda m, v=value: m.group(1) + v + m.group(2), label, flags=flags)


def localize_reading_links(h, lang):
    """Final safety-net sweep: rewrite every remaining href="/reading" to the
    localized "/<lang>/reading". Bug found 2026-08-18 (user video): the bnav
    "Reading" tab, the home hero CTA, and the home-tile "Reading" card all
    still pointed at the English SPA route (/reading -> /?p=reading) even on
    fully translated id/ja homepages — tapping any of them silently dropped
    the reader back into English. Unlike article cross-links, /<lang>/reading
    always exists for every supported language, so this is an unconditional
    rewrite rather than a per-slug "is it translated" check."""
    return h.replace('href="/reading"', f'href="/{lang}/reading"')


def localize_article_links(h, lang):
    """Final safety-net sweep: rewrite every remaining href="/articles/<slug>"
    to "/<lang>/articles/<slug>" wherever that translated file actually
    exists on disk (mirrors build-i18n.mjs's localizeArticleLinks(), PR
    #307). Bug found 2026-08-18 (user video): the homepage's own ARA promo
    CTAs ("Baca kerangka kerja ARA...") still pointed at the English
    ara-full-framework even though it (and community-stress-lab) are fully
    translated — landing the reader on a page with no way back to their
    language. Untranslated targets (tank-simulator, tank-builder) are left
    on the English fallback, same policy as everywhere else."""
    def sub(m):
        slug = m.group(1)
        if (ROOT / lang / "articles" / f"{slug}.html").exists():
            return f'href="/{lang}/articles/{slug}"'
        return m.group(0)
    return re.sub(r'href="/articles/([a-z0-9-]+)"', sub, h)


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
        h = build_rh_sheet(h, lang)
        h = build_settings_panel(h, lang, u)
        h = apply_scoped(h, "pg-home", "pg-companion", build_home, lang, u, "home")
        h = apply_scoped(h, "pg-companion", "pg-terms", build_companion, lang, u, "companion")
        h = apply_scoped(h, "pg-terms", "pg-privacy", build_terms, lang, u, "terms")
        h = apply_scoped(h, "pg-privacy", "pg-about", build_privacy, lang, u, "privacy")
        h = apply_scoped(h, "pg-about", "pg-reading", build_about, lang, u, "about")
        h = apply_scoped(h, "pg-reading", "pg-tools", build_reading, lang, u, "reading")
        h = apply_scoped(h, "pg-tools", "pg-journal", build_tools, lang, u, "tools")
        h = apply_scoped(h, "pg-journal", "pg-tank-log", build_journal_landing, lang, u, "journal landing")
        h = build_tank_log_dashboard(h, lang, u)
        h = build_kofi_sheet(h, lang, u)
        h = build_modal_setup(h, lang, u)
        h = build_modal_entry(h, lang, u)
        h = build_toast_and_inhabitant(h, lang, u)
        h = build_modal_gear(h, lang, u)
        h = build_shared_footer(h, lang, u)
        h = localize_reading_links(h, lang)
        h = localize_article_links(h, lang)
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
