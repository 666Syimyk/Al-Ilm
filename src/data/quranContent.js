export const quranSections = [
  { id: "reading", title: "Учиться читать", description: "Буквы, огласовки, слоги и слова", to: "/quran/path" },
  { id: "surahs", title: "Суры", description: "Читай, слушай и заучивай суры", to: "/quran/surahs" },
  { id: "juz", title: "Джузы", description: "Навигация по 30 частям Корана", to: "/quran/juz" },
  { id: "memorization", title: "Заучивание", description: "Повторяй аяты и сохраняй прогресс", to: "/quran/memorization" },
  { id: "tajweed", title: "Таджвид", description: "Учись читать Коран правильно", to: "/quran/tajweed" },
  { id: "reading-hints", title: "Чтение с подсказками", description: "Аяты, записи чтения и учебные пояснения", to: "/quran/reading" },
  { id: "allah-names", title: "99 имён Аллаха", description: "Имена Аллаха и их значения", to: "/quran/names" },
  { id: "prophets", title: "Пророки", description: "25 пророков: имена и истории", to: "/quran/prophets" },
  { id: "search", title: "Поиск по Корану", description: "Найди суру, аят или слово", to: "/quran/search" },
  { id: "bookmarks", title: "Закладки", description: "Сохранённые аяты и суры", to: "/quran/bookmarks" }
];

import tanzilCorpus from "./sources/tanzil-uthmani.json" with { type: "json" };

export const quranTextSource = {
  name: "Tanzil Project — Uthmani 1.1",
  url: tanzilCorpus.sourcePage,
  licenseUrl: tanzilCorpus.licenseUrl,
  downloadedAt: tanzilCorpus.downloadedAt,
  sha256: tanzilCorpus.sha256,
  copyrightNotice: tanzilCorpus.copyrightNotice,
  verification: "Exact match to the downloaded publisher file; not an independent theological review."
};

export const quranLevels = [
  {
    id: "preparation",
    level: 1,
    title: "Подготовка",
    lessons: ["Что такое Коран", "Что такое сура", "Что такое аят", "Как пользоваться разделом"]
  },
  {
    id: "letters",
    level: 2,
    title: "Арабские буквы",
    lessons: ["Связано с алфавитом", "Формы букв", "Похожие буквы", "Повторение"]
  },
  {
    id: "harakat",
    level: 3,
    title: "Огласовки",
    lessons: ["Фатха", "Касра", "Дамма", "Сукун", "Танвин", "Шадда", "Длинные звуки"]
  },
  {
    id: "syllables",
    level: 4,
    title: "Слоги",
    lessons: ["Чтение букв с огласовками", "Примеры: بَ بِ بُ", "Повторение слогов"]
  },
  {
    id: "words",
    level: 5,
    title: "Слова",
    lessons: ["Простые арабские слова", "Произношение", "Перевод", "Разбор по буквам"]
  },
  {
    id: "ayahs",
    level: 6,
    title: "Первые аяты",
    lessons: ["Слушать аят", "Читать по словам", "Повторять", "Проверять себя"]
  },
  {
    id: "short-surahs",
    level: 7,
    title: "Короткие суры",
    lessons: ["Аль-Фатиха", "Аль-Ихлас", "Аль-Фаляк", "Ан-Нас", "Аль-Каусар"]
  },
  {
    id: "tajweed",
    level: 8,
    title: "Таджвид",
    lessons: ["Махрадж", "Мадд", "Нун сакина и танвин", "Изхар", "Идгам", "Икляб", "Ихфа", "Калькаля", "Гунна", "Остановки"]
  }
];

export const quranRewards = [
  "Первые аяты",
  "Аль-Фатиха выучена",
  "Первые 5 сур",
  "Начинающий чтец",
  "Любитель Корана"
];

// The legacy translation has no established author, edition or permission.
// Preserve it only in the non-runtime recovery archive until source review.
export const translationSource = {
  name: "Русский перевод временно не показан",
  author: "Неустановлен точно",
  verified: false,
  needsReview: true,
  available: false,
  note: "Перевода смыслов на русский пока нет — показан только арабский текст."
};

// Returns verified word-by-word data only. Returns [] when unavailable.
// Never auto-generate meanings -- that produces fake unverified religious content.
export function getAyahWords(ayah) {
  if (ayah?.wordSource?.verified !== true || !ayah.wordSource.url) return [];
  if (!Array.isArray(ayah?.words) || ayah.words.length === 0) return [];
  return ayah.words.filter(
    (w) => w && w.arabic && !/^слово\s+\d+$/i.test(String(w.meaning || ""))
  );
}

