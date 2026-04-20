import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
      <PlayerProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
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
