import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BrandLogo from "../components/BrandLogo.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { getLocalAccountByEmail, resetLocalPassword } from "../utils/storage.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase();
}

export default function PasswordResetScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ password: "", repeatPassword: "" });
  const [error, setError] = useState("");

  function handleEmailSubmit(event) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!emailPattern.test(normalizedEmail)) {
      setError("Введите корректный email");
      return;
    }

    const storedUser = getLocalAccountByEmail(normalizedEmail);
    if (!storedUser) {
      setError("Аккаунт с таким email не найден");
      return;
    }

    setError("");
    setStep("newPassword");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (form.password.length < 4) {
      setError("Пароль должен быть не короче 4 символов");
      return;
    }
    if (form.password !== form.repeatPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await resetLocalPassword(email, form.password);
    } catch {
      setError("Не удалось сохранить новый пароль");
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
                <p>Введите email, который вы указали при регистрации.</p>
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
                <p>Придумайте новый пароль для аккаунта {normalizeEmail(email)}.</p>
              </div>
              <form className="form-stack" onSubmit={handlePasswordSubmit}>
                <label>
                  <span>Новый пароль</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    autoComplete="new-password"
                    placeholder="Минимум 4 символа"
                  />
                </label>
                <label>
                  <span>Повторите пароль</span>
                  <input
                    type="password"
                    value={form.repeatPassword}
                    onChange={(event) => setForm((current) => ({ ...current, repeatPassword: event.target.value }))}
                    autoComplete="new-password"
                    placeholder="Введите пароль ещё раз"
                  />
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
                <p>Пароль успешно изменён. Теперь можно войти с новым паролем.</p>
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
