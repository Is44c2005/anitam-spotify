import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { redirectToSpotifyAuth, isAuthenticated } from '../utils/spotify';
import styles from './Welcome.module.css';

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate('/home', { replace: true });
  }, [navigate]);

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
          {/* Polaroid */}
          <div className={`${styles.card} ${styles.card1}`}>
            <div className={styles.polaroidImg}>
              <div className={styles.polaroidSongName}>My One and Only Love</div>
              <div className={styles.polaroidSongArtist}>Mon Laferte</div>
            </div>
            <div className={styles.polaroidCaption}>♡ nuestra canción</div>
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
                <div className={styles.vinylCenter} />
              </div>
            </div>
            <div className={styles.vinylCaption}>side A ♡</div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.bottom}>
          <button className={styles.enterBtn} onClick={redirectToSpotifyAuth}>
            abrir mi espacio →
          </button>
          <div className={styles.footerText}>
            — el novio más guapo del mundo 🎀
          </div>
        </div>
      </div>
    </div>
  );
}
