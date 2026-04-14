import { usePlayer } from '../hooks/usePlayer';
import styles from './Player.module.css';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function Player() {
  const { currentTrack, isPlaying, progress, duration, togglePlay, seek, previous, next } = usePlayer();

  if (!currentTrack) return null;

  const image = currentTrack.album?.images?.[2]?.url || currentTrack.album?.images?.[0]?.url;
  const artist = currentTrack.artists?.map((a) => a.name).join(', ');
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  function handleProgressClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    seek(percent * duration);
  }

  return (
    <div className={styles.player}>
      <div className={styles.progressBar} onClick={handleProgressClick}>
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      <div className={styles.content}>
        <div className={styles.trackInfo}>
          {image && <img src={image} alt="" className={styles.trackImg} />}
          <div className={styles.trackText}>
            <span className={styles.trackName}>{currentTrack.name}</span>
            <span className={styles.trackArtist}>{artist}</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button className={`${styles.controlBtn} ${styles.controlBtnSmall}`} onClick={previous} title="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button className={styles.controlBtn} onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Reproducir'}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button className={`${styles.controlBtn} ${styles.controlBtnSmall}`} onClick={next} title="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
            </svg>
          </button>
        </div>

        <div className={styles.time}>
          <span>{formatTime(progress)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
