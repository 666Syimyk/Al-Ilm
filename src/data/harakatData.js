export const harakatList = [
  {
    id: "fatha",
    name: "Фатха",
    arabicName: "فَتْحَة",
    symbol: "َ",
    symbolOnBa: "بَ",
    sound: "а",
    color: "#006F3D",
    level: 1,
    description: "Маленькая косая черта над буквой. Читается как краткое «а».",
    rule: "Черта сверху → произноси «а» после согласного. بَ = ба, تَ = та, كَ = ка",
    examples: [
      { arabic: "بَ", reading: "ба" },
      { arabic: "تَ", reading: "та" },
      { arabic: "كَ", reading: "ка" },
      { arabic: "مَ", reading: "ма" },
      { arabic: "نَ", reading: "на" }
    ],
    words: [
      { arabic: "كَتَبَ", reading: "катаба", translation: "написал" },
      { arabic: "ذَهَبَ", reading: "захаба", translation: "пошёл" },
      { arabic: "قَرَأَ", reading: "кара'а", translation: "прочитал" },
      { arabic: "جَلَسَ", reading: "джаляса", translation: "сел" },
      { arabic: "فَتَحَ", reading: "фатаха", translation: "открыл" }
    ]
  },
  {
    id: "kasra",
    name: "Касра",
    arabicName: "كَسْرَة",
    symbol: "ِ",
    symbolOnBa: "بِ",
    sound: "и",
    color: "#1565C0",
    level: 1,
    description: "Маленькая косая черта под буквой. Читается как краткое «и».",
    rule: "Черта снизу → произноси «и» после согласного. بِ = би, تِ = ти, كِ = ки",
    examples: [
      { arabic: "بِ", reading: "би" },
      { arabic: "تِ", reading: "ти" },
      { arabic: "كِ", reading: "ки" },
      { arabic: "مِ", reading: "ми" },
      { arabic: "نِ", reading: "ни" }
    ],
    words: [
      { arabic: "بِسْمِ", reading: "бисми", translation: "с именем" },
      { arabic: "كِتَابٌ", reading: "китааб", translation: "книга" },
      { arabic: "دِينٌ", reading: "диин", translation: "религия" },
      { arabic: "إِيمَانٌ", reading: "ийман", translation: "вера" },
      { arabic: "بِنْتٌ", reading: "бинт", translation: "девочка" }
    ]
  },
  {
    id: "damma",
    name: "Дамма",
    arabicName: "ضَمَّة",
    symbol: "ُ",
    symbolOnBa: "بُ",
    sound: "у",
    color: "#E65100",
    level: 1,
    description: "Маленькая запятая над буквой. Читается как краткое «у».",
    rule: "Маленькая «у-образная» запятая сверху → произноси «у». بُ = бу, تُ = ту",
    examples: [
      { arabic: "بُ", reading: "бу" },
      { arabic: "تُ", reading: "ту" },
      { arabic: "كُ", reading: "ку" },
      { arabic: "مُ", reading: "му" },
      { arabic: "نُ", reading: "ну" }
    ],
    words: [
      { arabic: "نُورٌ", reading: "нуур", translation: "свет" },
      { arabic: "قُلْ", reading: "куль", translation: "скажи!" },
      { arabic: "مُسْلِمٌ", reading: "муслим", translation: "мусульманин" },
      { arabic: "رُسُلٌ", reading: "русуль", translation: "посланники" },
      { arabic: "كُتُبٌ", reading: "кутуб", translation: "книги" }
    ]
  },
  {
    id: "sukun",
    name: "Сукун",
    arabicName: "سُكُون",
    symbol: "ْ",
    symbolOnBa: "بْ",
    sound: "закрытый",
    color: "#546E7A",
    level: 2,
    description: "Маленький кружок над буквой. Означает, что после этой буквы нет гласного.",
    rule: "Кружок сверху → закрытый слог, без гласной. قُلْ = куль (л закрытый)",
    examples: [
      { arabic: "بْ", reading: "б (без гласной)" },
      { arabic: "كْ", reading: "к (без гласной)" },
      { arabic: "نْ", reading: "н (без гласной)" },
      { arabic: "لْ", reading: "л (без гласной)" }
    ],
    words: [
      { arabic: "قُلْ", reading: "куль", translation: "скажи!" },
      { arabic: "مَنْ", reading: "ман", translation: "кто" },
      { arabic: "هَلْ", reading: "халь", translation: "ли? (вопрос)" },
      { arabic: "أَنْ", reading: "ан", translation: "что, чтобы" },
      { arabic: "عَلْ", reading: "аль", translation: "часть артикля" }
    ]
  },
  {
    id: "shadda",
    name: "Шадда",
    arabicName: "شَدَّة",
    symbol: "ّ",
    symbolOnBa: "بّ",
    sound: "удвоение",
    color: "#6A1B9A",
    level: 2,
    description: "Знак похожий на «w» над буквой. Означает удвоение — буква произносится дважды.",
    rule: "Шадда → удваивай букву. رَبَّ = Рабб (два «б'). إِنَّ = инна (два «н»).",
    examples: [
      { arabic: "بّ", reading: "бб (удвоенное)" },
      { arabic: "تّ", reading: "тт (удвоенное)" },
      { arabic: "نّ", reading: "нн (удвоенное)" },
      { arabic: "مّ", reading: "мм (удвоенное)" }
    ],
    words: [
      { arabic: "رَبَّنَا", reading: "Раббана", translation: "Господь наш" },
      { arabic: "إِنَّ", reading: "инна", translation: "поистине" },
      { arabic: "الرَّحْمَٰنِ", reading: "ар-Рахман", translation: "Милостивый" },
      { arabic: "الرَّحِيمِ", reading: "ар-Рахим", translation: "Милующий" },
      { arabic: "كُلٌّ", reading: "куллюн", translation: "каждый, все" }
    ]
  },
  {
    id: "tanwin",
    name: "Танвин",
    arabicName: "تَنْوِين",
    symbol: "ً ٍ ٌ",
    symbolOnBa: "بٌ",
    sound: "—н",
    color: "#006F3D",
    level: 2,
    description: "Двойная фатха/касра/дамма в конце слова. Добавляет звук «н» — слово неопределённое.",
    rule: "Двойная черта = «н» на конце. بٌ = «бун», بً = «бан», بٍ = «бин».",
    examples: [
      { arabic: "ٌ", reading: "—ун (именительный)" },
      { arabic: "ً", reading: "—ан (винительный)" },
      { arabic: "ٍ", reading: "—ин (родительный)" }
    ],
    words: [
      { arabic: "كِتَابٌ", reading: "китаабун", translation: "книга" },
      { arabic: "وَلَدٌ", reading: "валядун", translation: "мальчик" },
      { arabic: "مُسْلِمٌ", reading: "муслимун", translation: "мусульманин" },
      { arabic: "نُورٌ", reading: "нуурун", translation: "свет" },
      { arabic: "عِلْمٌ", reading: "ильмун", translation: "знание" }
    ]
  },
  {
    id: "long-vowels",
    name: "Длинные гласные",
    arabicName: "حُرُوفُ الْمَدّ",
    symbol: "ا و ي",
    symbolOnBa: "بَا بُو بِي",
    sound: "аа, уу, ии",
    color: "#283593",
    level: 3,
    description: "Алиф после фатхи = «аа». Вав после даммы = «уу». Йа после касры = «ии». Тяни вдвое дольше.",
    rule: "بَا = баа, بُو = буу, بِي = бии — длинные, как в слове «маа-ма».",
    examples: [
      { arabic: "بَا", reading: "баа (длинное а)" },
      { arabic: "بُو", reading: "буу (длинное у)" },
      { arabic: "بِي", reading: "бии (длинное и)" }
    ],
    words: [
      { arabic: "قُرْآنٌ", reading: "Кур'аан", translation: "Коран" },
      { arabic: "كِتَابٌ", reading: "Китааб", translation: "книга" },
      { arabic: "نُورٌ", reading: "Нуур", translation: "свет" },
      { arabic: "إِيمَانٌ", reading: "Ийман", translation: "вера" },
      { arabic: "صَلَاةٌ", reading: "Саляа", translation: "намаз" }
    ]
  }
];

export function getHarakatById(id) {
  return harakatList.find((h) => h.id === id) || harakatList[0];
}
