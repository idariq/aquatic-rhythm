(function () {
  'use strict';

  // Tool pages (tank-builder, tank-simulator, community-stress-lab) have no
  // <main>, so the real gate is just "does this page load this script and
  // have a #bnav to anchor before" — every page that includes this file
  // wants the disclosure, tool pages included (added 2026-08-24 so
  // simulator/builder/lab users see the same sourcing disclosure as article
  // readers, not just a bare interactive tool with no methodology note).
  var nav = document.getElementById('bnav');
  if (!nav) return;

  // Tool pages are a fixed-viewport app shell (html,body{overflow:hidden}),
  // NOT a normally-scrolling document like articles — inserting before #bnav
  // (a position:fixed element) would put the section in body-level flow
  // that the user can never actually scroll to, since body itself doesn't
  // scroll. Found via Playwright screenshot verification 2026-08-24: the
  // element existed in the DOM (had a real boundingBox) but was
  // permanently off-screen with no way to reach it. All three tools share
  // a #briefing intro overlay with a genuinely scrollable .brief-inner
  // (overflow-y:auto) shown before the user starts — append there instead,
  // right after the existing .brief-btn CTA, so every tool user encounters
  // it at least once. Regular articles have no .brief-inner and keep the
  // original #bnav-anchored placement.
  var briefInner = document.querySelector('.brief-inner');
  var isToolPage = !!briefInner;

  // Was hardcoded English on every locale (bug found 2026-08-18, user video) —
  // this section renders on every translated article, so it needs the same
  // T()-table pattern as ar-page.js's Settings panel.
  var ctLang = (document.documentElement.lang || 'en').split('-')[0];
  var CT_STRINGS = {
    en: {
      label: 'About this content',
      body: 'This guide reflects established aquarium keeping principles and the ARA framework. ' +
        'Parameters and guidance are based on hobby consensus and field observation — not clinical research. ' +
        'For critical decisions — stocking, treatment, water chemistry — verify with ',
      link_join: ', ',
      body_or: ', or consult a local aquarium specialist. Your tank and your observations always come first.',
      photo_pre: 'If you would like to offer your aquarium photos for editorial consideration in future guides, use ',
      photo_link: 'Share your tank photos',
      meta: 'Content by Aquatic Rhythm · ARA framework · aquaticrhythm.com'
    },
    id: {
      label: 'Tentang konten ini',
      body: 'Panduan ini mencerminkan prinsip perawatan akuarium yang mapan dan kerangka kerja ARA. ' +
        'Parameter dan panduan didasarkan pada konsensus hobi dan pengamatan lapangan — bukan penelitian klinis. ' +
        'Untuk keputusan penting — penebaran ikan, pengobatan, kimia air — verifikasi dengan ',
      link_join: ', ',
      body_or: ', atau konsultasikan dengan spesialis akuarium setempat. Tangki dan pengamatan Anda selalu diutamakan.',
      photo_pre: 'Jika Anda ingin menawarkan foto akuarium Anda untuk dipertimbangkan secara editorial dalam panduan mendatang, gunakan ',
      photo_link: 'Bagikan foto tangki Anda',
      meta: 'Konten oleh Aquatic Rhythm · Kerangka kerja ARA · aquaticrhythm.com'
    },
    ja: {
      label: 'このコンテンツについて',
      body: '本ガイドは、確立されたアクアリウム飼育の原則とARAフレームワークに基づいています。' +
        'パラメータとガイダンスは、ホビーのコンセンサスとフィールド観察に基づくものであり、臨床研究ではありません。' +
        '生体の追加・治療・水質管理など重要な判断については、',
      link_join: 'や',
      body_or: 'で確認するか、地元の専門家にご相談ください。あなたの水槽とあなたの観察が常に最優先です。',
      photo_pre: '今後のガイドで編集用に水槽の写真を提供したい場合は、',
      photo_link: '水槽の写真を共有する',
      meta: 'コンテンツ提供：Aquatic Rhythm · ARAフレームワーク · aquaticrhythm.com'
    }
  };
  function CT(key) {
    return (CT_STRINGS[ctLang] && CT_STRINGS[ctLang][key]) || CT_STRINGS.en[key] || key;
  }

  var style = document.createElement('style');
  style.textContent =
    '.art-trust{margin:2.5rem clamp(1.25rem,5vw,3rem) 1rem;padding:1.4rem 1.5rem;' +
    'border-top:1px solid var(--th-line);font-size:var(--fs-sm);' +
    'color:var(--th-ink-3);line-height:1.72}' +
    '.art-trust-label{display:block;text-transform:uppercase;' +
    'letter-spacing:.08em;font-size:var(--fs-xs);margin-bottom:.55rem;' +
    'color:var(--th-accent)}' +
    '.art-trust-body{margin:0 0 .35rem;font-weight:300}' +
    '.art-trust-photo{margin:.85rem 0 0;font-weight:300;color:var(--th-ink-4)}' +
    '.art-trust a{color:var(--th-accent);text-decoration:none;' +
    'border-bottom:1px solid var(--th-accent-border)}' +
    '.art-trust a:hover{color:var(--th-accent);border-bottom-color:var(--th-accent)}' +
    '.art-trust-meta{margin-top:.9rem;font-size:var(--fs-xs);color:var(--th-ink-4);' +
    'letter-spacing:.03em}' +
    '.art-trust-inline{margin:2rem 0 0;padding:1.2rem 0 0}';
  document.head.appendChild(style);

  var isSharePhotosPage = /\/share-photos\.html$/i.test(location.pathname || '');
  var photoInviteHtml = isSharePhotosPage
    ? ''
    : '<p class="art-trust-photo">' + CT('photo_pre') + '<a href="/share-photos.html">' + CT('photo_link') + '</a>.</p>';

  var section = document.createElement('section');
  section.className = isToolPage ? 'art-trust art-trust-inline' : 'art-trust';
  section.setAttribute('aria-label', CT('label'));
  section.innerHTML =
    '<span class="art-trust-label">' + CT('label') + '</span>' +
    '<p class="art-trust-body">' + CT('body') +
    '<a href="https://fishbase.se" target="_blank" rel="noopener noreferrer">FishBase</a>' + CT('link_join') +
    '<a href="https://www.seriouslyfish.com" target="_blank" rel="noopener noreferrer">SeriouslyFish</a>' +
    CT('body_or') + '</p>' +
    photoInviteHtml +
    '<p class="art-trust-meta">' + CT('meta') + '</p>';

  if (isToolPage) {
    briefInner.appendChild(section);
  } else {
    nav.parentNode.insertBefore(section, nav);
  }
})();
