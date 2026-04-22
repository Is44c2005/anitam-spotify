import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserPlaylists, getCurrentUser, createPlaylist } from '../utils/api';
import styles from './Playlists.module.css';

const ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 1.5];

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]     = useState('');
  const [creating, setCreating]   = useState(false);

  useEffect(() => { loadPlaylists(); }, []);

  async function loadPlaylists() {
    try {
      const data = await getUserPlaylists();
      setPlaylists(data?.items || []);
    } catch (err) {
      console.error(err);
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
      await createPlaylist(user.id, newName.trim(), 'Creada con amor desde Anitam Spotify ♡');
      setNewName('');
      setShowCreate(false);
      await loadPlaylists();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingVinyl} />
        <p className={styles.loadingText}>cargando playlists...</p>
      </div>
    );
  }

  const mine         = playlists.filter((pl) => pl.owner?.id !== 'spotify');
  const spotifyOwned = playlists.filter((pl) => pl.owner?.id === 'spotify');

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <div className={styles.tagline}>— tu música, —</div>
            <h1 className={styles.title}>Mis Playlists<span className={styles.titleAccent}> ♡</span></h1>
          </div>
          <button className={styles.createBtn} onClick={() => setShowCreate(!showCreate)}>
            + nueva playlist
          </button>
        </div>

        {/* CREATE FORM */}
        {showCreate && (
          <form className={styles.createForm} onSubmit={handleCreate}>
            <div className={styles.createInputWrap}>
              <input
                type="text"
                className={styles.createInput}
                placeholder="nombre de la playlist..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className={styles.createSubmit} disabled={creating}>
              {creating ? 'creando...' : 'crear ♡'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>
              cancelar
            </button>
          </form>
        )}

        {/* EMPTY */}
        {playlists.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyVinyl} />
            <p className={styles.emptyTitle}>aún no tienes playlists</p>
            <p className={styles.emptySub}>¡crea una ahora! ♡</p>
          </div>
        )}

        {/* MINE */}
        {mine.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>tuyas ♡</div>
            <div className={styles.grid}>
              {mine.map((pl, i) => {
                const rot = ROTATIONS[i % ROTATIONS.length];
                const coverUrl = pl.images?.[0]?.url;
                return (
                  <Link
                    to={`/playlists/${pl.id}`}
                    key={pl.id}
                    className={styles.card}
                    style={{ transform: `rotate(${rot}deg)` }}
                  >
                    <div className={styles.polaroid}>
                      {coverUrl
                        ? <img src={coverUrl} alt={pl.name} className={styles.cardImg} />
                        : <div className={styles.cardImgFallback}>♪</div>
                      }
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardName}>{pl.name}</div>
                      <div className={styles.cardSub}>{pl.tracks?.total || 0} canciones</div>
                    </div>
                    <div className={styles.cardPlay}>▶</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SPOTIFY OWNED */}
        {spotifyOwned.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>de Spotify 🔒</div>
            <div className={styles.sectionNote}>Estas playlists son de Spotify y no se pueden reproducir desde aquí.</div>
            <div className={styles.grid}>
              {spotifyOwned.map((pl, i) => {
                const rot = ROTATIONS[(mine.length + i) % ROTATIONS.length];
                const coverUrl = pl.images?.[0]?.url;
                return (
                  <div
                    key={pl.id}
                    className={`${styles.card} ${styles.cardLocked}`}
                    style={{ transform: `rotate(${rot}deg)` }}
                  >
                    <div className={styles.polaroid}>
                      {coverUrl
                        ? <img src={coverUrl} alt={pl.name} className={styles.cardImg} />
                        : <div className={styles.cardImgFallback}>♪</div>
                      }
                      <div className={styles.lockBadge}>🔒</div>
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardName}>{pl.name}</div>
                      <div className={styles.cardSub}>{pl.tracks?.total || 0} canciones · Spotify</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <p className={styles.footerNote}>hecha con amor ♡</p>
      </div>
    </div>
  );
}
