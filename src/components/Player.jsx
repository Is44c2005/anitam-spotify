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
    seek((x / rect.width) * duration);
  }

  return (
    <div className={styles.player}>
      {/* Tape corners */}
      <div className={styles.tapeLeft} />
      <div className={styles.tapeRight} />

      {/* Dashed progress bar */}
      <div className={styles.progressBar} onClick={handleProgressClick}>
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        <div className={styles.progressKnob} style={{ left: `${progressPercent}%` }}>
          <div className={styles.progressKnobInner} />
        </div>
      </div>

      <div className={styles.content}>
        {/* Track info as polaroid */}
        <div className={styles.trackInfo}>
          <div className={styles.polaroid}>
            {image
              ? <img src={image} alt="" className={styles.trackImg} />
              : <div className={styles.trackImgFallback}>♪</div>}
          </div>
          <div
            className={styles.miniVinyl}
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          />
          <div className={styles.trackText}>
            <div className={styles.nowPlayingLabel}>♪ now playing</div>
            <span className={styles.trackName}>{currentTrack.name}</span>
            <span className={styles.trackArtist}>— {artist}</span>
          </div>
        </div>

        {/* Controls — stamped buttons */}
        <div className={styles.controls}>
          <button className={`${styles.controlBtn} ${styles.prevBtn}`} onClick={previous} title="Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button className={`${styles.controlBtn} ${styles.playBtn}`} onClick={togglePlay}>
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button className={`${styles.controlBtn} ${styles.nextBtn}`} onClick={next} title="Siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
            </svg>
          </button>
        </div>

        {/* Time as dashed ticket */}
        <div className={styles.right}>
          <div className={styles.timeTicket}>
            <span>{formatTime(progress)}</span>
            <span className={styles.timeSep}>/</span>
            <span className={styles.timeMuted}>{formatTime(duration)}</span>
          </div>
          <div className={styles.bars}>
            {[6, 14, 9, 14, 6].map((h, i) => (
              <div
                key={i}
                className={styles.bar}
                style={{
                  height: h,
                  animationDelay: `${i * 0.09}s`,
                  animationPlayState: isPlaying ? 'running' : 'paused',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
