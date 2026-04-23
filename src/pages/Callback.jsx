import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../utils/spotify';
import styles from './Callback.module.css';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const authError = params.get('error');

    if (authError || !code) {
      setTimeout(() => navigate('/', { replace: true }), 2000);
      return;
    }

    exchangeCodeForToken(code)
      .then((data) => {
        if (data.access_token) {
          navigate('/home', { replace: true });
        } else {
          setTimeout(() => navigate('/', { replace: true }), 2000);
        }
      })
      .catch(() => setTimeout(() => navigate('/', { replace: true }), 2000));
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <p className={styles.text}>Conectando con Spotify...</p>
        <p className={styles.subtext}>Un momento, amor 💕</p>
      </div>
    </div>
  );
}
