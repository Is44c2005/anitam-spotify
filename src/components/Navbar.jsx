import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';
import { logout } from '../utils/spotify';
import { usePlayer } from '../hooks/usePlayer';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { resetPlayer } = usePlayer();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {});
  }, []);

  function handleLogout() {
    resetPlayer();
    logout();
    navigate('/');
  }

  const avatar = user?.images?.[0]?.url;

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/home" className={styles.logo}>
          <svg className={styles.logoCat} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="18" r="12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <polygon points="8,8 4,4 6,14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="24,8 28,4 26,14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            <circle cx="20" cy="16" r="1.5" fill="currentColor"/>
            <path d="M 16 20 L 15 22 L 17 22" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
            <line x1="13" y1="19" x2="8" y2="19" stroke="currentColor" strokeWidth="1"/>
            <line x1="19" y1="19" x2="24" y2="19" stroke="currentColor" strokeWidth="1"/>
          </svg>
          Anitam<span className={styles.logoAccent}>♡</span>
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
