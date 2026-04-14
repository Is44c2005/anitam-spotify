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
  const [previewMode, setPreviewMode] = useState(false);

  const playerRef = useRef(null);
  const audioRef = useRef(null);
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

  function enablePreviewMode() {
    setPreviewMode(true);
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
  }

  function getAudio() {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.onended = () => {
        setIsPlaying(false);
        stopTick();
      };
      audio.ontimeupdate = () => {
        setProgress(Math.floor(audio.currentTime));
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(Math.floor(audio.duration));
        }
      };
      audioRef.current = audio;
    }
    return audioRef.current;
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

    // Si falla por cuenta sin Premium u otro error, activamos modo preview
    player.addListener('account_error', () => enablePreviewMode());
    player.addListener('initialization_error', () => enablePreviewMode());
    player.addListener('authentication_error', () => enablePreviewMode());
    player.addListener('playback_error', ({ message }) => {
      console.warn('SDK playback error:', message);
    });

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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback(async (track) => {
    // Modo preview: usar preview_url con el elemento Audio
    if (previewMode || !deviceId) {
      if (!track.preview_url) return;
      const audio = getAudio();
      audio.src = track.preview_url;
      audio.currentTime = 0;
      setCurrentTrack({ ...track, duration_ms: 30000 });
      setProgress(0);
      setDuration(30);
      setIsPlaying(true);
      startTick();
      audio.play().catch(() => {});
      return;
    }

    // Modo SDK: reproducción completa (requiere Premium)
    const uri = track.uri || `spotify:track:${track.id}`;
    await spotifyPut(`/me/player/play?device_id=${deviceId}`, { uris: [uri] });
  }, [deviceId, previewMode]);

  const togglePlay = useCallback(() => {
    if (previewMode || !deviceId) {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        startTick();
      } else {
        audio.pause();
        setIsPlaying(false);
        stopTick();
      }
      return;
    }
    playerRef.current?.togglePlay();
  }, [deviceId, previewMode]);

  const pause = useCallback(() => {
    if (previewMode || !deviceId) {
      audioRef.current?.pause();
      setIsPlaying(false);
      stopTick();
      return;
    }
    playerRef.current?.pause();
  }, [deviceId, previewMode]);

  const resume = useCallback(() => {
    if (previewMode || !deviceId) {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
      startTick();
      return;
    }
    playerRef.current?.resume();
  }, [deviceId, previewMode]);

  const seek = useCallback((seconds) => {
    if (previewMode || !deviceId) {
      if (audioRef.current) audioRef.current.currentTime = seconds;
      setProgress(seconds);
      return;
    }
    playerRef.current?.seek(Math.floor(seconds * 1000));
    setProgress(seconds);
  }, [deviceId, previewMode]);

  const previous = useCallback(() => {
    if (previewMode || !deviceId) return;
    playerRef.current?.previousTrack();
  }, [deviceId, previewMode]);

  const next = useCallback(() => {
    if (previewMode || !deviceId) return;
    playerRef.current?.nextTrack();
  }, [deviceId, previewMode]);

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
