import {
  ArrowLeft,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Circle,
  Flame,
  Play,
  Star,
  Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import { PRAYERS } from "../data/namazGuide.js";
import {
  getDonePrayersForDate,
  getNamazProgress,
  getSelectedCharacter
} from "../utils/storage.js";

const PRAYER_STEPS = [
  { id: "takbir", label: "Такбир", desc: "Вступление в намаз словами «Аллаху Акбар»" },
  { id: "fatiha", label: "Аль-Фатиха", desc: "Чтение открывающей суры" },
  { id: "sura", label: "Сура после Фатихи", desc: "Короткая сура или аяты после Аль-Фатихи" },
  { id: "ruku", label: "Руку", desc: "Поясной поклон" },
  { id: "itidal", label: "Итидаль", desc: "Выпрямление после поклона" },
  { id: "sujud", label: "Суджуд", desc: "Земной поклон" },
  { id: "tashahhud", label: "Ташаххуд", desc: "Сидение и слова свидетельства" },
  { id: "salawat", label: "Салават", desc: "Салават на Пророка ﷺ" },
  { id: "salam", label: "Салям", desc: "Завершение намаза приветствием" }
];

const DAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function getWeekHistory() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    days.push({ date, done: getDonePrayersForDate(date) });
  }
  return days;
}

function countFard(done) {
  return done.filter((name) => PRAYERS.some((prayer) => prayer.name === name)).length;
}

