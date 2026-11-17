import { Bookmark } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { getAyahByNumber, getSurahById, quranTextSource, translationSource } from "../data/quranContent.js";
import { getQuranState, toggleBookmarkedAyah } from "../utils/storage.js";

export default function BookmarksScreen() {
  const navigate = useNavigate();
  const [bookmarkIds, setBookmarkIds] = useState(() => getQuranState().bookmarkedAyahs);
  const bookmarks = useMemo(() => bookmarkIds
    .map((bookmarkId) => {
      const [surahId, ayahNumber] = bookmarkId.split(":");
      const surah = getSurahById(surahId);
      const ayah = getAyahByNumber(surahId, ayahNumber);
      return ayah ? { id: bookmarkId, surah, ayah } : null;
    })
    .filter(Boolean), [bookmarkIds]);

  function removeBookmark(id) {
    const next = toggleBookmarkedAyah(id);
    setBookmarkIds(next);
  }

  return (
    <section className="content-stack quran-inner-screen quran-bookmarks-screen">
      <Header title="Закладки" subtitle="Сохранённые суры и аяты" compact />
      <p className="content-source-note">{translationSource.note} <a href={quranTextSource.url} target="_blank" rel="noreferrer">Источник арабского текста</a></p>

      {bookmarks.length ? (
        <div className="bookmark-list">
          {bookmarks.map(({ id, surah, ayah }) => (
            <GlassCard className="bookmark-card" key={id}>
              <button className="bookmark-card__body" type="button" onClick={() => navigate(`/quran/surah/${surah.id}?ayah=${ayah.number}`)}>
                <strong>{surah.title}, аят {ayah.number}</strong>
                <p className="arabic-line">{ayah.arabic}</p>
                {ayah.translation && <small>{ayah.translation}</small>}
              </button>
              <button className="icon-button" type="button" onClick={() => removeBookmark(id)} aria-label="Убрать закладку">
                <Bookmark size={18} aria-hidden="true" />
              </button>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="quran-warning-card">
          <h2>Пока нет закладок</h2>
          <p>Открой аят и сохрани его, чтобы вернуться к нему позже.</p>
        </GlassCard>
      )}
    </section>
  );
}
