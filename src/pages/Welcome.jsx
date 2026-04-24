import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { redirectToSpotifyAuth, isAuthenticated } from '../utils/spotify';
import styles from './Welcome.module.css';

const DURATION = 222; // 3:42 in seconds

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function FakePlayer() {
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const tickRef = useRef(null);

  useEffect(() => {
    if (playing) {
      tickRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= DURATION) { setPlaying(false); return 0; }
          return s + 1;
        });
      }, 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [playing]);

  const pct = Math.min((seconds / DURATION) * 100, 100);

  return (
    <>
      <div className={styles.fpCover}>
        <span className={styles.fpCoverHeart}>♡</span>
        <p className={styles.fpCoverPhrase}>
          Tú eres mi one and only love y tú eres lo que siempre yo soñé
        </p>
      </div>

      <div className={styles.fpBadge}>♡ nuestra canción</div>
      <div className={styles.fpTitle}>My One and Only Love</div>
      <div className={styles.fpArtist}>
        Mon Laferte
        {playing && (
          <span className={styles.fpBars}>
            {[0, 0.1, 0.2, 0.3].map((d, i) => (
              <span key={i} className={styles.fpBar} style={{ animationDelay: `${d}s` }} />
            ))}
          </span>
        )}
      </div>

      <div className={styles.fpProgressTrack}>
        <div className={styles.fpProgressFill} style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.fpControls}>
        <span className={styles.fpTime}>{fmt(seconds)}</span>
        <button
          className={`${styles.fpPlayBtn} ${playing ? styles.fpPlayBtnActive : ''}`}
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <span className={styles.fpTime}>3:42</span>
      </div>
    </>
  );
}

export default function Welcome() {
  if (isAuthenticated()) return <Navigate to="/home" replace />;

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        {/* Stamp title */}
        <div className={styles.titleBlock}>
          <div className={styles.tagline}>— para ti, con amor —</div>
          <h1 className={styles.mainTitle}>
            Anitam<br />
            <span className={styles.titleAccent}>Spotify ♡</span>
          </h1>
          <div className={styles.stamp}>EDICIÓN ÚNICA · N°001</div>
        </div>

        {/* Scrapbook grid */}
        <div className={styles.grid}>
          {/* Player card */}
          <div className={`${styles.card} ${styles.card1}`}>
            <FakePlayer />
          </div>

          {/* Ticket */}
          <div className={`${styles.card} ${styles.card2}`}>
            <div className={styles.ticketTop}>Admit one ♡</div>
            <div className={styles.ticketTitle}>
              tu espacio<br />musical<br />personal
            </div>
            <div className={styles.ticketDivider} />
            <div className={styles.ticketBottom}>VOL. 01 · NOV 2025</div>
          </div>

          {/* Vinyl polaroid */}
          <div className={`${styles.card} ${styles.card3}`}>
            <div className={styles.vinylWrapper}>
              <div className={styles.vinyl}>
                <div className={styles.vinylShine} />
                <div className={styles.vinylCenter}>A ♡</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.bottom}>
          <button className={styles.enterBtn} onClick={redirectToSpotifyAuth}>
            abrir mi espacio →
          </button>
          <div className={styles.footerText}>
            — Desarrollado por el novio más guapo del mundo 🎀
          </div>
        </div>
      </div>
    </div>
  );
}