// Previous editorial text is preserved in docs/reference/quranContent.legacy.js.txt.
const surahMetadata = [
  {
    "id": "al-fatihah",
    "number": 1,
    "title": "Аль-Фатиха",
    "arabicTitle": "الفاتحة",
    "translation": "Открывающая",
    "status": "читаю"
  },
  {
    "id": "al-kawthar",
    "number": 108,
    "title": "Аль-Каусар",
    "arabicTitle": "الكوثر",
    "translation": "Изобилие",
    "status": "читаю"
  },
  {
    "id": "an-nasr",
    "number": 110,
    "title": "Ан-Наср",
    "arabicTitle": "النصر",
    "translation": "Помощь",
    "status": "читаю"
  },
  {
    "id": "al-asr",
    "number": 103,
    "title": "Аль-Аср",
    "arabicTitle": "العصر",
    "translation": "Время",
    "status": "читаю"
  },
  {
    "id": "al-kafirun",
    "number": 109,
    "title": "Аль-Кафирун",
    "arabicTitle": "الكافرون",
    "translation": "Неверующие",
    "status": "читаю"
  },
  {
    "id": "al-masad",
    "number": 111,
    "title": "Аль-Масад",
    "arabicTitle": "المسد",
    "translation": "Пальмовые волокна",
    "status": "читаю"
  },
  {
    "id": "al-ikhlas",
    "number": 112,
    "title": "Аль-Ихлас",
    "arabicTitle": "الإخلاص",
    "translation": "Искренность",
    "status": "слушал"
  },
  {
    "id": "al-falaq",
    "number": 113,
    "title": "Аль-Фаляк",
    "arabicTitle": "الفلق",
    "translation": "Рассвет",
    "status": "читаю"
  },
  {
    "id": "an-nas",
    "number": 114,
    "title": "Ан-Нас",
    "arabicTitle": "الناس",
    "translation": "Люди",
    "status": "читаю"
  },
  {
    "id": "al-fil",
    "number": 105,
    "title": "Аль-Филь",
    "arabicTitle": "الفيل",
    "translation": "Слон",
    "status": "читаю"
  },
  {
    "id": "quraysh",
    "number": 106,
    "title": "Курайш",
    "arabicTitle": "قريش",
    "translation": "Курайшиты",
    "status": "читаю"
  },
  {
    "id": "al-maun",
    "number": 107,
    "title": "Аль-Ма'ун",
    "arabicTitle": "الماعون",
    "translation": "Помощь",
    "status": "читаю"
  },
  {
    "id": "al-qadr",
    "number": 97,
    "title": "Аль-Кадр",
    "arabicTitle": "القدر",
    "translation": "Ночь могущества",
    "status": "читаю"
  },
  {
    "id": "az-zalzalah",
    "number": 99,
    "title": "Аз-Зальзаля",
    "arabicTitle": "الزلزلة",
    "translation": "Землетрясение",
    "status": "читаю"
  },
  {
    "id": "at-takathur",
    "number": 102,
    "title": "Ат-Такасур",
    "arabicTitle": "التكاثر",
    "translation": "Стяжательство",
    "status": "читаю"
  },
  {
    "id": "al-humazah",
    "number": 104,
    "title": "Аль-Хумаза",
    "arabicTitle": "الهمزة",
    "translation": "Хулитель",
    "status": "читаю"
  },
  {
    "id": "ad-duha",
    "number": 93,
    "title": "Ад-Духа",
    "arabicTitle": "الضحى",
    "translation": "Утренние часы",
    "status": "читаю"
  },
  {
    "id": "ash-sharh",
    "number": 94,
    "title": "Аш-Шарх",
    "arabicTitle": "الشرح",
    "translation": "Раскрытие",
    "status": "читаю"
  },
  {
    "id": "at-tin",
    "number": 95,
    "title": "Ат-Тин",
    "arabicTitle": "التين",
    "translation": "Смоковница",
    "status": "не начато"
  },
  {
    "id": "an-naba",
    "number": 78,
    "title": "Ан-Наба",
    "arabicTitle": "النبأ",
    "translation": "Весть",
    "status": "читаю"
  },
  {
    "id": "an-naziat",
    "number": 79,
    "title": "Ан-Нази'ат",
    "arabicTitle": "النازعات",
    "translation": "Вырывающие",
    "status": "читаю"
  },
  {
    "id": "abasa",
    "number": 80,
    "title": "Абаса",
    "arabicTitle": "عبس",
    "translation": "Нахмурился",
    "status": "читаю"
  },
  {
    "id": "at-takwir",
    "number": 81,
    "title": "Ат-Таквир",
    "arabicTitle": "التكوير",
    "translation": "Свёртывание",
    "status": "читаю"
  },
  {
    "id": "al-infitar",
    "number": 82,
    "title": "Аль-Инфитар",
    "arabicTitle": "الانفطار",
    "translation": "Раскол",
    "status": "читаю"
  },
  {
    "id": "al-mutaffifin",
    "number": 83,
    "title": "Аль-Мутаффифин",
    "arabicTitle": "المطففين",
    "translation": "Обвешивающие",
    "status": "читаю"
  },
  {
    "id": "al-inshiqaq",
    "number": 84,
    "title": "Аль-Иншикак",
    "arabicTitle": "الانشقاق",
    "translation": "Раскол неба",
    "status": "читаю"
  },
  {
    "id": "al-buruj",
    "number": 85,
    "title": "Аль-Бурудж",
    "arabicTitle": "البروج",
    "translation": "Созвездия",
    "status": "читаю"
  },
  {
    "id": "at-tariq",
    "number": 86,
    "title": "Ат-Тарик",
    "arabicTitle": "الطارق",
    "translation": "Ночной странник",
    "status": "читаю"
  },
  {
    "id": "al-ala",
    "number": 87,
    "title": "Аль-А'ля",
    "arabicTitle": "الأعلى",
    "translation": "Всевышний",
    "status": "читаю"
  },
  {
    "id": "al-ghashiyah",
    "number": 88,
    "title": "Аль-Гашия",
    "arabicTitle": "الغاشية",
    "translation": "Сокрушающая",
    "status": "читаю"
  },
  {
    "id": "al-fajr",
    "number": 89,
    "title": "Аль-Фаджр",
    "arabicTitle": "الفجر",
    "translation": "Заря",
    "status": "читаю"
  },
  {
    "id": "al-balad",
    "number": 90,
    "title": "Аль-Балад",
    "arabicTitle": "البلد",
    "translation": "Город",
    "status": "читаю"
  },
  {
    "id": "ash-shams",
    "number": 91,
    "title": "Аш-Шамс",
    "arabicTitle": "الشمس",
    "translation": "Солнце",
    "status": "читаю"
  },
  {
    "id": "al-layl",
    "number": 92,
    "title": "Аль-Лайль",
    "arabicTitle": "الليل",
    "translation": "Ночь",
    "status": "читаю"
  },
  {
    "id": "al-alaq",
    "number": 96,
    "title": "Аль-Аляк",
    "arabicTitle": "العلق",
    "translation": "Сгусток крови",
    "status": "читаю"
  },
  {
    "id": "al-bayyinah",
    "number": 98,
    "title": "Аль-Баййина",
    "arabicTitle": "البينة",
    "translation": "Ясное знамение",
    "status": "читаю"
  },
  {
    "id": "al-adiyat",
    "number": 100,
    "title": "Аль-Адият",
    "arabicTitle": "العاديات",
    "translation": "Скачущие",
    "status": "читаю"
  },
  {
    "id": "al-qariah",
    "number": 101,
    "title": "Аль-Кариа",
    "arabicTitle": "القارعة",
    "translation": "Великое бедствие",
    "status": "читаю"
  },
  {
    "id": "al-baqara",
    "number": 2,
    "title": "Аль-Бакара",
    "arabicTitle": "البقرة",
    "translation": "Корова",
    "status": "читаю"
  },
  {
    "id": "ali-imran",
    "number": 3,
    "title": "Али Имран",
    "arabicTitle": "آل عمران",
    "translation": "Семья Имрана",
    "status": "читаю"
  },
  {
    "id": "an-nisa",
    "number": 4,
    "title": "Ан-Ниса",
    "arabicTitle": "النساء",
    "translation": "Женщины",
    "status": "читаю"
  },
  {
    "id": "al-maida",
    "number": 5,
    "title": "Аль-Маида",
    "arabicTitle": "المائدة",
    "translation": "Трапеза",
    "status": "читаю"
  },
  {
    "id": "al-anam",
    "number": 6,
    "title": "Аль-Анам",
    "arabicTitle": "الأنعام",
    "translation": "Скот",
    "status": "читаю"
  },
  {
    "id": "al-araf",
    "number": 7,
    "title": "Аль-Аараф",
    "arabicTitle": "الأعراف",
    "translation": "Преграды",
    "status": "читаю"
  },
  {
    "id": "al-anfal",
    "number": 8,
    "title": "Аль-Анфаль",
    "arabicTitle": "الأنفال",
    "translation": "Добыча",
    "status": "читаю"
  },
  {
    "id": "at-tawbah",
    "number": 9,
    "title": "Ат-Тауба",
    "arabicTitle": "التوبة",
    "translation": "Покаяние",
    "status": "читаю"
  },
  {
    "id": "yunus",
    "number": 10,
    "title": "Юнус",
    "arabicTitle": "يونس",
    "translation": "Юнус",
    "status": "читаю"
  },
  {
    "id": "hud",
    "number": 11,
    "title": "Худ",
    "arabicTitle": "هود",
    "translation": "Худ",
    "status": "читаю"
  },
  {
    "id": "yusuf",
    "number": 12,
    "title": "Юсуф",
    "arabicTitle": "يوسف",
    "translation": "Юсуф",
    "status": "читаю"
  },
  {
    "id": "ar-rad",
    "number": 13,
    "title": "Ар-Раад",
    "arabicTitle": "الرعد",
    "translation": "Гром",
    "status": "читаю"
  },
  {
    "id": "ibrahim",
    "number": 14,
    "title": "Ибрахим",
    "arabicTitle": "إبراهيم",
    "translation": "Ибрахим",
    "status": "читаю"
  },
  {
    "id": "al-hijr",
    "number": 15,
    "title": "Аль-Хиджр",
    "arabicTitle": "الحجر",
    "translation": "Хиджр",
    "status": "читаю"
  },
  {
    "id": "an-nahl",
    "number": 16,
    "title": "Ан-Нахль",
    "arabicTitle": "النحل",
    "translation": "Пчёлы",
    "status": "читаю"
  },
  {
    "id": "al-isra",
    "number": 17,
    "title": "Аль-Исра",
    "arabicTitle": "الإسراء",
    "translation": "Ночное путешествие",
    "status": "читаю"
  },
  {
    "id": "al-kahf",
    "number": 18,
    "title": "Аль-Кяхф",
    "arabicTitle": "الكهف",
    "translation": "Пещера",
    "status": "читаю"
  },
  {
    "id": "maryam",
    "number": 19,
    "title": "Марьям",
    "arabicTitle": "مريم",
    "translation": "Марьям",
    "status": "читаю"
  },
  {
    "id": "ta-ha",
    "number": 20,
    "title": "Та Ха",
    "arabicTitle": "طه",
    "translation": "Та Ха",
    "status": "читаю"
  },
  {
    "id": "al-anbiya",
    "number": 21,
    "title": "Аль-Анбия",
    "arabicTitle": "الأنبياء",
    "translation": "Пророки",
    "status": "читаю"
  },
  {
    "id": "al-hajj",
    "number": 22,
    "title": "Аль-Хадж",
    "arabicTitle": "الحج",
    "translation": "Паломничество",
    "status": "читаю"
  },
  {
    "id": "al-muminun",
    "number": 23,
    "title": "Аль-Муминун",
    "arabicTitle": "المؤمنون",
    "translation": "Верующие",
    "status": "читаю"
  },
  {
    "id": "an-nur",
    "number": 24,
    "title": "Ан-Нур",
    "arabicTitle": "النور",
    "translation": "Свет",
    "status": "читаю"
  },
  {
    "id": "al-furqan",
    "number": 25,
    "title": "Аль-Фуркан",
    "arabicTitle": "الفرقان",
    "translation": "Различение",
    "status": "читаю"
  },
  {
    "id": "ash-shuara",
    "number": 26,
    "title": "Аш-Шуара",
    "arabicTitle": "الشعراء",
    "translation": "Поэты",
    "status": "читаю"
  },
  {
    "id": "an-naml",
    "number": 27,
    "title": "Ан-Намль",
    "arabicTitle": "النمل",
    "translation": "Муравьи",
    "status": "читаю"
  },
  {
    "id": "al-qasas",
    "number": 28,
    "title": "Аль-Касас",
    "arabicTitle": "القصص",
    "translation": "Повествование",
    "status": "читаю"
  },
  {
    "id": "al-ankabut",
    "number": 29,
    "title": "Аль-Анкабут",
    "arabicTitle": "العنكبوت",
    "translation": "Паук",
    "status": "читаю"
  },
  {
    "id": "ar-rum",
    "number": 30,
    "title": "Ар-Рум",
    "arabicTitle": "الروم",
    "translation": "Румы",
    "status": "читаю"
  },
  {
    "id": "luqman",
    "number": 31,
    "title": "Лукман",
    "arabicTitle": "لقمان",
    "translation": "Лукман",
    "status": "читаю"
  },
  {
    "id": "as-sajda",
    "number": 32,
    "title": "Ас-Саджда",
    "arabicTitle": "السجدة",
    "translation": "Земной поклон",
    "status": "читаю"
  },
  {
    "id": "al-ahzab",
    "number": 33,
    "title": "Аль-Ахзаб",
    "arabicTitle": "الأحزاب",
    "translation": "Союзники",
    "status": "читаю"
  },
  {
    "id": "saba",
    "number": 34,
    "title": "Саба",
    "arabicTitle": "سبأ",
    "translation": "Саба",
    "status": "читаю"
  },
  {
    "id": "fatir",
    "number": 35,
    "title": "Фатыр",
    "arabicTitle": "فاطر",
    "translation": "Создатель",
    "status": "читаю"
  },
  {
    "id": "ya-sin",
    "number": 36,
    "title": "Йа Синь",
    "arabicTitle": "يس",
    "translation": "Йа Синь",
    "status": "читаю"
  },
  {
    "id": "as-saffat",
    "number": 37,
    "title": "Ас-Саффат",
    "arabicTitle": "الصافات",
    "translation": "Выстроившиеся в ряды",
    "status": "читаю"
  },
  {
    "id": "sad",
    "number": 38,
    "title": "Сад",
    "arabicTitle": "ص",
    "translation": "Сад",
    "status": "читаю"
  },
  {
    "id": "az-zumar",
    "number": 39,
    "title": "Аз-Зумар",
    "arabicTitle": "الزمر",
    "translation": "Толпы",
    "status": "читаю"
  },
  {
    "id": "ghafir",
    "number": 40,
    "title": "Гафир",
    "arabicTitle": "غافر",
    "translation": "Прощающий",
    "status": "читаю"
  },
  {
    "id": "fussilat",
    "number": 41,
    "title": "Фуссылат",
    "arabicTitle": "فصلت",
    "translation": "Разъяснены",
    "status": "читаю"
  },
  {
    "id": "ash-shura",
    "number": 42,
    "title": "Аш-Шура",
    "arabicTitle": "الشورى",
    "translation": "Совет",
    "status": "читаю"
  },
  {
    "id": "az-zukhruf",
    "number": 43,
    "title": "Аз-Зухруф",
    "arabicTitle": "الزخرف",
    "translation": "Украшения",
    "status": "читаю"
  },
  {
    "id": "ad-dukhan",
    "number": 44,
    "title": "Ад-Духан",
    "arabicTitle": "الدخان",
    "translation": "Дым",
    "status": "читаю"
  },
  {
    "id": "al-jathiyah",
    "number": 45,
    "title": "Аль-Джасия",
    "arabicTitle": "الجاثية",
    "translation": "Стоящие на коленях",
    "status": "читаю"
  },
  {
    "id": "al-ahqaf",
    "number": 46,
    "title": "Аль-Ахкаф",
    "arabicTitle": "الأحقاف",
    "translation": "Барханы",
    "status": "читаю"
  },
  {
    "id": "muhammad",
    "number": 47,
    "title": "Мухаммад",
    "arabicTitle": "محمد",
    "translation": "Мухаммад",
    "status": "читаю"
  },
  {
    "id": "al-fath",
    "number": 48,
    "title": "Аль-Фатх",
    "arabicTitle": "الفتح",
    "translation": "Победа",
    "status": "читаю"
  },
  {
    "id": "al-hujurat",
    "number": 49,
    "title": "Аль-Худжурат",
    "arabicTitle": "الحجرات",
    "translation": "Комнаты",
    "status": "читаю"
  },
  {
    "id": "qaf",
    "number": 50,
    "title": "Каф",
    "arabicTitle": "ق",
    "translation": "Каф",
    "status": "читаю"
  },
  {
    "id": "adh-dhariyat",
    "number": 51,
    "title": "Аз-Зарият",
    "arabicTitle": "الذاريات",
    "translation": "Рассеивающие",
    "status": "читаю"
  },
  {
    "id": "at-tur",
    "number": 52,
    "title": "Ат-Тур",
    "arabicTitle": "الطور",
    "translation": "Гора",
    "status": "читаю"
  },
  {
    "id": "an-najm",
    "number": 53,
    "title": "Ан-Наджм",
    "arabicTitle": "النجم",
    "translation": "Звезда",
    "status": "читаю"
  },
  {
    "id": "al-qamar",
    "number": 54,
    "title": "Аль-Камар",
    "arabicTitle": "القمر",
    "translation": "Луна",
    "status": "читаю"
  },
  {
    "id": "ar-rahman",
    "number": 55,
    "title": "Ар-Рахман",
    "arabicTitle": "الرحمن",
    "translation": "Милостивый",
    "status": "читаю"
  },
  {
    "id": "al-waqia",
    "number": 56,
    "title": "Аль-Вакиа",
    "arabicTitle": "الواقعة",
    "translation": "Событие",
    "status": "читаю"
  },
  {
    "id": "al-hadid",
    "number": 57,
    "title": "Аль-Хадид",
    "arabicTitle": "الحديد",
    "translation": "Железо",
    "status": "читаю"
  },
  {
    "id": "al-mujadila",
    "number": 58,
    "title": "Аль-Муджадиля",
    "arabicTitle": "المجادلة",
    "translation": "Спорящая",
    "status": "читаю"
  },
  {
    "id": "al-hashr",
    "number": 59,
    "title": "Аль-Хашр",
    "arabicTitle": "الحشر",
    "translation": "Сбор",
    "status": "читаю"
  },
  {
    "id": "al-mumtahina",
    "number": 60,
    "title": "Аль-Мумтахана",
    "arabicTitle": "الممتحنة",
    "translation": "Испытуемая",
    "status": "читаю"
  },
  {
    "id": "as-saf",
    "number": 61,
    "title": "Ас-Сафф",
    "arabicTitle": "الصف",
    "translation": "Ряды",
    "status": "читаю"
  },
  {
    "id": "al-jumuah",
    "number": 62,
    "title": "Аль-Джумуа",
    "arabicTitle": "الجمعة",
    "translation": "Пятница",
    "status": "читаю"
  },
  {
    "id": "al-munafiqun",
    "number": 63,
    "title": "Аль-Мунафикун",
    "arabicTitle": "المنافقون",
    "translation": "Лицемеры",
    "status": "читаю"
  },
  {
    "id": "at-taghabun",
    "number": 64,
    "title": "Ат-Тагабун",
    "arabicTitle": "التغابن",
    "translation": "Взаимный обман",
    "status": "читаю"
  },
  {
    "id": "at-talaq",
    "number": 65,
    "title": "Ат-Таляк",
    "arabicTitle": "الطلاق",
    "translation": "Развод",
    "status": "читаю"
  },
  {
    "id": "at-tahrim",
    "number": 66,
    "title": "Ат-Тахрим",
    "arabicTitle": "التحريم",
    "translation": "Запрет",
    "status": "читаю"
  },
  {
    "id": "al-mulk",
    "number": 67,
    "title": "Аль-Мульк",
    "arabicTitle": "الملك",
    "translation": "Власть",
    "status": "читаю"
  },
  {
    "id": "al-qalam",
    "number": 68,
    "title": "Аль-Калям",
    "arabicTitle": "القلم",
    "translation": "Перо",
    "status": "читаю"
  },
  {
    "id": "al-haqqa",
    "number": 69,
    "title": "Аль-Хакка",
    "arabicTitle": "الحاقة",
    "translation": "Неизбежное",
    "status": "читаю"
  },
  {
    "id": "al-maarij",
    "number": 70,
    "title": "Аль-Маарий",
    "arabicTitle": "المعارج",
    "translation": "Ступени",
    "status": "читаю"
  },
  {
    "id": "nuh",
    "number": 71,
    "title": "Нух",
    "arabicTitle": "نوح",
    "translation": "Нух",
    "status": "читаю"
  },
  {
    "id": "al-jinn",
    "number": 72,
    "title": "Аль-Джинн",
    "arabicTitle": "الجن",
    "translation": "Джинны",
    "status": "читаю"
  },
  {
    "id": "al-muzzammil",
    "number": 73,
    "title": "Аль-Муззаммиль",
    "arabicTitle": "المزمل",
    "translation": "Закутавшийся",
    "status": "читаю"
  },
  {
    "id": "al-muddathir",
    "number": 74,
    "title": "Аль-Муддассир",
    "arabicTitle": "المدثر",
    "translation": "Завернувшийся",
    "status": "читаю"
  },
  {
    "id": "al-qiyama",
    "number": 75,
    "title": "Аль-Кыяма",
    "arabicTitle": "القيامة",
    "translation": "Воскресение",
    "status": "читаю"
  },
  {
    "id": "al-insan",
    "number": 76,
    "title": "Аль-Инсан",
    "arabicTitle": "الإنسان",
    "translation": "Человек",
    "status": "читаю"
  },
  {
    "id": "al-mursalat",
    "number": 77,
    "title": "Аль-Мурсалят",
    "arabicTitle": "المرسلات",
    "translation": "Посланные",
    "status": "читаю"
  }
];

