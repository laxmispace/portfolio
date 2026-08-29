import { useCallback, useEffect, useRef, useState } from "react";
import {
  disconnectSpotify,
  getValidAccessToken,
  handleSpotifyRedirect,
  isSpotifyConnected,
  redirectToSpotifyAuth,
} from "@/app/lib/spotify";

export interface SpotifyTrack {
  name: string;
  artist: string;
  albumArt: string | null;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
}

export type SpotifyStatus = "disconnected" | "connecting" | "connected" | "no-playback" | "error";

const POLL_MS = 8000;

export function useSpotifyPlayer() {
  const [status, setStatus] = useState<SpotifyStatus>("connecting");
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) {
      setStatus("disconnected");
      setTrack(null);
      return;
    }
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) {
        setStatus("no-playback");
        setTrack(null);
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setErrorMessage("Couldn't reach Spotify.");
        return;
      }
      const data = await res.json();
      if (!data || !data.item) {
        setStatus("no-playback");
        setTrack(null);
        return;
      }
      const images = data.item.album?.images as { url: string }[] | undefined;
      setTrack({
        name: data.item.name,
        artist: (data.item.artists || []).map((a: { name: string }) => a.name).join(", "),
        albumArt: images?.[0]?.url ?? null,
        durationMs: data.item.duration_ms,
        progressMs: data.progress_ms ?? 0,
        isPlaying: !!data.is_playing,
      });
      setStatus("connected");
      setErrorMessage(null);
    } catch {
      setStatus("error");
      setErrorMessage("Couldn't reach Spotify.");
    }
  }, []);

  // Initial load: consume ?code=... from an OAuth redirect if present, then fetch.
  useEffect(() => {
    (async () => {
      setStatus("connecting");
      const justConnected = await handleSpotifyRedirect();
      if (justConnected || isSpotifyConnected()) {
        await fetchNowPlaying();
      } else {
        setStatus("disconnected");
      }
    })();
  }, [fetchNowPlaying]);

  // Poll real playback state periodically while connected.
  useEffect(() => {
    if (status === "disconnected" || status === "connecting") return;
    pollRef.current = setInterval(fetchNowPlaying, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, fetchNowPlaying]);

  // Smooth 1s local ticker between polls so the progress bar doesn't stutter.
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (track?.isPlaying) {
      tickRef.current = setInterval(() => {
        setTrack((t) => (t ? { ...t, progressMs: Math.min(t.progressMs + 1000, t.durationMs) } : t));
      }, 1000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.isPlaying, track?.name]);

  const connect = useCallback(() => {
    redirectToSpotifyAuth();
  }, []);

  const disconnect = useCallback(() => {
    disconnectSpotify();
    setStatus("disconnected");
    setTrack(null);
  }, []);

  const callPlayback = useCallback(
    async (path: string, method: string) => {
      const token = await getValidAccessToken();
      if (!token) return;
      const res = await fetch(`https://api.spotify.com/v1${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) setErrorMessage("Open Spotify on a device first.");
      else if (res.status === 403) setErrorMessage("Playback control needs Spotify Premium.");
      setTimeout(fetchNowPlaying, 400);
    },
    [fetchNowPlaying]
  );

  const togglePlay = useCallback(() => {
    if (track?.isPlaying) callPlayback("/me/player/pause", "PUT");
    else callPlayback("/me/player/play", "PUT");
  }, [track?.isPlaying, callPlayback]);

  const seek = useCallback(
    (ms: number) => {
      callPlayback(`/me/player/seek?position_ms=${Math.round(ms)}`, "PUT");
      setTrack((t) => (t ? { ...t, progressMs: ms } : t));
    },
    [callPlayback]
  );

  return { status, track, errorMessage, connect, disconnect, togglePlay, seek };
}
