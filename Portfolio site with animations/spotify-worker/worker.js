// Cloudflare Worker: serves what Laxmi is listening to on Spotify, so every visitor
// to the portfolio sees it without logging in. Holds her refresh token as a secret
// and only ever READS (now playing, else the last played track) - visitors can't
// control her Spotify through it.
//
// Secrets (wrangler secret put …): SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
// SPOTIFY_REFRESH_TOKEN (from scripts/spotify-refresh-token.mjs).
//
// GET / → { source: "now" | "recent" | "none", track: { name, artist, albumArt,
//            durationMs, progressMs, isPlaying, url } | null, playedAt? }

const ALLOWED_ORIGINS = [
  /^https:\/\/laxmispace\.github\.io$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

let cachedToken = { value: "", expiresAt: 0 };

async function accessToken(env) {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt - 30_000) return cachedToken.value;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: env.SPOTIFY_REFRESH_TOKEN }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

function shapeTrack(item, progressMs, isPlaying) {
  return {
    name: item.name,
    artist: (item.artists || []).map((a) => a.name).join(", "),
    albumArt: item.album?.images?.[0]?.url ?? null,
    durationMs: item.duration_ms,
    progressMs: progressMs ?? 0,
    isPlaying: !!isPlaying,
    url: item.external_urls?.spotify ?? null,
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.some((r) => r.test(origin)) ? origin : "https://laxmispace.github.io",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      Vary: "Origin",
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=10",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers });
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

    try {
      const auth = { headers: { Authorization: `Bearer ${await accessToken(env)}` } };

      const now = await fetch("https://api.spotify.com/v1/me/player/currently-playing", auth);
      if (now.status === 200) {
        const d = await now.json();
        if (d?.item && d.currently_playing_type === "track") {
          return json({ source: "now", track: shapeTrack(d.item, d.progress_ms, d.is_playing) });
        }
      }

      const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", auth);
      if (recent.ok) {
        const item = (await recent.json()).items?.[0];
        if (item) return json({ source: "recent", track: shapeTrack(item.track, 0, false), playedAt: item.played_at });
      }
      return json({ source: "none", track: null });
    } catch {
      return json({ error: "spotify_unavailable" }, 502);
    }
  },
};
