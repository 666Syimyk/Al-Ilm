import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, CalendarDays, GraduationCap, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import logo from "../assets/brand/al-ilm-logo.png";
import ahmad from "../assets/characters/ahmad.png";
import { createLocalAccount, getSelectedCharacter, setAge, setSessionActive } from "../utils/storage.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const benefits = [
  { label: "Безопасно", icon: ShieldCheck },
  { label: "Образовательно", icon: GraduationCap },
  { label: "Вдохновляюще", icon: Sparkles }
];

const particles = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  left: `${(index * 23) % 100}%`,
  top: `${10 + ((index * 31) % 76)}%`,
  delay: `${(index % 7) * 0.46}s`,
  duration: `${6 + (index % 5) * 0.85}s`
}));

function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase();
}

function getAgeFromBirthDate(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function Field({ children, icon: Icon, label, error }) {
  return (
    <label className="premium-register-field">
      <span>{label}</span>
      <div className="premium-register-input">
        <Icon size={19} aria-hidden="true" />
        {children}
      </div>
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    repeatPassword: ""
  });
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().slice(0, 10);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function validate() {
    const nextErrors = {};
    const birthDate = form.dateOfBirth ? new Date(form.dateOfBirth) : null;
    const age = form.dateOfBirth ? getAgeFromBirthDate(form.dateOfBirth) : null;

    if (!form.firstName.trim()) nextErrors.firstName = "Введите имя";
    if (!form.lastName.trim()) nextErrors.lastName = "Введите фамилию";
    if (!form.dateOfBirth) nextErrors.dateOfBirth = "Введите дату рождения";
    else if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) nextErrors.dateOfBirth = "Дата рождения указана неверно";
    else if (age < 1 || age > 120) nextErrors.dateOfBirth = "Укажите реальную дату рождения";
    if (!emailPattern.test(normalizeEmail(form.email))) nextErrors.email = "Введите корректный email";
    if (form.password.length < 4) nextErrors.password = "Пароль должен быть не короче 4 символов";
    if (form.password !== form.repeatPassword) nextErrors.repeatPassword = "Пароли должны совпадать";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const age = getAgeFromBirthDate(form.dateOfBirth);
    const character = getSelectedCharacter();

    try {
      await createLocalAccount({
        name: firstName,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        dateOfBirth: form.dateOfBirth,
        email: normalizeEmail(form.email),
        createdAt: new Date().toISOString()
      }, form.password);
    } catch (error) {
      setErrors({ email: error.message === "email-exists" ? "Этот email уже зарегистрирован" : "Не удалось создать аккаунт" });
      return;
    }

    setAge(age);
    setSessionActive(true);

    if (age <= 12 && !character) navigate("/character");
    else if (age <= 12) navigate("/home");
    else navigate("/adult-soon");
  }

  return (
    <section className="auth-screen premium-register">
      <div className="premium-register__bg" aria-hidden="true" />
      <div className="premium-register__shade" aria-hidden="true" />
      <div className="premium-register__light" aria-hidden="true" />
      <div className="premium-register__ornament premium-register__ornament--tl" aria-hidden="true" />
      <div className="premium-register__ornament premium-register__ornament--br" aria-hidden="true" />
      <div className="premium-register__particles" aria-hidden="true">
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

      <div className="premium-register__shell">
        <aside className="premium-register-hero" aria-label="Помощник Ахмад">
          <div className="premium-register-logo" aria-label="Al-Ilm Аль-Ильм">
            <span>
              <img src={logo} alt="" />
            </span>
            <strong>Al-Ilm</strong>
          </div>
          <div className="premium-register-hero__glow" aria-hidden="true" />
          <img src={ahmad} alt="Ахмад" />
          <div className="premium-register-hero__bubble">
            <strong>Ахмад</strong>
            <p>Я сохраню твой прогресс и помогу идти шаг за шагом.</p>
          </div>
        </aside>

        <main className="premium-register-card">
          <div className="premium-register-card__copy">
            <span className="premium-register-step">Шаг 2 из 3</span>
            <h1>Начни свой путь знаний</h1>
            <p>Создай аккаунт, чтобы сохранять прогресс, уроки и достижения.</p>
          </div>

          <form className="form-stack premium-register-form" onSubmit={handleSubmit}>
            <div className="form-grid form-grid--two">
              <Field icon={UserRound} label="Имя" error={errors.firstName}>
                <input name="firstName" value={form.firstName} onChange={updateField} autoComplete="given-name" placeholder="Введите имя" />
              </Field>
              <Field icon={UserRound} label="Фамилия" error={errors.lastName}>
                <input name="lastName" value={form.lastName} onChange={updateField} autoComplete="family-name" placeholder="Введите фамилию" />
              </Field>
            </div>

            <Field icon={CalendarDays} label="Дата рождения" error={errors.dateOfBirth}>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} max={today} onChange={updateField} autoComplete="bday" />
            </Field>

            <Field icon={Mail} label="Email" error={errors.email}>
              <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="Введите email для входа" />
            </Field>

            <div className="form-grid form-grid--two">
              <Field icon={LockKeyhole} label="Пароль" error={errors.password}>
                <input name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" placeholder="Минимум 4 символа" />
              </Field>
              <Field icon={LockKeyhole} label="Повторите пароль" error={errors.repeatPassword}>
                <input name="repeatPassword" type="password" value={form.repeatPassword} onChange={updateField} autoComplete="new-password" placeholder="Введите пароль ещё раз" />
              </Field>
            </div>

            <button className="button button--primary premium-register-submit" type="submit">
              Создать аккаунт
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          </form>

          <p className="auth-switch premium-register-switch">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </main>
      </div>

      <div className="benefits-row premium-register-benefits" aria-label="Преимущества">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <span key={benefit.label}>
              <Icon size={18} aria-hidden="true" /> {benefit.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}


