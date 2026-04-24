import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getValidToken } from '../utils/spotify';
import { usePlayer } from '../hooks/usePlayer';
import styles from './OurSongs.module.css';

const SONGS = [
  {n:1, id:'0ofHAoxe9vBkTCp2UQIavz', name:'Cariño', artist:'The Marías', vibe:'suavecito'},
  {n:2, id:'2JoZzpdeP2G6Csfdq5aLXP', name:'Teorías Caos y Besos', artist:'LosPetitFellas', vibe:'especial'},
  {n:3, id:'7GVUmCP00eSsqc4tzj1sDD', name:'neo roneo', artist:'Latin Mafia', vibe:'romántico'},
  {n:4, id:'5qqabIl2vWzo9ApSC317sa', name:"Baby I'm Yours", artist:'Arctic Monkeys', vibe:'tuyo/a'},
  {n:5, id:'2P4OICZRVAQcYAV2JReRfj', name:'You Rock My World', artist:'Michael Jackson', vibe:'clásico'},
  {n:6, id:'4GKm1QaEr1tqJwUM0EsUl3', name:'Just the Two of Us', artist:'Grover Washington Jr.', vibe:'los dos'},
  {n:7, id:'4WefXOf8I4gMjdj2kBJgkl', name:'My Favorite Part', artist:'Mac Miller', vibe:'favorita'},
  {n:8, id:'5F6ekGcdu623mkhTVgk64Z', name:"Yebba's Heartbreak", artist:'Drake', vibe:'sentida'},
  {n:9, id:'2OcTokSU4FnEaIMpNSAh9F', name:'K', artist:'Cigarettes After Sex', vibe:'íntima'},
  {n:10, id:'0T5iIrXA4p5GsubkhuBIKV', name:'Sunflower', artist:'Rex Orange County', vibe:'alegre'},
  {n:11, id:'2qpacEyFxmbxCpIEqZkqvC', name:'I Love You So', artist:'The Walters', vibe:'así te quiero'},
  {n:12, id:'7qWfrXUmYD2UG82tI0pfKm', name:'After Last Night', artist:'Bruno Mars', vibe:'nuestra'},
  {n:13, id:'35uxk7hvSZBfEgScbcagZI', name:'Redbone', artist:'Childish Gambino', vibe:'vibra'},
  {n:14, id:'3cL9ePuG6NGlmUmXEbOfpG', name:'One Of Your Girls', artist:'Troye Sivan', vibe:'solo tuya'},
  {n:15, id:'3t3jGDeU3t1ro51C3x2pPR', name:'Canción nueva 15', artist:'Artista', vibe:'especial'},
  {n:16, id:'5mg6sU732O35VMfCYk3lmX', name:'Canción nueva 16', artist:'Artista', vibe:'especial'},
  {n:17, id:'1aBJ5ljG2GalxEl01vQn04', name:'Canción nueva 17', artist:'Artista', vibe:'especial'},
  {n:18, id:'17LdmV5cIcTvxB0O18tD2Z', name:'Canción nueva 18', artist:'Artista', vibe:'especial'},
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
  const [songs, setSongs] = useState(SONGS);

  const songsRef = useReveal();

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        const token = await getValidToken();
        if (!token) {
          setSongs(SONGS);
          return;
        }

        const ids = SONGS.map(s => s.id).join(',');
        const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${ids}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          setSongs(SONGS);
          return;
        }

        const data = await response.json();
        const tracks = data.tracks || [];

        const updatedSongs = SONGS.map((song, i) => {
          const track = tracks[i];
          if (track) {
            return {
              ...song,
              spotifyName: track.name,
              spotifyArtist: track.artists?.[0]?.name,
              coverUrl: track.album?.images?.[0]?.url,
              previewUrl: track.preview_url,
              trackObj: track,
            };
          }
          return song;
        });

        setSongs(updatedSongs);
      } catch (error) {
        console.error('Error fetching Spotify tracks:', error);
        setSongs(SONGS);
      }
    };

    fetchSpotifyData();
  }, []);

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function getColorFromName(name) {
    const colors = ['#F5AFAF', '#F9DFDF', '#FBEFEF', '#c47a7a', '#7a5555'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  function handlePlay(song) {
    if (song.trackObj) {
      play(song.trackObj);
    }
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

        <section ref={songsRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>todas las nuestras</div>
          <div className={styles.sectionSub}>— nuestra playlist completa ♡</div>
          <div className={styles.trackList}>
            {songs.map((song) => {
              const { n, vibe, name, artist, coverUrl, trackObj } = song;
              const displayName = song.spotifyName || name;
              const displayArtist = song.spotifyArtist || artist;
              const active = isPlaying && currentTrack?.id === trackObj?.id;
              const initials = getInitials(displayName);
              const bgColor = getColorFromName(displayName);

              return (
                <div
                  key={n}
                  className={`${styles.trackRow} ${active ? styles.trackRowActive : ''}`}
                  onClick={() => handlePlay(song)}
                  style={{ cursor: trackObj ? 'pointer' : 'default' }}
                >
                  <span className={styles.trackNum}>{String(n).padStart(2, '0')}</span>
                  {coverUrl
                    ? <img src={coverUrl} className={styles.trackCover} alt={displayName} />
                    : <div className={styles.trackCoverFallback} style={{backgroundColor: bgColor}}>{initials}</div>
                  }
                  <div className={styles.trackInfo}>
                    <div className={styles.trackName}>{displayName}</div>
                    <div className={styles.trackArtist}>{displayArtist}</div>
                  </div>
                  <div className={styles.trackLabel}>{vibe}</div>
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