export default function NamazProgressScreen() {
  const navigate = useNavigate();
  const character = getSelectedCharacter() || "ahmad";
  const namazProgress = getNamazProgress();
  const donePrayers = getDonePrayersForDate();
  const weekHistory = getWeekHistory();

  const todayCount = countFard(donePrayers);
  const totalPrayers = PRAYERS.length;
  const learnedSteps = namazProgress.learnedSteps || [];
  const practiceCount = namazProgress.practiceCount || 0;
  const todayPercent = Math.round((todayCount / totalPrayers) * 100);
  const learnedPercent = Math.round((learnedSteps.length / PRAYER_STEPS.length) * 100);

  const streak = (() => {
    let count = 0;
    for (let i = weekHistory.length - 1; i >= 0; i--) {
      if (countFard(weekHistory[i].done) === totalPrayers) count++;
      else break;
    }
    return count;
  })();

  const characterName = character === "amina" ? "Амина" : "Ахмад";
  const heroMessage = todayCount === totalPrayers
    ? "МашаАллах! Все пять намазов отмечены сегодня."
    : todayCount > 0
      ? `Сегодня отмечено ${todayCount} из ${totalPrayers}. Продолжай спокойно, шаг за шагом.`
      : "Начни с первого намаза сегодня и отметь его после выполнения.";

  return (
    <section className="content-stack namaz-progress-screen">
      <GlassCard className="namaz-progress-hero">
        <button className="namaz-progress-back" type="button" onClick={() => navigate("/namaz")} aria-label="Назад к намазу">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div className="namaz-progress-hero__copy">
          <span className="namaz-progress-kicker">Аль-Ильм</span>
          <h1>Прогресс намаза</h1>
          <p>Отмечай молитвы, закрепляй порядок и смотри свой рост за неделю.</p>
        </div>
        <div className="namaz-progress-hero__status">
          <div className="namaz-progress-ring" style={{ "--namaz-progress": `${todayPercent}%` }}>
            <strong>{todayCount}/{totalPrayers}</strong>
            <span>сегодня</span>
          </div>
          <div className="namaz-progress-helper">
            <span className="namaz-progress-avatar" aria-hidden="true">{character === "amina" ? "рџ‘§" : "рџ‘¦"}</span>
            <div>
              <strong>{characterName}</strong>
              <p>{heroMessage}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="namaz-progress-summary">
        <GlassCard className="namaz-progress-stat">
          <CalendarCheck2 size={24} aria-hidden="true" />
          <strong>{todayCount}/{totalPrayers}</strong>
          <span>намазов сегодня</span>
        </GlassCard>
        <GlassCard className="namaz-progress-stat">
          <Flame size={24} aria-hidden="true" />
          <strong>{streak}</strong>
          <span>{streak === 1 ? "день подряд" : "дней подряд"}</span>
        </GlassCard>
        <GlassCard className="namaz-progress-stat">
          <BookOpen size={24} aria-hidden="true" />
          <strong>{learnedSteps.length}/{PRAYER_STEPS.length}</strong>
          <span>элементов</span>
        </GlassCard>
        <GlassCard className="namaz-progress-stat">
          <Star size={24} aria-hidden="true" />
          <strong>{practiceCount}</strong>
          <span>практик</span>
        </GlassCard>
      </div>

      <div className="namaz-progress-grid">
        <GlassCard className="namaz-progress-card namaz-progress-card--today">
          <div className="namaz-progress-section-head">
            <div>
              <span>Намазы сегодня</span>
              <h2>Ежедневная отметка</h2>
            </div>
            <span className="namaz-progress-pill">{todayCount}/{totalPrayers}</span>
          </div>

          <div className="namaz-prayer-checklist">
            {PRAYERS.map((prayer) => {
              const done = donePrayers.includes(prayer.name);
              return (
                <div key={prayer.id} className={`namaz-prayer-row${done ? " is-done" : ""}`}>
                  <span className="namaz-prayer-icon" aria-hidden="true">{prayer.icon}</span>
                  <div className="namaz-prayer-info">
                    <strong>{prayer.name}</strong>
                    <span>{prayer.rakaats} ракаата · {prayer.nameRu}</span>
                  </div>
                  {done
                    ? <CheckCircle2 size={22} className="namaz-check-done" aria-hidden="true" />
                    : <Circle size={22} className="namaz-check-empty" aria-hidden="true" />
                  }
                </div>
              );
            })}
          </div>

          <button className="button button--primary namaz-progress-open" type="button" onClick={() => navigate("/namaz")}>
            <Play size={17} aria-hidden="true" />
            Открыть намаз
          </button>
        </GlassCard>

        <GlassCard className="namaz-progress-card namaz-progress-card--week">
          <div className="namaz-progress-section-head">
            <div>
              <span>Неделя</span>
              <h2>Ритм молитв</h2>
            </div>
          </div>
          <div className="namaz-week-grid">
            {weekHistory.map(({ date, done }, idx) => {
              const fardDone = countFard(done);
              const isToday = idx === weekHistory.length - 1;
              const pct = Math.round((fardDone / totalPrayers) * 100);
              return (
                <div key={date.toISOString()} className={`namaz-week-day${isToday ? " is-today" : ""}`}>
                  <span className="namaz-week-label">{DAY_LABELS[date.getDay()]}</span>
                  <div className="namaz-week-bar" title={`${fardDone}/${totalPrayers} намазов`}>
                    <div className="namaz-week-bar__fill" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="namaz-week-count">{fardDone}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="namaz-progress-card namaz-progress-card--steps">
          <div className="namaz-progress-section-head">
            <div>
              <span>Обучение</span>
              <h2>Элементы намаза</h2>
            </div>
            <span className="namaz-progress-pill">{learnedSteps.length}/{PRAYER_STEPS.length}</span>
          </div>
          <div className="progress-bar namaz-progress-line" aria-label={`Изучено ${learnedPercent}%`}>
            <span style={{ width: `${learnedPercent}%` }} />
          </div>
          <div className="namaz-steps-list">
            {PRAYER_STEPS.map((step) => {
              const learned = learnedSteps.includes(step.id);
              return (
                <div key={step.id} className={`namaz-step-row${learned ? " is-learned" : ""}`}>
                  {learned
                    ? <CheckCircle2 size={18} className="namaz-check-done" aria-hidden="true" />
                    : <Circle size={18} className="namaz-check-empty" aria-hidden="true" />
                  }
                  <div>
                    <strong>{step.label}</strong>
                    <span>{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="namaz-progress-card namaz-achievement-card">
          <Trophy size={28} aria-hidden="true" />
          <div>
            <span>Практика</span>
            <strong>{practiceCount > 0 ? "Есть выполненные тренировки" : "Пока без завершённых тренировок"}</strong>
            <p>
              {practiceCount > 0
                ? `Полный намаз пройден ${practiceCount} раз. Так держать!`
                : "Открой раздел намаза и пройди практику, чтобы здесь появилась награда."}
            </p>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
