import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';
import { logout } from '../utils/spotify';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const avatar = user?.images?.[0]?.url;

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/home" className={styles.logo}>
          <span className={styles.logoIcon}>♪</span>
          Anitam Spotify
        </NavLink>

        <div className={styles.links}>
          <NavLink
            to="/home"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Buscar
          </NavLink>
          <NavLink
            to="/playlists"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Playlists
          </NavLink>
        </div>

        <div className={styles.profile} onClick={() => setMenuOpen(!menuOpen)}>
          {avatar ? (
            <img src={avatar} alt="" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user?.display_name?.[0] || '♡'}
            </div>
          )}
          <span className={styles.userName}>{user?.display_name?.split(' ')[0] || ''}</span>

          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
