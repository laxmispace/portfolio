import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lottie } from "lottie-react";
import { X, Play, Pause, Volume2 } from "lucide-react";
import { TextLink } from "@/app/components/ui/Buttons";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { Spacer, ThumbnailPlaceholder, StrokedImage, SectionBlock, SectionHeading, BodyText } from "./CaseStudyPrimitives";
import { ItravelCaseStudy, FastagCaseStudy } from "./CaseStudyContent";
import "./CaseStudy.css";

// ─── CS2 cover (ICICI FASTag) - "FASTag cover", exported at 2400×1200 (2:1) ───
import fastagCover from "@/assets/case-studies/fastag/cover.jpg";
// The FASTag case study opens on this Lottie (1800×1200) rather than the still cover.
import fastagCoverAnimation from "@/assets/case-studies/fastag/videos/cover-nw.json?url";
import { colors, withAlpha } from "@/app/theme/tokens";

// ─── CS1 cover (iTravel) - "Story 4.0", exported at 2400×1200 (2:1) ───
import itravelCover from "@/assets/case-studies/itravel/cover.jpg";
import daliCover from "@/assets/case-studies/dali/cover.jpg";

// Pre-generated ElevenLabs narration lives in public/audio/ (see scripts/generate-voiceovers.mjs)
// - base-aware so it resolves correctly whether served at "/" locally or "/portfolio/" on GitHub Pages.
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
  /** Shown as "coming soon": its card and related links don't open anything. */
  comingSoon?: boolean;
  /** Cover image (import it from src/assets/case-studies/covers). Designed in Figma at
   *  1600×800 (2:1), exported @2x; every cover slot - the home card, the case study's
   *  hero and the "read more" cards - is 2:1, so it shows uncropped everywhere. */
  cover?: string;
  /** A 2:1 video cover; plays muted on a loop in place of `cover`. */
  video?: string;
  /** Lottie JSON url (3:2); replaces the cover in the case study's own hero only. */
  animation?: string;
  /** Video walkthrough of the case study, shown at the bottom. */
  walkthrough?: string;
}

// The drawer's width, as a share of the viewport (never narrower than 880px).
const DRAWER_WIDTH = "max(880px, 75vw)";

/** "Card exploration" -> "card-exploration", for section hashes in the URL. */
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Every cover slot is this shape (see `cover` above).
export const COVER_RATIO = "2 / 1";

/** A muted, looping cover video. `muted` is set on the element itself (React only sets the
 *  property), since iOS won't autoplay without the attribute; reduced motion holds the first frame. */
function CoverVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.setAttribute("muted", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

/** The case study's cover, filling its 2:1 slot - or the grid placeholder until there is one. */
export function CaseStudyCover({ cs, iconSize = 40 }: { cs: CaseStudyInfo; iconSize?: number }) {
  if (cs.video) return <CoverVideo src={cs.video} poster={cs.cover} />;
  if (cs.cover) {
    return <img src={cs.cover} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  }
  return <ThumbnailPlaceholder bgColor={cs.imageBg} strokeColor={cs.textColor} height="100%" iconSize={iconSize} />;
}

/** The hero at the top of an open case study: its Lottie when it has one, else the 2:1 cover. */
function DrawerHero({ cs, iconSize }: { cs: CaseStudyInfo; iconSize: number }) {
  if (cs.animation) {
    return (
      <div style={{ aspectRatio: "1800 / 1200" }}>
        <Lottie src={cs.animation} loop autoplay style={{ width: "100%", height: "100%" }} />
      </div>
    );
  }
  return (
    <div style={{ aspectRatio: COVER_RATIO }}>
      <CaseStudyCover cs={cs} iconSize={iconSize} />
    </div>
  );
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
    { id: "cs-wrapup", label: "Travel wrap" },
    { id: "cs-tldr", label: "TL;DR", noNumber: true },
    { id: "cs-media", label: "Walkthrough", noNumber: true },
  ],
  1: [
    { id: "cs-intro", label: "Introduction", noNumber: true },
    { id: "cs-landing", label: "Landing page" },
    { id: "cs-card", label: "FASTag card exploration" },
    { id: "cs-details", label: "All FASTag details" },
    { id: "cs-recharge", label: "FASTag recharge" },
    { id: "cs-tldr", label: "TL;DR", noNumber: true },
    { id: "cs-media", label: "Walkthrough", noNumber: true },
  ],
  2: [
    { id: "cs-problem", label: "Problem statement" },
    { id: "cs-process", label: "Process" },
    { id: "cs-findings", label: "Key findings" },
    { id: "cs-media", label: "Walkthrough", noNumber: true },
  ],
};

