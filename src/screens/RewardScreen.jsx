import { ArrowRight, CheckCircle2, Sparkles, Star, Trophy, X } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CharacterHelper from "../components/CharacterHelper.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { getLetterById } from "../data/arabicLetters.js";
import { canOpenLessonNode, getLetterRewardNodeId } from "../data/lessonPath.js";
import { completeLetter, getLessonPathState, getSelectedCharacter } from "../utils/storage.js";

export default function RewardScreen() {
  const navigate = useNavigate();
  const { letterId } = useParams();
  const letter = getLetterById(letterId);
  const character = getSelectedCharacter() || "ahmad";
  const rewardNodeId = letter ? getLetterRewardNodeId(letter.id) : null;

  useEffect(() => {
    if (!letter || !rewardNodeId || !canOpenLessonNode(rewardNodeId, getLessonPathState())) {
      navigate("/lessons", { replace: true });
    }
  }, [letter, navigate, rewardNodeId]);

  function handleContinue() {
    if (!letter) return;
    completeLetter(letter.id);
    navigate("/lessons");
  }

  if (!letter) return null;

  return (
    <section className="duo-lesson-shell duo-lesson-shell--success reward-lesson-shell">
      <div className="reward-ambient" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <header className="duo-lesson-top">
        <button className="duo-exit-button" type="button" onClick={() => navigate("/lessons")} aria-label="Выйти из урока">
          <X size={28} aria-hidden="true" />
        </button>
        <div className="duo-progress-track" aria-label="Прогресс урока 100%">
          <span style={{ width: "100%" }} />
        </div>
      </header>

      <div className="duo-lesson-main reward-lesson-main">
        <GlassCard className="reward-screen-card reward-lesson-card">
          <div className="reward-card-aura" aria-hidden="true" />

          <CharacterHelper
            character={character}
            message="МашаАллах! Ты прошёл урок и стал ближе к чтению новых слов."
            mood="success"
          />

          <div className="reward-trophy-stage">
            <span className="reward-orbit reward-orbit--one" aria-hidden="true"><Star size={16} /></span>
            <span className="reward-orbit reward-orbit--two" aria-hidden="true"><Sparkles size={18} /></span>
            <span className="reward-orbit reward-orbit--three" aria-hidden="true"><Star size={14} /></span>
            <div className="trophy-mark">
              <Trophy size={68} aria-hidden="true" />
            </div>
          </div>

          <span className="reward-kicker">Награда получена</span>
          <h1>Отличная работа!</h1>
          <p>Ты прошёл урок буквы {letter.nameRu}. Маленький шаг сегодня, сильное чтение завтра.</p>

          <div className="reward-letter-medal" aria-label={`Буква ${letter.nameRu}`}>
            <span>{letter.letter}</span>
            <small>Буква {letter.nameRu}</small>
          </div>

          <div className="reward-points">
            <span>
              <Star size={20} aria-hidden="true" /> +20 очков
            </span>
            <span>
              <Sparkles size={20} aria-hidden="true" /> +5 монет
            </span>
          </div>
        </GlassCard>
      </div>

      <footer className="duo-lesson-footer duo-lesson-footer--success">
        <div className="duo-feedback">
          <div className="duo-feedback__icon">
            <CheckCircle2 size={46} aria-hidden="true" />
          </div>
          <div>
            <h2>Награда получена</h2>
            <p>Продолжай путь к следующей букве.</p>
          </div>
        </div>
        <button className="button button--primary duo-main-button" type="button" onClick={handleContinue}>
          Далее
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}
