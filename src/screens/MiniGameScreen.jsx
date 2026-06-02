import { ArrowRight, CheckCircle2, Gamepad2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CharacterHelper from "../components/CharacterHelper.jsx";
import GlassCard from "../components/GlassCard.jsx";
import FindLetterGame from "../games/FindLetterGame.jsx";
import ListenAndChooseGame from "../games/ListenAndChooseGame.jsx";
import TraceLetterGame from "../games/TraceLetterGame.jsx";
import DotPlacementGame from "../games/DotPlacementGame.jsx";
import CatchLetterGame from "../games/CatchLetterGame.jsx";
import { getLetterById } from "../data/arabicLetters.js";
import { canOpenLessonNode, getLessonNodeForGame, getLessonNodesForLetter } from "../data/lessonPath.js";
import { stopAllAudio } from "../utils/audioPlayback.js";
import { completeLessonNode, getLessonPathState, getSelectedCharacter } from "../utils/storage.js";

const games = {
  "find-letter": { title: "Выберите правильную букву", label: "Новое задание", progress: 32, Component: FindLetterGame },
  listen: { title: "Что вы услышали?", label: "Слушание", progress: 48, Component: ListenAndChooseGame },
  quiz: { title: "Проверка знаний", label: "Проверка", progress: 62, Component: ListenAndChooseGame },
  trace: { title: "Напишите букву", label: "Письмо", progress: 72, Component: TraceLetterGame },
  dots: { title: "Выберите точки", label: "Форма буквы", progress: 54, Component: DotPlacementGame },
  catch: { title: "Поймайте нужную букву", label: "Тренировка", progress: 82, Component: CatchLetterGame }
};

export default function MiniGameScreen() {
  const navigate = useNavigate();
  const { gameType = "find-letter", letterId } = useParams();
  const letter = getLetterById(letterId);
  const character = getSelectedCharacter() || "ahmad";
  const [complete, setComplete] = useState(false);
  const game = games[gameType] || games["find-letter"];
  const GameComponent = game.Component;
  const progressValue = complete ? 100 : 0;
  const nodeId = getLessonNodeForGame(letter.id, gameType);
  const availableGameNodes = getLessonNodesForLetter(letter.id).filter((node) => node.gameType && games[node.gameType]);

  useEffect(() => {
    setComplete(false);
    stopAllAudio();
    return () => stopAllAudio();
  }, [gameType, letter.id]);

  useEffect(() => {
    if (!nodeId || !canOpenLessonNode(nodeId, getLessonPathState())) {
      navigate("/lessons", { replace: true });
    }
  }, [navigate, nodeId]);

  function finishGame() {
    if (!nodeId) return;
    const result = completeLessonNode(nodeId);
    if (result.blocked) return;
    setComplete(true);
  }

  return (
    <section className={`duo-lesson-shell duo-game-shell ${complete ? "duo-lesson-shell--success" : ""}`}>
      <header className="duo-lesson-top">
        <button className="duo-exit-button" type="button" onClick={() => navigate("/lessons")} aria-label="Выйти из урока">
          <X size={28} aria-hidden="true" />
        </button>
        <div className="duo-progress-track" aria-label={`Прогресс урока ${progressValue}%`}>
          <span style={{ width: `${progressValue}%` }} />
        </div>
      </header>

      <div className="duo-lesson-main">
        <div className="duo-lesson-prompt">
          <span className="duo-kicker">
            <Gamepad2 size={21} aria-hidden="true" />
            {game.label}
          </span>
          <h1>{game.title}</h1>
          <p>Текущая буква: {letter.nameRu}</p>
        </div>

        <GlassCard className="game-card duo-game-card">
          <div className="game-card__title">
            <CharacterHelper character={character} message={complete ? "Отлично! Ответ засчитан." : "Смотри внимательно и выбирай без спешки."} mood="encouragement" compact />
            <div className="duo-target-tile">
              <span>{letter.letter}</span>
              <strong>{letter.nameRu}</strong>
            </div>
          </div>
          <GameComponent key={`${gameType}-${letter.id}`} letter={letter} onComplete={finishGame} />
        </GlassCard>

        <div className="mini-game-tabs duo-game-tabs" aria-label="Мини-игры урока">
          {availableGameNodes.map((node) => {
            const item = games[node.gameType];
            return (
            <button
              className={node.gameType === gameType ? "is-active" : ""}
              key={node.id}
              type="button"
              disabled={node.gameType !== gameType && !complete}
              onClick={() => navigate(node.to)}
            >
              {item.title}
            </button>
            );
          })}
        </div>
      </div>

      <footer className={`duo-lesson-footer ${complete ? "duo-lesson-footer--success" : ""}`}>
        {complete ? (
          <div className="duo-feedback">
            <div className="duo-feedback__icon">
              <CheckCircle2 size={46} aria-hidden="true" />
            </div>
            <div>
              <h2>Здорово!</h2>
              <p>Ты закрепил букву {letter.nameRu}. Продолжай путь!</p>
            </div>
          </div>
        ) : (
          <button className="button button--soft duo-skip-button" type="button" onClick={() => navigate("/lessons")}>
            К карте
          </button>
        )}

        <button
          className="button button--primary duo-main-button"
          type="button"
          disabled={!complete}
          onClick={() => navigate("/lessons")}
        >
          К следующему шагу
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}
