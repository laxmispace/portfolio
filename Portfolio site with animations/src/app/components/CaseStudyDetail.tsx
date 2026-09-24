import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, Volume2 } from "lucide-react";
import { Lottie } from "lottie-react";
import { useIsMobile } from "@/app/useIsMobile";
import { useAudioPlayer } from "@/app/useAudioPlayer";

// ─── CS2 cover (ICICI FASTag) — animated cover, native size 1800×1200 (3:2) ───
import coverAnimationUrl from "../../assets/FASTag/videos/cover nw.json?url";

// Pre-generated ElevenLabs narration lives in public/audio/ (see scripts/generate-voiceovers.mjs)
// — base-aware so it resolves correctly whether served at "/" locally or "/portfolio/" on GitHub Pages.
export const caseStudyAudioUrl = (slug: string) => `${import.meta.env.BASE_URL}audio/case-study/${slug}.mp3`;

// ─── CS1 image assets (ICICI Bank iTravel) ────────────────────────────────────
import imgEntryHasCard from "../../assets/Cards - CS/1/has cc.png";
import imgEntryNoCard1 from "../../assets/Cards - CS/1/has no cc - 1.png";
import imgEntryNoCard2 from "../../assets/Cards - CS/1/has no cc - 2.png";
import imgTripSingleEmpty from "../../assets/Cards - CS/2/image 2928.png";
import imgTripSingleFilled from "../../assets/Cards - CS/2/image 2929.png";
import imgTripMultiEmpty from "../../assets/Cards - CS/2/Step 1 - 1.png";
import imgTripMultiAdded from "../../assets/Cards - CS/2/Step 1 - 2.png";
import imgTripMultiFilled from "../../assets/Cards - CS/2/Step 1 - 3.png";
import imgPrefsDefault from "../../assets/Cards - CS/3/3 -1.png";
import imgPrefsEditing from "../../assets/Cards - CS/3/3 - 2.png";
import imgPrefsFilled from "../../assets/Cards - CS/3/3 - 3.png";
import imgAutoExpiry from "../../assets/Cards - CS/3/image 2969.png";

// ─── CS2 image assets (ICICI FASTag) ──────────────────────────────────────────
import imgFastagNonIcici from "../../assets/FASTag/My FASTag/LP/1. NON UB FT.png";
import imgFastagAutoOff from "../../assets/FASTag/My FASTag/LP/2. UB + NAR.png";
import imgFastagAutoOn from "../../assets/FASTag/My FASTag/LP/3. UB + AR.png";

// Landing page — section 1 (user/landing states)
import imgLandingEmpty from "../../assets/FASTag/Landing page/Landing - Section 1/Landing-empty.png";
import imgLandingExisting from "../../assets/FASTag/Landing page/Landing - Section 1/Landing - E.png";
import imgLandingScrolled from "../../assets/FASTag/Landing page/Landing - Section 1/LPE - Scrolled.png";
import imgLandingMenuOpen from "../../assets/FASTag/Landing page/Landing - Section 1/LPE - menu open.png";

// Landing page — section 2 (the TAB decision)
import imgTabOld from "../../assets/FASTag/Landing page/TAB - Section 2/Old FT.png";
import imgTabMyFastag from "../../assets/FASTag/Landing page/TAB - Section 2/My bank FT.png";
import imgTabOtherFastag from "../../assets/FASTag/Landing page/TAB - Section 2/Other F T.png";

// Card exploration — iteration thumbnail rows
import imgIter1_1 from "../../assets/FASTag/Card exploration/Iteration - 1/1.png";
import imgIter1_2 from "../../assets/FASTag/Card exploration/Iteration - 1/2.png";
import imgIter1_3 from "../../assets/FASTag/Card exploration/Iteration - 1/3.png";
import imgIter1_4 from "../../assets/FASTag/Card exploration/Iteration - 1/4.png";
import imgIter1_5 from "../../assets/FASTag/Card exploration/Iteration - 1/5.png";
import imgIter1_6 from "../../assets/FASTag/Card exploration/Iteration - 1/6.png";
import imgIter2_1 from "../../assets/FASTag/Card exploration/Iteration - 2/1.png";
import imgIter2_2 from "../../assets/FASTag/Card exploration/Iteration - 2/2.png";
import imgIter2_3 from "../../assets/FASTag/Card exploration/Iteration - 2/3.png";
import imgIter2_4 from "../../assets/FASTag/Card exploration/Iteration - 2/4.png";
import imgIter2_5 from "../../assets/FASTag/Card exploration/Iteration - 2/5.png";
import imgIter2_6 from "../../assets/FASTag/Card exploration/Iteration - 2/6.png";
import imgIter3_1 from "../../assets/FASTag/Card exploration/Iteration - 3/1.png";
import imgIter3_2 from "../../assets/FASTag/Card exploration/Iteration - 3/2.png";
import imgIter3_3 from "../../assets/FASTag/Card exploration/Iteration - 3/3.png";
import imgIter3_4 from "../../assets/FASTag/Card exploration/Iteration - 3/4.png";
import imgIter3_5 from "../../assets/FASTag/Card exploration/Iteration - 3/5.png";

// All FASTag details — "All states"
import imgStateDownload from "../../assets/FASTag/My FASTag/All states/1. Download.png";
import imgStateFleetDropdown from "../../assets/FASTag/My FASTag/All states/2. Hover on dd multiple fts.png";
import imgStateHoverServices from "../../assets/FASTag/My FASTag/All states/3. Hover on services.png";

// Filter and email FASTag history
import imgFilterDefault from "../../assets/FASTag/My FASTag/Filter-history/1 Filter.png";
import imgFilterFilled from "../../assets/FASTag/My FASTag/Filter-history/2 Filtered.png";
import imgEmailDefault from "../../assets/FASTag/My FASTag/Email/1 default .png";
import imgEmailCalendar from "../../assets/FASTag/My FASTag/Email/2. date open.png";
import imgEmailChips from "../../assets/FASTag/My FASTag/Email/3 chip selection .png";
import imgEmailFilled from "../../assets/FASTag/My FASTag/Email/4 filled.png";
import imgEmailToast from "../../assets/FASTag/My FASTag/Email/5. Toast.png";

// FASTag recharge
import imgRechargeOld1 from "../../assets/FASTag/Recharge/OLD/1.png";
import imgRechargeOld2 from "../../assets/FASTag/Recharge/OLD/2.png";
import imgRechargeOld3 from "../../assets/FASTag/Recharge/OLD/3.png";
import imgRechargeOld4 from "../../assets/FASTag/Recharge/OLD/4.png";
import imgRechargeNew1 from "../../assets/FASTag/Recharge/NEW/1.png";
import imgRechargeNew2 from "../../assets/FASTag/Recharge/NEW/2.png";
import imgRechargeNew3 from "../../assets/FASTag/Recharge/NEW/3.png";
import imgRechargeNew4 from "../../assets/FASTag/Recharge/NEW/4.png";
import imgRechargeNew5 from "../../assets/FASTag/Recharge/NEW/5.png";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CaseStudyInfo {
  index: number;
  slug: string;
  label: string;
  color: string;
  textColor: string;
  imageBg: string;
  dotColor: string;
  title: string;
  type: string;
  role: string;
  status: string;
  year: string;
  client: string;
  designTeam: string;
  crossTeam: string;
  timeline: string;
  statusFull: string;
  overview: string;
}

// ─── Section index definitions per case study ─────────────────────────────────
const SECTIONS_BY_CS: Record<number, { id: string; label: string; noNumber?: boolean }[]> = {
  0: [
    { id: "cs-problem", label: "The problem", noNumber: true },
    { id: "cs-why", label: "Why the obvious fix wasn't enough", noNumber: true },
    { id: "cs-entry", label: "Getting users in" },
    { id: "cs-trip", label: "Declaring the trip" },
    { id: "cs-limits", label: "Setting limits" },
    { id: "cs-expiry", label: "Auto-expiring controls" },
    { id: "cs-wrapup", label: "Travel wrap-up" },
    { id: "cs-media", label: "Walkthrough" },
  ],
  1: [
    { id: "cs-intro", label: "Introduction", noNumber: true },
    { id: "cs-landing", label: "Landing page" },
    { id: "cs-card", label: "FASTag card exploration" },
    { id: "cs-details", label: "All FASTag details" },
    { id: "cs-recharge", label: "FASTag recharge" },
    { id: "cs-media", label: "Walkthrough" },
  ],
  2: [
    { id: "cs-problem", label: "Problem statement" },
    { id: "cs-process", label: "Process" },
    { id: "cs-findings", label: "Key findings" },
    { id: "cs-media", label: "Walkthrough" },
  ],
};

// ─── Data ─────────────────────────────────────────────────────────────────────
export const CASE_STUDY_DATA: CaseStudyInfo[] = [
  {
    index: 0,
    slug: "icici-bank-onboarding",
    label: "CASE STUDY 1",
    color: "#c3be6f",
    textColor: "#625e37",
    imageBg: "#d2ce93",
    dotColor: "#C3BE6F",
    title: "Redesigning how 10M+ ICICI Bank cardholders activate their card for international travel",
    type: "UX + UI",
    role: "Sole designer",
    status: "Under review",
    year: "2023",
    client: "ICICI Bank",
    designTeam: "Canvs — Harleen Chatha (Design manager), Laxmi Mahajan (Designer)",
    crossTeam: "Product Manager, Engineering, Risk & Compliance (stakeholder reviewers)",
    timeline: "2 weeks",
    statusFull: "Final design iteration complete (Currently with the client for review, pre-launch)",
    overview: "Led end-to-end redesign of ICICI Bank's international card activation for 10M+ cardholders.",
  },
  {
    index: 1,
    slug: "icici-fastag-platform",
    label: "CASE STUDY 2",
    color: "#c67d39",
    textColor: "#212012",
    imageBg: "#d19761",
    dotColor: "#C67D39",
    title: "Bringing India's most-used toll payment system to ICICI's web platform — for the first time.",
    type: "UX + UI",
    role: "Sole designer",
    status: "Ongoing",
    year: "2022–2023",
    client: "Indian Bank",
    designTeam: "Laxmi Mahajan (Designer), Harleen Chatha (Design Manager)",
    crossTeam: "Product Manager, Design Manager, Product Designer",
    timeline: "2 weeks",
    statusFull: "Under development",
    overview: "Created a token-based design system from scratch, reducing handoff time by 60% across 20+ clients.",
  },
  {
    index: 2,
    slug: "ai-design-experiments",
    label: "CASE STUDY 3",
    color: "#dda1ae",
    textColor: "#212012",
    imageBg: "#ebc7cf",
    dotColor: "#DDA1AE",
    title: "AI-assisted design experiments — compressing the exploratory phase",
    type: "UX Research + Prototyping",
    role: "Sole designer",
    status: "Under review",
    year: "2024",
    client: "Self-initiated",
    designTeam: "Laxmi Mahajan",
    crossTeam: "8 external designers (workshop participants)",
    timeline: "6 weeks",
    statusFull: "Research published, workshop format being adapted internally at Canvs",
    overview: "Explored how generative AI can augment design without stripping creative ownership — 3× faster first prototypes.",
  },
];