// ─── Data ─────────────────────────────────────────────────────────────────────
export const CASE_STUDY_DATA: CaseStudyInfo[] = [
  {
    index: 0,
    slug: "icici-bank-onboarding",
    cover: itravelCover,
    label: "CASE STUDY 1",
    color: colors.olive,
    textColor: colors.oliveDeep,
    imageBg: colors.oliveLight,
    dotColor: colors.olive,
    title: "Redesigning how 10M+ ICICI Bank cardholders activate their card for international travel",
    type: "UX + UI",
    role: "Sole designer",
    status: "Under review",
    year: "2026",
    client: "ICICI Bank",
    designTeam: "Canvs - Harleen Chatha (Design manager), Laxmi Mahajan (Designer)",
    crossTeam: "Product Manager, Engineering, Risk & Compliance (stakeholder reviewers)",
    timeline: "1 week",
    statusFull: "Final design iteration complete (Currently with the client for review, pre-launch)",
    overview: "Led end-to-end redesign of ICICI Bank's international card activation for 10M+ cardholders.",
  },
  {
    index: 1,
    slug: "icici-fastag-platform",
    cover: fastagCover,
    animation: fastagCoverAnimation,
    label: "CASE STUDY 2",
    color: colors.orange,
    textColor: colors.ink,
    imageBg: colors.orangeLight,
    dotColor: colors.orange,
    title: "Bringing India's most-used toll payment system to ICICI's web platform - for the first time.",
    type: "UX + UI",
    role: "Sole designer",
    status: "Under development",
    year: "2025–2026",
    client: "ICICI Bank",
    designTeam: "Canvs - Harleen Chatha (Design manager), Laxmi Mahajan (Designer)",
    crossTeam: "Product Manager, Engineering",
    timeline: "2 weeks + iterations",
    statusFull: "Under development",
    overview: "Designed ICICI Bank's first web FASTag experience end to end, adapting the iMobile flows for a larger screen and a wider set of services.",
  },
  {
    index: 2,
    slug: "ai-design-experiments",
    cover: daliCover,
    label: "CASE STUDY 3",
    color: colors.pink,
    textColor: colors.ink,
    imageBg: colors.pinkLight,
    dotColor: colors.pink,
    title: "Building Dali: A Plug-and-Play Design System for AI IDEs",
    type: "Design system + build",
    role: "Sole designer and builder",
    status: "WIP",
    year: "2024",
    client: "Self initiated",
    designTeam: "Laxmi Mahajan",
    crossTeam: "8 external designers (workshop participants)",
    timeline: "6 weeks",
    statusFull: "Research published, workshop format being adapted internally at Canvs",
    overview: "Explored how generative AI can augment design without stripping creative ownership - 3× faster first prototypes.",
    comingSoon: true,
  },
];

// ─── Project details ──────────────────────────────────────────────────────────
// A quiet grid between two hairlines: small muted labels, values beneath. Same block on
// every case study; four columns on desktop (team spans the row), two on phones.
function ProjectDetails({ cs, isMobile }: { cs: CaseStudyInfo; isMobile: boolean }) {
  const items: { label: string; value: string; wide?: boolean }[] = [
    { label: "Client", value: cs.client },
    { label: "Role", value: `${cs.role}, ${cs.type}` },
    { label: "Timeline", value: `${cs.timeline} · ${cs.year}` },
    { label: "Status", value: cs.status },
    { label: "Team", value: cs.designTeam.replace(/^Canvs\s*-\s*/, "Canvs · "), wide: true },
  ];
  return (
    <motion.div
      key={cs.index}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
        // no rule on top - it sat right under the cover; just the one below, before the story
        columnGap: 24, rowGap: 16, padding: "16px 0",
        borderBottom: `1px solid ${withAlpha(colors.ink, 0.12)}`,
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, gridColumn: item.wide ? "1 / -1" : undefined }}>
          <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, lineHeight: "14px", letterSpacing: "0.06em", textTransform: "uppercase", color: withAlpha(colors.ink, 0.45) }}>
            {item.label}
          </p>
          <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", color: colors.ink }}>
            {item.value}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Audio player ─────────────────────────────────────────────────────────────
function AudioPlayer({ color, slug }: { color: string; slug: string }) {
  const { playing, toggle, seekToFraction, available, progress, timeLabel } = useAudioPlayer(caseStudyAudioUrl(slug));
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
      <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, color: withAlpha(colors.sand, 0.5), letterSpacing: "0.5px", textTransform: "uppercase" }}>
        Listen to this case study
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={toggle}
          disabled={!available}
          style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: color, border: "none", cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
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

