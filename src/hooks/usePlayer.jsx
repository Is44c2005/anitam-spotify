import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { getValidToken, isAuthenticated } from '../utils/spotify';

const PlayerContext = createContext(null);

const BASE = 'https://api.spotify.com/v1';

async function spotifyPut(path, body = null) {
  const token = await getValidToken();
  return fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);   // seconds
  const [duration, setDuration] = useState(0);   // seconds
  const [deviceId, setDeviceId] = useState(null);

  const playerRef = useRef(null);
  const tickRef = useRef(null);

  function stopTick() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startTick() {
    stopTick();
    tickRef.current = setInterval(() => {
      setProgress((p) => p + 1);
    }, 1000);
  }

  function syncState(state) {
    if (!state) return;

    const sdkTrack = state.track_window?.current_track;
    if (sdkTrack) {
      setCurrentTrack({
        id: sdkTrack.id,
        uri: sdkTrack.uri,
        name: sdkTrack.name,
        artists: sdkTrack.artists,
        album: {
          name: sdkTrack.album?.name,
          images: sdkTrack.album?.images,
        },
        duration_ms: state.duration,
      });
    }

    const nowPlaying = !state.paused;
    setIsPlaying(nowPlaying);
    setProgress(Math.floor(state.position / 1000));
    setDuration(Math.floor(state.duration / 1000));

    if (nowPlaying) startTick();
    else stopTick();
  }

  function initPlayer() {
    if (playerRef.current) return;

    const player = new window.Spotify.Player({
      name: 'Spoty ♡',
      getOAuthToken: async (cb) => {
        const t = await getValidToken();
        cb(t);
      },
      volume: 0.7,
    });

    player.addListener('ready', ({ device_id }) => {
      setDeviceId(device_id);
    });

    player.addListener('not_ready', () => {
      setDeviceId(null);
    });

    player.addListener('player_state_changed', syncState);

    player.connect();
    playerRef.current = player;
  }

  useEffect(() => {
    if (!isAuthenticated()) return;

    if (window.Spotify?.Player) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      if (!document.querySelector('script[src*="spotify-player"]')) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      stopTick();
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, []);

  const play = useCallback(async (track) => {
    if (!deviceId) return;
    const uri = track.uri || `spotify:track:${track.id}`;
    await spotifyPut(`/me/player/play?device_id=${deviceId}`, { uris: [uri] });
  }, [deviceId]);

  const togglePlay = useCallback(() => {
    playerRef.current?.togglePlay();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    playerRef.current?.resume();
  }, []);

  const seek = useCallback((seconds) => {
    playerRef.current?.seek(Math.floor(seconds * 1000));
    setProgress(seconds);
  }, []);

  const previous = useCallback(() => {
    playerRef.current?.previousTrack();
  }, []);

  const next = useCallback(() => {
    playerRef.current?.nextTrack();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, isPlaying, progress, duration, deviceId,
        play, pause, resume, togglePlay, seek, previous, next,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