// ─── Shared spacing system ─────────────────────────────────────────────────────
// .cs-sections  → wraps top-level SectionBlocks: 40px between main sections
// .cs-flow      → wraps a section's content: 16px default rhythm between paragraphs,
//                 24px before a title-2/title-3, 12px after a title-2/title-3,
//                 20px between two consecutive image containers (.cs-img)
// .cs-bullets   → wraps a bullet <ul>: 8px between bullet points
// .cs-mt-*      → optional override: add alongside any child's className to force
//                 a specific margin-top instead of the default cs-flow rhythm,
//                 e.g. className="cs-t2 cs-mt-40". Scale: 4, 8, 12, 16, 20, 24, 40.
// <Spacer />    → drop it anywhere inside .cs-flow instead of reaching for margin-top.
//                 It's an empty div whose height IS the gap — the rule below cancels
//                 cs-flow's automatic rhythm on the spacer itself and on whatever comes
//                 right after it, so the space you see is exactly `size`px, never added
//                 on top of the 16px default. Scale: 4, 8, 12, 16, 20, 24, 40.
const CS_SPACING_CSS = `
  .cs-sections > * + * { margin-top: 40px; }
  .cs-flow > * + * { margin-top: 16px; }
  .cs-flow > * + .cs-t2, .cs-flow > * + .cs-t3 { margin-top: 24px; }
  .cs-flow > .cs-t2 + *, .cs-flow > .cs-t3 + * { margin-top: 16px; }
  .cs-flow > .cs-p + .cs-p { margin-top: 20px; }
  .cs-flow > * + .cs-img { margin-top: 24px; }
  .cs-flow > .cs-img + * { margin-top: 24px; }
  .cs-flow > .cs-img + .cs-img { margin-top: 20px; }
  @media (max-width: 768px) {
    .cs-img { margin-left: -16px; margin-right: -16px; width: calc(100% + 32px) !important; border-radius: 0 !important; }
    .cs-img-frame { border-radius: 0 !important; }
  }
  .cs-thumb-row { scrollbar-width: thin; scrollbar-color: rgba(115,89,51,0.35) transparent; scroll-padding: 4px; overscroll-behavior-x: contain; }
  .cs-thumb-row::-webkit-scrollbar { height: 4px; }
  .cs-thumb-row::-webkit-scrollbar-track { background: transparent; }
  .cs-thumb-row::-webkit-scrollbar-thumb { background: rgba(115,89,51,0.3); border-radius: 4px; }
  .cs-bullets > li + li { margin-top: 8px; }
  .cs-bullets { list-style: none; }
  .cs-bullets > li { display: flex; gap: 8px; }
  .cs-bullets > li::before {
    content: "→";
    font-family: 'Libre Caslon Condensed', serif;
    font-size: 1em;
    flex-shrink: 0;
  }
  .cs-bullets strong { font-weight: 500; }
  .cs-bullets li span { font-weight: 400; font-size: calc(1em - 2px); }
  .cs-bullets-accent > li::before { color: #735933; }
  .cs-mt-4 { margin-top: 4px !important; }
  .cs-mt-8 { margin-top: 8px !important; }
  .cs-mt-12 { margin-top: 12px !important; }
  .cs-mt-16 { margin-top: 16px !important; }
  .cs-mt-20 { margin-top: 20px !important; }
  .cs-mt-24 { margin-top: 24px !important; }
  .cs-mt-40 { margin-top: 40px !important; }
  .cs-flow > .cs-spacer, .cs-flow > .cs-spacer + * { margin-top: 0 !important; }
`;

// ─── Spacer: exact, one-off vertical space anywhere inside .cs-flow ──────────
// Usage: <Spacer size={24} /> between any two elements. Pick from the shared
// scale (4, 8, 12, 16, 20, 24, 40) so spacing stays consistent across case studies.
type CSSpacingSize = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 40 ;
function Spacer({ size = 16 }: { size?: CSSpacingSize }) {
  return <div className="cs-spacer" style={{ height: size, flexShrink: 0 }} aria-hidden="true" />;
}

// ─── Shared: card thumbnail placeholder ──────────────────────────────────────
export function ThumbnailPlaceholder({
  bgColor, strokeColor, height = "100%", iconSize = 40,
}: {
  bgColor: string; strokeColor: string; height?: string | number; iconSize?: number;
}) {
  return (
    <div style={{ width: "100%", height, backgroundColor: bgColor, borderRadius: 4, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: [`repeating-linear-gradient(0deg,transparent,transparent 39px,${strokeColor}18 39px,${strokeColor}18 40px)`, `repeating-linear-gradient(90deg,transparent,transparent 39px,${strokeColor}18 39px,${strokeColor}18 40px)`].join(",") }} />
      {iconSize > 0 && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" style={{ position: "relative", zIndex: 1 }}>
          <rect x="4" y="11" width="32" height="22" rx="3" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.35" />
          <circle cx="20" cy="22" r="6" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.35" />
          <path d="M14 11V10a2 2 0 012-2h8a2 2 0 012 2v1" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.35" />
          <circle cx="32" cy="15" r="1.5" fill={strokeColor} fillOpacity="0.35" />
        </svg>
      )}
    </div>
  );
}

// ─── FASTag cover: Lottie animation, native 1800×1200 (3:2) ──────────────────
// Width fills its container; height hugs the animation's own aspect ratio,
// so it scales down proportionally instead of stretching to a fixed box.
function CoverAnimation({ radius = 0 }: { radius?: number }) {
  return (
    <div style={{ width: "100%", aspectRatio: "1800 / 1200", borderRadius: radius, overflow: "hidden" }}>
      <Lottie src={coverAnimationUrl} loop autoplay style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

// ─── Universal image treatment: 5px-rounded, 1px white stroke sitting outside the edge ──
// A plain `border` sits inside the box and dents the rounded clip — this draws the stroke
// as a separate absolutely-positioned sibling instead, exactly like PhoneStrip's original technique.
function StrokedImage({
  src, alt = "", bgColor = "#e7ded5", strokeColor = "#c67d39", iconSize = 32,
  aspectRatio, height, radius = 5,
}: {
  src?: string; alt?: string; bgColor?: string; strokeColor?: string; iconSize?: number;
  aspectRatio?: string; height?: string | number; radius?: number;
}) {
  return (
    <div style={{ position: "relative", width: "100%", ...(aspectRatio ? { aspectRatio } : { height: height ?? "100%" }) }}>
      <div className="cs-img-frame" style={{ width: "100%", height: "100%", borderRadius: radius, overflow: "hidden", backgroundColor: bgColor }}>
        {src ? (
          <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <ThumbnailPlaceholder bgColor={bgColor} strokeColor={strokeColor} height="100%" iconSize={iconSize} />
        )}
      </div>
    </div>
  );
}

// ─── SectionBlock: scroll-reveal wrapper ─────────────────────────────────────
function SectionBlock({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div
      id={id}
      data-section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-8% 0px -5% 0px" }}
      style={{ scrollMarginTop: 88 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Content helpers ──────────────────────────────────────────────────────────
// ─── Desktop meta-chip strip (replaces the old left-sidebar meta list) ────────
// Matches Figma "Frame 1597884687": two rows of "dash + shape" markers followed
// by an italic Caslon label and the value, each chip sliding in left→right on mount.
type MetaChipShape = "square" | "diamond" | "circle" | "arrow";

// Every marker reads left→right as: [lead shape] — [line] ▸ [diamond arrowhead].
// The lead shape (square / diamond / circle) differentiates the rows; the "arrow"
// row has no lead shape, just the line + arrowhead.
function MetaChipMarker({ shape }: { shape: MetaChipShape }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 3, width: 26, height: 14, flexShrink: 0 }}>
      {shape === "square" && <div style={{ width: 7, height: 7, backgroundColor: "#c67d39", flexShrink: 0 }} />}
      {shape === "diamond" && <div style={{ width: 6, height: 6, backgroundColor: "#c67d39", transform: "rotate(45deg)", flexShrink: 0 }} />}
      {shape === "circle" && <div style={{ width: 7, height: 7, borderRadius: 8, backgroundColor: "#c67d39", flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 5, height: 1, backgroundColor: "#c67d39" }} />
      {/* diamond arrowhead — a rotated square clipped to its leading half so it points right */}
      <div style={{ width: 6, height: 6, backgroundColor: "#c67d39", transform: "rotate(45deg)", flexShrink: 0 }} />
    </div>
  );
}

function MetaChip({ shape, label, value, grow, delay }: { shape: MetaChipShape; label: string; value: string; grow?: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, flex: grow ? 1 : "0 0 auto", minWidth: 0 }}
    >
      <MetaChipMarker shape={shape} />
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", gap: 4, minWidth: 0 }}>
        <p className="font-caslon" style={{ fontStyle: "italic", fontSize: 14, lineHeight: "18px", color: "#c67d39", flexShrink: 0 }}>{label}</p>
        <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "17px", color: "#212012" }}>{value}</p>
      </div>
    </motion.div>
  );
}

