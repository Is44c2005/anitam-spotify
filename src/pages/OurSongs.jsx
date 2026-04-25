import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../hooks/usePlayer';
import styles from './OurSongs.module.css';

const SONGS = [
  {name:'Cariño', artist:'The Marías'},
  {name:'Teorías Caos y Besos', artist:'LosPetitFellas'},
  {name:'neo roneo', artist:'Latin Mafia'},
  {name:"Baby I'm Yours", artist:'Arctic Monkeys'},
  {name:'You Rock My World', artist:'Michael Jackson'},
  {name:'Just the Two of Us', artist:'Grover Washington Jr.'},
  {name:'My Favorite Part', artist:'Mac Miller'},
  {name:"Yebba's Heartbreak", artist:'Drake'},
  {name:'K', artist:'Cigarettes After Sex'},
  {name:'Sunflower', artist:'Rex Orange County'},
  {name:'I Love You So', artist:'The Walters'},
  {name:'After Last Night', artist:'Bruno Mars'},
  {name:'Redbone', artist:'Childish Gambino'},
  {name:'One Of Your Girls', artist:'Troye Sivan'},
  {name:'Dreams', artist:'Fleetwood Mac'},
  {name:'How Deep Is Your Love', artist:'Bee Gees'},
  {name:'Come and Get Your Love', artist:'Redbone'},
  {name:'Wonderwall', artist:'Oasis'},
  {name:'Waiting For Love', artist:'Avicii'},
  {name:'Ama de Mi Sol', artist:'Milo J'},
  {name:'Patadas de Ahogado', artist:'Latin Mafia'},
  {name:'Amtrak', artist:'Los Retros'},
  {name:'Dear Soulmate', artist:'Laufey'},
  {name:'Until I Found You', artist:'Stephen Sanchez'},
  {name:'Piel de Azúcar', artist:'José José'},
  {name:'Cometas', artist:'Bacalao Men'},
  {name:'Todo Empezó', artist:'Eddie Santiago'},
  {name:'Quiero Morir en Tu Piel', artist:'Willie González'},
  {name:'Eres', artist:'Grupo Niche'},
  {name:'Tú y Yo', artist:'La Misma Gente'},
  {name:'Te Amo Te Extraño', artist:'Guayacán Orquesta'},
  {name:'Preso', artist:'José José'},
];

