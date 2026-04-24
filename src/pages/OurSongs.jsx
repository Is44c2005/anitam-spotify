import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getValidToken } from '../utils/spotify';
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

  const songsRef = useReveal();

  useEffect(() => {
    const searchTracks = async () => {
      try {
        const token = await getValidToken();
        if (!token) {
          setSongs(prev => prev.map(s => ({ ...s, loading: false })));
          return;
        }

        const searchPromises = SONGS.map(async (song) => {
          try {
            let query = encodeURIComponent(`${song.name} ${song.artist}`);
            let limit = 1;

            // Corrección 1: Patadas de Ahogado - filtrar remixes
            if (song.name === 'Patadas de Ahogado') {
              limit = 10;
            }

            // Corrección 2: Eres - búsqueda específica para Grupo Niche
            if (song.name === 'Eres') {
              query = encodeURIComponent('Eres Grupo Niche');
            }

            const response = await fetch(
              `https://api.spotify.com/v1/search?q=${query}&type=track&limit=${limit}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!response.ok) return null;
            const data = await response.json();
            let track = data.tracks?.items?.[0];

            // Para Patadas de Ahogado, filtrar remixes
            if (song.name === 'Patadas de Ahogado' && data.tracks?.items) {
              track = data.tracks.items.find(t => !t.name.includes('Remix') && !t.name.includes('remix') && !t.name.includes('REMIX')) || data.tracks.items[0];
            }

            if (track) {
              return {
                coverUrl: track.album?.images?.[1]?.url,
                uri: track.uri,
                id: track.id,
                track: track,
              };
            }
          } catch (error) {
            console.error(`Error searching ${song.name}:`, error);
          }
          return null;
        });

        const results = await Promise.all(searchPromises);

        setSongs(SONGS.map((song, i) => {
          const result = results[i];
          return {
            ...song,
            n: i + 1,
            loading: false,
            coverUrl: result?.coverUrl,
            uri: result?.uri,
            id: result?.id,
            track: result?.track,
          };
        }));
      } catch (error) {
        console.error('Error in searchTracks:', error);
        setSongs(prev => prev.map(s => ({ ...s, loading: false })));
      }
    };

    searchTracks();
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
              const { n, name, artist, coverUrl, loading, track } = song;
              const active = isPlaying && currentTrack?.id === track?.id;
              const initials = getInitials(name);
              const bgColor = getColorFromName(name);

              return (
                <div
                  key={n}
                  className={`${styles.trackRow} ${active ? styles.trackRowActive : ''}`}
                  onClick={() => handlePlay(song)}
                  style={{ cursor: track ? 'pointer' : 'default' }}
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
                    {track ? '♫' : '—'}
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