function MetaChipStrip({ caseStudy }: { caseStudy: CaseStudyInfo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 16, width: "100%" }}>
        <MetaChip shape="square" label="for" value={caseStudy.client} delay={0} />
        <MetaChip shape="diamond" label="for a duration of" value={caseStudy.timeline} delay={0.06} />
        <MetaChip shape="circle" label="project is" value={caseStudy.status.toLowerCase()} grow delay={0.12} />
      </div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 16, width: "100%" }}>
        <MetaChip shape="arrow" label="canvs team" value={caseStudy.designTeam.replace(/^Canvs\s*—\s*/, "")} grow delay={0.18} />
      </div>
    </div>
  );
}

// Mobile meta table — matches Viewport/Expanded Figma exactly
function MobileMetaTable({ cs }: { cs: CaseStudyInfo }) {
  const rows = [
    { label: "Client", value: cs.client },
    { label: "Timeline", value: cs.timeline },
    { label: "Team", value: cs.designTeam },
    { label: "Role", value: cs.role },
    { label: "Team", value: cs.crossTeam },
    { label: "Status", value: cs.statusFull },
  ];
  return (
    <div style={{
      backgroundColor: "#e7ded5", borderRadius: 12,
      border: "1px solid rgba(33,32,18,0.1)",
      padding: 16, display: "flex", flexDirection: "column", gap: 12,
      fontSize: 10, letterSpacing: "0.4px",
    }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
          <div style={{
            width: 60, flexShrink: 0,
            fontFamily: "'Inclusive Sans', sans-serif", fontWeight: 500,
            color: "#c67d39", lineHeight: "normal",
          }}>
            {row.label}
          </div>
          <div style={{
            flex: 1, fontFamily: "'Inclusive Sans', sans-serif", fontWeight: 500,
            color: "#444444", lineHeight: "normal", wordBreak: "break-word",
          }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ children, mobile = false }: { children: React.ReactNode; mobile?: boolean }) {
  return (
    <p className="font-caslon not-italic cs-t2" style={{
      fontSize: mobile ? 24 : 24,
      color: "#212012", fontWeight: 600, lineHeight: "normal",
    }}>
      {children}
    </p>
  );
}

function BodyText({ children, color = "#444" }: { children: React.ReactNode; color?: string; mobile?: boolean }) {
  return (
    <p className="font-inclusive-sans font-normal cs-p" style={{
      fontSize: 16,
      lineHeight: "24px",
      color,
      letterSpacing: "0.15px",
    }}>
      {children}
    </p>
  );
}

function SubHeading({ children, mobile = false }: { children: React.ReactNode; mobile?: boolean }) {
  return (
    <p className="font-inclusive-sans font-medium" style={{
      fontSize: mobile ? 16 : 16,
      lineHeight: mobile ? "24px" : "24px",
      color: "#333333",
      letterSpacing: mobile ? "0.15px" : "0.16px",
    }}>
      {children}
    </p>
  );
}

// Carousel — one Figma-exact "Frame 1597884708" card (584×645 @ desktop) shown fully,
// the rest of the slides reduced to 60×40px (scaled down on mobile) clickable thumbnails.
interface CarouselSlide {
  src?: string;
  /** Interactive embed (e.g. a Figma prototype URL). Takes precedence over `src`
      for both the staged frame and its thumbnail — the thumbnail shows a scaled,
      non-interactive preview of the same embed. */
  embed?: string;
  /** A set of phone screens laid out side by side inside the 8:5 frame (and its thumbnail). */
  images?: string[];
  caption: string;
}

// Phone screens for a carousel slide. Scaled as one group to fit *inside* the frame on both
// axes (object-fit: contain, but for the whole set): the tallest screen never exceeds the
// frame's height and the row never exceeds its width, so nothing spills on narrow screens.
// Works the same in the staged 8:5 frame and the 80×54 thumbnail.
function CarouselPhoneSet({ images, stroke = true }: { images: string[]; stroke?: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState<Record<number, { w: number; h: number }>>({});

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inset = 0.92; // breathing room inside the frame, as a share of each axis
  const gap = box.w * 0.04;
  const sizes = images.map((_, i) => natural[i]);
  const ready = box.w > 0 && sizes.every(Boolean);
  const scale = ready
    ? Math.min(
        (box.h * inset) / Math.max(...sizes.map((n) => n!.h)),
        (box.w * inset - gap * (images.length - 1)) / sizes.reduce((sum, n) => sum + n!.w, 0),
      )
    : 0;

  return (
    <div ref={boxRef} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap, overflow: "hidden" }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            setNatural((prev) => ({ ...prev, [i]: { w, h } }));
          }}
          style={{
            display: "block", flexShrink: 0,
            width: ready ? sizes[i]!.w * scale : 0,
            height: ready ? sizes[i]!.h * scale : 0,
            opacity: ready ? 1 : 0,
            borderRadius: stroke ? 5 : 1, border: stroke ? "1px solid #ffffff" : "none", boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
}

function ImageCarousel({ slides, mobile = false, bgColor = "#e7ded5", maxWidth }: { slides: CarouselSlide[]; mobile?: boolean; bgColor?: string; maxWidth?: number }) {
  const [active, setActive] = useState(0);
  const current = slides[active];
  const strokeColor = "#c67d39";
  const thumbW = mobile ? 64 : 80;
  const thumbH = mobile ? 44 : 54;

  return (
    <div className="cs-img" style={{ display: "flex", flexDirection: "column", gap: mobile ? 10 : 12, width: "100%", maxWidth: mobile ? undefined : maxWidth }}>
      {/* Full frame — the one active slide. Web: 16/12 padding, rounded 8. Mobile: edge-to-edge
          (no side padding, no rounding), just a 10px gap before the caption row. */}
      <div
        style={{
          display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center",
          padding: mobile ? "0 0 10px" : "16px 12px",
          gap: 10,
          width: "100%",
          backgroundColor: bgColor,
          borderRadius: mobile ? 0 : 8,
        }}
      >
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          gap: mobile ? 10 : 16,
          width: "100%",
        }}>
          {current.embed ? (
            <div style={{ position: "relative", width: "100%", aspectRatio: "8 / 5" }}>
              <iframe
                src={current.embed}
                title={current.caption}
                allowFullScreen
                style={{
                  width: "100%", height: "100%", display: "block",
                  border: `1px solid ${strokeColor}`, borderRadius: 8, backgroundColor: bgColor,
                }}
              />
            </div>
          ) : current.images ? (
            <div style={{ width: "100%", aspectRatio: "8 / 5" }}>
              <CarouselPhoneSet key={active} images={current.images} />
            </div>
          ) : (
            <StrokedImage src={current.src} alt={current.caption} bgColor={bgColor} strokeColor={strokeColor} aspectRatio="8 / 5" radius={8} iconSize={32} />
          )}

          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: mobile ? "0 12px" : "0 8px", gap: mobile ? 4 : 6, width: "100%", flexShrink: 0 }}>
            <div style={{ width: mobile ? 2 : 3, height: mobile ? 12 : 13, borderRadius: 4, backgroundColor: strokeColor, flexShrink: 0 }} />
            <p className={mobile ? "font-inclusive-sans font-normal" : "font-jakarta font-medium"} style={{
              flex: 1, minWidth: 0,
              fontSize: 10, lineHeight: mobile ? "12px" : "13px", letterSpacing: "0.01em",
              color: "rgba(33,32,18,0.5)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {current.caption}
            </p>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <p className={mobile ? "font-inclusive-sans font-normal" : "font-jakarta font-medium"} style={{ fontSize: 10, lineHeight: mobile ? "12px" : "13px", letterSpacing: "0.01em", color: "#735933" }}>
                {active + 1}
              </p>
              <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "rgba(115,89,51,0.3)" }} />
              <p className={mobile ? "font-inclusive-sans font-normal" : "font-jakarta font-medium"} style={{ fontSize: 10, lineHeight: mobile ? "12px" : "13px", letterSpacing: "0.01em", color: "rgba(115,89,51,0.5)" }}>
                {slides.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails — always all N slides (N = the counter's total), active one highlighted.
          Never conditionally removed, so the row never reorders and every slide stays reachable. */}
      {slides.length > 1 && (
        <div className="cs-thumb-row" style={{ display: "flex", flexWrap: "nowrap", gap: 12, padding: mobile ? "0 24px" : 0, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={slide.caption}
              aria-current={i === active}
              style={{
                position: "relative", display: "block", flexShrink: 0,
                width: thumbW, height: thumbH,
                padding: 0, border: "none", background: "none", cursor: "pointer",
                borderRadius: 4, overflow: "hidden",
                opacity: i === active ? 1 : 0.55,
                transition: "opacity 0.15s ease",
              }}
            >
              {slide.embed ? (
                <div style={{
                  width: 800, height: 800 * (thumbH / thumbW),
                  transform: `scale(${thumbW / 800})`, transformOrigin: "top left",
                  pointerEvents: "none",
                }}>
                  <iframe
                    src={slide.embed}
                    title=""
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{ width: "100%", height: "100%", border: "none", display: "block", backgroundColor: bgColor }}
                  />
                </div>
              ) : slide.images ? (
                <div style={{ width: "100%", height: "100%", backgroundColor: bgColor }}>
                  <CarouselPhoneSet images={slide.images} stroke={false} />
                </div>
              ) : slide.src ? (
                <img src={slide.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <ThumbnailPlaceholder bgColor={bgColor} strokeColor={strokeColor} height="100%" iconSize={12} />
              )}
              <div style={{
                position: "absolute", inset: -1, borderRadius: 5, pointerEvents: "none",
                border: i === active ? `1.5px solid ${strokeColor}` : "1px solid #ffffff",
              }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Before/after comparison panel — matches Figma "Frame 1597884703" 1:1 (584×298 @ desktop):
// a single "before" image on top (#E7DED5), two "after" images side by side below (#ECE6DF),
// each with its own caption. Percentages/aspect-ratio driven so it scales proportionally on mobile.
function LandingComparisonPanel({
  before, beforeCaption, after, afterCaption,
}: {
  before?: string; beforeCaption: string; after: [string?, string?]; afterCaption: string;
}) {
  const strokeColor = "#c67d39";
  const captionRow = (text: string) => (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "0 4px", gap: 6, width: "100%", flexShrink: 0 }}>
      <div style={{ width: 3, height: 13, borderRadius: 4, backgroundColor: strokeColor, flexShrink: 0 }} />
      <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: "13px", letterSpacing: "0.01em", color: "rgba(33,32,18,0.5)" }}>
        {text}
      </p>
    </div>
  );

  return (
    <div className="cs-img" style={{ display: "flex", flexDirection: "column", width: "100%", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 0", gap: 10, width: "100%", backgroundColor: "#e7ded5" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, width: "45.72%" }}>
          <StrokedImage src={before} bgColor="#e7ded5" strokeColor={strokeColor} aspectRatio="267 / 80" />
          {captionRow(beforeCaption)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 0", gap: 10, width: "100%", backgroundColor: "#ece6df" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, width: "84.93%" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 24, width: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <StrokedImage src={after[0]} bgColor="#ece6df" strokeColor={strokeColor} aspectRatio="236 / 80" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <StrokedImage src={after[1]} bgColor="#ece6df" strokeColor={strokeColor} aspectRatio="236 / 80" />
            </div>
          </div>
          {captionRow(afterCaption)}
        </div>
      </div>
    </div>
  );
}

function IterationLabel({ children, mobile = false }: { children: React.ReactNode; mobile?: boolean }) {
  return (
    <p className="font-inclusive-sans font-medium cs-t3" style={{
      fontSize: mobile ? 16 : 18,
      lineHeight: mobile ? "21px" : "24px",
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      color: "#c67d39",
    }}>
      {children}
    </p>
  );
}

// Iteration thumbnail row — matches Figma's "Iteration - N" pattern: a caption above a
// row of small same-height state thumbnails (not a big-image carousel like ImageCarousel).
function IterationThumbnailRow({ caption, images, aspectRatio = "98 / 48", mobile = false }: { caption: string; images: string[]; aspectRatio?: string; mobile?: boolean }) {
  return (
    <div className="cs-img" style={{
      display: "flex", flexDirection: "column", gap: 12,
      width: "100%", backgroundColor: "#e7ded5", borderRadius: 8,
      padding: mobile ? 12 : 16,
    }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
        <div style={{ width: 3, height: 13, borderRadius: 4, backgroundColor: "#c67d39", flexShrink: 0 }} />
        <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: "13px", letterSpacing: "0.01em", color: "rgba(33,32,18,0.5)" }}>
          {caption}
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {images.map((src, i) => (
          <div key={i} style={{ flex: mobile ? "1 1 28%" : "1 1 15%", minWidth: mobile ? 84 : 80 }}>
            <StrokedImage src={src} bgColor="#e7ded5" strokeColor="#c67d39" aspectRatio={aspectRatio} radius={0} />
          </div>
        ))}
      </div>
    </div>
  );
}

// State → treatment table (CS2 card exploration, iteration 3) — same visual language as JTBDTable.
interface StateTreatmentRow { state: string; treatment: string; }

function StateTreatmentTable({ rows, mobile = false }: { rows: StateTreatmentRow[]; mobile?: boolean }) {
  return (
    <div className="cs-img" style={{ display: "flex", flexDirection: "column", width: "100%", border: "1px solid #DACCBE", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, width: "100%", backgroundColor: "#E3D9CE" }}>
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, padding: mobile ? "10px 0 10px 12px" : "10px 0 10px 16px",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#444444",
        }}>
          State
        </p>
        <JTBDColumnDivider />
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, textAlign: "left", padding: mobile ? "10px 12px 10px 0" : "10px 16px 10px 0",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#444444",
        }}>
          Treatment
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#E7DED5", padding: mobile ? "10px 14px" : "12px 16px", gap: 12 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", gap: 12 }}>
            <p className="font-inclusive-sans font-medium" style={{ flex: 1, fontSize: 12, lineHeight: "16px", letterSpacing: "0.25px", color: "#444444" }}>
              {i + 1}. {row.state}
            </p>
            <JTBDColumnDivider />
            <p className="font-inclusive-sans font-normal" style={{ flex: 1, fontSize: 12, lineHeight: "20px", letterSpacing: "0.25px", color: "#444444" }}>
              {row.treatment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple 2x2 image grid (CS2 recharge "the problem" — old reference flows, no per-image caption)
function ImageGrid2x2({ images }: { images: string[] }) {
  return (
    <div className="cs-img" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
      {images.map((src, i) => (
        <StrokedImage key={i} src={src} bgColor="#e7ded5" strokeColor="#c67d39" aspectRatio="270 / 169" />
      ))}
    </div>
  );
}

// ─── JTBD table (CS2 "Users and JTBD") — matches Figma "Frame 1597884686" 1:1 ──
interface JTBDRow { job: string; context: string; }
interface JTBDGroup { label: string; rows: JTBDRow[]; }

const JTBD_GROUPS: JTBDGroup[] = [
  {
    label: "FREQUENT + TIME-SENSITIVE + SURFACED ON CARD",
    rows: [
      { job: "Recharge an existing FASTag", context: "Often urgent — user may be driving toward a toll gate" },
      { job: "Check available balance", context: "Often urgent — user may be driving toward a toll gate" },
    ],
  },
  {
    label: "OCCASIONAL + DELIBERATE + LIVES DEEPER",
    rows: [
      { job: "Link or buy a new FASTag", context: "Considered action, done once, needs guidance" },
      { job: "Check recharge or transaction history", context: "Review mode — user is looking back, not forward" },
    ],
  },
];

// Vertical divider between the JTBD/Context columns — table border colour, 1px stroke,
// stretches to the height of whichever row it sits in.
function JTBDColumnDivider() {
  return <div style={{ alignSelf: "stretch", width: 1, backgroundColor: "#DACCBE", flexShrink: 0 }} />;
}

function JTBDTable({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="cs-img" style={{
      display: "flex", flexDirection: "column",
      width: "100%",
      border: "1px solid #DACCBE", borderRadius: 12, overflow: "hidden",
    }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, width: "100%", backgroundColor: "#E3D9CE" }}>
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, padding: mobile ? "12px 0 12px 12px" : "12px 0 12px 16px",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#444444",
        }}>
          JTBD
        </p>
        <JTBDColumnDivider />
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, textAlign: "left", padding: mobile ? "12px 12px 12px 0" : "12px 16px 12px 0",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#444444",
        }}>
          Context
        </p>
      </div>

      {JTBD_GROUPS.map((group, gi) => (
        <div key={gi} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{
            display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12,
            width: "100%", padding: mobile ? "6px 12px" : "6px 16px",
            backgroundColor: "#E3D9CE",
          }}>
            <div style={{ boxSizing: "border-box", width: 1, height: 0, border: "1px solid #735933", flexShrink: 0 }} />
            <p className="font-inclusive-sans font-normal" style={{
              height: 12, fontSize: 10, lineHeight: "12px", display: "flex", alignItems: "flex-end", justifyContent: "center",
              textAlign: "center", letterSpacing: "1px", textTransform: "uppercase", color: "#735933", flexShrink: 0,
            }}>
              {group.label}
            </p>
            <div style={{ boxSizing: "border-box", width: 1, height: 0, border: "1px solid #735933", flexShrink: 0 }} />
          </div>
          <div style={{
            display: "flex", flexDirection: "column",
            width: "100%", backgroundColor: "#E7DED5",
            padding: mobile ? "10px 14px" : "12px 16px", gap: 12,
          }}>
            {group.rows.map((row, ri) => (
              <div key={ri} style={{ display: "flex", flexDirection: "row", gap: 12 }}>
                <p className="font-inclusive-sans font-medium" style={{ flex: 1, fontSize: 12, lineHeight: "16px", letterSpacing: "0.25px", color: "#444444" }}>
                  {row.job}
                </p>
                <JTBDColumnDivider />
                <p className="font-inclusive-sans font-normal" style={{ flex: 1, fontSize: 12, lineHeight: "20px", letterSpacing: "0.25px", color: "#444444" }}>
                  {row.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Audio player ─────────────────────────────────────────────────────────────
function AudioPlayer({ color, slug }: { color: string; slug: string }) {
  const { playing, toggle, seekToFraction, available, progress, timeLabel } = useAudioPlayer(caseStudyAudioUrl(slug));
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
      <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: "rgba(227,217,206,0.5)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        Listen to this case study
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={toggle}
          disabled={!available}
          style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: color, border: "none", cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          {playing ? <Pause size={14} fill="#212012" color="#212012" /> : <Play size={14} fill="#212012" color="#212012" />}
        </button>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seekToFraction((e.clientX - rect.left) / rect.width);
          }}
          style={{ flex: 1, height: 2, backgroundColor: "rgba(227,217,206,0.18)", borderRadius: 1, position: "relative", cursor: available ? "pointer" : "default" }}
        >
          <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: color, borderRadius: 1 }} />
        </div>
        <p className="font-inclusive-sans" style={{ fontSize: 11, color: "rgba(227,217,206,0.4)", letterSpacing: "0.1px", flexShrink: 0 }}>
          {available ? timeLabel : "narration coming soon"}
        </p>
        <Volume2 size={13} color="rgba(227,217,206,0.35)" style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
}

function VideoFrame({ cs }: { cs: CaseStudyInfo }) {
  return (
    <div style={{ flex: "0 0 320px", height: 180, borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <ThumbnailPlaceholder bgColor={cs.imageBg} strokeColor={cs.textColor} height="100%" iconSize={0} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "rgba(33,32,18,0.55)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={20} fill="#212012" color="#212012" />
        </div>
        <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1px", textAlign: "center" }}>Case study walkthrough</p>
      </div>
    </div>
  );
}

// ─── Related case study card ──────────────────────────────────────────────────
function RelatedCard({ cs, onClick }: { cs: CaseStudyInfo; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, backgroundColor: cs.color, borderRadius: 16, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      <div style={{ height: 110, overflow: "hidden", flexShrink: 0 }}>
        <ThumbnailPlaceholder bgColor={cs.imageBg} strokeColor={cs.textColor} height={110} iconSize={24} />
      </div>
      <div style={{ padding: "14px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "inline-flex", backgroundColor: "rgba(33,32,18,0.12)", padding: "4px 12px", borderRadius: 100, alignSelf: "flex-start" }}>
          <p className="font-inclusive-sans font-semibold" style={{ fontSize: 10, color: cs.textColor, letterSpacing: "0.5px", textTransform: "uppercase" }}>{cs.label}</p>
        </div>
        <p className="font-caslon" style={{ fontSize: 17, lineHeight: "23px", color: "#212012", fontWeight: 600 }}>{cs.title}</p>
      </div>
    </motion.div>
  );
}

// ─── CS1 content (ICICI Bank iTravel) — Figma "Frame 38" (584px column) ───────
// Its own type scale, tighter than the shared helpers: 20/26 Caslon headings,
// 14/20 Inclusive Sans body, 12px rhythm inside a section, 52px between sections.
const CS1_ACCENT = "#C67D39";

function CS1Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-caslon not-italic" style={{ fontSize: 20, lineHeight: "26px", fontWeight: 600, color: "#212012" }}>
      {children}
    </p>
  );
}

function CS1Text({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", color: "#444444" }}>
      {children}
    </p>
  );
}

function CS1Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <SectionBlock id={id}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </SectionBlock>
  );
}

function CS1Caption({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
      <div style={{ width: 3, height: 13, borderRadius: 4, backgroundColor: CS1_ACCENT, flexShrink: 0 }} />
      <p className="font-jakarta font-medium" style={{ fontSize: 10, lineHeight: "13px", letterSpacing: "0.01em", color: "rgba(33,32,18,0.5)" }}>
        {children}
      </p>
    </div>
  );
}

// A phone screen, 150px wide at design size, 1px white stroke. It shrinks with its row
// (never grows past 150px) and keeps its aspect ratio, so a row always fits its panel.
function CS1Phone({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: 150 }}>
      <img
        src={src}
        alt={alt}
        style={{ display: "block", width: "100%", height: "auto", border: "1px solid #FFFFFF", borderRadius: 5, boxSizing: "border-box" }}
      />
    </div>
  );
}

// Row of CS1Phones. `gap` is a share of the row's width so spacing shrinks with the phones.
function CS1PhoneRow({ children, gap }: { children: React.ReactNode; gap: string }) {
  return <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap, width: "100%" }}>{children}</div>;
}

