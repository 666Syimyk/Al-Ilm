export const lessonChapters = [
  {
    id: "chapter-1",
    number: 1,
    title: "Первые буквы",
    description: "Изучи первые арабские буквы и научись их узнавать.",
    letters: ["ا", "ب", "ت", "ث", "ج"],
    rewardTitle: "Звезда первых букв",
    rewardText: "+50 очков и +15 монет за испытание главы"
  },
  {
    id: "chapter-2",
    number: 2,
    title: "Продолжение алфавита",
    description: "Учись различать буквы по форме и точкам.",
    letters: ["ح", "خ", "ن", "ي"],
    rewardTitle: "Мастер точек",
    rewardText: "Бонус за внимательность и точность"
  },
  {
    id: "chapter-3",
    number: 3,
    title: "Похожие буквы",
    description: "Сравнивай пары и группы букв, чтобы читать увереннее.",
    letters: ["د", "ذ", "ر", "ز", "س", "ش"],
    rewardTitle: "Острый взгляд",
    rewardText: "Награда за похожие буквы"
  },
  {
    id: "chapter-4",
    number: 4,
    title: "Сильные буквы",
    description: "Познакомься с буквами, которые требуют особого внимания.",
    letters: ["ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق"],
    rewardTitle: "Сильный голос",
    rewardText: "Большая награда главы"
  },
  {
    id: "chapter-5",
    number: 5,
    title: "Полный алфавит",
    description: "Изучи оставшиеся буквы и закрепи весь путь знаний.",
    letters: ["ك", "ل", "م", "ه", "و"],
    rewardTitle: "Мастер алфавита",
    rewardText: "Финальная награда за полный путь"
  },
  {
    id: "chapter-6",
    number: 6,
    title: "Слоги",
    description: "Соедини буквы с огласовками, сукуном, шаддой и длинными звуками.",
    letters: ["بَ", "بِ", "بُ", "أَبْ"],
    rewardTitle: "Мастер слогов",
    rewardText: "Награда за переход от букв к чтению"
  },
  {
    id: "chapter-7",
    number: 7,
    title: "Слова",
    description: "Собирай слоги в первые слова Корана, намаза и короткие строки.",
    letters: ["الله", "رَبّ", "نُور"],
    rewardTitle: "Первые слова",
    rewardText: "Награда за уверенное чтение слов"
  },
  {
    id: "chapter-8",
    number: 8,
    title: "Чтение",
    description: "Переходи от слов к строкам, коротким текстам и чтению Корана.",
    letters: ["بسم الله", "الحمد لله"],
    rewardTitle: "Готов к Корану",
    rewardText: "Финальная награда за полный путь: буквы, слоги и слова"
  }
];

export const nodeRewards = {
  letter: { points: 5, coins: 0 },
  sound: { points: 5, coins: 0 },
  writing: { points: 10, coins: 0 },
  game: { points: 10, coins: 0 },
  quiz: { points: 15, coins: 0 },
  reward: { points: 20, coins: 5 },
  checkpoint: { points: 15, coins: 0 },
  review: { points: 10, coins: 0 },
  syllable: { points: 12, coins: 0 },
  word: { points: 14, coins: 0 },
  reading: { points: 20, coins: 2 },
  boss: { points: 50, coins: 15 }
};

