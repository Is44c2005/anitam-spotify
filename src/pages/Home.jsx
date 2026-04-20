import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, searchArtistTrack } from '../utils/api';
import { usePlayer } from '../hooks/usePlayer';
import styles from './Home.module.css';

const START_DATE = new Date('2025-11-24');

function getMonthsAndDays() {
  const now = new Date();
  let months =
    (now.getFullYear() - START_DATE.getFullYear()) * 12 +
    (now.getMonth() - START_DATE.getMonth());
  if (now.getDate() < START_DATE.getDate()) months--;
  const days = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24));
  return { months, days };
}

const SONG_DEFS = [
  { key: 'ourSong',       artist: 'Mon Laferte',   title: 'My One and Only Love' },
  { key: 'somosDos',      artist: 'Bomba Estereo',  title: 'Somos Dos'            },
  { key: 'flyLove',       artist: 'Jamie Foxx',     title: 'Fly Love'             },
  { key: 'circusMaximus', artist: 'Travis Scott',   title: 'Circus Maximus'       },
];

export default function Home() {
  const [user, setUser]         = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [spotifyTracks, setSpotifyTracks] = useState({});
  const { months, days } = getMonthsAndDays();
  const navigate = useNavigate();
  const { play, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {});

    Promise.allSettled(
      SONG_DEFS.map(({ artist, title }) => searchArtistTrack(artist, title))
    ).then((results) => {
      const found = {};
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          found[SONG_DEFS[i].key] = result.value?.tracks?.items?.[0] ?? null;
        }
      });
      setSpotifyTracks(found);
    });
  }, []);

  const displayName = user?.display_name || 'Anitam';
  const avatarUrl   = user?.images?.[0]?.url || null;
  const initials    = displayName.slice(0, 2).toUpperCase();

  const ourSong        = spotifyTracks.ourSong;
  const ourSongPlaying = isPlaying && currentTrack?.id === ourSong?.id;

  function handlePlay(track) {
    if (track) play(track);
  }

  return (
    <div className={styles.home}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>Anitam Spotify</div>
        <div className={styles.navLinks}>
          <span className={`${styles.navLink} ${styles.active}`} onClick={() => navigate('/home')}>Inicio</span>
          <span className={styles.navLink} onClick={() => navigate('/search')}>Buscar</span>
          <span className={styles.navLink} onClick={() => navigate('/playlists')}>Playlists</span>
        </div>
        <div className={styles.navProfile}>
          {avatarUrl
            ? <img src={avatarUrl} alt={displayName} className={styles.avatarImg} />
            : <div className={styles.avatar}>{initials}</div>
          }
          <span className={styles.navName}>{displayName}</span>
        </div>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroBg2} />
        <p className={styles.greeting}>Bienvenida de vuelta</p>
        <h1 className={styles.heroTitle}>
          Hola, <em>{displayName.split(' ')[0]}</em> ♡
        </h1>

        <div className={styles.counterCard} onClick={() => setShowSecret(true)}>
          <div className={styles.counterHeart}>♡</div>
          <div className={styles.counterInfo}>
            <div className={styles.counterNum}>{months}</div>
            <div className={styles.counterLabel}>meses juntos ♡</div>
            <div className={styles.counterDetail}>{days} días y contando</div>
          </div>
        </div>
      </div>

      {/* NUESTRA CANCIÓN */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Nuestra canción ♡</span>
          <span className={styles.sectionSub}>siempre en repeat</span>
        </div>
        <div
          className={styles.ourSong}
          onClick={() => handlePlay(ourSong)}
          style={{ cursor: ourSong ? 'pointer' : 'default' }}
        >
          <div className={styles.ourSongGlow} />
          <div
            className={styles.ourSongVinyl}
            style={{ animationDuration: ourSongPlaying ? '1.2s' : '5s' }}
          >
            <div className={styles.ourSongVinylCenter} />
          </div>
          <div className={styles.ourSongInfo}>
            <div className={styles.ourSongBadge}>♡ LA nuestra</div>
            <div className={styles.ourSongName}>My One and Only Love</div>
            <div className={styles.ourSongArtist}>Mon Laferte</div>
          </div>
          <div className={styles.ourSongBars}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.sbar} />
            ))}
          </div>
        </div>
      </div>

      {/* NUESTRAS CANCIONES */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Nuestras canciones</span>
          <span className={styles.sectionSub}>solo las nuestras</span>
        </div>
        <div className={styles.songsGrid}>
          {[
            { key: 'ourSong',  label: 'nuestra ♡',   fallbackColor: styles.sc1, fallbackEmoji: '♪' },
            { key: 'somosDos', label: 'nos recuerda', fallbackColor: styles.sc2, fallbackEmoji: '♪' },
            { key: 'flyLove',  label: 'la pienso en ti', fallbackColor: styles.sc3, fallbackEmoji: '♪' },
          ].map(({ key, label, fallbackColor, fallbackEmoji }) => {
            const track   = spotifyTracks[key];
            const coverUrl = track?.album?.images?.[0]?.url;
            const name     = track?.name     || (key === 'ourSong' ? 'My One and Only Love' : key === 'somosDos' ? 'Somos Dos' : 'Fly Love');
            const artist   = track?.artists?.[0]?.name || (key === 'ourSong' ? 'Mon Laferte' : key === 'somosDos' ? 'Bomba Estéreo' : 'Jamie Foxx');
            const active   = isPlaying && currentTrack?.id === track?.id;

            return (
              <div
                key={key}
                className={`${styles.songCard} ${active ? styles.songCardActive : ''}`}
                onClick={() => handlePlay(track)}
                style={{ cursor: track ? 'pointer' : 'default' }}
              >
                {coverUrl
                  ? <img src={coverUrl} alt={name} className={styles.songCardImg} />
                  : <div className={`${styles.songCardCover} ${fallbackColor}`}>{fallbackEmoji}</div>
                }
                <div className={styles.songCardName}>{name}</div>
                <div className={styles.songCardArtist}>{artist}</div>
                <div className={styles.songCardPill}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ARTISTA FAVORITO */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Tu artista favorito</span>
          <span className={styles.sectionSub}>porque sé que te encanta</span>
        </div>
        <div className={styles.artistCard}>
          <div className={styles.artistShimmer} />
          <div className={styles.artistAvatar}>KR</div>
          <div className={styles.artistInfo}>
            <div className={styles.artistBadge}>♡ tu favorito</div>
            <div className={styles.artistName}>Kris.R</div>
            <div className={styles.artistSub}>R&amp;B · Soul · Alternativo</div>
            <div className={styles.artistNote}>"porque sé que te encanta" — tu novio</div>
            <div className={styles.artistDots}>
              <div className={`${styles.dot} ${styles.active}`} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </div>
          </div>
        </div>
      </div>

      {/* CANCIÓN DEL MES */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Lo que escuchas este mes</span>
          <span className={styles.sectionSub}>en repeat ahora mismo</span>
        </div>
        {(() => {
          const track    = spotifyTracks.circusMaximus;
          const coverUrl = track?.album?.images?.[0]?.url;
          const active   = isPlaying && currentTrack?.id === track?.id;
          return (
            <div
              className={`${styles.monthCard} ${active ? styles.monthCardActive : ''}`}
              onClick={() => handlePlay(track)}
              style={{ cursor: track ? 'pointer' : 'default' }}
            >
              {coverUrl
                ? <img src={coverUrl} alt="Circus Maximus" className={styles.monthCoverImg} />
                : <div className={styles.monthCover}>🌙</div>
              }
              <div className={styles.monthInfo}>
                <div className={styles.monthBadge}>🔥 del mes</div>
                <div className={styles.monthName}>Circus Maximus</div>
                <div className={styles.monthArtist}>Travis Scott</div>
              </div>
              <div className={styles.monthWave}>
                {[8, 18, 12, 18].map((h, i) => (
                  <div
                    key={i}
                    className={styles.mbar}
                    style={{ height: h, animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* FOOTER */}
      <p className={styles.footerText}>
        Desarrollado con amor por el novio más guapo del mundo 🎀
      </p>

      {/* MODAL SECRETO */}
      {showSecret && (
        <div className={styles.secretOverlay} onClick={() => setShowSecret(false)}>
          <div className={styles.secretModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.secretEmoji}>♡</div>
            <div className={styles.secretTitle}>Llevamos {months} meses</div>
            <div className={styles.secretMsg}>
              Cada día contigo es mi canción favorita. Gracias por hacer que todo
              suene mejor, Anitam. Te amo un montón. 🎀
            </div>
            <button className={styles.secretClose} onClick={() => setShowSecret(false)}>
              Cerrar ♡
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
