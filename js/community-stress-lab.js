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
    'status_summary': '{n}/{maxN} species · {m}/{maxM} individuals',
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
    'cn_buenos_aires_tetra': 'Hardy and cold-tolerant, but can be mildly nippy in small groups — keep 6+.',
    'cn_marbled_hatchetfish': 'Surface-only feeder and strong jumper — a gap-free lid is essential.',
    'cn_pencilfish': 'Genus-level stand-in — species vary widely. Hobby consensus ranges.',
    'cn_green_tiger_barb': 'Colour morph of tiger barb, same care and fin-nipping risk — keep 8+ to redirect aggression within the group.',
    'cn_giant_danio': 'Needs open swimming space; occasional fin nipper toward slow tankmates.',
    'cn_pearl_danio': 'Prefers cooler water than most tropical fish — avoid mixing with warm-water species.',
    'cn_galaxy_rasbora': 'Prefers cooler highland water — may need cooling in tropical climates.',
    'cn_fancy_goldfish': 'Round-bodied ornamental strains (ryukin, oranda, ranchu) — more waste-heavy and swim-bladder sensitive than common goldfish; feed sinking food only.',
    'cn_wild_betta_mouthbrooder': 'Wild mouthbrooding betta, shyer and less territorial than pet-shop Betta splendens — keep as a single bonded pair.',
    'cn_betta_coccina': 'Peat swamp specialist needing genuinely soft, acidic blackwater — a general community setup will stress it long-term.',
    'cn_betta_imbellis': 'Distinct wild species from the pet-shop betta — genuinely community-safe, but its fins are still a target for fin-nippers.',
    'cn_betta_macrostoma': 'Cool hillstream species — avoid running above roughly 26°C. More territorial than other wild bettas; house singly or as a bonded pair only.',
    'cn_lyretail_killifish': 'Prefers cooler water than most tropical fish — unsuitable above roughly 24°C. Strong jumper; a gap-free lid is essential.',
    'cn_steelblue_killifish': 'Males are aggressive toward each other and toward females — keep more females than males. Strong jumper; a gap-free lid is essential.',
    'cn_australian_rainbow': 'Active swimmer needing open horizontal space — not suited to small tanks.',
    'cn_turquoise_rainbow': 'Active swimmer needing open horizontal space; runs cooler than the average tropical community tank.',
    'cn_corydoras_generic': 'Genus-level stand-in — species vary widely. Hobby consensus ranges.',
    'cn_pygmy_corydoras': 'Very small-bodied — avoid keeping with predatory tankmates that might see it as food.',
    'cn_dwarf_chain_loach': 'One of the more peaceful, compact loaches — good for community tanks from 60L; captive-bred stock recommended as wild populations are endangered.',
    'cn_weather_loach': 'Grows much larger than often sold (up to 25cm) — cannot tolerate warm tropical temperatures; becomes very active before barometric pressure drops (normal behaviour).',
    'cn_siamese_algae_eater': 'One of the few fish that eats black beard algae — frequently mislabelled in stores; verify the black stripe extends into the tail fin before buying.',
    'cn_flying_fox': 'Territorial with its own species and similar bottom-dwellers — keep only one per tank unless the setup is very large.',
    'cn_dwarf_puffer': 'Same species commonly sold as both "Dwarf Puffer" and "Pea Puffer" — the world\'s smallest pufferfish. Will nip fins of virtually any tankmate; best in a species-only tank. Needs a steady supply of snails to wear down its ever-growing beak.',
    'cn_bumblebee_goby': 'Naturally a brackish-water species — thrives with a little aquarium salt added. Will only accept live or frozen food, not dry food.',
    'cn_african_dwarf_frog': 'Fully aquatic — needs a clear path to the surface to breathe air. Frequently confused with the much larger, predatory African Clawed Frog at pet stores; check for four-clawed webbed front feet before buying.',
    'cn_medaka': 'Exceptionally temperature-tolerant — no heater needed, unlike most other species. Extremely prolific breeder; unmanaged populations can quickly overrun a tank.',
    'cn_oscar': 'Grows to 35cm+ within 12–18 months — most buyers underestimate final size. Produces enormous waste; will eat any tankmate small enough to swallow.',
    'cn_flowerhorn_cichlid': 'Hybrid cichlid bred for extreme aggression — cannot be safely mixed with virtually any other fish; a single-specimen tank is the only practical approach.',
    'cn_frontosa_cichlid': 'Exceptionally long-lived (20+ years) — a serious long-term commitment. Needs very hard, alkaline Lake Tanganyika-style water chemistry; incompatible with soft-water community fish.',
    'cn_peacock_cichlid': 'Requires the same hard, alkaline water as mbuna — incompatible with soft-water community fish. Less aggressive than mbuna cichlids; males may still fight over territory.',
    'cn_severum': 'Large, personable cichlid that will eat or uproot all but the toughest plants. Compatible with other large, similarly-tempered cichlids.',
    'cn_geophagus': 'Constantly sifts substrate for food — needs fine sand, not gravel, and will uproot any plants. One of the gentler South American cichlids, but still not for planted community tanks.',
    'cn_black_ghost_knifefish': 'Extremely sensitive to poor water quality and copper-based medication — any copper treatment is lethal. Nocturnal; needs caves or tubes to shelter during the day. Territorial with its own kind.',
    'cn_elephant_nose_fish': 'Uses a weak electric field for navigation — highly sensitive to electrical interference and to medication/water quality. Nocturnal and shy; needs shelter. Aggressive toward its own kind.',
    'cn_fire_eel': 'Grows very large (up to 100cm) and lives 20+ years — a major long-term commitment. Nocturnal burrower; needs deep sand and hiding places. Will eat any tankmate small enough to swallow, including shrimp.',
    'cn_ropefish': 'Ancient air-breathing fish, active only after lights-out. Genuinely peaceful toward similarly-sized tankmates, but will eat any fish small enough to swallow. Master escape artist — a fully sealed lid is essential.',
    'cn_channa_andrao': 'Obligate air-breathing predator — a secure, gap-free lid is non-negotiable. Smaller and calmer than most snakeheads, but will still eat any tankmate small enough to swallow; keep alone. Ownership is restricted in some countries — verify local regulations.',
    'cn_channa_bleheri': 'Obligate air-breathing predator — a secure, gap-free lid is non-negotiable. Will eat any tankmate small enough to swallow; keep alone. Ownership is restricted in some countries — verify local regulations.',
    'cn_channa_lucius': 'Ambush predator that sits motionless in cover before striking — obligate air-breather, needs a secure, gap-free lid. Will eat any tankmate small enough to swallow; keep alone. Ownership is restricted in some countries — verify local regulations.',
    'cn_channa_maruliodes': 'Grows to 60cm+ and needs an eventual tank of 400L or larger — not a fish to buy expecting it to stay small. Obligate air-breather; a secure, gap-free lid is non-negotiable. Ownership is restricted in some countries — verify local regulations.',
    'cn_channa_pulchra': 'Obligate air-breathing predator — a secure, gap-free lid is non-negotiable. Will eat any tankmate small enough to swallow; keep alone. Ownership is restricted in some countries — verify local regulations.',
    'cn_bamboo_shrimp': 'Filter feeder — cannot compete with fish for food and needs strong current plus target-feeding. Vulnerable during moult; provide hiding places.',
    'cn_sulawesi_shrimp': 'Needs warm, hard, alkaline water — the opposite of Crystal/Bee shrimp. Do not house with Neocaridina or Caridina cantonensis-type shrimp; their requirements are incompatible.',
    'cn_caridina_shrimp': 'Needs RO water remineralised with a caridina-specific mineral mix — any parameter fluctuation causes mass deaths. Incompatible with Neocaridina and with warm-water Sulawesi shrimp.',
    'cn_ghost_shrimp': 'Often sold as feeder shrimp — quality can be poor from some sources. Short-lived but hardy and tolerant of a wide range of conditions.',
    'cn_vampire_shrimp': 'Despite the name, completely harmless — a filter feeder that needs strong current and target-feeding, not live prey. Will hide during moult.',
    'cn_dwarf_orange_crayfish': 'Will catch and eat slow or sleeping small fish, and is not compatible with shrimp — it will eat them. Prefers cooler water than many tropical species.',
    'cn_trumpet_snail': 'Nocturnal burrower that aerates substrate, preventing anaerobic gas pockets in deep substrate. Self-regulating population — can spike in an overfed tank.',
    'cn_ramshorn_snail': 'Hermaphroditic — two snails can reproduce without a male. Self-regulating cleanup crew; harmless to healthy plants but eats dying leaves.',
    'cn_pom_pom_crab': 'Extremely sensitive to water quality fluctuations. Peaceful filter feeder — not compatible with fish that pick at invertebrates.',
    'cn_red_claw_crab': 'Semi-terrestrial — must have land access above the waterline at all times, and will escape through any gap. Will eat small fish and shrimp; brackish conditions are preferred over pure freshwater.',
    'cn_thai_micro_crab': 'Possibly the smallest freshwater crab in the hobby — extremely delicate, and most fish will eat it. Only safe with the smallest peaceful fish or in a shrimp-only setup.',
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
    'status_summary': '{n}/{maxN} spesies · {m}/{maxM} individu',
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
    'cn_buenos_aires_tetra': 'Tangguh dan tahan air dingin, tetapi bisa sedikit menggigit sirip dalam kelompok kecil — pelihara 6+ ekor.',
    'cn_marbled_hatchetfish': 'Pemakan permukaan saja dan perenang lompat yang kuat — tutup akuarium tanpa celah wajib.',
    'cn_pencilfish': 'Pengganti tingkat genus — spesies sangat bervariasi. Rentang konsensus hobi.',
    'cn_green_tiger_barb': 'Varian warna dari tiger barb, perawatan dan risiko menggigit sirip sama — pelihara 8+ ekor untuk mengalihkan agresi dalam kelompok.',
    'cn_giant_danio': 'Butuh ruang berenang terbuka; kadang menggigit sirip teman tangki yang lambat.',
    'cn_pearl_danio': 'Lebih menyukai air yang lebih sejuk dibanding kebanyakan ikan tropis — hindari dicampur dengan spesies air hangat.',
    'cn_galaxy_rasbora': 'Lebih menyukai air sejuk dataran tinggi — mungkin perlu pendinginan di iklim tropis.',
    'cn_fancy_goldfish': 'Galur hias bertubuh bulat (ryukin, oranda, ranchu) — menghasilkan lebih banyak limbah dan lebih sensitif kandung kemih berenang dibanding ikan mas biasa; beri pakan tenggelam saja.',
    'cn_wild_betta_mouthbrooder': 'Betta liar pengeram mulut, lebih pemalu dan kurang teritorial dibanding Betta splendens toko hewan — pelihara sebagai sepasang yang sudah berjodoh.',
    'cn_betta_coccina': 'Spesialis rawa gambut yang butuh air blackwater lunak dan asam sungguhan — akuarium komunitas umum akan membuatnya stres dalam jangka panjang.',
    'cn_betta_imbellis': 'Spesies liar yang berbeda dari betta toko hewan — benar-benar aman untuk komunitas, tetapi siripnya tetap jadi sasaran penggigit sirip.',
    'cn_betta_macrostoma': 'Spesies sungai pegunungan yang sejuk — hindari suhu di atas sekitar 26°C. Lebih teritorial dibanding betta liar lain; pelihara sendiri atau sepasang saja.',
    'cn_lyretail_killifish': 'Lebih menyukai air yang lebih sejuk dibanding kebanyakan ikan tropis — tidak cocok di atas sekitar 24°C. Perenang lompat yang kuat; tutup akuarium tanpa celah wajib.',
    'cn_steelblue_killifish': 'Jantan agresif terhadap sesama jantan maupun betina — pelihara lebih banyak betina daripada jantan. Perenang lompat yang kuat; tutup akuarium tanpa celah wajib.',
    'cn_australian_rainbow': 'Perenang aktif yang butuh ruang berenang terbuka — tidak cocok untuk akuarium kecil.',
    'cn_turquoise_rainbow': 'Perenang aktif yang butuh ruang berenang terbuka; lebih menyukai suhu yang lebih sejuk dibanding akuarium komunitas tropis pada umumnya.',
    'cn_corydoras_generic': 'Pengganti tingkat genus — spesies sangat bervariasi. Rentang konsensus hobi.',
    'cn_pygmy_corydoras': 'Bertubuh sangat kecil — hindari teman tangki predator yang mungkin menganggapnya makanan.',
    'cn_dwarf_chain_loach': 'Salah satu loach yang lebih damai dan berukuran kompak — cocok untuk akuarium komunitas mulai 60L; disarankan pilih hasil ternak akuarium karena populasi liar terancam punah.',
    'cn_weather_loach': 'Tumbuh jauh lebih besar dari yang biasa dijual (hingga 25cm) — tidak tahan suhu tropis yang hangat; menjadi sangat aktif sebelum tekanan udara turun (perilaku normal).',
    'cn_siamese_algae_eater': 'Salah satu dari sedikit ikan yang memakan alga black beard — sering salah label di toko; pastikan garis hitamnya menyambung hingga ke sirip ekor sebelum membeli.',
    'cn_flying_fox': 'Teritorial terhadap sesama spesiesnya dan penghuni dasar akuarium yang serupa — pelihara hanya satu ekor per akuarium kecuali setupnya sangat besar.',
    'cn_dwarf_puffer': 'Spesies yang sama, dijual dengan dua nama umum "Dwarf Puffer" dan "Pea Puffer" — buntal terkecil di dunia. Akan menggigit sirip hampir semua teman tangki; paling baik dipelihara di akuarium spesies tunggal. Butuh pasokan siput tetap untuk mengikis paruhnya yang terus tumbuh.',
    'cn_bumblebee_goby': 'Secara alami spesies air payau — tumbuh lebih baik dengan sedikit garam akuarium. Hanya mau makan pakan hidup atau beku, bukan pakan kering.',
    'cn_african_dwarf_frog': 'Sepenuhnya akuatik — butuh jalur bebas hambatan ke permukaan untuk bernapas. Sering tertukar dengan African Clawed Frog yang jauh lebih besar dan predator di toko hewan; periksa kaki depan berselaput dengan empat cakar sebelum membeli.',
    'cn_medaka': 'Sangat tahan terhadap perubahan suhu — tidak perlu pemanas, berbeda dari kebanyakan spesies lain. Pembiak yang sangat produktif; populasi yang tidak dikendalikan bisa cepat memenuhi akuarium.',
    'cn_oscar': 'Tumbuh hingga 35cm+ dalam 12–18 bulan — kebanyakan pembeli meremehkan ukuran akhirnya. Menghasilkan limbah yang sangat banyak; akan memakan teman tangki apa pun yang cukup kecil untuk ditelan.',
    'cn_flowerhorn_cichlid': 'Cichlid hibrida yang dibiakkan untuk agresivitas ekstrem — tidak bisa dicampur dengan hampir semua ikan lain dengan aman; akuarium spesies tunggal adalah satu-satunya pendekatan yang praktis.',
    'cn_frontosa_cichlid': 'Sangat panjang umur (20+ tahun) — komitmen jangka panjang yang serius. Butuh kimia air sekeras dan sealkali Danau Tanganyika; tidak cocok dengan ikan komunitas air lunak.',
    'cn_peacock_cichlid': 'Butuh air keras dan alkali yang sama seperti mbuna — tidak cocok dengan ikan komunitas air lunak. Lebih kalem dibanding cichlid mbuna; jantan tetap bisa berkelahi memperebutkan wilayah.',
    'cn_severum': 'Cichlid besar yang ramah dan akan memakan atau mencabut hampir semua tanaman kecuali yang paling kuat. Cocok dipelihara dengan cichlid besar lain yang temperamennya serupa.',
    'cn_geophagus': 'Terus-menerus menyaring substrat untuk mencari makanan — butuh pasir halus, bukan kerikil, dan akan mencabut tanaman apa pun. Salah satu cichlid Amerika Selatan yang lebih kalem, tetapi tetap tidak cocok untuk akuarium komunitas bertanaman.',
    'cn_black_ghost_knifefish': 'Sangat sensitif terhadap kualitas air yang buruk dan obat berbasis tembaga — pengobatan tembaga apa pun bersifat mematikan. Aktif malam hari; butuh gua atau pipa untuk berlindung di siang hari. Teritorial terhadap sesama spesiesnya.',
    'cn_elephant_nose_fish': 'Menggunakan medan listrik lemah untuk navigasi — sangat sensitif terhadap gangguan listrik dan obat/kualitas air. Aktif malam hari dan pemalu; butuh tempat berlindung. Agresif terhadap sesama spesiesnya.',
    'cn_fire_eel': 'Tumbuh sangat besar (hingga 100cm) dan hidup 20+ tahun — komitmen jangka panjang yang besar. Penggali nokturnal; butuh pasir dalam dan tempat bersembunyi. Akan memakan teman tangki apa pun yang cukup kecil untuk ditelan, termasuk udang.',
    'cn_ropefish': 'Ikan pernapas udara kuno, aktif hanya setelah lampu dimatikan. Benar-benar damai terhadap teman tangki berukuran serupa, tetapi akan memakan ikan apa pun yang cukup kecil untuk ditelan. Ahli meloloskan diri; tutup akuarium yang benar-benar rapat wajib.',
    'cn_channa_andrao': 'Predator pernapas udara wajib — tutup akuarium yang benar-benar rapat wajib. Lebih kecil dan lebih tenang dibanding kebanyakan snakehead, tetapi tetap akan memakan teman tangki apa pun yang cukup kecil untuk ditelan; pelihara sendiri. Kepemilikan dibatasi di beberapa negara — periksa peraturan setempat.',
    'cn_channa_bleheri': 'Predator pernapas udara wajib — tutup akuarium yang benar-benar rapat wajib. Akan memakan teman tangki apa pun yang cukup kecil untuk ditelan; pelihara sendiri. Kepemilikan dibatasi di beberapa negara — periksa peraturan setempat.',
    'cn_channa_lucius': 'Predator penyergap yang diam tak bergerak di tempat perlindungan sebelum menyerang — pernapas udara wajib, butuh tutup akuarium yang benar-benar rapat. Akan memakan teman tangki apa pun yang cukup kecil untuk ditelan; pelihara sendiri. Kepemilikan dibatasi di beberapa negara — periksa peraturan setempat.',
    'cn_channa_maruliodes': 'Tumbuh hingga 60cm+ dan butuh akuarium 400L atau lebih besar pada akhirnya — bukan ikan untuk dibeli dengan harapan tetap kecil. Pernapas udara wajib; tutup akuarium yang benar-benar rapat wajib. Kepemilikan dibatasi di beberapa negara — periksa peraturan setempat.',
    'cn_channa_pulchra': 'Predator pernapas udara wajib — tutup akuarium yang benar-benar rapat wajib. Akan memakan teman tangki apa pun yang cukup kecil untuk ditelan; pelihara sendiri. Kepemilikan dibatasi di beberapa negara — periksa peraturan setempat.',
    'cn_bamboo_shrimp': 'Pemakan penyaring — tidak bisa bersaing dengan ikan untuk makanan dan butuh arus kuat serta pemberian pakan langsung. Rentan saat berganti kulit; sediakan tempat bersembunyi.',
    'cn_sulawesi_shrimp': 'Butuh air hangat, keras, dan alkali — kebalikan dari udang Crystal/Bee. Jangan dipelihara bersama udang Neocaridina atau tipe Caridina cantonensis; kebutuhan air keduanya tidak cocok.',
    'cn_caridina_shrimp': 'Butuh air RO yang diremineralisasi dengan campuran mineral khusus caridina — fluktuasi parameter apa pun menyebabkan kematian massal. Tidak cocok dengan Neocaridina maupun udang Sulawesi air hangat.',
    'cn_ghost_shrimp': 'Sering dijual sebagai udang pakan — kualitasnya bisa buruk dari sebagian sumber. Berumur pendek tetapi tangguh dan tahan berbagai kondisi.',
    'cn_vampire_shrimp': 'Meski namanya menyeramkan, sepenuhnya tidak berbahaya — pemakan penyaring yang butuh arus kuat dan pemberian pakan langsung, bukan mangsa hidup. Akan bersembunyi saat berganti kulit.',
    'cn_dwarf_orange_crayfish': 'Akan menangkap dan memakan ikan kecil yang lambat atau sedang tidur, dan tidak cocok dengan udang — akan memakannya. Lebih menyukai air yang lebih sejuk dibanding kebanyakan spesies tropis.',
    'cn_trumpet_snail': 'Penggali nokturnal yang mengaerasi substrat, mencegah kantong gas anaerobik di substrat dalam. Populasi mengatur diri sendiri — bisa melonjak di akuarium yang terlalu banyak diberi makan.',
    'cn_ramshorn_snail': 'Hermafrodit — dua siput bisa berkembang biak tanpa jantan. Kru pembersih yang mengatur diri sendiri; tidak berbahaya bagi tanaman sehat tetapi memakan daun yang sekarat.',
    'cn_pom_pom_crab': 'Sangat sensitif terhadap fluktuasi kualitas air. Pemakan penyaring yang damai — tidak cocok dengan ikan yang suka mematuk invertebrata.',
    'cn_red_claw_crab': 'Semi-terestrial — harus selalu punya akses ke daratan di atas permukaan air, dan akan kabur lewat celah apa pun. Akan memakan ikan kecil dan udang; kondisi payau lebih disukai dibanding air tawar murni.',
    'cn_thai_micro_crab': 'Mungkin kepiting air tawar terkecil dalam hobi ini — sangat rapuh, dan kebanyakan ikan akan memakannya. Hanya aman dengan ikan damai terkecil atau di akuarium khusus udang.',
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
    'status_summary': '{n}/{maxN}種・{m}/{maxM}匹',
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
    'cn_buenos_aires_tetra': '丈夫で低水温にも耐えるが、小さな群れではヒレをかじることがある。6匹以上で飼育。',
    'cn_marbled_hatchetfish': '水面でのみ採餌し、跳躍力が強い。隙間のない蓋が必須。',
    'cn_pencilfish': '属レベルの代表種 — 種によって差が大きい。アクアリウムで一般に共有されている範囲。',
    'cn_green_tiger_barb': 'タイガーバルブの色彩変異個体。飼育方法とヒレかじりのリスクは同じ — 群れ内の攻撃性を分散させるため8匹以上で飼育。',
    'cn_giant_danio': '広い遊泳スペースが必要。動きの遅い同居魚のヒレをかじることがある。',
    'cn_pearl_danio': '一般的な熱帯魚より低めの水温を好む — 温水を好む種との混泳は避ける。',
    'cn_galaxy_rasbora': '高地の冷涼な水を好む — 熱帯気候では冷却が必要な場合がある。',
    'cn_fancy_goldfish': '丸みを帯びた観賞用品種（琉金、オランダ獅子頭、蘭鋳など）— 普通の金魚より排泄物が多く、浮き袋のトラブルにも弱い。沈下性の餌のみを与える。',
    'cn_wild_betta_mouthbrooder': '野生のマウスブルーダー系ベタ。ペットショップのベタ・スプレンデンスより臆病で縄張り意識も弱い — ペア1組で飼育する。',
    'cn_betta_coccina': '軟らかく酸性のブラックウォーターを本当に必要とする泥炭湿地の専門種 — 一般的なコミュニティ水槽では長期的にストレスを受ける。',
    'cn_betta_imbellis': 'ペットショップのベタとは別の野生種 — 本当にコミュニティ向きだが、ヒレはヒレかじり魚の標的になりやすい。',
    'cn_betta_macrostoma': '冷涼な渓流に生息する種 — 26℃前後を超えないようにする。他の野生ベタより縄張り意識が強い。単独か、ペア1組のみで飼育する。',
    'cn_lyretail_killifish': '一般的な熱帯魚より低めの水温を好む — 24℃前後を超えると適さない。跳躍力が強いため、隙間のない蓋が必須。',
    'cn_steelblue_killifish': 'オス同士、またオスからメスへの攻撃性がある — メスをオスより多く飼育する。跳躍力が強いため、隙間のない蓋が必須。',
    'cn_australian_rainbow': '広い遊泳スペースを必要とする活発な遊泳魚 — 小型水槽には適さない。',
    'cn_turquoise_rainbow': '広い遊泳スペースを必要とする活発な遊泳魚。一般的な熱帯コミュニティ水槽より低めの水温を好む。',
    'cn_corydoras_generic': '属レベルの代表種 — 種によって差が大きい。アクアリウムで一般に共有されている範囲。',
    'cn_pygmy_corydoras': '非常に小さい体格 — 捕食性のある同居魚とは避ける。',
    'cn_dwarf_chain_loach': '比較的おとなしくコンパクトなドジョウの仲間 — 60L以上のコミュニティ水槽に向く。野生個体群は絶滅の危機にあるため、繁殖個体の入手が推奨される。',
    'cn_weather_loach': '販売時より大きく成長する（最大25cm）— 暖かい熱帯水温には耐えられない。低気圧が近づく前に活発になることがある（正常な行動）。',
    'cn_siamese_algae_eater': '黒ひげ苔を食べる数少ない魚の一種 — 店舗で誤ったラベルが付けられやすい。購入前に黒いラインが尾びれまで続いているか確認すること。',
    'cn_flying_fox': '同種や似た底棲魚に対して縄張り意識が強い — 非常に大きな水槽でない限り、1匹のみで飼育する。',
    'cn_dwarf_puffer': '「ドワーフパファー」と「ピーパファー」という2つの通称で販売される同一種 — 世界最小のフグ。ほぼすべての同居魚のヒレをかじるため、単独種水槽での飼育が最適。伸び続けるくちばしを削るため、貝類を継続的に与える必要がある。',
    'cn_bumblebee_goby': '本来は汽水性の種 — 少量のアクアリウム用塩を加えるとよく育つ。生餌または冷凍餌しか食べず、乾燥飼料は口にしない。',
    'cn_african_dwarf_frog': '完全水生 — 呼吸のため水面までの障害のない経路が必要。ペットショップではより大型で捕食性のあるアフリカツメガエルとよく混同される。購入前に前足に4本の爪と水かきがあるか確認すること。',
    'cn_medaka': '極めて温度耐性が高く、他のほとんどの種と違ってヒーター不要。非常に繁殖力が強く、管理しないと個体数が水槽内で増えすぎることがある。',
    'cn_oscar': '12〜18か月で35cm以上に成長する — 購入者の多くが最終サイズを見誤る。排泄物が非常に多く、飲み込めるサイズの同居魚は捕食する。',
    'cn_flowerhorn_cichlid': '極端な攻撃性を持つよう作出されたハイブリッドシクリッド — ほぼどんな魚とも安全に混泳できない。単独飼育用の水槽が唯一現実的な方法。',
    'cn_frontosa_cichlid': '非常に長寿（20年以上）— 長期的な責任を伴う。タンガニイカ湖のような硬水・アルカリ性の水質が必要で、軟水を好むコミュニティ魚とは相性が悪い。',
    'cn_peacock_cichlid': 'ムブナと同じ硬水・アルカリ性の水質が必要 — 軟水を好むコミュニティ魚とは相性が悪い。ムブナ系シクリッドより攻撃性は低いが、オス同士は縄張り争いをすることがある。',
    'cn_severum': '人懐っこい大型シクリッド。特に丈夫な種類を除くほとんどの水草を食べるか引き抜いてしまう。気質の似た他の大型シクリッドとの飼育に向く。',
    'cn_geophagus': '常に底砂をふるって餌を探す — 砂利ではなく細かい砂が必要で、水草は引き抜かれてしまう。南米シクリッドの中では比較的おとなしいが、水草のあるコミュニティ水槽には不向き。',
    'cn_black_ghost_knifefish': '水質悪化や銅系薬剤に非常に敏感 — 銅を含む治療は致命的。夜行性で、日中隠れるための洞窟やパイプが必要。同種に対して縄張り意識が強い。',
    'cn_elephant_nose_fish': '弱い電場を使って移動する — 電気的なノイズや薬剤・水質に非常に敏感。夜行性で臆病なため隠れ家が必要。同種に対して攻撃的。',
    'cn_fire_eel': '非常に大きく成長し（最大100cm）、20年以上生きる — 大きな長期的責任を伴う。夜行性で穴を掘る習性があり、深い砂と隠れ場所が必要。エビを含め、飲み込めるサイズの同居魚は捕食する。',
    'cn_ropefish': '消灯後のみ活動する原始的な空気呼吸魚。同程度の大きさの同居魚には本当に穏やかだが、飲み込めるサイズの魚は捕食する。脱走の名人 — 隙間のない蓋が必須。',
    'cn_channa_andrao': '空気呼吸が必須の捕食魚 — 隙間のない蓋が絶対に必要。他のチャンナ類より小型でおとなしいが、飲み込めるサイズの同居魚は捕食する。単独飼育。飼育が制限されている国もあるため、事前に現地の規制を確認すること。',
    'cn_channa_bleheri': '空気呼吸が必須の捕食魚 — 隙間のない蓋が絶対に必要。飲み込めるサイズの同居魚は捕食する。単独飼育。飼育が制限されている国もあるため、事前に現地の規制を確認すること。',
    'cn_channa_lucius': '物陰でじっと動かず待ち伏せてから襲う捕食魚 — 空気呼吸が必須で、隙間のない蓋が必要。飲み込めるサイズの同居魚は捕食する。単独飼育。飼育が制限されている国もあるため、事前に現地の規制を確認すること。',
    'cn_channa_maruliodes': '最終的に60cm以上に成長し、400L以上の水槽が必要 — 「小さいまま」を期待して購入する魚ではない。空気呼吸が必須で、隙間のない蓋が絶対に必要。飼育が制限されている国もあるため、事前に現地の規制を確認すること。',
    'cn_channa_pulchra': '空気呼吸が必須の捕食魚 — 隙間のない蓋が絶対に必要。飲み込めるサイズの同居魚は捕食する。単独飼育。飼育が制限されている国もあるため、事前に現地の規制を確認すること。',
    'cn_bamboo_shrimp': 'ろ過摂食者 — 魚と餌を奪い合えないため、強い水流とピンポイントでの給餌が必要。脱皮中は無防備なので隠れ家を用意すること。',
    'cn_sulawesi_shrimp': '温かく硬度が高いアルカリ性の水を必要とする — クリスタル/ビーシュリンプとは正反対の条件。ネオカリダリナ種やカリダリナ・カントネンシス系のエビとは水質要求が合わないため同居させないこと。',
    'cn_caridina_shrimp': 'カリダリナ専用のミネラルで再ミネラル化したRO水が必要 — 水質のわずかな変動でも大量死につながる。ネオカリダリナや温水性のスラウェシシュリンプとは相性が悪い。',
    'cn_ghost_shrimp': '餌用エビとして販売されることが多く、入手元によって質にばらつきがある。寿命は短いが丈夫で幅広い環境に耐える。',
    'cn_vampire_shrimp': '名前とは裏腹に完全に無害 — 強い水流とピンポイントでの給餌が必要なろ過摂食者で、生き餌は不要。脱皮中は隠れる。',
    'cn_dwarf_orange_crayfish': '動きの遅い、または眠っている小型魚を捕まえて食べることがあり、エビとの相性も悪い — エビを食べてしまう。一般的な熱帯種より低めの水温を好む。',
    'cn_trumpet_snail': '夜行性で底砂を掘り返し、深い底砂内で嫌気性ガスが溜まるのを防ぐ。個体数は自然に調整されるが、餌の与えすぎがある水槽では急増することがある。',
    'cn_ramshorn_snail': '雌雄同体 — 2匹いればオスなしで繁殖できる。個体数が自然に調整される掃除役。健康な水草には無害だが、枯れかけた葉は食べる。',
    'cn_pom_pom_crab': '水質の変動に非常に敏感。おとなしいろ過摂食者 — 無脊椎動物をつつく習性のある魚とは相性が悪い。',
    'cn_red_claw_crab': '半陸生 — 常に水面より上の陸地へのアクセスが必要で、隙間があれば脱走する。小型魚やエビを食べる。純淡水より汽水環境が望ましい。',
    'cn_thai_micro_crab': 'おそらくこの趣味で最も小さい淡水ガニ — 非常に繊細で、ほとんどの魚に食べられてしまう。最も小さくおとなしい魚、またはエビ専用水槽でのみ安全に飼育できる。',
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
    rosy_barb: 'rosy_barb',
    buenos_aires_tetra: 'buenos_aires_tetra',
    marbled_hatchetfish: 'marbled_hatchetfish',
    pencilfish: 'pencilfish',
    green_tiger_barb: 'green_tiger_barb',
    giant_danio: 'giant_danio',
    pearl_danio: 'pearl_danio',
    galaxy_rasbora: 'galaxy_rasbora',
    fancy_goldfish: 'fancy_goldfish',
    betta_albimarginata: 'wild_betta_mouthbrooder',
    betta_channoides: 'wild_betta_mouthbrooder',
    betta_coccina: 'betta_coccina',
    betta_imbellis: 'betta_imbellis',
    betta_macrostoma: 'betta_macrostoma',
    lyretail_killifish: 'lyretail_killifish',
    steelblue_killifish: 'steelblue_killifish',
    australian_rainbow: 'australian_rainbow',
    turquoise_rainbow: 'turquoise_rainbow',
    corydoras: 'corydoras_generic',
    pygmy_corydoras: 'pygmy_corydoras',
    dwarf_chain_loach: 'dwarf_chain_loach',
    weather_loach: 'weather_loach',
    siamese_algae_eater: 'siamese_algae_eater',
    flying_fox: 'flying_fox',
    dwarf_puffer: 'dwarf_puffer',
    bumblebee_goby: 'bumblebee_goby',
    african_dwarf_frog: 'african_dwarf_frog',
    medaka: 'medaka',
    oscar: 'oscar',
    flowerhorn_cichlid: 'flowerhorn_cichlid',
    frontosa_cichlid: 'frontosa_cichlid',
    peacock_cichlid: 'peacock_cichlid',
    severum: 'severum',
    geophagus: 'geophagus',
    black_ghost_knifefish: 'black_ghost_knifefish',
    elephant_nose_fish: 'elephant_nose_fish',
    fire_eel: 'fire_eel',
    ropefish: 'ropefish',
    channa_andrao: 'channa_andrao',
    channa_bleheri: 'channa_bleheri',
    channa_lucius: 'channa_lucius',
    channa_maruliodes: 'channa_maruliodes',
    channa_pulchra: 'channa_pulchra',
    bamboo_shrimp: 'bamboo_shrimp',
    caridina_dennerli: 'sulawesi_shrimp',
    caridina_shrimp: 'caridina_shrimp',
    caridina_spongicola: 'sulawesi_shrimp',
    caridina_glaubrechti: 'sulawesi_shrimp',
    caridina_woltereckae: 'sulawesi_shrimp',
    ghost_shrimp: 'ghost_shrimp',
    vampire_shrimp: 'vampire_shrimp',
    dwarf_orange_crayfish: 'dwarf_orange_crayfish',
    trumpet_snail: 'trumpet_snail',
    ramshorn_snail: 'ramshorn_snail',
    pom_pom_crab: 'pom_pom_crab',
    red_claw_crab: 'red_claw_crab',
    thai_micro_crab: 'thai_micro_crab'
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
    var checklistSectionEl = document.getElementById('csl-checklist-section');
    var statusEl = document.getElementById('csl-status');
    var canvasEl = document.getElementById('csl-canvas');
    var cctx = canvasEl && canvasEl.getContext('2d');
    var bbStatusEl = document.getElementById('csl-bb-status');
    var resetBtn = document.getElementById('csl-reset');
    var searchResultsEl = document.getElementById('csl-search-results');

    var speciesList = [];
    var speciesById = {};
    var picks = [];
    var lastLaneLevel = emptyLanes();
    var srMatches = [];
    var srActiveIndex = -1;

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

    function renderBottombar() {
      if (!bbStatusEl) return;
      bbStatusEl.textContent = T('status_summary', {
        n: picks.length,
        maxN: MAX_DISTINCT_SPECIES,
        m: totalIndividuals(),
        maxM: MAX_INDIVIDUALS
      });
    }

    function refresh() {
      var vol = parseInt(volumeEl.value, 10) || 60;
      volumeVal.textContent = vol + ' L';
      renderChips();
      var result = runRules(vol, 'med', picks, speciesById);
      renderLanes(result.laneLevel);
      renderFindings(result.findings);
      renderChecklist(result.findings);
      renderBottombar();
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
        // Wrapped in <p> so this empty-state line picks up the same
        // .csl-finding p sizing as a real finding's body text — bare
        // text here fell back to the inherited base font-size and
        // rendered noticeably larger than everything else (user report
        // 2026-08-25, screenshot showing the mismatch).
        findingsEl.innerHTML = '<li class="csl-finding csl-finding--low"><p>' + escapeHtml(T('select_species_for_findings')) + '</p></li>';
        return;
      }
      if (!findings.length) {
        findingsEl.innerHTML = '<li class="csl-finding csl-finding--low"><p>' + escapeHtml(T('no_findings')) + '</p></li>';
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
      // Used to always show 3 generic tips regardless of picks, which
      // sat right below "Findings" and read as if it were analysis
      // specific to the chosen mix when it wasn't (user report
      // 2026-08-25 — "adakah senarainya unik untuk setiap kombinasi?").
      // Now this section only ever holds the genuinely per-combination
      // "Priority" lines, and the whole section hides itself when there
      // are none, rather than displaying an always-on generic list.
      var lines = [];
      for (var i = 0; i < findings.length; i++) {
        if (findings[i].severity === 'high') {
          lines.push(T('checklist_priority', { title: findings[i].title }));
        }
      }
      if (checklistSectionEl) checklistSectionEl.style.display = lines.length ? '' : 'none';
      checklistEl.innerHTML = lines.map(function (line) {
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
        closeSearchResults();
      } else {
        setStatus(T('no_species_match'), true);
        setTimeout(function () { setStatus(''); }, 2400);
      }
    }

    /* ── Species search suggestions — replaces the native <datalist>
       dropdown, which showed the internal species id (option value) as
       the prominent line on Android Chrome (user report 2026-08-25,
       screenshot). This custom list only ever renders displayName/
       scientificName — id is matched against but never shown. */
    function computeSearchMatches(q) {
      q = (q || '').trim().toLowerCase();
      if (!q) return [];
      var starts = [];
      var contains = [];
      for (var i = 0; i < speciesList.length; i++) {
        var s = speciesList[i];
        var name = s.displayName.toLowerCase();
        if (name.indexOf(q) === 0) starts.push(s);
        else if (name.indexOf(q) !== -1 || s.id.indexOf(q) !== -1) contains.push(s);
      }
      return starts.concat(contains).slice(0, 8);
    }

    function closeSearchResults() {
      if (!searchResultsEl) return;
      searchResultsEl.hidden = true;
      searchResultsEl.innerHTML = '';
      srMatches = [];
      srActiveIndex = -1;
      searchEl.setAttribute('aria-expanded', 'false');
      searchEl.removeAttribute('aria-activedescendant');
    }

    function updateActiveDescendant() {
      var items = searchResultsEl.querySelectorAll('.csl-sr-item');
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('csl-sr-active', i === srActiveIndex);
      }
      if (srActiveIndex >= 0 && items[srActiveIndex]) {
        searchEl.setAttribute('aria-activedescendant', items[srActiveIndex].id);
      } else {
        searchEl.removeAttribute('aria-activedescendant');
      }
    }

    function renderSearchResults() {
      if (!searchResultsEl) return;
      var q = searchEl.value;
      if (!q.trim()) {
        closeSearchResults();
        return;
      }
      srMatches = computeSearchMatches(q);
      srActiveIndex = -1;
      if (!srMatches.length) {
        searchResultsEl.innerHTML = '<li class="csl-sr-empty">' + escapeHtml(T('no_species_match')) + '</li>';
      } else {
        searchResultsEl.innerHTML = srMatches.map(function (s, idx) {
          var sci = s.scientificName ? '<span class="csl-sr-sci">' + escapeHtml(s.scientificName) + '</span>' : '';
          return '<li class="csl-sr-item" role="option" id="csl-sr-' + idx + '" data-id="' +
            escapeHtml(s.id) + '"><span class="csl-sr-name">' + escapeHtml(s.displayName) + '</span>' + sci + '</li>';
        }).join('');
      }
      searchResultsEl.hidden = false;
      searchEl.setAttribute('aria-expanded', 'true');
    }

    function selectSearchResult(id) {
      addSpeciesById(id);
      searchEl.value = '';
      closeSearchResults();
      searchEl.focus();
    }

    volumeEl.addEventListener('input', refresh);
    addBtn.addEventListener('click', tryAddFromSearch);
    searchEl.addEventListener('input', renderSearchResults);
    searchEl.addEventListener('focus', function () {
      if (searchEl.value.trim()) renderSearchResults();
    });
    searchEl.addEventListener('blur', function () {
      // Delay so a click on a result (which also blurs the input)
      // still registers before the list is torn down.
      setTimeout(closeSearchResults, 150);
    });
    searchEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && srMatches.length) {
        e.preventDefault();
        srActiveIndex = Math.min(srActiveIndex + 1, srMatches.length - 1);
        updateActiveDescendant();
      } else if (e.key === 'ArrowUp' && srMatches.length) {
        e.preventDefault();
        srActiveIndex = Math.max(srActiveIndex - 1, 0);
        updateActiveDescendant();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (srActiveIndex >= 0 && srMatches[srActiveIndex]) {
          selectSearchResult(srMatches[srActiveIndex].id);
        } else {
          tryAddFromSearch();
        }
      } else if (e.key === 'Escape') {
        closeSearchResults();
      }
    });
    if (searchResultsEl) {
      searchResultsEl.addEventListener('mousedown', function (e) {
        // mousedown (not click) so this fires before the input's blur
        // handler tears the list down.
        var item = e.target.closest('.csl-sr-item[data-id]');
        if (item) selectSearchResult(item.getAttribute('data-id'));
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        picks = [];
        searchEl.value = '';
        setStatus('');
        refresh();
      });
    }

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
    renderBottombar();

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
