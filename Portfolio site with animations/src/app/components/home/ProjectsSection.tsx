import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useMotionValue } from "motion/react";
import { useScrollProgress, useScrollContainer } from "@/app/context/ScrollContext";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { CaseStudyDrawer, CASE_STUDY_DATA, type CaseStudyInfo } from "@/app/components/case-study/CaseStudyDrawer";
import { ThumbnailPlaceholder } from "@/app/components/case-study/CaseStudyPrimitives";
import imgIciciLogo from "@/assets/case-studies/icici-logo.png";
import { colors, withAlpha } from "@/app/theme/tokens";

const DESKTOP_HEADER_HEIGHT = 183;
const DESKTOP_CARD_HEIGHT = 418;
const EXTRA_SCROLL = 700;
const DESKTOP_TAB_LEFT = [34, 253, 472];

// Mobile sticky-stack sizing (mirrors DARK_H but for the narrower phone layout).
// Mobile card height isn't fixed: every card hugs its content and the stack uses the tallest.
const MOBILE_HEADER_HEIGHT = 90;
const MOBILE_CARD_PADDING = 16;
// Each later card settles this far below the previous one, leaving its tab + a sliver visible.
const STACK_STEP = 14;

function IciciBankLogo() {
  return (
    <div style={{ width: 80, height: 16, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <img
        src={imgIciciLogo}
        alt="ICICI Bank"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}

function CardTab({ color, label, compact = false }: { color: string; label: string; compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "relative", top: "-0.5px",left:"0.25px" }}>
<path d="M11 10H0C7.65088 9.76396 10.5919 8.59449 11 0V10Z" fill={color}/>
</svg>

      <div
        style={{
          backgroundColor: color,
          padding: compact ? "6px 12px" : "8px 16px",
          borderRadius: compact ? "12px 12px 0 0" : "16px 16px 0 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <p className="font-inclusive-sans font-medium text-ink whitespace-nowrap" style={{ fontSize: compact ? 11 : 12, letterSpacing: "0.25px" }}>
          {label}
        </p>
      </div>
      <div>
<svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "relative", top: "-0.5px",left:"-0.25px" }}>
<path d="M0 10H11C3.34912 9.76396 0.408119 8.59449 0 0V10Z" fill={color}/>
</svg>

      </div>
    </div>
  );
}

interface CardConfig {
  bgColor: string;
  imageBg: string;
  dotColor: string;
  textColor: string;
  label: string;
  tabLeft: number;
  imageLeft: boolean;
  roundedAll: boolean;
  clientName: string;
  clientBadgeBg: string;
  isIcici: boolean;
  cardTitle: string;
  statusText: string;
  statusColor: string;
}

const CASE_STUDY_CARDS: CardConfig[] = [
  {
    bgColor: colors.olive,
    imageBg: colors.oliveLight,
    dotColor: colors.oliveDeep,
    textColor: colors.oliveDeep,
    label: "CASE STUDY 1",
    tabLeft: DESKTOP_TAB_LEFT[0],
    imageLeft: true,
    roundedAll: false,
    clientName: "ICICI Bank",
    clientBadgeBg: withAlpha(colors.oliveDeep, 0.15),
    isIcici: true,
    cardTitle: "Redesigning how 10M+ ICICI Bank cardholders activate their card for international travel",
    statusText: "under development • 2026",
    statusColor: colors.oliveDeep,
  },
  {
    bgColor: colors.orange,
    imageBg: colors.orangeLight,
    dotColor: colors.ink,
    textColor: colors.ink,
    label: "CASE STUDY 2",
    tabLeft: DESKTOP_TAB_LEFT[1],
    imageLeft: false,
    roundedAll: false,
    clientName: "ICICI Bank",
    clientBadgeBg: withAlpha(colors.ink, 0.12),
    isIcici: false,
    cardTitle: "Bringing India's most-used toll payment system to ICICI's web platform — for the first time",
    statusText: "under development • 2026",
    statusColor: colors.ink,
  },
  {
    bgColor: colors.pink,
    imageBg: colors.pinkLight,
    dotColor: colors.ink,
    textColor: colors.ink,
    label: "CASE STUDY 3",
    tabLeft: DESKTOP_TAB_LEFT[2],
    imageLeft: true,
    roundedAll: true,
    clientName: "Viisa • Freelance",
    clientBadgeBg: withAlpha(colors.ink, 0.1),
    isIcici: false,
    cardTitle: "AI experiments — exploring what's possible with LLMs",
    statusText: "Completed • 2023",
    statusColor: colors.ink,
  },
];

function ClientBadge({ card }: { card: CardConfig }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: card.clientBadgeBg,
        padding: "6px 8px",
        borderRadius: 8,
        alignSelf: "flex-start",
      }}
    >
      {card.isIcici ? (
        <IciciBankLogo />
      ) : (
        <p className="font-inclusive-sans font-semibold" style={{ fontSize: 12, color: card.textColor, letterSpacing: "0.24px" }}>
          {card.clientName}
        </p>
      )}
    </div>
  );
}

