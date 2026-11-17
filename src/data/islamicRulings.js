// Brief terminology notes, not a fatwa or a complete school-specific course.
export const islamicRulingsSource = {
  name: "Dar al-Ifta Egypt — Shariah Law, Important terminology",
  url: "https://www.dar-alifta.org/en/article/details/111/shariah-law",
  note: "Краткий учебный словарь по указанному источнику. Термины изучай с учителем; применение к конкретным ситуациям здесь не разбирается."
};

const definitions = [
  ["fard", "Фарз", "#006F3D", "Обязательное действие.", "В словаре источника: обязанность, установленная определённым, не допускающим сомнения доказательством."],
  ["wajib", "Важиб", "#007243", "Действие, которое также обязательно выполнять.", "В приведённой классификации важиб отличается от фарз видом доказательства, а не тем, что его можно без причины оставлять."],
  ["sunnah", "Сунна", "#007243", "В этой теме — рекомендуемое, необязательное действие.", "Источник различает сунну, которую Пророк регулярно совершал, и ту, которую совершал нерегулярно. Это специальное употребление термина в фикхе."],
  ["mustahab", "Мустахаб", "#007243", "Рекомендуемое действие.", "В указанном словаре это рекомендуемое, но не обязательное действие."],
  ["mubah", "Мубах", "#d0a84d", "Разрешённое действие.", "Выполнение и оставление такого действия сами по себе не предписаны."],
  ["makruh", "Макрух", "#d6873a", "Термин для действий, которых следует избегать.", "Источник отдельно описывает макрух тахрими и макрух танзихи. Их нельзя объединять в одно простое правило без пояснений учителя."],
  ["haram", "Харам", "#cf4d3f", "Запрещённое действие.", "В указанной классификации это действие, от которого предписано обязательно воздерживаться."]
];

export const islamicRulings = definitions.map(([id, title, color, childExplanation, adultExplanation], index) => ({
  id, title, color, childExplanation, adultExplanation,
  order: index + 1,
  examples: [],
  miniTest: null,
  source: islamicRulingsSource.name,
  sourceUrl: islamicRulingsSource.url
}));

export function getIslamicRulingById(id) {
  return islamicRulings.find((item) => item.id === id) || islamicRulings[0];
}
