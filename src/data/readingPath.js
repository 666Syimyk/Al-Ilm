export const syllableLessons = [
  {
    id: "short-vowels",
    nodeId: "syllables-short-vowels",
    order: 1,
    title: "Слоги с огласовками",
    subtitle: "Фатха, касра и дамма",
    focus: "بَ بِ بُ",
    goal: "Научись соединять букву с коротким звуком.",
    items: [
      { arabic: "بَ", reading: "ба", hint: "Буква Ба с фатхой" },
      { arabic: "بِ", reading: "би", hint: "Буква Ба с касрой" },
      { arabic: "بُ", reading: "бу", hint: "Буква Ба с даммой" },
      { arabic: "تَ", reading: "та", hint: "Буква Та с фатхой" },
      { arabic: "نِ", reading: "ни", hint: "Буква Нун с касрой" },
      { arabic: "مُ", reading: "му", hint: "Буква Мим с даммой" }
    ]
  },
  {
    id: "sukun",
    nodeId: "syllables-sukun",
    order: 2,
    title: "Закрытые слоги",
    subtitle: "Сукун останавливает звук",
    focus: "أَبْ مِنْ لَمْ",
    goal: "Почувствуй, где звук останавливается.",
    items: [
      { arabic: "أَبْ", reading: "аб", hint: "Последняя буква читается коротко и закрыто" },
      { arabic: "مِنْ", reading: "мин", hint: "Нун с сукуном закрывает слог" },
      { arabic: "عَنْ", reading: "ан", hint: "Звук заканчивается на Нун" },
      { arabic: "لَمْ", reading: "лям", hint: "Мим закрывает слово" }
    ]
  },
  {
    id: "shadda",
    nodeId: "syllables-shadda",
    order: 3,
    title: "Удвоение",
    subtitle: "Шадда делает звук сильнее",
    focus: "رَبَّ إِنَّ حَقّ",
    goal: "Произнеси букву с шаддой чуть дольше и сильнее.",
    items: [
      { arabic: "رَبَّ", reading: "рабба", hint: "Ба звучит удвоенно" },
      { arabic: "إِنَّ", reading: "инна", hint: "Нун нужно удержать" },
      { arabic: "حَقّ", reading: "хакк", hint: "Каф читается с усилением" },
      { arabic: "مَرَّ", reading: "марра", hint: "Ра звучит удвоенно" }
    ]
  },
  {
    id: "madd",
    nodeId: "syllables-madd",
    order: 4,
    title: "Длинные звуки",
    subtitle: "Мадд тянет звук",
    focus: "بَا بِي بُو",
    goal: "Отличай короткий звук от длинного.",
    items: [
      { arabic: "بَا", reading: "баа", hint: "Алиф удлиняет звук А" },
      { arabic: "بِي", reading: "бии", hint: "Йа удлиняет звук И" },
      { arabic: "بُو", reading: "буу", hint: "Вав удлиняет звук У" },
      { arabic: "نُور", reading: "нуур", hint: "Длинный У в середине слова" },
      { arabic: "قَالَ", reading: "кааля", hint: "Алиф после Каф тянет звук" }
    ]
  }
];

export const wordLessons = [
  {
    id: "first-words",
    nodeId: "words-first",
    order: 1,
    title: "Первые слова",
    subtitle: "Собираем слово из знакомых звуков",
    goal: "Читай слово по частям: слог за слогом.",
    words: [
      { arabic: "الله", reading: "Аллах", translation: "Аллах", parts: ["ال", "له"] },
      { arabic: "رَبّ", reading: "рабб", translation: "Господь", parts: ["رَ", "بّ"] },
      { arabic: "نُور", reading: "нуур", translation: "свет", parts: ["نُو", "ر"] },
      { arabic: "سَلَام", reading: "саляам", translation: "мир", parts: ["سَ", "لَا", "م"] },
      { arabic: "كِتَاب", reading: "китааб", translation: "книга", parts: ["كِ", "تَا", "ب"] }
    ]
  },
  {
    id: "quran-words",
    nodeId: "words-quran",
    order: 2,
    title: "Слова из Корана",
    subtitle: "Частые слова, которые встретятся в сурах",
    goal: "Узнавай знакомые слова в аятах.",
    words: [
      { arabic: "الْحَمْد", reading: "аль-хамд", translation: "хвала", parts: ["الْ", "حَمْ", "د"] },
      { arabic: "رَحْمَة", reading: "рахма", translation: "милость", parts: ["رَحْ", "مَ", "ة"] },
      { arabic: "مَلِك", reading: "малик", translation: "Царь", parts: ["مَ", "لِ", "ك"] },
      { arabic: "صِرَاط", reading: "сырат", translation: "путь", parts: ["صِ", "رَا", "ط"] },
      { arabic: "النَّاس", reading: "ан-наас", translation: "люди", parts: ["النَّ", "اس"] }
    ]
  },
  {
    id: "prayer-words",
    nodeId: "words-prayer",
    order: 3,
    title: "Слова намаза",
    subtitle: "Слова, которые ребенок слышит в молитве",
    goal: "Свяжи чтение с тем, что уже звучит в намазе.",
    words: [
      { arabic: "أَكْبَر", reading: "акбар", translation: "величайший", parts: ["أَكْ", "بَ", "ر"] },
      { arabic: "سُبْحَان", reading: "субхаан", translation: "пречист", parts: ["سُبْ", "حَا", "ن"] },
      { arabic: "سَمِعَ", reading: "самиъа", translation: "услышал", parts: ["سَ", "مِ", "عَ"] },
      { arabic: "رَبَّنَا", reading: "раббанаа", translation: "наш Господь", parts: ["رَبَّ", "نَا"] },
      { arabic: "سَلَام", reading: "саляам", translation: "мир", parts: ["سَ", "لَا", "م"] }
    ]
  },
  {
    id: "short-lines",
    nodeId: "words-short-lines",
    order: 4,
    title: "Короткие строки",
    subtitle: "Соединяем слова в понятное чтение",
    goal: "Читай не по одной букве, а целой короткой строкой.",
    words: [
      { arabic: "بِسْمِ الله", reading: "бисмиллях", translation: "с именем Аллаха", parts: ["بِسْمِ", "الله"] },
      { arabic: "الْحَمْدُ لله", reading: "аль-хамду лиллях", translation: "хвала Аллаху", parts: ["الْحَمْدُ", "لله"] },
      { arabic: "الله أَكْبَر", reading: "Аллаху акбар", translation: "Аллах величайший", parts: ["الله", "أَكْبَر"] },
      { arabic: "رَبِّ الْعَالَمِينَ", reading: "раббиль-алямин", translation: "Господь миров", parts: ["رَبِّ", "الْعَا", "لَمِينَ"] }
    ]
  }
];

export function getSyllableLessonById(lessonId) {
  return syllableLessons.find((lesson) => lesson.id === lessonId) || syllableLessons[0];
}

export function getWordLessonById(lessonId) {
  return wordLessons.find((lesson) => lesson.id === lessonId) || wordLessons[0];
}

export function getNextSyllableLessonId(lessonId) {
  const index = syllableLessons.findIndex((lesson) => lesson.id === lessonId);
  return syllableLessons[index + 1]?.id || null;
}

export function getNextWordLessonId(lessonId) {
  const index = wordLessons.findIndex((lesson) => lesson.id === lessonId);
  return wordLessons[index + 1]?.id || null;
}
