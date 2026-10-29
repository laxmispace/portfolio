import { Volume2 } from "lucide-react";
import { useSpotifyPlayer } from "@/app/hooks/useSpotifyPlayer";
import vinylDisc from "@/assets/vinyl-player/vinyl-disc.png";
import { colors, withAlpha } from "@/app/theme/tokens";
import { PrimaryButton } from "@/app/components/ui/Buttons";
import { Vinyl } from "./Vinyl";

/** The player's colours. The About page uses the site palette; the lab passes a grey one. */
export interface PlayerTone {
  surface: string;
  line: string;
  ink: string;
  muted: string;
  accent: string;
  track: string;
  spindle?: string;
  artFilter?: string;
}

export const SITE_TONE: PlayerTone = {
  surface: colors.sand,
  line: colors.sandLine,
  ink: colors.ink,
  muted: colors.oliveDeep,
  accent: colors.orange,
  track: colors.olive,
};

// ── MusicPlayerCard ──────────────────────────────────────────────────────────────
// Connected to the real Spotify account authorized in this browser - shows
// whatever is actually playing and controls that real playback (play/pause,
// seek). Spotify's control endpoints require Premium and an active device.

function formatTrackTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** `tile`: a small upright card for a phone, made to sit half-width beside the GitHub card. */
export function MusicPlayerCard({ isMobile, tone: t = SITE_TONE, tile = false }: { isMobile: boolean; tone?: PlayerTone; tile?: boolean }) {
  const { status, track, errorMessage, connect, disconnect, togglePlay, seek, isPublic } = useSpotifyPlayer();
  const artSrc = track?.albumArt || vinylDisc;
  const spinning = !!track?.isPlaying;
  // "Now playing" while a track is on, "Last played" when nothing is.
  const stateLabel = track ? (track.recent ? "Last played" : track.isPlaying ? "Now playing" : "Paused") : "";
  const playLabel = isPublic ? "Listen on Spotify" : track?.isPlaying ? "Pause" : "Play";

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!track || isPublic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width;
    seek(ratio * track.durationMs);
  };

  const notPlayingState = (
    <div style={{ textAlign: "center", padding: isMobile ? "8px 20px" : 0 }}>
      {status === "no-playback" ? (
        <>
          <p className="font-inclusive-sans" style={{ fontSize: 13, color: t.muted }}>Nothing playing right now</p>
          <p className="font-inclusive-sans" style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>Check back in a bit</p>
          {!isPublic && (
            <button onClick={disconnect} className="font-inclusive-sans" style={{ fontSize: 10, color: t.muted, background: "none", border: "none", cursor: "pointer", marginTop: 10, textDecoration: "underline" }}>
              disconnect spotify
            </button>
          )}
        </>
      ) : status === "connecting" ? (
        <p className="font-inclusive-sans" style={{ fontSize: 13, color: t.muted }}>Connecting…</p>
      ) : isPublic ? (
        // Public mode never asks visitors to log in - just a quiet retry note.
        <p className="font-inclusive-sans" style={{ fontSize: 13, color: t.muted }}>
          {status === "error" ? "Couldn't reach Spotify - trying again" : "Loading…"}
        </p>
      ) : (
        <>
          <p className="font-inclusive-sans" style={{ fontSize: 12, color: t.muted, marginBottom: 12 }}>
            {status === "error" ? errorMessage : "See what I'm actually listening to"}
          </p>
          <PrimaryButton onClick={connect}>connect spotify</PrimaryButton>
        </>
      )}
    </div>
  );

  if (tile) {
    // Half-width tile: the disc peeking down from the top, the track and a play button under it.
    return (
      <div style={{ position: "relative", width: "100%", height: 220, borderRadius: 16, overflow: "hidden", backgroundColor: t.surface, border: `1px solid ${t.line}`, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ position: "absolute", top: -96, left: "50%", transform: "translateX(-50%)" }}>
          <Vinyl size={190} art={artSrc} spinning={spinning} spindle={t.spindle} artFilter={t.artFilter} />
        </div>
        {status === "connected" && track ? (
          <div style={{ position: "relative", padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <p className="font-inclusive-sans" style={{ fontSize: 9, lineHeight: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: t.accent, marginBottom: 2 }}>
                {stateLabel}
              </p>
              <p className="font-caslon not-italic" style={{ fontSize: 15, lineHeight: "19px", letterSpacing: "-0.02em", fontWeight: 600, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {track.name}
              </p>
              <p className="font-inclusive-sans" style={{ fontSize: 10, lineHeight: "13px", letterSpacing: "0.02em", textTransform: "uppercase", color: t.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {track.artist}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={togglePlay}
                aria-label={playLabel}
                title={playLabel}
                style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: withAlpha(t.muted, 0.2), border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {track.isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="3" width="3" height="10" rx="1" fill={t.muted} />
                    <rect x="9" y="3" width="3" height="10" rx="1" fill={t.muted} />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3L13 8L5 13V3Z" fill={t.muted} />
                  </svg>
                )}
              </button>
              <div onClick={handleSeek} style={{ position: "relative", flex: 1, height: 8, display: "flex", alignItems: "center", cursor: isPublic ? "default" : "pointer" }}>
                <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: t.track, borderRadius: 2 }} />
                <div style={{ position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: t.accent, width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative", paddingBottom: 16 }}>{notPlayingState}</div>
        )}
      </div>
    );
  }

  if (isMobile) {
    // Mobile: slim horizontal bar, album art peeking from the left edge.
    return (
      <div style={{ position: "relative", width: "100%", height: 120, borderRadius: 16, overflow: "hidden", backgroundColor: t.surface, border: `1px solid ${t.line}` }}>
        {status === "connected" && track ? (
          <>
            <div style={{ position: "absolute", left: -81, top: "calc(50% - 80px)" }}>
              <Vinyl size={160} art={artSrc} spinning={spinning} spindle={t.spindle} artFilter={t.artFilter} />
            </div>

            <div style={{ position: "absolute", left: 103, right: 16, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-inclusive-sans" style={{ fontSize: 9, lineHeight: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: t.accent, marginBottom: 2 }}>
                    {stateLabel}
                  </p>
                  <p className="font-inclusive-sans" style={{ fontSize: 10, lineHeight: "12px", letterSpacing: "0.02em", textTransform: "uppercase", color: t.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.artist}
                  </p>
                  <p className="font-caslon not-italic" style={{ fontSize: 14, lineHeight: "18px", letterSpacing: "-0.02em", fontWeight: 600, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.name}
                  </p>
                </div>
                <button
                  onClick={togglePlay}
                  aria-label={playLabel}
                  title={playLabel}
                  style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: withAlpha(t.muted, 0.2), border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {track.isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="4" y="3" width="3" height="10" rx="1" fill={t.muted} />
                      <rect x="9" y="3" width="3" height="10" rx="1" fill={t.muted} />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 3L13 8L5 13V3Z" fill={t.muted} />
                    </svg>
                  )}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div onClick={handleSeek} style={{ position: "relative", height: 6, display: "flex", alignItems: "center", cursor: isPublic ? "default" : "pointer" }}>
                  <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: t.track, borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: t.accent, width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%` }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="font-inclusive-sans" style={{ fontSize: 8, lineHeight: "10px", color: t.muted }}>
                    {formatTrackTime(track.progressMs)} / {formatTrackTime(track.durationMs)}
                  </p>
                  <Volume2 size={16} color={t.muted} />
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="font-inclusive-sans" style={{ position: "absolute", bottom: 4, left: 103, fontSize: 9, color: t.accent }}>{errorMessage}</p>
            )}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {notPlayingState}
          </div>
        )}
      </div>
    );
  }

  // Desktop: vinyl peeking from the top, spins continuously.
  return (
    <div
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        backgroundColor: t.surface, border: `1px solid ${t.line}`,
        height: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      {/* Disc: 428px, peeking from the top (Figma: left -18, top -216) */}
      <div style={{ position: "absolute", top: -216, left: "50%", transform: "translateX(-50%)" }}>
        <Vinyl size={428} art={artSrc} spinning={spinning} spindle={t.spindle} artFilter={t.artFilter} />
      </div>

      <div style={{ padding: "0 28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {status === "connected" && track ? (
          <>
            <div style={{ textAlign: "center" }}>
              <p className="font-inclusive-sans" style={{ fontSize: 10, lineHeight: "14px", letterSpacing: "0.06em", textTransform: "uppercase", color: t.accent, marginBottom: 6 }}>
                {stateLabel}
              </p>
              <p className="font-inclusive-sans" style={{ fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: t.muted }}>
                {track.artist}
              </p>
              <p className="font-caslon not-italic" style={{ fontSize: 24, fontWeight: 600, color: t.ink, marginTop: 4 }}>
                {track.name}
              </p>
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={togglePlay}
                aria-label={playLabel}
                  title={playLabel}
                style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: t.muted }}
              >
                {track.isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="2" width="3" height="12" rx="1" fill="currentColor" />
                    <rect x="10" y="2" width="3" height="12" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3L13 8L5 13V3Z" fill="currentColor" />
                  </svg>
                )}
              </button>
              <div onClick={handleSeek} style={{ position: "relative", flex: 1, height: 10, display: "flex", alignItems: "center", cursor: isPublic ? "default" : "pointer" }}>
                <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: t.track, borderRadius: 2 }} />
                <div
                  style={{
                    position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: t.accent,
                    width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%`,
                  }}
                />
              </div>
              <p className="font-inclusive-sans" style={{ fontSize: 12, color: t.ink, whiteSpace: "nowrap", flexShrink: 0 }}>
                {formatTrackTime(track.progressMs)} <span style={{ color: t.muted }}>/ {formatTrackTime(track.durationMs)}</span>
              </p>
            </div>
            {errorMessage && (
              <p className="font-inclusive-sans" style={{ fontSize: 11, color: t.accent, textAlign: "center", marginTop: -12 }}>{errorMessage}</p>
            )}
            {!isPublic && (
              <button onClick={disconnect} className="font-inclusive-sans" style={{ fontSize: 10, color: t.muted, background: "none", border: "none", cursor: "pointer", marginTop: -12, textDecoration: "underline" }}>
                disconnect spotify
              </button>
            )}
          </>
        ) : (
          notPlayingState
        )}
      </div>
    </div>
  );
}
