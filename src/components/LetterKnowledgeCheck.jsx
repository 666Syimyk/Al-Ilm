import { useState } from "react";
import { arabicLetters } from "../data/arabicLetters.js";

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function makeLetterQuestions(letters, detailed = false) {
  return letters.flatMap((letter) => {
    const others = shuffle([...new Map(arabicLetters.filter((item) => item.nameRu !== letter.nameRu).map((item) => [item.nameRu, item])).values()]).slice(0, 3);
    const shape = {
      prompt: `Выбери букву ${letter.nameRu}${letter.soundHint ? ` (${letter.soundHint})` : ""}`,
      answer: letter.letter,
      options: shuffle([letter.letter, ...others.map((item) => item.letter)]),
      arabic: true
    };
    return detailed ? [shape, {
      prompt: `Как называется буква ${letter.letter}?`,
      answer: letter.nameRu,
      options: shuffle([letter.nameRu, ...others.map((item) => item.nameRu)])
    }, {
      prompt: `Где точки у буквы ${letter.letter}?`,
      answer: letter.dotPlacement,
      options: shuffle([...new Set([letter.dotPlacement, "Без точек", "Одна точка сверху", "Одна точка снизу", "Две точки сверху", "Две точки снизу", "Три точки сверху"])])
    }] : [shape];
  });
}

export default function LetterKnowledgeCheck({ letters, detailed = false, onComplete }) {
  const [questions] = useState(() => makeLetterQuestions(letters, detailed));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  const correct = selected === question.answer;

  function choose(option) {
    if (correct || finished) return;
    setSelected(option);
    if (option !== question.answer) setMistakes((value) => value + 1);
  }

  function next() {
    if (!correct || finished) return;
    if (index + 1 === questions.length) {
      setFinished(true);
      onComplete({ perfect: mistakes === 0, questions: questions.length, mistakes });
    } else {
      setIndex((value) => value + 1);
      setSelected("");
    }
  }

  return (
    <div className="game-content">
      <p>Вопрос {index + 1} из {questions.length}</p>
      <h3>{question.prompt}</h3>
      <div className="game-options">
        {question.options.map((option) => (
          <button className={`button button--soft ${question.arabic ? "game-letter-button" : ""} ${selected === option ? correct ? "is-correct" : "is-wrong" : ""}`} key={option} type="button" onClick={() => choose(option)} disabled={correct || finished} dir={question.arabic ? "rtl" : undefined}>
            {option}
          </button>
        ))}
      </div>
      <p role="status">{selected ? correct ? "Верно!" : "Посмотри внимательно и попробуй ещё раз." : "Выбери ответ."}</p>
      <button className="button button--primary" type="button" disabled={!correct || finished} onClick={next}>
        {finished ? "Проверка завершена" : index + 1 === questions.length ? "Завершить проверку" : "Следующий вопрос"}
      </button>
    </div>
  );
}
