import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { redirectToSpotifyAuth, isAuthenticated } from '../utils/spotify';
import styles from './Welcome.module.css';

export default function Welcome() {
  const particlesRef = useRef(null);
  const waveformRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate('/home', { replace: true });
  }, [navigate]);

  useEffect(() => {
    // Particles & hearts
    const container = particlesRef.current;
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = styles.particle;
      const size = Math.random() * 6 + 3;
      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}%;
        bottom: ${Math.random() * 20}%;
        animation-duration: ${Math.random() * 6 + 5}s;
        animation-delay: ${Math.random() * 6}s;
      `;
      container.appendChild(p);
    }

    for (let i = 0; i < 10; i++) {
      const h = document.createElement('div');
      h.className = styles.heartFloat;
      h.textContent = '♡';
      h.style.cssText = `
        left: ${Math.random() * 90 + 5}%;
        bottom: ${Math.random() * 15}%;
        animation-duration: ${Math.random() * 5 + 6}s;
        animation-delay: ${Math.random() * 8}s;
        font-size: ${Math.random() * 8 + 10}px;
      `;
      container.appendChild(h);
    }

    // Waveform bars
    const wv = waveformRef.current;
    if (!wv) return;
    const heights = [4,7,12,18,24,18,28,18,24,18,12,7,4,7,12,18,24,18,28,18,24,18,12,7,4];
    heights.forEach((height, i) => {
      const bar = document.createElement('div');
      bar.className = styles.wvBar;
      bar.style.cssText = `height: ${height}px; animation-delay: ${i * 0.06}s;`;
      wv.appendChild(bar);
    });

    return () => {
      container.innerHTML = '';
      if (wv) wv.innerHTML = '';
    };
  }, []);

  return (
    <div className={styles.root}>
      {/* Background circles */}
      <div className={`${styles.bgCircle} ${styles.bgCircle1}`} />
      <div className={`${styles.bgCircle} ${styles.bgCircle2}`} />
      <div className={`${styles.bgCircle} ${styles.bgCircle3}`} />

      {/* Floating particles & hearts */}
      <div className={styles.particlesContainer} ref={particlesRef} />

      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.logoBadge}>
          <div className={styles.logoDot} />
          <span>Tu espacio musical</span>
        </div>

        {/* Title */}
        <h1 className={styles.mainTitle}>
          Anitam<br />
          <em>Spotify</em>
        </h1>
        <p className={styles.subtitle}>Hecho con amor, solo para ti ♡</p>

        {/* Vinyl */}
        <div className={styles.vinylWrapper}>
          <div className={styles.vinyl} />
          <div className={styles.vinylCenter} />
          <div className={styles.vinylNeedle} />
        </div>

        {/* Our song tag */}
        <div className={styles.songTag}>
          <div className={styles.songTagCover}>♪</div>
          <div className={styles.songTagText}>
            <span className={styles.songTagName}>My One and Only Love</span>
            <span className={styles.songTagArtist}>Mon Laferte • Nuestra canción ♡</span>
          </div>
          <div className={styles.songBars}>
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
          </div>
        </div>

        {/* Waveform */}
        <div className={styles.waveform} ref={waveformRef} />

        {/* Enter button */}
        <button className={styles.enterBtn} onClick={redirectToSpotifyAuth}>
          Entrar a mi Spotify
          <span className={styles.btnArrow}>→</span>
        </button>
      </div>

      <p className={styles.footerText}>
        Desarrollado con amor por el novio más guapo del mundo 🎀
      </p>
    </div>
  );
}