// Tan panel that holds phone screens.
function CS1Panel({ children, padding }: { children: React.ReactNode; padding: string }) {
  return (
    <div className="cs-img" style={{ width: "100%", backgroundColor: "#E7DED5", borderRadius: 8, overflow: "hidden", padding, boxSizing: "border-box" }}>
      {children}
    </div>
  );
}

function CS1HMWBox() {
  const items = [
    "Make activation easy and confidence-building",
    "Get genuine transactions approved seamlessly",
    "Give users one view for all international travel issues",
  ];
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "stretch", gap: 12,
      paddingRight: 16, overflow: "hidden",
      backgroundColor: "rgba(198,125,57,0.1)", border: "1px solid rgba(198,125,57,0.3)", borderRadius: 8,
    }}>
      <div style={{ width: 3, backgroundColor: CS1_ACCENT, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, padding: "8px 0", flex: 1 }}>
        {items.map((text, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, padding: "8px 0" }}>
            <div style={{ width: 20, height: 20, borderRadius: 16, backgroundColor: CS1_ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <p className="font-jakarta" style={{ fontWeight: 700, fontSize: 12, lineHeight: "16px", letterSpacing: "0.01em", color: "#FFFFFF" }}>{i + 1}</p>
            </div>
            <p className="font-inclusive-sans font-medium" style={{ flex: 1, fontSize: 13, lineHeight: "16px", color: "#444444" }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CS1Layer({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
        <span aria-hidden="true" style={{ fontSize: 16, lineHeight: "20px" }}>{icon}</span>
        <p className="font-inclusive-sans" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", color: "#735933" }}>{title}</p>
      </div>
      <CS1Text>{children}</CS1Text>
    </div>
  );
}

function CS1StateTable({ mobile }: { mobile: boolean }) {
  const rows = [
    ["App installed, has CC", "Auth → iTravel activation drawer"],
    ["App installed, has no CC", "Auth → card application drawer — iTravel becomes the acquisition hook"],
    ["App installed, session expired", "Re-auth → routes into above"],
    ["App not installed", "Web promo page, both audiences"],
  ];
  const pad = mobile ? 12 : 16;
  const head = { fontWeight: 600, fontSize: 12, lineHeight: "20px", textTransform: "uppercase" as const, color: "#444444" };
  return (
    <div className="cs-img" style={{ width: "100%", border: "1px solid #DACCBE", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "row", gap: 16, backgroundColor: "#E3D9CE", padding: `8px ${pad}px` }}>
        <p className="font-jakarta" style={{ ...head, flex: 1 }}>State</p>
        <p className="font-inclusive-sans" style={{ ...head, flex: 1 }}>Outcome</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, backgroundColor: "#E7DED5", padding: `12px ${pad}px` }}>
        {rows.map(([state, outcome], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", gap: 16 }}>
            <p className="font-jakarta" style={{ flex: 1, fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#444444" }}>{i + 1}. {state}</p>
            <p className="font-inclusive-sans font-normal" style={{ flex: 1, fontSize: 12, lineHeight: "20px", color: "#444444" }}>{outcome}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CS1EntryPanel() {
  return (
    <div className="cs-img" style={{ width: "100%", backgroundColor: "#E7DED5", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", backgroundColor: "#ECE5DF", borderBottom: "1px solid #E3D9CE" }}>
        <p className="font-inclusive-sans font-normal" style={{ fontSize: 12, lineHeight: "16px", color: "rgba(33,32,18,0.8)" }}>
          The drawer is a forced interstitial - the user clicked an ad specifically about iTravel, so making them navigate a dashboard first would be the actual friction.
        </p>
      </div>
      <div style={{ padding: "17px 4% 16px" }}>
        {/* 150 : 320 split with a 66px gap at design width — all proportional so it fits any width */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: "7%" }}>
          <div style={{ flex: "150 1 0", minWidth: 0, maxWidth: 150, display: "flex", flexDirection: "column", gap: 12 }}>
            <CS1PhoneRow gap="0">
              <CS1Phone src={imgEntryHasCard} alt="iTravel activation drawer" />
            </CS1PhoneRow>
            <CS1Caption>State 1 - Has a credit card</CS1Caption>
          </div>
          <div style={{ flex: "320 1 0", minWidth: 0, maxWidth: 320, display: "flex", flexDirection: "column", gap: 9 }}>
            <CS1PhoneRow gap="6.25%">
              <CS1Phone src={imgEntryNoCard1} alt="Card application drawer" />
              <CS1Phone src={imgEntryNoCard2} alt="Card application drawer, iTravel slide" />
            </CS1PhoneRow>
            <CS1Caption>State 2, 3, 4 - Does not have a credit card</CS1Caption>
          </div>
        </div>
      </div>
    </div>
  );
}

function CS1CroppedShot() {
  return (
    <div className="cs-img" style={{ width: "100%", height: 123, backgroundColor: "#E7DED5", borderRadius: 8, overflow: "hidden", display: "flex", justifyContent: "center", paddingTop: 16, boxSizing: "border-box" }}>
      <img src={imgAutoExpiry} alt="Additional preferences — auto-disable after trip" style={{ width: 150, height: "auto", alignSelf: "flex-start", display: "block" }} />
    </div>
  );
}

function CS1Content({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 52 }}>
      <SectionBlock id="cs-problem">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>THE PROBLEM</CS1Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <CS1Text>
              30% of ICICI Bank international transactions were declining. The obvious fix - surface the toggle - would have helped. But I started from a different question: why does the decline happen at all, and what would actually prevent it?
            </CS1Text>
            <CS1Text>
              The answer wasn't in the UI. It was in how RBI mandates work, how fraud engines evaluate transactions, and how travelers actually use their phones abroad. Every decision in iTravel came from reasoning through those layers first, then designing backward to the screen.
            </CS1Text>
            <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", letterSpacing: "0.01em", color: "#444444" }}>The PM briefed...</p>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "stretch", gap: 8 }}>
              <div style={{ width: 3, borderRadius: 4, backgroundColor: CS1_ACCENT, flexShrink: 0 }} />
              <p className="font-caslon not-italic" style={{ flex: 1, padding: "8px 0", fontSize: 16, lineHeight: "20px", fontWeight: 600, color: "#212012" }}>
                Build <em>iTravel</em>, a single, unified hub where customers declare their travel plans and the bank automatically aligns card usage and fraud monitoring to that profile.
              </p>
            </div>
            <p className="font-inclusive-sans font-medium" style={{ fontSize: 14, lineHeight: "20px", color: "#444444" }}>Three HMWs:</p>
            <CS1HMWBox />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-why">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CS1Heading>Why the obvious fix wasn't enough</CS1Heading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CS1Layer icon="📜" title="Layer 1 - RBI compliance">
                Separate switches for POS, ATM, and e-commerce. Enabling one doesn't enable the others. A user who turns on POS can still get silently declined buying online.
              </CS1Layer>
              <CS1Layer icon="🚨" title="Layer 2 - Fraud engine logic">
                The system doesn't just check if the toggle is on. It checks if the transaction looks geographically plausible for that cardholder.
              </CS1Layer>
              <CS1Layer icon="🔇" title="Layer 3 - Information gap">
                The bank has no signal a customer is traveling until they're already declined.
              </CS1Layer>
            </div>
          </div>
          <CS1Text>
            iTravel was built to close Layer 3. Once the bank knows the trip in advance, Layers 1 and 2 can be handled automatically.
          </CS1Text>
        </div>
      </SectionBlock>

      <CS1Section id="cs-entry">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>1. Getting users in before they need it</CS1Heading>
          <CS1Text>
            Most ICICI cardholders barely open iMobile - bill payments increasingly happen through CRED, PhonePe or other 3rd party apps. An in-app-only entry point reaches almost nobody.
          </CS1Text>
        </div>
        <CS1StateTable mobile={isMobile} />
        <Spacer size={40} />
        <CS1EntryPanel />
      </CS1Section>

      <CS1Section id="cs-trip">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>2. Declaring the trip</CS1Heading>
          <CS1Text>
            User declares destination, layover stops, travel dates, purpose, and multiple trips. The layover field wasn't in the brief - I proposed it.
          </CS1Text>
          <CS1Text>
            Fraud engines check travel plausibility, not just whether a country is blocked. A card quiet for months, then swiping in Tokyo, looks like fraud. A declared trip -{" "}
            <span className="font-caslon" style={{ color: CS1_ACCENT, fontSize: 16 }}>India → Singapore (layover) → Japan</span>{" "}
            - gives the engine a trail. The Tokyo swipe stops looking anomalous.
          </CS1Text>
          <ImageCarousel
            mobile={isMobile}
            slides={[
              { images: [imgTripSingleEmpty, imgTripSingleFilled], caption: "Travelling to a single country with no layover" },
              { images: [imgTripMultiEmpty, imgTripMultiAdded, imgTripMultiFilled], caption: "Travelling to multiple countries, with a layover" },
            ]}
          />
        </div>
      </CS1Section>

      <CS1Section id="cs-limits">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>3. Setting limits without currency math</CS1Heading>
          <CS1Text>
            Card control limits shown as a slider with a live conversion-rate label for the destination currency.
          </CS1Text>
          <CS1Text>
            Three problems solved at once: no mental currency math, prevents under-setting a limit that looks fine in INR but causes a mid-trip decline, and surfaces a natural credit-limit-increase prompt when intended spend exceeds the current limit.
          </CS1Text>
          <CS1Panel padding="16px 6%">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 512, margin: "0 auto" }}>
              <CS1Caption>All states of preferences</CS1Caption>
              <CS1PhoneRow gap="6%">
                <CS1Phone src={imgPrefsDefault} alt="Preferences — default" />
                <CS1Phone src={imgPrefsEditing} alt="Preferences — editing a limit" />
                <CS1Phone src={imgPrefsFilled} alt="Preferences — filled" />
              </CS1PhoneRow>
            </div>
          </CS1Panel>
        </div>
      </CS1Section>

      <CS1Section id="cs-expiry">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>4. Auto-expiring controls</CS1Heading>
          <CS1Text>
            RBI mandates manual activation but says nothing about deactivation. Left on indefinitely, the fraud exposure window stays open long after the trip ends.
          </CS1Text>
          <CS1Text>
            Proposed auto-expiry tied to the declared travel dates - not RBI-required, my proposal. Shrinks the fraud window to exactly the trip and removes the hesitation of feeling like you're committing to this forever.
          </CS1Text>
          <CS1CroppedShot />
        </div>
      </CS1Section>

      <CS1Section id="cs-wrapup">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CS1Heading>5. Travel wrap-up</CS1Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CS1Text>
              After the trip: a fun summary - total spend, category breakdown, top merchants, country stamp added to a collection.
            </CS1Text>
            <CS1Text>
              The data already exists in the bank's transaction records. iTravel provides the trigger - declared dates and destination tell the system which transactions to aggregate and when to surface the summary.
            </CS1Text>
            <CS1Text>
              The stamp collection scales without manual asset creation. Each sticker uses dynamic fields - country code, currency, year visited - with one SVG illustration per country as the only per-country asset.
            </CS1Text>
          </div>
        </div>
        <CS1CroppedShot />
      </CS1Section>
    </div>
  );
}

// ─── CS2 content (ICICI FASTag) ───────────────────────────────────────────────
function CS2Content({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  return (
    <div className="cs-sections" style={{ display: "flex", flexDirection: "column" }}>
      <SectionBlock id="cs-intro">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>Introduction</SectionHeading>
          <div className="cs-flow " style={{ display: "flex", flexDirection: "column"  }}>
            <BodyText mobile={m}>
              FASTag is mandatory for all four-wheelers on Indian highways, and ICICI Bank commands nearly 29% of the national FASTag market. Before this project, every one of those customers relied solely on iMobile or a third-party app to manage their tag.
            </BodyText>
            <BodyText mobile={m}>
              I designed the entire FASTag experience for RIB from scratch. No brief. No precedent. Just iMobile's existing flows as reference, a fixed two-week deadline, and three distinct user types that needed to coexist on the same platform.
            </BodyText>
            <Spacer size={isMobile ? 24 : 40} />
            <SectionHeading mobile={m}>Users and JTBD</SectionHeading>
            <BodyText mobile={m}>
              With the reference I had, before designing the screens, I mapped four core jobs users come to FASTag to do. These drove every layout and hierarchy decision that followed.
            </BodyText>
            <JTBDTable mobile={m} />

            <SectionHeading mobile={m}>It's 11pm on the highway, and the toll is ahead</SectionHeading>

            <BodyText mobile={m}>
              Think about Job 1 for a second — someone's checking their FASTag balance while driving toward a toll plaza. They're not relaxed, they're not browsing. They need an answer in a glance. Urgent, quick, no room for hunting.
            </BodyText>
            <SubHeading mobile={m}>
              That's exactly why the card works the way it does:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal cs-bullets cs-bullets-accent" style={{ fontSize: 16, lineHeight: "24px", color: "#444", letterSpacing: "0.15px", paddingLeft: m ? 12 : 16, paddingRight: m ? 12 : 16 }}>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Vehicle number and model</strong>
                  <span>You can scan it in under 2-seconds, no reading needed.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Balance</strong>
                  <span>It's the biggest thing on the card, impossible to miss.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Recharge</strong>
                  <span>One tap, always there, always in the same spot no matter the card state.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Everything else</strong>
                  <span>Tucked behind the three-dot menu or the detail page, out of the way until you actually need it.</span>
                </div>
              </li>
            </ul>
            <BodyText mobile={m}>
              The secondary stuff (tag replacement, KYC, close tag, raise a query) — sure, it matters. But it's not why someone opens FASTag at 11pm on the highway. Keeping it secondary isn't a compromise. That's the whole point.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-landing">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>1. Landing page</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <BodyText mobile={m}>
              One landing page. Three user types. Multiple card states. Everything had to be readable at a glance — including for fleet owners managing 20+ FASTags simultaneously.
            </BodyText>
            <SubHeading mobile={m}>
              There are 3 user types:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal cs-bullets" style={{ fontSize: 14, lineHeight: "20px", color: "#444", letterSpacing: "0.14px", paddingLeft: m ? 12 : 16, paddingRight: m ? 12 : 16 }}>
              <li>New user</li>
              <li>Existing users (ICICI Bank and non-ICICI Bank)</li>
              <li>Fleet owners (ICICI Bank and non-ICICI Bank)</li>
            </ul>

            <ImageCarousel
              mobile={m}
              slides={[
                {
                  embed: "https://embed.figma.com/proto/zhkgGHFZUiEiSgc7WO4FQ6/Laxmi-s-portfolio---only-for-recruiters?node-id=105-28114&scaling=min-zoom&content-scaling=fixed&page-id=71%3A2831&embed-host=share",
                  caption: "Interactive prototype — walk through the landing flow",
                },
                { src: imgLandingEmpty, caption: "New user with no FASTags" },
                { src: imgLandingExisting, caption: "Existing user with ICICI Bank and other bank FASTag" },
                { src: imgLandingScrolled, caption: "Critical usecase, scrolled state — callout for critical action" },
                { src: imgLandingMenuOpen, caption: "Three-dot menu open state" },
              ]}
            />

            <SectionHeading mobile={m}>The TAB decision</SectionHeading>
            <BodyText mobile={m}>
              Early versions showed all FASTags in one mixed list — ICICI and non-ICICI together, sorted by recency. The problem: a just-linked third-party FASTag would float to the top, pushing the user's ICICI card down the scroll. Wrong for the user. Wrong for the bank.
            </BodyText>
            <BodyText mobile={m}>
              Splitting into two tabs — My FASTag and Other bank FASTag — solved both at once. ICICI cards always surface first. The tab structure tells the user what service level to expect before they open a single card.
            </BodyText>

            <LandingComparisonPanel
              before={imgTabOld}
              beforeCaption="Old design - all cards stacked by recency"
              after={[imgTabMyFastag, imgTabOtherFastag]}
              afterCaption="Tabs created to seperate the FASTags"
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-card">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>2. FASTag card exploration</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading mobile={m}>
              The problem
            </SubHeading>
            <BodyText mobile={m}>
              The card had to do five jobs: identify the vehicle, show balance, trigger recharge, flag errors, and indicate auto-recharge status. New edge cases kept arriving after the first drop — RC rejected, KYV pending, low balance, inactive — and each new state changed the layout.
            </BodyText>
            <BodyText mobile={m}>
              I went through multiple rounds before the card resolved.
            </BodyText>

            <IterationLabel mobile={m}>Iteration 1 — Started simple</IterationLabel>
            <IterationThumbnailRow
              mobile={m}
              caption="Iteration - 1"
              aspectRatio="166 / 73"
              images={[imgIter1_1, imgIter1_2, imgIter1_3, imgIter1_4, imgIter1_5, imgIter1_6]}
            />
            <BodyText mobile={m}>
              This card was the gateway to everything — all details, services, history. Get it wrong and the whole page falls apart. The first drop focused on the essentials: vehicle number, model, balance, recharge, overflow menu. The client liked it, then added to it. Urgency signals, auto-recharge status, and other bank FASTag callouts all needed to live here too.
            </BodyText>

            <IterationLabel mobile={m}>Iteration 2 — Absorbed the feedback</IterationLabel>
            <IterationThumbnailRow
              mobile={m}
              caption="Iteration - 2"
              aspectRatio="198 / 96"
              images={[imgIter2_1, imgIter2_2, imgIter2_3, imgIter2_4, imgIter2_5, imgIter2_6]}
            />
            <BodyText mobile={m}>
              It held for simple cases. Then an edge case surfaced: what if a user has low balance and a rejected RC simultaneously? Two unrelated error states, both needing attention, both fighting for the same space. They couldn't be merged — they were different problems requiring different actions. The card broke under the combination.
            </BodyText>

            <IterationLabel mobile={m}>Iteration 3 — Give errors room</IterationLabel>
            <BodyText mobile={m}>
              The fix was giving urgency signals their own space rather than forcing them into the card body. A few more variants, shown to the client, and this was approved, yayy!
            </BodyText>
            <IterationThumbnailRow
              mobile={m}
              caption="Iteration - 3"
              images={[imgIter3_1, imgIter3_2, imgIter3_3, imgIter3_4, imgIter3_5]}
            />
            <StateTreatmentTable
              mobile={m}
              rows={[
                { state: "Auto-recharge ON", treatment: "Gradient orange footer" },
                { state: "Auto-recharge OFF", treatment: "Pastel footer with CTA" },
                { state: "Low balance", treatment: "Inline peach pill with an icon" },
                { state: "RC/KYC/KYV rejected/pending", treatment: "Inline warning red pill" },
                { state: "Non-ICICI tag", treatment: "Solid grey footer, separate tab" },
              ]}
            />
            <BodyText mobile={m}>
              The anchor across all states: vehicle number, balance, recharge — always visible, always in the same position.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-details">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>3. All FASTag details</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading mobile={m}>Three card types, one layout</SubHeading>
            <BodyText mobile={m}>
              The detail page is structurally identical across all three FASTag types. What changes is the right column — the service set available to that specific tag.
            </BodyText>
            <BodyText mobile={m}>
              For an ICICI FASTag this is the full service suite: Recharge, Auto recharge, Tag replacement, Update RC, Know Your Vehicle, Close FASTag, Raise a query, View tag details.
            </BodyText>
            <BodyText mobile={m}>
              For a non-ICICI FASTag the right column reduces to three options: Recharge, Remove, and Buy ICICI FASTag.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgFastagNonIcici, caption: "Non-ICICI Bank FASTag" },
                { src: imgFastagAutoOff, caption: "ICICI Bank FASTag — Auto-recharge off" },
                { src: imgFastagAutoOn, caption: "ICICI Bank FASTag — Auto-recharge on" },
              ]}
            />

            <SubHeading mobile={m}>All states</SubHeading>
            <BodyText mobile={m}>
              There have been various states and micro-interactions added to multiple sections of the landing. Scroll to view all the interactions.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgStateDownload, caption: "Download history - button has a dropdown on hover" },
                { src: imgStateFleetDropdown, caption: "For fleet owners - more than 4 will appear inside a dropdown" },
                { src: imgStateHoverServices, caption: "Hovering on services will open a tooltip" },
              ]}
            />

            <SubHeading mobile={m}>Filter and email FASTag history</SubHeading>
            <BodyText mobile={m}>
              <strong>Filter history</strong> — Chips were added for easily filtering of the history. For customized dates, the user can filter by start and end date.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgFilterDefault, caption: "Filter history - default" },
                { src: imgFilterFilled, caption: "Filter history - filled" },
              ]}
            />
            <BodyText mobile={m}>
              <strong>Email statement</strong> — After the 1st drop, there was an additional requirement from the client that the user can only fetch the history for up to 90 days on the interface, and payments older than that would be emailed to their registered email ID.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgEmailDefault, caption: "Email statement - default state" },
                { src: imgEmailCalendar, caption: "Email statement - selecting through the calendar" },
                { src: imgEmailChips, caption: "Email statement - selecting through chips" },
                { src: imgEmailFilled, caption: "Email statement - filled" },
                { src: imgEmailToast, caption: "Email statement - a toast appears on success" },
              ]}
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-recharge">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>4. FASTag recharge</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading mobile={m}>The problem with the first version</SubHeading>
            <BodyText mobile={m}>
              The mobile reference flows had three separate recharge experiences depending on where the user came from — ICICI FASTag, linked non-ICICI, and first-time non-linked. Some were modals, some full-page, each with different data points. The same action looked different every time and the client pushed for an experience of keeping them as is. It was unsustainable to maintain, and expensive to build.
            </BodyText>
            <ImageGrid2x2 images={[imgRechargeOld1, imgRechargeOld2, imgRechargeOld3, imgRechargeOld4]} />

            <IterationLabel mobile={m}>The fix</IterationLabel>
            <BodyText mobile={m}>
              One standard recharge flow. Regardless of entry point — dashboard card, detail page, quick action panel — the user lands on the same experience with the same data points.
            </BodyText>
            <SubHeading mobile={m}>
              The vehicle type determines what's shown within that standard flow:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal cs-bullets" style={{ fontSize: 14, lineHeight: "20px", color: "#444", letterSpacing: "0.14px", paddingLeft: m ? 12 : 16, paddingRight: m ? 12 : 16 }}>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong>For a linked vehicle</strong>
                  <span>Registration number pre-filled, balance visible, straight to amount.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong>For a non-linked vehicle (first time)</strong>
                  <span>Registration number entry required, then the same flow.</span>
                </div>
              </li>
            </ul>
            <BodyText mobile={m}>
              The entry point context is resolved before the user enters the flow. Inside the flow, it is always the same.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgRechargeNew1, caption: "Recharge - for a user coming from the dashboard or all details page" },
                { src: imgRechargeNew2, caption: "Recharge - for a user coming from the dashboard from the ancillary details" },
                { src: imgRechargeNew3, caption: "Recharge - to set up AutoRecharge, the user would see use the modal" },
                { src: imgRechargeNew4, caption: "Recharge - enters from ancillary section of the dashboard with search-as-you-type input" },
                { src: imgRechargeNew5, caption: "Recharge - Success for both vehicle types with contextual upgrades" },
              ]}
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-reflection">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>Currently <em>in-development</em>, but what I took away...</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <BodyText mobile={m}>
              The requirements were half-baked and the timeline was too short for the volume. The biggest thing I learned: negotiate on scope or timeline upfront, not after you're already deep in it.
            </BodyText>
            <BodyText mobile={m}>
              Working solo on something this large taught me what I'm actually capable of under pressure. Every interaction, every click path — I was the only one deciding. That's a different kind of responsibility than working in a team, and I didn't fully appreciate it until I was in it.
            </BodyText>
            <BodyText mobile={m}>
              Redesigning an entire flow midway, defending the decision to stakeholders, and still handing off on time gave me a confidence I didn't have going in. This project showed me I can hold complexity and ship.
            </BodyText>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}

