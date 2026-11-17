import { BookOpen, Coins, Flame, Flower2, Leaf, Star, Trophy, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CharacterHelper from "../components/CharacterHelper.jsx";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { arabicLetters, getLetterById } from "../data/arabicLetters.js";
import { getLessonPathState, getProgress, getQuranState, getSelectedCharacter } from "../utils/storage.js";
import { countLetters } from "../utils/plural.js";

const ACHIEVEMENTS_META = [
  { id: "young_student", title: "Юный ученик", desc: "Выучи первую букву", icon: Star },
  { id: "letter_expert", title: "Знаток букв", desc: "Выучи 5 букв", icon: BookOpen },
  { id: "strong_streak", title: "Сильная серия", desc: "7 дней подряд", icon: Flame },
  { id: "alphabet_master", title: "Мастер алфавита", desc: "Весь алфавит", icon: Trophy },
  { id: "game_student", title: "Игрок", desc: "10 мини-игр", icon: Zap },
  { id: "no_errors", title: "Без ошибок", desc: "Пройди проверку", icon: Star }
];

const GARDEN_PLANTS = [
  { id: "seedling", label: "Росток", emoji: "🌱", threshold: 0 },
  { id: "sprout", label: "Побег", emoji: "🌿", threshold: 3 },
  { id: "flower", label: "Цветок", emoji: "🌸", threshold: 7 },
  { id: "tree", label: "Дерево", emoji: "🌳", threshold: 15 },
  { id: "garden", label: "Сад знаний", emoji: "🏡", threshold: 28 }
];

function GardenStage({ completedCount }) {
  const stage = [...GARDEN_PLANTS].reverse().find((p) => completedCount >= p.threshold) || GARDEN_PLANTS[0];
  const next = GARDEN_PLANTS.find((p) => p.threshold > completedCount);
  const pct = next ? Math.round(((completedCount - stage.threshold) / (next.threshold - stage.threshold)) * 100) : 100;

  return (
    <div className="garden-stage">
      <div className="garden-stage__emoji">{stage.emoji}</div>
      <div className="garden-stage__info">
        <strong>{stage.label}</strong>
        {next ? (
          <p>До «{next.label}»: ещё {countLetters(next.threshold - completedCount)}</p>
        ) : (
          <p>Сад знаний полностью расцвёл!</p>
        )}
        <div className="progress-bar" aria-label={`Сад ${pct}%`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function ProgressScreen() {
  const navigate = useNavigate();
  const character = getSelectedCharacter() || "ahmad";
  const progress = getProgress();
  const lessonState = getLessonPathState();
  const quranState = getQuranState();

  const completedCount = progress.completedLetters.length;
  const totalLetters = arabicLetters.length;
  const pct = Math.round((completedCount / totalLetters) * 100);
  const currentLetter = getLetterById(progress.currentLesson);

  const unlockedAchievements = ACHIEVEMENTS_META.filter((a) => progress.achievements.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS_META.filter((a) => !progress.achievements.includes(a.id));

  const completedNodesCount = lessonState.completedLessonNodes.length;

  const characterMsg = completedCount === 0
    ? "Начни первый урок и посади свой первый росток знаний!"
    : completedCount >= totalLetters
      ? "Ты выучил весь алфавит! Ты настоящий знаток!"
      : `Отличный прогресс! Осталось ${totalLetters - completedCount} букв.`;

  return (
    <section className="content-stack">
      <Header title="Прогресс" subtitle="Твой путь знаний">
        <CharacterHelper character={character} message={characterMsg} mood="encouragement" compact />
      </Header>

      {/* Сводка */}
      <div className="progress-summary-grid">
        <GlassCard className="progress-summary-stat">
          <BookOpen size={26} aria-hidden="true" />
          <strong>{completedCount}</strong>
          <span>из {totalLetters} букв</span>
        </GlassCard>
        <GlassCard className="progress-summary-stat">
          <Star size={26} aria-hidden="true" />
          <strong>{progress.points}</strong>
          <span>очков</span>
        </GlassCard>
        <GlassCard className="progress-summary-stat">
          <Flame size={26} aria-hidden="true" />
          <strong>{progress.streak}</strong>
          <span>{progress.streak === 1 ? "день" : "дней"}</span>
        </GlassCard>
        <GlassCard className="progress-summary-stat">
          <Coins size={26} aria-hidden="true" />
          <strong>{progress.coins}</strong>
          <span>монет</span>
        </GlassCard>
      </div>

      {/* Уровень и прогресс алфавита */}
      <GlassCard className="progress-main-card">
        <div className="progress-main-card__top">
          <div>
            <p className="section-kicker">Уровень {progress.level}</p>
            <h2>Изучено {pct}% алфавита</h2>
            <p>{completedCount} из {totalLetters} букв · {completedNodesCount} шагов пройдено</p>
          </div>
          <div className="progress-ring" style={{ "--progress-deg": `${pct * 3.6}deg` }}>
            <strong>{pct}%</strong>
          </div>
        </div>
        <div className="progress-bar" aria-label={`Алфавит ${pct}%`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <button className="button button--primary" type="button" onClick={() => navigate(`/letter/${currentLetter.id}`)}>
          Продолжить: буква {currentLetter.nameRu} {currentLetter.letter}
        </button>
      </GlassCard>

      {/* Сад знаний */}
      <GlassCard className="garden-card">
        <div className="profile-section-head">
          <h2>Сад знаний</h2>
          <Flower2 size={20} aria-hidden="true" />
        </div>
        <GardenStage completedCount={completedCount} />
        <p className="garden-hint">Каждая выученная буква помогает саду расцвести.</p>
      </GlassCard>

      {/* Буквы */}
      <GlassCard className="progress-letters-card">
        <div className="profile-section-head">
          <h2>Буквы алфавита</h2>
          <span className="progress-pill">{completedCount}/{totalLetters}</span>
        </div>
        <div className="progress-letters-grid">
          {arabicLetters.map((letter) => {
            const done = progress.completedLetters.includes(letter.id);
            const current = letter.id === progress.currentLesson;
            return (
              <button
                key={letter.id}
                className={`progress-letter-cell${done ? " is-done" : current ? " is-current" : " is-locked"}`}
                type="button"
                onClick={() => (done || current) ? navigate(`/letter/${letter.id}`) : null}
                aria-label={`${letter.nameRu} ${done ? "выучено" : current ? "текущая" : "закрыто"}`}
              >
                <span>{letter.letter}</span>
                {done && <Leaf size={10} className="progress-letter-cell__check" />}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Коран прогресс */}
      <GlassCard className="progress-section-card">
        <div className="profile-section-head">
          <h2>Коран</h2>
          <span className="progress-pill">{quranState.memorizedSurahs.length} сур</span>
        </div>
        <p>{quranState.memorizedSurahs.length > 0
          ? `Выучено сур: ${quranState.memorizedSurahs.length}`
          : "Начни изучать Коран из раздела «Главная»"}
        </p>
        <button className="button button--soft" type="button" onClick={() => navigate("/quran")}>
          Открыть Коран
        </button>
      </GlassCard>

      {/* Достижения */}
      <GlassCard className="progress-section-card">
        <div className="profile-section-head">
          <h2>Достижения</h2>
          <span className="progress-pill">{unlockedAchievements.length}/{ACHIEVEMENTS_META.length}</span>
        </div>
        <div className="profile-achievement-grid">
          {ACHIEVEMENTS_META.map(({ id, title, desc, icon: Icon }) => {
            const unlocked = progress.achievements.includes(id);
            return (
              <div key={id} className={`profile-achievement ${unlocked ? "is-unlocked" : "is-locked"}`}>
                <div className="profile-achievement__shield">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <strong>{title}</strong>
                <small>{unlocked ? desc : "Закрыто"}</small>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </section>
  );
}
