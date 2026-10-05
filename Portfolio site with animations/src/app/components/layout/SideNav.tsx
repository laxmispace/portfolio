import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "motion/react";
import { ArrowDownToLine, ArrowUpRight, type LucideIcon } from "lucide-react";
import { colors, withAlpha } from "@/app/theme/tokens";
import { STYLE_GUIDE_PATH } from "@/app/lib/routes";
import { MadeWithLove } from "./MadeWithLove";
import { RESUME_URL } from "@/app/lib/links";

export type NavSection = "home" | "projects" | "ai-projects" | "blog";
export type { NavSection as SideNavSection };

// ── SVG paths ──────────────────────────────────────────────────────────────────
const TRIANGLE_PATH =
  "M1.70796 0.5C2.05998 -0.166667 2.94002 -0.166666 3.29204 0.5L4.87611 3.5C5.22812 4.16667 4.7881 5 4.08407 5H0.915928C0.211896 5 -0.228123 4.16667 0.123893 3.5L1.70796 0.5Z";
const BEE_PATH =
  "M1.00004 7.22702C8.13081 1.66116 18.6884 -0.660392 25.6965 2.28072C32.6733 5.20872 36.9205 12.1424 32.6479 19.1012C31.3596 21.6302 26.8821 26.9654 19.2788 28.0744";
const STAR_SMALL_PATH =
  "M1.66713 0.175007C1.69652 -0.0583347 2.0346 -0.0583359 2.06399 0.175005L2.22316 1.43869C2.2335 1.52079 2.29333 1.58804 2.37366 1.60787L3.57906 1.90545C3.78181 1.95551 3.78181 2.24374 3.57906 2.29379L2.37366 2.59138C2.29333 2.61121 2.2335 2.67846 2.22316 2.76056L2.06399 4.02424C2.0346 4.25758 1.69652 4.25758 1.66713 4.02424L1.50796 2.76056C1.49762 2.67846 1.43779 2.61121 1.35746 2.59138L0.152064 2.29379C-0.0506878 2.24374 -0.0506879 1.95551 0.152064 1.90545L1.35746 1.60787C1.43779 1.58804 1.49762 1.52079 1.50796 1.43869L1.66713 0.175007Z";
const STAR_LARGE_PATH =
  "M2.21925 0.17665C2.24694 -0.058882 2.58883 -0.0588837 2.61652 0.176648L2.85171 2.17727C2.8613 2.25884 2.9198 2.32626 2.9992 2.34727L4.68692 2.79369C4.88539 2.84619 4.88539 3.12789 4.68692 3.18039L2.9992 3.62681C2.9198 3.64781 2.8613 3.71523 2.85171 3.79681L2.61652 5.79743C2.58883 6.03296 2.24694 6.03296 2.21926 5.79743L1.98406 3.79681C1.97447 3.71523 1.91598 3.64781 1.83657 3.62681L0.148856 3.18039C-0.0496193 3.12789 -0.0496184 2.84619 0.148857 2.79369L1.83657 2.34727C1.91598 2.32626 1.97447 2.25884 1.98406 2.17727L2.21925 0.17665Z";

// ── Layout constants ───────────────────────────────────────────────────────────
const PADDING = 28;         // equal left/right padding: name, resume, links all at 28px

// Nav block starts 12px from the sidebar edge; the rule sits 8px into it and the
// labels 18px in (9px clear of the rule).
const NAV_BLOCK_LEFT = 12;
const RULE_LEFT = 8;
const RULE_WIDTH = 1;
const NAV_TEXT_PADDING_LEFT = 18;

// ── Item layout: height=18 + gap=16 → item tops at 0, 34, 68, 102 ─────────────
// 18+16 = 34px pitch. 16px gap between text blocks as per spec.
const ITEM_HEIGHT = 18;
const ITEM_GAP = 16;

// ── Indicator ─────────────────────────────────────────────────────────────────
// Each shape is positioned by its centre: horizontally on the rule's centre line,
// vertically on the centre of its label's row — so single and stacked shapes alike
// sit exactly on the rule, level with their label.
const INDICATOR_SIZE = 9;
// The two pieces of a stacked shape (projects ▼▲, alter ego ●●) overlap by 4px.
const STACK_OVERLAP = 4;
const RULE_CENTER_X = RULE_LEFT + RULE_WIDTH / 2;

const rowCenter = (row: number) => row * (ITEM_HEIGHT + ITEM_GAP) + ITEM_HEIGHT / 2;
const INDICATOR_Y: Record<NavSection, number> = {
  home: rowCenter(0),          //   9
  projects: rowCenter(1),      //  43
  "ai-projects": rowCenter(2), //  77
  blog: rowCenter(3),          // 111
};

