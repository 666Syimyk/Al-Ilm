import { ArrowLeft, BookOpen, ExternalLink, Info, Mic, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { quranTextSource, translationSource } from "../data/quranContent.js";
import { recordedAudioSource, recordedAyahAudio } from "../data/recordedAudioManifest.js";
import { goBack } from "../utils/navigation.js";

const SOURCES = [
  {
    icon: BookOpen,
    title: "Арабский текст Корана",
    source: quranTextSource.name,
    url: "https://tanzil.net/",
    detail: "Все 6236 аятов взяты без изменения символов из официального файла Tanzil. Проверяется точное совпадение с сохранённым файлом издателя. Это проверка копирования, а не самостоятельное религиозное заключение.",
    status: "verified",
    statusLabel: "Из файла издателя"
  },
  {
    icon: BookOpen,
    title: "Перевод смыслов (русский)",
    source: translationSource.name,
    url: null,
    detail: translationSource.note,
    status: "disabled",
    statusLabel: "Не показан"
  },
  {
    icon: Mic,
    title: "Аудио рецитация",
    source: "EveryAyah CDN — Мишари Рашид Аль-Афаси",
    url: recordedAudioSource.sourcePage,
    detail: `${Object.keys(recordedAyahAudio).length} записей скачаны для семи коротких сур и аятов 17:24, 20:114. Файлы совпадают с контрольными суммами EveryAyah. Остальные аяты доступны из CDN. Отдельное разрешение на распространение записей не установлено.`,
    status: "verified",
    statusLabel: "Записи скачаны"
  },
  {
    icon: BookOpen,
    title: "Пословный разбор (слово-за-словом)",
    source: "Отключён до верификации",
    url: null,
    detail: "Непроверенные пословные значения и транслитерация не выводятся. Разбор появится после установления источника и проверки соответствия.",
    status: "disabled",
    statusLabel: "Отключён"
  },
  {
    icon: ShieldCheck,
    title: "Правила таджвида",
    source: "Учебный справочник",
    url: null,
    detail: "Упрощённые подсказки для начинающих. Не являются заменой занятий с квалифицированным учителем таджвида (кари).",
    status: "needsReview",
    statusLabel: "Учебный материал"
  },
  {
    icon: BookOpen,
    title: "Основы Ислама и учебные вопросы",
    source: "Dar al-Ifta Egypt — The 5 Pillars of Islam",
    url: "https://www.dar-alifta.org/en/article/details/65/the-5-pillars-of-islam",
    detail: "Шесть вопросов о столпах Ислама сверены с этой публикацией. Для остальных тем неподтверждённые автоматические тесты убраны; учебные пояснения требуют редакционной проверки.",
    status: "needsReview",
    statusLabel: "Указан источник вопросов"
  },
  {
    icon: BookOpen,
    title: "Фарз, важиб и другие понятия",
    source: "Dar al-Ifta Egypt — Shariah Law",
    url: "https://www.dar-alifta.org/en/article/details/111/shariah-law",
    detail: "Краткий пересказ словаря терминов. Непроверенные примеры конкретных действий удалены. Это не фетва и не полный курс по правовой школе.",
    status: "needsReview",
    statusLabel: "Учебный словарь"
  },
  {
    icon: BookOpen,
    title: "99 имён Аллаха",
    source: "Учебная подборка; построчная проверка не завершена",
    url: null,
    detail: "99 карточек с краткими значениями. Наличие 99 записей не подтверждает источник каждого имени и толкования; редакционная проверка требуется.",
    status: "needsReview",
    statusLabel: "Требует проверки"
  },
  {
    icon: BookOpen,
    title: "Истории пророков",
    source: "Краткие учебные пересказы со ссылками на аяты",
    url: null,
    detail: "Краткие учебные изложения на основе аятов Корана. Ссылки на аяты указаны. Не являются тафсиром и не заменяют религиозное образование.",
    status: "needsReview",
    statusLabel: "Краткое изложение"
  },
  {
    icon: BookOpen,
    title: "Тексты намаза",
    source: "Коран и указанные в учебнике ссылки на хадисы",
    url: null,
    detail: "Коранические аяты используют файл Tanzil. Для остальных текстов, переводов и транслитерации нужна отдельная проверка; наличие ссылки само по себе не означает, что текст проверен.",
    status: "needsReview",
    statusLabel: "Требует проверки"
  }
];

const STATUS_COLORS = {
  verified: "var(--green)",
  needsReview: "var(--gold)",
  disabled: "var(--text-muted)"
};

export default function SourcesScreen() {
  const navigate = useNavigate();

  return (
    <section className="content-stack">
      <Header
        title="Источники данных"
        subtitle="Откуда берётся контент в Al-Ilm"
        compact
      >
        <button className="button button--ghost" type="button" onClick={() => goBack(navigate, "/")} aria-label="Назад">
          <ArrowLeft size={18} aria-hidden="true" />
          Назад
        </button>
      </Header>

      <GlassCard className="sources-disclaimer-card">
        <Info size={20} color="var(--gold)" aria-hidden="true" />
        <p className="sources-disclaimer-text">
          Религиозный контент требует финальной проверки знающим специалистом (имамом, кари, исламским учёным) перед публичным выпуском приложения. Этот экран показывает текущий статус каждого источника.
        </p>
      </GlassCard>

      {SOURCES.map((item) => {
        const Icon = item.icon;
        return (
          <GlassCard key={item.title} className="sources-item-card">
            <div className="sources-item-header">
              <Icon size={18} color="var(--text-deep)" aria-hidden="true" />
              <h3 className="sources-item-title">{item.title}</h3>
              <span
                className="sources-item-badge"
                style={{ color: STATUS_COLORS[item.status] }}
              >
                {item.statusLabel}
              </span>
            </div>
            <p className="sources-item-source">{item.source}</p>
            <p className="sources-item-detail">{item.detail}</p>
            {item.url && (
              <a
                className="sources-item-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={13} aria-hidden="true" />
                {item.url}
              </a>
            )}
          </GlassCard>
        );
      })}

      <GlassCard className="sources-footer-card">
        <p className="content-source-note">
          Арабский текст: Tanzil Project, Uthmani 1.1. Аудио: EveryAyah / Alafasy.
          Русский перевод аятов и пословный разбор временно не показаны.
        </p>
        <a href={quranTextSource.licenseUrl} target="_blank" rel="noopener noreferrer">Условия использования текста Tanzil</a>
        <details>
          <summary>Уведомление издателя и дата загрузки</summary>
          <p>{quranTextSource.downloadedAt.slice(0, 10)}</p>
          <p className="content-source-note" style={{ whiteSpace: "pre-wrap" }}>{quranTextSource.copyrightNotice}</p>
        </details>
      </GlassCard>
    </section>
  );
}
