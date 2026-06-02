import { ArrowLeft, ArrowRight, BookOpen, Clock3, Landmark, Languages, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/brand/al-ilm-logo.png";
import ahmad from "../assets/characters/ahmad.png";
import amina from "../assets/characters/amina.png";
import { setDailyGoal } from "../utils/storage.js";

const goals = [
  { minutes: 5, title: "5 минут в день", level: "Лёгкая" },
  { minutes: 10, title: "10 минут в день", level: "Обычная" },
  { minutes: 15, title: "15 минут в день", level: "Серьёзная" },
  { minutes: 20, title: "20 минут в день", level: "Интенсивная" }
];

const features = [
  { title: "Коран", subtitle: "Учись с пониманием", icon: BookOpen },
  { title: "Арабский язык", subtitle: "Буквы и чтение", icon: Languages },
  { title: "Намаз", subtitle: "Учись правильно", icon: Landmark },
  { title: "Путь знаний", subtitle: "Твой прогресс", icon: Sparkles }
];

const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 19) % 100}%`,
  top: `${8 + ((index * 29) % 78)}%`,
  delay: `${(index % 8) * 0.42}s`,
  duration: `${6 + (index % 6) * 0.7}s`
}));

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState("hello");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const isGoalStep = step === "goal";

  return (
    <section className={`duo-onboarding-shell premium-welcome premium-welcome--${step}`}>
      <div className="premium-welcome__bg" aria-hidden="true" />
      <div className="premium-welcome__shade" aria-hidden="true" />
      <div className="premium-welcome__sun" aria-hidden="true" />
      <div className="premium-welcome__moonlight" aria-hidden="true" />
      <div className="premium-welcome__ornament premium-welcome__ornament--tl" aria-hidden="true" />
      <div className="premium-welcome__ornament premium-welcome__ornament--tr" aria-hidden="true" />
      <div className="premium-welcome__ornament premium-welcome__ornament--bl" aria-hidden="true" />
      <div className="premium-welcome__ornament premium-welcome__ornament--br" aria-hidden="true" />
      <div className="premium-welcome__particles" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{
              "--particle-left": particle.left,
              "--particle-top": particle.top,
              "--particle-delay": particle.delay,
              "--particle-duration": particle.duration
            }}
          />
        ))}
      </div>

      <header className="duo-onboarding-top premium-welcome__top">
        {isGoalStep ? (
          <button className="premium-round-button" type="button" onClick={() => setStep("hello")} aria-label="Назад">
            <ArrowLeft size={25} aria-hidden="true" />
          </button>
        ) : (
          <span />
        )}
        <div className="premium-logo" aria-label="Al-Ilm Аль-Ильм">
          <span className="premium-logo__mark">
            <img src={logo} alt="" />
          </span>
          <span>
            <strong>Al-Ilm</strong>
            <small>Аль-Ильм • العلم</small>
          </span>
        </div>
        <span />
      </header>

      <main className={`duo-onboarding-center premium-welcome__center premium-welcome__center--${step}`}>
        {!isGoalStep ? (
          <>
            <div className="premium-feature-cloud" aria-label="Возможности Al-Ilm">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <article className={`premium-feature-card premium-feature-card--${index + 1}`} key={feature.title}>
                    <span>
                      <Icon size={25} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{feature.title}</strong>
                      <small>{feature.subtitle}</small>
                    </div>
                  </article>
                );
              })}
            </div>

            <section className="premium-hero" aria-label="Приветствие Ахмада">
              <div className="premium-hero__glow" aria-hidden="true" />
              <div className="premium-hero__blink" aria-hidden="true" />
              <img className="premium-hero__character" src={ahmad} alt="Ахмад" />
              <article className="premium-dialog">
                <span className="premium-dialog__badge">Ахмад</span>
                <h1>Ассаляму алейкум!</h1>
                <p>Я помогу тебе учить арабские буквы и Коран шаг за шагом.</p>
              </article>
            </section>
          </>
        ) : (
          <section className="premium-goal-step" aria-label="Выбор дневной цели">
            <div className="premium-goal-step__guide">
              <img src={amina} alt="Амина" />
              <article className="premium-dialog premium-dialog--goal">
                <span className="premium-dialog__badge">Амина</span>
                <h1>Выбери темп</h1>
                <p>Сколько минут будем учиться каждый день?</p>
              </article>
            </div>
            <div className="duo-goal-options premium-goal-options">
              {goals.map((goal) => (
                <button
                  className={`duo-goal-option premium-goal-option ${selectedGoal === goal.minutes ? "is-selected" : ""}`}
                  key={goal.minutes}
                  type="button"
                  onClick={() => setSelectedGoal(goal.minutes)}
                >
                  <span>
                    <Clock3 size={19} aria-hidden="true" />
                    {goal.title}
                  </span>
                  <strong>{goal.level}</strong>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="duo-lesson-footer duo-onboarding-footer premium-welcome__footer">
        <button className="button button--soft duo-skip-button premium-login-button" type="button" onClick={() => navigate("/login")}>
          <UserRound size={21} aria-hidden="true" />
          Войти
        </button>
        <button
          className="button button--primary duo-main-button premium-next-button"
          type="button"
          disabled={isGoalStep && !selectedGoal}
          onClick={() => {
            if (!isGoalStep) {
              setStep("goal");
            } else {
              if (selectedGoal) setDailyGoal(selectedGoal);
              navigate("/register");
            }
          }}
        >
          {isGoalStep ? "Начать" : "Далее"}
          <ArrowRight size={24} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}


