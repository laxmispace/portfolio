import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "motion/react";

export type NavSection = "home" | "projects" | "ai-playground" | "tinkering";
export type { NavSection as SideNavSection };

// ── SVG paths ──────────────────────────────────────────────────────────────────
const TRIANGLE =
  "M1.70796 0.5C2.05998 -0.166667 2.94002 -0.166666 3.29204 0.5L4.87611 3.5C5.22812 4.16667 4.7881 5 4.08407 5H0.915928C0.211896 5 -0.228123 4.16667 0.123893 3.5L1.70796 0.5Z";
const BEE_PATH =
  "M1.00004 7.22702C8.13081 1.66116 18.6884 -0.660392 25.6965 2.28072C32.6733 5.20872 36.9205 12.1424 32.6479 19.1012C31.3596 21.6302 26.8821 26.9654 19.2788 28.0744";
const STAR_SM =
  "M1.66713 0.175007C1.69652 -0.0583347 2.0346 -0.0583359 2.06399 0.175005L2.22316 1.43869C2.2335 1.52079 2.29333 1.58804 2.37366 1.60787L3.57906 1.90545C3.78181 1.95551 3.78181 2.24374 3.57906 2.29379L2.37366 2.59138C2.29333 2.61121 2.2335 2.67846 2.22316 2.76056L2.06399 4.02424C2.0346 4.25758 1.69652 4.25758 1.66713 4.02424L1.50796 2.76056C1.49762 2.67846 1.43779 2.61121 1.35746 2.59138L0.152064 2.29379C-0.0506878 2.24374 -0.0506879 1.95551 0.152064 1.90545L1.35746 1.60787C1.43779 1.58804 1.49762 1.52079 1.50796 1.43869L1.66713 0.175007Z";
const STAR_LG =
  "M2.21925 0.17665C2.24694 -0.058882 2.58883 -0.0588837 2.61652 0.176648L2.85171 2.17727C2.8613 2.25884 2.9198 2.32626 2.9992 2.34727L4.68692 2.79369C4.88539 2.84619 4.88539 3.12789 4.68692 3.18039L2.9992 3.62681C2.9198 3.64781 2.8613 3.71523 2.85171 3.79681L2.61652 5.79743C2.58883 6.03296 2.24694 6.03296 2.21926 5.79743L1.98406 3.79681C1.97447 3.71523 1.91598 3.64781 1.83657 3.62681L0.148856 3.18039C-0.0496193 3.12789 -0.0496184 2.84619 0.148857 2.79369L1.83657 2.34727C1.91598 2.32626 1.97447 2.25884 1.98406 2.17727L2.21925 0.17665Z";

// ── Layout constants ───────────────────────────────────────────────────────────
const PAD = 28;         // equal left/right padding: name, resume, links all at 28px

// Nav block starts at left=12px from sidebar edge.
// Items at 12+18=30px (≈28px), indicator at 12+5=17px, line at 12+8=20px.
const NAV_BLOCK_L = 12;
const LINE_L = 8;       // line left within nav block → 12+8=20px from sidebar edge
const IND_L = 5;        // indicator left within nav block → 12+5=17px from sidebar edge
const NAV_TEXT_PL = 18; // text padding-left within nav block → 12+18=30px from sidebar edge
// Gap from line right edge (21px) to text (30px) = 9px — within user-spec of 8-12px ✓

// ── Item layout: height=18 + gap=16 → item tops at 0, 34, 68, 102 ─────────────
// 18+16 = 34px pitch. 16px gap between text blocks as per spec.
const ITEM_H = 18;
const ITEM_GAP = 16;

// ── Indicator size +4px: 5px → 9px ────────────────────────────────────────────
const IND_SZ = 9;

// Indicator is vertically centred in each 18px row.
// Centred y-offset from row top: (ITEM_H − IND_SZ) / 2 = 4.5 ≈ 5
const IND_OFFSET = 5;

// Indicator y-positions within nav block (indicator top = row_top + IND_OFFSET)
const NAV_Y: Record<NavSection, number> = {
  home:            0 + IND_OFFSET,  //  5
  projects:       34 + IND_OFFSET,  // 39
  "ai-playground": 68 + IND_OFFSET, // 73
  tinkering:     102 + IND_OFFSET,  // 107
};

// ── Line height: spans from 0 to bottom of tinkering row ──────────────────────
// Row tops: 0, 34, 68, 102. Row height: 18. Last row bottom: 102+18=120.
const LINE_H = 120;

// ── Display labels (alter ego replaces tinkering hobbies) ─────────────────────
const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "home",           label: "home" },
  { id: "projects",       label: "projects" },
  { id: "ai-playground",  label: "ai playground" },
  { id: "tinkering",      label: "alter ego" },
];

