import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, getArtist } from '../utils/api';
import { getValidToken } from '../utils/spotify';
import { usePlayer } from '../hooks/usePlayer';
import styles from './Home.module.css';

function useCountUp(target, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return ref;
}

const START_DATE = new Date('2025-11-22');

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
  { key: 'ourSong',       artist: 'Mon Laferte',  title: 'My One and Only Love' },
  { key: 'sundayMorning', artist: 'Maroon 5',     title: 'Sunday Morning',      album: 'Songs About Jane' },
  { key: 'somosDos',      artist: 'Bomba Estereo', title: 'Somos Dos'            },
  { key: 'flyLove',       artist: 'Jamie Foxx',    title: 'Fly Love'             },
  { key: 'circusMaximus', artist: 'Travis Scott',  title: 'Circus Maximus'       },
  { key: 'conLosDosCabeza', artist: 'Pedro Guerra', title: 'Con los Dos en la Cabeza' },
];

const SONG_TRACK_IDS = [
  '1EWqyMpJYaUZEUHgqSwBBL',
  '0K8TnWM6ym1HwFE0pVmm7e',
  '7GjR3GujmHUe1RXYr0J49o',
  '0cAqpEGGRBbXfTpQv1LiRd',
  '1YC6fYVa74luzF0GcMkv7w',
  '2PdMSFHq2YHBZ3aVUDMCzL',
];

const TIMELINE_ITEMS = [
  { month: 0, label: 'te conocí ♡' },
  { month: 1, label: 'primera playlist juntos' },
  { month: 3, label: 'nos vimos por primera vez' },
  { month: 5, label: 'y hoy te has vuelto mi mundo ♡' },
];

