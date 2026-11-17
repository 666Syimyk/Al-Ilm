import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BrandLogo from "../components/BrandLogo.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { getLocalAccountByEmail, recoverLocalPassword, resetLocalPassword } from "../utils/storage.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase();
}

export default function PasswordResetScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [mode, setMode] = useState("forgot");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ currentPassword: "", firstName: "", dateOfBirth: "", password: "", repeatPassword: "" });
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  function updateField(event) {
    setError("");
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleEmailSubmit(event) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!emailPattern.test(normalizedEmail)) {
      setError("Введите корректный email");
      return;
    }

    const storedUser = getLocalAccountByEmail(normalizedEmail);
    if (!storedUser) {
      setError("На этом устройстве нет профиля с таким email");
      return;
    }

    setError("");
    setMode(storedUser.dateOfBirth && (storedUser.firstName || storedUser.name) ? "forgot" : "current");
    setStep("newPassword");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (form.password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }
    if (form.password !== form.repeatPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      if (mode === "forgot") await recoverLocalPassword(email, form.firstName, form.dateOfBirth, form.password);
      else await resetLocalPassword(email, form.password, form.currentPassword);
    } catch (error) {
      if (error.message === "wrong-password") setError("Текущий пароль неверен");
      else if (error.message === "details-mismatch") setError("Имя или дата рождения не совпадают с указанными при регистрации");
      else setError("Не удалось сохранить новый пароль");
      return;
    }
    setStep("done");
  }

  return (
    <section className="auth-screen">
      <div className="auth-layout">
        <BrandLogo />
        <GlassCard className="auth-card">
          {step === "email" && (
            <>
              <div className="auth-card__copy">
                <h1>Восстановление пароля</h1>
                <p>Профиль хранится только на этом устройстве, поэтому письмо не отправляется. Пароль можно сменить, подтвердив имя и дату рождения ребёнка.</p>
              </div>
              <form className="form-stack" onSubmit={handleEmailSubmit}>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setError("");
                      setEmail(event.target.value);
                    }}
                    autoComplete="email"
                    placeholder="Введите email"
                  />
                </label>
                {error ? <p className="field-error">{error}</p> : null}
                <button className="button button--primary" type="submit">
                  Продолжить
                </button>
                <button className="button button--ghost" type="button" onClick={() => navigate("/login")}>
                  Вернуться ко входу
                </button>
              </form>
            </>
          )}

          {step === "newPassword" && (
            <>
              <div className="auth-card__copy">
                <h1>Новый пароль</h1>
                <p>Профиль {normalizeEmail(email)}.</p>
              </div>
              <form className="form-stack" onSubmit={handlePasswordSubmit}>
                {mode === "forgot" ? (
                  <>
                    <label>
                      <span>Имя ребёнка (как при регистрации)</span>
                      <input name="firstName" value={form.firstName} onChange={updateField} autoComplete="given-name" required />
                    </label>
                    <label>
                      <span>Дата рождения ребёнка</span>
                      <input name="dateOfBirth" type="date" max={today} value={form.dateOfBirth} onChange={updateField} required />
                    </label>
                    <button className="link-button" type="button" onClick={() => { setError(""); setMode("current"); }}>
                      Я помню текущий пароль
                    </button>
                  </>
                ) : (
                  <label>
                    <span>Текущий пароль</span>
                    <input name="currentPassword" type="password" value={form.currentPassword} onChange={updateField} autoComplete="current-password" required />
                  </label>
                )}
                <label>
                  <span>Новый пароль</span>
                  <input name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" placeholder="Минимум 6 символов" />
                </label>
                <label>
                  <span>Повторите пароль</span>
                  <input name="repeatPassword" type="password" value={form.repeatPassword} onChange={updateField} autoComplete="new-password" placeholder="Введите пароль ещё раз" />
                </label>
                {error ? <p className="field-error">{error}</p> : null}
                <button className="button button--primary" type="submit">
                  Сохранить пароль
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <>
              <div className="auth-card__copy">
                <h1>Готово!</h1>
                <p>Пароль изменён. Теперь можно войти с новым паролем.</p>
              </div>
              <button className="button button--primary" type="button" onClick={() => navigate("/login")}>
                Войти
              </button>
            </>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