// ── Indicator shapes ───────────────────────────────────────────────────────────
function NavIndicator({ section }: { section: NavSection }) {
  const tri = (flip = false) => (
    <svg
      width={IND_SZ} height={IND_SZ}
      viewBox="0 0 5 5" fill="none"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path d={TRIANGLE} fill="#625E37" />
    </svg>
  );
  const dot = () => (
    <svg width={IND_SZ} height={IND_SZ} viewBox="0 0 5 5" fill="none">
      <circle cx="2.5" cy="2.5" r="2.5" fill="#625E37" />
    </svg>
  );

  if (section === "home") return tri();
  if (section === "projects")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {tri(true)}
        {tri()}
      </div>
    );
  if (section === "ai-playground") return dot();
  // alter ego
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {dot()}
      {dot()}
    </div>
  );
}

// ── Resume button: full-width, documents pop from behind on hover ──────────────
const BUTTON_H = 38;

function ResumeButton() {
  const [hov, setHov] = useState(false);

  // Two document rectangles that pop from behind the button.
  // They live in a zero-height layer anchored at the button's top edge (bottom: BUTTON_H).
  // At rest: y=10 (tucked below button top edge, behind button via z-index).
  // On hover: animate upward (y negative) so they appear above the button.
  const DOC_W = 40;
  const DOC_H = 52;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ position: "absolute", left: PAD, right: PAD, bottom: 72 }}
    >
      {/* Document layer — height:0, overflow:visible, z-index BELOW button */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          bottom: BUTTON_H,
          height: 0,
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {/* Back document: starts tucked behind button, slides up & rotates CCW */}
        <motion.div
          animate={{
            y: hov ? -22 : 10,
            opacity: hov ? 0.85 : 0,
            rotate: hov ? -7 : 0,
            scale: hov ? 1 : 0.8,
          }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1], delay: hov ? 0.04 : 0 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            marginLeft: -(DOC_W / 2) - 6,  // shifted 6px left of centre
            width: DOC_W,
            height: DOC_H,
            backgroundColor: "#d2ce93",
            border: "1.5px solid #625e37",
            borderRadius: 4,
          }}
        />
        {/* Front document: slightly right of back, rotates CW */}
        <motion.div
          animate={{
            y: hov ? -12 : 10,
            opacity: hov ? 1 : 0,
            rotate: hov ? 6 : 0,
            scale: hov ? 1 : 0.8,
          }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            marginLeft: -(DOC_W / 2) + 4,  // shifted 4px right of centre
            width: DOC_W,
            height: DOC_H,
            backgroundColor: "#ece6df",
            border: "1.5px solid #625e37",
            borderRadius: 4,
          }}
        />
      </div>

      {/* The actual button — z-index above documents so they hide behind it at rest */}
      <motion.a
        href="https://drive.google.com/file/d/1cm1x-y31ugOERxl7MaLuoOYGnNq0r1p0/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        animate={{ borderColor: hov ? "rgba(198,125,57,0)" : "rgba(198,125,57,1)" }}
        transition={{ duration: 0.2 }}
        style={{
          width: "100%",
          height: BUTTON_H,
          position: "relative",
          border: "1px solid #c67d39",
          borderRadius: 8,
          overflow: "hidden",
          background: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          textDecoration: "none",
        }}
      >
        {/* Dark fill sweeps from left on hover */}
        <motion.div
          animate={{ scaleX: hov ? 1 : 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", inset: 0,
            backgroundColor: "#212012",
            transformOrigin: "left center",
          }}
        />
        {/* "Resume" — no copy change; text reduced to 12px */}
        <span
          className="font-jakarta font-medium uppercase"
          style={{
            position: "relative", zIndex: 1,
            fontSize: 12,
            letterSpacing: "0.56px",
            color: hov ? "#e3d9ce" : "#c67d39",
            transition: "color 0.22s ease",
            pointerEvents: "none",
          }}
        >
          Resume
        </span>
      </motion.a>
    </div>
  );
}

// ── SideNav ────────────────────────────────────────────────────────────────────
interface SideNavProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onAboutOpen?: () => void;
}

