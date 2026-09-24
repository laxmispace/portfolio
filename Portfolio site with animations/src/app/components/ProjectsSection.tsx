import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { useScrollProgress } from "../ScrollContext";
import { useIsMobile } from "../useIsMobile";
import {
  CaseStudyDetail,
  CASE_STUDY_DATA,
  ThumbnailPlaceholder,
  type CaseStudyInfo,
} from "./CaseStudyDetail";
import imgIciciLogo from "../../assets/Cards - CS/ICICI logo.png";

const DARK_H = 183;
const CARD_H = 418;
const EXTRA_SCROLL = 700;
const CORNER = "M17.6301 16.5H0C12.2624 16.1105 16.976 14.1809 17.6301 0V16.5Z";
const TAB_LEFT = [34, 253, 472];

// Mobile sticky-stack sizing (mirrors DARK_H/CARD_H but for the narrower phone layout)
const MOBILE_DARK_H = 90;
const MOBILE_CARD_H = 478;

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

function CardTab({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "relative", top: "-0.5px",left:"0.25px" }}>
<path d="M11 10H0C7.65088 9.76396 10.5919 8.59449 11 0V10Z" fill={color}/>
</svg>

      {/* <svg width="18" height="16" viewBox="0 0 18 16" fill="none" style={{ display: "block" }}>
        <path d={CORNER} fill={color} />
      </svg> */}
      <div
        style={{
          backgroundColor: color,
          padding: "8px 16px",
          borderRadius: "16px 16px 0 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <p className="font-inclusive-sans font-medium text-[#212012] whitespace-nowrap" style={{ fontSize: 12, letterSpacing: "0.25px" }}>
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

const CARDS: CardConfig[] = [
  {
    bgColor: "#c3be6f",
    imageBg: "#d2ce93",
    dotColor: "#625e37",
    textColor: "#625e37",
    label: "CASE STUDY 1",
    tabLeft: TAB_LEFT[0],
    imageLeft: true,
    roundedAll: false,
    clientName: "ICICI Bank",
    clientBadgeBg: "rgba(98,94,55,0.15)",
    isIcici: true,
    cardTitle: "Redesigning how 10M+ ICICI Bank cardholders activate their card for international travel",
    statusText: "under development • 2026",
    statusColor: "#625e37",
  },
  {
    bgColor: "#c67d39",
    imageBg: "#d19761",
    dotColor: "#212012",
    textColor: "#212012",
    label: "CASE STUDY 2",
    tabLeft: TAB_LEFT[1],
    imageLeft: false,
    roundedAll: false,
    clientName: "ICICI Bank",
    clientBadgeBg: "rgba(33,32,18,0.12)",
    isIcici: false,
    cardTitle: "Bringing India's most-used toll payment system to ICICI's web platform — for the first time",
    statusText: "under development • 2026",
    statusColor: "#212012",
  },
  {
    bgColor: "#dda1ae",
    imageBg: "#ebc7cf",
    dotColor: "#212012",
    textColor: "#212012",
    label: "CASE STUDY 3",
    tabLeft: TAB_LEFT[2],
    imageLeft: true,
    roundedAll: true,
    clientName: "Viisa • Freelance",
    clientBadgeBg: "rgba(33,32,18,0.1)",
    isIcici: false,
    cardTitle: "AI experiments — exploring what's possible with LLMs",
    statusText: "Completed • 2023",
    statusColor: "#212012",
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
      </div>

      {/* Middle: title anchored to bottom of its flex zone */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", padding: "16px 0 0" }}>
        <p
          className="font-caslon not-italic"
          style={{ fontSize: 30, lineHeight: "37px", color: "#212012", fontWeight: 600 }}
        >
          {card.cardTitle}
        </p>
      </div>

      {/* Bottom: thin rule + status left / read CTA right */}
      <div style={{ marginTop: 20 }}>
        <div style={{ height: 1, backgroundColor: `${card.dotColor}30`, marginBottom: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 10, letterSpacing: "0.4px", color: card.statusColor, opacity: 0.65 }}>
            {card.statusText}
          </p>
          {/* Read CTA with hover effects */}
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <p
              className="font-caslon"
              style={{
                fontSize: 14,
                color: "#212012",
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
              style={{ fontSize: 15, color: "#212012", lineHeight: 1 }}
            >
              →
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      onClick={onClick}
      style={{
        height: CARD_H,
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

// Curved tab connector matching Frame9-1 Figma design
function TabCurve({ color }: { color: string }) {
  return (
    <svg width={17.63} height={16.5} viewBox="0 0 17.6301 16.5" fill="none" style={{ display: "block", flexShrink: 0, position: "relative", top: "0.5px", left: "0.25px" }}>
      <path d="M17.6301 16.5H0C12.2624 16.1105 16.976 14.1809 17.6301 0V16.5Z" fill={color} />
    </svg>
  );
}

// Tab positions: left | left+indent | right (matching Frame9-1 card layout)
const TAB_ALIGN: Array<"left" | "indent" | "right"> = ["left", "indent", "right"];

function MobileCardTab({ label, bgColor, align }: { label: string; bgColor: string; align: "left" | "indent" | "right" }) {
  const isRight = align === "right";
  const indentLeft = align === "indent" ? 16 : 0;
  const indentRight = align === "right" ? 16 : 0;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: isRight ? "flex-end" : "flex-start", paddingLeft: indentLeft, paddingRight: indentRight }}>
      <TabCurve color={bgColor} />
      <div style={{ background: bgColor, padding: "6px 20px",position: "relative", top: "1px", borderRadius: "12px 12px 0 0" }}>
        <p className="font-inclusive-sans font-semibold uppercase" style={{ fontSize: 11, letterSpacing: "0.48px", color: "#212012", whiteSpace: "nowrap" }}>{label}</p>
      </div>
      <svg width={17.63} height={16.5} viewBox="0 0 17.6301 16.5" fill="none" style={{ display: "block", flexShrink: 0, transform: "scaleX(-1)", position: "relative", top: "0.5px", left: "-0.25px" }}>
        <path d="M17.6301 16.5H0C12.2624 16.1105 16.976 14.1809 17.6301 0V16.5Z" fill={bgColor} />
      </svg>
    </div>
  );
}

// ── Mobile: sticky-stack card matching the desktop scroll-stack behavior ───────
function MobileStackCard({ card, align, onClick }: { card: CardConfig; align: "left" | "indent" | "right"; onClick: () => void }) {
  return (
    <div>
      <MobileCardTab label={card.label} bgColor={card.bgColor} align={align} />
      <div
        onClick={onClick}
        style={{
          backgroundColor: card.bgColor,
          borderRadius: card.roundedAll ? 16 : "0 16px 0 0",
          overflow: "hidden",
          cursor: "pointer",
          height: MOBILE_CARD_H,
          position: "relative",
        }}
      >
        {/* Image area: matches Figma top-20, left-16, h-172, rounded-4 */}
        <div style={{ position: "absolute", top: 20, left: 16, right: 16, height: 172, borderRadius: 4, overflow: "hidden" }}>
          <ThumbnailPlaceholder bgColor={card.imageBg} strokeColor={card.textColor} height="100%" iconSize={28} />
        </div>

        {/* Content area: top-212, left-16 */}
        <div style={{ position: "absolute", top: 212, left: 16, right: 16 }}>
          {/* Category tags */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: "#212012" }}>UX + UI</p>
            <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#212012", opacity: 0.5, flexShrink: 0 }} />
            <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: "#212012" }}>Sole designer</p>
          </div>

          {/* Title */}
          <p className="font-caslon not-italic" style={{ fontSize: 22, lineHeight: "28px", color: "#212012", fontWeight: 600, marginBottom: 12 }}>
            {card.cardTitle}
          </p>

          {/* Status */}
          <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: card.statusColor }}>
            {card.statusText}
          </p>
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

  const card2Y = useMotionValue(typeof window !== "undefined" ? window.innerHeight - DARK_H : 620);
  const card3Y = useMotionValue(typeof window !== "undefined" ? window.innerHeight - DARK_H : 620);
  const mobileCard2Y = useMotionValue(typeof window !== "undefined" ? window.innerHeight - MOBILE_DARK_H : 620);
  const mobileCard3Y = useMotionValue(typeof window !== "undefined" ? window.innerHeight - MOBILE_DARK_H : 620);

  useEffect(() => {
    const update = (v: number) => {
      const offY = window.innerHeight - DARK_H;
      const t2 = v <= 0 ? 0 : v >= 0.4 ? 1 : v / 0.4;
      card2Y.set(offY + (14 - offY) * t2);
      const t3 = v <= 0.5 ? 0 : v >= 0.9 ? 1 : (v - 0.5) / 0.4;
      card3Y.set(offY + (28 - offY) * t3);

      const mobileOffY = window.innerHeight - MOBILE_DARK_H;
      mobileCard2Y.set(mobileOffY + (14 - mobileOffY) * t2);
      mobileCard3Y.set(mobileOffY + (28 - mobileOffY) * t3);
    };

    const onResize = () => update(scrollYProgress.get());
    const unsubScroll = scrollYProgress.on("change", update);
    window.addEventListener("resize", onResize);
    update(scrollYProgress.get());

    return () => {
      unsubScroll();
      window.removeEventListener("resize", onResize);
    };
  }, [scrollYProgress, card2Y, card3Y, mobileCard2Y, mobileCard3Y]);

  if (isMobile) {
    return (
      <>
        <CaseStudyDetail caseStudy={selectedCase} onClose={closeCase} onNavigate={openCase} />

        <div
          ref={outerRef}
          style={{ height: `calc(100vh + ${EXTRA_SCROLL}px)`, position: "relative", overflow: "clip" }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "hidden",
              backgroundColor: "#212012",
              borderRadius: "16px",
            }}
          >
            <p
              className="font-caslon uppercase text-center"
              style={{ position: "absolute", top: 24, left: 0, right: 0, color: "#e3d9ce", fontSize: 24, lineHeight: "30px" }}
            >
              select projects
            </p>

            {/* CS1 */}
            <div style={{ position: "absolute", top: MOBILE_DARK_H, left: 10, right: 10, zIndex: 1 }}>
              <MobileStackCard card={CARDS[0]} align={TAB_ALIGN[0]} onClick={() => openCase(CASE_STUDY_DATA[0])} />
            </div>

            {/* CS2 */}
            <motion.div style={{ position: "absolute", top: MOBILE_DARK_H, left: 10, right: 10, zIndex: 2, y: mobileCard2Y }}>
              <MobileStackCard card={CARDS[1]} align={TAB_ALIGN[1]} onClick={() => openCase(CASE_STUDY_DATA[1])} />
            </motion.div>

            {/* CS3 */}
            <motion.div style={{ position: "absolute", top: MOBILE_DARK_H, left: 10, right: 10, zIndex: 3, y: mobileCard3Y }}>
              <MobileStackCard card={CARDS[2]} align={TAB_ALIGN[2]} onClick={() => openCase(CASE_STUDY_DATA[2])} />
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CaseStudyDetail
        caseStudy={selectedCase}
        onClose={closeCase}
        onNavigate={openCase}
      />

      <div
        ref={outerRef}
        style={{ height: `calc(100vh + ${EXTRA_SCROLL}px)`, position: "relative", overflow: "clip" }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#212012",
            borderRadius: "16px",
          }}
        >
          <p
            className="font-caslon uppercase text-center"
            style={{ position: "absolute", top: 48, left: 0, right: 0, color: "#e3d9ce", fontSize: 48, lineHeight: "56px" }}
          >
            select projects
          </p>

          {/* CS1 */}
          <div style={{ position: "absolute", top: DARK_H, left: 0, right: 0, zIndex: 1 }}>
            <CardWithTab card={CARDS[0]} onClick={() => openCase(CASE_STUDY_DATA[0])} />
          </div>

          {/* CS2 */}
          <motion.div style={{ position: "absolute", top: DARK_H, left: 0, right: 0, zIndex: 2, y: card2Y }}>
            <CardWithTab card={CARDS[1]} onClick={() => openCase(CASE_STUDY_DATA[1])} />
          </motion.div>

          {/* CS3 */}
          <motion.div style={{ position: "absolute", top: DARK_H, left: 0, right: 0, zIndex: 3, y: card3Y }}>
            <CardWithTab card={CARDS[2]} onClick={() => openCase(CASE_STUDY_DATA[2])} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
