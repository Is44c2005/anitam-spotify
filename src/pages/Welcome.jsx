import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { redirectToSpotifyAuth, isAuthenticated } from '../utils/spotify';
import styles from './Welcome.module.css';

function Hearts() {
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
    size: 10 + Math.random() * 20,
    opacity: 0.15 + Math.random() * 0.3,
  }));

  return (
    <div className={styles.heartsContainer}>
      {hearts.map((h) => (
        <span
          key={h.id}
          className={styles.heart}
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
          }}
        >
          ♡
        </span>
      ))}
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate('/home', { replace: true });
  }, [navigate]);

  return (
    <div className={styles.container}>
      <Hearts />
      <div className={styles.content}>
        <div className={styles.logoWrapper}>
          <span className={styles.musicNote}>♪</span>
          <h1 className={styles.title}>Anitam Spotify</h1>
          <span className={styles.musicNote}>♪</span>
        </div>
        <p className={styles.subtitle}>
          Una versión especial de Spotify, hecha con todo mi amor para la persona más bonita del mundo 💕
        </p>
        <button className={styles.enterBtn} onClick={redirectToSpotifyAuth}>
          <span>Entrar</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <footer className={styles.footer}>
        Desarrollado con amor por el novio más guapo del mundo 🎀
      </footer>
    </div>
  );
}
