import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, getUserPlaylists, searchArtistTrack, getPlaylistTracks } from '../utils/api';
import { usePlayer } from '../hooks/usePlayer';
import styles from './Home.module.css';

function RomanticCounter({ startDate }) {
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const start = new Date(startDate);
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;

  const totalDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  return (
    <>
      <div className={styles.counter} onClick={() => setShowModal(true)}>
        <span className={styles.counterHeart}>♡</span>
        <span>Llevamos <strong>{months} meses</strong> y <strong>{totalDays} días</strong> juntos ♡</span>
        <span className={styles.counterHeart}>♡</span>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            <div className={styles.modalContent}>
              <span className={styles.modalEmoji}>💕</span>
              <h3>Para mi Ana Sofía</h3>
              <p>
                Cada día a tu lado es el mejor regalo que la vida me ha dado.
                Eres mi canción favorita, la melodía que le da sentido a todo.
                Te amo más de lo que las palabras pueden expresar,
                más de lo que cualquier canción podría cantar.
              </p>
              <p className={styles.modalSignature}>
                — Tu novio, que te ama con locura 🎀
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OurSong({ track, onPlay }) {
  if (!track) return null;

  const image = track.album?.images?.[0]?.url;
  const artist = track.artists?.map((a) => a.name).join(', ');

  return (
    <div className={styles.heroSong}>
      <h2 className={styles.heroTitle}>Nuestra canción ♡</h2>
      <div className={styles.songCard} onClick={() => onPlay(track)}>
        <div className={styles.songImageWrapper}>
          {image && <img src={image} alt={track.name} className={styles.songImage} />}
          <div className={styles.heartOverlay}>
            <span className={styles.heartBeat}>❤️</span>
          </div>
        </div>
        <div className={styles.songInfo}>
          <h3 className={styles.songName}>{track.name}</h3>
          <p className={styles.songArtist}>{artist}</p>
          <button className={styles.playBtn}>
            {track.preview_url ? '▶ Escuchar preview' : '♪ Nuestra canción'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaylistGrid({ playlists }) {
  if (!playlists?.length) return null;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Tus Playlists 🎵</h2>
        <Link to="/playlists" className={styles.seeAll}>Ver todas →</Link>
      </div>
      <div className={styles.grid}>
        {playlists.slice(0, 8).map((pl) => (
          <Link to={`/playlists/${pl.id}`} key={pl.id} className={styles.card}>
            <div className={styles.cardImageWrapper}>
              <img
                src={pl.images?.[0]?.url || '/placeholder.svg'}
                alt={pl.name}
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <span className={styles.cardPlay}>▶</span>
              </div>
            </div>
            <h4 className={styles.cardTitle}>{pl.name}</h4>
            <p className={styles.cardSub}>{pl.tracks?.total || 0} canciones</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RecommendedTracks({ tracks, onPlay }) {
  if (!tracks?.length) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Recomendadas para ti 💫</h2>
      <div className={styles.trackList}>
        {tracks.map((track, i) => {
          const image = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;
          const artist = track.artists?.map((a) => a.name).join(', ');
          const mins = Math.floor(track.duration_ms / 60000);
          const secs = Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0');

          return (
            <div key={track.id} className={styles.trackItem} onClick={() => onPlay(track)}>
              <span className={styles.trackNum}>{i + 1}</span>
              {image && <img src={image} alt="" className={styles.trackImg} />}
              <div className={styles.trackInfo}>
                <span className={styles.trackName}>{track.name}</span>
                <span className={styles.trackArtist}>{artist}</span>
              </div>
              <span className={styles.trackDuration}>{mins}:{secs}</span>
              {track.preview_url && <span className={styles.trackPlayIcon}>▶</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [ourSong, setOurSong] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { play } = usePlayer();

  useEffect(() => {
    async function load() {
      let playlistItems = [];

      try {
        const [userData, playlistData] = await Promise.all([
          getCurrentUser(),
          getUserPlaylists(),
        ]);
        setUser(userData);
        playlistItems = playlistData.items || [];
        setPlaylists(playlistItems);

        // Search for "our song"
        const songResult = await searchArtistTrack('Mon Laferte', 'My One and Only Love');
        const song = songResult?.tracks?.items?.[0];
        setOurSong(song || null);
      } catch (err) {
        console.error('Error loading home:', err);
      }

      // Buscar tracks de recomendaciones probando playlists hasta encontrar una accesible
      // (separado del try principal para que un 403 no bloquee el resto de la página)
      try {
        for (const pl of playlistItems.slice(0, 6)) {
          try {
            const result = await getPlaylistTracks(pl.id, 10);
            const tracks = (result?.items || []).map((item) => item.track).filter(Boolean);
            if (tracks.length > 0) {
              setRecommendations(tracks);
              break;
            }
          } catch {
            // Esta playlist no es accesible, probar la siguiente
          }
        }
      } catch {
        // Sin recomendaciones disponibles
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Cargando tu música, amor...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1>Hola, {user?.display_name?.split(' ')[0] || 'amor'} 💕</h1>
      </div>

      <OurSong track={ourSong} onPlay={play} />

      <RomanticCounter startDate="2024-11-24" />

      <PlaylistGrid playlists={playlists} />

      <RecommendedTracks tracks={recommendations} onPlay={play} />
    </div>
  );
}
