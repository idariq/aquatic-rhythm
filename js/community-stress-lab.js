/**
 * Community Stress Lab — rules engine + UI (MVP v1).
 * Spec: docs/community-stress-lab-mvp.md
 */
(function () {
  'use strict';

  /* ── i18n: runtime UI strings ──────────────────────────────────────────
     Community Stress Lab is a single shared JS file across en/id/ja
     (no per-language duplicate) — same T()/STRINGS pattern as
     js/ui-journal.js. jnLang picked from <html lang>, falls back to en
     for any missing key. Placeholder tokens use {n}-style {...} syntax,
     substituted at call time — never translate/alter the token itself.
     cn_* keys are the per-species "citationNote" values from
     data/community-stress-lab-species-v1.json — duplicated here (not
     read from that file) since the data pack itself stays English
     (reference data, same convention as ui-journal.js's FISH_SPECIES). */
  var cslLang = (document.documentElement && document.documentElement.lang) || 'en';
  var CSL_STRINGS = {
    en: {
    'meta_title': 'Tank mates stress map — Community Stress Lab — Aquatic Rhythm',
    'meta_description': 'Educational lab: map overlapping pressures when mixing freshwater species. Not a compatibility guarantee — observation in your real tank still comes first.',
    'og_description': 'Educational lab: map overlapping pressures when mixing freshwater species. Not a compatibility guarantee.',
    'brief_eyebrow': 'Aquatic Rhythm Lab',
    'brief_title': 'Map your<br><em>community mix.</em>',
    'brief_body': 'Overlay ecological pressures for a hypothetical freshwater community — thermal window, chemistry, space, predation, social tension, and dwarf shrimp safety. For planning and learning, not for declaring fish "compatible."',
    'brief_rhy_thermal_name': 'Thermal',
    'brief_rhy_thermal_desc': 'Shared temperature range across all selected species',
    'brief_rhy_chemistry_name': 'Chemistry',
    'brief_rhy_chemistry_desc': 'pH and hardness overlap for the whole community',
    'brief_rhy_space_name': 'Space',
    'brief_rhy_space_desc': 'Bioload and territory demand relative to tank volume',
    'brief_rhy_predation_name': 'Predation',
    'brief_rhy_predation_desc': 'Mouth size and predatory behaviour risk between species',
    'brief_rhy_social_name': 'Social',
    'brief_rhy_social_desc': 'Schooling needs, aggression, and fin-nipping tendency',
    'brief_rhy_inverts_name': 'Inverts',
    'brief_rhy_inverts_desc': 'Dwarf shrimp compatibility and chemical sensitivity',
    'brief_note': 'Simplified ranges and rules only. Does not predict individual behaviour, aggression, or disease. Your real tank and your observations come first.',
    'brief_btn': 'Enter the lab &#x2192;',
    'insight_label': 'What this lab does',
    'insight_text': 'Map <em>overlapping pressures</em> for a hypothetical freshwater mix — thermal window, chemistry, space/load, predation, social tension, and dwarf shrimp safety. For planning and learning, not for declaring fish “compatible.”',
    'setup_note': 'Simplified ranges and rules only. Does not predict individual behaviour, aggression, or disease. Your real tank and your observations come first — use the <a href="/journal">Keeper’s Log</a> for what actually happens at home.',
    'disclosure_summary': 'How this lab works',
    'disclosure_p1': 'Species parameters (temperature, pH, body size, and behavioural tags) come from the Aquatic Rhythm species pack — hobby-consensus ranges cross-referenced against <a href="https://fishbase.se" target="_blank" rel="noopener noreferrer" style="color:rgba(61,214,232,.6);text-decoration:none">FishBase</a> and <a href="https://www.seriouslyfish.com" target="_blank" rel="noopener noreferrer" style="color:rgba(61,214,232,.6);text-decoration:none">SeriouslyFish</a>. Each species entry carries a citation note.',
    'disclosure_p2': 'The pressure engine checks thermal overlap, pH range intersection, bioload coefficient, predation mouth-size matching, fin-nipping pairing, and dwarf shrimp safety. It does not model individual personality, aggression history, or disease. "Elevated" and "High" labels mean the parameter warrants attention — they are not predictions of failure.',
    'disclosure_p3': 'Verify species parameters against current sources before stocking. Your real tank and your observations always come first.',
    'tank_context_label': 'Tank context',
    'volume_label': 'Volume',
    'species_label': 'Species',
    'species_hint': 'Up to 6 species · 24 individuals total. Search by name or id (e.g. <code>neon_tetra</code>).',
    'search_placeholder': 'Search species…',
    'search_aria': 'Search species to add',
    'add_btn': 'Add',
    'pressure_map_label': 'Pressure map',
    'findings_label': 'Findings',
    'checklist_label': 'Observation checklist',
    'foot_note': 'Aligned with living systems. All tools grow from ARA — they simulate and plan, but they do not replace observation.',
    'empty_chips': 'Add species to map overlapping pressures.',
    'canvas_empty': 'Add species to map the tank.',
    'decrease_count_aria': 'Decrease count',
    'increase_count_aria': 'Increase count',
    'remove_aria': 'Remove {name}',
    'no_species_match': 'No species match that search.',
    'select_species_for_findings': 'Select species to generate findings.',
    'no_findings': 'No major overlapping pressures flagged by this MVP model — still observe the real tank.',
    'could_not_load': 'Could not load species data. Check your connection and refresh.',
    'lane_thermal': 'Thermal',
    'lane_chemistry': 'Water chemistry',
    'lane_space': 'Space / load',
    'lane_predation': 'Predation',
    'lane_social': 'Social tension',
    'lane_inverts': 'Invert safety',
    'lane_level_high': 'high',
    'lane_level_elevated': 'elevated',
    'lane_level_low': 'low',
    'checklist_static_1': 'Watch feeding response and body condition for 7–10 days after any addition.',
    'checklist_static_2': 'Note fin damage, hiding, or colour loss at the same time each day.',
    'checklist_static_3': 'When troubleshooting, change one variable at a time so cause stays readable.',
    'checklist_priority': 'Priority: re-read behaviour for “{title}” before adding more livestock.',
    'r_thermal_gap_title': 'No shared temperature window',
    'r_thermal_gap_body': 'On paper, these species do not overlap in a comfortable temperature range. Re-check sources before attempting a mixed setup.',
    'r_thermal_narrow_title': 'Very narrow temperature overlap',
    'r_thermal_narrow_body': 'The overlap is only about {width} °C — small heater drift or seasons can push someone out of comfort.',
    'r_ph_gap_title': 'pH targets do not overlap',
    'r_ph_gap_body': 'General ranges do not intersect. Source water and buffering will matter even more than usual.',
    'r_ph_narrow_title': 'Tight pH overlap',
    'r_ph_narrow_body': 'The combined pH window is narrow — test tap and tank chemistry before mixing.',
    'r_coldwarm_mix_title': 'Coldwater mixed with tropical',
    'r_coldwarm_mix_body': 'Coldwater species (like goldfish) and tropical species rarely share one stable long-term plan.',
    'r_bioload_high_title': 'Bioload proxy is high for this volume',
    'r_bioload_high_body': 'Stocking density (rough proxy) is high relative to {volumeL} L — filtration, plants, and water changes need to match.',
    'r_bioload_proxy_title': 'Bioload proxy is elevated',
    'r_bioload_proxy_body': 'There is meaningful livestock mass for this volume on paper — leave margin for growth and messy days.',
    'r_small_tank_title': 'Small tank, many lifestyles',
    'r_small_tank_body': 'Under {smallTankL} L with several species or aggressive cichlids, territory and water quality swing faster.',
    'r_mbuna_community_title': 'Mbuna with non-mbuna fish',
    'r_mbuna_community_body': 'Rock-dwelling mbuna are a different community model than typical community fish — mixing usually raises chronic aggression or stress.',
    'r_predation_title': 'Mouth / body mismatch',
    'r_predation_body': '{predatorName} may treat very small tankmates (such as {preyName}) as food — behaviour varies by individual and setup.',
    'r_shrimp_risk_high_title': 'Shrimp with high-risk fish',
    'r_shrimp_risk_high_body': 'Active predators, nippers, or aggressive cichlids often stress or consume dwarf shrimp in typical aquascapes.',
    'r_shrimp_risk_mod_title': 'Shrimp with moderate-risk fish',
    'r_shrimp_risk_mod_body': 'Some fish ignore shrimp; others do not. Plan hiding places and watch for missing shrimp over weeks, not hours.',
    'r_fin_nipper_title': 'Fin-nipping exposure',
    'r_fin_nipper_body': 'A nipping species is paired with long fins or labyrinth fish — watch fins daily after introduction.',
    'r_tiger_school_title': 'Tiger barbs in a small group',
    'r_tiger_school_body': 'Tiger barbs are often nippier below ~{tigerMinSchool} — a larger school sometimes redirects nipping within the group.',
    'r_schooling_title': '{name} — low group size',
    'r_schooling_body': 'This species is usually kept in larger groups (about {schoolingMin}+). Small groups often hide or act skittish.',
    'r_betta_male_multi_title': 'Multiple male bettas — fighting near-certain',
    'r_betta_male_multi_body': 'Male bettas are strongly territorial and will fight if housed together. Fin damage, stress, and death are the typical outcome in all but very large, heavily-divided setups.',
    'r_betta_male_flow_title': 'Male betta with very active swimmers',
    'r_betta_male_flow_body': 'Fast mid-water fish sometimes stress male bettas by repeatedly crossing territory — watch for flaring, torn fins, or loss of appetite.',
    'r_betta_male_gourami_title': 'Male betta with other labyrinth fish',
    'r_betta_male_gourami_body': 'Multiple labyrinth species can dispute the surface — line of sight breaks and float plants help, but aggression is common.',
    'r_gbr_heat_title': 'Warm-specialist in a cool-overlap window',
    'r_gbr_heat_body': 'Warm-loving fish need stable warm water — if the whole-group overlap sits low, heaters and room temperature need extra headroom.',
    'r_discus_complex_title': 'Discus with a mismatched lifestyle mix',
    'r_discus_complex_body': 'Discus husbandry (temperature, flow, temperament) rarely lines up with coldwater, high-chase, or mbuna setups — expect extra friction.',
    'r_snail_loach_hunter_title': 'Snails with a dedicated snail hunter',
    'r_snail_loach_hunter_body': '{name} actively hunts snails — shell populations will decline noticeably over time.',
    'r_snail_loach_maybe_title': 'Snails with a potential snail eater',
    'r_snail_loach_maybe_body': 'Some reports of {name} disturbing snails — monitor over several weeks.',
    'r_snail_loach_cichlid_title': 'Mystery snail with aggressive cichlid',
    'r_snail_loach_cichlid_body': 'Aggressive cichlids may harass or injure mystery snails — antennas and soft parts are vulnerable.',
    'r_invert_assassin_title': 'Assassin snail with small inverts',
    'r_invert_assassin_body': 'Assassin snails prey on pest snails and may also take dwarf shrimp, especially juveniles — monitor closely in a mixed invert setup.',
    'r_zone_benthic_crowd_title': 'Multiple bottom-dwellers in a small tank',
    'r_zone_benthic_crowd_body': 'Several benthic species ({names}) compete for substrate territory — friction increases in tanks under {smallTankL} L.',
    'cn_default': 'Hobby consensus ranges — verify before stocking.',
    'cn_otocinclus_trade': 'Trade identity uncertain — sold as several Otocinclus spp. Hobby consensus ranges.',
    'cn_mbuna_generic': 'Generic stand-in for aggressive mbuna — verify species before stocking.',
    'cn_goldfish_fancy': 'Fancy strains vary — verify before stocking.',
    'cn_corydoras_sterbai': 'Warm-water cory; classic discus companion. Hobby consensus ranges.',
    'cn_peppered_corydoras': 'Cool-water tolerant corydoras. Hobby consensus ranges.',
    'cn_clown_loach': 'Sold small but grows very large — adult size frequently underestimated. Hobby consensus ranges.',
    'cn_yoyo_loach': 'Active snail hunter. Hobby consensus ranges — verify before stocking.',
    'cn_hillstream_loach': 'Requires high-flow, well-oxygenated cool water. Hobby consensus ranges.',
    'cn_bristlenose_pleco': 'Common algae eater, notably messy. Hobby consensus ranges.',
    'cn_white_cloud_minnow': 'Coldwater nano schooler — avoid mixing with tropical species. Hobby consensus ranges.',
    'cn_paradise_fish': 'Aggressive labyrinth fish; males fight. Cool-water tolerant. Hobby consensus ranges.',
    'cn_emperor_tetra': 'Males have long extended fins; vulnerable to nippers. Hobby consensus ranges.',
    'cn_black_skirt_tetra': 'Known fin nipper especially toward slow long-finned fish. Hobby consensus ranges.',
    'cn_serpae_tetra': 'Notorious fin nipper in small groups. Hobby consensus ranges.',
    'cn_sparkling_gourami': 'Tiny peaceful labyrinth fish. Hobby consensus ranges.',
    'cn_blue_gourami': 'Males can be aggressive toward other labyrinth fish. Hobby consensus ranges.',
    'cn_apistogramma': 'Genus-level stand-in — species vary widely. Hobby consensus ranges.',
    'cn_firemouth_cichlid': 'Territorial especially when breeding. Hobby consensus ranges.',
    'cn_keyhole_cichlid': 'One of the most peaceful cichlids. Hobby consensus ranges.',
    'cn_boesemani_rainbow': 'Active schooler; prefers hard alkaline water. Hobby consensus ranges.',
    'cn_threadfin_rainbow': 'Delicate; vulnerable to fin nippers and fast tankmates. Hobby consensus ranges.',
    'cn_glass_catfish': 'Peaceful schooler; dislikes strong currents. Hobby consensus ranges.',
    'cn_assassin_snail': 'Preys on pest snails; may take small shrimp. Hobby consensus ranges.',
    'cn_rosy_barb': 'Cool-tolerant fin nipper; active schooler. Hobby consensus ranges.',
    },
    id: {
    'meta_title': 'Peta tekanan teman seakuarium — Community Stress Lab — Aquatic Rhythm',
    'meta_description': 'Lab edukatif: memetakan tekanan yang bertumpang tindih saat mencampur spesies air tawar. Bukan jaminan kecocokan — pengamatan di akuarium nyata Anda tetap yang utama.',
    'og_description': 'Lab edukatif: memetakan tekanan yang bertumpang tindih saat mencampur spesies air tawar. Bukan jaminan kecocokan.',
    'brief_eyebrow': 'Aquatic Rhythm Lab',
    'brief_title': 'Petakan<br><em>campuran komunitas Anda.</em>',
    'brief_body': 'Tumpuk tekanan ekologis untuk komunitas air tawar hipotetis — jendela suhu, kimia air, ruang, predasi, ketegangan sosial, dan keamanan udang kerdil. Untuk perencanaan dan pembelajaran, bukan untuk menyatakan ikan "cocok".',
    'brief_rhy_thermal_name': 'Termal',
    'brief_rhy_thermal_desc': 'Rentang suhu bersama untuk semua spesies yang dipilih',
    'brief_rhy_chemistry_name': 'Kimia air',
    'brief_rhy_chemistry_desc': 'Irisan pH dan kesadahan untuk seluruh komunitas',
    'brief_rhy_space_name': 'Ruang',
    'brief_rhy_space_desc': 'Beban biologis dan kebutuhan teritori dibanding volume akuarium',
    'brief_rhy_predation_name': 'Predasi',
    'brief_rhy_predation_desc': 'Ukuran mulut dan risiko perilaku predator antarspesies',
    'brief_rhy_social_name': 'Sosial',
    'brief_rhy_social_desc': 'Kebutuhan bergerombol, agresi, dan kecenderungan menggigit sirip',
    'brief_rhy_inverts_name': 'Invertebrata',
    'brief_rhy_inverts_desc': 'Kecocokan udang kerdil dan sensitivitas terhadap zat kimia',
    'brief_note': 'Hanya rentang dan aturan yang disederhanakan. Tidak memprediksi perilaku individu, agresi, atau penyakit. Akuarium nyata dan pengamatan Anda tetap yang utama.',
    'brief_btn': 'Masuk ke lab &#x2192;',
    'insight_label': 'Apa yang dilakukan lab ini',
    'insight_text': 'Memetakan <em>tekanan yang bertumpang tindih</em> untuk campuran air tawar hipotetis — jendela suhu, kimia air, ruang/beban, predasi, ketegangan sosial, dan keamanan udang kerdil. Untuk perencanaan dan pembelajaran, bukan untuk menyatakan ikan “cocok”.',
    'setup_note': 'Hanya rentang dan aturan yang disederhanakan. Tidak memprediksi perilaku individu, agresi, atau penyakit. Akuarium nyata dan pengamatan Anda tetap yang utama — gunakan <a href="/journal">Catatan Penjaga</a> untuk mencatat apa yang benar-benar terjadi di rumah.',
    'disclosure_summary': 'Cara kerja lab ini',
    'disclosure_p1': 'Parameter spesies (suhu, pH, ukuran tubuh, dan tag perilaku) berasal dari paket spesies Aquatic Rhythm — rentang konsensus hobi yang dirujuk silang dengan <a href="https://fishbase.se" target="_blank" rel="noopener noreferrer" style="color:rgba(61,214,232,.6);text-decoration:none">FishBase</a> dan <a href="https://www.seriouslyfish.com" target="_blank" rel="noopener noreferrer" style="color:rgba(61,214,232,.6);text-decoration:none">SeriouslyFish</a>. Setiap entri spesies memuat catatan rujukan.',
    'disclosure_p2': 'Mesin tekanan memeriksa irisan suhu, perpotongan rentang pH, koefisien beban biologis, kecocokan ukuran mulut untuk predasi, pasangan penggigit sirip, dan keamanan udang kerdil. Mesin ini tidak memodelkan kepribadian individu, riwayat agresi, atau penyakit. Label "Meningkat" dan "Tinggi" berarti parameter tersebut perlu diperhatikan — keduanya bukan prediksi kegagalan.',
    'disclosure_p3': 'Verifikasi parameter spesies dengan sumber terkini sebelum menebar penghuni. Akuarium nyata dan pengamatan Anda selalu yang utama.',
    'tank_context_label': 'Konteks akuarium',
    'volume_label': 'Volume',
    'species_label': 'Spesies',
    'species_hint': 'Maksimal 6 spesies · total 24 individu. Cari berdasarkan nama atau id (mis. <code>neon_tetra</code>).',
    'search_placeholder': 'Cari spesies…',
    'search_aria': 'Cari spesies untuk ditambahkan',
    'add_btn': 'Tambah',
    'pressure_map_label': 'Peta tekanan',
    'findings_label': 'Temuan',
    'checklist_label': 'Daftar periksa pengamatan',
    'foot_note': 'Selaras dengan sistem kehidupan. Semua alat tumbuh dari ARA — alat ini menyimulasikan dan merencanakan, tetapi tidak menggantikan pengamatan.',
    'empty_chips': 'Tambahkan spesies untuk memetakan tekanan yang bertumpang tindih.',
    'canvas_empty': 'Tambahkan spesies untuk memetakan akuarium.',
    'decrease_count_aria': 'Kurangi jumlah',
    'increase_count_aria': 'Tambah jumlah',
    'remove_aria': 'Hapus {name}',
    'no_species_match': 'Tidak ada spesies yang cocok dengan pencarian itu.',
    'select_species_for_findings': 'Pilih spesies untuk menghasilkan temuan.',
    'no_findings': 'Tidak ada tekanan bertumpang tindih besar yang ditandai oleh model MVP ini — tetap amati akuarium nyata Anda.',
    'could_not_load': 'Tidak dapat memuat data spesies. Periksa koneksi Anda lalu muat ulang.',
    'lane_thermal': 'Termal',
    'lane_chemistry': 'Kimia air',
    'lane_space': 'Ruang / beban',
    'lane_predation': 'Predasi',
    'lane_social': 'Ketegangan sosial',
    'lane_inverts': 'Keamanan invertebrata',
    'lane_level_high': 'tinggi',
    'lane_level_elevated': 'meningkat',
    'lane_level_low': 'rendah',
    'checklist_static_1': 'Amati respons makan dan kondisi tubuh selama 7–10 hari setelah setiap penambahan.',
    'checklist_static_2': 'Catat kerusakan sirip, perilaku bersembunyi, atau warna yang memudar pada jam yang sama setiap hari.',
    'checklist_static_3': 'Saat menelusuri masalah, ubah satu variabel dalam satu waktu agar penyebabnya tetap terbaca.',
    'checklist_priority': 'Prioritas: baca ulang perilaku untuk “{title}” sebelum menambah penghuni baru.',
    'r_thermal_gap_title': 'Tidak ada jendela suhu bersama',
    'r_thermal_gap_body': 'Di atas kertas, spesies ini tidak memiliki irisan rentang suhu yang nyaman. Periksa ulang sumber sebelum mencoba penataan campuran.',
    'r_thermal_narrow_title': 'Irisan suhu sangat sempit',
    'r_thermal_narrow_body': 'Irisannya hanya sekitar {width} °C — pergeseran kecil pada heater atau pergantian musim dapat membuat salah satu spesies keluar dari zona nyaman.',
    'r_ph_gap_title': 'Target pH tidak beririsan',
    'r_ph_gap_body': 'Rentang umumnya tidak berpotongan. Air sumber dan daya buffer akan lebih menentukan daripada biasanya.',
    'r_ph_narrow_title': 'Irisan pH sempit',
    'r_ph_narrow_body': 'Jendela pH gabungan tergolong sempit — uji kimia air keran dan air akuarium sebelum mencampur.',
    'r_coldwarm_mix_title': 'Ikan air dingin dicampur dengan ikan tropis',
    'r_coldwarm_mix_body': 'Spesies air dingin (seperti ikan mas koki) dan spesies tropis jarang dapat berbagi satu rencana jangka panjang yang stabil.',
    'r_bioload_high_title': 'Perkiraan beban biologis tinggi untuk volume ini',
    'r_bioload_high_body': 'Kepadatan tebar (perkiraan kasar) tergolong tinggi dibanding {volumeL} L — filtrasi, tanaman, dan penggantian air harus menyesuaikan.',
    'r_bioload_proxy_title': 'Perkiraan beban biologis meningkat',
    'r_bioload_proxy_body': 'Di atas kertas, massa penghuni cukup berarti untuk volume ini — sisakan ruang untuk pertumbuhan dan hari-hari yang berantakan.',
    'r_small_tank_title': 'Akuarium kecil, banyak gaya hidup',
    'r_small_tank_body': 'Di bawah {smallTankL} L dengan beberapa spesies atau cichlid agresif, teritori dan kualitas air berayun lebih cepat.',
    'r_mbuna_community_title': 'Mbuna bersama ikan non-mbuna',
    'r_mbuna_community_body': 'Mbuna penghuni bebatuan mengikuti model komunitas yang berbeda dari ikan komunitas pada umumnya — mencampurnya biasanya meningkatkan agresi atau stres kronis.',
    'r_predation_title': 'Ketidaksesuaian ukuran mulut / tubuh',
    'r_predation_body': '{predatorName} dapat memperlakukan teman seakuarium yang sangat kecil (seperti {preyName}) sebagai makanan — perilakunya berbeda-beda menurut individu dan penataan.',
    'r_shrimp_risk_high_title': 'Udang bersama ikan berisiko tinggi',
    'r_shrimp_risk_high_body': 'Predator aktif, penggigit sirip, atau cichlid agresif sering membuat udang kerdil stres atau memangsanya pada aquascape umumnya.',
    'r_shrimp_risk_mod_title': 'Udang bersama ikan berisiko sedang',
    'r_shrimp_risk_mod_body': 'Sebagian ikan mengabaikan udang; sebagian lain tidak. Siapkan tempat bersembunyi dan pantau udang yang hilang dalam hitungan minggu, bukan jam.',
    'r_fin_nipper_title': 'Paparan gigitan sirip',
    'r_fin_nipper_body': 'Spesies penggigit sirip dipasangkan dengan ikan bersirip panjang atau ikan labirin — periksa sirip setiap hari setelah pengenalan.',
    'r_tiger_school_title': 'Tiger barb dalam kelompok kecil',
    'r_tiger_school_body': 'Tiger barb sering lebih gemar menggigit bila jumlahnya di bawah ~{tigerMinSchool} — kelompok yang lebih besar kadang mengalihkan gigitan ke dalam kelompoknya sendiri.',
    'r_schooling_title': '{name} — ukuran kelompok terlalu kecil',
    'r_schooling_body': 'Spesies ini biasanya dipelihara dalam kelompok yang lebih besar (sekitar {schoolingMin}+). Kelompok kecil sering bersembunyi atau bersikap gugup.',
    'r_betta_male_multi_title': 'Beberapa betta jantan — perkelahian hampir pasti',
    'r_betta_male_multi_body': 'Betta jantan sangat teritorial dan akan berkelahi jika dipelihara bersama. Sirip rusak, stres, dan kematian adalah hasil yang biasa terjadi, kecuali pada penataan yang sangat besar dan bersekat rapat.',
    'r_betta_male_flow_title': 'Betta jantan bersama perenang yang sangat aktif',
    'r_betta_male_flow_body': 'Ikan cepat penghuni air tengah kadang membuat betta jantan stres karena berulang kali melintasi teritorinya — perhatikan sirip yang mengembang, sirip robek, atau nafsu makan menurun.',
    'r_betta_male_gourami_title': 'Betta jantan bersama ikan labirin lain',
    'r_betta_male_gourami_body': 'Beberapa spesies labirin dapat memperebutkan permukaan — pemutus garis pandang dan tanaman apung membantu, tetapi agresi tetap umum terjadi.',
    'r_gbr_heat_title': 'Spesialis air hangat dalam jendela irisan yang sejuk',
    'r_gbr_heat_body': 'Ikan penyuka suhu hangat membutuhkan air hangat yang stabil — jika irisan seluruh kelompok berada di sisi rendah, heater dan suhu ruangan perlu ruang cadangan ekstra.',
    'r_discus_complex_title': 'Discus dengan campuran gaya hidup yang tidak sepadan',
    'r_discus_complex_body': 'Perawatan discus (suhu, arus, temperamen) jarang sejalan dengan penataan air dingin, ikan pengejar aktif, atau mbuna — bersiaplah menghadapi gesekan ekstra.',
    'r_snail_loach_hunter_title': 'Siput bersama pemburu siput sejati',
    'r_snail_loach_hunter_body': '{name} aktif memburu siput — populasi siput akan menurun secara nyata seiring waktu.',
    'r_snail_loach_maybe_title': 'Siput bersama pemakan siput potensial',
    'r_snail_loach_maybe_body': 'Ada beberapa laporan {name} mengganggu siput — pantau selama beberapa minggu.',
    'r_snail_loach_cichlid_title': 'Mystery snail bersama cichlid agresif',
    'r_snail_loach_cichlid_body': 'Cichlid agresif dapat mengganggu atau melukai mystery snail — antena dan bagian tubuh lunaknya rentan.',
    'r_invert_assassin_title': 'Assassin snail bersama invertebrata kecil',
    'r_invert_assassin_body': 'Assassin snail memangsa siput hama dan mungkin juga memakan udang kerdil, terutama yang masih muda — pantau ketat pada penataan invertebrata campuran.',
    'r_zone_benthic_crowd_title': 'Beberapa penghuni dasar dalam akuarium kecil',
    'r_zone_benthic_crowd_body': 'Beberapa spesies bentik ({names}) bersaing memperebutkan teritori substrat — gesekan meningkat pada akuarium di bawah {smallTankL} L.',
    'cn_default': 'Rentang konsensus hobi — verifikasi sebelum menebar.',
    'cn_otocinclus_trade': 'Identitas dalam perdagangan tidak pasti — dijual sebagai beberapa Otocinclus spp. Rentang konsensus hobi.',
    'cn_mbuna_generic': 'Pengganti umum untuk mbuna agresif — verifikasi spesies sebelum menebar.',
    'cn_goldfish_fancy': 'Galur fancy bervariasi — verifikasi sebelum menebar.',
    'cn_corydoras_sterbai': 'Cory air hangat; pendamping klasik discus. Rentang konsensus hobi.',
    'cn_peppered_corydoras': 'Corydoras yang toleran air sejuk. Rentang konsensus hobi.',
    'cn_clown_loach': 'Dijual dalam ukuran kecil tetapi tumbuh sangat besar — ukuran dewasanya sering diremehkan. Rentang konsensus hobi.',
    'cn_yoyo_loach': 'Pemburu siput yang aktif. Rentang konsensus hobi — verifikasi sebelum menebar.',
    'cn_hillstream_loach': 'Membutuhkan air sejuk beraliran deras dan kaya oksigen. Rentang konsensus hobi.',
    'cn_bristlenose_pleco': 'Pemakan alga yang umum, terkenal banyak menghasilkan kotoran. Rentang konsensus hobi.',
    'cn_white_cloud_minnow': 'Ikan nano air dingin yang bergerombol — hindari mencampurnya dengan spesies tropis. Rentang konsensus hobi.',
    'cn_paradise_fish': 'Ikan labirin yang agresif; jantannya berkelahi. Toleran air sejuk. Rentang konsensus hobi.',
    'cn_emperor_tetra': 'Jantan bersirip panjang menjuntai; rentan terhadap penggigit sirip. Rentang konsensus hobi.',
    'cn_black_skirt_tetra': 'Dikenal sebagai penggigit sirip, terutama terhadap ikan lambat yang bersirip panjang. Rentang konsensus hobi.',
    'cn_serpae_tetra': 'Penggigit sirip yang terkenal bila dipelihara dalam kelompok kecil. Rentang konsensus hobi.',
    'cn_sparkling_gourami': 'Ikan labirin mungil yang damai. Rentang konsensus hobi.',
    'cn_blue_gourami': 'Jantan bisa agresif terhadap ikan labirin lain. Rentang konsensus hobi.',
    'cn_apistogramma': 'Pengganti di tingkat genus — antarspesies sangat bervariasi. Rentang konsensus hobi.',
    'cn_firemouth_cichlid': 'Teritorial, terutama saat berbiak. Rentang konsensus hobi.',
    'cn_keyhole_cichlid': 'Salah satu cichlid paling damai. Rentang konsensus hobi.',
    'cn_boesemani_rainbow': 'Perenang bergerombol yang aktif; menyukai air sadah dan basa. Rentang konsensus hobi.',
    'cn_threadfin_rainbow': 'Rapuh; rentan terhadap penggigit sirip dan teman seakuarium yang gesit. Rentang konsensus hobi.',
    'cn_glass_catfish': 'Ikan bergerombol yang damai; tidak menyukai arus kuat. Rentang konsensus hobi.',
    'cn_assassin_snail': 'Memangsa siput hama; bisa memakan udang kecil. Rentang konsensus hobi.',
    'cn_rosy_barb': 'Penggigit sirip yang toleran air sejuk; perenang bergerombol yang aktif. Rentang konsensus hobi.',
    },
    ja: {
    'meta_title': '混泳のストレスマップ — Community Stress Lab — Aquatic Rhythm',
    'meta_description': '学習のためのラボです。淡水魚を混泳させたときに重なり合う負荷を可視化します。相性を保証するものではありません。優先されるのは、いつでも実際の水槽での観察です。',
    'og_description': '学習のためのラボです。淡水魚を混泳させたときに重なり合う負荷を可視化します。相性を保証するものではありません。',
    'brief_eyebrow': 'Aquatic Rhythm ラボ',
    'brief_title': '混泳の組み合わせを<br><em>地図にする。</em>',
    'brief_body': '想定した淡水の混泳水槽について、生態的な負荷（水温域、水質、広さ、捕食、社会的な緊張、そして小型シュリンプの安全性）を重ね合わせて表示します。計画と学習のための道具であり、魚を「相性が良い」と断定するためのものではありません。',
    'brief_rhy_thermal_name': '水温',
    'brief_rhy_thermal_desc': '選んだすべての種に共通する水温の範囲',
    'brief_rhy_chemistry_name': '水質',
    'brief_rhy_chemistry_desc': '混泳全体で重なる pH と硬度の範囲',
    'brief_rhy_space_name': '広さ',
    'brief_rhy_space_desc': '水量に対する生体量と縄張りの要求',
    'brief_rhy_predation_name': '捕食',
    'brief_rhy_predation_desc': '口の大きさと、種どうしの捕食行動のリスク',
    'brief_rhy_social_name': '社会性',
    'brief_rhy_social_desc': '群れの必要性、攻撃性、ヒレをかじる傾向',
    'brief_rhy_inverts_name': '無脊椎',
    'brief_rhy_inverts_desc': '小型シュリンプとの相性と、薬品に対する敏感さ',
    'brief_note': '扱うのは簡略化した数値範囲と規則だけです。個体ごとの行動、攻撃性、病気を予測するものではありません。優先されるのは、あなたの実際の水槽と観察です。',
    'brief_btn': 'ラボに入る &#x2192;',
    'insight_label': 'このラボでできること',
    'insight_text': '想定した淡水の混泳について、<em>重なり合う負荷</em>（水温域、水質、広さと生体量、捕食、社会的な緊張、小型シュリンプの安全性）を地図のように示します。計画と学習のための道具であり、魚を「相性が良い」と断定するためのものではありません。',
    'setup_note': '扱うのは簡略化した数値範囲と規則だけです。個体ごとの行動、攻撃性、病気を予測するものではありません。優先されるのは、あなたの実際の水槽と観察です。自宅で実際に起きたことは、<a href="/journal">キーパーの記録</a>に残してください。',
    'disclosure_summary': 'このラボの仕組み',
    'disclosure_p1': '各種のパラメータ（水温、pH、体長、行動タグ）は Aquatic Rhythm の種データパックによるもので、アクアリウムで一般に共有されている範囲を、<a href="https://fishbase.se" target="_blank" rel="noopener noreferrer" style="color:rgba(61,214,232,.6);text-decoration:none">FishBase</a> と <a href="https://www.seriouslyfish.com" target="_blank" rel="noopener noreferrer" style="color:rgba(61,214,232,.6);text-decoration:none">SeriouslyFish</a> と照合したものです。種ごとの項目には出典メモが付いています。',
    'disclosure_p2': 'この負荷エンジンが確認するのは、水温域の重なり、pH 範囲の交わり、生体量の係数、捕食における口と体の大きさの対応、ヒレをかじる組み合わせ、そして小型シュリンプの安全性です。個体の性格、攻撃の履歴、病気は扱いません。「やや高い」「高い」という表示は、その項目に注意が必要という意味であり、失敗の予告ではありません。',
    'disclosure_p3': '導入の前に、最新の資料で各種のパラメータを確認してください。優先されるのは、いつでもあなたの実際の水槽と観察です。',
    'tank_context_label': '水槽の条件',
    'volume_label': '水量',
    'species_label': '種',
    'species_hint': '最大 6 種・合計 24 匹まで。名前または ID で検索できます（例：<code>neon_tetra</code>）。',
    'search_placeholder': '種を検索…',
    'search_aria': '追加する種を検索',
    'add_btn': '追加',
    'pressure_map_label': '負荷マップ',
    'findings_label': '所見',
    'checklist_label': '観察チェックリスト',
    'foot_note': '生きた系に寄り添って。すべての道具は ARA から育っています。模擬と計画はできても、観察の代わりにはなりません。',
    'empty_chips': '種を追加すると、重なり合う負荷が表示されます。',
    'canvas_empty': '種を追加すると水槽が表示されます。',
    'decrease_count_aria': '数を減らす',
    'increase_count_aria': '数を増やす',
    'remove_aria': '{name} を削除',
    'no_species_match': 'その検索に合う種はありません。',
    'select_species_for_findings': '種を選ぶと所見が表示されます。',
    'no_findings': 'この簡易モデルでは、大きな負荷の重なりは見つかりませんでした。それでも実際の水槽をよく観察してください。',
    'could_not_load': '種のデータを読み込めませんでした。通信状態を確認して、再読み込みしてください。',
    'lane_thermal': '水温',
    'lane_chemistry': '水質',
    'lane_space': '広さ・生体量',
    'lane_predation': '捕食',
    'lane_social': '社会的な緊張',
    'lane_inverts': '無脊椎の安全性',
    'lane_level_high': '高い',
    'lane_level_elevated': 'やや高い',
    'lane_level_low': '低い',
    'checklist_static_1': '生体を追加したら、7〜10 日は餌への反応と体の状態を観察する。',
    'checklist_static_2': 'ヒレの傷、隠れる行動、色あせを、毎日同じ時間に記録する。',
    'checklist_static_3': '問題を追うときは、一度に変える条件を一つに絞り、原因を読み取れるようにする。',
    'checklist_priority': '優先：生体を増やす前に、「{title}」について行動をもう一度確かめる。',
    'r_thermal_gap_title': '共通する水温域がない',
    'r_thermal_gap_body': '資料の上では、これらの種に快適な水温の重なりはありません。混泳を試す前に、出典を確認し直してください。',
    'r_thermal_narrow_title': '水温の重なりがとても狭い',
    'r_thermal_narrow_body': '重なりは約 {width} °C しかありません。ヒーターのわずかなずれや季節の変化で、どれかの種が快適な範囲から外れます。',
    'r_ph_gap_title': '目標とする pH が重ならない',
    'r_ph_gap_body': '一般的な範囲どうしが交わりません。元の水と緩衝能が、いつも以上に重要になります。',
    'r_ph_narrow_title': 'pH の重なりが狭い',
    'r_ph_narrow_body': '全体で見た pH の幅は狭いです。混泳させる前に、水道水と水槽の水質を測ってください。',
    'r_coldwarm_mix_title': '低水温の種と熱帯魚の混泳',
    'r_coldwarm_mix_body': '金魚のような低水温の種と熱帯魚が、長期にわたって同じ安定した条件を共有できることはまれです。',
    'r_bioload_high_title': 'この水量に対して生体量の目安が高い',
    'r_bioload_high_body': 'おおまかな目安として、{volumeL} L に対する収容密度が高くなっています。ろ過、水草、換水をそれに見合うだけ用意してください。',
    'r_bioload_proxy_title': '生体量の目安がやや高い',
    'r_bioload_proxy_body': '計算の上では、この水量に対して生体の量がそれなりにあります。成長する分と、水が汚れる日のために余裕を残してください。',
    'r_small_tank_title': '小さな水槽に、多様な暮らし方',
    'r_small_tank_body': '{smallTankL} L 未満の水槽で複数の種や気の荒いシクリッドを飼うと、縄張りも水質も速く揺れます。',
    'r_mbuna_community_title': 'ムブナと、それ以外の魚',
    'r_mbuna_community_body': '岩場に暮らすムブナは、一般的な混泳魚とは別の飼い方の体系です。混ぜると、慢性的な攻撃やストレスが増えるのがふつうです。',
    'r_predation_title': '口と体の大きさの不釣り合い',
    'r_predation_body': '{predatorName} は、とても小さな同居魚（{preyName} など）を餌として扱うことがあります。行動は個体や環境によって変わります。',
    'r_shrimp_risk_high_title': 'シュリンプと、危険度の高い魚',
    'r_shrimp_risk_high_body': '活発な捕食魚、ヒレをかじる魚、気の荒いシクリッドは、ふつうのレイアウトでは小型シュリンプを追い詰めたり食べたりしがちです。',
    'r_shrimp_risk_mod_title': 'シュリンプと、危険度が中くらいの魚',
    'r_shrimp_risk_mod_body': 'シュリンプに見向きもしない魚もいれば、そうでない魚もいます。隠れ家を用意し、数が減っていないかを数時間ではなく数週間かけて確かめてください。',
    'r_fin_nipper_title': 'ヒレをかじられる恐れ',
    'r_fin_nipper_body': 'ヒレをかじる種が、長いヒレの魚やアナバス類と組み合わさっています。導入したあとは、毎日ヒレを確認してください。',
    'r_tiger_school_title': 'スマトラの群れが小さい',
    'r_tiger_school_body': 'スマトラは群れが約 {tigerMinSchool} を下回るとヒレをかじりやすくなります。群れを大きくすると、かじる相手が群れの中に向かうことがあります。',
    'r_schooling_title': '{name} — 群れの数が少ない',
    'r_schooling_body': 'この種はふつう、もっと大きな群れ（およそ {schoolingMin} 以上）で飼われます。小さな群れでは、隠れがちになったり、おびえた動きをしたりします。',
    'r_betta_male_multi_title': 'オスのベタが複数 — 争いはほぼ確実',
    'r_betta_male_multi_body': 'オスのベタは縄張り意識がとても強く、一緒に入れれば争います。とても大きく、しっかり仕切った水槽でない限り、ヒレの損傷、ストレス、死に至るのがふつうの結末です。',
    'r_betta_male_flow_title': 'オスのベタと、とても活発に泳ぐ魚',
    'r_betta_male_flow_body': '中層を速く泳ぐ魚が縄張りを何度も横切ることで、オスのベタが消耗することがあります。エラを広げる威嚇、裂けたヒレ、食欲の低下に注意してください。',
    'r_betta_male_gourami_title': 'オスのベタと、ほかのアナバス類',
    'r_betta_male_gourami_body': 'アナバス類が複数いると、水面をめぐって争うことがあります。視線を遮る配置や浮き草は助けになりますが、それでも攻撃はよく起きます。',
    'r_gbr_heat_title': '高水温を好む種に、低めの重なり幅',
    'r_gbr_heat_body': '高水温を好む魚には、安定して暖かい水が必要です。全体の重なりが低い側に寄っている場合は、ヒーターと室温に余裕を持たせてください。',
    'r_discus_complex_title': 'ディスカスと、暮らし方の合わない組み合わせ',
    'r_discus_complex_body': 'ディスカスの飼い方（水温、水流、気質）は、低水温の魚、追いかけ回す魚、ムブナの水槽とかみ合うことがほとんどありません。余分な摩擦を見込んでください。',
    'r_snail_loach_hunter_title': '貝と、貝を専門に狩る魚',
    'r_snail_loach_hunter_body': '{name} は貝を積極的に狩ります。時間とともに、貝の数は目に見えて減ります。',
    'r_snail_loach_maybe_title': '貝と、貝を食べる可能性のある魚',
    'r_snail_loach_maybe_body': '{name} が貝にちょっかいを出したという報告があります。数週間かけて様子を見てください。',
    'r_snail_loach_cichlid_title': 'ミステリースネールと、気の荒いシクリッド',
    'r_snail_loach_cichlid_body': '気の荒いシクリッドは、ミステリースネールをつついたり傷つけたりすることがあります。触角や柔らかい部分が狙われやすいです。',
    'r_invert_assassin_title': 'アサシンスネールと、小さな無脊椎',
    'r_invert_assassin_body': 'アサシンスネールはスネール（害貝）を捕食し、小型シュリンプ、とくに稚エビを襲うこともあります。無脊椎を混ぜた水槽では、よく観察してください。',
    'r_zone_benthic_crowd_title': '小さな水槽に底層の魚が複数',
    'r_zone_benthic_crowd_body': '底層で暮らす種（{names}）が複数いると、底床の縄張りを取り合います。{smallTankL} L 未満の水槽では摩擦が大きくなります。',
    'cn_default': 'アクアリウムで一般に共有されている範囲です。導入の前に確認してください。',
    'cn_otocinclus_trade': '流通名と種の対応が不確かで、複数の Otocinclus spp. が同じ名前で売られています。アクアリウムで一般に共有されている範囲。',
    'cn_mbuna_generic': '気の荒いムブナ全般の代表としての項目です。導入の前に種を確認してください。',
    'cn_goldfish_fancy': '品種によって差があります。導入の前に確認してください。',
    'cn_corydoras_sterbai': '高水温に向くコリドラス。ディスカスの定番の同居魚。アクアリウムで一般に共有されている範囲。',
    'cn_peppered_corydoras': '低めの水温にも耐えるコリドラス。アクアリウムで一般に共有されている範囲。',
    'cn_clown_loach': '小さな個体で売られますが、非常に大きく育ちます。成魚の大きさは見落とされがちです。アクアリウムで一般に共有されている範囲。',
    'cn_yoyo_loach': '貝を積極的に狩ります。アクアリウムで一般に共有されている範囲です。導入の前に確認してください。',
    'cn_hillstream_loach': '強い水流と、酸素の豊富な低めの水温が必要です。アクアリウムで一般に共有されている範囲。',
    'cn_bristlenose_pleco': 'よく使われるコケ取り役ですが、かなり水を汚します。アクアリウムで一般に共有されている範囲。',
    'cn_white_cloud_minnow': '低水温を好む小型の群泳魚です。熱帯魚との混泳は避けてください。アクアリウムで一般に共有されている範囲。',
    'cn_paradise_fish': '気の荒いアナバス類で、オスどうしは争います。低めの水温にも耐えます。アクアリウムで一般に共有されている範囲。',
    'cn_emperor_tetra': 'オスはヒレが長く伸び、ヒレをかじる魚に狙われやすいです。アクアリウムで一般に共有されている範囲。',
    'cn_black_skirt_tetra': 'ヒレをかじることで知られ、とくに動きの遅い長いヒレの魚を狙います。アクアリウムで一般に共有されている範囲。',
    'cn_serpae_tetra': '群れが小さいと、よくヒレをかじります。アクアリウムで一般に共有されている範囲。',
    'cn_sparkling_gourami': 'とても小さく穏やかなアナバス類。アクアリウムで一般に共有されている範囲。',
    'cn_blue_gourami': 'オスはほかのアナバス類に対して攻撃的になることがあります。アクアリウムで一般に共有されている範囲。',
    'cn_apistogramma': 'Apistogramma 属をまとめた代表の項目です。種による差が大きいです。アクアリウムで一般に共有されている範囲。',
    'cn_firemouth_cichlid': '縄張り意識が強く、とくに繁殖期に目立ちます。アクアリウムで一般に共有されている範囲。',
    'cn_keyhole_cichlid': 'もっとも穏やかなシクリッドの一つ。アクアリウムで一般に共有されている範囲。',
    'cn_boesemani_rainbow': '活発な群泳魚で、硬めのアルカリ性の水を好みます。アクアリウムで一般に共有されている範囲。',
    'cn_threadfin_rainbow': '繊細で、ヒレをかじる魚や動きの速い同居魚に弱いです。アクアリウムで一般に共有されている範囲。',
    'cn_glass_catfish': '穏やかな群泳魚で、強い水流を嫌います。アクアリウムで一般に共有されている範囲。',
    'cn_assassin_snail': 'スネール（害貝）を捕食し、小さなエビを襲うこともあります。アクアリウムで一般に共有されている範囲。',
    'cn_rosy_barb': '低めの水温にも耐え、ヒレをかじることがある活発な群泳魚。アクアリウムで一般に共有されている範囲。',
    }
  };
  function T(key, subs) {
    var s = (CSL_STRINGS[cslLang] && CSL_STRINGS[cslLang][key]) || CSL_STRINGS.en[key] || key;
    if (subs) {
      Object.keys(subs).forEach(function (k) {
        s = s.split('{' + k + '}').join(subs[k]);
      });
    }
    return s;
  }

  // Species pack (data/community-stress-lab-species-v1.json) stays English —
  // reference data, same convention as ui-journal.js's FISH_SPECIES — so its
  // per-species citationNote strings can't be translated in the pack itself.
  // Maps species id -> CSL_STRINGS cn_* key suffix for species with a note
  // distinct from the shared default; anything not listed here uses 'default'.
  var CITATION_KEY_BY_SPECIES = {
    otocinclus: 'otocinclus_trade',
    mbuna_generic: 'mbuna_generic',
    goldfish: 'goldfish_fancy',
    corydoras_sterbai: 'corydoras_sterbai',
    peppered_corydoras: 'peppered_corydoras',
    clown_loach: 'clown_loach',
    yoyo_loach: 'yoyo_loach',
    hillstream_loach: 'hillstream_loach',
    bristlenose_pleco: 'bristlenose_pleco',
    white_cloud_minnow: 'white_cloud_minnow',
    paradise_fish: 'paradise_fish',
    emperor_tetra: 'emperor_tetra',
    black_skirt_tetra: 'black_skirt_tetra',
    serpae_tetra: 'serpae_tetra',
    sparkling_gourami: 'sparkling_gourami',
    blue_gourami: 'blue_gourami',
    apistogramma: 'apistogramma',
    firemouth_cichlid: 'firemouth_cichlid',
    keyhole_cichlid: 'keyhole_cichlid',
    boesemani_rainbow: 'boesemani_rainbow',
    threadfin_rainbow: 'threadfin_rainbow',
    glass_catfish: 'glass_catfish',
    assassin_snail: 'assassin_snail',
    rosy_barb: 'rosy_barb'
  };
  function citationNoteFor(speciesId) {
    return T('cn_' + (CITATION_KEY_BY_SPECIES[speciesId] || 'default'));
  }

  var MAX_DISTINCT_SPECIES = 6;
  var MAX_INDIVIDUALS = 24;
  var BIoload_COEFF = 0.35;
  var BIoload_HIGH = 0.5;
  var SMALL_TANK_L = 60;
  var TIGER_MIN_SCHOOL = 8;

  var LANES = ['thermal', 'chemistry', 'space', 'predation', 'social', 'inverts'];

  function hasTag(s, tag) {
    return s.tags && s.tags.indexOf(tag) !== -1;
  }

  function isInvert(s) {
    return hasTag(s, 'invert');
  }

  function intersectIntervals(intervals) {
    if (!intervals.length) return null;
    var lo = -Infinity;
    var hi = Infinity;
    for (var i = 0; i < intervals.length; i++) {
      lo = Math.max(lo, intervals[i][0]);
      hi = Math.min(hi, intervals[i][1]);
    }
    if (lo > hi) return null;
    return { lo: lo, hi: hi, width: hi - lo };
  }

  function thermalIntersection(speciesById, picks) {
    var iv = [];
    for (var i = 0; i < picks.length; i++) {
      var s = speciesById[picks[i].id];
      if (!s) continue;
      iv.push([s.tempMinC, s.tempMaxC]);
    }
    return intersectIntervals(iv);
  }

  /**
   * @returns {{ skip: true } | { gap: true } | { ok: true, width: number, lo: number, hi: number }}
   */
  function phIntersection(speciesById, picks) {
    var iv = [];
    for (var i = 0; i < picks.length; i++) {
      var s = speciesById[picks[i].id];
      if (!s) return { skip: true };
      if (s.phMin == null || s.phMax == null) return { skip: true };
      iv.push([s.phMin, s.phMax]);
    }
    var intv = intersectIntervals(iv);
    if (!intv) return { gap: true };
    return { ok: true, width: intv.width, lo: intv.lo, hi: intv.hi };
  }

  function severityRank(sev) {
    if (sev === 'high') return 3;
    if (sev === 'elevated') return 2;
    if (sev === 'info') return 1;
    return 0;
  }

  function runRules(volumeL, plantCover, picks, speciesById) {
    var findings = [];
    if (!picks.length) {
      return { findings: [], laneLevel: emptyLanes(), picks: picks };
    }

    var tInt = thermalIntersection(speciesById, picks);
    if (!tInt) {
      findings.push({
        id: 'R_THERMAL_GAP',
        title: T('r_thermal_gap_title'),
        body: T('r_thermal_gap_body'),
        severity: 'high',
        lanes: ['thermal']
      });
    } else if (tInt.width < 2) {
      findings.push({
        id: 'R_THERMAL_NARROW',
        title: T('r_thermal_narrow_title'),
        body: T('r_thermal_narrow_body', { width: tInt.width.toFixed(1) }),
        severity: 'elevated',
        lanes: ['thermal']
      });
    }

    var phInt = phIntersection(speciesById, picks);
    if (!phInt.skip) {
      if (phInt.gap) {
        findings.push({
          id: 'R_PH_GAP',
          title: T('r_ph_gap_title'),
          body: T('r_ph_gap_body'),
          severity: 'high',
          lanes: ['chemistry']
        });
      } else if (phInt.ok && phInt.width < 0.4) {
        findings.push({
          id: 'R_PH_NARROW',
          title: T('r_ph_narrow_title'),
          body: T('r_ph_narrow_body'),
          severity: 'elevated',
          lanes: ['chemistry']
        });
      }
    }

    var anyCold = false;
    var anyNonCold = false;
    for (var c = 0; c < picks.length; c++) {
      var sp = speciesById[picks[c].id];
      if (!sp) continue;
      if (hasTag(sp, 'coldwater')) anyCold = true;
      else anyNonCold = true;
    }
    if (anyCold && anyNonCold) {
      findings.push({
        id: 'R_COLDWARM_MIX',
        title: T('r_coldwarm_mix_title'),
        body: T('r_coldwarm_mix_body'),
        severity: 'high',
        lanes: ['thermal']
      });
    }

    var bioload = 0;
    var distinct = {};
    for (var b = 0; b < picks.length; b++) {
      var p = picks[b];
      var sb = speciesById[p.id];
      if (!sb) continue;
      distinct[p.id] = true;
      bioload += (sb.bioloadUnits || 0) * (p.count || 0);
    }
    var nSpecies = Object.keys(distinct).length;
    if (bioload > volumeL * BIoload_HIGH) {
      findings.push({
        id: 'R_BIoload_HIGH',
        title: T('r_bioload_high_title'),
        body: T('r_bioload_high_body', { volumeL: volumeL }),
        severity: 'high',
        lanes: ['space']
      });
    } else if (bioload > volumeL * BIoload_COEFF) {
      findings.push({
        id: 'R_BIoload_PROXY',
        title: T('r_bioload_proxy_title'),
        body: T('r_bioload_proxy_body'),
        severity: 'elevated',
        lanes: ['space']
      });
    }

    var aggressiveCichlid = false;
    var mbunaPresent = false;
    for (var k = 0; k < picks.length; k++) {
      var sk = speciesById[picks[k].id];
      if (!sk) continue;
      if (hasTag(sk, 'cichlid_aggressive') || hasTag(sk, 'mbuna')) aggressiveCichlid = true;
      if (hasTag(sk, 'mbuna')) mbunaPresent = true;
    }
    if (volumeL < SMALL_TANK_L && (nSpecies > 3 || aggressiveCichlid)) {
      findings.push({
        id: 'R_SMALL_TANK',
        title: T('r_small_tank_title'),
        body: T('r_small_tank_body', { smallTankL: SMALL_TANK_L }),
        severity: 'elevated',
        lanes: ['space']
      });
    }

    if (mbunaPresent) {
      for (var m = 0; m < picks.length; m++) {
        if (picks[m].id !== 'mbuna_generic') {
          findings.push({
            id: 'R_MBUNA_COMMUNITY',
            title: T('r_mbuna_community_title'),
            body: T('r_mbuna_community_body'),
            severity: 'high',
            lanes: ['social', 'space']
          });
          break;
        }
      }
    }

    for (var pi = 0; pi < picks.length; pi++) {
      for (var pj = 0; pj < picks.length; pj++) {
        if (pi === pj) continue;
        var a = speciesById[picks[pi].id];
        var bb = speciesById[picks[pj].id];
        if (!a || !bb) continue;
        if ((a.mouthPredatorLevel || 0) < 2) continue;
        if ((bb.bodyMmAdult || 999) > 45) continue;
        if (hasTag(bb, 'snail')) continue;
        var sev = (a.mouthPredatorLevel >= 3 && bb.bodyMmAdult <= 30) ? 'high' : 'elevated';
        findings.push({
          id: 'R_PREDATION_' + a.id + '_' + bb.id,
          title: T('r_predation_title'),
          body: T('r_predation_body', { predatorName: a.displayName, preyName: bb.displayName }),
          severity: sev,
          lanes: ['predation']
        });
      }
    }

    var shrimpLike = false;
    for (var sh = 0; sh < picks.length; sh++) {
      var shr = speciesById[picks[sh].id];
      if (!shr) continue;
      if (isInvert(shr) && !hasTag(shr, 'snail') && (shr.bodyMmAdult || 999) <= 55) {
        shrimpLike = true;
        break;
      }
    }
    if (shrimpLike) {
      var risky = false;
      var riskyHigh = false;
      for (var f = 0; f < picks.length; f++) {
        var sf = speciesById[picks[f].id];
        if (!sf || isInvert(sf)) continue;
        if (hasTag(sf, 'cichlid_aggressive') || hasTag(sf, 'mbuna')) riskyHigh = true;
        if ((sf.mouthPredatorLevel || 0) >= 2) riskyHigh = true;
        if ((sf.mouthPredatorLevel || 0) >= 1 || sf.finNipper) risky = true;
      }
      if (riskyHigh) {
        findings.push({
          id: 'R_SHRIMP_RISK',
          title: T('r_shrimp_risk_high_title'),
          body: T('r_shrimp_risk_high_body'),
          severity: 'high',
          lanes: ['inverts']
        });
      } else if (risky) {
        findings.push({
          id: 'R_SHRIMP_RISK',
          title: T('r_shrimp_risk_mod_title'),
          body: T('r_shrimp_risk_mod_body'),
          severity: 'elevated',
          lanes: ['inverts']
        });
      }
    }

    var nipperIds = [];
    var longFinIds = [];
    for (var n = 0; n < picks.length; n++) {
      var sn = speciesById[picks[n].id];
      if (!sn) continue;
      if (sn.finNipper) nipperIds.push(picks[n].id);
      if (hasTag(sn, 'long_finned') || hasTag(sn, 'labyrinth')) longFinIds.push(picks[n].id);
    }
    var finNipperConflict = nipperIds.some(function (nid) {
      return longFinIds.some(function (lid) { return lid !== nid; });
    });
    if (finNipperConflict) {
      findings.push({
        id: 'R_FIN_NIPPER',
        title: T('r_fin_nipper_title'),
        body: T('r_fin_nipper_body'),
        severity: 'elevated',
        lanes: ['social']
      });
    }

    var tigerCount = 0;
    for (var t = 0; t < picks.length; t++) {
      if (picks[t].id === 'tiger_barb') tigerCount += picks[t].count || 0;
    }
    if (tigerCount > 0 && tigerCount < TIGER_MIN_SCHOOL) {
      findings.push({
        id: 'R_TIGER_SCHOOL',
        title: T('r_tiger_school_title'),
        body: T('r_tiger_school_body', { tigerMinSchool: TIGER_MIN_SCHOOL }),
        severity: 'elevated',
        lanes: ['social']
      });
    }

    for (var sc = 0; sc < picks.length; sc++) {
      var ssp = speciesById[picks[sc].id];
      if (!ssp || ssp.schoolingMin == null) continue;
      if ((picks[sc].count || 0) < ssp.schoolingMin) {
        findings.push({
          id: 'R_SCHOOLING_' + picks[sc].id,
          title: T('r_schooling_title', { name: ssp.displayName }),
          body: T('r_schooling_body', { schoolingMin: ssp.schoolingMin }),
          severity: 'elevated',
          lanes: ['social']
        });
      }
    }

    var bettaMale = picks.some(function (x) { return x.id === 'betta_male'; });
    var bettaMaleCount = 0;
    for (var bm = 0; bm < picks.length; bm++) {
      if (picks[bm].id === 'betta_male') bettaMaleCount += picks[bm].count || 0;
    }
    if (bettaMaleCount > 1) {
      findings.push({
        id: 'R_BETTA_MALE_MULTI',
        title: T('r_betta_male_multi_title'),
        body: T('r_betta_male_multi_body'),
        severity: 'high',
        lanes: ['social']
      });
    }
    if (bettaMale) {
      var fast = picks.some(function (x) {
        var sx = speciesById[x.id];
        return sx && (x.id === 'zebra_danio' || x.id === 'tiger_barb' || hasTag(sx, 'fast_swimmer'));
      });
      if (fast) {
        findings.push({
          id: 'R_BETTA_MALE_FLOW',
          title: T('r_betta_male_flow_title'),
          body: T('r_betta_male_flow_body'),
          severity: 'elevated',
          lanes: ['social']
        });
      }
      var gourami = picks.some(function (x) {
        if (x.id === 'betta_male') return false;
        var sx2 = speciesById[x.id];
        return sx2 && hasTag(sx2, 'labyrinth');
      });
      if (gourami) {
        findings.push({
          id: 'R_BETTA_MALE_GOURAMI',
          title: T('r_betta_male_gourami_title'),
          body: T('r_betta_male_gourami_body'),
          severity: 'elevated',
          lanes: ['social']
        });
      }
    }

    if (tInt && tInt.lo < 26) {
      var warmSpecial = picks.some(function (x) {
        var wx = speciesById[x.id];
        return wx && (hasTag(wx, 'warm_specialist') || x.id === 'discus');
      });
      if (warmSpecial) {
        findings.push({
          id: 'R_GBR_HEAT',
          title: T('r_gbr_heat_title'),
          body: T('r_gbr_heat_body'),
          severity: 'elevated',
          lanes: ['thermal']
        });
      }
    }

    var discusHere = picks.some(function (x) { return x.id === 'discus'; });
    if (discusHere) {
      var clash = picks.some(function (x) {
        return x.id === 'goldfish' || x.id === 'zebra_danio' || x.id === 'tiger_barb' || x.id === 'mbuna_generic' || x.id === 'molly';
      });
      if (clash) {
        findings.push({
          id: 'R_DISCUS_COMPLEX',
          title: T('r_discus_complex_title'),
          body: T('r_discus_complex_body'),
          severity: 'elevated',
          lanes: ['chemistry', 'social']
        });
      }
    }

    // R_SNAIL_LOACH: snails with snail-eating or aggressive species
    var snailPresent = false;
    var mysterySnailPresent = false;
    for (var sl = 0; sl < picks.length; sl++) {
      var slS = speciesById[picks[sl].id];
      if (slS && hasTag(slS, 'snail') && isInvert(slS)) {
        snailPresent = true;
        if (picks[sl].id === 'mystery_snail') mysterySnailPresent = true;
      }
    }
    if (snailPresent) {
      for (var sl2 = 0; sl2 < picks.length; sl2++) {
        var slF = speciesById[picks[sl2].id];
        if (!slF || hasTag(slF, 'snail')) continue;
        if (hasTag(slF, 'snail_eater')) {
          var snailSev = (slF.mouthPredatorLevel || 0) > 0 ? 'elevated' : 'info';
          findings.push({
            id: 'R_SNAIL_LOACH',
            title: snailSev === 'elevated' ? T('r_snail_loach_hunter_title') : T('r_snail_loach_maybe_title'),
            body: snailSev === 'elevated'
              ? T('r_snail_loach_hunter_body', { name: slF.displayName })
              : T('r_snail_loach_maybe_body', { name: slF.displayName }),
            severity: snailSev,
            lanes: ['inverts']
          });
          break;
        }
      }
      if (mysterySnailPresent) {
        for (var sl3 = 0; sl3 < picks.length; sl3++) {
          var slA = speciesById[picks[sl3].id];
          if (slA && (hasTag(slA, 'cichlid_aggressive') || hasTag(slA, 'mbuna'))) {
            findings.push({
              id: 'R_SNAIL_LOACH_CICHLID',
              title: T('r_snail_loach_cichlid_title'),
              body: T('r_snail_loach_cichlid_body'),
              severity: 'elevated',
              lanes: ['inverts']
            });
            break;
          }
        }
      }
    }

    // R_INVERT_ASSASSIN: assassin snail with small soft-bodied inverts
    var assassinPresent = picks.some(function (x) { return x.id === 'assassin_snail'; });
    if (assassinPresent) {
      for (var ai = 0; ai < picks.length; ai++) {
        var aiS = speciesById[picks[ai].id];
        if (!aiS || picks[ai].id === 'assassin_snail') continue;
        if (isInvert(aiS) && !hasTag(aiS, 'snail')) {
          findings.push({
            id: 'R_INVERT_ASSASSIN',
            title: T('r_invert_assassin_title'),
            body: T('r_invert_assassin_body'),
            severity: 'elevated',
            lanes: ['inverts']
          });
          break;
        }
      }
    }

    // R_ZONE_BENTHIC_CROWD: multiple heavy benthic/bottom species in a small tank
    var benthicSpp = [];
    for (var zb = 0; zb < picks.length; zb++) {
      var zbS = speciesById[picks[zb].id];
      if (zbS && (zbS.zone === 'benthic' || zbS.zone === 'bottom') && (zbS.bioloadUnits || 0) >= 2) {
        benthicSpp.push(zbS.displayName);
      }
    }
    if (benthicSpp.length >= 2 && volumeL < SMALL_TANK_L) {
      findings.push({
        id: 'R_ZONE_BENTHIC_CROWD',
        title: T('r_zone_benthic_crowd_title'),
        body: T('r_zone_benthic_crowd_body', { names: benthicSpp.join(', '), smallTankL: SMALL_TANK_L }),
        severity: 'elevated',
        lanes: ['space', 'social']
      });
    }

    dedupeFindings(findings);
    var laneLevel = aggregateLanes(findings);
    findings.sort(function (a, b) {
      return severityRank(b.severity) - severityRank(a.severity) || a.title.localeCompare(b.title);
    });
    return { findings: findings, laneLevel: laneLevel, picks: picks };
  }

  function dedupeFindings(findings) {
    var seen = {};
    for (var i = findings.length - 1; i >= 0; i--) {
      var id = findings[i].id;
      if (id.indexOf('R_PREDATION_') === 0) continue;
      if (seen[id]) findings.splice(i, 1);
      else seen[id] = true;
    }
    var predSeen = {};
    for (var j = findings.length - 1; j >= 0; j--) {
      if (findings[j].id.indexOf('R_PREDATION_') !== 0) continue;
      var key = findings[j].severity + findings[j].body;
      if (predSeen[key]) findings.splice(j, 1);
      else predSeen[key] = true;
    }
  }

  function aggregateLanes(findings) {
    var out = emptyLanes();
    for (var i = 0; i < findings.length; i++) {
      var f = findings[i];
      if (f.severity === 'info') continue;
      var w = severityRank(f.severity);
      var lanes = f.lanes || [];
      for (var L = 0; L < lanes.length; L++) {
        var lane = lanes[L];
        if (out[lane] != null && w > out[lane]) out[lane] = w;
      }
    }
    return out;
  }

  function emptyLanes() {
    var o = {};
    for (var i = 0; i < LANES.length; i++) o[LANES[i]] = 0;
    return o;
  }

  function laneLabel(score) {
    if (score >= 3) return 'high';
    if (score >= 2) return 'elevated';
    return 'low';
  }

  function init() {
    var root = document.getElementById('csl-root');
    if (!root) return;

    var volumeEl = document.getElementById('csl-volume');
    var volumeVal = document.getElementById('csl-volume-val');
    var searchEl = document.getElementById('csl-search');
    var addBtn = document.getElementById('csl-add');
    var chipsEl = document.getElementById('csl-chips');
    var lanesEl = document.getElementById('csl-lanes');
    var findingsEl = document.getElementById('csl-findings');
    var checklistEl = document.getElementById('csl-checklist');
    var statusEl = document.getElementById('csl-status');
    var canvasEl = document.getElementById('csl-canvas');
    var cctx = canvasEl && canvasEl.getContext('2d');

    var speciesList = [];
    var speciesById = {};
    var picks = [];
    var lastLaneLevel = emptyLanes();

    function setStatus(msg, err) {
      if (!statusEl) return;
      statusEl.textContent = msg || '';
      statusEl.style.color = err ? 'rgba(220,120,100,.9)' : 'var(--th-ink-3)';
    }

    function totalIndividuals() {
      var t = 0;
      for (var i = 0; i < picks.length; i++) t += picks[i].count || 0;
      return t;
    }

    function renderChips() {
      chipsEl.innerHTML = '';
      if (!picks.length) {
        chipsEl.innerHTML = '<p class="csl-empty">' + escapeHtml(T('empty_chips')) + '</p>';
        return;
      }
      for (var i = 0; i < picks.length; i++) {
        (function (idx) {
          var p = picks[idx];
          var s = speciesById[p.id];
          var row = document.createElement('div');
          row.className = 'csl-chip';
          var sciLine = s.scientificName
            ? '<em class="csl-chip-sci">' + escapeHtml(s.scientificName) + '</em>'
            : '';
          var noteLine = s.citationNote
            ? '<span class="csl-chip-note">' + escapeHtml(citationNoteFor(s.id)) + '</span>'
            : '';
          var srcLine = (s.sources && s.sources.length)
            ? '<span class="csl-chip-sources">' +
                s.sources.map(function (url) {
                  var domain = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
                  return '<a class="csl-chip-src-link" href="' + escapeHtml(url) +
                    '" target="_blank" rel="noopener noreferrer">' + escapeHtml(domain) + ' ↗</a>';
                }).join(' · ') +
              '</span>'
            : '';
          row.innerHTML =
            '<span class="csl-chip-name">' + escapeHtml(s.displayName) + sciLine + '</span>' +
            noteLine + srcLine +
            '<span class="csl-chip-ctl">' +
            '<button type="button" class="csl-count-btn" data-act="minus" aria-label="' + escapeHtml(T('decrease_count_aria')) + '">−</button>' +
            '<span class="csl-count">' + p.count + '</span>' +
            '<button type="button" class="csl-count-btn" data-act="plus" aria-label="' + escapeHtml(T('increase_count_aria')) + '">+</button>' +
            '</span>' +
            '<button type="button" class="csl-remove" data-act="remove" aria-label="' + escapeHtml(T('remove_aria', { name: s.displayName })) + '">×</button>';
          row.querySelector('[data-act="minus"]').addEventListener('click', function () {
            if (picks[idx].count > 1) picks[idx].count--;
            else picks.splice(idx, 1);
            refresh();
          });
          row.querySelector('[data-act="plus"]').addEventListener('click', function () {
            if (totalIndividuals() >= MAX_INDIVIDUALS) return;
            picks[idx].count++;
            refresh();
          });
          row.querySelector('[data-act="remove"]').addEventListener('click', function () {
            picks.splice(idx, 1);
            refresh();
          });
          chipsEl.appendChild(row);
        })(i);
      }
    }

    function escapeHtml(t) {
      return String(t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /* ── Visual cockpit — population map ─────────────────────────────────
       Generic markers (not per-species art), same canvas language as
       Tank Builder's #tank-zone / Tank Simulator's fish canvas. Redrawn
       whenever refresh() runs, plus on resize and theme change. */
    function vcLight() {
      var d = document.documentElement.getAttribute('data-theme');
      if (d === 'light') return true;
      if (d === 'dark') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    function sizeCanvas() {
      if (!canvasEl) return;
      var box = canvasEl.parentElement;
      if (!box) return;
      canvasEl.width = box.clientWidth;
      canvasEl.height = box.clientHeight;
    }

    function rrPath(x, y, w, h, r) {
      r = r || 6;
      cctx.beginPath();
      cctx.moveTo(x + r, y);
      cctx.lineTo(x + w - r, y);
      cctx.arcTo(x + w, y, x + w, y + r, r);
      cctx.lineTo(x + w, y + h - r);
      cctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      cctx.lineTo(x + r, y + h);
      cctx.arcTo(x, y + h, x, y + h - r, r);
      cctx.lineTo(x, y + r);
      cctx.arcTo(x, y, x + r, y, r);
      cctx.closePath();
    }

    // Deterministic pseudo-random 0..1 from a string seed, so markers
    // stay put across redraws (theme toggle, volume change) instead of
    // reshuffling every time. Seeds here differ only by a trailing index
    // (e.g. "neon_tetra_0" vs "neon_tetra_1"), and a plain polynomial
    // string hash leaves that last-char difference nearly unmixed in the
    // low-order output digits — the avalanche finalizer below (Wang/
    // murmur-style xorshift-multiply) spreads it properly.
    function seededRand(seed) {
      var h = 0;
      for (var i = 0; i < seed.length; i++) {
        h = (h << 5) - h + seed.charCodeAt(i);
        h |= 0;
      }
      h ^= h >>> 16;
      h = Math.imul(h, 0x45d9f3b);
      h ^= h >>> 16;
      h = Math.imul(h, 0x45d9f3b);
      h ^= h >>> 16;
      return (Math.abs(h) % 1000) / 1000;
    }

    function zoneBand(zone) {
      if (zone === 'surface') return [0.12, 0.32];
      if (zone === 'mid') return [0.38, 0.62];
      return [0.7, 0.88]; // bottom, benthic
    }

    function drawFishMarker(x, y, w, h, col, facingLeft) {
      cctx.save();
      cctx.fillStyle = col;
      cctx.beginPath();
      cctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
      cctx.fill();
      var tx = facingLeft ? x + w : x - w;
      cctx.beginPath();
      if (facingLeft) {
        cctx.moveTo(x + w * .6, y);
        cctx.lineTo(tx + w * .7, y - h * 1.1);
        cctx.lineTo(tx + w * .7, y + h * 1.1);
      } else {
        cctx.moveTo(x - w * .6, y);
        cctx.lineTo(tx - w * .7, y - h * 1.1);
        cctx.lineTo(tx - w * .7, y + h * 1.1);
      }
      cctx.closePath();
      cctx.globalAlpha = .82;
      cctx.fill();
      cctx.restore();
    }

    function drawInvertMarker(x, y, r, col) {
      cctx.save();
      cctx.fillStyle = col;
      cctx.beginPath();
      cctx.moveTo(x, y - r);
      cctx.lineTo(x + r, y);
      cctx.lineTo(x, y + r);
      cctx.lineTo(x - r, y);
      cctx.closePath();
      cctx.fill();
      cctx.restore();
    }

    function drawVisual(volumeL, laneLevel) {
      if (!canvasEl || !cctx) return;
      sizeCanvas();
      var W = canvasEl.width, H = canvasEl.height;
      if (!W || !H) return;
      cctx.clearRect(0, 0, W, H);

      var light = vcLight();
      var pad = 6, tx = pad, ty = pad, tw = W - pad * 2, th = H - pad * 2;

      cctx.save();
      rrPath(tx, ty, tw, th, 10);
      cctx.clip();

      var waterGrad = cctx.createLinearGradient(tx, ty, tx, ty + th);
      if (light) {
        waterGrad.addColorStop(0, 'rgba(150,205,222,.55)');
        waterGrad.addColorStop(1, 'rgba(90,160,188,.68)');
      } else {
        waterGrad.addColorStop(0, 'rgba(8,62,95,.7)');
        waterGrad.addColorStop(1, 'rgba(3,20,32,.88)');
      }
      cctx.fillStyle = waterGrad;
      cctx.fillRect(tx, ty, tw, th);

      var sev = 0;
      for (var li = 0; li < LANES.length; li++) sev = Math.max(sev, laneLevel[LANES[li]] || 0);
      if (sev >= 2) {
        cctx.fillStyle = sev >= 3 ? 'rgba(220,90,70,.14)' : 'rgba(210,170,60,.09)';
        cctx.fillRect(tx, ty, tw, th);
      }

      if (!picks.length) {
        cctx.font = '400 ' + (W > 420 ? '12' : '10') + 'px Work Sans,sans-serif';
        cctx.fillStyle = light ? 'rgba(35,36,32,.4)' : 'rgba(235,240,236,.4)';
        cctx.textAlign = 'center';
        cctx.textBaseline = 'middle';
        cctx.fillText(T('canvas_empty'), tx + tw / 2, ty + th / 2);
        cctx.restore();
        return;
      }

      var colFish = light ? 'rgba(50,90,120,.85)' : 'rgba(150,200,225,.88)';
      var colPredator = 'rgba(210,90,70,.88)';
      var colPredatorMid = 'rgba(215,150,60,.88)';
      var colInvert = 'rgba(139,189,210,.9)';

      for (var i = 0; i < picks.length; i++) {
        var p = picks[i];
        var s = speciesById[p.id];
        if (!s) continue;
        var band = zoneBand(s.zone);
        var invert = isInvert(s) || hasTag(s, 'snail');
        var predLvl = s.mouthPredatorLevel || 0;
        var col = invert ? colInvert : predLvl >= 2 ? colPredator : predLvl === 1 ? colPredatorMid : colFish;
        var bodyMm = s.bodyMmAdult || 30;
        var baseW = 4 + Math.min(bodyMm, 250) / 250 * 9;
        var baseH = baseW * .56;
        var shown = Math.min(p.count, 4);
        var lastX = tx, lastY = ty;
        for (var n = 0; n < shown; n++) {
          var rx = seededRand(p.id + '_' + n);
          var ry = seededRand(p.id + '_' + n + '_y');
          var mx = tx + tw * (0.08 + rx * 0.84);
          var my = ty + th * (band[0] + ry * (band[1] - band[0]));
          var facingLeft = seededRand(p.id + '_' + n + '_f') > 0.5;
          if (invert) drawInvertMarker(mx, my, baseW * .55, col);
          else drawFishMarker(mx, my, baseW, baseH, col, facingLeft);
          lastX = mx; lastY = my;
        }
        if (p.count > shown) {
          cctx.font = '600 9px Work Sans,sans-serif';
          cctx.fillStyle = light ? 'rgba(35,36,32,.55)' : 'rgba(235,240,236,.6)';
          cctx.textAlign = 'left';
          cctx.textBaseline = 'alphabetic';
          cctx.fillText('+' + (p.count - shown), lastX + baseW + 3, lastY + 3);
        }
      }

      cctx.font = '500 9px Work Sans,sans-serif';
      cctx.fillStyle = light ? 'rgba(35,36,32,.32)' : 'rgba(235,240,236,.32)';
      cctx.textAlign = 'right';
      cctx.textBaseline = 'alphabetic';
      cctx.fillText(volumeL + 'L', tx + tw - 6, ty + th - 6);

      cctx.restore();
    }

    function redrawVisualOnly() {
      var vol = parseInt(volumeEl.value, 10) || 60;
      drawVisual(vol, lastLaneLevel);
    }

    function refresh() {
      var vol = parseInt(volumeEl.value, 10) || 60;
      volumeVal.textContent = vol + ' L';
      renderChips();
      var result = runRules(vol, 'med', picks, speciesById);
      renderLanes(result.laneLevel);
      renderFindings(result.findings);
      renderChecklist(result.findings);
      lastLaneLevel = result.laneLevel;
      drawVisual(vol, lastLaneLevel);
    }

    function renderLanes(laneLevel) {
      lanesEl.innerHTML = '';
      for (var i = 0; i < LANES.length; i++) {
        var lane = LANES[i];
        var score = laneLevel[lane] || 0;
        var lab = laneLabel(score);
        var row = document.createElement('div');
        row.className = 'csl-lane csl-lane--' + lab;
        row.setAttribute('role', 'group');
        var w = lab === 'low' ? 22 : lab === 'elevated' ? 55 : 92;
        row.innerHTML =
          '<div class="csl-lane-head">' +
          '<span class="csl-lane-name">' + escapeHtml(laneDisplay(lane)) + '</span>' +
          '<span class="csl-lane-lbl">' + escapeHtml(laneLevelDisplay(lab)) + '</span>' +
          '</div>' +
          '<div class="csl-lane-meter">' +
          '<div class="csl-lane-track"><span class="csl-lane-fill" style="width:' + w + '%"></span></div>' +
          '</div>';
        lanesEl.appendChild(row);
      }
    }

    function laneDisplay(key) {
      return {
        thermal: T('lane_thermal'),
        chemistry: T('lane_chemistry'),
        space: T('lane_space'),
        predation: T('lane_predation'),
        social: T('lane_social'),
        inverts: T('lane_inverts')
      }[key] || key;
    }

    function laneLevelDisplay(lab) {
      return {
        high: T('lane_level_high'),
        elevated: T('lane_level_elevated'),
        low: T('lane_level_low')
      }[lab] || lab;
    }

    function renderFindings(findings) {
      findingsEl.innerHTML = '';
      if (!picks.length) {
        findingsEl.innerHTML = '<li class="csl-finding csl-finding--low">' + escapeHtml(T('select_species_for_findings')) + '</li>';
        return;
      }
      if (!findings.length) {
        findingsEl.innerHTML = '<li class="csl-finding csl-finding--low">' + escapeHtml(T('no_findings')) + '</li>';
        return;
      }
      for (var i = 0; i < findings.length; i++) {
        var f = findings[i];
        var li = document.createElement('li');
        li.className = 'csl-finding csl-finding--' + f.severity;
        li.innerHTML = '<strong>' + escapeHtml(f.title) + '</strong><p>' + escapeHtml(f.body) + '</p>';
        findingsEl.appendChild(li);
      }
    }

    function renderChecklist(findings) {
      var staticLines = [
        T('checklist_static_1'),
        T('checklist_static_2'),
        T('checklist_static_3')
      ];
      var extra = [];
      for (var i = 0; i < findings.length; i++) {
        if (findings[i].severity === 'high') {
          extra.push(T('checklist_priority', { title: findings[i].title }));
        }
      }
      checklistEl.innerHTML = staticLines.concat(extra).map(function (line) {
        return '<li>' + escapeHtml(line) + '</li>';
      }).join('');
    }

    function addSpeciesById(id) {
      if (!speciesById[id]) return;
      if (picks.length >= MAX_DISTINCT_SPECIES && !picks.some(function (p) { return p.id === id; })) return;
      if (totalIndividuals() >= MAX_INDIVIDUALS) return;
      var existing = picks.filter(function (p) { return p.id === id; })[0];
      if (existing) {
        if (totalIndividuals() >= MAX_INDIVIDUALS) return;
        existing.count++;
      } else {
        if (picks.length >= MAX_DISTINCT_SPECIES) return;
        picks.push({ id: id, count: 1 });
      }
      refresh();
    }

    function tryAddFromSearch() {
      var q = (searchEl.value || '').trim().toLowerCase();
      if (!q) return;
      var match = null;
      for (var i = 0; i < speciesList.length; i++) {
        var s = speciesList[i];
        if (s.id === q || s.displayName.toLowerCase() === q) {
          match = s;
          break;
        }
        if (s.displayName.toLowerCase().indexOf(q) !== -1 || s.id.indexOf(q) !== -1) {
          match = s;
          break;
        }
      }
      if (match) {
        addSpeciesById(match.id);
        searchEl.value = '';
      } else {
        setStatus(T('no_species_match'), true);
        setTimeout(function () { setStatus(''); }, 2400);
      }
    }

    volumeEl.addEventListener('input', refresh);
    addBtn.addEventListener('click', tryAddFromSearch);
    searchEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        tryAddFromSearch();
      }
    });

    window.addEventListener('resize', redrawVisualOnly);
    if (window.matchMedia) {
      var lightMq = window.matchMedia('(prefers-color-scheme: light)');
      if (lightMq.addEventListener) lightMq.addEventListener('change', redrawVisualOnly);
    }
    new MutationObserver(redrawVisualOnly).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    redrawVisualOnly();

    fetch(root.getAttribute('data-pack') || '/data/community-stress-lab-species-v1.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (pack) {
        speciesList = pack.species || [];
        for (var i = 0; i < speciesList.length; i++) {
          speciesById[speciesList[i].id] = speciesList[i];
        }
        var dl = document.getElementById('csl-species-datalist');
        if (dl) {
          dl.innerHTML = speciesList
            .map(function (s) {
              return '<option value="' + escapeHtml(s.id) + '">' + escapeHtml(s.displayName) + '</option>';
            })
            .join('');
        }
        setStatus('');
        refresh();
      })
      .catch(function () {
        setStatus(T('could_not_load'), true);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