// ── Rule height: spans from 0 to bottom of the blog row ──────────────────────
// Row tops: 0, 34, 68, 102. Row height: 18. Last row bottom: 102+18=120.
const RULE_HEIGHT = 120;

// ── Display labels ─────────────────────
const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "home",           label: "home" },
  { id: "projects",       label: "projects" },
  { id: "ai-projects",    label: "ai playground" },
  { id: "blog",           label: "alter ego" },
];

// ── Indicator shapes ───────────────────────────────────────────────────────────
function NavIndicator({ section }: { section: NavSection }) {
  const tri = (flip = false) => (
    <svg
      width={INDICATOR_SIZE} height={INDICATOR_SIZE}
      viewBox="0 0 5 5" fill="none"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path d={TRIANGLE_PATH} fill={colors.oliveDeep} />
    </svg>
  );
  const dot = () => (
    <svg width={INDICATOR_SIZE} height={INDICATOR_SIZE} viewBox="0 0 5 5" fill="none">
      <circle cx="2.5" cy="2.5" r="2.5" fill={colors.oliveDeep} />
    </svg>
  );

  if (section === "home") return tri();
  if (section === "projects")
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {tri(true)}
        <div style={{ marginTop: -STACK_OVERLAP }}>{tri()}</div>
      </div>
    );
  if (section === "ai-projects") return dot();
  // alter ego
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {dot()}
      <div style={{ marginTop: -STACK_OVERLAP }}>{dot()}</div>
    </div>
  );
}

// ── Bottom links: vertical stack, magnify on hover ────────────────────────────
// External links get ↗; the resume download gets ⤓ (down arrow onto a base line).
const BOTTOM_LINKS: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "download resume", href: RESUME_URL, Icon: ArrowDownToLine },
  { label: "gmail",           href: "mailto:laxmimahajanwork@gmail.com", Icon: ArrowUpRight },
  { label: "github",          href: "https://github.com/laxmispace", Icon: ArrowUpRight },
  { label: "linkedin",        href: "https://in.linkedin.com/in/laxmi-mahajan", Icon: ArrowUpRight },
];

function BottomLinks({ onOpenStyleGuide }: { onOpenStyleGuide: () => void }) {
  const linkStyle = {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 13, letterSpacing: "0.02em", color: colors.oliveDeep,
    textDecoration: "none", transformOrigin: "left center",
  } as const;
  const hover = { scale: 1.12, color: colors.ink };
  const hoverTransition = { duration: 0.16, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };
  return (
    <div
      style={{
        position: "absolute", bottom: 28, left: PADDING, right: PADDING,
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
      }}
    >
      {BOTTOM_LINKS.map((l) => (
        <motion.a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-inclusive-sans lowercase"
          style={linkStyle}
          whileHover={hover}
          transition={hoverTransition}
        >
          <l.Icon size={14} strokeWidth={2} color={colors.orange} style={{ flexShrink: 0 }} />
          {l.label}
        </motion.a>
      ))}
      <motion.a
        href={STYLE_GUIDE_PATH}
        onClick={(e) => { e.preventDefault(); onOpenStyleGuide(); }}
        className="font-inclusive-sans lowercase"
        style={linkStyle}
        whileHover={hover}
        transition={hoverTransition}
      >
        <ArrowDownToLine size={14} strokeWidth={2} color={colors.orange} style={{ flexShrink: 0 }} />
        style guide
      </motion.a>
      <div style={{ height: 1, alignSelf: "stretch", backgroundColor: withAlpha(colors.oliveDeep, 0.15), margin: "4px 0" }} />
      <MadeWithLove fontSize={11} />
    </div>
  );
}

// ── SideNav ────────────────────────────────────────────────────────────────────
interface SideNavProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onOpenStyleGuide: () => void;
}

