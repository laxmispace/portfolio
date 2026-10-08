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
import { MadeWithLove } from "./MadeWithLove";
import { Logo } from "./Logo";
import { RESUME_URL } from "@/app/lib/links";

export type NavSection = "home" | "projects" | "ai-projects" | "about" | "blog";
export type { NavSection as SideNavSection };

// ── SVG paths ──────────────────────────────────────────────────────────────────
const TRIANGLE_PATH =
  "M1.70796 0.5C2.05998 -0.166667 2.94002 -0.166666 3.29204 0.5L4.87611 3.5C5.22812 4.16667 4.7881 5 4.08407 5H0.915928C0.211896 5 -0.228123 4.16667 0.123893 3.5L1.70796 0.5Z";

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
// vertically on the centre of its label's row - so single and stacked shapes alike
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
  about: rowCenter(3),         // 111
  blog: rowCenter(4),          // 145
};

// ── Rule height: spans from 0 to bottom of the blogs row ─────────────────────
// Row tops: 0, 34, 68, 102, 136. Row height: 18. Last row bottom: 136+18=154.
const RULE_HEIGHT = 154;

// ── Display labels ─────────────────────
const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "home",           label: "home" },
  { id: "projects",       label: "projects" },
  { id: "ai-projects",    label: "playground" },
  { id: "about",          label: "about me" },
  { id: "blog",           label: "blogs" },
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
  if (section === "about")
    return (
      <svg width={INDICATOR_SIZE} height={INDICATOR_SIZE} viewBox="0 0 5 5" fill="none">
        <rect x="0.9" y="0.9" width="3.2" height="3.2" rx="0.5" transform="rotate(45 2.5 2.5)" fill={colors.oliveDeep} />
      </svg>
    );
  // blogs
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

function BottomLinks() {
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
      <div style={{ height: 1, alignSelf: "stretch", backgroundColor: withAlpha(colors.oliveDeep, 0.15), margin: "4px 0" }} />
      <MadeWithLove fontSize={11} />
    </div>
  );
}

// ── SideNav ────────────────────────────────────────────────────────────────────
interface SideNavProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
}

export function SideNav({ activeSection, onNavigate }: SideNavProps) {
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

      {/* ── Logo - left edge at PAD=28px ── */}
      <div style={{ position: "absolute", top: 40, left: PADDING }}>
        <Logo height={64} />
      </div>

      {/* ── Navigation block - left edge at NAV_BLOCK_L=12px ── */}
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

        {/* Single indicator - springs between rows; its centre rides the rule's centre line */}
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

        {/* Nav items: fixed 18px rows, 16px apart - the same rows INDICATOR_Y is centred on */}
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

      {/* ── Bottom links - vertical, arrowed, magnify on hover ── */}
      <BottomLinks />
    </div>
  );
}