export const lessonPathNodes = [
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  // ГЛАВА 1: Первые буквы — ا ب ت ث ج
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

  // АЛИФ — ا
  { id: "alif-letter", chapter: "chapter-1", type: "letter", title: "ا Алиф", subtitle: "Первая буква алфавита", letterId: "alif", letter: "ا", to: "/letter/alif" },
  { id: "alif-sound", chapter: "chapter-1", type: "sound", title: "Послушай Алиф", subtitle: "Звук буквы", letterId: "alif", to: "/letter/alif?sound=true" },
  { id: "alif-find", chapter: "chapter-1", type: "game", title: "Найди Алиф", subtitle: "Найди букву среди других", letterId: "alif", gameType: "find-letter", to: "/game/find-letter/alif" },
  { id: "alif-reward", chapter: "chapter-1", type: "reward", title: "Награда Алиф", subtitle: "Забери первые звёзды", letterId: "alif", to: "/reward/alif" },

  // БА — ب
  { id: "ba-letter", chapter: "chapter-1", type: "letter", title: "ب Ба", subtitle: "Одна точка снизу", letterId: "ba", letter: "ب", to: "/letter/ba" },
  { id: "ba-sound", chapter: "chapter-1", type: "sound", title: "Послушай Ба", subtitle: "Слушай и повторяй", letterId: "ba", to: "/letter/ba?sound=true" },
  { id: "ba-writing", chapter: "chapter-1", type: "writing", title: "Обведи Ба", subtitle: "Письмо пальцем", letterId: "ba", gameType: "trace", to: "/game/trace/ba" },
  { id: "ba-dots", chapter: "chapter-1", type: "game", title: "Поставь точки Ба", subtitle: "Отличи ب ت ث ن ي", letterId: "ba", gameType: "dots", to: "/game/dots/ba" },
  { id: "ba-quiz", chapter: "chapter-1", type: "quiz", title: "Проверка Ба", subtitle: "Короткий тест", letterId: "ba", gameType: "quiz", to: "/game/quiz/ba" },
  { id: "ba-reward", chapter: "chapter-1", type: "reward", title: "Награда Ба", subtitle: "Забери очки и монеты", letterId: "ba", to: "/reward/ba" },

  // ТА — ت
  { id: "ta-letter", chapter: "chapter-1", type: "letter", title: "ت Та", subtitle: "Две точки сверху", letterId: "ta", letter: "ت", to: "/letter/ta" },
  { id: "ta-listen", chapter: "chapter-1", type: "game", title: "Слушай и выбирай", subtitle: "Узнай букву по звуку", letterId: "ta", gameType: "listen", to: "/game/listen/ta" },
  { id: "ta-writing", chapter: "chapter-1", type: "writing", title: "Обведи Та", subtitle: "Практика письма", letterId: "ta", gameType: "trace", to: "/game/trace/ta" },
  { id: "ta-find", chapter: "chapter-1", type: "game", title: "Найди Та", subtitle: "Найди букву ت", letterId: "ta", gameType: "find-letter", to: "/game/find-letter/ta" },
  { id: "ta-reward", chapter: "chapter-1", type: "reward", title: "Награда Та", subtitle: "Забери очки", letterId: "ta", to: "/reward/ta" },

  // СА — ث
  { id: "tha-letter", chapter: "chapter-1", type: "letter", title: "ث Са", subtitle: "Три точки сверху", letterId: "tha", letter: "ث", to: "/letter/tha" },
  { id: "tha-compare", chapter: "chapter-1", type: "game", title: "Сравни ب ت ث", subtitle: "Отличи по точкам", letterId: "tha", gameType: "dots", to: "/game/dots/tha" },
  { id: "tha-find", chapter: "chapter-1", type: "game", title: "Найди Са", subtitle: "Найди букву ث", letterId: "tha", gameType: "find-letter", to: "/game/find-letter/tha" },
  { id: "tha-reward", chapter: "chapter-1", type: "reward", title: "Награда Са", subtitle: "Забери очки", letterId: "tha", to: "/reward/tha" },

  // ДЖИМ — ج
  { id: "jim-letter", chapter: "chapter-1", type: "letter", title: "ج Джим", subtitle: "Новая форма буквы", letterId: "jim", letter: "ج", to: "/letter/jim" },
  { id: "jim-catch", chapter: "chapter-1", type: "game", title: "Поймай Джим", subtitle: "Лови только ج", letterId: "jim", gameType: "catch", to: "/game/catch/jim" },
  { id: "jim-find", chapter: "chapter-1", type: "game", title: "Найди Джим", subtitle: "Найди букву ج", letterId: "jim", gameType: "find-letter", to: "/game/find-letter/jim" },
  { id: "jim-reward", chapter: "chapter-1", type: "reward", title: "Награда Джим", subtitle: "Забери очки", letterId: "jim", to: "/reward/jim" },

  // Контрольная + Испытание главы 1
  { id: "chapter-1-checkpoint", chapter: "chapter-1", type: "checkpoint", title: "Контрольная точка", subtitle: "Проверь Алиф, Ба и Та", to: "/checkpoint/chapter-1" },
  { id: "chapter-1-boss", chapter: "chapter-1", type: "boss", title: "Испытание главы 1", subtitle: "Заверши главу и получи большую награду", to: "/boss/chapter-1" },
  { id: "chapter-1-bonus", chapter: "chapter-1", type: "review", title: "Бонус: повторение", subtitle: "Повтори первые буквы", bonus: true, unlockAfter: "chapter-1-boss", gameType: "find-letter", letterId: "ba", to: "/game/find-letter/ba?node=chapter-1-bonus" },

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  // ГЛАВА 2: Продолжение алфавита — ح خ ن ي
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

  { id: "dotted-review", chapter: "chapter-2", type: "review", title: "Повтори Ба и Та", subtitle: "Разогрев главы", letterId: "ba", gameType: "dots", to: "/game/dots/ba?node=dotted-review" },

  // ХА (горловое) — ح
  { id: "ha-letter", chapter: "chapter-2", type: "letter", title: "ح Ха", subtitle: "Горловой звук", letterId: "ha_guttural", letter: "ح", to: "/letter/ha_guttural" },
  { id: "ha-sound", chapter: "chapter-2", type: "sound", title: "Послушай Ха", subtitle: "Особый горловой звук", letterId: "ha_guttural", to: "/letter/ha_guttural?sound=true" },
  { id: "ha-find", chapter: "chapter-2", type: "game", title: "Найди Ха", subtitle: "Найди букву ح", letterId: "ha_guttural", gameType: "find-letter", to: "/game/find-letter/ha_guttural" },
  { id: "ha-reward", chapter: "chapter-2", type: "reward", title: "Награда Ха", subtitle: "Забери очки", letterId: "ha_guttural", to: "/reward/ha_guttural" },

  // ХО — خ
  { id: "kha-letter", chapter: "chapter-2", type: "letter", title: "خ Хо", subtitle: "Одна точка сверху", letterId: "kha", letter: "خ", to: "/letter/kha" },
  { id: "kha-dots", chapter: "chapter-2", type: "game", title: "Отличи ج ح خ", subtitle: "Форма одна — точки разные", letterId: "kha", gameType: "dots", to: "/game/dots/kha" },
  { id: "kha-find", chapter: "chapter-2", type: "game", title: "Найди Хо", subtitle: "Найди букву خ", letterId: "kha", gameType: "find-letter", to: "/game/find-letter/kha" },
  { id: "kha-reward", chapter: "chapter-2", type: "reward", title: "Награда Хо", subtitle: "Забери очки", letterId: "kha", to: "/reward/kha" },

  // НУН — ن
  { id: "nun-letter", chapter: "chapter-2", type: "letter", title: "ن Нун", subtitle: "Одна точка сверху", letterId: "nun", letter: "ن", to: "/letter/nun" },
  { id: "nun-dots", chapter: "chapter-2", type: "game", title: "Поставь точки", subtitle: "ب ت ث ن ي — найди Нун", letterId: "nun", gameType: "dots", to: "/game/dots/nun" },
  { id: "nun-find", chapter: "chapter-2", type: "game", title: "Найди Нун", subtitle: "Найди букву ن", letterId: "nun", gameType: "find-letter", to: "/game/find-letter/nun" },
  { id: "nun-reward", chapter: "chapter-2", type: "reward", title: "Награда Нун", subtitle: "Забери очки", letterId: "nun", to: "/reward/nun" },

  // ЙА — ي
  { id: "ya-letter", chapter: "chapter-2", type: "letter", title: "ي Йа", subtitle: "Две точки снизу", letterId: "ya", letter: "ي", to: "/letter/ya" },
  { id: "ya-dots", chapter: "chapter-2", type: "game", title: "Найди ي среди ن", subtitle: "Сверху или снизу?", letterId: "ya", gameType: "dots", to: "/game/dots/ya" },
  { id: "ya-find", chapter: "chapter-2", type: "game", title: "Найди Йа", subtitle: "Найди букву ي", letterId: "ya", gameType: "find-letter", to: "/game/find-letter/ya" },
  { id: "ya-reward", chapter: "chapter-2", type: "reward", title: "Награда Йа", subtitle: "Забери очки", letterId: "ya", to: "/reward/ya" },

  // Испытание главы 2
  { id: "chapter-2-boss", chapter: "chapter-2", type: "boss", title: "Испытание главы 2", subtitle: "Большая проверка", to: "/boss/chapter-2" },

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  // ГЛАВА 3: Похожие буквы — د ذ ر ز س ش
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

  // ДАЛЬ — د
  { id: "dal-letter", chapter: "chapter-3", type: "letter", title: "د Даль", subtitle: "Похожа на ذ", letterId: "dal", letter: "د", to: "/letter/dal" },
  { id: "dal-sound", chapter: "chapter-3", type: "sound", title: "Послушай Даль", subtitle: "Слушай и повторяй", letterId: "dal", to: "/letter/dal?sound=true" },
  { id: "dal-find", chapter: "chapter-3", type: "game", title: "Найди Даль", subtitle: "Найди букву د", letterId: "dal", gameType: "find-letter", to: "/game/find-letter/dal" },
  { id: "dal-reward", chapter: "chapter-3", type: "reward", title: "Награда Даль", subtitle: "Забери очки", letterId: "dal", to: "/reward/dal" },

  // ЗАЛЬ — ذ
  { id: "dhal-letter", chapter: "chapter-3", type: "letter", title: "ذ Заль", subtitle: "Одна точка сверху", letterId: "dhal", letter: "ذ", to: "/letter/dhal" },
  { id: "dhal-dots", chapter: "chapter-3", type: "game", title: "Сравни د ذ", subtitle: "Точка меняет букву", letterId: "dhal", gameType: "dots", to: "/game/dots/dhal" },
  { id: "dhal-find", chapter: "chapter-3", type: "game", title: "Найди Заль", subtitle: "Найди букву ذ", letterId: "dhal", gameType: "find-letter", to: "/game/find-letter/dhal" },
  { id: "dhal-reward", chapter: "chapter-3", type: "reward", title: "Награда Заль", subtitle: "Забери очки", letterId: "dhal", to: "/reward/dhal" },

  // РА — ر
  { id: "ra-letter", chapter: "chapter-3", type: "letter", title: "ر Ра", subtitle: "Похожа на ز", letterId: "ra", letter: "ر", to: "/letter/ra" },
  { id: "ra-sound", chapter: "chapter-3", type: "sound", title: "Послушай Ра", subtitle: "Слушай и повторяй", letterId: "ra", to: "/letter/ra?sound=true" },
  { id: "ra-find", chapter: "chapter-3", type: "game", title: "Найди Ра", subtitle: "Найди букву ر", letterId: "ra", gameType: "find-letter", to: "/game/find-letter/ra" },
  { id: "ra-reward", chapter: "chapter-3", type: "reward", title: "Награда Ра", subtitle: "Забери очки", letterId: "ra", to: "/reward/ra" },

  // ЗАЙ — ز
  { id: "zay-letter", chapter: "chapter-3", type: "letter", title: "ز Зай", subtitle: "Одна точка сверху", letterId: "zay", letter: "ز", to: "/letter/zay" },
  { id: "zay-dots", chapter: "chapter-3", type: "game", title: "Сравни ر ز", subtitle: "Точка меняет всё", letterId: "zay", gameType: "dots", to: "/game/dots/zay" },
  { id: "zay-find", chapter: "chapter-3", type: "game", title: "Найди Зай", subtitle: "Найди букву ز", letterId: "zay", gameType: "find-letter", to: "/game/find-letter/zay" },
  { id: "zay-reward", chapter: "chapter-3", type: "reward", title: "Награда Зай", subtitle: "Забери очки", letterId: "zay", to: "/reward/zay" },

  // СИН — س
  { id: "sin-letter", chapter: "chapter-3", type: "letter", title: "س Син", subtitle: "Три зубца без точек", letterId: "sin", letter: "س", to: "/letter/sin" },
  { id: "sin-sound", chapter: "chapter-3", type: "sound", title: "Послушай Син", subtitle: "Слушай и повторяй", letterId: "sin", to: "/letter/sin?sound=true" },
  { id: "sin-find", chapter: "chapter-3", type: "game", title: "Найди Син", subtitle: "Найди букву س", letterId: "sin", gameType: "find-letter", to: "/game/find-letter/sin" },
  { id: "sin-reward", chapter: "chapter-3", type: "reward", title: "Награда Син", subtitle: "Забери очки", letterId: "sin", to: "/reward/sin" },

  // ШИН — ش
  { id: "shin-letter", chapter: "chapter-3", type: "letter", title: "ش Шин", subtitle: "Три точки сверху", letterId: "shin", letter: "ش", to: "/letter/shin" },
  { id: "shin-dots", chapter: "chapter-3", type: "game", title: "Сравни س ش", subtitle: "Три зубца — с точками или без?", letterId: "shin", gameType: "dots", to: "/game/dots/shin" },
  { id: "shin-find", chapter: "chapter-3", type: "game", title: "Найди Шин", subtitle: "Найди букву ش", letterId: "shin", gameType: "find-letter", to: "/game/find-letter/shin" },
  { id: "shin-reward", chapter: "chapter-3", type: "reward", title: "Награда Шин", subtitle: "Забери очки", letterId: "shin", to: "/reward/shin" },

  // Испытание главы 3
  { id: "chapter-3-boss", chapter: "chapter-3", type: "boss", title: "Испытание похожих букв", subtitle: "Глава 3", to: "/boss/chapter-3" },

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  // ГЛАВА 4: Сильные буквы — ص ض ط ظ ع غ ف ق
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

  // САД — ص
  { id: "sad-letter", chapter: "chapter-4", type: "letter", title: "ص Сад", subtitle: "Сильная буква", letterId: "sad", letter: "ص", to: "/letter/sad" },
  { id: "sad-sound", chapter: "chapter-4", type: "sound", title: "Послушай Сад", subtitle: "Особый твёрдый звук", letterId: "sad", to: "/letter/sad?sound=true" },
  { id: "sad-find", chapter: "chapter-4", type: "game", title: "Найди Сад", subtitle: "Найди букву ص", letterId: "sad", gameType: "find-letter", to: "/game/find-letter/sad" },
  { id: "sad-reward", chapter: "chapter-4", type: "reward", title: "Награда Сад", subtitle: "Забери очки", letterId: "sad", to: "/reward/sad" },

  // ДАД — ض
  { id: "dad-letter", chapter: "chapter-4", type: "letter", title: "ض Дад", subtitle: "Одна точка сверху", letterId: "dad", letter: "ض", to: "/letter/dad" },
  { id: "dad-dots", chapter: "chapter-4", type: "game", title: "Сравни ص ض", subtitle: "Точка меняет звук", letterId: "dad", gameType: "dots", to: "/game/dots/dad" },
  { id: "dad-find", chapter: "chapter-4", type: "game", title: "Найди Дад", subtitle: "Найди букву ض", letterId: "dad", gameType: "find-letter", to: "/game/find-letter/dad" },
  { id: "dad-reward", chapter: "chapter-4", type: "reward", title: "Награда Дад", subtitle: "Забери очки", letterId: "dad", to: "/reward/dad" },

  // ТА (сильное) — ط
  { id: "ta-emph-letter", chapter: "chapter-4", type: "letter", title: "ط Та", subtitle: "Сильное Та", letterId: "ta_emphatic", letter: "ط", to: "/letter/ta_emphatic" },
  { id: "ta-emph-sound", chapter: "chapter-4", type: "sound", title: "Послушай ط", subtitle: "Твёрдый звук", letterId: "ta_emphatic", to: "/letter/ta_emphatic?sound=true" },
  { id: "ta-emph-find", chapter: "chapter-4", type: "game", title: "Найди ط", subtitle: "Найди сильное Та", letterId: "ta_emphatic", gameType: "find-letter", to: "/game/find-letter/ta_emphatic" },
  { id: "ta-emph-reward", chapter: "chapter-4", type: "reward", title: "Награда ط", subtitle: "Забери очки", letterId: "ta_emphatic", to: "/reward/ta_emphatic" },

  // ЗА (сильное) — ظ
  { id: "za-emph-letter", chapter: "chapter-4", type: "letter", title: "ظ За", subtitle: "Сильное За", letterId: "za_emphatic", letter: "ظ", to: "/letter/za_emphatic" },
  { id: "za-emph-dots", chapter: "chapter-4", type: "game", title: "Сравни ط ظ", subtitle: "Одна точка сверху", letterId: "za_emphatic", gameType: "dots", to: "/game/dots/za_emphatic" },
  { id: "za-emph-find", chapter: "chapter-4", type: "game", title: "Найди ظ", subtitle: "Найди сильное За", letterId: "za_emphatic", gameType: "find-letter", to: "/game/find-letter/za_emphatic" },
  { id: "za-emph-reward", chapter: "chapter-4", type: "reward", title: "Награда ظ", subtitle: "Забери очки", letterId: "za_emphatic", to: "/reward/za_emphatic" },

  // АЙН — ع
  { id: "ayn-letter", chapter: "chapter-4", type: "letter", title: "ع Айн", subtitle: "Особый горловой звук", letterId: "ayn", letter: "ع", to: "/letter/ayn" },
  { id: "ayn-sound", chapter: "chapter-4", type: "sound", title: "Послушай Айн", subtitle: "Уникальный звук", letterId: "ayn", to: "/letter/ayn?sound=true" },
  { id: "ayn-find", chapter: "chapter-4", type: "game", title: "Найди Айн", subtitle: "Найди букву ع", letterId: "ayn", gameType: "find-letter", to: "/game/find-letter/ayn" },
  { id: "ayn-reward", chapter: "chapter-4", type: "reward", title: "Награда Айн", subtitle: "Забери очки", letterId: "ayn", to: "/reward/ayn" },

  // ГАЙН — غ
  { id: "ghayn-letter", chapter: "chapter-4", type: "letter", title: "غ Гайн", subtitle: "Одна точка сверху", letterId: "ghayn", letter: "غ", to: "/letter/ghayn" },
  { id: "ghayn-dots", chapter: "chapter-4", type: "game", title: "Сравни ع غ", subtitle: "Точка меняет звук", letterId: "ghayn", gameType: "dots", to: "/game/dots/ghayn" },
  { id: "ghayn-find", chapter: "chapter-4", type: "game", title: "Найди Гайн", subtitle: "Найди букву غ", letterId: "ghayn", gameType: "find-letter", to: "/game/find-letter/ghayn" },
  { id: "ghayn-reward", chapter: "chapter-4", type: "reward", title: "Награда Гайн", subtitle: "Забери очки", letterId: "ghayn", to: "/reward/ghayn" },

  // ФА — ف
  { id: "fa-letter", chapter: "chapter-4", type: "letter", title: "ف Фа", subtitle: "Одна точка сверху", letterId: "fa", letter: "ف", to: "/letter/fa" },
  { id: "fa-sound", chapter: "chapter-4", type: "sound", title: "Послушай Фа", subtitle: "Слушай и повторяй", letterId: "fa", to: "/letter/fa?sound=true" },
  { id: "fa-find", chapter: "chapter-4", type: "game", title: "Найди Фа", subtitle: "Найди букву ف", letterId: "fa", gameType: "find-letter", to: "/game/find-letter/fa" },
  { id: "fa-reward", chapter: "chapter-4", type: "reward", title: "Награда Фа", subtitle: "Забери очки", letterId: "fa", to: "/reward/fa" },

  // КАФ (большой) — ق
  { id: "qaf-letter", chapter: "chapter-4", type: "letter", title: "ق Каф", subtitle: "Две точки сверху", letterId: "qaf", letter: "ق", to: "/letter/qaf" },
  { id: "qaf-dots", chapter: "chapter-4", type: "game", title: "Сравни ف ق", subtitle: "Одна точка или две?", letterId: "qaf", gameType: "dots", to: "/game/dots/qaf" },
  { id: "qaf-find", chapter: "chapter-4", type: "game", title: "Найди Каф", subtitle: "Найди букву ق", letterId: "qaf", gameType: "find-letter", to: "/game/find-letter/qaf" },
  { id: "qaf-reward", chapter: "chapter-4", type: "reward", title: "Награда Каф", subtitle: "Забери очки", letterId: "qaf", to: "/reward/qaf" },

  // Испытание главы 4
  { id: "chapter-4-boss", chapter: "chapter-4", type: "boss", title: "Испытание сильных букв", subtitle: "Глава 4", to: "/boss/chapter-4" },

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  // ГЛАВА 5: Полный алфавит — ك ل م ه و + финал
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

  // КЯФ — ك
  { id: "kaf-letter", chapter: "chapter-5", type: "letter", title: "ك Кяф", subtitle: "Особая форма", letterId: "kaf", letter: "ك", to: "/letter/kaf" },
  { id: "kaf-sound", chapter: "chapter-5", type: "sound", title: "Послушай Кяф", subtitle: "Слушай и повторяй", letterId: "kaf", to: "/letter/kaf?sound=true" },
  { id: "kaf-find", chapter: "chapter-5", type: "game", title: "Найди Кяф", subtitle: "Найди букву ك", letterId: "kaf", gameType: "find-letter", to: "/game/find-letter/kaf" },
  { id: "kaf-reward", chapter: "chapter-5", type: "reward", title: "Награда Кяф", subtitle: "Забери очки", letterId: "kaf", to: "/reward/kaf" },

  // ЛЯМ — ل
  { id: "lam-letter", chapter: "chapter-5", type: "letter", title: "ل Лям", subtitle: "Высокая вертикальная буква", letterId: "lam", letter: "ل", to: "/letter/lam" },
  { id: "lam-sound", chapter: "chapter-5", type: "sound", title: "Послушай Лям", subtitle: "Слушай и повторяй", letterId: "lam", to: "/letter/lam?sound=true" },
  { id: "lam-find", chapter: "chapter-5", type: "game", title: "Найди Лям", subtitle: "Найди букву ل", letterId: "lam", gameType: "find-letter", to: "/game/find-letter/lam" },
  { id: "lam-reward", chapter: "chapter-5", type: "reward", title: "Награда Лям", subtitle: "Забери очки", letterId: "lam", to: "/reward/lam" },

  // МИМ — م
  { id: "mim-letter", chapter: "chapter-5", type: "letter", title: "م Мим", subtitle: "Закрытая форма", letterId: "mim", letter: "م", to: "/letter/mim" },
  { id: "mim-sound", chapter: "chapter-5", type: "sound", title: "Послушай Мим", subtitle: "Слушай и повторяй", letterId: "mim", to: "/letter/mim?sound=true" },
  { id: "mim-find", chapter: "chapter-5", type: "game", title: "Найди Мим", subtitle: "Найди букву م", letterId: "mim", gameType: "find-letter", to: "/game/find-letter/mim" },
  { id: "mim-reward", chapter: "chapter-5", type: "reward", title: "Награда Мим", subtitle: "Забери очки", letterId: "mim", to: "/reward/mim" },

  // ХА (мягкое) — ه
  { id: "ha-soft-letter", chapter: "chapter-5", type: "letter", title: "ه Ха", subtitle: "Мягкое Ха", letterId: "ha_soft", letter: "ه", to: "/letter/ha_soft" },
  { id: "ha-soft-sound", chapter: "chapter-5", type: "sound", title: "Послушай ه", subtitle: "Отличи от ح", letterId: "ha_soft", to: "/letter/ha_soft?sound=true" },
  { id: "ha-soft-find", chapter: "chapter-5", type: "game", title: "Найди ه", subtitle: "Найди мягкое Ха", letterId: "ha_soft", gameType: "find-letter", to: "/game/find-letter/ha_soft" },
  { id: "ha-soft-reward", chapter: "chapter-5", type: "reward", title: "Награда ه", subtitle: "Забери очки", letterId: "ha_soft", to: "/reward/ha_soft" },

  // ВАВ — و
  { id: "waw-letter", chapter: "chapter-5", type: "letter", title: "و Вав", subtitle: "Округлая буква", letterId: "waw", letter: "و", to: "/letter/waw" },
  { id: "waw-sound", chapter: "chapter-5", type: "sound", title: "Послушай Вав", subtitle: "Слушай и повторяй", letterId: "waw", to: "/letter/waw?sound=true" },
  { id: "waw-find", chapter: "chapter-5", type: "game", title: "Найди Вав", subtitle: "Найди букву و", letterId: "waw", gameType: "find-letter", to: "/game/find-letter/waw" },
  { id: "waw-reward", chapter: "chapter-5", type: "reward", title: "Награда Вав", subtitle: "Забери очки", letterId: "waw", to: "/reward/waw" },

  // Финальный повтор и испытание
  { id: "alphabet-review", chapter: "chapter-5", type: "review", title: "Повтори алфавит", subtitle: "Все буквы вместе", to: "/alphabet" },
  { id: "alphabet-catch", chapter: "chapter-5", type: "game", title: "Поймай букву", subtitle: "Большая тренировка", letterId: "ba", gameType: "catch", to: "/game/catch/ba" },
  { id: "alphabet-final", chapter: "chapter-5", type: "boss", title: "Финальное испытание", subtitle: "Полный алфавит — ты справишься!", to: "/boss/chapter-5" },

  // ГЛАВА 6: Слоги после букв
  { id: "syllables-short-vowels", chapter: "chapter-6", type: "syllable", title: "Слоги с огласовками", subtitle: "Фатха, касра и дамма", letter: "بَ", to: "/lessons/syllables/short-vowels" },
  { id: "syllables-sukun", chapter: "chapter-6", type: "syllable", title: "Закрытые слоги", subtitle: "Сукун останавливает звук", letter: "أَبْ", to: "/lessons/syllables/sukun" },
  { id: "syllables-shadda", chapter: "chapter-6", type: "syllable", title: "Удвоение", subtitle: "Шадда делает звук сильнее", letter: "رَبَّ", to: "/lessons/syllables/shadda" },
  { id: "syllables-madd", chapter: "chapter-6", type: "syllable", title: "Длинные звуки", subtitle: "Мадд тянет звук", letter: "بَا", to: "/lessons/syllables/madd" },

  // ГЛАВА 7: Слова после слогов
  { id: "words-first", chapter: "chapter-7", type: "word", title: "Первые слова", subtitle: "Собираем слово из знакомых звуков", letter: "الله", to: "/lessons/words/first-words" },
  { id: "words-quran", chapter: "chapter-7", type: "word", title: "Слова из Корана", subtitle: "Частые слова, которые встретятся в сурах", letter: "نور", to: "/lessons/words/quran-words" },
  { id: "words-prayer", chapter: "chapter-7", type: "word", title: "Слова намаза", subtitle: "Слова, которые ребенок слышит в молитве", letter: "أكبر", to: "/lessons/words/prayer-words" },
  { id: "words-short-lines", chapter: "chapter-7", type: "word", title: "Короткие строки", subtitle: "Соединяем слова в понятное чтение", letter: "بسم الله", to: "/lessons/words/short-lines" },

  // ГЛАВА 8: Переход к чтению Корана
  { id: "reading-start", chapter: "chapter-8", type: "reading", title: "Короткое чтение", subtitle: "Читай слова и строки без спешки", letter: "اقرأ", to: "/reading" },
  { id: "quran-start", chapter: "chapter-8", type: "reading", title: "Первые суры", subtitle: "Переход к разделу Коран", letter: "قرآن", to: "/quran/path" }
];

