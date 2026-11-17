// Russian noun form after a number: plural(3, "аят", "аята", "аятов") → "аята".
export function plural(count, one, few, many) {
  const n = Math.abs(Number(count)) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

export const countAyahs = (count) => `${count} ${plural(count, "аят", "аята", "аятов")}`;
export const countLessons = (count) => `${count} ${plural(count, "урок", "урока", "уроков")}`;
export const countSteps = (count) => `${count} ${plural(count, "шаг", "шага", "шагов")}`;
export const countLetters = (count) => `${count} ${plural(count, "буква", "буквы", "букв")}`;