// ─── Placeholder content for CS3 ──────────────────────────────────────────────
function PlaceholderContent({ cs, isMobile }: { cs: CaseStudyInfo; isMobile: boolean }) {
  const m = isMobile;
  const s3ids = ["cs-problem", "cs-process", "cs-findings"];
  const ids = s3ids;
  const labels = ["Problem Statement", "Process", "Key Findings"];
  const placeholders = [{ h: 264, bg: "#ffffff" }, { h: 200, bg: cs.imageBg }, { h: 200, bg: cs.imageBg }];

  return (
    <div className="cs-sections" style={{ display: "flex", flexDirection: "column" }}>
      {ids.map((id, i) => (
        <SectionBlock key={id} id={id}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionHeading mobile={m}>{i + 1}. {labels[i]}</SectionHeading>
            <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
              <BodyText mobile={m}>{cs.overview}</BodyText>
              <div className="cs-img">
                <StrokedImage bgColor={placeholders[i].bg === "#ffffff" ? cs.imageBg : placeholders[i].bg} strokeColor={cs.textColor} height={placeholders[i].h} iconSize={32} />
              </div>
            </div>
          </div>
        </SectionBlock>
      ))}
    </div>
  );
}

// ─── Left panel audio button ──────────────────────────────────────────────────
function LeftPanelAudio({ color, slug }: { color: string; slug: string }) {
  const { playing, toggle, available, timeLabel } = useAudioPlayer(caseStudyAudioUrl(slug));
  return (
    <div style={{ paddingTop: 4 }}>
      <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, letterSpacing: "0.5px", color: "rgba(33,32,18,0.4)", textTransform: "uppercase", marginBottom: 8 }}>
        listen
      </p>
      <button
        onClick={toggle}
        disabled={!available}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          backgroundColor: playing ? color : "rgba(33,32,18,0.06)",
          border: "none", borderRadius: 10, padding: "10px 14px",
          cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.5,
          transition: "background 0.2s", width: "100%",
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: playing ? "rgba(255,255,255,0.3)" : color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {playing ? <Pause size={12} color="#212012" fill="#212012" /> : <Play size={12} color="#212012" fill="#212012" />}
        </div>
        <div style={{ textAlign: "left" }}>
          <p className="font-inclusive-sans font-semibold" style={{ fontSize: 12, color: "#212012", lineHeight: "15px" }}>
            {!available ? "Narration coming soon" : playing ? "Playing..." : "Hear this case study"}
          </p>
          <p className="font-inclusive-sans" style={{ fontSize: 10, color: "rgba(33,32,18,0.5)", marginTop: 1 }}>
            {available ? (playing ? timeLabel : "audio narrative") : "check back soon"}
          </p>
        </div>
      </button>
    </div>
  );
}

