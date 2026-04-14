import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { getValidToken, isAuthenticated } from '../utils/spotify';

const PlayerContext = createContext(null);
const BASE = 'https://api.spotify.com/v1';

async function spotifyFetch(path, { method = 'GET', body } = {}) {
  const token = await getValidToken();
  if (!token) return null;
  return fetch(`${BASE}${path}`, {
    method,
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deviceId, setDeviceId] = useState(null);
  const [volume, setVolumeState] = useState(0.7);
  const [previewMode, setPreviewMode] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

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
    tickRef.current = setInterval(() => setProgress((p) => p + 1), 1000);
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
    setSdkReady(false);
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
  }

  function getAudio() {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = volume;
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
        if (t) cb(t);
      },
      volume,
    });

    player.addListener('ready', async ({ device_id }) => {
      setDeviceId(device_id);
      setSdkReady(true);
      try {
        await spotifyFetch('/me/player', {
          method: 'PUT',
          body: { device_ids: [device_id], play: false },
        });
      } catch {
        // ignore — happens when no active session yet
      }
    });

    player.addListener('not_ready', () => {
      setSdkReady(false);
    });

    player.addListener('player_state_changed', syncState);
    player.addListener('account_error', enablePreviewMode);
    player.addListener('initialization_error', enablePreviewMode);
    player.addListener('authentication_error', enablePreviewMode);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(async (track, options = {}) => {
    if (!track) return;

    if (previewMode || !sdkReady || !deviceId) {
      if (!track.preview_url) return;
      const audio = getAudio();
      audio.src = track.preview_url;
      audio.currentTime = 0;
      audio.volume = volume;
      setCurrentTrack({ ...track, duration_ms: 30000 });
      setProgress(0);
      setDuration(30);
      setIsPlaying(true);
      startTick();
      audio.play().catch(() => {});
      return;
    }

    const trackUri = track.uri || `spotify:track:${track.id}`;
    const body = options.contextUri
      ? { context_uri: options.contextUri, offset: { uri: trackUri } }
      : { uris: [trackUri] };

    const res = await spotifyFetch(`/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body,
    });
    if (res && !res.ok && res.status !== 202 && res.status !== 204) {
      console.warn('Playback request failed:', res.status);
    }
  }, [deviceId, sdkReady, previewMode, volume]);

  const togglePlay = useCallback(() => {
    if (previewMode || !sdkReady) {
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
  }, [sdkReady, previewMode]);

  const pause = useCallback(() => {
    if (previewMode || !sdkReady) {
      audioRef.current?.pause();
      setIsPlaying(false);
      stopTick();
      return;
    }
    playerRef.current?.pause();
  }, [sdkReady, previewMode]);

  const resume = useCallback(() => {
    if (previewMode || !sdkReady) {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
      startTick();
      return;
    }
    playerRef.current?.resume();
  }, [sdkReady, previewMode]);

  const seek = useCallback((seconds) => {
    if (previewMode || !sdkReady) {
      if (audioRef.current) audioRef.current.currentTime = seconds;
      setProgress(seconds);
      return;
    }
    playerRef.current?.seek(Math.floor(seconds * 1000));
    setProgress(seconds);
  }, [sdkReady, previewMode]);

  const previous = useCallback(() => {
    if (previewMode || !sdkReady) return;
    playerRef.current?.previousTrack();
  }, [sdkReady, previewMode]);

  const next = useCallback(() => {
    if (previewMode || !sdkReady) return;
    playerRef.current?.nextTrack();
  }, [sdkReady, previewMode]);

  const setVolume = useCallback((v) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
    playerRef.current?.setVolume(clamped);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, isPlaying, progress, duration, deviceId,
        volume, sdkReady, previewMode,
        play, pause, resume, togglePlay, seek, previous, next, setVolume,
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
