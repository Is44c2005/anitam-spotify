import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylist, getAllPlaylistTracks, removeTracksFromPlaylist, SpotifyApiError } from '../utils/api';
import { usePlayer } from '../hooks/usePlayer';
import styles from './PlaylistDetail.module.css';

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);
  const { play, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  async function loadPlaylist() {
    setLoading(true);
    setRestricted(false);
    try {
      const data = await getPlaylist(id);
      setPlaylist(data);
    } catch (err) {
      console.error('Error loading playlist metadata:', err);
    }

    try {
      const items = await getAllPlaylistTracks(id);
      setTracks(items);
      if (items.length === 0) {
        try {
          const probe = await getPlaylist(id);
          if ((probe?.tracks?.total || 0) > 0) setRestricted(true);
        } catch { /* ignore */ }
      }
    } catch (err) {
      if (err instanceof SpotifyApiError && err.status === 403) {
        setRestricted(true);
      } else {
        console.error('Error loading playlist tracks:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveTrack(trackUri) {
    try {
      await removeTracksFromPlaylist(id, [trackUri]);
      setTracks((prev) => prev.filter((item) => item.track?.uri !== trackUri));
    } catch (err) {
      console.error('Error removing track:', err);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className={styles.loading}>
        <p>Playlist no encontrada</p>
      </div>
    );
  }

  const image = playlist.images?.[0]?.url;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/playlists')}>
        ← Volver
      </button>

      <div className={styles.hero}>
        <div className={styles.heroImage}>
          {image ? (
            <img src={image} alt={playlist.name} />
          ) : (
            <div className={styles.heroPlaceholder}>🎵</div>
          )}
        </div>
        <div className={styles.heroInfo}>
          <span className={styles.heroLabel}>PLAYLIST</span>
          <h1 className={styles.heroTitle}>{playlist.name}</h1>
          {playlist.description && (
            <p className={styles.heroDesc}>{playlist.description}</p>
          )}
          <p className={styles.heroMeta}>
            {playlist.owner?.display_name} · {tracks.length} canciones
          </p>
        </div>
      </div>

      <div className={styles.trackList}>
        {tracks.map((item, i) => {
          const track = item.track;
          if (!track) return null;

          const img = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;
          const artist = track.artists?.map((a) => a.name).join(', ');
          const isCurrent = currentTrack?.id === track.id && isPlaying;

          return (
            <div
              key={`${track.id}-${i}`}
              className={`${styles.trackItem} ${isCurrent ? styles.active : ''}`}
            >
              <div className={styles.trackMain} onClick={() => play(track, { contextUri: playlist.uri })}>
                <span className={styles.trackNum}>{i + 1}</span>
                {img && <img src={img} alt="" className={styles.trackImg} />}
                <div className={styles.trackInfo}>
                  <span className={styles.trackName}>{track.name}</span>
                  <span className={styles.trackArtist}>{artist}</span>
                </div>
              </div>
              <div className={styles.trackActions}>
                <span className={styles.trackDuration}>{formatDuration(track.duration_ms)}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemoveTrack(track.uri)}
                  title="Quitar de playlist"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tracks.length === 0 && (
        <div className={styles.emptyState}>
          {restricted ? (
            <>
              <p>No puedo mostrar las canciones de esta playlist 😢</p>
              <p className={styles.emptyHint}>
                Spotify restringe el acceso a playlists creadas por ellos (Descubrimiento
                semanal, Radar de novedades, etc.). Prueba con una playlist tuya.
              </p>
            </>
          ) : (
            <>
              <p>Esta playlist está vacía</p>
              <p className={styles.emptyHint}>¡Busca canciones para agregar!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