const ayahsBySurah = new Map();
for (const [ref, arabic] of Object.entries(tanzilCorpus.ayahs)) {
  const [surahNumber, number] = ref.split(":").map(Number);
  const ayahs = ayahsBySurah.get(surahNumber) || [];
  ayahs.push({ number, arabic, translation: "", words: [] });
  ayahsBySurah.set(surahNumber, ayahs);
}

export const quranSurahs = surahMetadata.map((surah) => ({
  ...surah, ayahs: ayahsBySurah.get(surah.number) || []
}));

export const tajweedRules = [
  {
    id: "makharij",
    title: "Махаридж",
    category: "Основы",
    description: "Места выхода букв: горло, язык, губы, нос и полость рта.",
    letters: "ء ه ع ح غ خ ق ك ج ش ي ض ل ن ر ط د ت ص ز س ظ ذ ث ف ب م و",
    example: "عَلِيمٌ حَكِيمٌ",
    examples: ["عَلِيمٌ", "حَكِيمٌ", "قُلْ"],
    hint: "Сначала найди место выхода буквы, потом добавляй огласовку.",
    status: "open"
  },
  {
    id: "sifat",
    title: "Сифаты букв",
    category: "Основы",
    description: "Постоянные качества букв: сила, мягкость, свист, возвышение и другие признаки.",
    letters: "ق ط ب ج د ص ز س خ ص ض غ ط ق ظ",
    example: "قَدْ أَفْلَحَ",
    examples: ["قَدْ", "الصِّرَاطَ", "أَفْلَحَ"],
    hint: "Одна буква может иметь несколько качеств одновременно.",
    status: "open"
  },
  {
    id: "tafkhim-tarqiq",
    title: "Тафхим и таркик",
    category: "Основы",
    description: "Тафхим делает звук плотным, таркик делает звук тонким.",
    letters: "خ ص ض غ ط ق ظ",
    example: "خَالِدِينَ",
    examples: ["خَالِدِينَ", "الصِّرَاطَ", "فِي"],
    hint: "Буквы исти'ля читаются плотнее, остальные обычно мягче.",
    status: "open"
  },
  {
    id: "ghunnah",
    title: "Гунна",
    category: "Основы",
    description: "Носовое звучание, особенно у نّ и مّ, обычно на две хараки.",
    letters: "نّ مّ",
    example: "إِنَّ",
    examples: ["إِنَّ", "ثُمَّ", "جَنَّةٍ"],
    hint: "Звук идет через нос, рот не должен полностью забирать звучание.",
    status: "open"
  },
  {
    id: "qalqalah",
    title: "Калькаля",
    category: "Основы",
    description: "Легкое отталкивание звука у букв ق ط ب ج د, когда они без гласной.",
    letters: "ق ط ب ج د",
    example: "قَدْ أَفْلَحَ",
    examples: ["قَدْ", "أَحَدٌ", "تَبَّتْ"],
    hint: "Отталкивание короткое, без добавления новой гласной.",
    status: "open"
  },
  {
    id: "madd-asli",
    title: "Мадд таби'и",
    category: "Мадды",
    description: "Естественное протяжение на две хараки у ا, و, ي при условиях мадда.",
    letters: "ا و ي",
    example: "قَالَ",
    examples: ["قَالَ", "يَقُولُ", "قِيلَ"],
    hint: "Базовый мадд не зависит от хамзы или сукуна после него.",
    status: "open"
  },
  {
    id: "madd-badal",
    title: "Мадд бадаль",
    category: "Мадды",
    description: "Хамза стоит перед буквой мадда в одном слове, протяжение обычно две хараки.",
    letters: "آ إِي أُو",
    example: "آمَنُوا",
    examples: ["آمَنُوا", "إِيمَانًا", "أُوتُوا"],
    hint: "Сначала слышится хамза, затем короткий естественный мадд.",
    status: "open"
  },
  {
    id: "madd-muttasil",
    title: "Мадд муттасыль",
    category: "Мадды",
    description: "Буква мадда и хамза находятся в одном слове, протяжение длиннее обычного.",
    letters: "ا و ي + ء",
    example: "جَاءَ",
    examples: ["جَاءَ", "السَّمَاءِ", "سُوءَ"],
    hint: "В чтении Хафс часто тянут на четыре или пять харак.",
    status: "open"
  },
  {
    id: "madd-munfasil",
    title: "Мадд мунфасыль",
    category: "Мадды",
    description: "Буква мадда в конце слова, а хамза приходит в следующем слове.",
    letters: "ا و ي ... ء",
    example: "إِنَّا أَعْطَيْنَاكَ",
    examples: ["إِنَّا أَعْطَيْنَاكَ", "فِي أَنفُسِكُمْ", "قُوا أَنفُسَكُمْ"],
    hint: "Слова разные, но протяжение сохраняется перед хамзой.",
    status: "open"
  },
  {
    id: "madd-lazim",
    title: "Мадд лязим",
    category: "Мадды",
    description: "После буквы мадда идет постоянный сукун или шадда, протяжение шесть харак.",
    letters: "ا و ي + سكون لازم",
    example: "الضَّالِّينَ",
    examples: ["الضَّالِّينَ", "الحَاقَّةُ", "آلآنَ"],
    hint: "Шадда после мадда считается сильной причиной длинного чтения.",
    status: "open"
  },
  {
    id: "madd-arid",
    title: "Мадд 'арид",
    category: "Мадды",
    description: "Временный сукун появляется из-за остановки в конце слова.",
    letters: "ا و ي + وقف",
    example: "نَسْتَعِينُ",
    examples: ["نَسْتَعِينُ", "يَعْلَمُونَ", "الرَّحِيمِ"],
    hint: "При остановке можно тянуть две, четыре или шесть харак.",
    status: "open"
  },
  {
    id: "madd-lin",
    title: "Мадд лин",
    category: "Мадды",
    description: "Мягкое протяжение у وْ или يْ после фатхи, когда читающий останавливается.",
    letters: "وْ يْ",
    example: "خَوْفٌ",
    examples: ["خَوْفٌ", "بَيْتٍ", "قُرَيْشٍ"],
    hint: "В соединенном чтении это мягкий звук, при остановке появляется протяжение.",
    status: "open"
  },
  {
    id: "madd-silah",
    title: "Мадд сыля",
    category: "Мадды",
    description: "Протяжение местоимения ه, когда оно с гласной стоит между двумя огласованными буквами.",
    letters: "هُ هِ",
    example: "إِنَّهُ هُوَ",
    examples: ["إِنَّهُ هُوَ", "لَهُ مَا", "بِهِ بَصِيرًا"],
    hint: "Если после ه приходит хамза, протяжение становится длиннее.",
    status: "open"
  },
  {
    id: "madd-iwad",
    title: "Мадд 'ивад",
    category: "Мадды",
    description: "При остановке танвин фатха читается как протяжение алифа на две хараки.",
    letters: "ـًا",
    example: "عَلِيمًا",
    examples: ["عَلِيمًا", "حَكِيمًا", "غَفُورًا"],
    hint: "Та марбута при остановке не читается как мадд 'ивад.",
    status: "open"
  },
  {
    id: "noon-izhar",
    title: "Изхар халки",
    category: "Нун и танвин",
    description: "نْ или танвин читаются ясно перед горловыми буквами.",
    letters: "ء ه ع ح غ خ",
    example: "مَنْ آمَنَ",
    examples: ["مَنْ آمَنَ", "مِنْ هَادٍ", "عَلِيمٌ حَكِيمٌ"],
    hint: "Не добавляй скрытую гунну, звук ن остается отчетливым.",
    status: "open"
  },
  {
    id: "noon-idgham-ghunnah",
    title: "Идгам с гунной",
    category: "Нун и танвин",
    description: "نْ или танвин сливаются со следующей буквой с носовым звучанием.",
    letters: "ي ن م و",
    example: "مَنْ يَقُولُ",
    examples: ["مَنْ يَقُولُ", "مِنْ وَالٍ", "هُدًى مِّنْ"],
    hint: "Слияние мягкое, гунна держится примерно две хараки.",
    status: "open"
  },
  {
    id: "noon-idgham-no-ghunnah",
    title: "Идгам без гунны",
    category: "Нун и танвин",
    description: "نْ или танвин сливаются с ل или ر без носового протяжения.",
    letters: "ل ر",
    example: "مِنْ رَبِّهِمْ",
    examples: ["مِنْ رَبِّهِمْ", "هُدًى لِّلْمُتَّقِينَ", "غَفُورٌ رَّحِيمٌ"],
    hint: "Звук ن не выделяется, сразу переходи в ل или ر.",
    status: "open"
  },
  {
    id: "iqlab",
    title: "Икляб",
    category: "Нун и танвин",
    description: "نْ или танвин перед ب превращаются в скрытую م с гунной.",
    letters: "ب",
    example: "مِنْ بَعْدِ",
    examples: ["مِنْ بَعْدِ", "سَمِيعٌ بَصِيرٌ", "أَنبِئْهُمْ"],
    hint: "Губы мягко сближаются, звук остается носовым.",
    status: "open"
  },
  {
    id: "ikhfa-haqiqi",
    title: "Ихфа хакики",
    category: "Нун и танвин",
    description: "نْ или танвин скрываются перед 15 буквами, сохраняя гунну.",
    letters: "ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك",
    example: "مِنْكُمْ",
    examples: ["مِنْكُمْ", "أَنفُسَكُمْ", "رِيحًا صَرْصَرًا"],
    hint: "Не делай полный изхар и не сливай полностью, звук находится между ними.",
    status: "open"
  },
  {
    id: "meem-ikhfa",
    title: "Ихфа шафави",
    category: "Мим сакина",
    description: "مْ перед ب читается скрыто с гунной.",
    letters: "ب",
    example: "تَرْمِيهِمْ بِحِجَارَةٍ",
    examples: ["تَرْمِيهِمْ بِحِجَارَةٍ", "هُم بِهِ", "عَلَيْهِم بِمُصَيْطِرٍ"],
    hint: "Губы сближаются мягко, без резкого хлопка.",
    status: "open"
  },
  {
    id: "meem-idgham",
    title: "Идгам шафави",
    category: "Мим сакина",
    description: "مْ перед م сливается в одну مّ с гунной.",
    letters: "م",
    example: "لَهُمْ مَّا",
    examples: ["لَهُمْ مَّا", "كَم مِّن", "أَم مَّنْ"],
    hint: "Слышится одна усиленная م с носовым звучанием.",
    status: "open"
  },
  {
    id: "meem-izhar",
    title: "Изхар шафави",
    category: "Мим сакина",
    description: "مْ читается ясно перед всеми буквами, кроме ب и م.",
    letters: "все, кроме ب م",
    example: "أَمْ هُمْ",
    examples: ["أَمْ هُمْ", "لَهُمْ فِيهَا", "عَلَيْهِمْ وَلَا"],
    hint: "Особенно следи за و и ف, чтобы م не исчезала.",
    status: "open"
  },
  {
    id: "lam-shamsiya-qamariya",
    title: "Лям шамсия и камария",
    category: "Лям",
    description: "В артикле ال лям либо сливается с солнечной буквой, либо читается ясно перед лунной.",
    letters: "ت ث د ذ ر ز س ش ص ض ط ظ ل ن / ء ب ج ح خ ع غ ف ق ك م هـ و ي",
    example: "الشَّمْسِ وَالْقَمَرِ",
    examples: ["الشَّمْسِ", "الْقَمَرِ", "الصِّرَاطَ"],
    hint: "Шадда после ال обычно показывает солнечную букву.",
    status: "open"
  },
  {
    id: "lafz-allah",
    title: "Лафз Аллах",
    category: "Лям",
    description: "Лям в слове اللَّه читается плотной после фатхи или даммы и мягкой после касры.",
    letters: "اللَّه",
    example: "قَالَ اللَّهُ",
    examples: ["قَالَ اللَّهُ", "رَسُولُ اللَّهِ", "بِاللَّهِ"],
    hint: "Смотри на гласную перед именем Аллаха.",
    status: "open"
  },
  {
    id: "ra-rules",
    title: "Правила ر",
    category: "Ра",
    description: "Буква ر может читаться плотной или мягкой в зависимости от гласной и соседних букв.",
    letters: "ر",
    example: "رَبِّ",
    examples: ["رَبِّ", "فِرْعَوْنَ", "خَيْرٌ"],
    hint: "Фатха и дамма обычно утолщают ر, касра обычно смягчает.",
    status: "open"
  },
  {
    id: "hamzat-wasl-qata",
    title: "Хамзат васль и кат'",
    category: "Хамза",
    description: "Хамзат васль читается в начале, но пропускается при соединении; хамзат кат' читается всегда.",
    letters: "ٱ أ إ ؤ ئ ء",
    example: "ٱهْدِنَا",
    examples: ["ٱهْدِنَا", "أَنْعَمْتَ", "قُلْ أَعُوذُ"],
    hint: "При соединении слов проверь, исчезает ли начальная хамза.",
    status: "open"
  },
  {
    id: "waqf-signs",
    title: "Знаки остановки",
    category: "Вакф",
    description: "Знаки помогают понять, где лучше остановиться, продолжить или нельзя останавливаться.",
    letters: "م لا ج صلى قلى",
    example: "م  لا  ج",
    examples: ["م", "لا", "ج", "صلى", "قلى"],
    hint: "Смысл аята важнее красивой паузы, не обрывай смысл.",
    status: "open"
  },
  {
    id: "sakt",
    title: "Сакт",
    category: "Вакф",
    description: "Короткая пауза без вдоха в особых местах чтения.",
    letters: "سكتة",
    example: "عِوَجًا ۜ قَيِّمًا",
    examples: ["عِوَجًا ۜ قَيِّمًا", "مَنْ ۜ رَاقٍ", "بَلْ ۜ رَانَ"],
    hint: "Пауза короткая, дыхание не обновляется.",
    status: "open"
  }
];


export function getSurahById(surahId) {
  const value = String(surahId || "");
  return quranSurahs.find((surah) => surah.id === value || String(surah.number) === value) || quranSurahs[0];
}

export function getAyahByNumber(surahId, ayahNumber) {
  const surah = getSurahById(surahId);
  return surah.ayahs.find((ayah) => ayah.number === Number(ayahNumber)) || surah.ayahs[0];
}