/** The case study's video walkthrough - a placeholder until `cs.walkthrough` is set. */
function VideoFrame({ cs, fullWidth = false }: { cs: CaseStudyInfo; fullWidth?: boolean }) {
  const box: React.CSSProperties = fullWidth
    ? { width: "100%", aspectRatio: "16 / 9", borderRadius: 8, overflow: "hidden", position: "relative" }
    : { flex: "0 0 320px", height: 180, borderRadius: 8, overflow: "hidden", position: "relative" };
  if (cs.walkthrough) {
    return (
      <div style={box}>
        <video src={cs.walkthrough} controls playsInline preload="metadata" poster={cs.cover} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return (
    <div style={box}>
      <ThumbnailPlaceholder bgColor={cs.imageBg} strokeColor={cs.textColor} height="100%" iconSize={0} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: withAlpha(colors.ink, 0.55) }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: withAlpha(colors.white, 0.92), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={20} fill={colors.ink} color={colors.ink} />
        </div>
        <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: withAlpha(colors.white, 0.65), letterSpacing: "0.1px", textAlign: "center" }}>Walkthrough coming soon</p>
      </div>
    </div>
  );
}

// ─── Related case study card ──────────────────────────────────────────────────
// A faint wash of the case study's own card colour (the olive / orange of its home
// page card), text left, small cover right; stacks on phones.
function RelatedCard({ cs, onClick, stacked }: { cs: CaseStudyInfo; onClick: () => void; stacked: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="link"
      style={{
        cursor: "pointer", transition: "background-color 0.3s ease",
        backgroundColor: withAlpha(cs.color, hovered ? 0.26 : 0.18), borderRadius: 12, padding: stacked ? 12 : 16,
        display: "flex", flexDirection: stacked ? "column-reverse" : "row", alignItems: stacked ? "stretch" : "center", gap: stacked ? 12 : 20,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <p className="font-caslon not-italic" style={{ fontSize: stacked ? 19 : 21, lineHeight: 1.3, color: colors.ink, fontWeight: 400 }}>
          {cs.title}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <p className="font-inclusive-sans font-normal" style={{ fontSize: 10, lineHeight: "14px", letterSpacing: "0.06em", textTransform: "uppercase", color: withAlpha(colors.ink, 0.45) }}>
            Client
          </p>
          <p className="font-inclusive-sans font-normal" style={{ fontSize: 12, lineHeight: "16px", color: colors.ink }}>{cs.client}</p>
        </div>
        <div style={{ marginTop: 2 }}>
          <TextLink as="span" hovered={hovered} style={{ fontSize: 14 }}>read case study</TextLink>
        </div>
      </div>
      <div style={{ width: stacked ? "100%" : 200, aspectRatio: COVER_RATIO, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
        <motion.div animate={{ scale: hovered ? 1.04 : 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ width: "100%", height: "100%" }}>
          <CaseStudyCover cs={cs} iconSize={20} />
        </motion.div>
      </div>
    </div>
  );
}

/** "Read more": the label and the cards. */
function ReadMore({ related, onNavigate, stacked }: { related: CaseStudyInfo[]; onNavigate: (cs: CaseStudyInfo) => void; stacked: boolean }) {
  if (!related.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.4), textTransform: "uppercase", marginBottom: 12 }}>
        Read more
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {related.map((cs) => (
          <RelatedCard key={cs.index} cs={cs} stacked={stacked} onClick={() => onNavigate(cs)} />
        ))}
      </div>
    </div>
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

// ─── Reading progress: a hairline along the bottom of the sticky header ───────
function ReadingProgress({ progress }: { progress: number }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, pointerEvents: "none" }}>
      <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: withAlpha(colors.orange, 0.7), transition: "width 0.1s linear" }} />
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
  // column never moves - the outer scrollableRef stays fixed for desktop.
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  // How far through the story the reader is (0-1), and roughly how long it takes to read.
  const [progress, setProgress] = useState(0);
  const [readMinutes, setReadMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!caseStudy) return;
    scrollableRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    rightPaneRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setScrolled(false);
    setActiveSection("");
    setProgress(0);
  }, [caseStudy?.index]);

  // ~220 words a minute over the case study's own text, counted once it has rendered.
  useEffect(() => {
    if (!caseStudy) return;
    const t = setTimeout(() => {
      const el = isMobile ? scrollableRef.current : rightPaneRef.current;
      const words = el?.innerText.trim().split(/\s+/).length ?? 0;
      setReadMinutes(words ? Math.max(1, Math.round(words / 220)) : null);
    }, 300);
    return () => clearTimeout(t);
  }, [caseStudy?.index, isMobile]);

  useEffect(() => {
    const el = isMobile ? scrollableRef.current : rightPaneRef.current;
    if (!el) return;
    const handle = () => {
      setScrolled(el.scrollTop > 60);
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
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

  const sections = caseStudy ? (SECTIONS_BY_CASE_STUDY[caseStudy.index] ?? []) : [];

  // Every index click gets its own URL (…/case-study/<slug>#<section>). replaceState keeps
  // the history entry - and its caseStudySlug - so back still closes the drawer.
  const scrollToSection = useCallback((id: string, behavior: ScrollBehavior = "smooth") => {
    scrollableRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior, block: "start" });
    const section = sections.find((s) => s.id === id);
    if (section) {
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, "", `${pathname}${search}#${slugify(section.label)}`);
    }
  }, [sections]);

  // Landing on …/case-study/<slug>#<section>: jump to that section once the drawer has slid in.
  useEffect(() => {
    if (!caseStudy) return;
    const hash = window.location.hash.slice(1);
    const target = hash && sections.find((s) => slugify(s.label) === hash);
    if (!target) return;
    const t = setTimeout(() => scrollToSection(target.id, "instant" as ScrollBehavior), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseStudy?.index]);
  // Running number for the index list - items flagged `noNumber` (e.g. Introduction)
  // are skipped so the first *numbered* section reads as "1.".
  const numberedSections = (() => {
    let n = 0;
    return sections.map((s) => ({ ...s, num: s.noNumber ? null : ++n }));
  })();
  const related = CASE_STUDY_DATA.filter((cs) => cs.index !== caseStudy?.index && !cs.comingSoon);

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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="case-study-drawer"
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: isMobile ? "100%" : DRAWER_WIDTH,
              zIndex: 500,
              borderRadius: isMobile ? 0 : "24px 0 0 24px",
              backgroundColor: colors.sand,
              overflow: "hidden",
            }}
          >
            {/* Close button - desktop only (mobile has it in the sticky header) */}
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
                        style={{ flex: 1, lineHeight: "normal", color: colors.ink, fontWeight: 500 }}
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
                    <ReadingProgress progress={progress} />
                  </div>

                  {/* Hero: the case study's Lottie or 2:1 cover (or the grid placeholder until it has one) */}
                  <div style={{ backgroundColor: colors.white, overflow: "hidden", flexShrink: 0 }}>
                    <DrawerHero cs={caseStudy} iconSize={40} />
                  </div>

                  {/* Meta table + content */}
                  <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column" }}>
                    <ProjectDetails cs={caseStudy} isMobile />
                    <Spacer size={24} />

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

                    {/* Media strip - dark card */}
                    <motion.div
                      id="cs-media"
                      data-section
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      style={{ backgroundColor: colors.ink, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}
                    >
                      <VideoFrame cs={caseStudy} fullWidth />
                      {/* Audio player full-width on mobile */}
                      <AudioPlayer color={caseStudy.color} slug={caseStudy.slug} />
                    </motion.div>
                    <Spacer size={20} />
                    <Spacer size={8} />

                    {/* Related case studies - vertical stack on mobile */}
                    <ReadMore related={related} onNavigate={onNavigate} stacked />
                  </div>
                </div>
              ) : (
                /* ── DESKTOP LAYOUT ── */
                <>

                  {/* Header - hugs the title with tight padding (no reserved dead space). It
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
                      style={{ color: colors.ink, fontWeight: 500, lineHeight: "normal", paddingRight: 48, maxWidth: 680 }}
                    >
                      {caseStudy.title}
                    </motion.p>
                    <ReadingProgress progress={progress} />
                  </motion.div>

                  {/* Two-pane body: fills whatever height the header leaves. Left panel never
                      scrolls; right pane owns its own scroll. 16px inset on the left panel's
                      left/top/bottom, 36px gap to the right pane. */}
                  <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 36, padding: "16px 36px 16px 16px", position: "relative", boxSizing: "border-box" }}>

                    {/* Left panel - fixed-height sticky card. Never expands/contracts, never scrolls. */}
                    <div
                      style={{
                        width: 212, flexShrink: 0, alignSelf: "stretch",
                        position: "sticky", top: 16,
                        backgroundColor: "#DACEBE", borderRadius: 16,
                        padding: 12, boxSizing: "border-box", overflow: "hidden",
                        display: "flex", flexDirection: "column", justifyContent: "flex-start",
                      }}
                    >

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.4), textTransform: "uppercase", marginBottom: 4 }}>
                          index{readMinutes ? ` · ${readMinutes} min read` : ""}
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

                    {/* Right pane - the only thing that scrolls */}
                    <div ref={rightPaneRef} style={{ flex: 1, minWidth: 0, maxWidth: 900, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none" }}>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ backgroundColor: colors.white, borderRadius: 8, marginBottom: 24, overflow: "hidden" }}
                      >
                        <DrawerHero cs={caseStudy} iconSize={48} />
                      </motion.div>

                      <ProjectDetails cs={caseStudy} isMobile={false} />
                      <Spacer size={40} />

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

                      {/* Related - now scrolls inside the same right pane */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                        style={{ padding: "48px 0 60px" }}
                      >
                        <ReadMore related={related} onNavigate={onNavigate} stacked={false} />
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
