// ── Source metadata ───────────────────────────────────────────────────────────
// This metadata describes the authenticity and review status of each text category.
// Used by the validator and displayed in the Sources page.
// A text is "verified" only when nothing in it still needs review.
import { prayerSurahAyahs } from "./prayerAyahs.js";
import { getAyahAudioUrl } from "../utils/quranAudio.js";

export const NAMAZ_MADHAB = "hanafi";

export const namazSourceMetadata = {
  quranAyahs: {
    texts: ["Al-Fatiha (1:1-7)", "Al-Ikhlas (112:1-4)"],
    source: "Коран: Tanzil Uthmani 1.1, строки совпадают с файлом издателя. Аудио: EveryAyah, чтение Мишари Рашида Аль-Афаси.",
    verified: true,
    needsReview: false
  },
  order: {
    texts: ["Порядок действий и положения тела"],
    source: "Упрощённый порядок фард-намаза по ханафитскому мазхабу, отдельно для мальчиков и девочек. Не заменяет обучение у имама или учителя; требует проверки специалистом перед публичным выпуском.",
    verified: false,
    needsReview: true
  },
  tashahhud: {
    texts: ["Ат-тахийяту..."],
    source: "Ташаххуд Ибн Мас'уда: Бухари 831, Муслим 402. Эту версию используют ханафиты.",
    verified: true,
    needsReview: false
  },
  salawat: {
    texts: ["Аллахумма салли аля Мухаммад..."],
    source: "Ибрахимийская салават, передал Ка'б ибн Уджра: Бухари 3370, Муслим 406.",
    verified: true,
    needsReview: false
  },
  rukuDhikr: {
    texts: ["Субхана Раббиял-Азыым"],
    source: "Муслим 772.",
    verified: true,
    needsReview: false
  },
  sujudDhikr: {
    texts: ["Субхана Раббиял-Аля"],
    source: "Муслим 772.",
    verified: true,
    needsReview: false
  },
  sana: {
    texts: ["Субханакал-лахумма..."],
    source: "Дуа ас-сана (Абу Дауд 775, Тирмизи 243) — открывающее дуа, принятое у ханафитов. В других мазхабах читают иные открывающие дуа.",
    verified: false,
    needsReview: true
  },
  closingDua: {
    texts: ["Аллахумма инни залямту нафси..."],
    source: "Дуа, которому Пророк ﷺ научил Абу Бакра для намаза: Бухари 834, Муслим 2705.",
    verified: false,
    needsReview: true
  },
  transliteration: {
    source: "Транслитерация создана для русскоязычных детей и приблизительна. Правильное произношение ставит учитель.",
    verified: false,
    needsReview: true
  }
};

// Postures differ for boys and girls in the Hanafi school. Each note is short enough for a child.
const POSTURE_NOTES = {
  male: {
    takbir: "Подними руки так, чтобы большие пальцы коснулись мочек ушей, ладони смотрят в сторону Киблы.",
    standing: "Положи правую руку на левую ниже пупка, обхватив запястье левой руки.",
    ruku: "Наклонись: спина и голова на одной линии, ладони обхватывают колени, пальцы раздвинуты.",
    sujud: "Опустись на колени, затем руки, нос и лоб. Ладони у ушей, локти подняты и отведены от боков, живот не касается бёдер. Пальцы ног направлены к Кибле.",
    sitting: "Сядь на левую стопу, правая стопа стоит вертикально, пальцы к Кибле. Руки на бёдрах."
  },
  female: {
    takbir: "Подними руки до уровня плеч, не открывая их из-под одежды.",
    standing: "Положи руки на грудь: правая ладонь поверх левой.",
    ruku: "Наклонись немного, пальцы сомкнуты и лежат на коленях, руки прижаты к телу.",
    sujud: "Опустись компактно: руки прижаты к бокам, предплечья лежат на полу, живот касается бёдер.",
    sitting: "Сядь на пол, обе стопы выведи вправо. Руки на бёдрах, пальцы сомкнуты."
  }
};

const TASHAHHUD_FINGER_NOTE = "На словах «ля иляха» подними указательный палец правой руки, на «илля-Ллах» опусти.";