const TRACK_IDS = [
  '0ofHAoxe9vBkTCp2UQIavz', // Cariño - The Marías
  '2JoZzpdeP2G6Csfdq5aLXP', // Teorías Caos y Besos
  '7GVUmCP00eSsqc4tzj1sDD', // neo roneo
  '5qqabIl2vWzo9ApSC317sa', // Baby I'm Yours
  '2P4OICZRVAQcYAV2JReRfj', // You Rock My World
  '4GKm1QaEr1tqJwUM0EsUl3', // Just the Two of Us
  '4WefXOf8I4gMjdj2kBJgkl', // My Favorite Part
  '5F6ekGcdu623mkhTVgk64Z', // Yebba's Heartbreak
  '2OcTokSU4FnEaIMpNSAh9F', // K
  '0T5iIrXA4p5GsubkhuBIKV', // Sunflower
  '2qpacEyFxmbxCpIEqZkqvC', // I Love You So
  '7qWfrXUmYD2UG82tI0pfKm', // After Last Night
  '35uxk7hvSZBfEgScbcagZI', // Redbone
  '3cL9ePuG6NGlmUmXEbOfpG', // One Of Your Girls
  '1mea3bSkSGXuIRvnydlB57', // Dreams - Fleetwood Mac
  '3mM00GfVOfqBYFfPtQPgdm', // How Deep Is Your Love
  '4bIzPNFSCWqnKiAXerPIAq', // Come and Get Your Love
  '4wJBWMDkbRUXGQHtkFoFOj', // Wonderwall
  '7nZmah2llfvLDiUjm0kiyz', // Waiting For Love
  '5mg6sU732O35VMfCYk3lmX', // Ama de Mi Sol
  '1aBJ5ljG2GalxEl01vQn04', // Patadas de Ahogado
  '17LdmV5cIcTvxB0O18tD2Z', // Amtrak
  '4lYcMKmPzUhMlVFKciXERW', // Dear Soulmate - Laufey
  '3t3jGDeU3t1ro51C3x2pPR', // Until I Found You
  '5mg6sU732O35VMfCYk3lmX', // Piel de Azúcar
  '1aBJ5ljG2GalxEl01vQn04', // Cometas
  '17LdmV5cIcTvxB0O18tD2Z', // Todo Empezó
  '3cL9ePuG6NGlmUmXEbOfpG', // Quiero Morir en Tu Piel
  '2PgKHMmSYEyDU0HJKWXMAM', // Eres - Grupo Niche
  '35uxk7hvSZBfEgScbcagZI', // Tú y Yo
  '7qWfrXUmYD2UG82tI0pfKm', // Te Amo Te Extraño
  '2qpacEyFxmbxCpIEqZkqvC', // Preso
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
  const [songs, setSongs] = useState(SONGS.map((s, i) => ({ ...s, n: i + 1, loading: true })));
  const [hoveredRow, setHoveredRow] = useState(null);

  const songsRef = useReveal();

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const ids = TRACK_IDS.join(',');

        const BASE = 'https://api.spotify.com/v1';
        const token = localStorage.getItem('spotify_access_token');

        if (!token) {
          setSongs(prev => prev.map(s => ({ ...s, loading: false })));
          return;
        }

        const response = await fetch(
          `${BASE}/tracks?ids=${ids}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          console.error('Spotify API error:', response.status);
          setSongs(prev => prev.map(s => ({ ...s, loading: false })));
          return;
        }

        const data = await response.json();
        const tracks = data.tracks || [];

        setSongs(SONGS.map((song, i) => {
          const track = tracks[i];
          const coverUrl = track?.album?.images?.[0]?.url || null;
          return {
            ...song,
            n: i + 1,
            loading: false,
            coverUrl,
            uri: track?.uri,
            id: track?.id,
            track: track,
          };
        }));
      } catch (error) {
        console.error('Error loading tracks:', error);
        setSongs(prev => prev.map(s => ({ ...s, loading: false })));
      }
    };

    loadTracks();
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
    if (song.track) {
      play(song.track);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <button className={styles.backBtn} onClick={() => navigate('/home')}>
          ← volver
        </button>

        <div className={styles.hero}>
          <div className={`${styles.tagline} ${styles.fadeInUp}`}>— las que suenan cuando pienso en ti —</div>
          <h1 className={`${styles.heroTitle} ${styles.fadeInUp}`}>
            Nuestras <span className={styles.heroAccent}>canciones</span>
            <span className={styles.heroHeart}>♡</span>
          </h1>
        </div>

        <section ref={songsRef} className={`${styles.section} reveal`}>
          <div className={styles.sectionTitle}>todas las nuestras</div>
          <div className={styles.sectionSub}>— nuestra playlist completa ♡</div>
          <div className={styles.trackList}>
            {songs.map((song) => {
              const { n, name, artist, coverUrl, loading, track } = song;
              const active = isPlaying && currentTrack?.id === track?.id;
              const initials = getInitials(name);
              const bgColor = getColorFromName(name);

              return (
                <div
                  key={n}
                  className={`${styles.trackRow} ${active ? styles.trackRowActive : ''} ${styles.fadeInUpRow}`}
                  onClick={() => handlePlay(song)}
                  onMouseEnter={() => setHoveredRow(n)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ cursor: track ? 'pointer' : 'default', animationDelay: `${n * 0.05}s` }}
                >
                  <span className={styles.trackNum}>{String(n).padStart(2, '0')}</span>

                  {loading ? (
                    <div className={styles.trackCover} style={{
                      background: 'linear-gradient(90deg, #F9DFDF 25%, #FBEAEA 50%, #F9DFDF 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.4s ease-in-out infinite',
                    }} />
                  ) : coverUrl ? (
                    <img src={coverUrl} className={styles.trackCover} alt={name} />
                  ) : (
                    <div className={styles.trackCoverFallback} style={{backgroundColor: bgColor}}>
                      {initials}
                    </div>
                  )}

                  <div className={styles.trackInfo}>
                    <div className={styles.trackName}>{name}</div>
                    <div className={styles.trackArtist}>{artist}</div>
                  </div>
                  <div className={styles.trackLabel}>
                    {hoveredRow === n ? '♡' : (track ? '♫' : '—')}
                  </div>
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
