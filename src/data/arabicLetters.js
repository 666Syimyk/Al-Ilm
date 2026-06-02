export const arabicLetters = [
  { id: "alif", letter: "ا", nameRu: "Алиф", soundText: "Алиф", dotPlacement: "Без точек", dotGroup: "ا", status: "locked" },
  { id: "ba", letter: "ب", nameRu: "Ба", soundText: "Ба", dotPlacement: "Одна точка снизу", dotGroup: "ب ت ث ن ي", status: "locked" },
  { id: "ta", letter: "ت", nameRu: "Та", soundText: "Та", transliteration: "ta", soundHint: "Обычная Та", articulationHint: "Кончик языка мягко касается верхних зубов.", differenceHint: "Это лёгкая Та. Не делай звук глубоким, как у ط.", dotPlacement: "Две точки сверху", dotGroup: "ب ت ث ن ي", status: "locked" },
  { id: "tha", letter: "ث", nameRu: "Са", soundText: "Са", dotPlacement: "Три точки сверху", dotGroup: "ب ت ث ن ي", status: "locked" },
  { id: "jim", letter: "ج", nameRu: "Джим", soundText: "Джим", dotPlacement: "Одна точка снизу", dotGroup: "ج ح خ", status: "locked" },
  { id: "ha_guttural", letter: "ح", nameRu: "Ха", soundText: "Ха", transliteration: "ha", soundHint: "Горловая Ха", articulationHint: "Звук выходит из горла, мягко и без хрипа.", differenceHint: "Эта Ха глубже, чем ه, но не грубая как خ.", dotPlacement: "Без точек", dotGroup: "ج ح خ", status: "locked" },
  { id: "kha", letter: "خ", nameRu: "Хо", soundText: "Хо", dotPlacement: "Одна точка сверху", dotGroup: "ج ح خ", status: "locked" },
  { id: "dal", letter: "د", nameRu: "Даль", soundText: "Даль", dotPlacement: "Без точек", dotGroup: "د ذ", status: "locked" },
  { id: "dhal", letter: "ذ", nameRu: "Заль", soundText: "Заль", dotPlacement: "Одна точка сверху", dotGroup: "د ذ", status: "locked" },
  { id: "ra", letter: "ر", nameRu: "Р Р°", soundText: "Р Р°", dotPlacement: "Без точек", dotGroup: "ر ز", status: "locked" },
  { id: "zay", letter: "ز", nameRu: "Зай", soundText: "Зай", dotPlacement: "Одна точка сверху", dotGroup: "ر ز", status: "locked" },
  { id: "sin", letter: "س", nameRu: "Син", soundText: "Син", dotPlacement: "Без точек", dotGroup: "س ش", status: "locked" },
  { id: "shin", letter: "ش", nameRu: "Шин", soundText: "Шин", dotPlacement: "Три точки сверху", dotGroup: "س ش", status: "locked" },
  { id: "sad", letter: "ص", nameRu: "Сад", soundText: "Сад", dotPlacement: "Без точек", dotGroup: "ص ض", status: "locked" },
  { id: "dad", letter: "ض", nameRu: "Дад", soundText: "Дад", dotPlacement: "Одна точка сверху", dotGroup: "ص ض", status: "locked" },
  { id: "ta_emphatic", letter: "ط", nameRu: "Та", soundText: "Та", transliteration: "ta", soundHint: "Твёрдая Та", articulationHint: "Произносится плотнее: язык чуть приподнят, звук глубже.", differenceHint: "Похожа на ت, но звучит более твёрдо и широко.", dotPlacement: "Без точек", dotGroup: "ط ظ", status: "locked" },
  { id: "za_emphatic", letter: "ظ", nameRu: "За", soundText: "За", dotPlacement: "Одна точка сверху", dotGroup: "ط ظ", status: "locked" },
  { id: "ayn", letter: "ع", nameRu: "Айн", soundText: "Айн", dotPlacement: "Без точек", dotGroup: "ع غ", status: "locked" },
  { id: "ghayn", letter: "غ", nameRu: "Гайн", soundText: "Гайн", dotPlacement: "Одна точка сверху", dotGroup: "ع غ", status: "locked" },
  { id: "fa", letter: "ف", nameRu: "Фа", soundText: "Фа", dotPlacement: "Одна точка сверху", dotGroup: "ف ق", status: "locked" },
  { id: "qaf", letter: "ق", nameRu: "Каф", soundText: "Каф", transliteration: "qaf", soundHint: "Глубокий Каф/Коф", articulationHint: "Звук рождается глубже в задней части языка.", differenceHint: "Не путай с ك: ق глубже и плотнее.", dotPlacement: "Две точки сверху", dotGroup: "ف ق", status: "locked" },
  { id: "kaf", letter: "ك", nameRu: "Кяф", soundText: "Кяф", transliteration: "kaf", soundHint: "Обычный звук К", articulationHint: "Произносится ближе к обычному русскому «к».", differenceHint: "Это лёгкий Каф/Кяф. ق звучит глубже.", dotPlacement: "Без точек", dotGroup: "ك", status: "locked" },
  { id: "lam", letter: "ل", nameRu: "Лям", soundText: "Лям", dotPlacement: "Без точек", dotGroup: "ل", status: "locked" },
  { id: "mim", letter: "م", nameRu: "Мим", soundText: "Мим", dotPlacement: "Без точек", dotGroup: "م", status: "locked" },
  { id: "nun", letter: "ن", nameRu: "Нун", soundText: "Нун", dotPlacement: "Одна точка сверху", dotGroup: "ب ت ث ن ي", status: "locked" },
  { id: "ha_soft", letter: "ه", nameRu: "Ха", soundText: "Ха", transliteration: "ha", soundHint: "Мягкая Ха", articulationHint: "Лёгкий выдох, как спокойное «ха».", differenceHint: "Эта Ха мягче и легче, чем горловая ح.", dotPlacement: "Без точек", dotGroup: "ه", status: "locked" },
  { id: "waw", letter: "و", nameRu: "Вав", soundText: "Вав", dotPlacement: "Без точек", dotGroup: "و", status: "locked" },
  { id: "ya", letter: "ي", nameRu: "Йа", soundText: "Йа", dotPlacement: "Две точки снизу", dotGroup: "ب ت ث ن ي", status: "locked" }
];

export function getLetterById(letterId) {
  return arabicLetters.find((letter) => letter.id === letterId) || arabicLetters[0];
}

export function getNextLetterId(letterId) {
  const index = arabicLetters.findIndex((letter) => letter.id === letterId);
  return arabicLetters[Math.min(index + 1, arabicLetters.length - 1)]?.id || arabicLetters[0].id;
}