// ── Аудио: EveryAyah, рецитация Аль-Афаси ───────────────────────────────────
function prayerQuranAyahs(number) {
  return (prayerSurahAyahs[number] || []).map((ayah) => ({
    number: ayah.number,
    arabic: ayah.arabic,
    translit: "",
    translation: "",
    audioUrl: getAyahAudioUrl(number, ayah.number)
  }));
}

const FATIHA_AYAHS = prayerQuranAyahs(1);
const IKHLAS_AYAHS = prayerQuranAyahs(112);

const TASHAHHUD_PARTS = [
  { arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ", translit: "Ат-тахийяту лилляhи вас-салявату ват-тайибаату.", translation: "Приветствия — Аллаху, а также молитвы и всё благое." },
  { arabic: "السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ", translit: "Ас-саляму 'аляйка айюhан-набийю ва рахматуллааhи ва баракаатуh.", translation: "Мир тебе, о Пророк, милость Аллаха и Его благодать." },
  { arabic: "السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ", translit: "Ас-саляму 'аляйна ва 'аляя 'ибаадилляhис-сааллихиин.", translation: "Мир нам и праведным рабам Аллаха." },
  { arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", translit: "Ашhаду алля иляяhа илляллааhу ва ашhаду анна Мухаммадан 'абдуhу ва расуулюh.", translation: "Свидетельствую, что нет божества, кроме Аллаха, и свидетельствую, что Мухаммад — Его раб и посланник." }
];

const SALAWAT_PARTS = [
  { arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ", translit: "Аллааhумма салли 'аляя Мухаммадин ва 'аляя ааали Мухаммад.", translation: "О Аллах, восхвали Мухаммада и семью Мухаммада," },
  { arabic: "كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ", translit: "Кяма салляйта 'аляя Ибраhима ва 'аляя ааали Ибраhима иннака хамиидун маджиид.", translation: "как Ты восхвалил Ибрахима и семью Ибрахима. Поистине, Ты — Достохвальный, Славный." },
  { arabic: "اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ", translit: "Аллааhумма баарик 'аляя Мухаммадин ва 'аляя ааали Мухаммад.", translation: "О Аллах, ниспошли благодать Мухаммаду и семье Мухаммада," },
  { arabic: "كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ", translit: "Кяма бааракта 'аляя Ибраhима ва 'аляя ааали Ибраhима иннака хамиидун маджиид.", translation: "как Ты ниспослал благодать Ибрахиму и семье Ибрахима. Поистине, Ты — Достохвальный, Славный." }
];

const CLOSING_DUA = {
  arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
  translit: "Аллааhумма инни залямту нафси зульман касиран, ва ляя ягфируз-зунуба илляя Анта, фагфирли магфиратан мин 'индика, вархамни, иннака Антал-Гафуурур-Рахиим.",
  translation: "О Аллах, я много поступал несправедливо по отношению к себе, а грехи прощаешь только Ты. Прости меня Своим прощением и помилуй меня. Поистине, Ты — Прощающий, Милосердный."
};

// Prayers in which the first two rak'ahs are recited aloud by an imam.
const AUDIBLE_PRAYERS = new Set(["fajr", "maghrib", "isha"]);

// ── Генератор шагов намаза ────────────────────────────────────────────────────
function sec(label, color = "#F5EAD4") {
  return { type: "section", label, color };
}

function step(position, note, items) {
  return { type: "step", position, note: note || null, items: items || [] };
}

function ayah(arabic, translit, translation, repeat, audioUrl = null) {
  return { arabic, translit, translation, repeat: repeat || null, audioUrl };
}

function recitationNote(prayer, n) {
  if (n > 2) return "Читай Фатиху тихо.";
  if (AUDIBLE_PRAYERS.has(prayer.id)) {
    return "В этом намазе имам читает вслух. Если молишься один, можно читать вслух или тихо.";
  }
  return "В Зухре и Асре Фатиху и суру читают тихо.";
}

function buildRakaat(n, prayer, postures) {
  const total = prayer.rakaats;
  const items = [];
  const isFirst = n === 1;
  const isLast = n === total;
  const isMiddleTashahhud = n === 2 && total > 2;
  const [basmala, ...fatihaVerses] = FATIHA_AYAHS;

  if (isFirst) {
    items.push(sec("ДУА САНА (1-Й РАКААТ)"));
    items.push(step("standing_folded", `${postures.standing} Читай тихо.`, [
      ayah("سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
        "Субhааналлааhумма ва биhамдика ва табаракасмука ва та'аляя джаддука ва ляя иляяhа гайрук.",
        "Пречист Ты, о Аллах, и хвала Тебе. Благословенно Твоё имя, превыше всего Твоё величие, и нет божества, кроме Тебя."),
      ayah("أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", "А'уузу биллааhи минаш-шайтаанир-раджиим.", "Прибегаю к Аллаху от проклятого шайтана.")
    ]));
  }

  items.push(sec(`СУРА АЛЬ-ФАТИХА (${n}-Й РАКААТ)`));
  items.push(step("standing_folded", "Перед Фатихой тихо произнеси «Бисмилляхир-рахманир-рахим».", [
    ayah(basmala.arabic, "Бисмилляhир-Рахмаанир-Рахиим.", "", null, basmala.audioUrl)
  ]));
  items.push(step("standing_folded", `${recitationNote(prayer, n)} После Фатихи тихо скажи «Амин».`,
    fatihaVerses.map((a) => ayah(a.arabic, a.translit, a.translation, null, a.audioUrl))
  ));

  if (n <= 2) {
    items.push(sec(`СУРА ПОСЛЕ ФАТИХИ (${n}-Й РАКААТ)`, "#dcfce7"));
    items.push(step("standing_folded", "После Фатихи прочитай любую суру или несколько аятов. Например, Аль-Ихлас:",
      IKHLAS_AYAHS.map((a) => ayah(a.arabic, a.translit, a.translation, null, a.audioUrl))
    ));
  }

  items.push(sec(`ПОЯСНОЙ ПОКЛОН — РУКУ' (${n}-Й РАКААТ)`));
  items.push(step("ruku", `Со словами «Аллаху акбар» сделай поклон. ${postures.ruku}`, [
    ayah("سُبْحَانَ رَبِّيَ الْعَظِيمِ", "Субhаана Раббийаль-'Азыым.", "Пречист мой Господь Великий.", "×3")
  ]));

  items.push(sec(`ВЫПРЯМЛЕНИЕ (${n}-Й РАКААТ)`));
  items.push(step("standing", "Поднимись и полностью выпрямись, руки опущены вдоль тела. Если молишься один, скажи обе фразы; за имамом — только вторую.", [
    ayah("سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ", "Сами'аллааhу лиман hамидаh.", "Аллах слышит того, кто восхваляет Его."),
    ayah("رَبَّنَا لَكَ الْحَمْدُ", "Раббана ляка аль-хамд.", "Господь наш, Тебе хвала.")
  ]));

  items.push(sec(`ЗЕМНОЙ ПОКЛОН — СУДЖУД 1 (${n}-Й РАКААТ)`));
  items.push(step("sujud", `Со словами «Аллаху акбар» опустись в земной поклон. ${postures.sujud}`, [
    ayah("سُبْحَانَ رَبِّيَ الْأَعْلَى", "Субhаана Раббийаль-А'ляя.", "Пречист мой Господь Всевышний.", "×3")
  ]));

  items.push(sec(`СИДЕНИЕ МЕЖДУ ПОКЛОНАМИ (${n}-Й РАКААТ)`));
  items.push(step("sitting", `Со словами «Аллаху акбар» сядь. ${postures.sitting} Посиди спокойно; можно тихо сказать:`, [
    ayah("رَبِّ اغْفِرْ لِي", "Раббигфир лий.", "Господь мой, прости меня.")
  ]));

  items.push(sec(`ЗЕМНОЙ ПОКЛОН — СУДЖУД 2 (${n}-Й РАКААТ)`));
  items.push(step("sujud", "Со словами «Аллаху акбар» сделай второй земной поклон так же, как первый.", [
    ayah("سُبْحَانَ رَبِّيَ الْأَعْلَى", "Субhаана Раббийаль-А'ляя.", "Пречист мой Господь Всевышний.", "×3")
  ]));

  if (isMiddleTashahhud) {
    items.push(sec("ПЕРВЫЙ ТАШАХХУД"));
    items.push(step("sitting", `${postures.sitting} Прочитай только ташаххуд. ${TASHAHHUD_FINGER_NOTE}`,
      TASHAHHUD_PARTS.map((a) => ayah(a.arabic, a.translit, a.translation))
    ));
    items.push(sec("ПОДЪЁМ НА СЛЕДУЮЩИЙ РАКААТ"));
    items.push(step("standing", "Со словами «Аллаху акбар» встань. В следующих ракаатах фард-намаза читают только Фатиху, без суры.", []));
  }

  if (isLast) {
    items.push(sec("ПОСЛЕДНИЙ ТАШАХХУД"));
    items.push(step("sitting", `${postures.sitting} ${TASHAHHUD_FINGER_NOTE}`,
      TASHAHHUD_PARTS.map((a) => ayah(a.arabic, a.translit, a.translation))
    ));

    items.push(sec("САЛАВАТ"));
    items.push(step("sitting", "После ташаххуда в последнем ракаате прочитай салават.",
      SALAWAT_PARTS.map((a) => ayah(a.arabic, a.translit, a.translation))
    ));

    items.push(sec("ДУА ПЕРЕД САЛЯМОМ"));
    items.push(step("sitting", "Можно попросить Аллаха словами, которым Пророк ﷺ научил Абу Бакра:", [
      ayah(CLOSING_DUA.arabic, CLOSING_DUA.translit, CLOSING_DUA.translation)
    ]));

    items.push(sec("ЗАВЕРШЕНИЕ — САЛЯМ", "#dcfce7"));
    items.push(step("sitting", "Поверни голову вправо и произнеси салям, затем поверни влево и повтори:", [
      ayah("السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", "Ас-саляму 'аляйкум ва рахматуллааh.", "Мир вам и милость Аллаха.")
    ]));
  }

  return items;
}

// gender: "male" | "female" — postures follow the Hanafi school for each.
export function buildPrayerGuide(prayer, { gender = "male" } = {}) {
  const postures = POSTURE_NOTES[gender] || POSTURE_NOTES.male;
  const items = [];

  items.push(sec("ПЕРЕД НАМАЗОМ", "#e0f2fe"));
  items.push(step("standing", `Сделай омовение, надень чистую одежду, закрывающую тело (девочкам — всё, кроме лица и кистей рук), встань лицом к Кибле и намерься в сердце: «${prayer.name}, фард, ${prayer.rakaats} ракаата». Намерение произносить вслух не обязательно.`, []));

  items.push(sec("ВСТУПИТЕЛЬНЫЙ ТАКБИР"));
  items.push(step("takbir", postures.takbir, [
    ayah("اللَّهُ أَكْبَرُ", "Аллааhу Акбар.", "Аллах превыше всего.")
  ]));

  for (let r = 1; r <= prayer.rakaats; r++) {
    items.push(...buildRakaat(r, prayer, postures));
  }

  return items;
}

export const PRAYERS = [
  { id: "fajr",    name: "Фаджр",  nameRu: "утренний",       arabic: "الفجر",  color: "#3B82F6", rakaats: 2, icon: "🌙" },
  { id: "dhuhr",   name: "Зухр",   nameRu: "полуденный",     arabic: "الظهر",  color: "#F59E0B", rakaats: 4, icon: "☀️"  },
  { id: "asr",     name: "Аср",    nameRu: "послеполуденный",arabic: "العصر",  color: "#EF7C00", rakaats: 4, icon: "🌤"  },
  { id: "maghrib", name: "Магриб", nameRu: "вечерний",       arabic: "المغرب", color: "#EF4444", rakaats: 3, icon: "🌇"  },
  { id: "isha",    name: "Иша",    nameRu: "ночной",         arabic: "العشاء", color: "#6366F1", rakaats: 4, icon: "⭐"  }
];
