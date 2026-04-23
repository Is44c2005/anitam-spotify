import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PlayerProvider } from './hooks/usePlayer';
import Welcome from './pages/Welcome';
import Callback from './pages/Callback';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function HeartCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    const onOver = (e) => {
      const el = e.target;
      const tag = el.tagName;
      setHovering(
        tag === 'BUTTON' || tag === 'A' ||
        el.getAttribute('role') === 'button' ||
        getComputedStyle(el).cursor === 'pointer'
      );
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  const scale = clicking ? 0.75 : hovering ? 1.35 : 1;

  return (
    <div style={{
      position: 'fixed',
      left: pos.x - 10,
      top: pos.y - 10,
      width: 20,
      height: 20,
      zIndex: 99999,
      pointerEvents: 'none',
      transform: `scale(${scale})`,
      transition: 'transform 0.12s ease',
      userSelect: 'none',
    }}>
      <svg viewBox="0 0 20 20" width="20" height="20" style={{ overflow: 'visible' }}>
        <path
          d="M10 17C10 17 2 11.5 2 7a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 4.5-8 10-8 10z"
          fill="#F5AFAF"
          stroke="#c47a7a"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <HeartCursor />
      <PlayerProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AppLayout><Home /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <AppLayout><Search /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <AppLayout><Playlists /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists/:id"
            element={
              <ProtectedRoute>
                <AppLayout><PlaylistDetail /></AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Player />
      </PlayerProvider>
    </BrowserRouter>
  );
}
