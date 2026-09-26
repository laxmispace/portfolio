import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// Real <audio> playback for a pre-generated voiceover file. `available` goes false
// if the file 404s (e.g. narration hasn't been generated yet for this slug), so
// callers can grey out the play button instead of showing a silently broken one.
export function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAvailable(true);

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);
    const onError = () => setAvailable(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !available) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setAvailable(false));
    }
  }, [playing, available]);

  const seekToFraction = useCallback(
    (fraction: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = Math.min(Math.max(fraction, 0), 1) * duration;
    },
    [duration]
  );

  return {
    playing,
    toggle,
    seekToFraction,
    available,
    currentTime,
    progress: duration > 0 ? currentTime / duration : 0,
    timeLabel: `${formatTime(currentTime)} / ${formatTime(duration)}`,
  };
}
