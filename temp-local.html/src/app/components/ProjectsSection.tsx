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
import svgIcici from "../../imports/Frame1597884659-1/svg-b40dn3nm6i";

const DARK_H = 183;
const CARD_H = 418;
const EXTRA_SCROLL = 700;
const CORNER = "M17.6301 16.5H0C12.2624 16.1105 16.976 14.1809 17.6301 0V16.5Z";
const TAB_LEFT = [34, 253, 472];

function IciciBankLogo() {
  return (
    <div style={{ width: 80, height: 16, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        fill="none"
        viewBox="0 0 79.7365 15.7377"
        preserveAspectRatio="none"
      >
        <path d={svgIcici.p28ddf800} fill="#004A7F" />
        <path d={svgIcici.p1309cc00} fill="#004A7F" />
        <path d={svgIcici.p1e17ff00} fill="#004A7F" />
        <path d={svgIcici.p252ce000} fill="#004A7F" />
        <path d={svgIcici.pe7e5b60} fill="#004A7F" />
        <path d={svgIcici.p10482b80} fill="#004A7F" />
        <path d={svgIcici.p3ce65400} fill="#004A7F" />
        <path d={svgIcici.p2e830f00} fill="#004A7F" />
        <path d={svgIcici.p2ded8b00} fill="#004A7F" />
        <path d={svgIcici.p2cded400} fill="#F06321" />
        <path d={svgIcici.p291a8a70} fill="#212012" />
        <path d={svgIcici.p34b10ef2} fill="#AE282E" />
        <path d={svgIcici.p5435100} fill="#F06321" />
      </svg>
    </div>
  );
}

function CardTab({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <svg width="17.63" height="16.5" viewBox="0 0 17.6301 16.5" fill="none" style={{ display: "block" }}>
        <path d={CORNER} fill={color} />
      </svg>
      <div
        style={{
          backgroundColor: color,
          padding: "10px 24px",
          borderRadius: "16px 16px 0 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <p className="font-jakarta font-semibold text-[#212012] whitespace-nowrap" style={{ fontSize: 16, letterSpacing: "0.64px" }}>
          {label}
        </p>
      </div>
      <div style={{ transform: "scaleX(-1)" }}>
        <svg width="17.63" height="16.5" viewBox="0 0 17.6301 16.5" fill="none" style={{ display: "block" }}>
          <path d={CORNER} fill={color} />
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
    cardTitle: "Redesigning ICICI Bank's mobile onboarding experience",
    statusText: "SHIPPED — 2023",
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
    clientName: "Canvs Studio",
    clientBadgeBg: "rgba(33,32,18,0.12)",
    isIcici: false,
    cardTitle: "Building Canvs Studio from 0 → 1 as sole designer",
    statusText: "IN PROGRESS",
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
    clientName: "Self-initiated",
    clientBadgeBg: "rgba(33,32,18,0.1)",
    isIcici: false,
    cardTitle: "AI experiments — exploring what's possible with LLMs",
    statusText: "ONGOING",
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
        <p className="font-jakarta font-semibold" style={{ fontSize: 12, color: card.textColor, letterSpacing: "0.24px" }}>
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
          <p className="font-jakarta font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.44px", color: card.textColor, opacity: 0.8 }}>
            UX + UI
          </p>
          <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
            <circle cx="1.5" cy="1.5" r="1.5" fill={card.dotColor} />
          </svg>
          <p className="font-jakarta font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.44px", color: card.textColor, opacity: 0.8 }}>
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
          <p className="font-jakarta font-medium uppercase" style={{ fontSize: 10, letterSpacing: "0.4px", color: card.statusColor, opacity: 0.65 }}>
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

// ── Mobile: simple vertical card list ─────────────────────────────────────────
function MobileCardList({ onSelect }: { onSelect: (cs: CaseStudyInfo) => void }) {
  return (
    <div style={{ backgroundColor: "#212012", padding: "40px 16px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
      <p className="font-caslon uppercase text-center" style={{ color: "#e3d9ce", fontSize: 24, lineHeight: "30px", marginBottom: 8 }}>
        select projects
      </p>
      {CARDS.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => onSelect(CASE_STUDY_DATA[i])}
          style={{ backgroundColor: card.bgColor, borderRadius: 16, overflow: "hidden", cursor: "pointer" }}
        >
          <div style={{ height: 160, overflow: "hidden" }}>
            <ThumbnailPlaceholder bgColor={card.imageBg} strokeColor={card.textColor} height="100%" iconSize={28} />
          </div>
          <div style={{ padding: "20px 20px 24px" }}>
            <ClientBadge card={card} />
            <p className="font-caslon not-italic" style={{ fontSize: 24, lineHeight: "30px", color: "#212012", fontWeight: 600, marginTop: 12, marginBottom: 16 }}>
              {card.cardTitle}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${card.dotColor}30`, paddingTop: 12 }}>
              <p className="font-jakarta font-medium uppercase" style={{ fontSize: 10, letterSpacing: "0.4px", color: card.statusColor, opacity: 0.65 }}>
                {card.statusText}
              </p>
              <p className="font-caslon" style={{ fontSize: 14, color: "#212012", fontStyle: "italic" }}>read case study →</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ProjectsSection({ onDrawerChange }: { onDrawerChange?: (open: boolean) => void }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [selectedCase, setSelectedCase] = useState<CaseStudyInfo | null>(null);

  const openCase = (cs: CaseStudyInfo) => { setSelectedCase(cs); onDrawerChange?.(true); };
  const closeCase = () => { setSelectedCase(null); onDrawerChange?.(false); };

  const scrollYProgress = useScrollProgress(outerRef, ["start start", "end end"]);

  const card2Y = useMotionValue(typeof window !== "undefined" ? window.innerHeight - DARK_H : 620);
  const card3Y = useMotionValue(typeof window !== "undefined" ? window.innerHeight - DARK_H : 620);

  useEffect(() => {
    const update = (v: number) => {
      const offY = window.innerHeight - DARK_H;
      const t2 = v <= 0 ? 0 : v >= 0.4 ? 1 : v / 0.4;
      card2Y.set(offY + (14 - offY) * t2);
      const t3 = v <= 0.5 ? 0 : v >= 0.9 ? 1 : (v - 0.5) / 0.4;
      card3Y.set(offY + (28 - offY) * t3);
    };

    const onResize = () => update(scrollYProgress.get());
    const unsubScroll = scrollYProgress.on("change", update);
    window.addEventListener("resize", onResize);
    update(scrollYProgress.get());

    return () => {
      unsubScroll();
      window.removeEventListener("resize", onResize);
    };
  }, [scrollYProgress, card2Y, card3Y]);

  if (isMobile) {
    return (
      <>
        <CaseStudyDetail caseStudy={selectedCase} onClose={closeCase} onNavigate={openCase} />
        <MobileCardList onSelect={openCase} />
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
            <CardWithTab card={CARDS[0]} onClick={() => setSelectedCase(CASE_STUDY_DATA[0])} />
          </div>

          {/* CS2 */}
          <motion.div style={{ position: "absolute", top: DARK_H, left: 0, right: 0, zIndex: 2, y: card2Y }}>
            <CardWithTab card={CARDS[1]} onClick={() => setSelectedCase(CASE_STUDY_DATA[1])} />
          </motion.div>

          {/* CS3 */}
          <motion.div style={{ position: "absolute", top: DARK_H, left: 0, right: 0, zIndex: 3, y: card3Y }}>
            <CardWithTab card={CARDS[2]} onClick={() => setSelectedCase(CASE_STUDY_DATA[2])} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
