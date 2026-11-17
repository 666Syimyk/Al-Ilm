import {
  ArrowRight,
  BookOpen,
  BookText,
  Bookmark,
  Compass,
  GraduationCap,
  Languages,
  Moon,
  Search,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { getQuranTracking, getSelectedCharacter, getUser, setSelectedCharacter } from "../utils/storage.js";

const QUICK_ACCESS = [
  { icon: BookOpen, label: "Коран", desc: "Суры, аяты, аудио и закладки", path: "/quran", tone: "green" },
  { icon: Moon, label: "Намаз", desc: "Время, кибла и пошаговый гид", path: "/namaz", tone: "blue" },
  { icon: Star, label: "Таджвид", desc: "Правила красивого чтения", path: "/quran/tajweed", tone: "gold" },
  { icon: Compass, label: "Джузы", desc: "Навигация по 30 частям", path: "/quran/juz", tone: "teal" },
  { icon: GraduationCap, label: "Основы Ислама", desc: "Фарз, сунна, адаб и очищение", path: "/islamic-basics", tone: "sage" }
];

const STUDY_ACCESS = [
  { icon: Search, label: "Поиск", desc: "Найти суру, аят или слово", path: "/quran/search" },
  { icon: Bookmark, label: "Закладки", desc: "Сохранённые аяты и суры", path: "/quran/bookmarks" },
  { icon: BookOpen, label: "Чтение с подсказками", desc: "Аяты и подсветка правил таджвида", path: "/quran/reading" },
  { icon: Users, label: "Пророки", desc: "25 пророков: имена и истории", path: "/quran/prophets" },
  { icon: BookText, label: "Грамматика", desc: "Арабский язык по уровням", path: "/grammar" },
  { icon: Languages, label: "Словарь", desc: "Темы и карточки слов", path: "/vocabulary" },
  { icon: GraduationCap, label: "Уроки", desc: "Буквы, слоги, слова и чтение", path: "/lessons" }
];

export default function AdultSoonScreen() {
  const navigate = useNavigate();
  const user = getUser();
  const tracking = getQuranTracking();
  const firstName = user?.firstName || user?.name;

  function openPath(path) {
    if (!getSelectedCharacter()) setSelectedCharacter("ahmad");
    navigate(path);
  }

  return (
    <section className="content-stack adult-soon-screen">
      <Header
        className="adult-top-header"
        title={firstName ? `Ассаляму алейкум, ${firstName}` : "Ассаляму алейкум"}
        subtitle="Коран, намаз и арабский язык в одном спокойном пространстве"
      />

      <GlassCard className="adult-hero-card">
        <div className="adult-hero-card__copy">
          <span className="adult-hero-card__eyebrow">
            <Sparkles size={18} aria-hidden="true" />
            Продолжайте обучение
          </span>
          <h1>Выберите раздел и занимайтесь в удобном темпе</h1>
          <p>
            Здесь собраны основные материалы: чтение Корана, таджвид, намаз, заучивание, грамматика и словарь.
            Прогресс сохраняется на этом устройстве.
          </p>
          <div className="adult-hero-actions">
            <button className="button button--primary adult-primary-action" type="button" onClick={() => openPath("/quran")}>
              Открыть Коран
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button className="button button--soft adult-secondary-action" type="button" onClick={() => openPath("/namaz")}>
              Намаз
            </button>
          </div>
        </div>

        <div className="adult-stats-panel" aria-label="Прогресс">
          <span>
            <strong>{tracking.todayReadCount}</strong>
            <small>аятов сегодня</small>
          </span>
          <span>
            <strong>{tracking.streakDays}</strong>
            <small>дней подряд</small>
          </span>
          <span>
            <strong>{tracking.favoriteSurahs.length}</strong>
            <small>избранных сур</small>
          </span>
        </div>
      </GlassCard>

      <div className="adult-section-title">
        <h2>Главное</h2>
      </div>

      <div className="adult-quick-grid">
        {QUICK_ACCESS.map(({ icon: Icon, label, desc, path, tone }) => (
          <GlassCard as="button" key={path} className={`adult-quick-card adult-quick-card--${tone}`} type="button" onClick={() => openPath(path)}>
            <span className="adult-quick-card__icon">
              <Icon size={26} aria-hidden="true" />
            </span>
            <span className="adult-quick-card__text">
              <strong>{label}</strong>
              <small>{desc}</small>
            </span>
            <ArrowRight className="adult-quick-card__arrow" size={18} aria-hidden="true" />
          </GlassCard>
        ))}
      </div>

      <div className="adult-section-title">
        <h2>Учебные разделы</h2>
      </div>

      <div className="adult-coming-list adult-study-list">
        {STUDY_ACCESS.map(({ icon: Icon, label, desc, path }) => (
          <GlassCard as="button" key={path} className="adult-coming-card adult-study-card" type="button" onClick={() => openPath(path)}>
            <span className="adult-coming-card__icon">
              <Icon size={21} aria-hidden="true" />
            </span>
            <div>
              <strong>{label}</strong>
              <p>{desc}</p>
            </div>
            <ArrowRight size={18} aria-hidden="true" />
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
