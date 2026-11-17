import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import { setAge } from "../utils/storage.js";

export default function AgeScreen() {
  const navigate = useNavigate();
  const [ageValue, setAgeValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const numericAge = Number(ageValue);
    if (!numericAge || numericAge < 3 || numericAge > 120) {
      setError("Введите возраст от 3 до 120");
      return;
    }

    setAge(numericAge);
    navigate(numericAge <= 12 ? "/character" : "/adult-soon");
  }

  return (
    <section className="center-screen">
      <GlassCard className="simple-card">
        <p className="brand-mark">Аль-Ильм</p>
        <h1>Сколько лет ученику?</h1>
        <p>Это поможет подобрать подходящий режим обучения.</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Возраст</span>
            <input
              inputMode="numeric"
              min="1"
              max="120"
              name="age"
              type="number"
              value={ageValue}
              onChange={(event) => setAgeValue(event.target.value)}
              placeholder="Например, 9"
            />
          </label>
          {error ? <small className="field-error">{error}</small> : null}
          <button className="button button--primary" type="submit">
            Продолжить
          </button>
        </form>
      </GlassCard>
    </section>
  );
}
