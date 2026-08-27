/* ============================================================
   ui-journal.js
   Extracted from js/ui.js (PR #233) — behaviour unchanged.
   Keeper's Log: tanks, entries, streaks, sparklines, inhabitants, gear.
   ============================================================ */

/* ── JOURNAL ── */
(function () {
  var JN_KEY = 'ar_journal';
  var jnHistoryPage = 1;
  var JN_PAGE_SIZE  = 10;
  var STREAK_MILESTONES = [4, 8, 12, 26, 52];
  var jnFilter = { query: '', days: 0, care: [], state: [] };
  var jnFilteredEntries = [];

  var FISH_SPECIES = [
    { common: 'Neon Tetra',          sci: 'Paracheirodon innesi' },
    { common: 'Cardinal Tetra',      sci: 'Paracheirodon axelrodi' },
    { common: 'Guppy',               sci: 'Poecilia reticulata' },
    { common: 'Betta',               sci: 'Betta splendens' },
    { common: 'Goldfish',            sci: 'Carassius auratus' },
    { common: 'Platy',               sci: 'Xiphophorus maculatus' },
    { common: 'Molly',               sci: 'Poecilia sphenops' },
    { common: 'Swordtail',           sci: 'Xiphophorus hellerii' },
    { common: 'Corydoras',           sci: 'Corydoras paleatus' },
    { common: 'Otocinclus',          sci: 'Otocinclus affinis' },
    { common: 'Bristlenose Pleco',   sci: 'Ancistrus cirrhosus' },
    { common: 'Tiger Barb',          sci: 'Puntigrus tetrazona' },
    { common: 'Cherry Barb',         sci: 'Puntius titteya' },
    { common: 'Zebra Danio',         sci: 'Danio rerio' },
    { common: 'Pearl Gourami',       sci: 'Trichopodus leerii' },
    { common: 'Dwarf Gourami',       sci: 'Trichogaster lalius' },
    { common: 'Angelfish',           sci: 'Pterophyllum scalare' },
    { common: 'Discus',              sci: 'Symphysodon aequifasciatus' },
    { common: 'Oscar',               sci: 'Astronotus ocellatus' },
    { common: 'Harlequin Rasbora',   sci: 'Trigonostigma heteromorpha' },
    { common: 'Rummy-nose Tetra',    sci: 'Hemigrammus rhodostomus' },
    { common: 'Black Skirt Tetra',   sci: 'Gymnocorymbus ternetzi' },
    { common: 'White Cloud Minnow',  sci: 'Tanichthys albonubes' },
    { common: 'Kuhli Loach',         sci: 'Pangio kuhlii' },
    { common: 'Clown Loach',         sci: 'Chromobotia macracanthus' },
    { common: 'Yoyo Loach',          sci: 'Botia almorhae' },
    { common: 'Amano Shrimp',        sci: 'Caridina multidentata' },
    { common: 'Cherry Shrimp',       sci: 'Neocaridina davidi' },
    { common: 'Nerite Snail',        sci: 'Neritina natalensis' },
    { common: 'Mystery Snail',       sci: 'Pomacea bridgesii' },
    { common: 'Java Fern',           sci: 'Microsorum pteropus' },
    { common: 'Anubias',             sci: 'Anubias barteri' },
    { common: 'Vallisneria',         sci: 'Vallisneria spiralis' },
    { common: 'Hornwort',            sci: 'Ceratophyllum demersum' },
    { common: 'Clownfish',           sci: 'Amphiprion ocellaris' },
    { common: 'Blue Tang',           sci: 'Paracanthurus hepatus' },
    { common: 'Yellow Tang',         sci: 'Zebrasoma flavescens' },
    { common: 'Royal Gramma',        sci: 'Gramma loreto' },
    { common: 'Damselfish',          sci: 'Chrysiptera parasema' },
    { common: 'Firefish',            sci: 'Nemateleotris magnifica' },
    { common: 'Mandarin Fish',       sci: 'Synchiropus splendidus' },
    { common: 'Foxface',             sci: 'Siganus vulpinus' },
    { common: 'Hawkfish',            sci: 'Oxycirrhites typus' },
    { common: 'Watchman Goby',       sci: 'Cryptocentrus cinctus' },
    { common: 'Blue Lobster',        sci: 'Procambarus alleni' },
    { common: 'Ghost Shrimp',        sci: 'Palaemonetes paludosus' },
    { common: 'Red Crystal Shrimp',  sci: 'Caridina cantonensis' },
    { common: 'Ember Tetra',         sci: 'Hyphessobrycon amandae' },
    { common: 'Chili Rasbora',       sci: 'Boraras brigittae' },
    { common: 'Pygmy Corydoras',     sci: 'Corydoras pygmaeus' },
    { common: 'Endlers Livebearer',  sci: 'Poecilia wingei' },
    { common: 'Celestial Pearl Danio', sci: 'Danio margaritatus' },
    { common: 'Electric Blue Acara', sci: 'Andinoacara pulcher' },
    { common: 'German Blue Ram',     sci: 'Mikrogeophagus ramirezi' },
    { common: 'Bolivian Ram',        sci: 'Mikrogeophagus altispinosus' },
    { common: 'Peacock Cichlid',     sci: 'Aulonocara nyassae' },
    { common: 'African Cichlid',     sci: 'Labidochromis caeruleus' },
    { common: 'Rosy Barb',          sci: 'Pethia conchonius' },
    { common: 'Bleeding Heart Tetra', sci: 'Hyphessobrycon erythrostigma' },
    { common: 'Buenos Aires Tetra',  sci: 'Hyphessobrycon anisitsi' },
    { common: 'Serpae Tetra',        sci: 'Hyphessobrycon eques' },
    { common: 'Flame Tetra',         sci: 'Hyphessobrycon flammeus' },
    { common: 'Glowlight Tetra',     sci: 'Hemigrammus erythrozonus' },
    { common: 'Honey Gourami',       sci: 'Trichogaster chuna' },
    { common: 'Kissing Gourami',     sci: 'Helostoma temminkii' },
    { common: 'Paradise Fish',       sci: 'Macropodus opercularis' }
  ];


  /* ── i18n: runtime UI strings ──────────────────────────────────────────
     Static HTML chrome for the journal is translated separately (see
     scripts/build-homepage-i18n.py + translations/homepage/<lang>.json).
     This table covers the strings THIS FILE generates at runtime (phase
     descriptions, toasts, confirm dialogs, milestone messages, category
     labels) — a different mechanism because there's no HTML template to
     regex-replace here, just JS building strings directly.

     Deliberately OUT of scope (left English on every language): the actual
     `rhMsg` text sent TO Rhyssa (the chat prompt itself, not the button
     that triggers it — translating what reaches the AI backend is a
     product-behaviour change, not a string swap) and any data pulled from
     window.AR_EQ / window.AR_BRAND_INFO (tank-data.js — equipment/brand
     reference data, not UI chrome). Reused label values (phase_label_*,
     state_*, care_*, inh_cat_*) are duplicated here from
     translations/homepage/<lang>.json rather than loaded at runtime — this
     site has no build step / shared JSON loader, so keeping the same
     translated VALUE in both places is the only way to stay consistent;
     if either changes, update both. ── */
  var jnLang = document.documentElement.lang || 'en';
  var JN_STRINGS = {
    en: {
    'phase_establish_note': 'Tank is building its foundation. Biology is still finding rhythm — give it time, avoid big changes.',
    'phase_establish_next': 'Watch for: ammonia and nitrite dropping toward zero over the coming weeks.',
    'phase_stabilise_note': 'The cycle is completing. Parameters are moving in the right direction — maintain routine.',
    'phase_stabilise_next': 'Watch for: consistent zero readings and clearer water.',
    'phase_optimise_note': 'Tank is stable. Focus on rhythm: consistent care, observing behaviour, small refinements.',
    'phase_optimise_next': 'Watch for: how your care rhythm affects livestock behaviour and plant growth.',
    'phase_sustain_note': 'Ecosystem is mature. Your rhythm is aligned. Maintain, observe, resist unnecessary interventions.',
    'phase_sustain_next': 'Watch for: the quiet signs — how your tank feels, not just what it reads.',
    'age_today': 'set up today',
    'age_1day': '1 day old',
    'age_days': '{n} days old',
    'age_1month': '1 month old',
    'age_months': '{n} months old',
    'age_years': '{n} years old',
    'cat_filtration': 'Filtration',
    'cat_environment': 'Lighting & Environment',
    'cat_substrate': 'Substrate',
    'cat_cooling': 'Temperature & Cooling',
    'cat_additions': 'Additions & Monitoring',
    'cat_sterilization': 'Sterilization',
    'cat_circulation': 'Circulation',
    'cat_plants': 'Plants',
    'cat_hardscape': 'Hardscape',
    'ov_empty_title': 'Start your log',
    'ov_empty_desc': 'Set up your first aquarium to begin writing entries, tracking your rhythm, and reading your ARA phase.',
    'ov_empty_btn': 'Set up my aquarium',
    'ov_add_tank': '+ Add aquarium',
    'add_short': 'Add',
    'no_entries_dash': 'No entries yet',
    'entry_singular': 'entry',
    'entry_plural': 'entries',
    'resident_singular': 'resident',
    'resident_plural': 'residents',
    'my_tank_fallback': 'My Tank',
    'tank_fallback': 'tank',
    'open_log_for': 'Open log for {name}',
    'add_aquarium_title': 'Add aquarium',
    'no_residents_yet': 'No residents yet.',
    'past_residents': 'Past residents',
    'resident_fallback': 'Resident',
    'edit_short': 'Edit',
    'remove_aria': 'Remove',
    'rehomed': 'Rehomed',
    'passed': 'Passed',
    'welcome_to_tank': 'Welcome to the tank, {name}.',
    'left_the_tank': '{name} has left the tank. We remember them.',
    'found_new_home': '{name} has found a new home.',
    'based_on_params': 'Based on water parameters',
    'estimated_from_rhythm': 'Estimated from keeper rhythm',
    'no_phase_no_entries': 'Write your first entry, and your ARA phase tracking begins from there.',
    'no_phase_no_setup': 'Add at least one resident and your tank\'s setup date, and you\'ll get your first reading.',
    'no_phase_insufficient': 'A few more entries — or logging water parameters — will give a clearer picture of your ARA phase.',
    'no_phase_default': 'Write your first entry, and your ARA phase reading will follow.',
    'week_this': 'This week',
    'week_last': 'Last week',
    'week_2ago': '2w ago',
    'week_3ago': '3w ago',
    'week_4ago': '4w ago',
    'week_5ago': '5w ago',
    'week_6ago': '6w ago',
    'week_7ago': '7w ago',
    'entry_logged': ': entry logged',
    'no_entry': ': no entry',
    'streak_1week': '1-week streak',
    'streak_nweek': '{n}-week streak',
    'milestone_4': 'Four weeks in rhythm.',
    'milestone_8': 'Eight weeks — your tank knows you.',
    'milestone_12': 'Twelve weeks. That\'s real consistency.',
    'milestone_26': 'Half a year of keeping. Remarkable.',
    'milestone_52': 'One full year. Your rhythm is the tank\'s rhythm.',
    'milestone_fallback': '{n}-week streak.',
    'no_charts_yet': 'Log parameters in a few more entries, and trends will start to show here.',
    'ask_rhyssa_trends': 'Ask Rhyssa about these trends',
    'updated_prefix': 'Updated {date}',
    'brand_model_default': 'Brand / model…',
    'brand_model_custom': '✎ Enter own brand / model…',
    'brand_model_placeholder': 'e.g. Eheim 2213, Fluval 307…',
    'entry_modal_title_new': 'Today\'s entry',
    'entry_modal_title_edit': 'Edit entry',
    'inhabitant_modal_title_new': 'Add resident',
    'inhabitant_modal_title_edit': 'Edit resident',
    'inhabitant_submit_new': 'Add to tank',
    'inhabitant_submit_edit': 'Save changes',
    'edit_entry_aria': 'Edit entry',
    'discuss_rhyssa_aria': 'Discuss with Rhyssa',
    'ctx_prompt_establish': 'Watch for cloudy water, unusual behaviour, or ammonia smell.',
    'ctx_prompt_stabilise': 'Are your parameters moving in the right direction this week?',
    'ctx_prompt_optimise': 'Notice any changes in plant growth, fish behaviour, or water clarity?',
    'ctx_prompt_sustain': 'Your ecosystem is mature — what quiet signs are you reading today?',
    'ctx_last_water_change': 'Last water change: {n} days ago.',
    'entry_default_prompt': 'What did you notice today?',
    'preview_cat_default': 'Choose a size or brand below',
    'alert_ammonia_elevated': 'Ammonia elevated in last test ({val} mg/L)',
    'alert_nitrate_high': 'Nitrate high at {val} mg/L — water change recommended',
    'alert_no_entry_days': 'No entry in {n} days — how\'s the tank doing?',
    'alert_water_change_days': 'Last water change: {n} days ago',
    'ask_rhyssa_btn': 'Ask Rhyssa',
    'entry_removed_toast': 'Entry removed.',
    'resident_updated_toast': 'Resident updated.',
    'resident_removed_toast': '{name} removed from the log.',
    'confirm_delete_tank_named': 'Delete {name} and all its data? This cannot be undone.',
    'confirm_delete_all_data': 'Delete all log data? This cannot be undone.',
    'confirm_delete_this_tank': 'Delete this tank and all its entries? This cannot be undone.',
    'confirm_delete_entry': 'Delete this entry? This cannot be undone.',
    'confirm_remove_resident': 'Remove {name} from the log?',
    'confirm_remove_resident_entirely': 'Remove {name} from the log entirely?',
    'this_tank_fallback': 'this tank',
    'this_resident_fallback': 'this resident',
    'auto_tank_name': 'My {vol} {unit} Tank',
    'phase_label_establish': 'Establishing',
    'phase_label_stabilise': 'Stabilising',
    'phase_label_optimise': 'Optimising',
    'phase_label_sustain': 'Sustaining',
    'state_consistent': 'Consistent',
    'state_catching-up': 'Catching up',
    'state_occasional': 'Occasional',
    'state_just-starting': 'Just starting',
    'care_water_change': 'Water change',
    'care_filter': 'Filter',
    'care_feeding': 'Feeding',
    'care_top_up': 'Topping up',
    'care_treatment': 'Treatment',
    'care_dosing': 'Dosing',
    'care_media': 'Media change',
    'care_trimming': 'Trimming',
    'care_nothing': 'Just observed',
    'inh_cat_fish': 'Fish',
    'inh_cat_plant': 'Plant',
    'inh_cat_invertebrate': 'Invertebrate',
    'inh_cat_coral': 'Coral',
    'inh_cat_other': 'Other'
    },
    id: {
    'phase_establish_note': 'Akuarium sedang membangun fondasinya. Biologinya masih mencari ritme — beri waktu, hindari perubahan besar.',
    'phase_establish_next': 'Perhatikan: kadar amonia dan nitrit menurun menuju nol dalam beberapa minggu ke depan.',
    'phase_stabilise_note': 'Siklus hampir selesai. Parameter bergerak ke arah yang tepat — pertahankan rutinitas.',
    'phase_stabilise_next': 'Perhatikan: bacaan nol yang konsisten dan air yang lebih jernih.',
    'phase_optimise_note': 'Akuarium sudah stabil. Fokus pada ritme: perawatan konsisten, mengamati perilaku, penyempurnaan kecil.',
    'phase_optimise_next': 'Perhatikan: bagaimana ritme perawatan Anda memengaruhi perilaku penghuni dan pertumbuhan tanaman.',
    'phase_sustain_note': 'Ekosistem sudah matang. Ritme Anda sudah selaras. Pertahankan, amati, hindari intervensi yang tidak perlu.',
    'phase_sustain_next': 'Perhatikan: tanda-tanda halus — bagaimana akuarium Anda terasa, bukan sekadar apa yang terbaca.',
    'age_today': 'disiapkan hari ini',
    'age_1day': '1 hari',
    'age_days': '{n} hari',
    'age_1month': '1 bulan',
    'age_months': '{n} bulan',
    'age_years': '{n} tahun',
    'cat_filtration': 'Filtrasi',
    'cat_environment': 'Pencahayaan & Lingkungan',
    'cat_substrate': 'Substrat',
    'cat_cooling': 'Suhu & Pendinginan',
    'cat_additions': 'Tambahan & Pemantauan',
    'cat_sterilization': 'Sterilisasi',
    'cat_circulation': 'Sirkulasi Air',
    'cat_plants': 'Tanaman',
    'cat_hardscape': 'Hardscape',
    'ov_empty_title': 'Mulai log Anda',
    'ov_empty_desc': 'Siapkan akuarium pertama Anda untuk mulai menulis entri, melacak ritme Anda, dan membaca fase ARA Anda.',
    'ov_empty_btn': 'Siapkan akuarium saya',
    'ov_add_tank': '+ Tambah akuarium',
    'add_short': 'Tambah',
    'no_entries_dash': 'Belum ada entri',
    'entry_singular': 'entri',
    'entry_plural': 'entri',
    'resident_singular': 'penghuni',
    'resident_plural': 'penghuni',
    'my_tank_fallback': 'Akuarium Saya',
    'tank_fallback': 'akuarium',
    'open_log_for': 'Buka log untuk {name}',
    'add_aquarium_title': 'Tambah akuarium',
    'no_residents_yet': 'Belum ada penghuni.',
    'past_residents': 'Penghuni sebelumnya',
    'resident_fallback': 'Penghuni',
    'edit_short': 'Edit',
    'remove_aria': 'Hapus',
    'rehomed': 'Dipindahkan',
    'passed': 'Meninggal',
    'welcome_to_tank': 'Selamat datang di akuarium, {name}.',
    'left_the_tank': '{name} telah meninggalkan akuarium. Kami mengenangnya.',
    'found_new_home': '{name} telah menemukan rumah baru.',
    'based_on_params': 'Berdasarkan parameter air',
    'estimated_from_rhythm': 'Diperkirakan dari ritme penjaga',
    'no_phase_no_entries': 'Tulis entri pertama Anda, dan pelacakan fase ARA mulai dari situ.',
    'no_phase_no_setup': 'Tambahkan setidaknya satu penghuni dan tanggal penyiapan akuarium Anda, dan Anda akan mendapat bacaan pertama.',
    'no_phase_insufficient': 'Beberapa entri lagi — atau mencatat parameter air — akan memberi gambaran fase ARA yang lebih jelas.',
    'no_phase_default': 'Tulis entri pertama Anda, dan bacaan fase ARA akan menyusul.',
    'week_this': 'Minggu ini',
    'week_last': 'Minggu lalu',
    'week_2ago': '2mgg lalu',
    'week_3ago': '3mgg lalu',
    'week_4ago': '4mgg lalu',
    'week_5ago': '5mgg lalu',
    'week_6ago': '6mgg lalu',
    'week_7ago': '7mgg lalu',
    'entry_logged': ': entri dicatat',
    'no_entry': ': tidak ada entri',
    'streak_1week': 'Rentetan 1 minggu',
    'streak_nweek': 'Rentetan {n} minggu',
    'milestone_4': 'Empat minggu dalam ritme.',
    'milestone_8': 'Delapan minggu — akuarium Anda mengenal Anda.',
    'milestone_12': 'Dua belas minggu. Itu konsistensi sejati.',
    'milestone_26': 'Setengah tahun memelihara. Luar biasa.',
    'milestone_52': 'Satu tahun penuh. Ritme Anda adalah ritme akuarium.',
    'milestone_fallback': 'Rentetan {n} minggu.',
    'no_charts_yet': 'Catat parameter di beberapa entri lagi, dan tren akan mulai terlihat di sini.',
    'ask_rhyssa_trends': 'Tanya Rhyssa tentang tren ini',
    'updated_prefix': 'Diperbarui {date}',
    'brand_model_default': 'Merek / model…',
    'brand_model_custom': '✎ Masukkan merek / model sendiri…',
    'brand_model_placeholder': 'misalnya Eheim 2213, Fluval 307…',
    'entry_modal_title_new': 'Entri hari ini',
    'entry_modal_title_edit': 'Edit entri',
    'inhabitant_modal_title_new': 'Tambah penghuni',
    'inhabitant_modal_title_edit': 'Edit penghuni',
    'inhabitant_submit_new': 'Tambahkan ke akuarium',
    'inhabitant_submit_edit': 'Simpan perubahan',
    'edit_entry_aria': 'Edit entri',
    'discuss_rhyssa_aria': 'Diskusikan dengan Rhyssa',
    'ctx_prompt_establish': 'Perhatikan air keruh, perilaku tidak biasa, atau bau amonia.',
    'ctx_prompt_stabilise': 'Apakah parameter Anda bergerak ke arah yang benar minggu ini?',
    'ctx_prompt_optimise': 'Memperhatikan perubahan pada pertumbuhan tanaman, perilaku ikan, atau kejernihan air?',
    'ctx_prompt_sustain': 'Ekosistem Anda sudah matang — tanda-tanda tenang apa yang Anda baca hari ini?',
    'ctx_last_water_change': 'Penggantian air terakhir: {n} hari yang lalu.',
    'entry_default_prompt': 'Apa yang Anda perhatikan hari ini?',
    'preview_cat_default': 'Pilih ukuran atau merek di bawah',
    'alert_ammonia_elevated': 'Amonia meningkat pada tes terakhir ({val} mg/L)',
    'alert_nitrate_high': 'Nitrat tinggi di {val} mg/L — penggantian air disarankan',
    'alert_no_entry_days': 'Tidak ada entri selama {n} hari — bagaimana kondisi akuarium?',
    'alert_water_change_days': 'Penggantian air terakhir: {n} hari yang lalu',
    'ask_rhyssa_btn': 'Tanya Rhyssa',
    'entry_removed_toast': 'Entri dihapus.',
    'resident_updated_toast': 'Penghuni diperbarui.',
    'resident_removed_toast': '{name} dihapus dari log.',
    'confirm_delete_tank_named': 'Hapus {name} beserta semua datanya? Tindakan ini tidak dapat dibatalkan.',
    'confirm_delete_all_data': 'Hapus semua data log? Tindakan ini tidak dapat dibatalkan.',
    'confirm_delete_this_tank': 'Hapus akuarium ini beserta semua entrinya? Tindakan ini tidak dapat dibatalkan.',
    'confirm_delete_entry': 'Hapus entri ini? Tindakan ini tidak dapat dibatalkan.',
    'confirm_remove_resident': 'Hapus {name} dari log?',
    'confirm_remove_resident_entirely': 'Hapus {name} dari log sepenuhnya?',
    'this_tank_fallback': 'akuarium ini',
    'this_resident_fallback': 'penghuni ini',
    'auto_tank_name': 'Akuarium {vol} {unit} Saya',
    'phase_label_establish': 'Merintis',
    'phase_label_stabilise': 'Menstabilkan',
    'phase_label_optimise': 'Mengoptimalkan',
    'phase_label_sustain': 'Mempertahankan',
    'state_consistent': 'Konsisten',
    'state_catching-up': 'Mengejar ketinggalan',
    'state_occasional': 'Sesekali',
    'state_just-starting': 'Baru mulai',
    'care_water_change': 'Ganti air',
    'care_filter': 'Filter',
    'care_feeding': 'Pemberian pakan',
    'care_top_up': 'Tambah air',
    'care_treatment': 'Pengobatan',
    'care_dosing': 'Dosis',
    'care_media': 'Ganti media',
    'care_trimming': 'Pangkas',
    'care_nothing': 'Hanya mengamati',
    'inh_cat_fish': 'Ikan',
    'inh_cat_plant': 'Tanaman',
    'inh_cat_invertebrate': 'Invertebrata',
    'inh_cat_coral': 'Karang',
    'inh_cat_other': 'Lainnya'
    },
    ja: {
    'phase_establish_note': '水槽は基盤を築いている段階です。生物学的な部分はまだリズムを探しています。時間を与え、大きな変化は避けましょう。',
    'phase_establish_next': '注目ポイント：今後数週間でアンモニアと亜硝酸塩がゼロに近づいていくこと。',
    'phase_stabilise_note': 'サイクルが完了に近づいています。パラメーターは正しい方向に向かっています。いつものルーティンを続けましょう。',
    'phase_stabilise_next': '注目ポイント：安定してゼロを示す数値と、より澄んだ水。',
    'phase_optimise_note': '水槽は安定しています。リズムに集中しましょう：一貫したケア、行動の観察、小さな微調整。',
    'phase_optimise_next': '注目ポイント：あなたのケアのリズムが、生体の行動や水草の成長にどう影響しているか。',
    'phase_sustain_note': '生態系は成熟しています。あなたのリズムは合っています。維持し、観察し、不要な介入は控えましょう。',
    'phase_sustain_next': '注目ポイント：静かなサイン。数値だけでなく、水槽がどう感じられるか。',
    'age_today': '本日セットアップ',
    'age_1day': '1日経過',
    'age_days': '{n}日経過',
    'age_1month': '1か月経過',
    'age_months': '{n}か月経過',
    'age_years': '{n}年経過',
    'cat_filtration': 'ろ過',
    'cat_environment': '照明・環境',
    'cat_substrate': '底床',
    'cat_cooling': '水温・冷却',
    'cat_additions': '添加剤・計測',
    'cat_sterilization': '殺菌',
    'cat_circulation': '水流',
    'cat_plants': '水草',
    'cat_hardscape': 'ハードスケープ',
    'ov_empty_title': 'ログを始めましょう',
    'ov_empty_desc': '最初の水槽をセットアップして、記録を書き始め、リズムを記録し、ARAフェーズを確認しましょう。',
    'ov_empty_btn': '水槽をセットアップする',
    'ov_add_tank': '+ 水槽を追加',
    'add_short': '追加',
    'no_entries_dash': 'まだ記録がありません',
    'entry_singular': '記録',
    'entry_plural': '記録',
    'resident_singular': '住人',
    'resident_plural': '住人',
    'my_tank_fallback': 'わたしの水槽',
    'tank_fallback': '水槽',
    'open_log_for': '{name}のログを開く',
    'add_aquarium_title': '水槽を追加',
    'no_residents_yet': 'まだ住人がいません。',
    'past_residents': '過去の住人',
    'resident_fallback': '住人',
    'edit_short': '編集',
    'remove_aria': '削除',
    'rehomed': '譲渡済み',
    'passed': '永眠',
    'welcome_to_tank': '{name}、水槽へようこそ。',
    'left_the_tank': '{name}が水槽を去りました。私たちはずっと忘れません。',
    'found_new_home': '{name}は新しい家を見つけました。',
    'based_on_params': '水質パラメーターに基づく',
    'estimated_from_rhythm': '飼育者のリズムから推定',
    'no_phase_no_entries': '最初の記録を書けば、そこからARAフェーズの追跡が始まります。',
    'no_phase_no_setup': '住人を少なくとも1つ追加し、水槽のセットアップ日を設定すれば、最初の判定が届きます。',
    'no_phase_insufficient': 'もう少し記録を書くか、水質パラメーターを記録しておくと、ARAフェーズの姿がより見えやすくなります。',
    'no_phase_default': '最初の記録を書けば、ARAフェーズの判定はそのあとについてきます。',
    'week_this': '今週',
    'week_last': '先週',
    'week_2ago': '2週間前',
    'week_3ago': '3週間前',
    'week_4ago': '4週間前',
    'week_5ago': '5週間前',
    'week_6ago': '6週間前',
    'week_7ago': '7週間前',
    'entry_logged': '：記録あり',
    'no_entry': '：記録なし',
    'streak_1week': '1週間連続',
    'streak_nweek': '{n}週間連続',
    'milestone_4': '4週間、リズムが続いています。',
    'milestone_8': '8週間。水槽があなたを覚えています。',
    'milestone_12': '12週間。これは本物の一貫性です。',
    'milestone_26': '半年間の飼育。見事です。',
    'milestone_52': 'まる1年。あなたのリズムが、水槽のリズムです。',
    'milestone_fallback': '{n}週間連続。',
    'no_charts_yet': 'あと数回、記録に水質パラメーターを入力しておくと、ここに傾向が見えてきます。',
    'ask_rhyssa_trends': 'この傾向についてRhyssaに聞く',
    'updated_prefix': '{date}に更新',
    'brand_model_default': 'ブランド／モデル…',
    'brand_model_custom': '✎ 独自のブランド／モデルを入力…',
    'brand_model_placeholder': '例：Eheim 2213、Fluval 307…',
    'entry_modal_title_new': '今日の記録',
    'entry_modal_title_edit': '記録を編集',
    'inhabitant_modal_title_new': '住人を追加',
    'inhabitant_modal_title_edit': '住人を編集',
    'inhabitant_submit_new': '水槽に追加',
    'inhabitant_submit_edit': '変更を保存',
    'edit_entry_aria': '記録を編集',
    'discuss_rhyssa_aria': 'Rhyssaと相談する',
    'ctx_prompt_establish': '注目ポイント：水の濁り、いつもと違う行動、アンモニア臭がないか。',
    'ctx_prompt_stabilise': '今週、パラメーターは正しい方向に向かっていますか？',
    'ctx_prompt_optimise': '水草の成長、魚の行動、水の透明度に変化はありましたか？',
    'ctx_prompt_sustain': 'あなたの生態系は成熟しています。今日、どんな静かなサインを読み取っていますか？',
    'ctx_last_water_change': '最後の水換え：{n}日前。',
    'entry_default_prompt': '今日は何に気づきましたか？',
    'preview_cat_default': '下のサイズまたはブランドを選択',
    'alert_ammonia_elevated': '前回の検査でアンモニアが上昇（{val} mg/L）',
    'alert_nitrate_high': '硝酸塩が{val} mg/Lと高い状態です。水換えをおすすめします',
    'alert_no_entry_days': '{n}日間記録がありません。水槽の様子はいかがですか？',
    'alert_water_change_days': '最後の水換え：{n}日前',
    'ask_rhyssa_btn': 'Rhyssaに聞く',
    'entry_removed_toast': '記録を削除しました。',
    'resident_updated_toast': '住人を更新しました。',
    'resident_removed_toast': '{name}をログから削除しました。',
    'confirm_delete_tank_named': '{name}とそのすべてのデータを削除しますか？この操作は取り消せません。',
    'confirm_delete_all_data': 'すべてのログデータを削除しますか？この操作は取り消せません。',
    'confirm_delete_this_tank': 'この水槽とすべての記録を削除しますか？この操作は取り消せません。',
    'confirm_delete_entry': 'この記録を削除しますか？この操作は取り消せません。',
    'confirm_remove_resident': '{name}をログから削除しますか？',
    'confirm_remove_resident_entirely': '{name}をログから完全に削除しますか？',
    'this_tank_fallback': 'この水槽',
    'this_resident_fallback': 'この住人',
    'auto_tank_name': 'わたしの{vol}{unit}水槽',
    'phase_label_establish': 'Establishing',
    'phase_label_stabilise': 'Stabilising',
    'phase_label_optimise': 'Optimising',
    'phase_label_sustain': 'Sustaining',
    'state_consistent': '一定',
    'state_catching-up': '追いつき中',
    'state_occasional': 'たまに',
    'state_just-starting': '始めたばかり',
    'care_water_change': '水換え',
    'care_filter': 'フィルター',
    'care_feeding': '給餌',
    'care_top_up': '足し水',
    'care_treatment': '治療',
    'care_dosing': '添加剤',
    'care_media': 'ろ材交換',
    'care_trimming': 'トリミング',
    'care_nothing': '観察のみ',
    'inh_cat_fish': '魚',
    'inh_cat_plant': '水草',
    'inh_cat_invertebrate': '無脊椎動物',
    'inh_cat_coral': 'サンゴ',
    'inh_cat_other': 'その他'
    }
  };
  function T(key, subs) {
    var s = (JN_STRINGS[jnLang] && JN_STRINGS[jnLang][key]) || JN_STRINGS.en[key] || key;
    if (subs) {
      Object.keys(subs).forEach(function (k) {
        s = s.split('{' + k + '}').join(subs[k]);
      });
    }
    return s;
  }
  var INH_CAT_LABELS = { fish: T('inh_cat_fish'), plant: T('inh_cat_plant'), invertebrate: T('inh_cat_invertebrate'), coral: T('inh_cat_coral'), other: T('inh_cat_other') };

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function migrateData(d) {
    if (d.profile && !d.tanks) {
      var tank = {
        id: 'tank_' + Date.now(),
        profile: d.profile,
        entries: d.entries || [],
        inhabitants: d.inhabitants || []
      };
      d.tanks = [tank];
      d.activeTankId = tank.id;
      delete d.profile; delete d.entries; delete d.inhabitants;
    }
    if (!d.tanks) d.tanks = [];
    if (!d._entryIdsMigrated) {
      d.tanks.forEach(function (tank) {
        (tank.entries || []).forEach(function (e, i) {
          if (!e.id) e.id = 'e_' + (tank.id || 'x') + '_' + i;
        });
      });
      d._entryIdsMigrated = true;
    }
    return d;
  }

  function loadData() {
    try { return migrateData(JSON.parse(localStorage.getItem(JN_KEY)) || {}); } catch (e) { return migrateData({}); }
  }
  function saveData(d) {
    try { localStorage.setItem(JN_KEY, JSON.stringify(d)); } catch (e) {}
  }

  function getActiveTank(d) {
    if (!d.tanks || !d.tanks.length) return null;
    for (var i = 0; i < d.tanks.length; i++) {
      if (d.tanks[i].id === d.activeTankId) return d.tanks[i];
    }
    return d.tanks[0];
  }

  function assessPhaseFromParams(params) {
    if (!params) return null;
    var nh3 = parseFloat(params.nh3);
    var no2 = parseFloat(params.no2);
    var no3 = parseFloat(params.no3);
    if (isNaN(nh3) && isNaN(no2)) return null;
    nh3 = isNaN(nh3) ? 0 : nh3;
    no2 = isNaN(no2) ? 0 : no2;
    no3 = isNaN(no3) ? 999 : no3;
    if (nh3 > 0.5 || no2 > 0.25) return 'establish';
    if (nh3 > 0 || no2 > 0) return 'stabilise';
    if (no3 > 20) return 'stabilise';
    if (no3 > 10) return 'optimise';
    return 'sustain';
  }

  function assessPhaseFromState(keeperState, setupDate) {
    var ageWeeks = 999;
    if (setupDate) {
      var days = Math.floor((new Date() - new Date(setupDate)) / 86400000);
      ageWeeks = days / 7;
    }
    if (keeperState === 'just-starting' || ageWeeks < 4) return 'establish';
    if (keeperState === 'catching-up') return 'stabilise';
    if (keeperState === 'consistent' && ageWeeks > 8) return 'sustain';
    return 'optimise';
  }

  var phaseInfo = {
    establish: {
      label: T('phase_label_establish'),
      note: T('phase_establish_note'),
      next: T('phase_establish_next'),
      color: 'rgba(220,140,60,.9)'
    },
    stabilise: {
      label: T('phase_label_stabilise'),
      note: T('phase_stabilise_note'),
      next: T('phase_stabilise_next'),
      color: 'rgba(200,190,60,.9)'
    },
    optimise: {
      label: T('phase_label_optimise'),
      note: T('phase_optimise_note'),
      next: T('phase_optimise_next'),
      color: 'rgba(61,214,232,.9)'
    },
    sustain: {
      label: T('phase_label_sustain'),
      note: T('phase_sustain_note'),
      next: T('phase_sustain_next'),
      color: 'rgba(100,200,82,.9)'
    }
  };

  function tankAge(dateStr) {
    if (!dateStr) return '';
    var then = new Date(dateStr);
    var now = new Date();
    var days = Math.floor((now - then) / 86400000);
    if (days < 1) return T('age_today');
    if (days === 1) return T('age_1day');
    if (days < 30) return T('age_days', { n: days });
    var months = Math.floor(days / 30);
    if (months === 1) return T('age_1month');
    if (months < 24) return T('age_months', { n: months });
    return T('age_years', { n: Math.floor(months / 12) });
  }

  var keeperStateLabels = { 'consistent': T('state_consistent'), 'catching-up': T('state_catching-up'), 'occasional': T('state_occasional'), 'just-starting': T('state_just-starting') };
  var careLabels = { 'water_change': T('care_water_change'), 'filter': T('care_filter'), 'feeding': T('care_feeding'), 'top_up': T('care_top_up'), 'treatment': T('care_treatment'), 'dosing': T('care_dosing'), 'media': T('care_media'), 'trimming': T('care_trimming'), 'nothing': T('care_nothing') };

  /* ── Tank size data ── */
  var PRESETS = [
    { v:10,  u:'L', s:'rect',   d:[30,20,20],  cat:'Nano'   },
    { v:19,  u:'L', s:'rect',   d:[37,22,26],  cat:'Nano'   },
    { v:30,  u:'L', s:'rect',   d:[45,24,28],  cat:'Nano'   },
    { v:45,  u:'L', s:'rect',   d:[55,28,30],  cat:'Small'  },
    { v:60,  u:'L', s:'rect',   d:[60,30,36],  cat:'Small'  },
    { v:75,  u:'L', s:'rect',   d:[70,35,32],  cat:'Small'  },
    { v:90,  u:'L', s:'rect',   d:[80,35,32],  cat:'Medium' },
    { v:120, u:'L', s:'rect',   d:[80,35,44],  cat:'Medium' },
    { v:150, u:'L', s:'rect',   d:[100,40,38], cat:'Medium' },
    { v:200, u:'L', s:'rect',   d:[100,40,50], cat:'Large'  },
    { v:240, u:'L', s:'rect',   d:[120,45,46], cat:'Large'  },
    { v:300, u:'L', s:'rect',   d:[150,50,40], cat:'XL'     },
  ];

  var BRANDS = {
    fluval:   { label:'Fluval', models:[
      { n:'Flex 9 gal',  v:34,  u:'L', s:'curved', d:[33,21,22] },
      { n:'Flex 15 gal', v:57,  u:'L', s:'curved', d:[41,25,31] },
      { n:'Flex 32 gal', v:121, u:'L', s:'curved', d:[64,38,37] },
      { n:'Spec III',    v:10,  u:'L', s:'rect',   d:[38,22,13] },
      { n:'Spec V',      v:19,  u:'L', s:'rect',   d:[52,19,30] },
      { n:'Evo 13.5g',   v:51,  u:'L', s:'rect',   d:[52,27,34] },
      { n:'Roma 90',     v:90,  u:'L', s:'rect',   d:[80,35,40] },
      { n:'Roma 125',    v:125, u:'L', s:'rect',   d:[80,35,50] },
      { n:'Roma 200',    v:200, u:'L', s:'rect',   d:[100,40,55] },
    ]},
    ada:      { label:'ADA', models:[
      { n:'30C Cube',   v:27,  u:'L', s:'cube', d:[30,30,30] },
      { n:'45P',        v:32,  u:'L', s:'rect', d:[45,27,30] },
      { n:'60P',        v:65,  u:'L', s:'rect', d:[60,30,36] },
      { n:'60F (Low)',  v:54,  u:'L', s:'rect', d:[60,30,30] },
      { n:'90P',        v:182, u:'L', s:'rect', d:[90,45,45] },
      { n:'120P',       v:324, u:'L', s:'rect', d:[120,45,60] },
    ]},
    dennerle: { label:'Dennerle', models:[
      { n:'Nano Cube 10L', v:10, u:'L', s:'cube', d:[20,20,28] },
      { n:'Nano Cube 20L', v:20, u:'L', s:'cube', d:[25,25,35] },
      { n:'Nano Cube 30L', v:30, u:'L', s:'cube', d:[30,30,35] },
      { n:'Nano Cube 60L', v:60, u:'L', s:'rect', d:[40,35,45] },
      { n:"Scaper's 35L",  v:35, u:'L', s:'rect', d:[50,30,30] },
      { n:"Scaper's 55L",  v:55, u:'L', s:'rect', d:[60,35,30] },
    ]},
    waterbox: { label:'Waterbox', models:[
      { n:'Mini 6',  v:23,  u:'L', s:'rect', d:[30,26,38] },
      { n:'AIO 20',  v:76,  u:'L', s:'rect', d:[50,38,50] },
      { n:'AIO 45',  v:170, u:'L', s:'rect', d:[70,46,62] },
    ]},
    biorb:    { label:'biOrb', models:[
      { n:'biOrb 15L',  v:15,  u:'L', s:'sphere', d:[28,28,35] },
      { n:'biOrb 30L',  v:30,  u:'L', s:'sphere', d:[37,37,43] },
      { n:'biOrb 60L',  v:60,  u:'L', s:'sphere', d:[49,49,56] },
      { n:'biOrb 105L', v:105, u:'L', s:'sphere', d:[60,60,70] },
    ]},
    juwel:    { label:'Juwel', models:[
      { n:'Primo 70',   v:70,  u:'L', s:'rect',   d:[61,31,47] },
      { n:'Lido 120',   v:120, u:'L', s:'rect',   d:[61,41,58] },
      { n:'Rio 125',    v:125, u:'L', s:'rect',   d:[81,36,50] },
      { n:'Rio 180',    v:180, u:'L', s:'rect',   d:[101,41,50] },
      { n:'Rio 240',    v:240, u:'L', s:'rect',   d:[121,41,55] },
      { n:'Vision 180', v:180, u:'L', s:'curved', d:[92,41,55] },
    ]},
  };

  var CAT_COLORS = { Nano:'rgba(100,200,82,.7)', Small:'rgba(61,214,232,.7)', Medium:'rgba(100,150,220,.7)', Large:'rgba(200,150,60,.7)', XL:'rgba(200,80,80,.7)' };

  function tankCategory(vol) {
    if (!vol) return '';
    if (vol <= 20) return 'Nano';
    if (vol <= 60) return 'Small';
    if (vol <= 120) return 'Medium';
    if (vol <= 250) return 'Large';
    return 'XL';
  }

  function setHiddenInputs(vol, unit, shape) {
    var g = function (id) { return document.getElementById(id); };
    if (g('mt-inp-volume')) g('mt-inp-volume').value = vol || '';
    if (g('mt-inp-unit'))   g('mt-inp-unit').value   = unit  || 'L';
    if (g('mt-inp-shape'))  g('mt-inp-shape').value  = shape || 'rect';
  }

  function updatePreview(vol, unit, shape, dims) {
    var tankEl = document.getElementById('mt-preview-tank');
    var volEl  = document.getElementById('mt-preview-vol');
    var catEl  = document.getElementById('mt-preview-cat');
    if (!tankEl) return;
    var H = 78;
    var ratio = (dims && dims[0] && dims[2]) ? dims[0] / dims[2] : 1.65;
    ratio = Math.max(0.45, Math.min(3.5, ratio));
    var W, br;
    if (shape === 'sphere') {
      W = H; br = '50%';
    } else if (shape === 'cube') {
      W = H; br = '5px';
    } else if (shape === 'curved') {
      W = Math.round(H * ratio);
      W = Math.max(44, Math.min(210, W));
      br = '12px 12px 4px 4px';
    } else {
      W = Math.round(H * ratio);
      W = Math.max(44, Math.min(210, W));
      br = '3px';
    }
    tankEl.style.width  = W + 'px';
    tankEl.style.height = H + 'px';
    tankEl.style.borderRadius = br;
    if (vol) {
      volEl.textContent = vol + ' ' + (unit || 'L');
      var cat = tankCategory(vol);
      catEl.textContent = cat;
      catEl.style.color = CAT_COLORS[cat] || 'var(--th-ink-4)';
    } else {
      volEl.textContent = '—';
      catEl.textContent = T('preview_cat_default');
      catEl.style.color = '';
    }
  }

  function recalcCustom() {
    var g = function (id) { var el = document.getElementById(id); return el ? parseFloat(el.value) || 0 : 0; };
    var l = g('mt-dim-l'), w = g('mt-dim-w'), h = g('mt-dim-h');
    var activeUnitBtn = document.querySelector('.mt-unit-btn.active');
    var dimUnit = activeUnitBtn ? activeUnitBtn.dataset.dimunit : 'cm';
    var outEl = document.getElementById('mt-dim-vol-out');
    if (l && w && h) {
      var vol, unit;
      if (dimUnit === 'cm') { vol = Math.round(l * w * h / 1000); unit = 'L'; }
      else { vol = Math.round(l * w * h / 231 * 10) / 10; unit = 'gal'; }
      if (outEl) outEl.textContent = vol + ' ' + unit;
      setHiddenInputs(vol, unit, 'rect');
      updatePreview(vol, unit, 'rect', [l, w, h]);
      var nameEl = document.getElementById('mt-inp-name');
      if (nameEl && !nameEl.value) nameEl.value = T('auto_tank_name', { vol: vol, unit: unit });
    } else {
      if (outEl) outEl.textContent = '—';
    }
  }

  function resetSetupModal() {
    document.querySelectorAll('.mt-preset-chip,.mt-brand-btn,.mt-model-chip').forEach(function (c) { c.classList.remove('active'); });
    var modelSel = document.getElementById('mt-model-selector');
    if (modelSel) { modelSel.style.display = 'none'; modelSel.innerHTML = ''; }
    var outEl = document.getElementById('mt-dim-vol-out');
    if (outEl) outEl.textContent = '—';
    ['mt-dim-l', 'mt-dim-w', 'mt-dim-h'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
    updatePreview(null);
  }

  function rhythmWeeks(entries) {
    var now = new Date();
    var result = [false, false, false, false, false, false, false, false];
    (entries || []).forEach(function (e) {
      if (!e.date) return;
      var days = Math.floor((now - new Date(e.date)) / 86400000);
      var week = Math.floor(days / 7);
      if (week >= 0 && week < 8) result[week] = true;
    });
    return result;
  }

  /* ── Tank type SVG icon ── */
  function tankTypeIcon(type, shape) {
    var c = {
      freshwater: 'rgba(61,214,232,.6)',
      planted:    'rgba(100,200,82,.7)',
      marine:     'rgba(61,130,232,.7)',
      brackish:   'rgba(150,180,100,.65)',
      coldwater:  'rgba(160,210,240,.65)',
      paludarium: 'rgba(120,200,120,.65)'
    }[type] || 'rgba(61,214,232,.5)';
    if (type === 'planted') {
      return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="5" width="16" height="11" rx="1.2" stroke="' + c + '" stroke-width="1.2" fill="none"/><line x1="7" y1="16" x2="5" y2="10" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="10" y1="16" x2="10" y2="8" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="13" y1="16" x2="15" y2="10" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/></svg>';
    }
    if (type === 'marine') {
      return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="5" width="16" height="11" rx="1.2" stroke="' + c + '" stroke-width="1.2" fill="none"/><path d="M5 14 Q7 11 9 14 Q11 11 13 14" stroke="' + c + '" stroke-width="1" fill="none" stroke-linecap="round"/></svg>';
    }
    if (type === 'paludarium') {
      return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="5" width="16" height="11" rx="1.2" stroke="' + c + '" stroke-width="1.2" fill="none"/><line x1="2" y1="12" x2="18" y2="12" stroke="' + c + '" stroke-width=".8" opacity=".5"/><line x1="8" y1="12" x2="7" y2="7" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="11" y1="12" x2="12" y2="6" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/></svg>';
    }
    if (shape === 'sphere') {
      return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="' + c + '" stroke-width="1.2" fill="none"/><path d="M4 10 Q10 7.5 16 10" stroke="' + c + '" stroke-width=".8" fill="none" opacity=".5"/></svg>';
    }
    if (shape === 'cube') {
      return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="13" height="13" stroke="' + c + '" stroke-width="1.2" fill="none"/><line x1="3" y1="11" x2="16" y2="11" stroke="' + c + '" stroke-width=".8" opacity=".4"/></svg>';
    }
    return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="5" width="16" height="11" rx="1.2" stroke="' + c + '" stroke-width="1.2" fill="none"/><line x1="2" y1="12" x2="18" y2="12" stroke="' + c + '" stroke-width=".7" opacity=".4"/></svg>';
  }

  /* ── Large tank icons for overview cards ── */
  function tankTypeIconLg(type, shape) {
    var cols = {
      freshwater: 'rgba(61,214,232,.55)',
      planted:    'rgba(100,200,82,.65)',
      marine:     'rgba(61,130,232,.7)',
      brackish:   'rgba(150,180,100,.6)',
      coldwater:  'rgba(160,210,240,.65)',
      paludarium: 'rgba(120,200,120,.65)'
    };
    var c = cols[type] || 'rgba(61,214,232,.45)';
    var fill = 'rgba(61,214,232,.04)';
    if (type === 'planted') {
      return '<svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true" fill="none">'
        + '<rect x="5" y="12" width="44" height="30" rx="2.5" stroke="' + c + '" stroke-width="1.5" fill="rgba(100,200,82,.05)"/>'
        + '<line x1="5" y1="34" x2="49" y2="34" stroke="' + c + '" stroke-width=".8" opacity=".3"/>'
        + '<line x1="17" y1="42" x2="13" y2="26" stroke="' + c + '" stroke-width="1.4" stroke-linecap="round"/>'
        + '<line x1="27" y1="42" x2="27" y2="20" stroke="' + c + '" stroke-width="1.4" stroke-linecap="round"/>'
        + '<line x1="37" y1="42" x2="41" y2="26" stroke="' + c + '" stroke-width="1.4" stroke-linecap="round"/>'
        + '</svg>';
    }
    if (type === 'marine') {
      return '<svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true" fill="none">'
        + '<rect x="5" y="12" width="44" height="30" rx="2.5" stroke="' + c + '" stroke-width="1.5" fill="rgba(61,130,232,.05)"/>'
        + '<path d="M10 36 Q15 28 20 36 Q25 28 30 36 Q35 28 40 36 Q44 30 49 33" stroke="' + c + '" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
        + '<circle cx="20" cy="22" r="3.5" stroke="' + c + '" stroke-width="1" opacity=".6"/>'
        + '<line x1="5" y1="29" x2="49" y2="29" stroke="' + c + '" stroke-width=".8" opacity=".2"/>'
        + '</svg>';
    }
    if (type === 'paludarium') {
      return '<svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true" fill="none">'
        + '<rect x="5" y="12" width="44" height="30" rx="2.5" stroke="' + c + '" stroke-width="1.5" fill="rgba(120,200,120,.05)"/>'
        + '<line x1="5" y1="30" x2="49" y2="30" stroke="' + c + '" stroke-width="1" opacity=".35"/>'
        + '<line x1="17" y1="30" x2="14" y2="20" stroke="' + c + '" stroke-width="1.3" stroke-linecap="round"/>'
        + '<line x1="27" y1="30" x2="27" y2="16" stroke="' + c + '" stroke-width="1.3" stroke-linecap="round"/>'
        + '<line x1="37" y1="30" x2="40" y2="20" stroke="' + c + '" stroke-width="1.3" stroke-linecap="round"/>'
        + '</svg>';
    }
    if (shape === 'sphere') {
      return '<svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true" fill="none">'
        + '<circle cx="27" cy="27" r="22" stroke="' + c + '" stroke-width="1.5" fill="rgba(61,214,232,.04)"/>'
        + '<path d="M8 27 Q27 19 46 27" stroke="' + c + '" stroke-width="1" opacity=".4"/>'
        + '<path d="M8 33 Q27 25 46 33" stroke="' + c + '" stroke-width=".8" opacity=".2"/>'
        + '</svg>';
    }
    if (shape === 'cube') {
      return '<svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true" fill="none">'
        + '<rect x="8" y="8" width="37" height="37" stroke="' + c + '" stroke-width="1.5" fill="rgba(61,214,232,.04)"/>'
        + '<line x1="8" y1="33" x2="45" y2="33" stroke="' + c + '" stroke-width=".8" opacity=".3"/>'
        + '</svg>';
    }
    return '<svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true" fill="none">'
      + '<rect x="5" y="14" width="44" height="28" rx="2.5" stroke="' + c + '" stroke-width="1.5" fill="rgba(61,214,232,.04)"/>'
      + '<line x1="5" y1="32" x2="49" y2="32" stroke="' + c + '" stroke-width="1" opacity=".3"/>'
      + '<ellipse cx="20" cy="25" rx="7" ry="4" fill="' + c + '" opacity=".35"/>'
      + '<path d="M14 25 L10 20.5 L10 29.5 Z" fill="' + c + '" opacity=".3"/>'
      + '</svg>';
  }

  /* ── Journal overview: card list of all tanks ── */
  function renderJournalOverview() {
    var cardsEl = document.getElementById('jn-tank-cards');
    if (!cardsEl) return;
    var d = loadData();
    if (!d.tanks || !d.tanks.length) {
      cardsEl.innerHTML = '<div class="jn-ov-empty">'
        + '<div class="jn-ov-empty-icon" aria-hidden="true">'
        + '<svg width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="5" y="14" width="42" height="27" rx="2.5" stroke="rgba(61,214,232,.28)" stroke-width="1.4"/><line x1="5" y1="32" x2="47" y2="32" stroke="rgba(61,214,232,.14)" stroke-width="1"/><line x1="15" y1="24" x2="37" y2="24" stroke="rgba(61,214,232,.22)" stroke-width="1.2" stroke-linecap="round"/></svg>'
        + '</div>'
        + '<h2 class="jn-ov-empty-title">' + T('ov_empty_title') + '</h2>'
        + '<p class="jn-ov-empty-desc">' + T('ov_empty_desc') + '</p>'
        + '<button class="btn bf" id="jn-ov-setup-open">' + T('ov_empty_btn') + '</button>'
        + '</div>';
      return;
    }
    cardsEl.innerHTML = d.tanks.map(function (t) {
      var p = t.profile || {};
      var entries = t.entries || [];
      var inhs = t.inhabitants || [];
      var lastEntry = entries.length ? entries[entries.length - 1] : null;
      var _activeInhOv = inhs.filter(function (i) { return i.status === 'active'; }).length;
      var _hasParamEnt = entries.some(function (e) { return e.params && (e.params.nh3 || e.params.no2 || e.params.no3); });
      var _sufficient  = _hasParamEnt || (entries.length >= 3 && (!!p.setupDate || _activeInhOv > 0));
      var phase = null;
      if (_sufficient && lastEntry) {
        if (lastEntry.params) phase = assessPhaseFromParams(lastEntry.params);
        if (!phase) phase = assessPhaseFromState(lastEntry.keeperState, p.setupDate);
      }
      var phData = phase ? phaseInfo[phase] : null;
      var age = tankAge(p.setupDate);
      var meta = [(p.volume ? p.volume + ' ' + (p.unit || 'L') : ''), p.type, age].filter(Boolean).join(' · ');
      var icon = tankTypeIconLg(p.type, p.shape);
      var activeInhs = inhs.filter(function (i) { return i.status !== 'passed' && i.status !== 'rehomed'; }).length;
      var entryLabel = entries.length ? entries.length + ' ' + (entries.length === 1 ? T('entry_singular') : T('entry_plural')) : '';
      return '<button class="jn-tank-card" data-tank-id="' + t.id + '" aria-label="' + T('open_log_for', { name: escHtml(p.name || T('tank_fallback')) }) + '">'
        + '<div class="jn-card-icon">' + icon + '</div>'
        + '<div class="jn-card-body">'
        + '<h3 class="jn-card-name">' + (escHtml(p.name) || T('my_tank_fallback')) + '</h3>'
        + '<p class="jn-card-meta">' + meta + '</p>'
        + (phData ? '<span class="jn-card-phase" style="color:' + phData.color + '">' + phData.label + '</span>'
                  : '<span class="jn-card-phase jn-card-phase--empty">' + (entries.length ? '—' : T('no_entries_dash')) + '</span>')
        + (activeInhs || entryLabel
          ? '<span class="jn-card-stats">' + [activeInhs ? activeInhs + ' ' + (activeInhs === 1 ? T('resident_singular') : T('resident_plural')) : '', entryLabel].filter(Boolean).join(' · ') + '</span>'
          : '')
        + '</div>'
        + '<div class="jn-card-arrow" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
        + '</button>';
    }).join('')
    + '<button class="jn-card-add" id="jn-ov-add-tank">' + T('ov_add_tank') + '</button>';
  }

  /* ── Tank selector renderer ── */
  function renderTankSelector(d) {
    var sel = document.getElementById('jn-tank-selector');
    if (!sel) return;
    if (!d.tanks || d.tanks.length <= 1) { sel.style.display = 'none'; return; }
    sel.classList.add('jn-tank-selector');
    sel.style.display = 'flex';
    sel.innerHTML = d.tanks.map(function (t) {
      var active = t.id === d.activeTankId;
      var icon = tankTypeIcon((t.profile || {}).type, (t.profile || {}).shape);
      var name = ((t.profile || {}).name || T('tank_fallback'));
      return '<button class="jn-tank-tab' + (active ? ' active' : '') + '" data-tank-id="' + t.id + '">'
        + '<span class="jn-ttab-icon">' + icon + '</span>'
        + '<span class="jn-ttab-name">' + escHtml(name) + '</span>'
        + '</button>';
    }).join('')
    + '<button class="jn-tank-tab jn-tank-add" id="jn-add-tank" title="' + T('add_aquarium_title') + '">'
    + '<span class="jn-ttab-icon" style="font-size:var(--fs-md-lg);line-height:1;color:var(--th-ink-4)">+</span>'
    + '<span class="jn-ttab-name" style="color:var(--th-ink-5)">' + T('add_short') + '</span>'
    + '</button>';
  }

  /* ── P1: Entry list with pagination ── */
  function renderEntryList(entries, page) {
    var entryList = document.getElementById('jn-entry-list');
    if (!entryList) return;
    if (!entries.length) { entryList.innerHTML = ''; return; }
    var sortAsc  = localStorage.getItem('ar_jn_sort') === 'asc';
    var reversed = sortAsc ? entries.slice() : entries.slice().reverse();
    var shown    = reversed.slice(0, page * JN_PAGE_SIZE);
    var hasMore  = reversed.length > shown.length;
    entryList.innerHTML = shown.map(function (e) {
      var stateLabel = keeperStateLabels[e.keeperState] || '';
      var careStr    = (e.care || []).map(function (c) { return careLabels[c] || c; }).join(', ');
      var paramsStr  = '';
      if (e.params) {
        var parts = [];
        if (e.params.ph)   parts.push('pH ' + e.params.ph);
        if (e.params.nh3)  parts.push('NH₃ ' + e.params.nh3);
        if (e.params.no2)  parts.push('NO₂ ' + e.params.no2);
        if (e.params.no3)  parts.push('NO₃ ' + e.params.no3);
        if (e.params.temp) parts.push(e.params.temp + '°C');
        if (e.params.gh)   parts.push('GH ' + e.params.gh);
        if (e.params.kh)   parts.push('KH ' + e.params.kh);
        if (e.params.sg)   parts.push('SG ' + e.params.sg);
        if (parts.length) paramsStr = parts.join(' · ');
      }
      var rhMsg = encodeURIComponent('On ' + (e.date || 'a recent day') + ' I wrote: "' + (e.observation || '').slice(0, 120) + '". What do you think?');
      var nodeClass = 'tl-entry-node' + (e.keeperState ? ' state-' + e.keeperState : '');
      return '<li class="tl-entry-item">'
        + '<div class="' + nodeClass + '" aria-hidden="true"></div>'
        + '<div class="tl-entry-content">'
        + '<div class="tl-entry-meta">'
        + '<span class="tl-entry-date">' + escHtml(e.date) + '</span>'
        + (stateLabel ? '<span class="tl-entry-state-tag">' + stateLabel + '</span>' : '')
        + '<div class="tl-entry-actions">'
        + (e.id ? '<button class="tl-entry-edit-btn" data-entry-id="' + e.id + '" aria-label="' + T('edit_entry_aria') + '">' + T('edit_short') + '</button>' : '')
        + '<button class="rh-inline-btn tl-entry-rh-btn" data-rh-msg="' + rhMsg + '" aria-label="' + T('discuss_rhyssa_aria') + '"><svg width="10" height="10" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7.5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="11" cy="11" r="3.5" stroke="currentColor" stroke-width="1.6" fill="none" opacity=".55"/><circle cx="11" cy="11" r="1.4" fill="currentColor" opacity=".8"/></svg>Rhyssa</button>'
        + '</div>'
        + '</div>'
        + (e.observation ? '<p class="tl-entry-obs">' + escHtml(e.observation) + '</p>' : '')
        + (careStr ? '<span class="tl-entry-care">' + careStr + '</span>' : '')
        + (e.treatmentNote ? '<span class="tl-entry-treatment">' + escHtml(e.treatmentNote) + '</span>' : '')
        + (paramsStr ? '<span class="tl-entry-params">' + paramsStr + '</span>' : '')
        + '</div>'
        + '</li>';
    }).join('');
    var moreEl = document.getElementById('jn-load-more');
    if (moreEl) moreEl.style.display = hasMore ? '' : 'none';
  }

  /* ── P2: Streak calculation + milestone toast ── */
  function calcStreak(entries) {
    if (!entries || !entries.length) return 0;
    var now = new Date();
    var weekSet = {};
    entries.forEach(function (e) {
      if (!e.date) return;
      var days = Math.floor((now - new Date(e.date)) / 86400000);
      if (days < 0) return;
      weekSet[Math.floor(days / 7)] = true;
    });
    var w = weekSet[0] ? 0 : 1;
    var streak = 0;
    while (weekSet[w]) { streak++; w++; }
    return streak;
  }

  function showJnToast(msg, type) {
    var toastEl = document.getElementById('jn-milestone-toast');
    if (!toastEl) return;
    var msgEl = toastEl.querySelector('.jn-toast-msg');
    if (msgEl) msgEl.textContent = msg || '';
    toastEl.className = 'jn-milestone-toast' + (type ? ' jn-toast--' + type : '');
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () { toastEl.classList.remove('show'); }, 5000);
  }

  function checkStreakMilestone(entries) {
    var streak = calcStreak(entries);
    if (STREAK_MILESTONES.indexOf(streak) === -1) return;
    var key = 'ar_jn_milestone_' + streak;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    var msgs = {
      4:  T('milestone_4'),
      8:  T('milestone_8'),
      12: T('milestone_12'),
      26: T('milestone_26'),
      52: T('milestone_52')
    };
    showJnToast(msgs[streak] || T('milestone_fallback', { n: streak }), 'streak');
  }

  /* ── P3: Parameter sparklines ── */
  function buildSparkline(values, color, dangerMax) {
    if (!values || values.length < 2) return '';
    var W = 80, H = 28, pad = 2;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var range = max - min || 1;
    var pts = values.map(function (v, i) {
      var x = pad + (i / (values.length - 1)) * (W - pad * 2);
      var y = H - pad - ((v - min) / range) * (H - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var lastVal = values[values.length - 1];
    var lastX   = (W - pad).toFixed(1);
    var lastY   = (H - pad - ((lastVal - min) / range) * (H - pad * 2)).toFixed(1);
    var dotColor = (dangerMax !== undefined && lastVal > dangerMax) ? 'rgba(200,80,80,.9)' : color;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">'
      + '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" opacity=".6"/>'
      + '<circle cx="' + lastX + '" cy="' + lastY + '" r="2.2" fill="' + dotColor + '"/>'
      + '</svg>';
  }

  function renderParamCharts(entries, tankType) {
    var chartCard = document.getElementById('jn-param-charts');
    if (!chartCard) return;
    var paramEntries = (entries || []).filter(function (e) { return e.params; });
    if (paramEntries.length < 3) { chartCard.style.display = 'none'; return; }
    chartCard.style.display = '';
    var recent = paramEntries.slice(-12);
    var params = [
      { key:'ph',  label:'pH',   color:'rgba(61,214,232,.75)',  dangerMax:undefined },
      { key:'nh3', label:'NH₃',  color:'rgba(200,140,60,.85)',  dangerMax:0.5 },
      { key:'no2', label:'NO₂',  color:'rgba(200,190,60,.85)',  dangerMax:0.25 },
      { key:'no3', label:'NO₃',  color:'rgba(100,200,82,.75)',  dangerMax:20 }
    ];
    if (tankType === 'marine' || tankType === 'brackish') {
      params.push({ key:'sg', label:'SG', color:'rgba(163,130,200,.75)', dangerMax:undefined });
    } else {
      params.push({ key:'gh', label:'GH', color:'rgba(130,180,200,.75)', dangerMax:undefined });
      params.push({ key:'kh', label:'KH', color:'rgba(100,160,220,.75)', dangerMax:undefined });
    }
    var latestParams = [];
    var html = params.map(function (p) {
      var vals = recent.map(function (e) { return parseFloat(e.params[p.key]); }).filter(function (v) { return !isNaN(v); });
      if (vals.length < 2) return '';
      var last  = vals[vals.length - 1];
      var prev  = vals[vals.length - 2];
      var trend = last > prev ? '↗' : last < prev ? '↘' : '→';
      var dangerColor = (p.dangerMax !== undefined && last > p.dangerMax) ? 'rgba(200,80,80,.85)' : 'var(--th-ink-2)';
      latestParams.push(p.label + ' ' + last);
      return '<div class="jn-spark-row">'
        + '<span class="jn-spark-label">' + p.label + '</span>'
        + '<div class="jn-spark-chart">' + buildSparkline(vals, p.color, p.dangerMax) + '</div>'
        + '<span class="jn-spark-last" style="color:' + dangerColor + '">' + last + '</span>'
        + '<span class="jn-spark-trend">' + trend + '</span>'
        + '</div>';
    }).join('');
    var rhMsg = latestParams.length ? encodeURIComponent('My latest water parameters: ' + latestParams.join(', ') + '. What do you think about these readings?') : '';
    var rhBtn = rhMsg ? '<button class="rh-inline-btn" data-rh-msg="' + rhMsg + '" style="margin-top:.6rem"><svg width="10" height="10" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7.5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="11" cy="11" r="3.5" stroke="currentColor" stroke-width="1.6" fill="none" opacity=".55"/><circle cx="11" cy="11" r="1.4" fill="currentColor" opacity=".8"/></svg>' + T('ask_rhyssa_trends') + '</button>' : '';
    var bodyEl = document.getElementById('jn-param-charts-body');
    if (bodyEl) bodyEl.innerHTML = (html || '<p class="jn-entry-empty">' + T('no_charts_yet') + '</p>') + rhBtn;
  }

  /* ── P4: Contextual entry prompt ── */
  function buildContextPrompt(data) {
    var lines = [];
    var entries = (data.entries || []).slice().reverse();
    var latest  = entries[0];
    if (latest) {
      var phase = assessPhaseFromParams(latest.params) ||
                  assessPhaseFromState(latest.keeperState, (data.profile || {}).setupDate);
      var phasePrompts = {
        establish:  T('ctx_prompt_establish'),
        stabilise:  T('ctx_prompt_stabilise'),
        optimise:   T('ctx_prompt_optimise'),
        sustain:    T('ctx_prompt_sustain')
      };
      if (phase && phasePrompts[phase]) lines.push(phasePrompts[phase]);
    }
    for (var i = 0; i < entries.length; i++) {
      if ((entries[i].care || []).indexOf('water_change') !== -1 && entries[i].date) {
        var daysSince = Math.floor((new Date() - new Date(entries[i].date)) / 86400000);
        if (daysSince >= 7) lines.push(T('ctx_last_water_change', { n: daysSince }));
        break;
      }
    }
    return lines.join(' ');
  }

  /* ── P4b: Entry filter & search ── */
  function applyFilters(entries, filter) {
    return (entries || []).filter(function (e) {
      if (filter.query) {
        var q = filter.query.toLowerCase();
        var inObs  = (e.observation || '').toLowerCase().indexOf(q) !== -1;
        var inCare = (e.care || []).some(function (c) { return (careLabels[c] || c).toLowerCase().indexOf(q) !== -1; });
        var inNote = (e.treatmentNote || '').toLowerCase().indexOf(q) !== -1;
        if (!inObs && !inCare && !inNote) return false;
      }
      if (filter.days > 0 && e.date) {
        if (Math.floor((new Date() - new Date(e.date)) / 86400000) > filter.days) return false;
      }
      if (filter.care.length > 0) {
        if (!filter.care.some(function (c) { return (e.care || []).indexOf(c) !== -1; })) return false;
      }
      if (filter.state.length > 0) {
        if (filter.state.indexOf(e.keeperState) === -1) return false;
      }
      return true;
    });
  }

  function countActiveFilters() {
    var n = 0;
    if (jnFilter.query) n++;
    if (jnFilter.days > 0) n++;
    n += jnFilter.care.length + jnFilter.state.length;
    return n;
  }

  function updateFilterUI() {
    var n = countActiveFilters();
    var badge = document.getElementById('jn-filter-badge');
    if (badge) { badge.textContent = n; badge.style.display = n > 0 ? '' : 'none'; }
    var clearBtn = document.getElementById('jn-filter-clear');
    if (clearBtn) clearBtn.style.display = n > 0 ? '' : 'none';
  }

  function applyAndRender() {
    var tank = getActiveTank(loadData());
    var entries = tank ? (tank.entries || []) : [];
    jnFilteredEntries = applyFilters(entries, jnFilter);
    jnHistoryPage = 1;
    renderEntryList(jnFilteredEntries, 1);
    var noRes = document.getElementById('jn-filter-no-results');
    if (noRes) noRes.style.display = (jnFilteredEntries.length === 0 && entries.length > 0) ? '' : 'none';
    updateFilterUI();
  }

  var searchDebounce = null;
  function setupFilterBar(entries) {
    var bar = document.getElementById('jn-filter-bar');
    if (!bar) return;
    bar.style.display = (entries.length >= 10) ? '' : 'none';

    /* Populate care chips once */
    var careChipsEl = document.getElementById('jn-filter-care-chips');
    if (careChipsEl && !careChipsEl._built) {
      careChipsEl._built = true;
      var careKeys = ['water_change','filter','feeding','top_up','treatment','dosing','media','trimming'];
      careChipsEl.innerHTML = careKeys.map(function (k) {
        return '<button type="button" class="jn-filter-chip" data-filter-care="' + k + '">' + (careLabels[k] || k) + '</button>';
      }).join('');
    }

    /* Sync chip active states to current jnFilter */
    bar.querySelectorAll('[data-filter-days]').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.dataset.filterDays, 10) === jnFilter.days);
    });
    bar.querySelectorAll('[data-filter-state]').forEach(function (el) {
      el.classList.toggle('active', jnFilter.state.indexOf(el.dataset.filterState) !== -1);
    });
    bar.querySelectorAll('[data-filter-care]').forEach(function (el) {
      el.classList.toggle('active', jnFilter.care.indexOf(el.dataset.filterCare) !== -1);
    });

    /* Wire search input (once) */
    var searchEl = document.getElementById('jn-entry-search');
    if (searchEl && !searchEl._wired) {
      searchEl._wired = true;
      searchEl.value = jnFilter.query;
      searchEl.addEventListener('input', function () {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(function () {
          jnFilter.query = searchEl.value.trim();
          applyAndRender();
        }, 280);
      });
      searchEl.addEventListener('search', function () {
        jnFilter.query = searchEl.value.trim();
        applyAndRender();
      });
    }
  }

  /* ── P5: Data export ── */
  function exportParamsCSV() {
    var d = loadData();
    var tank = getActiveTank(d);
    if (!tank) return;
    var cols = ['date','keeper_state','observation','care','ph','nh3','no2','no3','temp','gh','kh','sg'];
    var rows = [cols.join(',')];
    (tank.entries || []).forEach(function (e) {
      var obs = (e.observation || '').replace(/"/g, '""');
      var care = (e.care || []).map(function (c) { return careLabels[c] || c; }).join('; ');
      var row = [
        e.date || '',
        keeperStateLabels[e.keeperState] || e.keeperState || '',
        '"' + obs + '"',
        '"' + care + '"',
        e.params ? (e.params.ph || '') : '',
        e.params ? (e.params.nh3 || '') : '',
        e.params ? (e.params.no2 || '') : '',
        e.params ? (e.params.no3 || '') : '',
        e.params ? (e.params.temp || '') : '',
        e.params ? (e.params.gh || '') : '',
        e.params ? (e.params.kh || '') : '',
        e.params ? (e.params.sg || '') : ''
      ];
      rows.push(row.join(','));
    });
    var blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var pName = tank.profile && tank.profile.name;
    a.href = url;
    a.download = (pName ? pName.replace(/[^a-z0-9]/gi, '-') : 'aquatic-rhythm') + '-params-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportJournal() {
    var d    = loadData();
    var tank = getActiveTank(d);
    var json = JSON.stringify(tank || d, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    var pName = tank && tank.profile && tank.profile.name;
    var name = (pName ? pName.replace(/[^a-z0-9]/gi, '-') : 'aquatic-rhythm');
    a.href     = url;
    a.download = name + '-log-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Rhyssa integration helpers ── */
  function openRhyssaWith(msg) {
    if (typeof window.__rhOpenWith === 'function') { window.__rhOpenWith(msg); return; }
    if (typeof window.__rhOpenSheet === 'function') window.__rhOpenSheet();
  }

  function buildDashboardAlerts(tank) {
    var alerts = [];
    var entries = (tank.entries || []).slice().reverse();
    var latest = entries[0];
    if (latest && latest.params) {
      var nh3 = parseFloat(latest.params.nh3);
      var no3 = parseFloat(latest.params.no3);
      if (!isNaN(nh3) && nh3 > 0.5) {
        alerts.push({ severity: 'danger', msg: T('alert_ammonia_elevated', { val: latest.params.nh3 }), rhMsg: 'My ammonia was ' + latest.params.nh3 + ' mg/L on ' + (latest.date || 'the last test') + '. What should I do?' });
      }
      if (!isNaN(no3) && no3 > 40) {
        alerts.push({ severity: 'warn', msg: T('alert_nitrate_high', { val: latest.params.no3 }), rhMsg: 'My nitrate is ' + latest.params.no3 + ' mg/L. Should I be concerned for my tank?' });
      }
    }
    if (latest && latest.date) {
      var daysSince = Math.floor((new Date() - new Date(latest.date)) / 86400000);
      if (daysSince >= 7) {
        alerts.push({ severity: 'soft', msg: T('alert_no_entry_days', { n: daysSince }), rhMsg: 'I haven\'t logged anything in ' + daysSince + ' days. Just wanted to check in — tank seems okay.' });
      }
    }
    for (var i = 0; i < entries.length; i++) {
      if ((entries[i].care || []).indexOf('water_change') !== -1 && entries[i].date) {
        var days = Math.floor((new Date() - new Date(entries[i].date)) / 86400000);
        if (days > parseInt(localStorage.getItem('ar_wc_threshold') || '14', 10)) alerts.push({ severity: 'warn', msg: T('alert_water_change_days', { n: days }), rhMsg: 'I haven\'t done a water change in ' + days + ' days. Should I be concerned for my ' + ((tank.profile && tank.profile.volume) ? tank.profile.volume + (tank.profile.unit || 'L') + ' ' : '') + 'tank?' });
        break;
      }
    }
    return alerts;
  }

  function renderAlertStrip(tank) {
    var el = document.getElementById('jn-alert-strip');
    if (!el) return;
    var alerts = buildDashboardAlerts(tank);
    if (!alerts.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = alerts.map(function (a) {
      var rhBtn = '<button class="rh-inline-btn jn-alert-rh-btn" data-rh-msg="' + encodeURIComponent(a.rhMsg) + '"><svg width="11" height="11" viewBox="0 0 22 22" fill="none" aria-hidden="true" style="flex-shrink:0"><circle cx="11" cy="11" r="7.5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="11" cy="11" r="3.5" stroke="currentColor" stroke-width="1.6" fill="none" opacity=".55"/><circle cx="11" cy="11" r="1.4" fill="currentColor" opacity=".8"/></svg>' + T('ask_rhyssa_btn') + '</button>';
      return '<div class="jn-alert-item jn-alert--' + a.severity + '"><span class="jn-alert-msg">' + a.msg + '</span>' + rhBtn + '</div>';
    }).join('');
  }

  var rhInsightDebounce = null;
  function fetchWeeklyInsight(tank) {
    if (!tank || !tank.id) return;
    var key = 'rh_weekly_' + tank.id;
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    var weekStart = new Date(); weekStart.setHours(0,0,0,0); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    var weekKey = weekStart.toISOString().slice(0,10);
    var latestEntryDate = (tank.entries || []).length ? (tank.entries[tank.entries.length - 1].date || '') : '';
    if (cached && cached.week === weekKey && cached.lastEntry === latestEntryDate && cached.text) {
      renderWeeklyInsightCard(cached.text, cached.ts);
      return;
    }
    var entries7 = (tank.entries || []).slice().reverse().filter(function (e) {
      if (!e.date) return false;
      var days = Math.floor((new Date() - new Date(e.date)) / 86400000);
      return days <= 7;
    });
    if (!entries7.length) return;
    var summaryParts = entries7.map(function (e) {
      var careStr = (e.care || []).map(function (c) { return careLabels[c] || c; }).join(', ');
      var obs = (e.observation || '').slice(0, 120);
      var params = '';
      if (e.params) {
        var ps = [];
        if (e.params.ph) ps.push('pH ' + e.params.ph);
        if (e.params.nh3) ps.push('NH₃ ' + e.params.nh3);
        if (e.params.no3) ps.push('NO₃ ' + e.params.no3);
        if (ps.length) params = ' [' + ps.join(', ') + ']';
      }
      return '[' + (e.date || '?') + '] ' + (keeperStateLabels[e.keeperState] || '') + (careStr ? ' | ' + careStr : '') + (obs ? ' | "' + obs + '"' : '') + params;
    }).join('\n');
    var prompt = 'From this keeper\'s last 7 days of log entries:\n' + summaryParts + '\n\nWrite a 2–3 sentence weekly observation as Rhyssa. Be specific, warm, and brief. Point out one pattern or detail that might be easy to miss.';
    var insightEl = document.getElementById('jn-weekly-insight-card');
    if (insightEl) {
      insightEl.style.display = '';
      var bodyEl = insightEl.querySelector('.jn-weekly-insight-body');
      if (bodyEl) bodyEl.textContent = '…';
    }
    fetch('https://api.aquaticrhythm.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], tankContext: getTankContext() })
    }).then(function (res) {
      if (!res.ok || !res.body) return;
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = ''; var result = '';
      var bodyEl = insightEl ? insightEl.querySelector('.jn-weekly-insight-body') : null;
      function read() {
        return reader.read().then(function (chunk) {
          if (chunk.done) {
            if (result.trim()) {
              try { localStorage.setItem(key, JSON.stringify({ week: weekKey, lastEntry: latestEntryDate, text: result.trim(), ts: Date.now() })); } catch (e) {}
              renderWeeklyInsightCard(result.trim(), Date.now());
            }
            return;
          }
          buf += decoder.decode(chunk.value, { stream: true });
          var lines = buf.split('\n'); buf = lines.pop() || '';
          lines.forEach(function (line) {
            if (!line.startsWith('data: ')) return;
            var d = line.slice(6).trim(); if (d === '[DONE]') return;
            try {
              var parsed = JSON.parse(d);
              var delta = (parsed.delta && parsed.delta.text) ? parsed.delta.text : '';
              result += delta;
              if (bodyEl) bodyEl.textContent = result;
            } catch (e2) {}
          });
          return read();
        });
      }
      return read();
    }).catch(function () {
      var insightEl2 = document.getElementById('jn-weekly-insight-card');
      if (insightEl2) insightEl2.style.display = 'none';
    });
  }

  function renderWeeklyInsightCard(text, ts) {
    var card = document.getElementById('jn-weekly-insight-card');
    if (!card) return;
    card.style.display = '';
    var bodyEl = card.querySelector('.jn-weekly-insight-body');
    var tsEl = card.querySelector('.jn-weekly-insight-ts');
    if (bodyEl) bodyEl.textContent = text;
    if (tsEl && ts) {
      var d = new Date(ts);
      tsEl.textContent = T('updated_prefix', { date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) });
    }
  }

  var obsHintDebounce = null;
  var obsHintAbort = null;
  function setupObsHint() {
    var obsEl = document.getElementById('jn-entry-obs');
    if (!obsEl || obsEl._rhHintWired) return;
    obsEl._rhHintWired = true;
    obsEl.addEventListener('input', function () {
      clearTimeout(obsHintDebounce);
      var text = obsEl.value.trim();
      var promptEl = document.getElementById('jn-context-prompt');
      if (text.length < 25) {
        if (promptEl) {
          var staticHint = buildContextPrompt(getActiveTank(loadData()) || {});
          promptEl.textContent = staticHint;
          promptEl.style.display = staticHint ? '' : 'none';
        }
        return;
      }
      obsHintDebounce = setTimeout(function () {
        var tank = getActiveTank(loadData());
        if (!tank) return;
        var tankInfo = tank.profile ? ((tank.profile.volume || '') + (tank.profile.unit || 'L') + ' ' + (tank.profile.type || '')) : '';
        var msg = 'My tank is ' + tankInfo + '. I just wrote in my log: "' + text.slice(0, 150) + '". Ask me one short follow-up question to help me observe more carefully.';
        if (promptEl) { promptEl.textContent = '…'; promptEl.style.display = ''; }
        fetch('https://api.aquaticrhythm.com/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: msg }], tankContext: getTankContext() })
        }).then(function (res) {
          if (!res.ok || !res.body) { if (promptEl) promptEl.style.display = 'none'; return; }
          var reader = res.body.getReader();
          var decoder = new TextDecoder();
          var buf2 = ''; var result = '';
          function readHint() {
            return reader.read().then(function (chunk) {
              if (chunk.done) {
                if (promptEl) { promptEl.textContent = result.trim(); promptEl.style.display = result.trim() ? '' : 'none'; }
                return;
              }
              buf2 += decoder.decode(chunk.value, { stream: true });
              var lines = buf2.split('\n'); buf2 = lines.pop() || '';
              lines.forEach(function (line) {
                if (!line.startsWith('data: ')) return;
                var d = line.slice(6).trim(); if (d === '[DONE]') return;
                try {
                  var parsed = JSON.parse(d);
                  var delta = (parsed.delta && parsed.delta.text) ? parsed.delta.text : '';
                  result += delta;
                  if (promptEl) promptEl.textContent = result;
                } catch (e2) {}
              });
              return readHint();
            });
          }
          return readHint();
        }).catch(function () { if (promptEl) promptEl.style.display = 'none'; });
      }, 1500);
    });
  }

  /* ── P6: Tank inhabitants ── */
  function renderInhabitants(data) {
    var bodyEl = document.getElementById('jn-inh-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';

    var active = (data.inhabitants || []).filter(function (i) { return i.status === 'active'; });
    if (!active.length) {
      var ep = document.createElement('p');
      ep.className = 'jn-entry-empty';
      ep.style.cssText = 'font-size:var(--fs-sm);margin:.1rem 0';
      ep.textContent = T('no_residents_yet');
      bodyEl.appendChild(ep);
      return;
    }

    /* Group by category — same layout as My Setup */
    var CAT_ORDER_FAM = ['fish', 'plant', 'invertebrate', 'coral', 'other'];
    var bycat = {};
    active.forEach(function (i) {
      var cat = i.category || 'other';
      if (!bycat[cat]) bycat[cat] = [];
      bycat[cat].push(i);
    });
    CAT_ORDER_FAM.forEach(function (cat) {
      if (!bycat[cat] || !bycat[cat].length) return;
      var hdr = document.createElement('div');
      hdr.className = 'jn-setup-card-cat-hdr';
      hdr.textContent = INH_CAT_LABELS[cat] || cat;
      bodyEl.appendChild(hdr);
      var row = document.createElement('div');
      row.className = 'jn-setup-eq-list';
      bycat[cat].forEach(function (inh) {
        var chip = document.createElement('span');
        chip.className = 'jn-fam-chip';
        var label = inh.commonName || inh.species || cat;
        chip.textContent = inh.count > 1 ? inh.count + ' ' + label : label;
        row.appendChild(chip);
      });
      bodyEl.appendChild(row);
    });
  }

  /* ── Family management modal ── */
  function showFamilyView(which) {
    var listEl = document.getElementById('jn-inh-list-view');
    var formEl = document.getElementById('jn-inh-form-view');
    if (listEl) listEl.style.display = which === 'list' ? '' : 'none';
    if (formEl) formEl.style.display = which === 'form' ? '' : 'none';
  }

  function renderFamilyList() {
    var bodyEl = document.getElementById('jn-inh-list-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';
    var d = loadData();
    var tank = getActiveTank(d);
    var all = (tank && tank.inhabitants) ? tank.inhabitants : [];
    if (!all.length) {
      var ep = document.createElement('p');
      ep.className = 'jn-entry-empty';
      ep.style.cssText = 'font-size:var(--fs-sm);margin:.5rem 0';
      ep.textContent = T('no_residents_yet');
      bodyEl.appendChild(ep);
      return;
    }
    var active = all.filter(function (i) { return i.status === 'active'; });
    var past   = all.filter(function (i) { return i.status !== 'active'; });

    function makeListRow(inh) {
      var row = document.createElement('div');
      row.className = 'jn-fam-list-row';

      var infoDiv = document.createElement('div');
      infoDiv.className = 'jn-fam-list-info';

      var nameSp = document.createElement('span');
      nameSp.className = 'jn-fam-list-name';
      var label = inh.commonName || inh.species || (INH_CAT_LABELS[inh.category] || T('resident_fallback'));
      nameSp.textContent = (inh.count > 1 ? inh.count + '× ' : '') + label;
      infoDiv.appendChild(nameSp);

      if (inh.species) {
        var sciSp = document.createElement('div');
        sciSp.className = 'jn-fam-list-sci';
        sciSp.textContent = inh.species;
        infoDiv.appendChild(sciSp);
      }
      if (inh.status !== 'active') {
        var pill = document.createElement('span');
        pill.className = 'jn-inh-status-chip ' + (inh.status === 'rehomed' ? 'jn-fam-status--rehomed' : 'jn-fam-status--passed');
        pill.textContent = inh.status === 'rehomed' ? T('rehomed') : T('passed');
        pill.style.cssText = 'font-size:var(--fs-3xs);letter-spacing:.05em;text-transform:uppercase;padding:.1rem .38rem;border-radius:20px;border:1px solid;display:inline-block;margin-top:.18rem;' + (inh.status === 'rehomed' ? 'color:rgba(255,200,80,.8);border-color:rgba(255,200,80,.3);background:rgba(255,200,80,.06)' : 'color:rgba(180,80,80,.7);border-color:rgba(180,80,80,.25);background:rgba(180,80,80,.05)');
        infoDiv.appendChild(pill);
      }
      row.appendChild(infoDiv);

      var acts = document.createElement('div');
      acts.className = 'jn-fam-list-actions';

      var editBtn = document.createElement('button');
      editBtn.className = 'jn-fam-list-edit';
      editBtn.setAttribute('data-inh-id', inh.id);
      editBtn.textContent = T('edit_short');
      acts.appendChild(editBtn);

      var delBtn = document.createElement('button');
      delBtn.className = 'jn-fam-list-del';
      delBtn.setAttribute('data-inh-id', inh.id);
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', T('remove_aria'));
      acts.appendChild(delBtn);

      row.appendChild(acts);
      return row;
    }

    active.forEach(function (inh) { bodyEl.appendChild(makeListRow(inh)); });
    if (past.length) {
      var sep = document.createElement('p');
      sep.style.cssText = 'font-size:var(--fs-3xs);letter-spacing:.06em;text-transform:uppercase;color:var(--th-ink-5);margin:.6rem 0 .15rem;font-family:inherit';
      sep.textContent = T('past_residents');
      bodyEl.appendChild(sep);
      past.forEach(function (inh) { bodyEl.appendChild(makeListRow(inh)); });
    }
  }

  function openFamilyModal() {
    renderFamilyList();
    showFamilyView('list');
    openModal('mt-modal-inhabitant');
  }

  function showInhabitantToast(inh, action) {
    var displayName = inh.name || inh.commonName || inh.species || (INH_CAT_LABELS[inh.category] || T('resident_fallback'));
    var count = inh.count > 1 ? inh.count + '× ' : '';
    var msg, type;
    if (action === 'added') {
      msg  = T('welcome_to_tank', { name: count + displayName });
      type = 'welcome';
    } else if (action === 'passed') {
      msg  = T('left_the_tank', { name: count + displayName });
      type = 'passed';
    } else if (action === 'rehomed') {
      msg  = T('found_new_home', { name: count + displayName });
      type = 'rehomed';
    } else { return; }
    showJnToast(msg, type);
  }

  function updateInhabitantStatus(id, status, note) {
    var d = loadData();
    var tank = getActiveTank(d);
    var inhs = tank ? (tank.inhabitants || []) : [];
    for (var i = 0; i < inhs.length; i++) {
      if (inhs[i].id === id) {
        var inh = inhs[i];
        inh.status      = status;
        inh.removedDate = todayStr();
        inh.removedNote = note || '';
        saveData(d);
        renderDashboard();
        showInhabitantToast(inh, status);
        break;
      }
    }
  }

  function renderDashboard() {
    renderJournalOverview();
    var d = loadData();
    renderTankSelector(d);
    var tank = getActiveTank(d);

    if (!tank) {
      var tlPage = document.getElementById('pg-tank-log');
      if (tlPage && tlPage.classList.contains('active')) window.go('journal', false);
      return;
    }

    var p = tank.profile;
    var nameEl = document.getElementById('jn-tank-name');
    var infoEl = document.getElementById('jn-tank-info');
    if (nameEl) nameEl.textContent = p.name || T('my_tank_fallback');
    if (infoEl) infoEl.textContent = [(p.volume ? p.volume + ' ' + (p.unit || 'L') : ''), p.type, tankAge(p.setupDate)].filter(Boolean).join(' · ');

    /* Identity hero icon */
    var iconEl = document.getElementById('jn-identity-icon');
    if (iconEl) iconEl.innerHTML = tankTypeIconLg(p.type, p.shape);

    var entries = tank.entries || [];
    var latest = entries.length ? entries[entries.length - 1] : null;

    var activeInhCount = (tank.inhabitants || []).filter(function (i) { return i.status === 'active'; }).length;
    var hasSetupDate = !!p.setupDate;
    var hasResidents = activeInhCount > 0;
    var hasParamEntry = entries.some(function (e) { return e.params && (e.params.nh3 || e.params.no2 || e.params.no3); });
    var sufficientForPhase = hasParamEntry || (entries.length >= 3 && (hasSetupDate || hasResidents));

    var phase = null, fromParams = false;
    if (sufficientForPhase && latest && latest.params) {
      phase = assessPhaseFromParams(latest.params);
      if (phase) fromParams = true;
    }
    if (sufficientForPhase && !phase && latest) phase = assessPhaseFromState(latest.keeperState, p.setupDate);
    var info = (phase && phaseInfo[phase]) ? phaseInfo[phase] : null;

    /* Phase pill in identity hero */
    var pillEl = document.getElementById('jn-identity-phase');
    if (pillEl) {
      if (info) { pillEl.textContent = info.label; pillEl.style.color = info.color; pillEl.style.display = ''; }
      else { pillEl.style.display = 'none'; }
    }

    /* (snapshot strip removed) */

    /* Phase name, note, next, src */
    var phaseNameEl = document.getElementById('jn-phase-name');
    var phaseNoteEl = document.getElementById('jn-phase-note');
    var phaseNextEl = document.getElementById('jn-phase-next');
    var phaseSrcEl  = document.getElementById('jn-phase-src');
    var phaseJourneyEl = document.getElementById('jn-phase-journey');
    if (phaseNameEl) {
      if (info) {
        phaseNameEl.textContent = info.label;
        phaseNameEl.style.color = info.color;
        phaseNameEl.style.display = '';
        if (phaseJourneyEl) phaseJourneyEl.style.display = 'none';
        if (phaseNoteEl) phaseNoteEl.textContent = info.note;
        if (phaseNextEl) { phaseNextEl.textContent = info.next; phaseNextEl.style.display = ''; }
        if (phaseSrcEl) { phaseSrcEl.textContent = fromParams ? T('based_on_params') : T('estimated_from_rhythm'); phaseSrcEl.style.display = ''; }
      } else {
        phaseNameEl.style.display = 'none';
        phaseNameEl.style.color = '';
        if (phaseJourneyEl) phaseJourneyEl.style.display = '';
        var noPhaseMsg = !entries.length
          ? T('no_phase_no_entries')
          : !hasResidents && !hasSetupDate
            ? T('no_phase_no_setup')
            : !sufficientForPhase
              ? T('no_phase_insufficient')
              : T('no_phase_default');
        if (phaseNoteEl) phaseNoteEl.textContent = noPhaseMsg;
        if (phaseNextEl) phaseNextEl.style.display = 'none';
        if (phaseSrcEl) phaseSrcEl.style.display = 'none';
      }
    }

    /* Phase card: left accent color + subtle tint */
    var phaseCard = document.getElementById('jn-phase-card');
    if (phaseCard) {
      if (info) {
        phaseCard.style.borderLeftColor = info.color;
        var m = info.color.match(/[\d.]+/g);
        if (m && m.length >= 3) phaseCard.style.setProperty('--tl-phase-bg', 'rgba(' + m[0] + ',' + m[1] + ',' + m[2] + ',.06)');
      } else {
        phaseCard.style.borderLeftColor = 'var(--th-line)';
        phaseCard.style.removeProperty('--tl-phase-bg');
      }
    }

    /* Rhythm dots (8 weeks, RTL grid = week 0 rightmost) */
    var weeks = rhythmWeeks(entries);
    var rhythmEl = document.getElementById('jn-rhythm-dots');
    if (rhythmEl) {
      var weekLabels = [T('week_this'), T('week_last'), T('week_2ago'), T('week_3ago'), T('week_4ago'), T('week_5ago'), T('week_6ago'), T('week_7ago')];
      rhythmEl.innerHTML = weeks.map(function (has, i) {
        return '<div class="jn-rhythm-dot' + (has ? ' active' : '') + '"'
          + ' title="' + weekLabels[i] + '"'
          + ' aria-label="' + weekLabels[i] + (has ? T('entry_logged') : T('no_entry')) + '">'
          + '</div>';
      }).join('');
    }

    /* Streak badge */
    var streakEl = document.getElementById('jn-streak-count');
    if (streakEl) {
      if (streak >= 1) {
        streakEl.textContent = streak === 1 ? T('streak_1week') : T('streak_nweek', { n: streak });
        streakEl.style.display = '';
      } else {
        streakEl.style.display = 'none';
      }
    }

    renderAlertStrip(tank);
    renderParamCharts(entries, p.type);
    renderInhabitants(tank);

    var noEntriesEl = document.getElementById('jn-no-entries');
    var hasEntriesEl = document.getElementById('jn-has-entries');
    if (noEntriesEl) noEntriesEl.style.display = entries.length ? 'none' : '';
    if (hasEntriesEl) hasEntriesEl.style.display = entries.length ? '' : 'none';

    setupFilterBar(entries);
    jnFilteredEntries = applyFilters(entries, jnFilter);
    jnHistoryPage = 1;
    renderEntryList(jnFilteredEntries, jnHistoryPage);

    /* My Setup card */
    renderSetupCard(tank);

    /* Rhyssa weekly insight (async, non-blocking) */
    if (entries.length >= 2) fetchWeeklyInsight(tank);
    else { var wc = document.getElementById('jn-weekly-insight-card'); if (wc) wc.style.display = 'none'; }

    /* ARA phase card: Rhyssa touchpoint */
    var phaseRhEl = document.getElementById('jn-phase-rh-btn');
    if (phaseRhEl && info) {
      var phaseRhMsg = encodeURIComponent('My tank is in the ' + info.label + ' phase. ' + info.next + ' What should I be watching for?');
      phaseRhEl.setAttribute('data-rh-msg', phaseRhMsg);
      phaseRhEl.style.display = '';
    } else if (phaseRhEl) {
      phaseRhEl.style.display = 'none';
    }
  }

  /* body{overflow:hidden} alone is a known cross-browser trap on
     mobile: on some Android WebViews/embedded browsers it doesn't just
     block background scroll, it also stops touch-scroll from reaching
     the modal's own overflow-y:auto content. position:fixed + restoring
     scroll position on close is the standard robust fix. */
  var scrollLockY = 0;
  function lockBodyScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.width = '100%';
  }
  function unlockBodyScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockY);
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    var backdrop = document.getElementById('mt-backdrop');
    if (!modal) return;
    modal.removeAttribute('aria-hidden');
    modal.classList.add('open');
    if (backdrop) { backdrop.classList.add('open'); backdrop.removeAttribute('aria-hidden'); }
    lockBodyScroll();
    var first = modal.querySelector('input,select,textarea,button');
    if (first) first.focus();
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    var backdrop = document.getElementById('mt-backdrop');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); }
    unlockBodyScroll();
  }

  function closeAllModals() {
    ['mt-modal-setup', 'mt-modal-entry', 'mt-modal-inhabitant', 'mt-modal-gear'].forEach(closeModal);
  }

  /* ── Back-button intercept ──
     Without this, Android back (hardware/gesture) exits the page
     entirely instead of just closing whichever mt-modal-* is open —
     same pattern as js/rhyssa-fab-ext.js / js/ui-settings.js. All
     four modals share one backdrop, toggled in lockstep by
     openModal()/closeModal(), so watching it is a single source of
     truth for "some modal is open" regardless of which one. */
  (function () {
    var mtBackdrop = document.getElementById('mt-backdrop');
    if (!mtBackdrop) return;
    var mtInHistory = false;
    new MutationObserver(function () {
      var open = mtBackdrop.classList.contains('open');
      if (open && !mtInHistory) {
        mtInHistory = true;
        history.pushState({ mtModal: true }, '');
      } else if (!open && mtInHistory) {
        history.back();
      }
    }).observe(mtBackdrop, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('popstate', function () {
      if (!mtInHistory) return;
      mtInHistory = false;
      window.__rhSuppressSpaNav = true;
      if (mtBackdrop.classList.contains('open')) closeAllModals();
    }, true);
  })();

  /* ── EQ label helper ── */
  function fmtEqLabel(key) {
    return key.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  /* ── renderSetupCard ── */
  function renderSetupCard(tank) {
    var card = document.getElementById('jn-setup-card');
    if (!card) return;
    var setup = tank && tank.setup;
    card.removeAttribute('hidden');
    var eqList = document.getElementById('jn-setup-eq-list');
    var emptyEl = document.getElementById('jn-setup-empty');
    if (eqList) eqList.innerHTML = '';
    var hasEq = setup && setup.equipment && Object.keys(setup.equipment).length;
    var hasPlants = setup && setup.plants && setup.plants.length;
    var hasHard = setup && setup.hardscape && setup.hardscape.length;
    var hasAny = !!(hasEq || hasPlants || hasHard);
    if (emptyEl) emptyEl.style.display = hasAny ? 'none' : 'flex';
    if (!hasAny) return;
    if (hasEq && eqList) {
      var AR_EQ = window.AR_EQ;
      var CAT_ORDER = ['filtration', 'environment', 'substrate', 'cooling', 'additions', 'sterilization', 'circulation'];
      var bycat = {};
      Object.keys(setup.equipment).forEach(function (k) {
        var cat = (AR_EQ && AR_EQ[k]) ? (AR_EQ[k].cat || 'other') : 'other';
        if (!bycat[cat]) bycat[cat] = [];
        bycat[cat].push(k);
      });
      var cats = CAT_ORDER.filter(function (c) { return bycat[c]; });
      Object.keys(bycat).forEach(function (c) { if (cats.indexOf(c) < 0) cats.push(c); });
      cats.forEach(function (cat) {
        if (!bycat[cat] || !bycat[cat].length) return;
        var hdr = document.createElement('div');
        hdr.className = 'jn-setup-card-cat-hdr';
        hdr.textContent = CAT_LABELS[cat] || cat;
        eqList.appendChild(hdr);
        (bycat[cat] || []).forEach(function (k) {
          var customNote = (setup.customNotes || {})[k] || '';
          var brand = (setup.brands || {})[k] || '';
          var note = customNote || brand;
          var chip = document.createElement('span');
          chip.className = 'jn-setup-eq-chip';
          chip.textContent = fmtEqLabel(k) + (note ? ' — ' + note : '');
          eqList.appendChild(chip);
        });
      });
    }
    if (hasPlants && eqList) {
      var phdr = document.createElement('div');
      phdr.className = 'jn-setup-card-cat-hdr';
      phdr.textContent = T('cat_plants');
      eqList.appendChild(phdr);
      setup.plants.forEach(function (p) {
        var chip = document.createElement('span');
        chip.className = 'jn-setup-eq-chip';
        chip.textContent = p.name || p.id || T('cat_plants');
        eqList.appendChild(chip);
      });
    }
    if (hasHard && eqList) {
      var hhdr = document.createElement('div');
      hhdr.className = 'jn-setup-card-cat-hdr';
      hhdr.textContent = T('cat_hardscape');
      eqList.appendChild(hhdr);
      setup.hardscape.forEach(function (h) {
        var chip2 = document.createElement('span');
        chip2.className = 'jn-setup-eq-chip';
        chip2.textContent = h.name || h.id || T('cat_hardscape');
        eqList.appendChild(chip2);
      });
    }
  }

  /* ── Gear modal state ── */
  var _gearEqState = {};
  var _gearBrandState = {};

  var CAT_LABELS = {
    filtration: T('cat_filtration'),
    environment: T('cat_environment'),
    substrate: T('cat_substrate'),
    cooling: T('cat_cooling'),
    additions: T('cat_additions'),
    sterilization: T('cat_sterilization'),
    circulation: T('cat_circulation')
  };

  function openGearModal() {
    var AR_EQ = window.AR_EQ;
    if (!AR_EQ) { openModal('mt-modal-gear'); return; }
    var tank = getActiveTank(loadData());
    var saved = (tank && tank.setup) || {};
    _gearEqState = {};
    _gearBrandState = {};
    var _gearCustomNotes = saved.customNotes ? Object.assign({}, saved.customNotes) : {};

    if (saved.equipment) Object.keys(saved.equipment).forEach(function (k) { _gearEqState[k] = true; });
    if (saved.brands) Object.keys(saved.brands).forEach(function (k) { _gearBrandState[k] = saved.brands[k]; });

    var rowsEl = document.getElementById('jn-setup-eq-rows');
    if (rowsEl) {
      rowsEl.innerHTML = '';
      var CAT_ORDER = ['filtration', 'environment', 'substrate', 'cooling', 'additions', 'sterilization', 'circulation'];
      var bycat = {};
      Object.keys(AR_EQ).forEach(function (k) {
        var cat = AR_EQ[k].cat || 'other';
        if (!bycat[cat]) bycat[cat] = [];
        bycat[cat].push(k);
      });
      var cats = CAT_ORDER.filter(function (c) { return bycat[c]; });
      Object.keys(bycat).forEach(function (c) { if (cats.indexOf(c) < 0) cats.push(c); });
      cats.forEach(function (cat) {
        if (!bycat[cat] || !bycat[cat].length) return;
        var catHeader = document.createElement('div');
        catHeader.className = 'jn-eq-cat-header';
        catHeader.textContent = CAT_LABELS[cat] || cat;
        rowsEl.appendChild(catHeader);
        (bycat[cat] || []).forEach(function (k) {
          var eq = AR_EQ[k];
          var row = document.createElement('div');
          row.className = 'jn-setup-eq-row' + (!!_gearEqState[k] ? ' active' : '');
          var tog = document.createElement('input');
          tog.type = 'checkbox';
          tog.className = 'jn-setup-eq-toggle';
          tog.dataset.eq = k;
          tog.checked = !!_gearEqState[k];
          var lbl = document.createElement('span');
          lbl.className = 'jn-setup-eq-row-label';
          lbl.textContent = fmtEqLabel(k);
          var sel = document.createElement('select');
          sel.className = 'jn-setup-brand-select' + (tog.checked ? ' visible' : '');
          sel.dataset.eq = k;
          var defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = T('brand_model_default');
          sel.appendChild(defaultOpt);
          var brandExamples = (eq.brands && eq.brands.examples) ? eq.brands.examples : [];
          var savedBrand = _gearBrandState[k] || '';
          var savedNote = _gearCustomNotes[k] || '';
          var brandInList = savedBrand && brandExamples.indexOf(savedBrand) !== -1;
          brandExamples.forEach(function (b) {
            var opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            if (brandInList && savedBrand === b) opt.selected = true;
            sel.appendChild(opt);
          });
          var customOpt = document.createElement('option');
          customOpt.value = '__custom__';
          customOpt.textContent = T('brand_model_custom');
          if (!brandInList && (savedBrand || savedNote)) customOpt.selected = true;
          sel.appendChild(customOpt);

          var note = document.createElement('input');
          note.type = 'text';
          var noteVisible = tog.checked && (sel.value === '__custom__' || (!brandInList && (savedBrand || savedNote)));
          note.className = 'jn-setup-eq-note' + (noteVisible ? ' visible' : '');
          note.dataset.eq = k;
          note.placeholder = T('brand_model_placeholder');
          note.maxLength = 80;
          note.value = savedNote || (!brandInList ? savedBrand : '');

          tog.addEventListener('change', function () {
            if (tog.checked) {
              _gearEqState[k] = true;
              sel.classList.add('visible');
              if (sel.value === '__custom__') note.classList.add('visible');
              row.classList.add('active');
            } else {
              delete _gearEqState[k];
              delete _gearBrandState[k];
              sel.classList.remove('visible');
              sel.value = '';
              note.classList.remove('visible');
              row.classList.remove('active');
            }
          });
          sel.addEventListener('change', function () {
            if (sel.value === '__custom__') {
              note.classList.add('visible');
              delete _gearBrandState[k];
              setTimeout(function () { note.focus(); }, 50);
            } else {
              note.classList.remove('visible');
              if (sel.value) _gearBrandState[k] = sel.value;
              else delete _gearBrandState[k];
            }
          });
          row.appendChild(tog);
          row.appendChild(lbl);
          row.appendChild(sel);
          row.appendChild(note);
          rowsEl.appendChild(row);
        });
      });
    }

    openModal('mt-modal-gear');
  }

  function saveGearModal() {
    var d = loadData();
    var tank = getActiveTank(d);
    if (!tank) return;
    var eq = {};
    document.querySelectorAll('.jn-setup-eq-toggle:checked').forEach(function (tog) {
      if (tog.dataset.eq) eq[tog.dataset.eq] = true;
    });
    var brands = {};
    document.querySelectorAll('.jn-setup-brand-select').forEach(function (sel) {
      if (sel.dataset.eq && sel.value && sel.value !== '__custom__') brands[sel.dataset.eq] = sel.value;
    });
    var customNotes = {};
    document.querySelectorAll('.jn-setup-eq-note').forEach(function (inp) {
      if (inp.dataset.eq && inp.value.trim()) customNotes[inp.dataset.eq] = inp.value.trim();
    });
    var prev = tank.setup || {};
    tank.setup = {
      equipment: eq,
      brands: brands,
      customNotes: customNotes,
      savedAt: Date.now(),
      stock: prev.stock,
      plants: prev.plants,
      hardscape: prev.hardscape
    };
    saveData(d);
    closeModal('mt-modal-gear');
    renderSetupCard(tank);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function openEntryModal(entryId) {
    document.querySelectorAll('.jn-state-chip,.jn-care-chip').forEach(function (c) { c.classList.remove('active'); });
    var chipsContainer = document.getElementById('jn-care-chips-container');
    if (chipsContainer) chipsContainer.classList.remove('expanded');
    var editingIdEl = document.getElementById('jn-entry-editing-id');
    if (editingIdEl) editingIdEl.value = '';
    var titleEl = document.querySelector('#mt-modal-entry .mt-modal-title');
    var deleteBtn = document.getElementById('jn-entry-delete-btn');
    var treatRow = document.getElementById('jn-treatment-note-row');
    var treatEl = document.getElementById('jn-treatment-note');
    var paramsSection = document.getElementById('jn-params-section');
    var allParamIds = ['jn-param-ph','jn-param-nh3','jn-param-no2','jn-param-no3','jn-param-temp','jn-param-gh','jn-param-kh','jn-param-sg'];

    /* Show/hide extended params based on tank type */
    var tank = getActiveTank(loadData());
    var tankType = tank && tank.profile ? (tank.profile.type || '') : '';
    var ghRow = document.getElementById('jn-param-gh-row');
    var khRow = document.getElementById('jn-param-kh-row');
    var sgRow = document.getElementById('jn-param-sg-row');
    var isMarine = (tankType === 'marine' || tankType === 'brackish');
    if (ghRow) ghRow.style.display = isMarine ? 'none' : '';
    if (khRow) khRow.style.display = isMarine ? 'none' : '';
    if (sgRow) sgRow.style.display = isMarine ? '' : 'none';

    allParamIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
    if (treatRow) treatRow.style.display = 'none';
    if (treatEl) treatEl.value = '';

    if (entryId && tank) {
      var entry = null;
      for (var ei = 0; ei < (tank.entries || []).length; ei++) {
        if (tank.entries[ei].id === entryId) { entry = tank.entries[ei]; break; }
      }
      if (entry) {
        if (editingIdEl) editingIdEl.value = entryId;
        if (titleEl) titleEl.textContent = T('entry_modal_title_edit');
        if (deleteBtn) deleteBtn.style.display = '';
        var entryDate = document.getElementById('jn-entry-date');
        if (entryDate) entryDate.value = entry.date || todayStr();
        var obsEl = document.getElementById('jn-entry-obs');
        if (obsEl) obsEl.value = entry.observation || '';
        if (entry.keeperState) {
          var stateChip = document.querySelector('.jn-state-chip[data-state="' + entry.keeperState + '"]');
          if (stateChip) stateChip.classList.add('active');
        }
        (entry.care || []).forEach(function (c) {
          var chip = document.querySelector('.jn-care-chip[data-care="' + c + '"]');
          if (chip) chip.classList.add('active');
        });
        if (entry.treatmentNote && treatRow && treatEl) {
          treatRow.style.display = '';
          treatEl.value = entry.treatmentNote;
        }
        if (entry.params) {
          ['ph','nh3','no2','no3','temp','gh','kh','sg'].forEach(function (k) {
            var el = document.getElementById('jn-param-' + k);
            if (el && entry.params[k]) el.value = entry.params[k];
          });
        }
        var cc = document.getElementById('jn-care-chips-container');
        if (cc && cc.querySelector('.jn-care-secondary.active')) cc.classList.add('expanded');
        var ptxt = buildContextPrompt(tank || {});
        var pel = document.getElementById('jn-context-prompt');
        if (pel) { pel.textContent = ptxt || T('entry_default_prompt'); pel.style.display = ''; }
        setupObsHint();
        openModal('mt-modal-entry');
        return;
      }
    }

    /* New entry mode */
    if (titleEl) titleEl.textContent = T('entry_modal_title_new');
    if (deleteBtn) deleteBtn.style.display = 'none';
    var entryDate2 = document.getElementById('jn-entry-date');
    if (entryDate2) entryDate2.value = todayStr();
    var obsEl2 = document.getElementById('jn-entry-obs');
    if (obsEl2) obsEl2.value = '';
    var promptText = buildContextPrompt(tank || {}) || T('entry_default_prompt');
    var promptEl = document.getElementById('jn-context-prompt');
    if (promptEl) { promptEl.textContent = promptText; promptEl.style.display = ''; }
    setupObsHint();
    openModal('mt-modal-entry');
  }
  window.__jnOpenEntryModal = openEntryModal;

  window.__jnAutoSaveEntry = function (obsText) {
    var d = loadData();
    var tank = getActiveTank(d);
    if (!tank) return false;
    var today = todayStr();
    var existing = (tank.entries || []).find(function (e) { return e.date === today; });
    if (existing) {
      existing.observation = existing.observation
        ? existing.observation + '\n\n' + obsText
        : obsText;
    } else {
      if (!tank.entries) tank.entries = [];
      tank.entries.push({ id: Date.now().toString(), date: today, observation: obsText, care: [], keeperState: '', params: {}, ts: Date.now() });
    }
    saveData(d);
    renderDashboard();
    return true;
  };

  function openInhabitantModal(inhId) {
    /* Reset form */
    document.querySelectorAll('.jn-inh-cat-chip').forEach(function (c) { c.classList.remove('active'); });
    var firstCat = document.querySelector('.jn-inh-cat-chip');
    if (firstCat) firstCat.classList.add('active');
    var editingEl = document.getElementById('jn-inh-editing-id');
    if (editingEl) editingEl.value = '';
    var g = function (id) { var el = document.getElementById(id); if (el) el.value = ''; };
    g('jn-inh-common'); g('jn-inh-species'); g('jn-inh-name');
    var countEl = document.getElementById('jn-inh-count'); if (countEl) countEl.value = '1';
    var dateEl = document.getElementById('jn-inh-date'); if (dateEl) dateEl.value = todayStr();
    var statusRow = document.getElementById('jn-inh-status-row');
    var deleteBtn = document.getElementById('jn-inh-delete-btn');
    var titleEl = document.getElementById('jn-inh-form-title');
    if (statusRow) statusRow.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'none';

    if (inhId) {
      var d = loadData(); var tank = getActiveTank(d);
      var inh = null;
      if (tank) { for (var ii = 0; ii < (tank.inhabitants || []).length; ii++) { if (tank.inhabitants[ii].id === inhId) { inh = tank.inhabitants[ii]; break; } } }
      if (inh) {
        if (editingEl) editingEl.value = inhId;
        if (titleEl) titleEl.textContent = T('inhabitant_modal_title_edit');
        var catChip = document.querySelector('.jn-inh-cat-chip[data-cat="' + (inh.category || 'fish') + '"]');
        document.querySelectorAll('.jn-inh-cat-chip').forEach(function (c) { c.classList.remove('active'); });
        if (catChip) catChip.classList.add('active');
        var s = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
        s('jn-inh-common', inh.commonName); s('jn-inh-species', inh.species); s('jn-inh-name', inh.name);
        var cEl = document.getElementById('jn-inh-count'); if (cEl) cEl.value = inh.count || 1;
        var dEl = document.getElementById('jn-inh-date'); if (dEl) dEl.value = inh.addedDate || todayStr();
        if (statusRow) statusRow.style.display = '';
        document.querySelectorAll('.jn-inh-status-chip').forEach(function (c) {
          c.classList.toggle('active', c.dataset.status === (inh.status || 'active'));
        });
        if (deleteBtn) deleteBtn.style.display = '';
        var submitBtn = document.querySelector('#jn-form-inhabitant [type="submit"]');
        if (submitBtn) submitBtn.textContent = T('inhabitant_submit_edit');
        showFamilyView('form');
        return;
      }
    }
    if (titleEl) titleEl.textContent = T('inhabitant_modal_title_new');
    var submitBtn2 = document.querySelector('#jn-form-inhabitant [type="submit"]');
    if (submitBtn2) submitBtn2.textContent = T('inhabitant_submit_new');
    showFamilyView('form');
  }

  /* ── Resident autocomplete ── */
  (function () {
    var commonInp = document.getElementById('jn-inh-common');
    var speciesInp = document.getElementById('jn-inh-species');
    var wrap = document.getElementById('jn-inh-common-wrap');
    if (!commonInp || !wrap) return;
    var suggestBox = null;

    function removeSuggest() {
      if (suggestBox) { suggestBox.remove(); suggestBox = null; }
    }

    function showSuggestions(query) {
      removeSuggest();
      var q = query.trim().toLowerCase();
      if (!q) return;
      var matches = FISH_SPECIES.filter(function (f) {
        return f.common.toLowerCase().indexOf(q) >= 0;
      }).slice(0, 6);
      if (!matches.length) return;
      suggestBox = document.createElement('div');
      suggestBox.id = 'jn-inh-suggest';
      suggestBox.className = 'jn-inh-suggest';
      matches.forEach(function (f) {
        var item = document.createElement('div');
        item.className = 'jn-inh-suggest-item';
        item.setAttribute('tabindex', '-1');
        var nameSpan = document.createElement('span');
        nameSpan.textContent = f.common;
        var sciSpan = document.createElement('span');
        sciSpan.className = 'jn-inh-suggest-sci';
        sciSpan.textContent = f.sci;
        item.appendChild(nameSpan);
        item.appendChild(sciSpan);
        item.addEventListener('mousedown', function (e) {
          e.preventDefault();
          commonInp.value = f.common;
          if (speciesInp) speciesInp.value = f.sci;
          removeSuggest();
          commonInp.focus();
        });
        suggestBox.appendChild(item);
      });
      wrap.appendChild(suggestBox);
    }

    commonInp.addEventListener('input', function () {
      showSuggestions(commonInp.value);
    });

    commonInp.addEventListener('blur', function () {
      setTimeout(removeSuggest, 150);
    });
  })();

  document.addEventListener('click', function (e) {
    var target = e.target;

    /* Tank card click → navigate to tank log */
    var tankCard = target.closest('.jn-tank-card[data-tank-id]');
    if (tankCard && tankCard.dataset.tankId) {
      var d = loadData();
      if (d.activeTankId !== tankCard.dataset.tankId) {
        jnFilter = { query: '', days: 0, care: [], state: [] };
      }
      d.activeTankId = tankCard.dataset.tankId;
      saveData(d);
      window.go('tank-log', true);
      return;
    }

    /* Add aquarium / Setup from overview */
    if (target.id === 'jn-ov-add-tank' || target.id === 'jn-ov-setup-open') {
      resetSetupModal();
      if (formSetup) formSetup.dataset.editingId = '';
      var delBtnOv = document.getElementById('mt-setup-delete');
      if (delBtnOv) delBtnOv.style.display = 'none';
      openModal('mt-modal-setup');
      return;
    }

    if (target.id === 'mt-setup-open' || target.id === 'jn-setup-open') {
      if (formSetup) formSetup.dataset.editingId = '';
      var delBtnNew = document.getElementById('mt-setup-delete');
      if (delBtnNew) delBtnNew.style.display = 'none';
      openModal('mt-modal-setup'); return;
    }
    if (target.id === 'jn-entry-open' || target.id === 'jn-entry-open-2' || target.id === 'jn-entry-open-main') {
      openEntryModal(); return;
    }
    if (target.closest('#jn-tank-edit')) {
      var d = loadData();
      var tank = getActiveTank(d);
      var p = tank ? (tank.profile || {}) : {};
      resetSetupModal();
      var inp = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
      inp('mt-inp-name', p.name);
      inp('mt-inp-date', p.setupDate);
      setHiddenInputs(p.volume, p.unit || 'L', p.shape || 'rect');
      var typeEl = document.getElementById('mt-inp-type');
      if (typeEl && p.type) typeEl.value = p.type;
      if (p.volume) updatePreview(p.volume, p.unit || 'L', p.shape || 'rect', null);
      if (formSetup) formSetup.dataset.editingId = tank ? tank.id : '';
      var delBtn = document.getElementById('mt-setup-delete');
      if (delBtn) delBtn.style.display = (tank && d.tanks.length > 1) ? '' : 'none';
      openModal('mt-modal-setup');
      return;
    }
    if (target.id === 'mt-setup-delete') {
      var d = loadData();
      var editId = formSetup ? formSetup.dataset.editingId : '';
      if (!editId) return;
      var tankDel = null;
      for (var ti = 0; ti < d.tanks.length; ti++) { if (d.tanks[ti].id === editId) { tankDel = d.tanks[ti]; break; } }
      if (!tankDel) return;
      var tName = (tankDel.profile && tankDel.profile.name) || T('this_tank_fallback');
      if (!confirm(T('confirm_delete_tank_named', { name: tName }))) return;
      d.tanks = d.tanks.filter(function (t) { return t.id !== editId; });
      if (d.tanks.length) {
        d.activeTankId = d.tanks[0].id;
        saveData(d);
      } else {
        saveData({});
      }
      closeAllModals();
      renderDashboard();
      window.go('journal', false);
      return;
    }
    if (target.closest('#jn-add-tank')) {
      resetSetupModal();
      if (formSetup) formSetup.dataset.editingId = '';
      var delBtn2 = document.getElementById('mt-setup-delete');
      if (delBtn2) delBtn2.style.display = 'none';
      openModal('mt-modal-setup');
      return;
    }
    var tankTab = target.closest('.jn-tank-tab[data-tank-id]');
    if (tankTab && tankTab.dataset.tankId) {
      var d = loadData();
      d.activeTankId = tankTab.dataset.tankId;
      saveData(d);
      renderDashboard();
      return;
    }
    if (target.id === 'jn-reset-tank') {
      var d = loadData();
      var tank = getActiveTank(d);
      if (!tank) return;
      var isLast = d.tanks.length <= 1;
      var msg = isLast
        ? T('confirm_delete_all_data')
        : T('confirm_delete_this_tank');
      if (confirm(msg)) {
        if (isLast) { saveData({}); }
        else {
          d.tanks = d.tanks.filter(function (t) { return t.id !== tank.id; });
          d.activeTankId = d.tanks[0].id;
          saveData(d);
        }
        renderDashboard();
        window.go('journal', false);
      }
      return;
    }
    if (target.id === 'mt-backdrop' || target.dataset.modalClose) { closeAllModals(); return; }

    var stateChip = target.closest('.jn-state-chip');
    if (stateChip) {
      document.querySelectorAll('.jn-state-chip').forEach(function (c) { c.classList.remove('active'); });
      stateChip.classList.add('active'); return;
    }
    var careChip = target.closest('.jn-care-chip');
    if (careChip) { careChip.classList.toggle('active'); return; }

    if (target.id === 'jn-care-more') {
      var cc2 = document.getElementById('jn-care-chips-container');
      if (cc2) cc2.classList.add('expanded');
      return;
    }


    if (target.id === 'jn-load-more') {
      jnHistoryPage += 1;
      renderEntryList(jnFilteredEntries, jnHistoryPage);
      return;
    }

    if (target.id === 'jn-toast-dismiss') {
      var toastEl = document.getElementById('jn-milestone-toast');
      if (toastEl) toastEl.classList.remove('show');
      return;
    }

    /* Rhyssa prefill (data-rh-msg attribute) */
    var rhBtn = target.closest('[data-rh-msg]');
    if (rhBtn && !target.closest('a[href]')) {
      e.preventDefault();
      var msg = decodeURIComponent(rhBtn.dataset.rhMsg || '');
      if (msg) openRhyssaWith(msg);
      else if (typeof window.__rhOpenSheet === 'function') window.__rhOpenSheet();
      return;
    }

    if (target.id === 'jn-export') { exportJournal(); return; }
    if (target.id === 'jn-export-csv') { exportParamsCSV(); return; }

    /* Filter bar toggle */
    if (target.closest('#jn-filter-toggle')) {
      var opts = document.getElementById('jn-filter-options');
      if (opts) {
        var open = opts.style.display === 'none' || !opts.style.display;
        opts.style.display = open ? '' : 'none';
        target.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      return;
    }

    /* Date period chips */
    var dayChip = target.closest('[data-filter-days]');
    if (dayChip) {
      jnFilter.days = parseInt(dayChip.dataset.filterDays, 10) || 0;
      document.querySelectorAll('[data-filter-days]').forEach(function (c) { c.classList.toggle('active', parseInt(c.dataset.filterDays, 10) === jnFilter.days); });
      applyAndRender();
      return;
    }

    /* State filter chips (multi-select) */
    var stateFilterChip = target.closest('[data-filter-state]');
    if (stateFilterChip) {
      var sv = stateFilterChip.dataset.filterState;
      var si = jnFilter.state.indexOf(sv);
      if (si === -1) jnFilter.state.push(sv); else jnFilter.state.splice(si, 1);
      stateFilterChip.classList.toggle('active', jnFilter.state.indexOf(sv) !== -1);
      applyAndRender();
      return;
    }

    /* Care filter chips (multi-select) */
    var careFilterChip = target.closest('[data-filter-care]');
    if (careFilterChip) {
      var cv = careFilterChip.dataset.filterCare;
      var ci = jnFilter.care.indexOf(cv);
      if (ci === -1) jnFilter.care.push(cv); else jnFilter.care.splice(ci, 1);
      careFilterChip.classList.toggle('active', jnFilter.care.indexOf(cv) !== -1);
      applyAndRender();
      return;
    }

    /* Clear all filters */
    if (target.id === 'jn-filter-clear') {
      jnFilter = { query: '', days: 0, care: [], state: [] };
      var searchEl2 = document.getElementById('jn-entry-search');
      if (searchEl2) searchEl2.value = '';
      document.querySelectorAll('[data-filter-days]').forEach(function (c) { c.classList.toggle('active', parseInt(c.dataset.filterDays, 10) === 0); });
      document.querySelectorAll('[data-filter-state],[data-filter-care]').forEach(function (c) { c.classList.remove('active'); });
      applyAndRender();
      return;
    }

    /* Entry edit button */
    var entryEditBtn = target.closest('.tl-entry-edit-btn');
    if (entryEditBtn && entryEditBtn.dataset.entryId) {
      openEntryModal(entryEditBtn.dataset.entryId);
      return;
    }

    /* Entry delete button (inside edit modal) */
    if (target.id === 'jn-entry-delete-btn') {
      var editId = document.getElementById('jn-entry-editing-id');
      if (!editId || !editId.value) return;
      if (!confirm(T('confirm_delete_entry'))) return;
      var d = loadData();
      var tank = getActiveTank(d);
      if (!tank) return;
      tank.entries = tank.entries.filter(function (en) { return en.id !== editId.value; });
      saveData(d);
      closeAllModals();
      renderDashboard();
      showJnToast(T('entry_removed_toast'), 'passed');
      return;
    }

    /* Family management modal — card Edit button */
    if (target.id === 'jn-family-edit-btn') { openFamilyModal(); return; }

    /* Family management modal — list view Edit per resident */
    var famListEdit = target.closest('.jn-fam-list-edit');
    if (famListEdit && famListEdit.dataset.inhId) {
      openInhabitantModal(famListEdit.dataset.inhId);
      return;
    }

    /* Family management modal — list view Delete per resident */
    var famListDel = target.closest('.jn-fam-list-del');
    if (famListDel && famListDel.dataset.inhId) {
      var delD = loadData(); var delTank = getActiveTank(delD);
      if (!delTank || !delTank.inhabitants) return;
      var delInh2 = delTank.inhabitants.find(function (i) { return i.id === famListDel.dataset.inhId; });
      var delName2 = delInh2 ? (delInh2.commonName || delInh2.species || T('this_resident_fallback')) : T('this_resident_fallback');
      if (!confirm(T('confirm_remove_resident', { name: delName2 }))) return;
      delTank.inhabitants = delTank.inhabitants.filter(function (i) { return i.id !== famListDel.dataset.inhId; });
      saveData(delD);
      renderDashboard();
      renderFamilyList();
      return;
    }

    /* Family management modal — add resident button */
    if (target.id === 'jn-inh-list-add') { openInhabitantModal(); return; }

    /* Family management modal — back button */
    if (target.id === 'jn-inh-back-btn') { renderFamilyList(); showFamilyView('list'); return; }

    /* Treatment/dosing note toggle */
    var careChipTreat = target.closest('.jn-care-chip[data-care="treatment"],.jn-care-chip[data-care="dosing"]');
    if (careChipTreat) {
      var treatRow2 = document.getElementById('jn-treatment-note-row');
      if (treatRow2) {
        var anyTreat = document.querySelector('.jn-care-chip[data-care="treatment"].active, .jn-care-chip[data-care="dosing"].active');
        treatRow2.style.display = anyTreat ? '' : 'none';
      }
    }

    var catChip = target.closest('.jn-inh-cat-chip');
    if (catChip && catChip.closest('#mt-modal-inhabitant')) {
      document.querySelectorAll('.jn-inh-cat-chip').forEach(function (c) { c.classList.remove('active'); });
      catChip.classList.add('active');
      return;
    }

    /* tl-inh-row no longer needs expand/collapse — actions are always visible */

    /* Status chip toggle inside resident modal */
    var statusChip = target.closest('.jn-inh-status-chip');
    if (statusChip && statusChip.closest('#mt-modal-inhabitant')) {
      document.querySelectorAll('.jn-inh-status-chip').forEach(function (c) { c.classList.remove('active'); });
      statusChip.classList.add('active');
      return;
    }

    /* Delete resident button */
    if (target.id === 'jn-inh-delete-btn') {
      var delEditingEl = document.getElementById('jn-inh-editing-id');
      var delId = delEditingEl ? delEditingEl.value : '';
      if (!delId) return;
      var d3 = loadData();
      var tank3 = getActiveTank(d3);
      if (!tank3 || !tank3.inhabitants) return;
      var delInh = tank3.inhabitants.find(function (i) { return i.id === delId; });
      var delName = delInh ? (delInh.commonName || delInh.species || T('this_resident_fallback')) : T('this_resident_fallback');
      if (!confirm(T('confirm_remove_resident_entirely', { name: delName }))) return;
      tank3.inhabitants = tank3.inhabitants.filter(function (i) { return i.id !== delId; });
      saveData(d3);
      renderDashboard();
      showJnToast(T('resident_removed_toast', { name: delName }), 'passed');
      renderFamilyList();
      showFamilyView('list');
      return;
    }
  });

  var formSetup = document.getElementById('mt-form-setup');
  if (formSetup) {
    formSetup.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
      var d = loadData();
      var volVal = g('mt-inp-volume');
      var unitVal = g('mt-inp-unit') || 'L';
      var defaultName = volVal ? T('auto_tank_name', { vol: volVal, unit: unitVal }) : T('my_tank_fallback');
      var newProfile = {
        name:      g('mt-inp-name') || defaultName,
        volume:    volVal,
        unit:      unitVal,
        shape:     g('mt-inp-shape') || 'rect',
        type:      g('mt-inp-type') || 'freshwater',
        setupDate: g('mt-inp-date')
      };
      var editingId = formSetup.dataset.editingId;
      if (editingId) {
        for (var ti = 0; ti < d.tanks.length; ti++) {
          if (d.tanks[ti].id === editingId) { d.tanks[ti].profile = newProfile; break; }
        }
      } else {
        var newTank = { id: 'tank_' + Date.now(), profile: newProfile, entries: [], inhabitants: [] };
        d.tanks.push(newTank);
        d.activeTankId = newTank.id;
      }
      var isNew = !editingId;
      saveData(d);
      resetSetupModal();
      closeAllModals();
      renderDashboard();
      if (isNew) window.go('tank-log', true);
    });
  }

  var formEntry = document.getElementById('jn-form-entry');
  if (formEntry) {
    formEntry.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = loadData();
      var tank = getActiveTank(d);
      if (!tank) return;
      if (!tank.entries) tank.entries = [];
      var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
      var activeState = document.querySelector('.jn-state-chip.active');
      var care = Array.prototype.slice.call(document.querySelectorAll('.jn-care-chip.active')).map(function (c) { return c.dataset.care; });
      var editingId = g('jn-entry-editing-id');
      var ph = g('jn-param-ph'), nh3 = g('jn-param-nh3'), no2 = g('jn-param-no2'), no3 = g('jn-param-no3'), temp = g('jn-param-temp');
      var gh = g('jn-param-gh'), kh = g('jn-param-kh'), sg = g('jn-param-sg');
      var treatmentNote = g('jn-treatment-note');
      var params = null;
      if (ph || nh3 || no2 || no3 || temp || gh || kh || sg) {
        params = { ph: ph, nh3: nh3, no2: no2, no3: no3, temp: temp };
        if (gh) params.gh = gh;
        if (kh) params.kh = kh;
        if (sg) params.sg = sg;
      }
      if (editingId) {
        for (var ei = 0; ei < tank.entries.length; ei++) {
          if (tank.entries[ei].id === editingId) {
            tank.entries[ei].date = g('jn-entry-date') || todayStr();
            tank.entries[ei].keeperState = activeState ? activeState.dataset.state : tank.entries[ei].keeperState;
            tank.entries[ei].observation = g('jn-entry-obs');
            tank.entries[ei].care = care;
            tank.entries[ei].params = params;
            if (treatmentNote) tank.entries[ei].treatmentNote = treatmentNote;
            else delete tank.entries[ei].treatmentNote;
            break;
          }
        }
        tank.entries.sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : (a.date || '') > (b.date || '') ? 1 : 0; });
      } else {
        var entry = {
          id: 'e_' + Date.now(),
          date: g('jn-entry-date') || todayStr(),
          keeperState: activeState ? activeState.dataset.state : '',
          observation: g('jn-entry-obs'),
          care: care,
          params: params
        };
        if (treatmentNote) entry.treatmentNote = treatmentNote;
        tank.entries.push(entry);
      }
      saveData(d);
      closeAllModals();
      renderDashboard();
      checkStreakMilestone(tank.entries);
    });
  }

  var formInhabitant = document.getElementById('jn-form-inhabitant');
  if (formInhabitant) {
    formInhabitant.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = loadData();
      var tank = getActiveTank(d);
      if (!tank) return;
      if (!tank.inhabitants) tank.inhabitants = [];
      var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var activeCat = document.querySelector('.jn-inh-cat-chip.active');
      var editingId = g('jn-inh-editing-id');
      if (editingId) {
        var activeStatusChip = document.querySelector('.jn-inh-status-chip.active');
        var newStatus = activeStatusChip ? activeStatusChip.dataset.status : 'active';
        for (var ii = 0; ii < tank.inhabitants.length; ii++) {
          if (tank.inhabitants[ii].id === editingId) {
            tank.inhabitants[ii].category  = activeCat ? activeCat.dataset.cat : tank.inhabitants[ii].category;
            tank.inhabitants[ii].commonName = g('jn-inh-common') || tank.inhabitants[ii].commonName;
            tank.inhabitants[ii].species    = g('jn-inh-species');
            tank.inhabitants[ii].name       = g('jn-inh-name');
            tank.inhabitants[ii].count      = parseInt(g('jn-inh-count'), 10) || tank.inhabitants[ii].count;
            tank.inhabitants[ii].addedDate  = g('jn-inh-date') || tank.inhabitants[ii].addedDate;
            var prevStatus = tank.inhabitants[ii].status;
            tank.inhabitants[ii].status = newStatus;
            if (newStatus !== 'active' && prevStatus === 'active') {
              tank.inhabitants[ii].removedDate = todayStr();
            } else if (newStatus === 'active') {
              tank.inhabitants[ii].removedDate = null;
            }
            break;
          }
        }
        saveData(d);
        renderDashboard();
        showJnToast(T('resident_updated_toast'), 'welcome');
        renderFamilyList();
        showFamilyView('list');
      } else {
        var inh = {
          id:         'inh_' + Date.now(),
          category:   activeCat ? activeCat.dataset.cat : 'fish',
          commonName: g('jn-inh-common'),
          species:    g('jn-inh-species'),
          name:       g('jn-inh-name'),
          count:      parseInt(g('jn-inh-count'), 10) || 1,
          addedDate:  g('jn-inh-date') || todayStr(),
          status:     'active',
          removedDate: null,
          removedNote: null
        };
        tank.inhabitants.push(inh);
        saveData(d);
        renderDashboard();
        showInhabitantToast(inh, 'added');
        renderFamilyList();
        showFamilyView('list');
      }
    });
  }

  /* ── Gear modal: open from setup card ── */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.id === 'jn-setup-edit-btn' || t.id === 'jn-setup-start-btn') {
      openGearModal();
      return;
    }
  });

  /* ── Gear modal: form submit ── */
  var formGear = document.getElementById('jn-form-setup');
  if (formGear) {
    formGear.addEventListener('submit', function (e) {
      e.preventDefault();
      saveGearModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllModals();
  });

  /* ── Setup UI: populate preset chips ── */
  var presetGrid = document.getElementById('mt-preset-grid');
  if (presetGrid) {
    PRESETS.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mt-preset-chip';
      btn.dataset.vol   = p.v;
      btn.dataset.unit  = p.u;
      btn.dataset.shape = p.s;
      btn.dataset.dims  = p.d.join(',');
      btn.innerHTML = '<span class="mt-preset-vol">' + p.v + ' ' + p.u + '</span>'
        + '<span class="mt-preset-cat" style="color:' + (CAT_COLORS[p.cat] || 'var(--th-ink-3)') + '">' + p.cat + '</span>';
      presetGrid.appendChild(btn);
    });
  }

  /* ── Setup UI: populate brand buttons ── */
  var brandSel = document.getElementById('mt-brand-selector');
  if (brandSel) {
    Object.keys(BRANDS).forEach(function (key) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mt-brand-btn';
      btn.dataset.brand = key;
      btn.textContent = BRANDS[key].label;
      brandSel.appendChild(btn);
    });
  }

  /* ── Setup UI: chip / tab / unit click handler ── */
  document.addEventListener('click', function (e) {
    /* Tab switching */
    var stab = e.target.closest('.mt-stab');
    if (stab && stab.closest('#mt-modal-setup')) {
      document.querySelectorAll('#mt-modal-setup .mt-stab').forEach(function (t) {
        t.classList.remove('active'); t.setAttribute('aria-selected', 'false');
      });
      stab.classList.add('active'); stab.setAttribute('aria-selected', 'true');
      var panel = stab.dataset.stab;
      ['preset', 'brand', 'custom'].forEach(function (p) {
        var el = document.getElementById('mt-panel-' + p);
        if (el) el.style.display = (p === panel) ? '' : 'none';
      });
      return;
    }

    /* Preset chip */
    var chip = e.target.closest('.mt-preset-chip');
    if (chip) {
      document.querySelectorAll('.mt-preset-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var vol  = parseFloat(chip.dataset.vol);
      var unit = chip.dataset.unit  || 'L';
      var shp  = chip.dataset.shape || 'rect';
      var dims = chip.dataset.dims  ? chip.dataset.dims.split(',').map(Number) : null;
      setHiddenInputs(vol, unit, shp);
      updatePreview(vol, unit, shp, dims);
      var nameEl = document.getElementById('mt-inp-name');
      if (nameEl) nameEl.value = T('auto_tank_name', { vol: vol, unit: unit });
      return;
    }

    /* Brand button */
    var brandBtn = e.target.closest('.mt-brand-btn');
    if (brandBtn) {
      document.querySelectorAll('.mt-brand-btn').forEach(function (b) { b.classList.remove('active'); });
      brandBtn.classList.add('active');
      var brand = BRANDS[brandBtn.dataset.brand];
      var modelSel = document.getElementById('mt-model-selector');
      if (modelSel && brand) {
        modelSel.style.display = '';
        modelSel.innerHTML = brand.models.map(function (m) {
          return '<button type="button" class="mt-model-chip"'
            + ' data-vol="' + m.v + '" data-unit="' + m.u + '" data-shape="' + m.s + '"'
            + ' data-dims="' + m.d.join(',') + '" data-name="' + brand.label + ' ' + m.n + '">'
            + m.n + '<span style="opacity:.42"> · ' + m.v + ' ' + m.u + '</span></button>';
        }).join('');
      }
      return;
    }

    /* Model chip */
    var modelChip = e.target.closest('.mt-model-chip');
    if (modelChip) {
      document.querySelectorAll('.mt-model-chip').forEach(function (c) { c.classList.remove('active'); });
      modelChip.classList.add('active');
      var vol  = parseFloat(modelChip.dataset.vol);
      var unit = modelChip.dataset.unit  || 'L';
      var shp  = modelChip.dataset.shape || 'rect';
      var dims = modelChip.dataset.dims  ? modelChip.dataset.dims.split(',').map(Number) : null;
      setHiddenInputs(vol, unit, shp);
      updatePreview(vol, unit, shp, dims);
      var mname  = modelChip.dataset.name || '';
      var nameEl = document.getElementById('mt-inp-name');
      if (nameEl && mname) nameEl.value = mname;
      return;
    }

    /* Dimension unit toggle */
    var unitBtn = e.target.closest('.mt-unit-btn');
    if (unitBtn && unitBtn.closest('#mt-panel-custom')) {
      document.querySelectorAll('#mt-panel-custom .mt-unit-btn').forEach(function (b) { b.classList.remove('active'); });
      unitBtn.classList.add('active');
      recalcCustom();
      return;
    }
  });

  /* ── Custom dimension inputs ── */
  ['mt-dim-l', 'mt-dim-w', 'mt-dim-h'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', recalcCustom);
  });

  /* ── Reset setup modal when opened fresh ── */
  (function () {
    var openBtn = document.getElementById('mt-setup-open');
    if (openBtn) {
      openBtn.addEventListener('click', function () { resetSetupModal(); }, true);
    }
  }());

  /* ── Hook go() to re-render on journal/tank-log navigation ── */
  (function () {
    var _origGo = window.go;
    window.go = function (id, push) {
      _origGo.call(window, id, push);
      if (id === 'journal') renderJournalOverview();
      else if (id === 'tank-log') renderDashboard();
    };
  }());

  renderDashboard();
})();
