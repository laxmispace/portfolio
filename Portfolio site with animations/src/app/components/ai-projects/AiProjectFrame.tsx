import type { CSSProperties } from "react";
import type { AiProjectFrameKey } from "@/app/data/aiProjects";
import "./AiProjectFrame.css";

import gridPiano from "@/assets/ai-projects/grid-piano.svg";
import gridJobTracker from "@/assets/ai-projects/grid-job-tracker.svg";
import gridBreathingLeft from "@/assets/ai-projects/grid-breathing-left.svg";
import gridBreathingRight from "@/assets/ai-projects/grid-breathing-right.svg";
import logoJobTracker from "@/assets/ai-projects/logo-job-tracker.svg";

import pianoImg from "@/assets/ai-projects/piano.png";
import jobTrackerImg from "@/assets/ai-projects/job-tracker.png";
import breathingImg from "@/assets/ai-projects/breathing.png";
import { colors } from "@/app/theme/tokens";

// The decorative grid is authored at 240×240 with 30px cells. On web it's pinned
// to the corner at its natural size and the card's `overflow: hidden` crops it.
// On mobile the grid fills the frame's full height and scales with it.
const GRID_SIZE = 240;

const GRID_STYLE: CSSProperties = {
  position: "absolute",
  top: 0,
  width: GRID_SIZE,
  height: GRID_SIZE,
  pointerEvents: "none",
  userSelect: "none",
};

const GRID_STYLE_MOBILE: CSSProperties = {
  ...GRID_STYLE,
  width: "auto",
  height: "100%",
  aspectRatio: "1 / 1",
};

const FRAME_BACKGROUND: Record<AiProjectFrameKey, string> = {
  piano: colors.orange,
  "job-tracker": colors.olive,
  breathing: colors.pink,
};

// Foreground photo placement, shared by web and mobile. Each photo keeps its natural
// aspect ratio (one side is `auto`) and is sized as a share of the frame, so it scales
// with the card instead of being cropped or blown up past it. Base transforms live in
// AiProjectFrame.css so the hover scale composes with them.
const PHOTO_STYLE: Record<AiProjectFrameKey, CSSProperties> = {
  piano: { right: "-6%", top: "50%", height: "72%", width: "auto" },
  "job-tracker": { right: "-4%", bottom: 0, width: "72%", height: "auto", borderRadius: "8px 0 0 0" },
  breathing: { left: "50%", bottom: 0, height: "84%", width: "auto" },
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
 * must carry the `ai-project-card` class.
 */
export function AiProjectFrame({
  frameKey,
  isMobile = false,
}: {
  frameKey: AiProjectFrameKey;
  isMobile?: boolean;
}) {
  const photo = PHOTO_STYLE[frameKey];
  const grid = isMobile ? GRID_STYLE_MOBILE : GRID_STYLE;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: FRAME_BACKGROUND[frameKey],
        overflow: "hidden",
      }}
    >
      {frameKey === "piano" && (
        <>
          <FrameImg src={gridPiano} style={{ ...grid, left: 0 }} />
          <FrameImg src={pianoImg} className="ai-project-card__photo ai-project-card__photo--piano" style={photo} />
        </>
      )}

      {frameKey === "job-tracker" && (
        <>
          <FrameImg src={gridJobTracker} style={{ ...grid, left: 0 }} />
          <FrameImg src={jobTrackerImg} className="ai-project-card__photo ai-project-card__photo--job-tracker" style={photo} />
          <FrameImg
            src={logoJobTracker}
            style={
              isMobile
                ? { top: "8.33%", right: "5.67%", width: "13.6%", height: "auto" } // 20, 20, 48 on a 353×240 card
                : { top: 20, right: 20, width: 48, height: "auto" }
            }
          />
        </>
      )}

      {frameKey === "breathing" && (
        <>
          <FrameImg src={gridBreathingLeft} style={{ ...grid, left: 0 }} />
          <FrameImg src={gridBreathingRight} style={{ ...grid, right: 0 }} />
          <FrameImg src={breathingImg} className="ai-project-card__photo ai-project-card__photo--breathing" style={photo} />
        </>
      )}
    </div>
  );
}
