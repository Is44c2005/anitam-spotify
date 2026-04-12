import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());
  const intervalRef = useRef(null);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const play = useCallback((track) => {
    const audio = audioRef.current;

    if (!track.preview_url) return;

    if (currentTrack?.id === track.id) {
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    clearProgressInterval();
    audio.pause();
    audio.src = track.preview_url;
    audio.volume = 0.7;
    setCurrentTrack(track);
    setProgress(0);
    setDuration(30);

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    audioRef.current.play();
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else if (currentTrack) resume();
  }, [isPlaying, currentTrack, pause, resume]);

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.pause();
      clearProgressInterval();
    };
  }, []);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  return (
    <PlayerContext.Provider
      value={{ currentTrack, isPlaying, progress, duration, play, pause, resume, togglePlay, seek }}
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
