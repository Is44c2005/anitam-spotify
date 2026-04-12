import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../utils/spotify';
import styles from './Callback.module.css';

export default function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const authError = params.get('error');

    if (authError) {
      setError('Acceso denegado. Intenta de nuevo.');
      return;
    }

    if (code) {
      exchangeCodeForToken(code)
        .then((data) => {
          if (data.access_token) {
            navigate('/home', { replace: true });
          } else {
            setError('Error al autenticar. Intenta de nuevo.');
          }
        })
        .catch(() => setError('Error de conexión. Intenta de nuevo.'));
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.error}>{error}</p>
          <button className={styles.btn} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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