export function getLessonNodeById(nodeId) {
  return lessonPathNodes.find((node) => node.id === nodeId) || lessonPathNodes[0];
}

export function getLessonNodesForLetter(letterId) {
  const startIndex = lessonPathNodes.findIndex((node) => node.type === "letter" && node.letterId === letterId);
  if (startIndex < 0) return [];
  const endIndex = lessonPathNodes.findIndex((node, index) => index >= startIndex && node.type === "reward" && node.letterId === letterId);
  const sliceEnd = endIndex >= 0 ? endIndex + 1 : startIndex + 1;
  return lessonPathNodes.slice(startIndex, sliceEnd).filter((node) => !node.bonus);
}

export function getLessonNodeIndex(nodeId) {
  const index = lessonPathNodes.findIndex((node) => node.id === nodeId);
  return index >= 0 ? index : 0;
}

export function getNextLessonNodeId(nodeId) {
  const index = getLessonNodeIndex(nodeId);
  return lessonPathNodes[Math.min(index + 1, lessonPathNodes.length - 1)]?.id || lessonPathNodes[0].id;
}

export function getLetterRewardNodeId(letterId) {
  return lessonPathNodes.find((node) => node.type === "reward" && node.letterId === letterId)?.id;
}

export function getLessonNodeForGame(letterId, gameType, lessonState, requestedNodeId) {
  const matches = lessonPathNodes.filter((node) => node.letterId === letterId && node.gameType === gameType);
  if (requestedNodeId) return matches.find((node) => node.id === requestedNodeId)?.id;
  return matches.find((node) => lessonState && getLessonNodeStatus(node.id, lessonState) === "current")?.id
    || matches.find((node) => lessonState && canOpenLessonNode(node.id, lessonState))?.id
    || matches[0]?.id;
}