export default function Home() {
  const [user, setUser]             = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [spotifyTracks, setSpotifyTracks] = useState({});
  const [spotifyArtist, setSpotifyArtist] = useState(null);
  const { months, days } = getMonthsAndDays();
  const { play, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {});

    const fetchTracks = async () => {
      try {
        const token = await getValidToken();
        if (!token) return;

        const ids = SONG_TRACK_IDS.join(',');
        const response = await fetch(
          `https://api.spotify.com/v1/tracks?ids=${ids}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) return;

        const data = await response.json();
        const tracks = data.tracks || [];

        const found = {};
        SONG_DEFS.forEach((song, i) => {
          found[song.key] = tracks[i] ?? null;
        });
        setSpotifyTracks(found);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    fetchTracks();
    getArtist('3i6lAgVHplDXb6zrjIeBeK').then(setSpotifyArtist).catch(() => {});
  }, []);

  const monthsAnim = useCountUp(months, 1400);
  const daysAnim   = useCountUp(days, 1600);
  const ourSongRef  = useReveal();
  const timelineRef = useReveal();
  const songsRef    = useReveal();
  const artistRef   = useReveal();
  const monthRef    = useReveal();

  const displayName    = user?.display_name || 'Anitam';
  const avatarUrl      = user?.images?.[0]?.url || null;
  const initials       = displayName.slice(0, 2).toUpperCase();
  const firstName      = displayName.split(' ')[0];
  const ourSong        = spotifyTracks.ourSong;
  const ourSongPlaying = isPlaying && currentTrack?.id === ourSong?.id;
  const maxMonth       = Math.max(months, 5);

  function handlePlay(track) {
    if (track) play(track);
  }

  return (
    <div className={styles.home}>
      <div className={styles.container}>
        {/* HERO */}
        <div className={styles.hero}>
          <div className={styles.heartField} aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={styles.heartFloat} style={{
                left: `${(i * 13.7) % 95}%`,
                fontSize: 14 + (i % 3) * 6,
                animationDuration: `${9 + (i % 4) * 2}s`,
                animationDelay: `${i * 0.7}s`,
              }}>♡</span>
            ))}
          </div>
          <div className={styles.helloTag}>hola mi amor,</div>
          <h1 className={styles.heroTitle}>
            {firstName}<span className={styles.heroAccent}>♡</span>
          </h1>
          <div className={styles.heroRow}>
            <div className={styles.counterCard} onClick={() => setShowSecret(true)}>
              <span className={styles.twinkle} style={{ top: -8, right: 10, animationDelay: '.2s' }}>✦</span>
              <span className={styles.twinkle} style={{ bottom: -6, left: 14, animationDelay: '1.1s' }}>✦</span>
              <div className={styles.counterHeart}>♡</div>
              <div className={styles.counterInfo}>
                <div className={styles.counterMono}>llevamos</div>
                <div className={styles.counterNum}>{monthsAnim} meses</div>
                <div className={styles.counterSub}>{daysAnim} días ♡ click aquí</div>
              </div>
            </div>
            <div className={styles.heroQuote}>
              "y aún siento mariposas cuando te veo" →
            </div>
          </div>
        </div>

        {/* NUESTRA CANCIÓN */}
        <section ref={ourSongRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>Nuestra canción</div>
          <div className={styles.sectionSub}>— siempre en repeat ♡</div>
          <div
            className={styles.ourSong}
            onClick={() => handlePlay(ourSong)}
            style={{ cursor: ourSong ? 'pointer' : 'default' }}
          >
            <div className={styles.ourSongVinyl} style={{ animationDuration: ourSongPlaying ? '1.5s' : '5s' }}>
              <div className={styles.ourSongVinylCenter} />
            </div>
            <div className={styles.ourSongInfo}>
              <div className={styles.ourSongBadge}>♡ LA nuestra</div>
              <div className={styles.ourSongName}>My One and Only Love</div>
              <div className={styles.ourSongArtist}>Mon Laferte</div>
            </div>
            <div className={styles.ourSongBars}>
              {[8, 18, 11, 18, 6].map((h, i) => (
                <div key={i} className={styles.sbar} style={{ height: h, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section ref={timelineRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>Meses juntos</div>
          <div className={styles.sectionSub}>— {months} meses · {days} días</div>
          <div className={styles.timelineWrap}>
            <div className={styles.timelineTrack}>
              <div className={styles.timelineFill} style={{ width: `${Math.min((months / maxMonth) * 100, 100)}%` }} />
              {TIMELINE_ITEMS.map((item, i) => {
                const pos     = Math.min((item.month / maxMonth) * 100, 100);
                const reached = item.month <= months;
                return (
                  <div key={i} className={styles.timelineDot} style={{ left: `${pos}%` }}>
                    <div className={styles.timelineLabel} style={{ color: reached ? 'var(--accent-dark)' : 'var(--text-secondary)' }}>
                      {item.month === months ? 'hoy' : `mes ${item.month}`}
                    </div>
                    <div className={`${styles.timelinePip} ${reached ? styles.timelinePipReached : ''}`} />
                    <div className={styles.timelineText} style={{ color: reached ? 'var(--ink)' : 'var(--text-secondary)' }}>
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* NUESTRAS CANCIONES */}
        <section ref={songsRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>Nuestras canciones</div>
          <div className={styles.sectionSub}>— solo las nuestras</div>
          <div className={styles.songsGrid}>
            {[
              { key: 'sundayMorning', label: 'nuestra ♡',      rot: -2,   fallbackName: 'Sunday Morning',  fallbackArtist: 'Maroon 5'      },
              { key: 'somosDos',      label: 'nos recuerda',    rot:  1.5, fallbackName: 'Somos Dos',       fallbackArtist: 'Bomba Estéreo' },
              { key: 'flyLove',       label: 'la pienso en ti', rot: -1.5, fallbackName: 'Fly Love',        fallbackArtist: 'Jamie Foxx'    },
            ].map(({ key, label, rot, fallbackName, fallbackArtist }) => {
              const track    = spotifyTracks[key];
              const coverUrl = track?.album?.images?.[0]?.url;
              const name     = track?.name              || fallbackName;
              const artist   = track?.artists?.[0]?.name || fallbackArtist;
              const active   = isPlaying && currentTrack?.id === track?.id;
              return (
                <div
                  key={key}
                  className={`${styles.songCard} ${active ? styles.songCardActive : ''}`}
                  style={{ transform: `rotate(${rot}deg)`, cursor: track ? 'pointer' : 'default' }}
                  onClick={() => handlePlay(track)}
                >
                  {coverUrl
                    ? <img src={coverUrl} alt={name} className={styles.songCardImg} />
                    : <div className={styles.songCardCover}>♪</div>
                  }
                  <div className={styles.songCardPill}>{label}</div>
                  <div className={styles.songCardName}>{name}</div>
                  <div className={styles.songCardArtist}>{artist}</div>
                </div>
              );
            })}
          </div>
          <div className={styles.viewAllWrap}>
            <Link to="/our-songs" className={styles.viewAllBtn}>ver todas ♡ →</Link>
          </div>
        </section>

        {/* ARTISTA FAVORITO */}
        <section ref={artistRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>Tu favorito</div>
          <div className={styles.sectionSub}>— Tu artista más escuchado</div>
          <div className={styles.artistCard}>
            <div className={styles.artistGlow} />
            {spotifyArtist?.images?.[0]?.url
              ? <img src={spotifyArtist.images[0].url} alt={spotifyArtist.name} className={styles.artistAvatar} style={{ objectFit: 'cover' }} />
              : <div className={styles.artistAvatar}>KR</div>
            }
            <div className={styles.artistInfo}>
              <div className={styles.artistBadge}>♡ tu favorito</div>
              <div className={styles.artistName}>{spotifyArtist?.name || 'Kris.R'}</div>
              <div className={styles.artistSub}>
                {spotifyArtist?.genres?.slice(0,3).join(' · ') || 'R&B · Soul · Alternativo'}
              </div>
              <div className={styles.artistNote}>"porque sé que te encanta" — tu novio</div>
            </div>
          </div>
        </section>

        {/* CANCIÓN DEL MES */}
        <section ref={monthRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>Lo del mes</div>
          <div className={styles.sectionSub}>— en repeat ahora mismo</div>
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
                  <div className={styles.monthBadge}>◆ del mes</div>
                  <div className={styles.monthName}>Circus Maximus</div>
                  <div className={styles.monthArtist}>Travis Scott</div>
                </div>
                <div className={styles.monthBars}>
                  {[8, 18, 12, 18].map((h, i) => (
                    <div key={i} className={styles.mbar} style={{ height: h, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              </div>
            );
          })()}
          {(() => {
            const track    = spotifyTracks.conLosDosCabeza;
            const coverUrl = track?.album?.images?.[0]?.url;
            const active   = isPlaying && currentTrack?.id === track?.id;
            return (
              <div
                className={`${styles.monthCard} ${active ? styles.monthCardActive : ''}`}
                onClick={() => handlePlay(track)}
                style={{ cursor: track ? 'pointer' : 'default' }}
              >
                {coverUrl
                  ? <img src={coverUrl} alt="Con los Dos en la Cabeza" className={styles.monthCoverImg} />
                  : <div className={styles.monthCover}>🎸</div>
                }
                <div className={styles.monthInfo}>
                  <div className={styles.monthBadge}>🎵 del mes</div>
                  <div className={styles.monthName}>Con los Dos en la Cabeza</div>
                  <div className={styles.monthArtist}>Pedro Guerra</div>
                </div>
                <div className={styles.monthBars}>
                  {[8, 18, 12, 18].map((h, i) => (
                    <div key={i} className={styles.mbar} style={{ height: h, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        <p className={styles.footerText}>
          Desarrollado con amor por el novio más guapo del mundo 🎀
        </p>
      </div>

      {/* MODAL SECRETO */}
      {showSecret && <SecretModal months={months} onClose={() => setShowSecret(false)} />}
    </div>
  );
}

function SecretModal({ months, onClose }) {
  const msg = 'Tú eres la música en mi vida, pero no cualquier canción, eres esa que aparece en el momento exacto y lo cambia todo. Contigo siento cosas que no sabía nombrar, pero que ahora no quiero dejar de vivir. Cinco meses, y aún así, cada día contigo suena como el inicio de algo eterno. Te amo Ana Sofía por lo que eres, y por todo lo que despiertas en mí. ♡';
  const words = msg.split(' ');

  return (
    <div className={styles.secretOverlay} onClick={onClose}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className={styles.floatingHeart}
          style={{
            left: `${(i * 7.3) % 100}%`,
            fontSize: 16 + (i % 4) * 8,
            animationDuration: `${6 + (i % 5)}s`,
            animationDelay: `${i * 0.4}s`,
          }}
        >♡</div>
      ))}
      <div className={styles.secretModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.secretHeart}>♡</div>
        <div className={styles.secretTitle}>Llevamos {months} meses</div>
        <div className={styles.secretMsg}>
          {words.map((w, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.28em',
                animation: `wordIn 0.5s ease ${0.4 + i * 0.045}s both`,
              }}
            >{w}</span>
          ))}
        </div>
        <button className={styles.secretClose} onClick={onClose}>Cerrar ♡</button>
      </div>
    </div>
  );
}
