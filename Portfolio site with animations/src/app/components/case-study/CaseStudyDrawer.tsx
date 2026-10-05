import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, Volume2 } from "lucide-react";
import { Lottie } from "lottie-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { Spacer, ThumbnailPlaceholder, StrokedImage, SectionBlock, SectionHeading, BodyText } from "./CaseStudyPrimitives";
import { ItravelCaseStudy, FastagCaseStudy } from "./CaseStudyContent";
import "./CaseStudy.css";

// ─── CS2 cover (ICICI FASTag) — animated cover, native size 1800×1200 (3:2) ───
import coverAnimationUrl from "@/assets/case-studies/fastag/videos/cover-nw.json?url";
import { colors, withAlpha } from "@/app/theme/tokens";

// Pre-generated ElevenLabs narration lives in public/audio/ (see scripts/generate-voiceovers.mjs)
// — base-aware so it resolves correctly whether served at "/" locally or "/portfolio/" on GitHub Pages.
const caseStudyAudioUrl = (slug: string) => `${import.meta.env.BASE_URL}audio/case-study/${slug}.mp3`;

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
const SECTIONS_BY_CASE_STUDY: Record<number, { id: string; label: string; noNumber?: boolean }[]> = {
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
    color: colors.olive,
    textColor: colors.oliveDeep,
    imageBg: colors.oliveLight,
    dotColor: colors.olive,
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
    color: colors.orange,
    textColor: colors.ink,
    imageBg: colors.orangeLight,
    dotColor: colors.orange,
    title: "Bringing India's most-used toll payment system to ICICI's web platform — for the first time.",
    type: "UX + UI",
    role: "Sole designer",
    status: "Ongoing",
    year: "2022–2023",
    client: "ICICI Bank",
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
    color: colors.pink,
    textColor: colors.ink,
    imageBg: colors.pinkLight,
    dotColor: colors.pink,
    title: "Building Dali: A Plug-and-Play Design System for AI IDEs",
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
      {shape === "square" && <div style={{ width: 7, height: 7, backgroundColor: colors.orange, flexShrink: 0 }} />}
      {shape === "diamond" && <div style={{ width: 6, height: 6, backgroundColor: colors.orange, transform: "rotate(45deg)", flexShrink: 0 }} />}
      {shape === "circle" && <div style={{ width: 7, height: 7, borderRadius: 8, backgroundColor: colors.orange, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 5, height: 1, backgroundColor: colors.orange }} />
      {/* diamond arrowhead — a rotated square clipped to its leading half so it points right */}
      <div style={{ width: 6, height: 6, backgroundColor: colors.orange, transform: "rotate(45deg)", flexShrink: 0 }} />
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
        <p className="font-caslon" style={{ fontStyle: "italic", fontSize: 14, lineHeight: "18px", color: colors.orange, flexShrink: 0 }}>{label}</p>
        <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "17px", color: colors.ink }}>{value}</p>
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
      backgroundColor: colors.sandPanel, borderRadius: 12,
      border: `1px solid ${withAlpha(colors.ink, 0.1)}`,
      padding: 16, display: "flex", flexDirection: "column", gap: 12,
      fontSize: 10, letterSpacing: "0.4px",
    }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
          <div style={{
            width: 60, flexShrink: 0,
            fontFamily: "'Inclusive Sans', sans-serif", fontWeight: 500,
            color: colors.orange, lineHeight: "normal",
          }}>
            {row.label}
          </div>
          <div style={{
            flex: 1, fontFamily: "'Inclusive Sans', sans-serif", fontWeight: 500,
            color: colors.body, lineHeight: "normal", wordBreak: "break-word",
          }}>
            {row.value}
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
      <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: withAlpha(colors.sand, 0.5), letterSpacing: "0.5px", textTransform: "uppercase" }}>
        Listen to this case study
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={toggle}
          disabled={!available}
          style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: color, border: "none", cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          {playing ? <Pause size={14} fill={colors.ink} color={colors.ink} /> : <Play size={14} fill={colors.ink} color={colors.ink} />}
        </button>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seekToFraction((e.clientX - rect.left) / rect.width);
          }}
          style={{ flex: 1, height: 2, backgroundColor: withAlpha(colors.sand, 0.18), borderRadius: 1, position: "relative", cursor: available ? "pointer" : "default" }}
        >
          <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: color, borderRadius: 1 }} />
        </div>
        <p className="font-inclusive-sans" style={{ fontSize: 11, color: withAlpha(colors.sand, 0.4), letterSpacing: "0.1px", flexShrink: 0 }}>
          {available ? timeLabel : "narration coming soon"}
        </p>
        <Volume2 size={13} color={withAlpha(colors.sand, 0.35)} style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
}

