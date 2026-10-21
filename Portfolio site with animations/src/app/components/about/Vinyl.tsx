import { motion } from "motion/react";
import { colors } from "@/app/theme/tokens";

// ── Vinyl ──────────────────────────────────────────────────────────────────────
// The record, built from the Figma spec (428px disc): album art + duo noise, then the
// centre label - grey ring (150), pale ring (118, 1px border), dashed ring (110, 7px),
// white spindle (88). Every size is a share of the disc, so the 160px phone disc matches.
// The art, noise and label spin; the drop shadow and the -2/-2 inner highlight stay put,
// like light on a real record.

// Duo noise (Figma "Noise / Duo": 0.5 size, 100% density, black 25% + white 25%): every
// pixel is either black or white at 25% alpha.
const NOISE_URL = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n' x='0' y='0' width='100%' height='100%'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='1' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/>" +
  "<feComponentTransfer><feFuncR type='discrete' tableValues='0 1'/><feFuncG type='discrete' tableValues='0 1'/>" +
  "<feFuncB type='discrete' tableValues='0 1'/><feFuncA type='linear' slope='0' intercept='0.25'/></feComponentTransfer>" +
  "</filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"
).replace(/%2523/g, "%23")}")`;

const VINYL_LABEL = [
  // [diameter in Figma px, styles]
  [150, { background: "#9799A5" }],
  [118, { background: "#CAC4C8", border: "1px solid #ABA7AB" }],
  [88, { background: colors.white }],
  [110, { borderStyle: "dashed", borderColor: "#B2A9AF", borderWidthPx: 7 }],
] as const;

export function Vinyl({ size, art, spinning }: { size: number; art: string; spinning: boolean }) {
  const k = size / 428;
  const round: React.CSSProperties = { position: "absolute", borderRadius: "50%", boxSizing: "border-box" };
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", boxShadow: `0px ${4 * k}px ${4 * k}px rgba(0,0,0,0.2)` }}>
      <motion.div
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={spinning ? { duration: 12, repeat: Infinity, ease: "linear" } : { duration: 0.6, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}
      >
        <img src={art} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: NOISE_URL, backgroundSize: "128px 128px" }} />
        {VINYL_LABEL.map(([d, st], i) => {
          const { borderWidthPx, ...rest } = st as Record<string, string | number> & { borderWidthPx?: number };
          return (
            <div
              key={i}
              aria-hidden="true"
              style={{
                ...round,
                ...rest,
                ...(borderWidthPx ? { borderWidth: Math.max(1, borderWidthPx * k) } : {}),
                width: `${(d / 428) * 100}%`, height: `${(d / 428) * 100}%`,
                left: `${((428 - d) / 2 / 428) * 100}%`, top: `${((428 - d) / 2 / 428) * 100}%`,
              }}
            />
          );
        })}
      </motion.div>
      {/* Inner highlight: inset -2/-2 white 25%, fixed while the disc turns */}
      <div aria-hidden="true" style={{ ...round, inset: 0, pointerEvents: "none", boxShadow: `inset ${-2 * Math.max(k, 0.5)}px ${-2 * Math.max(k, 0.5)}px 0px rgba(255,255,255,0.25)` }} />
    </div>
  );
}