export function getLessonNodeByType(letterId, type) {
  return lessonPathNodes.find((node) => node.letterId === letterId && node.type === type)?.id;
}

export function getChapterById(chapterId) {
  return lessonChapters.find((chapter) => chapter.id === chapterId) || lessonChapters[0];
}

export function getNodesByChapter(chapterId) {
  return lessonPathNodes.filter((node) => node.chapter === chapterId);
}

export function getNodeReward(node) {
  return nodeRewards[node?.type] || { points: 5, coins: 0 };
}

function getFirstOpenNodeIndex(completed) {
  const firstOpenIndex = lessonPathNodes.findIndex((node) => !node.bonus && !completed.includes(node.id));
  return firstOpenIndex >= 0 ? firstOpenIndex : lessonPathNodes.length - 1;
}

export function getLessonNodeStatus(nodeId, lessonState) {
  const completed = lessonState.completedLessonNodes || [];
  const node = lessonPathNodes.find((item) => item.id === nodeId);
  if (!node) return "locked";
  const nodeIndex = getLessonNodeIndex(node.id);

  if (completed.includes(node.id)) return "completed";
  if (node.bonus && node.unlockAfter && completed.includes(node.unlockAfter)) return "bonus";
  if (!node.bonus && nodeIndex === getFirstOpenNodeIndex(completed)) return "current";
  return "locked";
}

export function canOpenLessonNode(nodeId, lessonState) {
  const status = getLessonNodeStatus(nodeId, lessonState);
  return status === "current" || status === "completed" || status === "bonus";
}

export function withLessonPathStatus(nodes, lessonState) {
  return nodes.map((node) => ({ ...node, status: getLessonNodeStatus(node.id, lessonState) }));
}
