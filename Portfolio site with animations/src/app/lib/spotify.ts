// Spotify auth via Authorization Code + PKCE - no client secret needed, so it's
// safe to run entirely in the browser. Redirect URI must match exactly what's
// registered in the Spotify Developer Dashboard.

const CLIENT_ID = "e9c291e9a2ce4b40ab8d4f38b411d1f4";
// Return to wherever the site is running: https://laxmispace.github.io/portfolio/ live,
// http://127.0.0.1:5173/portfolio/ locally. Both must be listed as Redirect URIs in the
// Spotify app (Spotify rejects "localhost", so open the local preview via 127.0.0.1).
const REDIRECT_URI = new URL(import.meta.env.BASE_URL, window.location.origin).href;
const SCOPES = ["user-read-currently-playing", "user-read-playback-state", "user-modify-playback-state"].join(" ");

const STORAGE_KEYS = {
  verifier: "spotify_pkce_verifier",
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expiresAt: "spotify_expires_at",
};

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

export async function redirectToSpotifyAuth() {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem(STORAGE_KEYS.verifier, verifier);
  // Reopen the About Me drawer (where the player lives) after the redirect back.
  sessionStorage.setItem("spotify_reopen_about", "1");
  const challenge = await generateCodeChallenge(verifier);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function storeTokens(data: { access_token: string; refresh_token?: string; expires_in: number }) {
  localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
  if (data.refresh_token) localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
  localStorage.setItem(STORAGE_KEYS.expiresAt, String(Date.now() + data.expires_in * 1000));
}

// Exchanges an ?code=... from the URL for tokens, if present. Always strips the
// auth params from the URL afterward. Returns true if a token was obtained.
export async function handleSpotifyRedirect(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return false;

  const verifier = sessionStorage.getItem(STORAGE_KEYS.verifier);
  sessionStorage.removeItem(STORAGE_KEYS.verifier);

  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, "", url.toString());

  if (!verifier) return false;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) return false;
  storeTokens(await res.json());
  return true;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: CLIENT_ID, grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  if (!res.ok) {
    disconnectSpotify();
    return null;
  }
  const data = await res.json();
  storeTokens(data);
  return data.access_token as string;
}

export async function getValidAccessToken(): Promise<string | null> {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.expiresAt) || 0);
  if (token && Date.now() < expiresAt - 30_000) return token;
  return refreshAccessToken();
}

export function isSpotifyConnected(): boolean {
  return !!localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function disconnectSpotify() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.expiresAt);
}