// ─── Main drawer component ────────────────────────────────────────────────────
interface Props {
  caseStudy: CaseStudyInfo | null;
  onClose: () => void;
  onNavigate: (cs: CaseStudyInfo) => void;
}

export function CaseStudyDetail({ caseStudy, onClose, onNavigate }: Props) {
  const isMobile = useIsMobile(768);
  const scrollableRef = useRef<HTMLDivElement>(null);
  // Desktop only: the right pane scrolls independently so the left index/listen
  // column never moves — the outer scrollableRef stays fixed for desktop.
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    if (!caseStudy) return;
    scrollableRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    rightPaneRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setScrolled(false);
    setActiveSection("");
  }, [caseStudy?.index]);

  useEffect(() => {
    const el = isMobile ? scrollableRef.current : rightPaneRef.current;
    if (!el) return;
    const handle = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", handle, { passive: true });
    return () => el.removeEventListener("scroll", handle);
  }, [caseStudy, isMobile]);

  // Esc closes the drawer the same way the close icon does.
  useEffect(() => {
    if (!caseStudy) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [caseStudy, onClose]);

  useEffect(() => {
    const el = isMobile ? scrollableRef.current : rightPaneRef.current;
    if (!el || !caseStudy) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { root: el, rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    const nodes = el.querySelectorAll("[data-section]");
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [caseStudy, isMobile]);

  const scrollToSection = useCallback((id: string) => {
    scrollableRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const sections = caseStudy ? (SECTIONS_BY_CS[caseStudy.index] ?? []) : [];
  // Running number for the index list — items flagged `noNumber` (e.g. Introduction)
  // are skipped so the first *numbered* section reads as "1.".
  const numberedSections = (() => {
    let n = 0;
    return sections.map((s) => ({ ...s, num: s.noNumber ? null : ++n }));
  })();
  const related = CASE_STUDY_DATA.filter((cs) => cs.index !== caseStudy?.index);

  return (
    <AnimatePresence>
      {caseStudy && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 499, backgroundColor: "rgba(33,32,18,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: isMobile ? "100%" : 880 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? "100%" : 880 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: isMobile ? "100%" : 880,
              zIndex: 500,
              borderRadius: isMobile ? 0 : "24px 0 0 24px",
              backgroundColor: "#e3d9ce",
              overflow: "hidden",
            }}
          >
            {/* Close button — desktop only (mobile has it in the sticky header) */}
            {!isMobile && (
              <button
                onClick={onClose}
                style={{
                  position: "absolute", top: 20, right: 20, zIndex: 20,
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1px solid rgba(98,94,55,0.2)",
                  backgroundColor: "rgba(227,217,206,0.85)",
                  backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#212012",
                }}
              >
                <X size={16} />
              </button>
            )}

            {/* Scrollable inner */}
            <div ref={scrollableRef} style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none", display: "flex", flexDirection: "column" }}>
              <style>{CS_SPACING_CSS}</style>

              {/* ── MOBILE LAYOUT ── */}
              {isMobile ? (
                <div style={{ display: "flex", flexDirection: "column", paddingBottom: 80 }}>

                  {/* Sticky mobile header: title + X */}
                  <div style={{
                    position: "sticky", top: 0, zIndex: 10,
                    backgroundColor: "#e3d9ce",
                    padding: "16px 16px 12px",
                    borderBottom: scrolled ? "1px solid rgba(33,32,18,0.1)" : "1px solid transparent",
                    transition: "border-color 0.3s ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <motion.p
                        className="font-caslon not-italic"
                        animate={{ fontSize: scrolled ? "16px" : "22px" }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ flex: 1, lineHeight: "normal", color: "#212012", fontWeight: 600 }}
                      >
                        {caseStudy.title}
                      </motion.p>
                      <button
                        onClick={onClose}
                        style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          border: "1px solid rgba(33,32,18,0.15)",
                          backgroundColor: "rgba(227,217,206,0.6)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={14} color="#212012" />
                      </button>
                    </div>
                    {/* Label pill */}
                    <Spacer size={8} />
                    {/* <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ backgroundColor: caseStudy.color, padding: "3px 10px", borderRadius: 100, display: "inline-flex" }}>
                        <p className="font-inclusive-sans font-semibold" style={{ fontSize: 9, color: caseStudy.textColor, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                          {caseStudy.label}
                        </p>
                      </div>
                      <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, color: "#c67d39", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                        {caseStudy.type}
                      </p>
                    </div> */}
                  </div>

                  {/* Hero: FASTag gets its animated cover, others keep the 264px placeholder */}
                  <div style={{ backgroundColor: "#ffffff", overflow: "hidden", flexShrink: 0 }}>
                    {caseStudy.index === 1 ? (
                      <CoverAnimation />
                    ) : (
                      <div style={{ height: 264 }}>
                        <ThumbnailPlaceholder bgColor={caseStudy.imageBg} strokeColor={caseStudy.textColor} height={264} iconSize={40} />
                      </div>
                    )}
                  </div>

                  {/* Meta table + content */}
                  <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column" }}>
                    {caseStudy.index !== 0 && (
                      <>
                        <MobileMetaTable cs={caseStudy} />
                        <Spacer size={20} />
                      </>
                    )}

                    {/* Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                      {caseStudy.index === 0
                        ? <CS1Content isMobile={true} />
                        : caseStudy.index === 1
                        ? <CS2Content isMobile={true} />
                        : <PlaceholderContent cs={caseStudy} isMobile={true} />
                      }
                    </div>
                    <Spacer size={20} />
                    <Spacer size={8} />

                    {/* Media strip — dark card */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      style={{ backgroundColor: "#212012", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}
                    >
                      {/* Audio player full-width on mobile */}
                      <AudioPlayer color={caseStudy.color} slug={caseStudy.slug} />
                    </motion.div>
                    <Spacer size={20} />
                    <Spacer size={8} />

                    {/* Related case studies — vertical stack on mobile */}
                    <div>
                      <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, letterSpacing: "0.5px", color: "rgba(33,32,18,0.4)", textTransform: "uppercase", marginBottom: 12 }}>
                        Read more
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {related.map((cs) => (
                          <RelatedCard key={cs.index} cs={cs} onClick={() => onNavigate(cs)} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── DESKTOP LAYOUT ── */
                <>
                  <style>{`.cs-drawer::-webkit-scrollbar{display:none}`}</style>

                  {/* Header — hugs the title with tight padding (no reserved dead space). It
                      collapses on scroll: the title eases down a few px and the padding tightens,
                      and the body below (flex:1) reclaims the freed height in the same motion. */}
                  <motion.div
                    animate={{ paddingTop: scrolled ? 16 : 24, paddingBottom: scrolled ? 12 : 16 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      flexShrink: 0,
                      position: "sticky", top: 0, zIndex: 10,
                      boxSizing: "border-box",
                      backgroundColor: "#e3d9ce",
                      paddingLeft: 36, paddingRight: 52,
                      display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      borderBottom: `1px solid ${scrolled ? "rgba(98,94,55,0.12)" : "transparent"}`,
                      transition: "border-color 0.3s ease",
                    }}
                  >
                    <motion.p
                      className="font-caslon not-italic"
                      animate={{ fontSize: scrolled ? "18px" : "24px" }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ color: "#212012", fontWeight: 600, lineHeight: "normal", paddingRight: 48, maxWidth: 680 }}
                    >
                      {caseStudy.title}
                    </motion.p>
                  </motion.div>

                  {/* Two-pane body: fills whatever height the header leaves. Left panel never
                      scrolls; right pane owns its own scroll. 16px inset on the left panel's
                      left/top/bottom, 36px gap to the right pane. */}
                  <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 36, padding: "16px 36px 16px 16px", position: "relative", boxSizing: "border-box" }}>

                    {/* Left panel — fixed-height sticky card. Never expands/contracts, never scrolls. */}
                    <div
                      style={{
                        width: 212, flexShrink: 0, alignSelf: "stretch",
                        position: "sticky", top: 16,
                        backgroundColor: "#DACEBE", borderRadius: 16,
                        padding: 12, boxSizing: "border-box", overflow: "hidden",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                      }}
                    >
                      <LeftPanelAudio color={caseStudy.color} slug={caseStudy.slug} />

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, letterSpacing: "0.5px", color: "rgba(33,32,18,0.4)", textTransform: "uppercase", marginBottom: 4 }}>
                          index
                        </p>
                        {numberedSections.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => scrollToSection(s.id)}
                            style={{ background: "none", border: "none", padding: "2px 0", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
                          >
                            <motion.div
                              animate={{ width: activeSection === s.id ? 3 : 0, opacity: activeSection === s.id ? 1 : 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ height: 14, backgroundColor: caseStudy.color, borderRadius: 2, flexShrink: 0, overflow: "hidden" }}
                            />
                            <p
                              className="font-inclusive-sans font-normal"
                              style={{ fontSize: 12, letterSpacing: "0.12px", color: activeSection === s.id ? "#212012" : "rgba(33,32,18,0.4)", transition: "color 0.2s ease" }}
                            >
                              {s.num != null ? `${s.num}. ` : ""}{s.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right pane — the only thing that scrolls */}
                    <div ref={rightPaneRef} className="cs-right-pane" style={{ flex: 1, minWidth: 0, maxWidth: 900, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none" }}>
                      <style>{`.cs-right-pane::-webkit-scrollbar{display:none}`}</style>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ backgroundColor: "#ffffff", borderRadius: 8, marginBottom: caseStudy.index === 0 ? 24 : 32, overflow: "hidden" }}
                      >
                        {caseStudy.index === 1 ? (
                          <CoverAnimation radius={8} />
                        ) : (
                          <div style={{ height: 264 }}>
                            <ThumbnailPlaceholder bgColor={caseStudy.imageBg} strokeColor={caseStudy.textColor} height={264} iconSize={48} />
                          </div>
                        )}
                      </motion.div>

                      {/* keyed on the case study so the chips re-run their left→right
                          slide every time this screen is opened or switched */}
                      {caseStudy.index !== 0 && (
                        <>
                          <MetaChipStrip key={caseStudy.index} caseStudy={caseStudy} />
                          <Spacer size={32} />
                        </>
                      )}

                      {caseStudy.index === 0
                        ? <CS1Content isMobile={false} />
                        : caseStudy.index === 1
                        ? <CS2Content isMobile={false} />
                        : <PlaceholderContent cs={caseStudy} isMobile={false} />
                      }

                      <Spacer size={40} />
                      <Spacer size={8} />
                      <motion.div
                        id="cs-media"
                        data-section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true, margin: "-5%" }}
                        style={{ marginBottom: 8, backgroundColor: "#212012", borderRadius: 16, padding: 24, display: "flex", gap: 20, alignItems: "center", scrollMarginTop: 88 }}
                      >
                        <VideoFrame cs={caseStudy} />
                        <AudioPlayer color={caseStudy.color} slug={caseStudy.slug} />
                      </motion.div>

                      {/* Related — now scrolls inside the same right pane */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                        style={{ padding: "48px 0 60px" }}
                      >
                        <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, letterSpacing: "0.5px", color: "rgba(33,32,18,0.4)", textTransform: "uppercase", marginBottom: 16 }}>
                          Read more
                        </p>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          {related.map((cs) => (
                            <RelatedCard key={cs.index} cs={cs} onClick={() => onNavigate(cs)} />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
