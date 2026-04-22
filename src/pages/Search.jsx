import { useState, useRef, useCallback } from 'react';
import { searchTracks } from '../utils/api';
import { usePlayer } from '../hooks/usePlayer';
import styles from './Search.module.css';

const MOODS = [
  { label: 'Romántico', query: 'romántico amor', emoji: '♡', cls: 'm1' },
  { label: 'Pop suave',  query: 'pop suave',      emoji: '🌸', cls: 'm2' },
  { label: 'Trap',       query: 'trap rap',        emoji: '🔥', cls: 'm3' },
  { label: 'R&B',        query: 'r&b soul',        emoji: '♫', cls: 'm4' },
  { label: 'Latin',      query: 'latin pop',       emoji: '🌴', cls: 'm5' },
  { label: 'Indie',      query: 'indie alternativo',emoji: '🎸', cls: 'm6' },
];

function msToTime(ms) {
  if (!ms) return '–';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function Search() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState(null);
  const debounceRef             = useRef(null);

  const { play, togglePlay, currentTrack, isPlaying } = usePlayer();

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); setError(null); return; }
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const data = await searchTracks(q, 20);
      const items = data?.tracks?.items || [];
      setResults(items);
      if (items.length === 0 && data) setError(null);
    } catch (err) {
      setResults([]);
      setError(err?.message || 'Error al buscar. Intenta cerrar sesión y volver a entrar.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleMood = (mood) => {
    setQuery(mood.query);
    doSearch(mood.query);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setError(null);
  };

  const showMoods   = !searched && results.length === 0;
  const showEmpty   = searched && !loading && results.length === 0;
  const showResults = results.length > 0;

  return (
    <div className={styles.page}>
      {/* SEARCH HERO */}
      <div className={styles.searchHero}>
        <h1 className={styles.searchTitle}>Buscar <em>música</em></h1>
        <p className={styles.searchSub}>Encuentra cualquier canción, artista o álbum ♡</p>
        <div className={styles.searchBarWrap}>
          <span className={styles.searchIcon}>♪</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="¿Qué quieres escuchar hoy?"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className={styles.clearBtn} onClick={clearSearch}>×</button>
          )}
        </div>
      </div>

      {/* MOODS */}
      {showMoods && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Explorar por estado de ánimo</span>
          </div>
          <div className={styles.moodsGrid}>
            {MOODS.map((m) => (
              <div
                key={m.cls}
                className={`${styles.moodCard} ${styles[m.cls]}`}
                onClick={() => handleMood(m)}
              >
                <span className={styles.moodEmoji}>{m.emoji}</span>
                <div className={styles.moodName}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.loadingDots}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
          <span className={styles.loadingText}>Buscando en Spotify...</span>
        </div>
      )}

      {/* RESULTS */}
      {showResults && !loading && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Resultados para &ldquo;{query}&rdquo;</span>
            <span className={styles.sectionCount}>{results.length} canciones</span>
          </div>
          <div className={styles.resultsList}>
            {results.map((track, i) => {
              const isActive = currentTrack?.id === track.id;
              const coverUrl = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url;
              return (
                <div
                  key={track.id}
                  className={`${styles.resultRow} ${isActive ? styles.playing : ''}`}
                  onClick={() => isActive ? togglePlay() : play(track)}
                >
                  <div className={styles.resultNum}>
                    {isActive && isPlaying
                      ? <div className={styles.playIndicator}>
                          <div className={styles.piBar} />
                          <div className={styles.piBar} />
                          <div className={styles.piBar} />
                        </div>
                      : <span>{i + 1}</span>
                    }
                  </div>
                  {coverUrl
                    ? <img src={coverUrl} alt={track.name} className={styles.resultCover} />
                    : <div className={`${styles.resultCover} ${styles.resultCoverPlaceholder}`}>♪</div>
                  }
                  <div className={styles.resultInfo}>
                    <div className={`${styles.resultName} ${isActive ? styles.playingText : ''}`}>
                      {track.name}
                    </div>
                    <div className={styles.resultArtist}>
                      {track.artists?.map(a => a.name).join(', ')}
                    </div>
                  </div>
                  <div className={styles.resultAlbum}>{track.album?.name}</div>
                  <div className={styles.resultDuration}>{msToTime(track.duration_ms)}</div>
                  <button
                    className={styles.resultAdd}
                    onClick={(e) => e.stopPropagation()}
                    title="Agregar a playlist"
                  >+</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>!</div>
          <div className={styles.emptyTitle}>Error al buscar</div>
          <div className={styles.emptySub}>{error}</div>
        </div>
      )}

      {/* EMPTY */}
      {showEmpty && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>♪</div>
          <div className={styles.emptyTitle}>Sin resultados</div>
          <div className={styles.emptySub}>Intenta con otro nombre de canción o artista</div>
        </div>
      )}
    </div>
  );
}