export function SideNav({ activeSection, onNavigate, onOpenStyleGuide }: SideNavProps) {
  const indicatorY = useMotionValue(INDICATOR_Y[activeSection]);

  // The filled part of the rule follows the indicator: from just past the home
  // shape down to the full rule at the last row.
  const fillH = useTransform(indicatorY, [INDICATOR_Y.home, INDICATOR_Y.blog], [INDICATOR_Y.home + INDICATOR_SIZE / 2, RULE_HEIGHT]);

  useEffect(() => {
    animate(indicatorY, INDICATOR_Y[activeSection], {
      type: "spring",
      stiffness: 480,
      damping: 42,
      restDelta: 0.01,
    });
  }, [activeSection, indicatorY]);

  return (
    <div className="w-[195px] flex-shrink-0 flex flex-col h-full relative">

      {/* ── Name — left edge at PAD=28px ── */}
      <div style={{ position: "absolute", top: 49, left: PADDING }}>
        {/* Bee illustration (relative to name) */}
        <div style={{ position: "absolute", left: 22, top: -18, pointerEvents: "none" }}>
          <svg width="36" height="30" viewBox="0 0 35.3604 29.0746" fill="none">
            <path d={BEE_PATH} stroke={colors.ink} strokeLinecap="round" strokeWidth="2" />
          </svg>
          <svg style={{ position: "absolute", top: -2, left: 14 }} width="15" height="8" viewBox="0 0 15 7.8036" fill="none">
            <ellipse cx="7.5" cy="3.9018" fill={colors.ink} rx="7.5" ry="3.9018" />
          </svg>
          <svg style={{ position: "absolute", top: 5, left: 17 }} width="9" height="5" viewBox="0 0 9.3057 4.44875" fill="none">
            <ellipse cx="4.65285" cy="2.22437" fill={colors.oliveDeep} rx="4.65285" ry="2.22437" />
          </svg>
          <svg style={{ position: "absolute", top: -2, left: 26 }} width="15" height="8" viewBox="0 0 15 7.66673" fill="none">
            <ellipse cx="7.5" cy="3.83336" fill={colors.ink} rx="7.5" ry="3.83336" />
          </svg>
          <svg style={{ position: "absolute", top: 5, left: 28 }} width="9" height="5" viewBox="0 0 8.87671 4.74718" fill="none">
            <ellipse cx="4.43835" cy="2.37359" fill={colors.oliveDeep} rx="4.43835" ry="2.37359" />
          </svg>
          <svg style={{ position: "absolute", top: -3, left: 34 }} width="5" height="5" viewBox="0 0 3.73112 4.19925" fill="none">
            <path d={STAR_SMALL_PATH} fill={colors.ink} />
          </svg>
          <svg style={{ position: "absolute", top: -9, left: 37 }} width="7" height="8" viewBox="0 0 4.83577 5.97408" fill="none">
            <path d={STAR_LARGE_PATH} fill={colors.ink} />
          </svg>
        </div>
        <p className="font-caslon text-ink uppercase leading-tight" style={{ fontSize: 24, letterSpacing: "-1.92px" }}>
          Laxmi
        </p>
        <p className="font-caslon text-ink leading-tight" style={{ fontSize: 24, letterSpacing: "-1.68px" }}>
          MAHA<em>J</em>AN
        </p>
      </div>

      {/* ── Navigation block — left edge at NAV_BLOCK_L=12px ── */}
      <div style={{ position: "absolute", top: 306, left: NAV_BLOCK_LEFT }}>

        {/* Background track: full LINE_H, very faint */}
        <div style={{
          position: "absolute", left: RULE_LEFT, top: 0,
          width: RULE_WIDTH, height: RULE_HEIGHT,
          backgroundColor: colors.sandLine,
        }} />

        {/* Animated fill: grows from top as activeSection advances.
            fillH is derived from indicatorY, so it spring-animates in sync. */}
        <motion.div style={{
          position: "absolute", left: RULE_LEFT, top: 0,
          width: RULE_WIDTH, height: fillH,
          backgroundColor: colors.oliveDeep,
        }} />

        {/* Single indicator — springs between rows; its centre rides the rule's centre line */}
        <motion.div style={{
          position: "absolute", left: RULE_CENTER_X, top: 0,
          y: indicatorY,
          width: 0, height: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
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

        {/* Nav items: fixed 18px rows, 16px apart — the same rows INDICATOR_Y is centred on */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: ITEM_GAP,
          paddingLeft: NAV_TEXT_PADDING_LEFT,
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={isActive ? "font-caslon not-italic" : "font-inclusive-sans font-normal uppercase"}
                style={{
                  // Fixed row height keeps each label centred on its INDICATOR_Y row.
                  height: ITEM_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  // Active font size increased by 4px (14→18)
                  fontSize: isActive ? 18 : 14,
                  letterSpacing: isActive ? "-0.28px" : "0.56px",
                  color: isActive ? colors.oliveDeep : colors.orange,
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

      {/* ── Bottom links — vertical, arrowed, magnify on hover ── */}
      <BottomLinks onOpenStyleGuide={onOpenStyleGuide} />
    </div>
  );
}
