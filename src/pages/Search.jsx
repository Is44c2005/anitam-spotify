import { useState, useCallback } from 'react';
import { searchTracks } from '../utils/api';
import { usePlayer } from '../hooks/usePlayer';
import styles from './Search.module.css';

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { play, currentTrack, isPlaying } = usePlayer();

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchTracks(query);
      setResults(data?.tracks?.items || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Buscar 🔍</h1>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className={styles.input}
            placeholder="¿Qué quieres escuchar, amor?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className={styles.emptyState}>
          <p>No encontré resultados 😢</p>
          <p className={styles.emptyHint}>Intenta con otro nombre</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className={styles.results}>
          {results.map((track) => {
            const image = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;
            const artist = track.artists?.map((a) => a.name).join(', ');
            const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                className={`${styles.trackItem} ${isCurrentlyPlaying ? styles.active : ''}`}
                onClick={() => play(track)}
              >
                <div className={styles.trackLeft}>
                  <div className={styles.trackImgWrapper}>
                    {image && <img src={image} alt="" className={styles.trackImg} />}
                    {track.preview_url && (
                      <div className={styles.playOverlay}>
                        <span>{isCurrentlyPlaying ? '⏸' : '▶'}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.trackInfo}>
                    <span className={styles.trackName}>{track.name}</span>
                    <span className={styles.trackArtist}>{artist}</span>
                  </div>
                </div>
                <div className={styles.trackRight}>
                  <span className={styles.trackAlbum}>{track.album?.name}</span>
                  <span className={styles.trackDuration}>{formatDuration(track.duration_ms)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!searched && (
        <div className={styles.emptyState}>
          <span className={styles.emptyEmoji}>🎵</span>
          <p>Busca tus canciones favoritas</p>
        </div>
      )}
    </div>
  );
}
