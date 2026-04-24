import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchArtistTrack, getValidToken } from '../utils/api';
import { usePlayer } from '../hooks/usePlayer';
import styles from './OurSongs.module.css';

const MAIN_SONGS = [
  { key: 'ourSong',       artist: 'Mon Laferte',  title: 'My One and Only Love', label: 'la nuestra ♡',   rot: -2   },
  { key: 'somosDos',      artist: 'Bomba Estéreo', title: 'Somos Dos',            label: 'nos recuerda',    rot:  1.5 },
  { key: 'flyLove',       artist: 'Jamie Foxx',    title: 'Fly Love',             label: 'pienso en ti',    rot: -1.5 },
  { key: 'sundayMorning', artist: 'Maroon 5',      title: 'Sunday Morning', album: 'Songs About Jane', label: 'domingo contigo', rot: 1 },
];

const ALL_SONGS = [
  { n:  1, id: '0ofHAoxe9vBkTCp2UQIavz', label: 'suavecito'     },
  { n:  2, id: '2JoZzpdeP2G6Csfdq5aLXP', label: 'especial'      },
  { n:  3, id: '7GVUmCP00eSsqc4tzj1sDD', label: 'romántico'     },
  { n:  4, id: '5qqabIl2vWzo9ApSC317sa', label: 'tuyo/a'        },
  { n:  5, id: '2P4OICZRVAQcYAV2JReRfj', label: 'clásico'       },
  { n:  6, id: '4GKm1QaEr1tqJwUM0EsUl3', label: 'los dos'       },
  { n:  7, id: '4WefXOf8I4gMjdj2kBJgkl', label: 'favorita'      },
  { n:  8, id: '5F6ekGcdu623mkhTVgk64Z', label: 'sentida'       },
  { n:  9, id: '2OcTokSU4FnEaIMpNSAh9F', label: 'íntima'        },
  { n: 10, id: '0T5iIrXA4p5GsubkhuBIKV', label: 'alegre'        },
  { n: 11, id: '2qpacEyFxmbxCpIEqZkqvC', label: 'así te quiero'  },
  { n: 12, id: '7qWfrXUmYD2UG82tI0pfKm', label: 'nuestra'       },
  { n: 13, id: '35uxk7hvSZBfEgScbcagZI', label: 'vibra'         },
  { n: 14, id: '3cL9ePuG6NGlmUmXEbOfpG', label: 'solo tuya'     },
  { n: 15, id: '3t3jGDeU3t1ro51C3x2pPR', label: 'para ti'       },
  { n: 16, id: '5mg6sU732O35VMfCYk3lmX', label: 'siempre'       },
  { n: 17, id: '1aBJ5ljG2GalxEl01vQn04', label: 'contigo'       },
  { n: 18, id: '17LdmV5cIcTvxB0O18tD2Z', label: 'eternamente'   },
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
    const fetchTracksById = async (trackIds) => {
      try {
        const token = await getValidToken();
        const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds.join(',')}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.tracks || [];
      } catch {
        return [];
      }
    };

    Promise.allSettled(
      MAIN_SONGS.map(({ artist, title, album }) => searchArtistTrack(artist, title, album))
    ).then(results => {
      const found = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') found[MAIN_SONGS[i].key] = r.value?.tracks?.items?.[0] ?? null;
      });
      setSpotifyTracks(found);
    }).catch(() => {});

    fetchTracksById(ALL_SONGS.map(s => s.id)).then(tracks => {
      setAllTracks(ALL_SONGS.map((song, i) => ({
        ...song,
        track: tracks[i] || null,
      })));
    });
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
            {allTracks.map(({ n, label, track }) => {
              const coverUrl = track?.album?.images?.[2]?.url;
              const trackName = track?.name || '—';
              const artistName = track?.artists?.[0]?.name || '—';
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
                    ? <img src={coverUrl} className={styles.trackCover} alt={trackName} />
                    : <div className={styles.trackCoverFallback}>♪</div>
                  }
                  <div className={styles.trackInfo}>
                    <div className={styles.trackName}>{trackName}</div>
                    <div className={styles.trackArtist}>{artistName}</div>
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
