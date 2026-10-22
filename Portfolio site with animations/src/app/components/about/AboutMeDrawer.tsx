import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { X } from "lucide-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import gridBg from "@/assets/about-me-page/grid.webp";
import envelopeStack from "@/assets/about-me-page/envelope-stack.webp";
import myPhoto1 from "@/assets/about-me-page/my-photo-1.webp";
import myPhoto2 from "@/assets/about-me-page/my-photo-2.webp";
import { colors, withAlpha } from "@/app/theme/tokens";
import { RESUME_URL, LINKEDIN_URL, EMAIL_URL, EMAIL_ADDRESS, LINKEDIN_RECOMMENDATIONS_URL } from "@/app/lib/links";
import { PHOTO_PLACES } from "@/app/data/aboutPhotos";
import { MusicPlayerCard } from "./MusicPlayerCard";
import { ShelfCard, BOOKS_SHELF, MOVIES_SHELF, RESOURCES_SHELF } from "./ShelfCard";

// ── Work experience data ───────────────────────────────────────────────────────

type Experience = {
  period: string;
  role: string;
  company: string;
  location?: string;
  bullets: string[];
  skills: string[];
  recommendation?: { name: string; title: string; href?: string };
};

const EXPERIENCE: Experience[] = [
  {
    period: "May 2024 - Jul 2026",
    role: "Associate Designer",
    company: "Canvs Studio (ICICI Bank)",
    location: "Remote",
    bullets: [
      "Designed across ICICI Bank's full digital ecosystem: iMobile, Retail Internet Banking, CSP, Global App, and UCJ. Built the CSP design system from scratch, led 100+ flows across mobile and web, and used Claude and Figma Make to build interactive prototypes for client presentations.",
    ],
    skills: [],
    recommendation: { name: "Debprotim Roy", title: "CEO", href: LINKEDIN_RECOMMENDATIONS_URL },
  },
  {
    period: "May 2023 - Nov 2023",
    role: "Lead UI-UX Designer and Webflow Developer",
    company: "Space No. 10",
    location: "Bengaluru",
    bullets: [
      "Led design across multiple client projects - a hospital website, an emergency response app prototype, and a design studio's brand built from scratch. Worked closely with marketing and product teams through brainstorms and design critiques.",
    ],
    skills: [],
  },
  {
    period: "Mar 2023 - May 2023",
    role: "Contract UX-UI Designer",
    company: "E-Facts",
    location: "Toronto (Remote)",
    bullets: ["Designed an MVP for a Canadian mobile app and a pitch deck to support it."],
    skills: [],
  },
  {
    period: "Aug 2022 - Jun 2024",
    role: "Freelance UX-UI and Webflow Designer",
    company: "Self-employed",
    location: "Remote",
    bullets: [
      "Designed products and websites across web and mobile. Built information architectures, user flows, style guides, and design systems for clients across industries.",
    ],
    skills: [],
  },
  {
    period: "Apr 2021 - Sep 2022",
    role: "Lead Graphic Designer",
    company: "Cadillac Casino",
    location: "Goa",
    bullets: ["Handled daily design needs and social media marketing for the brand."],
    skills: [],
  },
  {
    period: "Mar 2019 - Nov 2023",
    role: "Co-Founder and Print Designer",
    company: "The Forty Thieves",
    bullets: [
      "A small merch brand we started in college - button badges, stickers, calendars, fridge magnets, tees, and pop-ups. Some of the most fun I've had making things. We closed it when life pulled us in different directions, but the things we made still exist somewhere out there.",
    ],
    skills: [],
  },
  {
    period: "Jul 2019 - Jan 2020",
    role: "Graphic Design Intern",
    company: "OYO",
    location: "Goa",
    bullets: ["Designed internal announcements and creatives for the support team."],
    skills: [],
  },
  {
    period: "Jun 2018 - Jul 2018",
    role: "Intern, CSR Project and Program Design",
    company: "Mindtree",
    location: "Bengaluru",
    bullets: ["In a team of five, researched, designed, and developed content for a CSR program's facilitation material."],
    skills: [],
  },
];

