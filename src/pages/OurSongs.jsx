import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchArtistTrack } from '../utils/api';
import { usePlayer } from '../hooks/usePlayer';
import styles from './OurSongs.module.css';

const MAIN_SONGS = [
  { key: 'ourSong',       artist: 'Mon Laferte',  title: 'My One and Only Love', label: 'la nuestra ♡',   rot: -2   },
  { key: 'somosDos',      artist: 'Bomba Estéreo', title: 'Somos Dos',            label: 'nos recuerda',    rot:  1.5 },
  { key: 'flyLove',       artist: 'Jamie Foxx',    title: 'Fly Love',             label: 'pienso en ti',    rot: -1.5 },
  { key: 'sundayMorning', artist: 'Maroon 5',      title: 'Sunday Morning', album: 'Songs About Jane', label: 'domingo contigo', rot: 1 },
];

const ALL_SONGS = [
  { n:  1, artist: 'The Marías',            title: 'Cariño',              label: 'suavecito'    },
  { n:  2, artist: 'LosPetitFellas',        title: 'Teorías Caos y Besos', label: 'especial'     },
  { n:  3, artist: 'Latin Mafia',           title: 'neo roneo',           label: 'romántico'    },
  { n:  4, artist: 'Arctic Monkeys',        title: "Baby I'm Yours",      label: 'tuyo/a'       },
  { n:  5, artist: 'Michael Jackson',       title: 'You Rock My World',   label: 'clásico'      },
  { n:  6, artist: 'Grover Washington Jr.', title: 'Just the Two of Us',  label: 'los dos'      },
  { n:  7, artist: 'Mac Miller',            title: 'My Favorite Part',    label: 'favorita'     },
  { n:  8, artist: 'Drake',                 title: "Yebba's Heartbreak",  label: 'sentida'      },
  { n:  9, artist: 'Cigarettes After Sex',  title: 'K',                   label: 'íntima'       },
  { n: 10, artist: 'Rex Orange County',     title: 'Sunflower',           label: 'alegre'       },
  { n: 11, artist: 'The Walters',           title: 'I Love You So',       label: 'así te quiero' },
  { n: 12, artist: 'Bruno Mars',            title: 'After Last Night',    label: 'nuestra'      },
  { n: 13, artist: 'Childish Gambino',      title: 'Redbone',             label: 'vibra'        },
  { n: 14, artist: 'Troye Sivan',           title: 'One Of Your Girls',   label: 'solo tuya'    },
];

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

export default function OurSongs() {
  const navigate = useNavigate();
  const { play, currentTrack, isPlaying } = usePlayer();
  const [spotifyTracks, setSpotifyTracks] = useState({});
  const [allTracks, setAllTracks] = useState([]);

  const mainRef = useReveal();
  const allRef = useReveal();

  useEffect(() => {
    Promise.allSettled(
      MAIN_SONGS.map(({ artist, title, album }) => searchArtistTrack(artist, title, album))
    ).then(results => {
      const found = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') found[MAIN_SONGS[i].key] = r.value?.tracks?.items?.[0] ?? null;
      });
      setSpotifyTracks(found);
    }).catch(() => {});

    Promise.allSettled(
      ALL_SONGS.map(({ artist, title }) => searchArtistTrack(artist, title))
    ).then(results => {
      setAllTracks(results.map((r, i) => ({
        ...ALL_SONGS[i],
        track: r.status === 'fulfilled' ? r.value?.tracks?.items?.[0] ?? null : null,
      })));
    }).catch(() => {});
  }, []);

  function handlePlay(track) {
    if (track) play(track);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <button className={styles.backBtn} onClick={() => navigate('/home')}>
          ← volver
        </button>

        <div className={styles.hero}>
          <div className={styles.tagline}>— las que suenan cuando pienso en ti —</div>
          <h1 className={styles.heroTitle}>
            Nuestras <span className={styles.heroAccent}>canciones</span>
            <span className={styles.heroHeart}>♡</span>
          </h1>
        </div>

        <section ref={mainRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>las principales ♡</div>
          <div className={styles.sectionSub}>— las que más nos definen</div>
          <div className={styles.songsGrid}>
            {MAIN_SONGS.map(({ key, label, rot, fallbackName, fallbackArtist }) => {
              const track = spotifyTracks[key];
              const coverUrl = track?.album?.images?.[0]?.url;
              const name = track?.name || fallbackName;
              const artist = track?.artists?.[0]?.name || fallbackArtist;
              const active = isPlaying && currentTrack?.id === track?.id;
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
        </section>

        <section ref={allRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>todas las nuestras</div>
          <div className={styles.sectionSub}>— nuestra playlist completa ♡</div>
          <div className={styles.trackList}>
            {allTracks.map(({ n, title, artist, label, track }) => {
              const coverUrl = track?.album?.images?.[2]?.url;
              const active = isPlaying && currentTrack?.id === track?.id;
              return (
                <div
                  key={n}
                  className={`${styles.trackRow} ${active ? styles.trackRowActive : ''}`}
                  onClick={() => track && play(track)}
                  style={{ cursor: track ? 'pointer' : 'default' }}
                >
                  <span className={styles.trackNum}>{String(n).padStart(2, '0')}</span>
                  {coverUrl
                    ? <img src={coverUrl} className={styles.trackCover} alt={title} />
                    : <div className={styles.trackCoverFallback}>♪</div>
                  }
                  <div className={styles.trackInfo}>
                    <div className={styles.trackName}>{title}</div>
                    <div className={styles.trackArtist}>{artist}</div>
                  </div>
                  <div className={styles.trackLabel}>{label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <p className={styles.footerText}>Desarrollado con amor por el novio más guapo del mundo 🎀</p>
      </div>
    </div>
  );
}