export function SideNav({ activeSection, onNavigate, onAboutOpen }: SideNavProps) {
  const indicatorY = useMotionValue(NAV_Y[activeSection]);

  // fillH tracks indicatorY via a smooth transform — no separate animation needed.
  // At home (y=5) → fill covers home indicator bottom (≈14px).
  // At alter ego (y=83) → fill reaches LINE_H (96px).
  const fillH = useTransform(indicatorY, [NAV_Y.home, NAV_Y.tinkering], [IND_SZ + IND_OFFSET, LINE_H]);

  useEffect(() => {
    animate(indicatorY, NAV_Y[activeSection], {
      type: "spring",
      stiffness: 480,
      damping: 42,
      restDelta: 0.01,
    });
  }, [activeSection, indicatorY]);

  return (
    <div className="w-[195px] flex-shrink-0 flex flex-col h-full relative">

      {/* ── Name — left edge at PAD=28px ── */}
      <div style={{ position: "absolute", top: 49, left: PAD }}>
        {/* Bee illustration (relative to name) */}
        <div style={{ position: "absolute", left: 22, top: -18, pointerEvents: "none" }}>
          <svg width="36" height="30" viewBox="0 0 35.3604 29.0746" fill="none">
            <path d={BEE_PATH} stroke="#212012" strokeLinecap="round" strokeWidth="2" />
          </svg>
          <svg style={{ position: "absolute", top: -2, left: 14 }} width="15" height="8" viewBox="0 0 15 7.8036" fill="none">
            <ellipse cx="7.5" cy="3.9018" fill="#212012" rx="7.5" ry="3.9018" />
          </svg>
          <svg style={{ position: "absolute", top: 5, left: 17 }} width="9" height="5" viewBox="0 0 9.3057 4.44875" fill="none">
            <ellipse cx="4.65285" cy="2.22437" fill="#625E37" rx="4.65285" ry="2.22437" />
          </svg>
          <svg style={{ position: "absolute", top: -2, left: 26 }} width="15" height="8" viewBox="0 0 15 7.66673" fill="none">
            <ellipse cx="7.5" cy="3.83336" fill="#212012" rx="7.5" ry="3.83336" />
          </svg>
          <svg style={{ position: "absolute", top: 5, left: 28 }} width="9" height="5" viewBox="0 0 8.87671 4.74718" fill="none">
            <ellipse cx="4.43835" cy="2.37359" fill="#625E37" rx="4.43835" ry="2.37359" />
          </svg>
          <svg style={{ position: "absolute", top: -3, left: 34 }} width="5" height="5" viewBox="0 0 3.73112 4.19925" fill="none">
            <path d={STAR_SM} fill="#1E1E1E" />
          </svg>
          <svg style={{ position: "absolute", top: -9, left: 37 }} width="7" height="8" viewBox="0 0 4.83577 5.97408" fill="none">
            <path d={STAR_LG} fill="#1E1E1E" />
          </svg>
        </div>
        <p className="font-caslon text-[#212012] uppercase leading-tight" style={{ fontSize: 24, letterSpacing: "-1.92px" }}>
          Laxmi
        </p>
        <p className="font-caslon text-[#212012] leading-tight" style={{ fontSize: 24, letterSpacing: "-1.68px" }}>
          MAHA<em>J</em>AN
        </p>
      </div>

      {/* ── Navigation block — left edge at NAV_BLOCK_L=12px ── */}
      <div style={{ position: "absolute", top: 306, left: NAV_BLOCK_L }}>

        {/* Background track: full LINE_H, very faint */}
        <div style={{
          position: "absolute", left: LINE_L, top: 0,
          width: 1, height: LINE_H,
          backgroundColor: "#D1C0AE",
        }} />

        {/* Animated fill: grows from top as activeSection advances.
            fillH is derived from indicatorY, so it spring-animates in sync. */}
        <motion.div style={{
          position: "absolute", left: LINE_L, top: 0,
          width: 1, height: fillH,
          backgroundColor: "#625e37",
        }} />

        {/* Single indicator — springs between NAV_Y positions */}
        <motion.div style={{
          position: "absolute", left: IND_L, top: 0,
          y: indicatorY,
          display: "flex", alignItems: "center",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.14 }}
            >
              <NavIndicator section={activeSection} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Nav items:
            height=ITEM_H(18) + gap=ITEM_GAP(8) → 18+8=26px pitch
            → item tops: 0, 26, 52, 78 = NAV_Y row tops ✓ (alignment fixed) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: ITEM_GAP,
          paddingLeft: NAV_TEXT_PL,
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={isActive ? "font-caslon not-italic" : "font-jakarta font-medium uppercase"}
                style={{
                  // Fixed row height keeps item tops at exact NAV_Y row positions.
                  // Text is centred vertically inside via alignItems.
                  height: ITEM_H,
                  display: "flex",
                  alignItems: "center",
                  // Active font size increased by 4px (14→18)
                  fontSize: isActive ? 18 : 14,
                  letterSpacing: isActive ? "-0.28px" : "0.56px",
                  color: isActive ? "#625e37" : "#c67d39",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.12 }}
              >
                {item.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Resume — full-width between PAD margins, with document-pop hover ── */}
      <ResumeButton />

      {/* ── Links — centre-aligned within the 195px sidebar ── */}
      <div style={{
        position: "absolute", bottom: 28, left: 0, right: 0,
        display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
      }}>
        <motion.a
          href="https://in.linkedin.com/in/laxmi-mahajan"
          target="_blank"
          rel="noopener noreferrer"
          className="font-caslon lowercase underline"
          style={{ fontSize: 14, color: "#625e37" }}
          whileHover={{ color: "#212012", fontStyle: "italic" }}
          transition={{ duration: 0.15 }}
        >
          linkedin
        </motion.a>
        <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#C3BE6F" }} />
        <motion.a
          href="mailto:laxmimahajanwork@gmail.com"
          className="font-caslon lowercase underline"
          style={{ fontSize: 14, color: "#625e37" }}
          whileHover={{ color: "#212012", fontStyle: "italic" }}
          transition={{ duration: 0.15 }}
        >
          gmail
        </motion.a>
      </div>
    </div>
  );
}
