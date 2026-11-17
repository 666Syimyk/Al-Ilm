import { ArrowLeft, CalendarDays, Download, Mail, Save, Upload, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import { exportAccountBackup, getAge, getUser, importAccountBackup, setAge, setUser } from "../utils/storage.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function ProfileDataScreen() {
  const navigate = useNavigate();
  const user = getUser() || { name: "Юный ученик", email: "student@al-ilm.local" };
  const [form, setForm] = useState({
    firstName: user.firstName || user.name || "",
    lastName: user.lastName || "",
    dateOfBirth: user.dateOfBirth || "",
    email: user.email || ""
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  const backupInputRef = useRef(null);

  function downloadBackup() {
    const backup = exportAccountBackup();
    if (!backup) {
      setBackupMessage("Не удалось создать копию: профиль не найден.");
      return;
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `al-ilm-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupMessage("Файл с прогрессом сохранён. Храните его в надёжном месте.");
  }

  async function restoreBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const count = importAccountBackup(JSON.parse(await file.text()));
      setBackupMessage(`Прогресс восстановлен (${count} записей).`);
    } catch (error) {
      setBackupMessage(error.message === "storage-unavailable"
        ? "Не хватило памяти браузера, чтобы восстановить прогресс."
        : "Это не файл резервной копии Al-Ilm.");
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const age = form.dateOfBirth ? getAgeFromBirthDate(form.dateOfBirth) : getAge();
  const fullName = `${form.firstName} ${form.lastName}`.trim();

  function updateField(event) {
    setSaved(false);
    setErrors({});
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function validate() {
    const nextErrors = {};
    const birthDate = form.dateOfBirth ? new Date(form.dateOfBirth) : null;
    const nextAge = form.dateOfBirth ? getAgeFromBirthDate(form.dateOfBirth) : null;

    if (!form.firstName.trim()) nextErrors.firstName = "Введите имя";
    if (!form.lastName.trim()) nextErrors.lastName = "Введите фамилию";
    if (!form.dateOfBirth) nextErrors.dateOfBirth = "Введите дату рождения";
    else if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) nextErrors.dateOfBirth = "Дата рождения указана неверно";
    else if (nextAge < 3) nextErrors.dateOfBirth = "Al-Ilm рассчитан на детей от 3 лет";
    else if (nextAge > 120) nextErrors.dateOfBirth = "Укажите реальную дату рождения";
    if (!emailPattern.test(normalizeEmail(form.email))) nextErrors.email = "Введите корректный email";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveData(event) {
    event.preventDefault();
    if (!validate()) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const nextAge = getAgeFromBirthDate(form.dateOfBirth);

    try { setUser({
      ...user,
      name: firstName,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      dateOfBirth: form.dateOfBirth,
      email: normalizeEmail(form.email),
      updatedAt: new Date().toISOString()
    }); } catch (error) {
      setErrors({ email: error.message === "email-exists" ? "Этот email уже используется другим профилем" : "Не удалось сохранить данные" });
      return;
    }
    setAge(nextAge);
    setSaved(true);
  }

  return (
    <section className="profile-data-screen">
      <GlassCard className="profile-data-top">
        <button className="background-picker-back" type="button" onClick={() => navigate("/profile")} aria-label="Назад">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <h1>Мои данные</h1>
      </GlassCard>

      <GlassCard className="profile-data-card">
        <div className="profile-data-card__head">
          <div className="profile-data-avatar">
            <UserRound size={34} aria-hidden="true" />
          </div>
          <div>
            <h2>{fullName || "Юный ученик"}</h2>
            <p>
              <Mail size={16} aria-hidden="true" />
              {form.email || "email не указан"}
            </p>
            {form.dateOfBirth ? (
              <p>
                <CalendarDays size={16} aria-hidden="true" />
                {age} лет
              </p>
            ) : null}
          </div>
        </div>

        <form className="form-stack" onSubmit={saveData}>
          <div className="form-grid form-grid--two">
            <label>
              <span>Имя</span>
              <input name="firstName" value={form.firstName} onChange={updateField} autoComplete="given-name" placeholder="Введите имя" />
              {errors.firstName ? <small className="field-error">{errors.firstName}</small> : null}
            </label>
            <label>
              <span>Фамилия</span>
              <input name="lastName" value={form.lastName} onChange={updateField} autoComplete="family-name" placeholder="Введите фамилию" />
              {errors.lastName ? <small className="field-error">{errors.lastName}</small> : null}
            </label>
          </div>

          <label>
            <span>Дата рождения ребёнка</span>
            <input name="dateOfBirth" type="date" max={today} value={form.dateOfBirth} onChange={updateField} autoComplete="bday" />
            {errors.dateOfBirth ? <small className="field-error">{errors.dateOfBirth}</small> : null}
          </label>

          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="Введите email" />
            {errors.email ? <small className="field-error">{errors.email}</small> : null}
          </label>

          {saved ? <p className="success-note">Данные сохранены</p> : null}

          <button className="button button--primary button--large" type="submit">
            <Save size={18} aria-hidden="true" />
            Сохранить
          </button>
        </form>
      </GlassCard>

      <GlassCard className="profile-data-card profile-backup-card">
        <h2>Резервная копия прогресса</h2>
        <p>Прогресс хранится только в этом браузере. Если очистить данные сайта или сменить телефон, он пропадёт. Сохраните файл и восстановите его на новом устройстве после входа.</p>
        <div className="game-actions">
          <button className="button button--primary" type="button" onClick={downloadBackup}>
            <Download size={18} aria-hidden="true" />
            Скачать копию
          </button>
          <button className="button button--soft" type="button" onClick={() => backupInputRef.current?.click()}>
            <Upload size={18} aria-hidden="true" />
            Восстановить из файла
          </button>
          <input ref={backupInputRef} type="file" accept="application/json,.json" hidden onChange={restoreBackup} />
        </div>
        {backupMessage ? <p className="success-note" role="status">{backupMessage}</p> : null}
      </GlassCard>
    </section>
  );
}
