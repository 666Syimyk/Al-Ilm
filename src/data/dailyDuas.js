export const dailyDuas = [
  {
    id: "before-eating",
    title: "Перед едой",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Бисмиллях",
    translation: "С именем Аллаха.",
    hint: "Скажи перед первым кусочком и ешь правой рукой."
  },
  {
    id: "after-eating",
    title: "После еды",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Аль-хамду лиллях",
    translation: "Хвала Аллаху.",
    hint: "Поблагодари Аллаха за еду и здоровье."
  },
  {
    id: "before-sleep",
    title: "Перед сном",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Бисмика Аллахумма амуту ва ахья",
    translation: "С Твоим именем, о Аллах, я умираю и оживаю.",
    hint: "Прочитай спокойно перед сном."
  },
  {
    id: "after-waking",
    title: "После пробуждения",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا",
    transliteration: "Аль-хамду лилляхиллязи ахьяна",
    translation: "Хвала Аллаху, Который оживил нас.",
    hint: "Начни день с благодарности."
  },
  {
    id: "leaving-home",
    title: "Перед выходом из дома",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ",
    transliteration: "Бисмиллях, таваккальту аляллах",
    translation: "С именем Аллаха, я полагаюсь на Аллаха.",
    hint: "Попроси защиты и хорошего пути."
  },
  {
    id: "parents",
    title: "За родителей",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Раббирхамхума кама раббаяни сагира",
    translation: "Господь мой, помилуй их, как они растили меня маленьким.",
    hint: "Делай это дуа за маму и папу."
  },
  {
    id: "study",
    title: "Перед учёбой",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Рабби зидни ильма",
    translation: "Господь мой, прибавь мне знания.",
    hint: "Скажи перед уроком и старайся внимательно."
  }
];

export function getDailyDuaById(id) {
  return dailyDuas.find((dua) => dua.id === id) || dailyDuas[0];
}
