import { ArrowRight, BookOpen, Landmark, Languages, Sparkles, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/brand/al-ilm-logo.webp";
import ahmad from "../assets/characters/ahmad.webp";

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

  return (
    <section className="duo-onboarding-shell premium-welcome premium-welcome--hello">
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
        <span />
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

      <main className="duo-onboarding-center premium-welcome__center premium-welcome__center--hello">
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
      </main>

      <footer className="duo-lesson-footer duo-onboarding-footer premium-welcome__footer">
        <button className="button button--soft duo-skip-button premium-login-button" type="button" onClick={() => navigate("/login")}>
          <UserRound size={21} aria-hidden="true" />
          Войти
        </button>
        <button
          className="button button--primary duo-main-button premium-next-button"
          type="button"
          onClick={() => navigate("/register")}
        >
          Начать
          <ArrowRight size={24} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}


