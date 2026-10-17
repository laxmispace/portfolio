// One-time helper: gets the Spotify refresh token the Cloudflare Worker uses to read
// what you're listening to. Run it locally, approve in the browser, copy the token.
//
//   SPOTIFY_CLIENT_ID=… SPOTIFY_CLIENT_SECRET=… node scripts/spotify-refresh-token.mjs
//
// First add http://127.0.0.1:8888/callback as a Redirect URI in the Spotify app
// (developer.spotify.com/dashboard → your app → Settings).
import http from "node:http";
import { exec } from "node:child_process";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.");
  process.exit(1);
}
const REDIRECT = "http://127.0.0.1:8888/callback";
const SCOPES = "user-read-currently-playing user-read-playback-state user-read-recently-played";

const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: id, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES,
})}`;

http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/callback") return res.end();
  const code = url.searchParams.get("code");
  if (!code) { res.end("No code - did you cancel?"); return; }
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT }),
  });
  const data = await tokenRes.json();
  if (!data.refresh_token) {
    res.end("Spotify didn't return a refresh token - check the terminal.");
    console.error(data);
    process.exit(1);
  }
  res.end("Done - you can close this tab and go back to the terminal.");
  console.log("\nSPOTIFY_REFRESH_TOKEN:\n" + data.refresh_token + "\n");
  process.exit(0);
}).listen(8888, "127.0.0.1", () => {
  console.log("Opening Spotify to approve access…\n" + authUrl);
  exec(`open -a "Google Chrome" "${authUrl}" || open "${authUrl}"`);
});
