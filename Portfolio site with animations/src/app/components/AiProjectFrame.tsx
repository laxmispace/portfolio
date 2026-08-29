import type { CSSProperties } from "react";
import type { AiProjectFrameKey } from "../data/aiProjects";
import "./AiProjectFrame.css";

import gridPiano from "../../assets/ai-projects/grid-piano.svg";
import gridJobTracker from "../../assets/ai-projects/grid-job-tracker.svg";
import gridBreathingLeft from "../../assets/ai-projects/grid-breathing-left.svg";
import gridBreathingRight from "../../assets/ai-projects/grid-breathing-right.svg";
import logoJobTracker from "../../assets/ai-projects/logo-job-tracker.svg";

import pianoImg from "../../assets/ai-projects/piano.png";
import jobTrackerImg from "../../assets/ai-projects/job-tracker.png";
import breathingImg from "../../assets/ai-projects/breathing.png";

// The left-aligned decorative grid is authored at 240×240 with 30px cells.
// It's pinned to the top-left corner at its natural size so the cells stay a
// consistent size regardless of how tall the card is; the card's own
// `overflow: hidden` clips whatever falls outside. On the 240px-tall mobile
// frame that's the whole thing; on the taller/shorter web frame it just crops.
const GRID_SIZE = 240;

const gridBase: CSSProperties = {
  position: "absolute",
  top: 0,
  width: GRID_SIZE,
  height: GRID_SIZE,
  pointerEvents: "none",
  userSelect: "none",
};

const FRAME_BG: Record<AiProjectFrameKey, string> = {
  piano: "#C67D39",
  "job-tracker": "#C3BE6F",
  breathing: "#DDA1AE",
};

// Foreground photo placement. Web is tuned by eye against the flexing card;
// mobile follows the 328×240 design frame (percentages so it tracks the real
// card width). Base transforms live in AiProjectFrame.css so the hover scale
// can compose with them without the two fighting over `transform`.
const PHOTO: Record<AiProjectFrameKey, { web: CSSProperties; mobile: CSSProperties }> = {
  piano: {
    web: { right: "-6%", top: "50%", height: "72%", width: "auto" },
    mobile: { right: "-18.3%", top: "50%", width: "97.6%", height: "61.7%", objectFit: "cover" },
  },
  "job-tracker": {
    web: { right: "-4%", bottom: 0, width: "72%", height: "auto", borderRadius: "8px 0 0 0" },
    mobile: {
      right: "-41.2%",
      bottom: "-33.75%",
      width: "122.9%",
      height: "108.3%",
      objectFit: "cover",
      objectPosition: "top left",
      borderRadius: "8px 0 0 0",
    },
  },
  breathing: {
    web: { left: "50%", bottom: 0, height: "84%", width: "auto" },
    mobile: {
      left: "50%",
      top: 34,
      width: "44.5%",
      height: "109.2%",
      objectFit: "cover",
      border: "2px solid #FFFFFF",
      borderRadius: "8px 8px 0 0",
      boxSizing: "border-box",
    },
  },
};

function FrameImg({ src, style, className }: { src: string; style: CSSProperties; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
      style={{ position: "absolute", pointerEvents: "none", userSelect: "none", ...style }}
    />
  );
}

/**
 * The decorative artwork that fills an AI-project card's image area.
 * Fills its positioned parent (which is expected to set `overflow: hidden`
 * and the border radius). For the hover-scale interaction the parent card
 * must carry the `aipf-card` class.
 */
export function AiProjectFrame({
  frameKey,
  isMobile = false,
}: {
  frameKey: AiProjectFrameKey;
  isMobile?: boolean;
}) {
  const photo = isMobile ? PHOTO[frameKey].mobile : PHOTO[frameKey].web;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: FRAME_BG[frameKey],
        overflow: "hidden",
      }}
    >
      {frameKey === "piano" && (
        <>
          <FrameImg src={gridPiano} style={{ ...gridBase, left: 0 }} />
          <FrameImg src={pianoImg} className="aipf-photo aipf-photo--piano" style={photo} />
        </>
      )}

      {frameKey === "job-tracker" && (
        <>
          <FrameImg src={gridJobTracker} style={{ ...gridBase, left: 0 }} />
          <FrameImg src={jobTrackerImg} className="aipf-photo aipf-photo--job" style={photo} />
          <FrameImg
            src={logoJobTracker}
            style={
              isMobile
                ? { top: 20, right: 19.78, width: 32.22, height: "auto" }
                : { top: 20, right: 20, width: 48, height: "auto" }
            }
          />
        </>
      )}

      {frameKey === "breathing" && (
        <>
          <FrameImg src={gridBreathingLeft} style={{ ...gridBase, left: 0 }} />
          <FrameImg src={gridBreathingRight} style={{ ...gridBase, right: 0 }} />
          <FrameImg src={breathingImg} className="aipf-photo aipf-photo--breathing" style={photo} />
        </>
      )}
    </div>
  );
}
