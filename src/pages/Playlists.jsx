import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserPlaylists, getCurrentUser, createPlaylist } from '../utils/api';
import styles from './Playlists.module.css';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function loadPlaylists() {
    try {
      const data = await getUserPlaylists();
      setPlaylists(data?.items || []);
    } catch (err) {
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const user = await getCurrentUser();
      await createPlaylist(user.id, newName.trim(), 'Creada con amor desde Anitam Spotify 💕');
      setNewName('');
      setShowCreate(false);
      await loadPlaylists();
    } catch (err) {
      console.error('Error creating playlist:', err);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Cargando playlists...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Playlists 🎵</h1>
        <button className={styles.createBtn} onClick={() => setShowCreate(!showCreate)}>
          + Nueva Playlist
        </button>
      </div>

      {showCreate && (
        <form className={styles.createForm} onSubmit={handleCreate}>
          <input
            type="text"
            className={styles.createInput}
            placeholder="Nombre de la playlist..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.createSubmit} disabled={creating}>
            {creating ? 'Creando...' : 'Crear 💕'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>
            Cancelar
          </button>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyEmoji}>🎶</span>
          <p>Aún no tienes playlists</p>
          <p className={styles.emptyHint}>¡Crea una ahora!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {playlists.map((pl) => (
            <Link to={`/playlists/${pl.id}`} key={pl.id} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <img
                  src={pl.images?.[0]?.url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23F9DFDF" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="40">🎵</text></svg>'}
                  alt={pl.name}
                  className={styles.cardImage}
                />
                <div className={styles.cardOverlay}>
                  <span className={styles.cardPlay}>▶</span>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{pl.name}</h3>
                <p className={styles.cardSub}>
                  {pl.tracks?.total || 0} canciones
                  {pl.owner?.display_name ? ` · ${pl.owner.display_name}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
