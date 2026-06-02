import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import logo from "../assets/brand/al-ilm-logo.png";
import ahmad from "../assets/characters/ahmad.png";
import { DEFAULT_ACCESS_PASSWORD, getAge, getSelectedCharacter, loginLocalAccount, setAge, setSelectedCharacter, setSessionActive } from "../utils/storage.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const particles = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  top: `${10 + ((index * 27) % 76)}%`,
  delay: `${(index % 7) * 0.48}s`,
  duration: `${6 + (index % 5) * 0.82}s`
}));

function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase();
}

function getAgeFromBirthDate(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

function Field({ children, icon: Icon, label }) {
  return (
    <label className="premium-login-field">
      <span>{label}</span>
      <div className="premium-login-input">
        <Icon size={19} aria-hidden="true" />
        {children}
      </div>
    </label>
  );
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, type, checked, value } = event.target;
    setError("");
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const email = normalizeEmail(form.email);

    if (!emailPattern.test(email) || form.password.length < 1) {
      setError("Введите email и пароль");
      return;
    }

    let storedUser = null;
    try {
      storedUser = await loginLocalAccount(email, form.password);
    } catch (authError) {
      setError(authError.message === "not-found" ? "Аккаунт не найден. Зарегистрируйтесь" : "Неверный email или пароль");
      return;
    }

    setSessionActive(true);

    const accessCodeLogin = form.password === DEFAULT_ACCESS_PASSWORD;
    const age = getAge() || (storedUser.dateOfBirth ? getAgeFromBirthDate(storedUser.dateOfBirth) : null) || (accessCodeLogin ? 8 : null);
    if (age) setAge(age);
    let character = getSelectedCharacter();
    if (accessCodeLogin && !character) {
      character = storedUser.preferredCharacter || "ahmad";
      setSelectedCharacter(character);
    }

    if (!age) navigate("/age");
    else if (Number(age) <= 12 && !character) navigate("/character");
    else if (Number(age) <= 12) navigate("/home");
    else navigate("/adult-soon");
  }

  return (
    <section className="auth-screen premium-login">
      <div className="premium-login__bg" aria-hidden="true" />
      <div className="premium-login__shade" aria-hidden="true" />
      <div className="premium-login__light" aria-hidden="true" />
      <div className="premium-login__ornament premium-login__ornament--tl" aria-hidden="true" />
      <div className="premium-login__ornament premium-login__ornament--br" aria-hidden="true" />
      <div className="premium-login__particles" aria-hidden="true">
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

      <div className="premium-login__shell">
        <aside className="premium-login-hero" aria-label="Помощник Ахмад">
          <div className="premium-login-logo" aria-label="Al-Ilm Аль-Ильм">
            <span>
              <img src={logo} alt="" />
            </span>
            <strong>Al-Ilm</strong>
          </div>
          <div className="premium-login-hero__glow" aria-hidden="true" />
          <img src={ahmad} alt="Ахмад" />
          <div className="premium-login-hero__bubble">
            <strong>Рад снова видеть тебя!</strong>
            <p>Продолжим путь знаний с того места, где ты остановился.</p>
          </div>
        </aside>

        <main className="premium-login-card">
          <div className="premium-login-card__copy">
            <span className="premium-login-step">Возвращение в Al-Ilm</span>
            <h1>С возвращением</h1>
            <p>Продолжи свой путь знаний и обучение.</p>
          </div>

          <form className="form-stack premium-login-form" onSubmit={handleSubmit}>
            <Field icon={Mail} label="Email">
              <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="Введите email" />
            </Field>

            <Field icon={LockKeyhole} label="Пароль">
              <input name="password" type="password" value={form.password} onChange={updateField} autoComplete="current-password" placeholder="Введите пароль или 0000" />
            </Field>

            <div className="form-row premium-login-row">
              <label className="check-line premium-login-check">
                <input name="remember" type="checkbox" checked={form.remember} onChange={updateField} />
                <span>Запомнить меня</span>
              </label>
              <button className="link-button premium-login-link" type="button" onClick={() => navigate("/password-reset")}>
                Забыли пароль?
              </button>
            </div>

            {error ? <p className="field-error premium-login-error">{error}</p> : null}

            <button className="button button--primary premium-login-submit" type="submit">
              Войти
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          </form>

          <p className="auth-switch premium-login-switch">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </main>
      </div>
    </section>
  );
}