function VideoFrame({ cs }: { cs: CaseStudyInfo }) {
  return (
    <div style={{ flex: "0 0 320px", height: 180, borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <ThumbnailPlaceholder bgColor={cs.imageBg} strokeColor={cs.textColor} height="100%" iconSize={0} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: withAlpha(colors.ink, 0.55) }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: withAlpha(colors.white, 0.92), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={20} fill={colors.ink} color={colors.ink} />
        </div>
        <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: withAlpha(colors.white, 0.65), letterSpacing: "0.1px", textAlign: "center" }}>Case study walkthrough</p>
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
        <div style={{ display: "inline-flex", backgroundColor: withAlpha(colors.ink, 0.12), padding: "4px 12px", borderRadius: 100, alignSelf: "flex-start" }}>
          <p className="font-inclusive-sans font-semibold" style={{ fontSize: 10, color: cs.textColor, letterSpacing: "0.5px", textTransform: "uppercase" }}>{cs.label}</p>
        </div>
        <p className="font-caslon" style={{ fontSize: 17, lineHeight: "23px", color: colors.ink, fontWeight: 600 }}>{cs.title}</p>
      </div>
    </motion.div>
  );
}

// ─── Placeholder content for CS3 ──────────────────────────────────────────────
function PlaceholderCaseStudy({ cs, isMobile }: { cs: CaseStudyInfo; isMobile: boolean }) {
  const s3ids = ["cs-problem", "cs-process", "cs-findings"];
  const ids = s3ids;
  const labels = ["Problem Statement", "Process", "Key Findings"];
  const placeholders = [{ h: 264, bg: colors.white }, { h: 200, bg: cs.imageBg }, { h: 200, bg: cs.imageBg }];

  return (
    <div className="case-study-sections" style={{ display: "flex", flexDirection: "column" }}>
      {ids.map((id, i) => (
        <SectionBlock key={id} id={id}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionHeading isMobile={isMobile}>{i + 1}. {labels[i]}</SectionHeading>
            <div className="case-study-flow" style={{ display: "flex", flexDirection: "column" }}>
              <BodyText isMobile={isMobile}>{cs.overview}</BodyText>
              <div className="case-study-media">
                <StrokedImage bgColor={placeholders[i].bg === colors.white ? cs.imageBg : placeholders[i].bg} strokeColor={cs.textColor} height={placeholders[i].h} iconSize={32} />
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
      <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.4), textTransform: "uppercase", marginBottom: 8 }}>
        listen
      </p>
      <button
        onClick={toggle}
        disabled={!available}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          backgroundColor: playing ? color : withAlpha(colors.ink, 0.06),
          border: "none", borderRadius: 10, padding: "10px 14px",
          cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.5,
          transition: "background 0.2s", width: "100%",
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: playing ? withAlpha(colors.white, 0.3) : color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {playing ? <Pause size={12} color={colors.ink} fill={colors.ink} /> : <Play size={12} color={colors.ink} fill={colors.ink} />}
        </div>
        <div style={{ textAlign: "left" }}>
          <p className="font-inclusive-sans font-semibold" style={{ fontSize: 12, color: colors.ink, lineHeight: "15px" }}>
            {!available ? "Narration coming soon" : playing ? "Playing..." : "Hear this case study"}
          </p>
          <p className="font-inclusive-sans" style={{ fontSize: 10, color: withAlpha(colors.ink, 0.5), marginTop: 1 }}>
            {available ? (playing ? timeLabel : "audio narrative") : "check back soon"}
          </p>
        </div>
      </button>
    </div>
  );
}

// ─── Main drawer component ────────────────────────────────────────────────────
interface CaseStudyDrawerProps {
  caseStudy: CaseStudyInfo | null;
  onClose: () => void;
  onNavigate: (cs: CaseStudyInfo) => void;
}