function CardTags({ card }: { card: CardConfig }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.44px", color: card.textColor, opacity: 0.8 }}>
        UX + UI
      </p>
      <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
        <circle cx="1.5" cy="1.5" r="1.5" fill={card.dotColor} />
      </svg>
      <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.44px", color: card.textColor, opacity: 0.8 }}>
        Sole designer
      </p>
    </div>
  );
}

// Thin rule + status left / "read case study →" right
function CardFooter({ card, hovered }: { card: CardConfig; hovered: boolean }) {
  return (
    <div>
      <div style={{ height: 1, backgroundColor: `${card.dotColor}30`, marginBottom: 12 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 10, letterSpacing: "0.4px", color: card.statusColor, opacity: 0.65 }}>
          {card.statusText}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <p
            className="font-caslon"
            style={{
              fontSize: 14,
              color: colors.ink,
              fontStyle: "italic",
              textDecoration: hovered ? "underline" : "none",
              transition: "text-decoration 0.1s",
            }}
          >
            read case study
          </p>
          <motion.p
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-caslon"
            style={{ fontSize: 15, color: colors.ink, lineHeight: 1 }}
          >
            →
          </motion.p>
        </div>
      </div>
    </div>
  );
}

function CardBody({ card, hovered, onClick }: { card: CardConfig; hovered: boolean; onClick?: () => void }) {
  const imgBox = (
    <div style={{ flex: "676 0 0", borderRadius: 8, overflow: "hidden", alignSelf: "stretch" }}>
      <motion.div
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: "100%" }}
      >
        <ThumbnailPlaceholder bgColor={card.imageBg} strokeColor={card.textColor} height="100%" iconSize={40} />
      </motion.div>
    </div>
  );

  // Editorial layout: badge+tags top → title fills middle → separator → status+CTA bottom
  const textBox = (
    <div style={{ flex: "305 0 0", alignSelf: "stretch", display: "flex", flexDirection: "column" }}>
      {/* Top: badge + tags */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ClientBadge card={card} />
        <CardTags card={card} />
      </div>

      {/* Middle: title anchored to bottom of its flex zone */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", padding: "16px 0 0" }}>
        <p
          className="font-caslon not-italic"
          style={{ fontSize: 30, lineHeight: "37px", color: colors.ink, fontWeight: 600 }}
        >
          {card.cardTitle}
        </p>
      </div>

      {/* Bottom: thin rule + status left / read CTA right */}
      <div style={{ marginTop: 20 }}>
        <CardFooter card={card} hovered={hovered} />
      </div>
    </div>
  );

  return (
    <div
      onClick={onClick}
      style={{
        height: DESKTOP_CARD_HEIGHT,
        backgroundColor: card.bgColor,
        borderRadius: card.roundedAll ? 16 : "16px 16px 0 0",
        overflow: "hidden",
        display: "flex",
        flexDirection: card.imageLeft ? "row" : "row-reverse",
        padding: 36,
        gap: 16,
        alignItems: "stretch",
        cursor: "pointer",
      }}
    >
      {imgBox}
      {textBox}
    </div>
  );
}

// Wraps tab + body so they share a single hover state — entire card lifts as unit
function CardWithTab({ card, onClick }: { card: CardConfig; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      style={{ position: "relative" }}
      animate={{ y: hovered ? -6 : 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: "absolute", bottom: "calc(100% - 1px)", left: card.tabLeft }}>
        <CardTab color={card.bgColor} label={card.label} />
      </div>
      <CardBody card={card} hovered={hovered} onClick={onClick} />
    </motion.div>
  );
}

// ── Mobile card ────────────────────────────────────────────────────────────────
// Same content as the web card (badge, tags, title, status + read CTA), stacked
// vertically. The card hugs its content; `height` is the tallest card's height so
// the three stack cleanly, and `onMeasure` reports this card's natural height.
// Tabs sit left / centre / right (inset so both curves land on the card) so the
// three stacked tabs never cover each other.
const MOBILE_TAB_POSITION: React.CSSProperties[] = [
  { left: 16 },
  { left: "50%", transform: "translateX(-50%)" },
  { right: 16 },
];

function MobileStackCard({
  card, index, height, onMeasure, onClick,
}: {
  card: CardConfig; index: number; height?: number; onMeasure: (index: number, h: number) => void; onClick: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onMeasure(index, el.offsetHeight + MOBILE_CARD_PADDING * 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, [index, onMeasure]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", bottom: "calc(100% - 1px)", ...MOBILE_TAB_POSITION[index] }}>
        <CardTab color={card.bgColor} label={card.label} compact />
      </div>
      <div
        onClick={onClick}
        style={{
          backgroundColor: card.bgColor,
          borderRadius: card.roundedAll ? 16 : "16px 16px 0 0",
          overflow: "hidden",
          cursor: "pointer",
          height,
          padding: MOBILE_CARD_PADDING,
          boxSizing: "border-box",
        }}
      >
        <div ref={contentRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ height: 172, borderRadius: 8, overflow: "hidden" }}>
            <ThumbnailPlaceholder bgColor={card.imageBg} strokeColor={card.textColor} height="100%" iconSize={28} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ClientBadge card={card} />
            <CardTags card={card} />
          </div>
          <p className="font-caslon not-italic" style={{ fontSize: 22, lineHeight: "28px", color: colors.ink, fontWeight: 600 }}>
            {card.cardTitle}
          </p>
          <CardFooter card={card} hovered={false} />
        </div>
      </div>
    </div>
  );
}

// Case study slug in the URL, e.g. /portfolio/case-study/icici-bank-onboarding
// (base-aware so it matches the app's deployed path, see vite.config.ts `base`)
const CASE_STUDY_BASE = `${import.meta.env.BASE_URL}case-study/`;
const caseStudyUrl = (slug: string) => `${CASE_STUDY_BASE}${slug}`;
const slugFromPath = (pathname: string) =>
  pathname.startsWith(CASE_STUDY_BASE) ? pathname.slice(CASE_STUDY_BASE.length).replace(/\/$/, "") : null;

export function ProjectsSection({ onDrawerChange }: { onDrawerChange?: (open: boolean) => void }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [selectedCase, setSelectedCase] = useState<CaseStudyInfo | null>(null);

  // Give the drawer real page semantics: pushing a slugged URL means the browser's
  // back button closes the drawer instead of leaving the site entirely.
  const openCase = (cs: CaseStudyInfo) => {
    setSelectedCase(cs);
    onDrawerChange?.(true);
    window.history.pushState({ caseStudySlug: cs.slug }, "", caseStudyUrl(cs.slug));
  };

  const closeCase = () => {
    if (window.history.state?.caseStudySlug) {
      window.history.back();
    } else {
      setSelectedCase(null);
      onDrawerChange?.(false);
    }
  };

  // Deep link: landing directly on the case-study URL opens that drawer.
  // Replace the entry first so "back" from the drawer always lands on the
  // plain portfolio URL rather than exiting the site.
  useEffect(() => {
    const slug = slugFromPath(window.location.pathname);
    const cs = slug ? CASE_STUDY_DATA.find((c) => c.slug === slug) : undefined;
    if (cs) {
      window.history.replaceState(null, "", import.meta.env.BASE_URL);
      window.history.pushState({ caseStudySlug: cs.slug }, "", caseStudyUrl(cs.slug));
      setSelectedCase(cs);
      onDrawerChange?.(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser back/forward: sync the drawer to whatever slug (or lack of one) the
  // history entry we've landed on carries.
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const slug = (e.state as { caseStudySlug?: string } | null)?.caseStudySlug;
      const cs = slug ? CASE_STUDY_DATA.find((c) => c.slug === slug) : undefined;
      setSelectedCase(cs ?? null);
      onDrawerChange?.(!!cs);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollYProgress = useScrollProgress(outerRef, ["start start", "end end"]);

  // The stack is exactly as tall as its content: header + two stack steps + one card,
  // so the dark container ends where the last (pink) card ends. It pins centred in the
  // visible scroll area (not the window — on mobile that's shorter than 100vh).
  const scrollEl = useScrollContainer();
  const [viewportH, setViewportH] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  useEffect(() => {
    if (!scrollEl) return;
    const ro = new ResizeObserver(() => setViewportH(scrollEl.clientHeight));
    ro.observe(scrollEl);
    return () => ro.disconnect();
  }, [scrollEl]);

  const [mobileHeights, setMobileHeights] = useState<number[]>([]);
  const onMeasure = useCallback((index: number, h: number) => {
    setMobileHeights((prev) => (prev[index] === h ? prev : Object.assign([...prev], { [index]: h })));
  }, []);
  const mobileCardH = mobileHeights.length ? Math.max(...mobileHeights.filter(Boolean)) : 0;

  const headerH = isMobile ? MOBILE_HEADER_HEIGHT : DESKTOP_HEADER_HEIGHT;
  const cardH = isMobile ? mobileCardH : DESKTOP_CARD_HEIGHT;
  const stackH = headerH + STACK_STEP * 2 + cardH;
  // Cards 2/3 wait just below the container's bottom edge (clipped), then slide up.
  const offY = STACK_STEP * 2 + cardH;

  const card2Y = useMotionValue(offY);
  const card3Y = useMotionValue(offY);

  useEffect(() => {
    const update = (v: number) => {
      const t2 = v <= 0 ? 0 : v >= 0.4 ? 1 : v / 0.4;
      card2Y.set(offY + (STACK_STEP - offY) * t2);
      const t3 = v <= 0.5 ? 0 : v >= 0.9 ? 1 : (v - 0.5) / 0.4;
      card3Y.set(offY + (STACK_STEP * 2 - offY) * t3);
    };
    const unsubScroll = scrollYProgress.on("change", update);
    update(scrollYProgress.get());
    return unsubScroll;
  }, [scrollYProgress, card2Y, card3Y, offY]);

  const stackContainer = (children: React.ReactNode) => (
    <div
      ref={outerRef}
      style={{ height: stackH + EXTRA_SCROLL, position: "relative", overflow: "clip" }}
    >
      <div
        style={{
          position: "sticky",
          top: Math.max(0, (viewportH - stackH) / 2),
          height: stackH,
          overflow: "hidden",
          backgroundColor: colors.ink,
          borderRadius: 16,
        }}
      >
        {children}
      </div>
    </div>
  );

  if (isMobile) {
    const layer = (i: number) => (
      <MobileStackCard
        card={CASE_STUDY_CARDS[i]}
        index={i}
        height={mobileCardH || undefined}
        onMeasure={onMeasure}
        onClick={() => openCase(CASE_STUDY_DATA[i])}
      />
    );
    return (
      <>
        <CaseStudyDrawer caseStudy={selectedCase} onClose={closeCase} onNavigate={openCase} />

        {stackContainer(
          <>
            <p
              className="font-caslon text-center"
              style={{ position: "absolute", top: 24, left: 0, right: 0, color: colors.sand, fontSize: 24, lineHeight: "30px" }}
            >
              select projects
            </p>

            <div style={{ position: "absolute", top: MOBILE_HEADER_HEIGHT, left: 0, right: 0, zIndex: 1 }}>{layer(0)}</div>
            <motion.div style={{ position: "absolute", top: MOBILE_HEADER_HEIGHT, left: 0, right: 0, zIndex: 2, y: card2Y }}>{layer(1)}</motion.div>
            <motion.div style={{ position: "absolute", top: MOBILE_HEADER_HEIGHT, left: 0, right: 0, zIndex: 3, y: card3Y }}>{layer(2)}</motion.div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <CaseStudyDrawer
        caseStudy={selectedCase}
        onClose={closeCase}
        onNavigate={openCase}
      />

      {stackContainer(
        <>
          <p
            className="font-caslon text-center"
            style={{ position: "absolute", top: 48, left: 0, right: 0, color: colors.sand, fontSize: 48, lineHeight: "56px" }}
          >
            select projects
          </p>

          {/* CS1 */}
          <div style={{ position: "absolute", top: DESKTOP_HEADER_HEIGHT, left: 0, right: 0, zIndex: 1 }}>
            <CardWithTab card={CASE_STUDY_CARDS[0]} onClick={() => openCase(CASE_STUDY_DATA[0])} />
          </div>

          {/* CS2 */}
          <motion.div style={{ position: "absolute", top: DESKTOP_HEADER_HEIGHT, left: 0, right: 0, zIndex: 2, y: card2Y }}>
            <CardWithTab card={CASE_STUDY_CARDS[1]} onClick={() => openCase(CASE_STUDY_DATA[1])} />
          </motion.div>

          {/* CS3 */}
          <motion.div style={{ position: "absolute", top: DESKTOP_HEADER_HEIGHT, left: 0, right: 0, zIndex: 3, y: card3Y }}>
            <CardWithTab card={CASE_STUDY_CARDS[2]} onClick={() => openCase(CASE_STUDY_DATA[2])} />
          </motion.div>
        </>
      )}
    </>
  );
}