const EDUCATION = [
  { period: "2026 - 2027", course: "ePGD Interaction Design", school: "IDC School of Design, IIT Bombay" },
  { period: "2022", course: "Diploma in Visual Arts", school: "Karnataka Chitrakala Parishat, Bengaluru" },
  { period: "2015 - 2019", course: "B.E. Industrial Production", school: "KLS Gogte Institute of Technology, Belgaum" },
];

// ── ExperienceRow / EducationRow ────────────────────────────────────────────────
// Desktop: a 270px left column (role, company, date - recommendation pinned to its
// bottom) beside the description. Phones stack the two.

// Hierarchy from the site palette: ink role → olive-deep company → orange date, body-grey
// paragraphs (as in the case-study drawer). Labels run size + 4 line height, paragraphs + 8.
const ROLE_STYLE: React.CSSProperties = { fontSize: 14, lineHeight: "18px", fontWeight: 500, color: colors.ink };
const PLACE_STYLE: React.CSSProperties = { fontSize: 14, lineHeight: "18px", color: colors.oliveDeep };
const DATE_STYLE: React.CSSProperties = { fontSize: 12, lineHeight: "16px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: colors.orange };
const PARA_STYLE: React.CSSProperties = { fontSize: 14, lineHeight: "22px", letterSpacing: "-0.01em", color: colors.body };

function RowDivider() {
  return <div style={{ height: 1, backgroundColor: colors.sandLine, flexShrink: 0 }} />;
}

function ExperienceRow({ exp, index, isMobile }: { exp: Experience; index: number; isMobile: boolean }) {
  const recommendation = exp.recommendation && (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p className="font-inclusive-sans" style={{ fontSize: 11, lineHeight: "15px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.oliveDeep }}>
        Recommendation
      </p>
      <div className="font-caslon not-italic" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, lineHeight: "18px", letterSpacing: "-0.01em", color: colors.ink }}>
        <span>{exp.recommendation.name}, {exp.recommendation.title}</span>
        {exp.recommendation.href && (
          <>
            <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: colors.olive }} />
            <a href={exp.recommendation.href} target="_blank" rel="noopener noreferrer" aria-label="Read the recommendation on LinkedIn" style={{ color: colors.ink, textDecoration: "underline" }}>
              Li
            </a>
          </>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="font-inclusive-sans"
      style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", gap: isMobile ? 14 : 32 }}
    >
      <div style={{ width: isMobile ? "auto" : 270, flexShrink: 0, alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: isMobile ? 14 : 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={ROLE_STYLE}>{exp.role}</p>
            <p style={PLACE_STYLE}>{exp.location ? `${exp.company}, ${exp.location}` : exp.company}</p>
          </div>
          <p style={DATE_STYLE}>{exp.period}</p>
        </div>
        {!isMobile && recommendation}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 12, alignSelf: "stretch" }}>
        {exp.bullets.map((b, i) => (
          <p key={i} style={PARA_STYLE}>{b}</p>
        ))}
      </div>
      {isMobile && recommendation}
    </motion.div>
  );
}

function EducationRow({ ed, index, isMobile }: { ed: typeof EDUCATION[0]; index: number; isMobile: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="font-inclusive-sans"
      style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: isMobile ? 10 : 32 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={ROLE_STYLE}>{ed.course}</p>
        <p style={PLACE_STYLE}>{ed.school}</p>
      </div>
      <p style={{ ...DATE_STYLE, flexShrink: 0 }}>{ed.period}</p>
    </motion.div>
  );
}

// ── PhotoFrameSection ────────────────────────────────────────────────────────────
// An endlessly looping film-strip of personal photos under the work-experience
// shelf. Every frame keeps a FIXED layout size; only transforms move it, so the
// layout never reflows while the strip moves. Each frame's scale + opacity follow
// its distance from the centre (full size dead-centre, tapering to the edges), and
// its position is squashed by the same curve so the gaps stay even as frames
// shrink. It drifts slowly on its own; scroll it, flick it, or click a frame and
// GSAP glides that frame to the centre. Three identical copies are rendered and
// the scroll position is silently wrapped, so there is never an empty end.

// Every personal photo (src/assets/about-photos - same set as the home page's PersonalSection),
// shuffled once into a fixed jumbled order so the strip looks random but stays put between
// visits. The centred photo's caption (PHOTO_PLACES) shows as the strip's subheading.
const stripFiles = import.meta.glob<string>("@/assets/about-photos/*.jpg", { eager: true, query: "?url", import: "default" });
type StripPhoto = { id: string; src: string; place?: string };
function seeded(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}
const STRIP_PHOTOS: StripPhoto[] = Object.entries(stripFiles)
  .map(([path, src]) => {
    const id = path.split("/").pop()!.replace(/\.jpg$/, "");
    return { id, src, place: PHOTO_PLACES[id] || undefined };
  })
  .sort((a, b) => seeded(a.id + "frames") - seeded(b.id + "frames"));
const N_PHOTOS = STRIP_PHOTOS.length;
const LOOP_PHOTOS = [...STRIP_PHOTOS, ...STRIP_PHOTOS, ...STRIP_PHOTOS];
const START_INDEX = N_PHOTOS + Math.floor(N_PHOTOS / 2);

function PhotoFrameSection({ isMobile }: { isMobile: boolean }) {
  const MAX_H = isMobile ? 168 : 230;                 // centre frame height
  const MIN_SCALE = (isMobile ? 96 : 128) / MAX_H;    // furthest-out frame
  const TRACK_H = MAX_H + 24;
  const SPAN = isMobile ? 400 : 620;                  // px over which a frame tapers
  const GAP = 12;
  const DRIFT_SPEED = isMobile ? 14 : 18;             // px per second - ambient, not busy
  const PAUSE_AFTER_USER = 2500;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pos = useRef(0);               // logical (fractional) scroll position
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const snapRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);       // drifting or touched - stop re-centring on image loads
  const userUntil = useRef(0);         // drift stays paused until this time (ms)
  const hovering = useRef(false);
  // Which photo sits dead-centre - its caption replaces the "a few frames" subheading.
  // Committed only once the centre has held for a moment, so it never flickers mid-move.
  const [centred, setCentred] = useState(Math.floor(N_PHOTOS / 2));
  const pendingCentre = useRef(-1);
  const captionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseForUser = () => { started.current = true; userUntil.current = performance.now() + PAUSE_AFTER_USER; };

  // Scale for a frame `d` px (layout) from the centre: easeOutCubic taper to MIN_SCALE.
  const scaleAt = (d: number) => {
    const x = Math.min(Math.abs(d) / SPAN, 1);
    return 1 - (1 - MIN_SCALE) * (1 - Math.pow(1 - x, 3));
  };
  // Where that frame should sit visually: the integral of the scale curve, so shrunken
  // frames pack together with even gaps. Continuous, so nothing ever jumps.
  const squash = (d: number) => {
    const a = Math.abs(d);
    const k = 1 - MIN_SCALE;
    const x = Math.min(a / SPAN, 1);
    let v = a - k * SPAN * (x - (1 - Math.pow(1 - x, 4)) / 4);
    if (a > SPAN) v -= k * (a - SPAN);
    return Math.sign(d) * v;
  };

  // Exact width of one copy (every frame + its gap), from the (static) layout.
  const copyWidth = () => {
    const a = frameRefs.current[0];
    const b = frameRefs.current[N_PHOTOS];
    return a && b ? b.offsetLeft - a.offsetLeft : 0;
  };

  // Paint every frame for logical position `p`. Reads layout, writes only transforms
  // and opacity - no reflow. The sub-pixel part of `p` the browser can't scroll to is
  // folded into the transform, so slow drift stays perfectly smooth.
  const render = (p = pos.current) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const frac = p - scroller.scrollLeft;
    const mid = p + scroller.clientWidth / 2;
    let bestI = -1;
    let bestD = Infinity;
    frameRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = el.offsetLeft + el.offsetWidth / 2 - mid;
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); bestI = i; }
      const s = scaleAt(d);
      el.style.transform = `translate3d(${squash(d) - d - frac}px,0,0) scale(${s})`;
      el.style.opacity = `${1 - 0.25 * ((1 - s) / (1 - MIN_SCALE))}`;
    });
    const next = bestI % N_PHOTOS;
    if (bestI >= 0 && next !== pendingCentre.current) {
      pendingCentre.current = next;
      if (captionTimer.current) clearTimeout(captionTimer.current);
      captionTimer.current = setTimeout(() => setCentred(next), 220);
    }
  };

  const setPos = (p: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    pos.current = p;
    scroller.scrollLeft = p;
    render(p);
  };

  // Keep the position inside the middle copy - invisible, as all three are identical.
  const wrap = () => {
    const w = copyWidth();
    if (!w) return;
    if (pos.current < w * 0.5) setPos(pos.current + w);
    else if (pos.current > w * 1.5) setPos(pos.current - w);
  };

  const centreFrame = (el: HTMLDivElement, animate: boolean) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const w = copyWidth();
    let start = pos.current;
    let target = el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2;
    // Pin both ends of the move into the middle copy so no wrap is needed mid-flight.
    if (w) {
      while (target < w * 0.5) target += w;
      while (target > w * 1.5) target -= w;
      if (Math.abs(start - target) > w * 0.75) {
        start += start < target ? w : -w;
        setPos(start);
      }
    }
    tweenRef.current?.kill();
    if (!animate) { setPos(target); return; }
    const proxy = { x: start };
    tweenRef.current = gsap.to(proxy, {
      x: target,
      duration: isMobile ? 0.8 : 1,
      ease: "power3.inOut",
      onUpdate: () => setPos(proxy.x),
    });
  };

  const nearestFrame = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return null;
    const mid = pos.current + scroller.clientWidth / 2;
    let best: HTMLDivElement | null = null;
    let bestD = Infinity;
    for (const el of frameRefs.current) {
      if (!el) continue;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = el; }
    }
    return best;
  };

  // Our own scroll writes land within a pixel of `pos`; anything else is a person
  // scrolling/flicking - follow it, then snap the nearest frame to the centre.
  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || tweenRef.current?.isActive()) return;
    if (Math.abs(scroller.scrollLeft - pos.current) <= 1) return;
    pauseForUser();
    pos.current = scroller.scrollLeft;
    wrap();
    render();
    if (snapRef.current) clearTimeout(snapRef.current);
    snapRef.current = setTimeout(() => { const el = nearestFrame(); if (el) centreFrame(el, true); }, 160);
  };

  const centreOnClick = (i: number) => {
    const el = frameRefs.current[i];
    if (!el) return;
    pauseForUser();
    userUntil.current += 1000; // let the glide finish before drifting again
    centreFrame(el, true);
  };

  // Seed the resting layout (and re-seed when the breakpoint flips).
  useLayoutEffect(() => {
    const el = frameRefs.current[START_INDEX];
    if (el) centreFrame(el, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Slow, continuous drift. Pauses while hovered, during a glide, for a beat after any
  // touch/wheel/drag, and entirely for reduced-motion users.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const startAt = last + 1200; // let the photos load and settle their widths first
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (now > startAt && now > userUntil.current && !hovering.current && !tweenRef.current?.isActive()) {
        started.current = true;
        const w = copyWidth();
        let p = pos.current + DRIFT_SPEED * dt;
        if (w && p > w * 1.5) p -= w;
        setPos(p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => () => {
    if (snapRef.current) clearTimeout(snapRef.current);
    if (captionTimer.current) clearTimeout(captionTimer.current);
    tweenRef.current?.kill();
  }, []);

  const caption = STRIP_PHOTOS[centred]?.place ?? "a few frames";

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${colors.pinkLight} 0%, ${colors.sand} 66.83%)`,
        padding: `${isMobile ? 24 : 28}px 0 ${isMobile ? 28 : 36}px`,
        overflow: "hidden",
      }}
    >
      {/* Centred heading + short vertical rule */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: `0 ${isMobile ? 18 : 36}px`, marginBottom: isMobile ? 22 : 30 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
          <p className="font-caslon not-italic" style={{ fontSize: 24, lineHeight: "28px", textAlign: "center", color: colors.ink, fontWeight: 600 }}>
            Outside of work
          </p>
          {/* The centred photo's caption; photos without one fall back to "a few frames".
              The old line fades out before the new one fades in, so they never overlap. */}
          <div style={{ height: 28, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={caption}
                className="font-caslon"
                initial={{ opacity: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(2px)" }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                style={{ fontSize: isMobile ? 18 : 24, lineHeight: "28px", fontStyle: "italic", textAlign: "center", whiteSpace: "nowrap", color: colors.oliveDeep }}
              >
                {caption}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <span style={{ width: 2, height: 36, backgroundColor: colors.ink }} />
      </div>

      {/* Looping film-strip track - fixed height, deliberately wider than the drawer */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") hovering.current = true; }}
        onPointerLeave={() => { hovering.current = false; }}
        onPointerDown={pauseForUser}
        onTouchStart={pauseForUser}
        onTouchMove={pauseForUser}
        onWheel={pauseForUser}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: GAP,
          height: TRACK_H,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
        }}
      >
        {LOOP_PHOTOS.map((photo, i) => (
          <button
            key={i}
            onClick={() => centreOnClick(i)}
            aria-label={photo.place ?? "Photo"}
            style={{ flex: "0 0 auto", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", height: TRACK_H }}
          >
            {/* Fixed height; width = height × the photo's own aspect ratio (read once it
                loads), so a photo is never stretched or cropped. */}
            <div
              ref={(el) => { frameRefs.current[i] = el; }}
              style={{ height: MAX_H, aspectRatio: "3 / 4", flex: "0 0 auto", transformOrigin: "50% 50%", willChange: "transform, opacity" }}
            >
              <div style={{ width: "100%", height: "100%", backgroundColor: colors.white, borderRadius: 4, overflow: "hidden", boxShadow: `0 4px 14px ${withAlpha(colors.ink, 0.14)}` }}>
                <img
                  src={photo.src}
                  alt={photo.place ?? ""}
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const frame = frameRefs.current[i];
                    if (frame && img.naturalWidth) frame.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                    if (!started.current) { const el = frameRefs.current[START_INDEX]; if (el) centreFrame(el, false); } else { render(); }
                  }}
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AboutMeDrawer ──────────────────────────────────────────────────────────────

// Hero collage geometry. The two wave poses (my-photo-1: 595×915, my-photo-2: 720×913)
// share one pixel scale; measured against each other, pose 2's face sits 17px right and
// 20px up of pose 1's. Pose 1 defines the box and pose 2 is offset back by that amount,
// so the face stays perfectly still and only the arm moves.
const POSE_A = { w: 595, h: 915 };
const POSE_B = { w: 720, h: 913, dx: -17, dy: 20 };
// Where the photo sits on the envelope stack (fractions of the 1000×815 envelope image):
// scaled so the head nearly fills the kraft envelope (x 228-770, y 125-720), with the head
// (pose A x 27-562, y 255-840) centred on it. Same ratios on web and mobile.
const HERO_PHOTO = { left: 0.245, top: -0.059, width: 0.512 };

// Warm the browser cache with the hero images once the page is idle, so the drawer
// opens with them already decoded instead of loading them on demand.
function preloadAboutImages() {
  for (const src of [envelopeStack, myPhoto1, myPhoto2, gridBg]) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }
}

interface AboutMeDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AboutMeDrawer({ open, onClose }: AboutMeDrawerProps) {
  const isMobile = useIsMobile(768);
  const drawerWidth = isMobile ? "100%" : "min(900px, calc(90vw / var(--page-zoom)))";
  const drawerBorderRadius = isMobile ? 0 : "24px 0 0 24px";
  const contentPad = isMobile ? 18 : 36;

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(preloadAboutImages);
  }, []);

  // The wave: a GSAP timeline swapping the two poses, plus a slow sway of the whole photo.
  // Pose B sits on top. Going A→B, B fades in fully before A fades out underneath (and the
  // reverse coming back), so the aligned face never dips in opacity - only the arm changes.
  // Starts once both poses are decoded, so the first swap never flashes.
  const swayRef = useRef<HTMLDivElement>(null);
  const poseARef = useRef<HTMLImageElement>(null);
  const poseBRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!open) return;
    const a = poseARef.current, b = poseBRef.current, sway = swayRef.current;
    if (!a || !b || !sway) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    Promise.all([a, b].map((img) => img.decode().catch(() => undefined))).then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.set(a, { opacity: 1 });
        gsap.set(b, { opacity: 0 });
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.timeline({ repeat: -1, defaults: { duration: 0.24, ease: "sine.inOut" } })
          .to(b, { opacity: 1 }, 0.9)
          .to(a, { opacity: 0 }, ">-0.08")
          .to(a, { opacity: 1 }, "+=0.9")
          .to(b, { opacity: 0 }, ">-0.08");
        gsap.to(sway, { rotation: 1.6, y: -4, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="about-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 499, backgroundColor: withAlpha(colors.ink, 0.35), backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="about-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: drawerWidth, zIndex: 500,
              borderRadius: drawerBorderRadius,
              backgroundColor: colors.olive,
              color: colors.ink, // un-styled text inherits the site ink, not the browser near-black
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button - always floats over whatever content is scrolled beneath it */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: isMobile ? 14 : 20, right: isMobile ? 14 : 20, zIndex: 20,
                width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%",
                backgroundColor: withAlpha(colors.white, 0.45), border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = withAlpha(colors.white, 0.7); }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = withAlpha(colors.white, 0.45); }}
            >
              <X size={15} color={colors.ink} />
            </button>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

              {/* ── Section A: olive hero ── */}
              <div style={{ position: "relative", backgroundColor: colors.olive }}>
                <div
                  style={{
                    position: "absolute", top: 40, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${gridBg})`, backgroundSize: "cover", backgroundPosition: "top center", backgroundRepeat: "no-repeat",
                    opacity: 0.5, mixBlendMode: "multiply", pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1, padding: `${isMobile ? 20 : 36}px ${contentPad}px 0` }}>
                <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 20 : 24, lineHeight: isMobile ? "26px" : "30px", letterSpacing: "-0.02em", color: colors.ink, fontWeight: 600, marginBottom: isMobile ? 20 : 28 }}>
                  About me
                </p>

                {/* Photo collage: envelope stack backdrop + waving photo on top */}
                <div style={{ position: "relative", display: "flex", justifyContent: "center", paddingBottom: isMobile ? 24 : 36 }}>
                  <div style={{ position: "relative", width: isMobile ? "82%" : "72%", maxWidth: 500 }}>
                    {/* room for the raised hand above the stack (% of this box's width) */}
                    <div style={{ paddingTop: `${-HERO_PHOTO.top * (815 / 1000) * 100}%` }} />
                    <div style={{ position: "relative" }}>
                      <img src={envelopeStack} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
                      <div
                        style={{
                          position: "absolute",
                          left: `${HERO_PHOTO.left * 100}%`, top: `${HERO_PHOTO.top * 100}%`, width: `${HERO_PHOTO.width * 100}%`,
                        }}
                      >
                        <div ref={swayRef} style={{ position: "relative", width: "100%", aspectRatio: `${POSE_A.w} / ${POSE_A.h}`, transformOrigin: "50% 85%", willChange: "transform" }}>
                          <img
                            ref={poseARef}
                            src={myPhoto1}
                            alt="Laxmi Mahajan"
                            decoding="async"
                            style={{ position: "absolute", left: 0, top: 0, width: "100%", maxWidth: "none", height: "auto", willChange: "opacity" }}
                          />
                          <img
                            ref={poseBRef}
                            src={myPhoto2}
                            alt=""
                            decoding="async"
                            style={{
                              position: "absolute",
                              left: `${(POSE_B.dx / POSE_A.w) * 100}%`, top: `${(POSE_B.dy / POSE_A.h) * 100}%`,
                              // maxWidth "none": the global img cap would squash this wider pose
                              width: `${(POSE_B.w / POSE_A.w) * 100}%`, maxWidth: "none", height: "auto",
                              opacity: 0, willChange: "opacity",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                </div>
              </div>

              {/* ── Section B: tan work-experience + education shelf ── */}
              <div style={{ backgroundColor: colors.sand, borderRadius: isMobile ? "16px 16px 0 0" : "24px 24px 0 0", padding: `${isMobile ? 32 : 48}px ${contentPad}px`, display: "flex", flexDirection: "column", gap: isMobile ? 40 : 56 }}>
                {([
                  ["Work experience", EXPERIENCE.map((exp, i) => <ExperienceRow key={exp.company + exp.period} exp={exp} index={i} isMobile={isMobile} />)],
                  ["Education", EDUCATION.map((ed, i) => <EducationRow key={ed.course} ed={ed} index={i} isMobile={isMobile} />)],
                ] as const).map(([heading, rows]) => (
                  <div key={heading} style={{ display: "flex", flexDirection: "column", gap: isMobile ? 24 : 28 }}>
                    <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 28 : 36, lineHeight: isMobile ? "36px" : "44px", letterSpacing: "-0.02em", color: colors.ink, fontWeight: 600, marginBottom: 4 }}>
                      {heading}
                    </p>
                    {rows.flatMap((row, i) => (i === 0 ? [row] : [<RowDivider key={`d${i}`} />, row]))}
                  </div>
                ))}

                {/* LinkedIn · email · resume, split by short vertical rules */}
                <div className="font-inclusive-sans" style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 40, borderTop: `1px solid ${colors.sandLine}`, paddingTop: isMobile ? 24 : 28 }}>
                  {[
                    { label: "LinkedIn", href: LINKEDIN_URL, align: "left" },
                    { label: isMobile ? "Email" : EMAIL_ADDRESS, href: EMAIL_URL, align: "center" },
                    { label: "Resume", href: RESUME_URL, align: "right" },
                  ].flatMap(({ label, href, align }, i) => [
                    ...(i > 0 ? [<span key={`r${i}`} style={{ width: 1, height: 18, backgroundColor: colors.sandLine, flexShrink: 0 }} />] : []),
                    <a
                      key={label}
                      href={href}
                      // mailto opens the mail app - a new tab would just sit there empty
                      {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      style={{
                        flex: align === "center" ? "none" : 1, textAlign: align as "left" | "center" | "right",
                        fontSize: 14, lineHeight: "18px", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3, color: colors.orange,
                      }}
                    >
                      {label}
                    </a>,
                  ])}
                </div>
              </div>

              {/* ── Section B2: personal photo strip ── */}
              <PhotoFrameSection isMobile={isMobile} />

              {/* ── Section B3: things outside work - books/films, music, resources ── */}
              <div style={{ backgroundColor: colors.sand }}>
                <div style={{ backgroundColor: colors.olive, borderRadius: isMobile ? "16px 16px 0 0" : "24px 24px 0 0", padding: `${isMobile ? 24 : 36}px ${contentPad}px 0` }}>
                  <p className="font-inclusive-sans" style={{ fontSize: isMobile ? 14 : 18, lineHeight: isMobile ? "21px" : "26px", textAlign: "center", letterSpacing: "-0.02em", color: colors.ink, maxWidth: 560, margin: "0 auto", marginBottom: isMobile ? 24 : 32 }}>
                    A small window into the things I return to outside of work - the books I read, the films I rewatch, and the songs on repeat.
                  </p>

                  {/* Books and Movies & resources stack beside the music player: two 188px
                      cards + a 24px gap = the player's 400px height. Mobile stacks all three. */}
                  <div style={{ display: "flex", gap: isMobile ? 16 : 24, flexDirection: isMobile ? "column" : "row", alignItems: "stretch", marginBottom: isMobile ? 24 : 36 }}>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24 }}>
                      <ShelfCard shelves={[BOOKS_SHELF]} isMobile={isMobile} />
                      <ShelfCard shelves={[MOVIES_SHELF, RESOURCES_SHELF]} isMobile={isMobile} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <MusicPlayerCard isMobile={isMobile} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Breathing room at the end of the drawer (and clear of the mobile FAB) */}
              <div style={{ height: isMobile ? 88 : 60 }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
