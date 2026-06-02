export const harakatLessons = [
  {
    id: "fatha",
    title: "Фатха",
    sign: "َ",
    example: "بَ",
    explanation: "Короткий звук «а». Знак стоит над буквой.",
    practice: ["بَ", "تَ", "مَ"],
    quiz: { question: "Как читается بَ?", options: ["ба", "би", "бу"], answer: "ба" }
  },
  {
    id: "kasra",
    title: "Касра",
    sign: "ِ",
    example: "بِ",
    explanation: "Короткий звук «и». Знак стоит под буквой.",
    practice: ["بِ", "تِ", "مِ"],
    quiz: { question: "Где стоит касра?", options: ["под буквой", "над буквой", "после буквы"], answer: "под буквой" }
  },
  {
    id: "damma",
    title: "Дамма",
    sign: "ُ",
    example: "بُ",
    explanation: "Короткий звук «у». Знак похож на маленькую запятую сверху.",
    practice: ["بُ", "تُ", "مُ"],
    quiz: { question: "Как читается بُ?", options: ["бу", "ба", "би"], answer: "бу" }
  },
  {
    id: "sukun",
    title: "Сукун",
    sign: "ْ",
    example: "بْ",
    explanation: "После буквы нет гласного звука. Слог закрывается.",
    practice: ["قُلْ", "مَنْ", "هَلْ"],
    quiz: { question: "Что показывает сукун?", options: ["нет гласного", "длинное а", "удвоение"], answer: "нет гласного" }
  },
  {
    id: "weak-letters",
    title: "Слабые буквы ا و ي",
    sign: "ا و ي",
    example: "بَا بُو بِي",
    explanation: "Эти буквы часто помогают тянуть звук: аа, уу, ии.",
    practice: ["قَالَ", "نُورٌ", "دِينٌ"],
    quiz: { question: "Какая буква тянет «ии» после касры?", options: ["ي", "و", "ا"], answer: "ي" }
  },
  {
    id: "shadda",
    title: "Шадда",
    sign: "ّ",
    example: "رَبَّ",
    explanation: "Буква произносится сильнее, как будто их две.",
    practice: ["إِنَّ", "ثُمَّ", "رَبَّ"],
    quiz: { question: "Что делает шадда?", options: ["удваивает букву", "убирает звук", "делает паузу"], answer: "удваивает букву" }
  },
  {
    id: "tanwin",
    title: "Танвин",
    sign: "ً ٍ ٌ",
    example: "كِتَابٌ",
    explanation: "Двойная огласовка в конце слова добавляет звук «н».",
    practice: ["كِتَابٌ", "نُورٌ", "عِلْمٌ"],
    quiz: { question: "Какой звук добавляет танвин?", options: ["н", "м", "р"], answer: "н" }
  },
  {
    id: "hamza",
    title: "Хамза",
    sign: "ء",
    example: "أَ",
    explanation: "Хамза даёт чёткое начало звука, как лёгкая остановка в горле.",
    practice: ["أَحَدٌ", "إِيَّاكَ", "قُرْآنٌ"],
    quiz: { question: "Хамза помогает начать звук...", options: ["чётко", "длинно", "беззвучно"], answer: "чётко" }
  },
  {
    id: "ta-marbuta",
    title: "Та марбута",
    sign: "ة",
    example: "رَحْمَة",
    explanation: "В конце слова часто читается как мягкое «а», а при связке может звучать как «т».",
    practice: ["رَحْمَة", "جَنَّة", "صَلَاة"],
    quiz: { question: "Та марбута чаще стоит...", options: ["в конце слова", "только в начале", "между цифрами"], answer: "в конце слова" }
  }
];

export function getHarakatLessonById(id) {
  return harakatLessons.find((lesson) => lesson.id === id) || harakatLessons[0];
}