export function CaseStudyDrawer({ caseStudy, onClose, onNavigate }: CaseStudyDrawerProps) {
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

  const sections = caseStudy ? (SECTIONS_BY_CASE_STUDY[caseStudy.index] ?? []) : [];
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
            style={{ position: "fixed", inset: 0, zIndex: 499, backgroundColor: withAlpha(colors.ink, 0.6), backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
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
              backgroundColor: colors.sand,
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
                  border: `1px solid ${withAlpha(colors.oliveDeep, 0.2)}`,
                  backgroundColor: withAlpha(colors.sand, 0.85),
                  backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: colors.ink,
                }}
              >
                <X size={16} />
              </button>
            )}

            {/* Scrollable inner */}
            <div ref={scrollableRef} style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none", display: "flex", flexDirection: "column" }}>

              {/* ── MOBILE LAYOUT ── */}
              {isMobile ? (
                <div style={{ display: "flex", flexDirection: "column", paddingBottom: 80 }}>

                  {/* Sticky mobile header: title + X */}
                  <div style={{
                    position: "sticky", top: 0, zIndex: 10,
                    backgroundColor: colors.sand,
                    padding: "16px 16px 12px",
                    borderBottom: scrolled ? `1px solid ${withAlpha(colors.ink, 0.1)}` : "1px solid transparent",
                    transition: "border-color 0.3s ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <motion.p
                        className="font-caslon not-italic"
                        animate={{ fontSize: scrolled ? "16px" : "22px" }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ flex: 1, lineHeight: "normal", color: colors.ink, fontWeight: 600 }}
                      >
                        {caseStudy.title}
                      </motion.p>
                      <button
                        onClick={onClose}
                        style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          border: `1px solid ${withAlpha(colors.ink, 0.15)}`,
                          backgroundColor: withAlpha(colors.sand, 0.6),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={14} color={colors.ink} />
                      </button>
                    </div>
                    <Spacer size={8} />
                  </div>

                  {/* Hero: FASTag gets its animated cover, others keep the 264px placeholder */}
                  <div style={{ backgroundColor: colors.white, overflow: "hidden", flexShrink: 0 }}>
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
                        ? <ItravelCaseStudy isMobile={true} />
                        : caseStudy.index === 1
                        ? <FastagCaseStudy isMobile={true} />
                        : <PlaceholderCaseStudy cs={caseStudy} isMobile={true} />
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
                      style={{ backgroundColor: colors.ink, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}
                    >
                      {/* Audio player full-width on mobile */}
                      <AudioPlayer color={caseStudy.color} slug={caseStudy.slug} />
                    </motion.div>
                    <Spacer size={20} />
                    <Spacer size={8} />

                    {/* Related case studies — vertical stack on mobile */}
                    <div>
                      <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.4), textTransform: "uppercase", marginBottom: 12 }}>
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
                      backgroundColor: colors.sand,
                      paddingLeft: 36, paddingRight: 52,
                      display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      borderBottom: `1px solid ${scrolled ? withAlpha(colors.oliveDeep, 0.12) : "transparent"}`,
                      transition: "border-color 0.3s ease",
                    }}
                  >
                    <motion.p
                      className="font-caslon not-italic"
                      animate={{ fontSize: scrolled ? "18px" : "24px" }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ color: colors.ink, fontWeight: 600, lineHeight: "normal", paddingRight: 48, maxWidth: 680 }}
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
                        <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.4), textTransform: "uppercase", marginBottom: 4 }}>
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
                              style={{ fontSize: 12, letterSpacing: "0.12px", color: activeSection === s.id ? colors.ink : withAlpha(colors.ink, 0.4), transition: "color 0.2s ease" }}
                            >
                              {s.num != null ? `${s.num}. ` : ""}{s.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right pane — the only thing that scrolls */}
                    <div ref={rightPaneRef} style={{ flex: 1, minWidth: 0, maxWidth: 900, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none" }}>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ backgroundColor: colors.white, borderRadius: 8, marginBottom: caseStudy.index === 0 ? 24 : 32, overflow: "hidden" }}
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
                        ? <ItravelCaseStudy isMobile={false} />
                        : caseStudy.index === 1
                        ? <FastagCaseStudy isMobile={false} />
                        : <PlaceholderCaseStudy cs={caseStudy} isMobile={false} />
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
                        style={{ marginBottom: 8, backgroundColor: colors.ink, borderRadius: 16, padding: 24, display: "flex", gap: 20, alignItems: "center", scrollMarginTop: 88 }}
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
                        <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.4), textTransform: "uppercase", marginBottom: 16 }}>
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
