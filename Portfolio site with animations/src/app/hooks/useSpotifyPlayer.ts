import { useCallback, useEffect, useRef, useState } from "react";
import {
  disconnectSpotify,
  getValidAccessToken,
  handleSpotifyRedirect,
  isSpotifyConnected,
  redirectToSpotifyAuth,
} from "@/app/lib/spotify";
import { SPOTIFY_NOW_PLAYING_URL } from "@/app/lib/links";

export interface SpotifyTrack {
  name: string;
  artist: string;
  albumArt: string | null;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
  url: string | null;
  /** Nothing is playing right now - this is the last track played. */
  recent: boolean;
}

export type SpotifyStatus = "disconnected" | "connecting" | "connected" | "no-playback" | "error";

const POLL_MS = 8000;
const PUBLIC_POLL_MS = 15000;

type ApiTrackItem = {
  name: string;
  artists?: { name: string }[];
  album?: { images?: { url: string }[] };
  duration_ms: number;
  external_urls?: { spotify?: string };
};

function toTrack(item: ApiTrackItem, progressMs: number, isPlaying: boolean, recent: boolean): SpotifyTrack {
  return {
    name: item.name,
    artist: (item.artists || []).map((a) => a.name).join(", "),
    albumArt: item.album?.images?.[0]?.url ?? null,
    durationMs: item.duration_ms,
    progressMs,
    isPlaying,
    url: item.external_urls?.spotify ?? null,
    recent,
  };
}

/**
 * Two modes:
 *  - Public (SPOTIFY_NOW_PLAYING_URL set): reads Laxmi's own listening from the
 *    Cloudflare Worker, so every visitor sees it with no login. Read-only - the play
 *    button opens the track on Spotify instead of controlling her player.
 *  - Personal (no Worker yet): the visitor connects their own Spotify in this browser.
 * Either way, when nothing is playing it shows the last played track.
 */
export function useSpotifyPlayer() {
  const isPublic = !!SPOTIFY_NOW_PLAYING_URL;
  const [status, setStatus] = useState<SpotifyStatus>("connecting");
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showTrack = useCallback((t: SpotifyTrack | null) => {
    setTrack(t);
    setStatus(t ? "connected" : "no-playback");
    setErrorMessage(null);
  }, []);

  const fetchPublic = useCallback(async () => {
    try {
      const res = await fetch(SPOTIFY_NOW_PLAYING_URL);
      if (!res.ok) throw new Error();
      const data = await res.json();
      showTrack(data.track ? { ...data.track, recent: data.source === "recent" } : null);
    } catch {
      // Keep whatever was showing; only surface an error if there's nothing to show.
      setTrack((t) => { if (!t) setStatus("error"); return t; });
      setErrorMessage("Couldn't reach Spotify.");
    }
  }, [showTrack]);

  const fetchPersonal = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) {
      setStatus("disconnected");
      setTrack(null);
      return;
    }
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player", auth);
      if (res.status !== 204 && !res.ok) throw new Error();
      const data = res.status === 204 ? null : await res.json();
      if (data?.item) {
        showTrack(toTrack(data.item, data.progress_ms ?? 0, !!data.is_playing, false));
        return;
      }
      // Nothing playing: fall back to the last played track.
      const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", auth);
      const item = recent.ok ? (await recent.json()).items?.[0]?.track : null;
      showTrack(item ? toTrack(item, 0, false, true) : null);
    } catch {
      setStatus("error");
      setErrorMessage("Couldn't reach Spotify.");
    }
  }, [showTrack]);

  const fetchNowPlaying = isPublic ? fetchPublic : fetchPersonal;

  // Initial load. Personal mode first consumes ?code=... from an OAuth redirect.
  useEffect(() => {
    (async () => {
      setStatus("connecting");
      if (isPublic) { await fetchPublic(); return; }
      const justConnected = await handleSpotifyRedirect();
      if (justConnected || isSpotifyConnected()) await fetchPersonal();
      else setStatus("disconnected");
    })();
  }, [isPublic, fetchPublic, fetchPersonal]);

  // Poll playback state while there's something to poll.
  useEffect(() => {
    if (status === "disconnected" || status === "connecting") return;
    pollRef.current = setInterval(fetchNowPlaying, isPublic ? PUBLIC_POLL_MS : POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, fetchNowPlaying, isPublic]);

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

  const openOnSpotify = useCallback(() => {
    if (track?.url) window.open(track.url, "_blank", "noopener,noreferrer");
  }, [track?.url]);

  const togglePlay = useCallback(() => {
    if (isPublic) openOnSpotify();
    else if (track?.isPlaying) callPlayback("/me/player/pause", "PUT");
    else callPlayback("/me/player/play", "PUT");
  }, [isPublic, openOnSpotify, track?.isPlaying, callPlayback]);

  const seek = useCallback(
    (ms: number) => {
      if (isPublic) return;
      callPlayback(`/me/player/seek?position_ms=${Math.round(ms)}`, "PUT");
      setTrack((t) => (t ? { ...t, progressMs: ms } : t));
    },
    [isPublic, callPlayback]
  );

  return { status, track, errorMessage, connect, disconnect, togglePlay, seek, isPublic };
}
