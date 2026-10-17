import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { X, Volume2 } from "lucide-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { useSpotifyPlayer } from "@/app/hooks/useSpotifyPlayer";
import vinylDisc from "@/assets/vinyl-player/vinyl-disc.png";
import gridBg from "@/assets/about-me-page/grid.webp";
import envelopeStack from "@/assets/about-me-page/envelope-stack.webp";
import myPhoto1 from "@/assets/about-me-page/my-photo-1.webp";
import myPhoto2 from "@/assets/about-me-page/my-photo-2.webp";
import bookCover1 from "@/assets/about-me-page/book-1.png";
import movieCover1 from "@/assets/about-me-page/movie-1.png";
import movieCover2 from "@/assets/about-me-page/movie-2.png";
import { colors, withAlpha } from "@/app/theme/tokens";
import { PrimaryButton } from "@/app/components/ui/Buttons";
import { RESUME_URL, LINKEDIN_URL, EMAIL_URL, EMAIL_ADDRESS, LINKEDIN_RECOMMENDATIONS_URL } from "@/app/lib/links";
import { PHOTO_PLACES } from "@/app/data/aboutPhotos";

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

// ── Books / Movies / Resources data ───────────────────────────────────────────
// `cover`/`poster`/`art` are optional - entries without one render a titled
// placeholder tile until the real asset is dropped in. Currently-reading books
// carry `reading: true` and are pinned to the front of the Books carousel.

type BookItem = { title: string; author: string; cover?: string; reading?: boolean };
type MovieItem = { title: string; year: string; poster?: string };
type ResourceItem = { title: string; kind: string; art?: string };

const BOOKS: BookItem[] = [
  // currently reading - pinned first
  { title: "Good Material", author: "Dolly Alderton", reading: true },
  { title: "Gujarat Diaries", author: "Rana Ayyub", reading: true },
  { title: "Design as an Art", author: "Bruno Munari", reading: true },
  // backlist
  { title: "If Tomorrow Comes", author: "Sidney Sheldon", cover: bookCover1 },
  { title: "The Doomsday Conspiracy", author: "Sidney Sheldon" },
  { title: "The Stars Shine Down", author: "Sidney Sheldon" },
  { title: "Nothing Lasts Forever", author: "Sidney Sheldon" },
  { title: "The Best Laid Plans", author: "Sidney Sheldon" },
];
const MOVIES: MovieItem[] = [
  { title: "Perfect Days", year: "2023", poster: movieCover1 },
  { title: "Little Forest", year: "2018", poster: movieCover2 },
  { title: "Not Without My Daughter", year: "1991" },
  { title: "Grave of the Fireflies", year: "1988" },
];
const RESOURCES: ResourceItem[] = [
  { title: "Podcast on the Gujarat riots", kind: "Podcast" },
  { title: "An interview from the Linear team", kind: "Interview" },
  { title: "…and your own mistakes", kind: "Ongoing" },
];

// ── Shelf cards: Books / Movies / Resources ────────────────────────────────────
// A 3-slot sliding cover carousel (prev/active/next) with one forward arrow that
// wraps around at the end.

type BookSlot = "left" | "center" | "right";

function bookSlotStyle(slot: BookSlot): React.CSSProperties {
  switch (slot) {
    case "center":
      return { transform: "translateX(-50%) translateY(-50%) rotate(0deg) scale(1)", opacity: 1, zIndex: 10, left: "50%", top: "calc(50% - 10px)" };
    case "left":
      return { transform: "translateX(-50%) translateY(-50%) rotate(-8deg) scale(0.78)", opacity: 0.35, zIndex: 5, left: "calc(50% - 70px)", top: "calc(50% + 12px)" };
    case "right":
      return { transform: "translateX(-50%) translateY(-50%) rotate(8deg) scale(0.78)", opacity: 0.35, zIndex: 5, left: "calc(50% + 70px)", top: "calc(50% + 12px)" };
  }
}

function BooksPanel({ activeIdx }: { activeIdx: number }) {
  const total = BOOKS.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: colors.pinkLight }}>
      {[prevIdx, activeIdx, nextIdx].map((idx, i) => {
        const slot: BookSlot = i === 0 ? "left" : i === 1 ? "center" : "right";
        const book = BOOKS[idx];
        return (
          <div
            key={idx}
            style={{
              position: "absolute", width: 80, height: 120, borderRadius: 1.4, overflow: "hidden",
              transition: "transform 0.4s cubic-bezier(0.25,0.1,0.25,1), opacity 0.4s cubic-bezier(0.25,0.1,0.25,1)",
              boxShadow: "2.78px 2.78px 1.39px rgba(56,20,28,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
              ...bookSlotStyle(slot),
            }}
          >
            {book.cover ? (
              <img src={book.cover} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.pinkLight}, ${colors.pink})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px" }}>
                <span className="font-caslon not-italic" style={{ fontSize: 9, lineHeight: "12px", textAlign: "center", fontWeight: 600, color: colors.ink }}>{book.title}</span>
              </div>
            )}
            <div style={{ position: "absolute", top: 0, left: "2.97px", height: "100%", width: 2, filter: "blur(1.4px)", backgroundColor: "rgba(35,30,30,0.3)" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 9, left: 64, display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: colors.brown }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(colors.brown, 0.3) }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: withAlpha(colors.brown, 0.5) }}>{total}</span>
      </div>
    </div>
  );
}

function movieSlotStyle(slot: BookSlot): React.CSSProperties {
  switch (slot) {
    case "center":
      return { width: 90, height: 120, left: "50%", top: "calc(50% - 10px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 1, zIndex: 10 };
    case "right":
      return { width: 60, height: 80, left: "calc(50% + 82px)", top: "calc(50% + 6px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 0.35, zIndex: 5 };
    case "left":
      return { width: 60, height: 80, left: "calc(50% - 82px)", top: "calc(50% - 18px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 0.35, zIndex: 5 };
  }
}

// Each slot remounts on index change (its key includes the item's own index),
// so a plain CSS transition can't animate it - GSAP gives it a subtle fade+settle
// entrance instead.
function MovieImage({ src, alt, slot }: { src?: string; alt: string; slot: BookSlot }) {
  const elRef = useRef<HTMLDivElement>(null);
  const { transform: _transform, opacity: targetOpacity, ...rest } = movieSlotStyle(slot);

  useEffect(() => {
    if (!elRef.current) return;
    // GSAP owns the transform (xPercent/yPercent recenter the anchor point,
    // matching the translate(-50%,-50%) the CSS version used) so its scale
    // tween doesn't clobber the centering.
    gsap.set(elRef.current, { xPercent: -50, yPercent: -50 });
    gsap.fromTo(elRef.current, { opacity: 0, scale: 0.94 }, { opacity: targetOpacity, scale: 1, duration: 0.35, ease: "power2.out" });
  }, [targetOpacity]);

  return (
    <div ref={elRef} style={{ position: "absolute", borderRadius: 2, overflow: "hidden", boxShadow: "2px 2px 2px rgba(0,0,0,0.25)", ...rest }}>
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.sandLight}, ${colors.sandBorder})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 6px" }}>
          <span className="font-caslon not-italic" style={{ fontSize: 8.5, lineHeight: "11px", textAlign: "center", fontWeight: 600, color: colors.brown }}>{alt}</span>
        </div>
      )}
    </div>
  );
}

function MoviesPanel({ activeIdx }: { activeIdx: number }) {
  const total = MOVIES.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: colors.sandBorder }}>
      <MovieImage key={`left-${prevIdx}`} src={MOVIES[prevIdx].poster} alt={MOVIES[prevIdx].title} slot="left" />
      <MovieImage key={`center-${activeIdx}`} src={MOVIES[activeIdx].poster} alt={MOVIES[activeIdx].title} slot="center" />
      <MovieImage key={`right-${nextIdx}`} src={MOVIES[nextIdx].poster} alt={MOVIES[nextIdx].title} slot="right" />
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: colors.brown }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(colors.brown, 0.3) }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: withAlpha(colors.brown, 0.5) }}>{total}</span>
      </div>
    </div>
  );
}

function NextArrowButton({ onClick, fill }: { onClick: () => void; fill: string }) {
  const nextPath = "M9.2751 5.99991L18.0002 11.2981V12.6742L9.2751 17.9999V16.2522L15.5054 12.6605L5.0002 13.0871V11.0779L15.4919 11.4907L9.2751 7.85771V5.99991Z";
  return (
    <button onClick={onClick} aria-label="Next" style={{ position: "relative", flexShrink: 0, width: 24, height: 24, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.5" />
        <path d={nextPath} fill={fill} />
      </svg>
    </button>
  );
}

// One shelf: a sliding cover carousel on the left, a heading (or tab switch) and the
// current item's title + forward arrow on the right. Books uses one shelf; Movies and
// Resources share a card and switch with tabs.
interface Shelf {
  label: string;
  count: number;
  background: string;
  arrowFill: string;
  panel: (activeIdx: number) => React.ReactNode;
  item: (activeIdx: number) => { title: string; subtitle: string; badge?: string };
}

const SHELF_HEIGHT = 188;

function ShelfCard({ shelves, isMobile }: { shelves: Shelf[]; isMobile: boolean }) {
  const [tab, setTab] = useState(0);
  const [indices, setIndices] = useState(() => shelves.map(() => 0));
  const textRef = useRef<HTMLDivElement>(null);
  const shelf = shelves[tab];
  const idx = indices[tab];
  const { title, subtitle, badge } = shelf.item(idx);

  // Subtle GSAP crossfade whenever the displayed title/subtitle changes.
  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(textRef.current, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, [title, subtitle]);

  const next = () => setIndices((all) => all.map((v, i) => (i === tab ? (v + 1) % shelf.count : v)));
  const headingStyle = { fontSize: 12, letterSpacing: "-0.02em", background: "none", border: "none", padding: 0, color: colors.ink } as const;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: "100%", height: SHELF_HEIGHT, backgroundColor: shelf.background, transition: "background 0.4s ease" }}>
      {shelf.panel(idx)}

      <div style={{ position: "absolute", left: 170, top: 16, right: isMobile ? 12 : 16, height: SHELF_HEIGHT - 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {shelves.length === 1 ? (
            <p className="font-caslon" style={{ ...headingStyle, fontStyle: "italic" }}>{shelf.label}</p>
          ) : (
            shelves.map((sh, i) => (
              <button
                key={sh.label}
                onClick={() => setTab(i)}
                className="font-caslon"
                style={{ ...headingStyle, cursor: "pointer", fontStyle: i === tab ? "italic" : "normal", textDecoration: i === tab ? "underline" : "none" }}
              >
                {sh.label}
              </button>
            ))
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <div ref={textRef} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
            {badge && (
              <span style={{ alignSelf: "flex-start", backgroundColor: colors.pink, borderRadius: 20, padding: "2px 8px", marginBottom: 2 }}>
                <span className="font-inclusive-sans font-normal" style={{ fontSize: 9, letterSpacing: "0.5px", textTransform: "uppercase", color: colors.ink }}>{badge}</span>
              </span>
            )}
            <p className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: colors.ink }}>{title}</p>
            <p className="font-inclusive-sans uppercase" style={{ fontSize: 12, lineHeight: "16px", color: colors.oliveDeep }}>{subtitle}</p>
          </div>
          <NextArrowButton onClick={next} fill={shelf.arrowFill} />
        </div>
      </div>
    </div>
  );
}

const BOOKS_SHELF: Shelf = {
  label: "Books",
  count: BOOKS.length,
  background: colors.pinkLight,
  arrowFill: colors.pink,
  panel: (i) => <BooksPanel activeIdx={i} />,
  item: (i) => ({ title: BOOKS[i].title, subtitle: BOOKS[i].author.toUpperCase(), badge: BOOKS[i].reading ? "reading now" : undefined }),
};
const MOVIES_SHELF: Shelf = {
  label: "Movies",
  count: MOVIES.length,
  background: colors.sand,
  arrowFill: colors.orange,
  panel: (i) => <MoviesPanel activeIdx={i} />,
  item: (i) => ({ title: MOVIES[i].title, subtitle: MOVIES[i].year }),
};
const RESOURCES_SHELF: Shelf = {
  label: "Resources",
  count: RESOURCES.length,
  background: colors.sandLight,
  arrowFill: colors.oliveDeep,
  panel: (i) => <ResourcesPanel activeIdx={i} />,
  item: (i) => ({ title: RESOURCES[i].title, subtitle: RESOURCES[i].kind }),
};

// Resources: same stacked-tile carousel, with placeholder tiles until real artwork lands.

function ResourcesPanel({ activeIdx }: { activeIdx: number }) {
  const total = RESOURCES.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: colors.oliveLight }}>
      {[prevIdx, activeIdx, nextIdx].map((idx, i) => {
        const slot: BookSlot = i === 0 ? "left" : i === 1 ? "center" : "right";
        const resource = RESOURCES[idx];
        return (
          <div
            key={idx}
            style={{
              position: "absolute", width: 80, height: 120, borderRadius: 1.4, overflow: "hidden",
              transition: "transform 0.4s cubic-bezier(0.25,0.1,0.25,1), opacity 0.4s cubic-bezier(0.25,0.1,0.25,1)",
              boxShadow: "2.78px 2.78px 1.39px rgba(40,40,20,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
              ...bookSlotStyle(slot),
            }}
          >
            {resource.art ? (
              <img src={resource.art} alt={resource.title} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.sandLight}, ${colors.oliveLight})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px" }}>
                <span className="font-inclusive-sans font-normal uppercase" style={{ fontSize: 8, letterSpacing: "0.5px", textAlign: "center", color: colors.oliveDeep }}>{resource.kind}</span>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 9, left: 64, display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: colors.oliveDeep }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(colors.oliveDeep, 0.3) }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: withAlpha(colors.oliveDeep, 0.5) }}>{total}</span>
      </div>
    </div>
  );
}

// ── MusicPlayerCard ──────────────────────────────────────────────────────────────
// Connected to the real Spotify account authorized in this browser - shows
// whatever is actually playing and controls that real playback (play/pause,
// seek). Spotify's control endpoints require Premium and an active device.

// ── Vinyl ──────────────────────────────────────────────────────────────────────
// The record, built from the Figma spec (428px disc): album art + duo noise, then the
// centre label - grey ring (150), pale ring (118, 1px border), dashed ring (110, 7px),
// white spindle (88). Every size is a share of the disc, so the 160px phone disc matches.
// The art, noise and label spin; the drop shadow and the -2/-2 inner highlight stay put,
// like light on a real record.

// Duo noise (Figma "Noise / Duo": 0.5 size, 100% density, black 25% + white 25%): every
// pixel is either black or white at 25% alpha.
const NOISE_URL = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n' x='0' y='0' width='100%' height='100%'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='1' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/>" +
  "<feComponentTransfer><feFuncR type='discrete' tableValues='0 1'/><feFuncG type='discrete' tableValues='0 1'/>" +
  "<feFuncB type='discrete' tableValues='0 1'/><feFuncA type='linear' slope='0' intercept='0.25'/></feComponentTransfer>" +
  "</filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"
).replace(/%2523/g, "%23")}")`;

const VINYL_LABEL = [
  // [diameter in Figma px, styles]
  [150, { background: "#9799A5" }],
  [118, { background: "#CAC4C8", border: "1px solid #ABA7AB" }],
  [88, { background: colors.white }],
  [110, { borderStyle: "dashed", borderColor: "#B2A9AF", borderWidthPx: 7 }],
] as const;

function Vinyl({ size, art, spinning }: { size: number; art: string; spinning: boolean }) {
  const k = size / 428;
  const round: React.CSSProperties = { position: "absolute", borderRadius: "50%", boxSizing: "border-box" };
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", boxShadow: `0px ${4 * k}px ${4 * k}px rgba(0,0,0,0.2)` }}>
      <motion.div
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={spinning ? { duration: 12, repeat: Infinity, ease: "linear" } : { duration: 0.6, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}
      >
        <img src={art} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: NOISE_URL, backgroundSize: "128px 128px" }} />
        {VINYL_LABEL.map(([d, st], i) => {
          const { borderWidthPx, ...rest } = st as Record<string, string | number> & { borderWidthPx?: number };
          return (
            <div
              key={i}
              aria-hidden="true"
              style={{
                ...round,
                ...rest,
                ...(borderWidthPx ? { borderWidth: Math.max(1, borderWidthPx * k) } : {}),
                width: `${(d / 428) * 100}%`, height: `${(d / 428) * 100}%`,
                left: `${((428 - d) / 2 / 428) * 100}%`, top: `${((428 - d) / 2 / 428) * 100}%`,
              }}
            />
          );
        })}
      </motion.div>
      {/* Inner highlight: inset -2/-2 white 25%, fixed while the disc turns */}
      <div aria-hidden="true" style={{ ...round, inset: 0, pointerEvents: "none", boxShadow: `inset ${-2 * Math.max(k, 0.5)}px ${-2 * Math.max(k, 0.5)}px 0px rgba(255,255,255,0.25)` }} />
    </div>
  );
}


function formatTrackTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function MusicPlayerCard({ isMobile }: { isMobile: boolean }) {
  const { status, track, errorMessage, connect, disconnect, togglePlay, seek, isPublic } = useSpotifyPlayer();
  const artSrc = track?.albumArt || vinylDisc;
  const spinning = !!track?.isPlaying;
  // "Now playing" while a track is on, "Last played" when nothing is.
  const stateLabel = track ? (track.recent ? "Last played" : track.isPlaying ? "Now playing" : "Paused") : "";
  const playLabel = isPublic ? "Listen on Spotify" : track?.isPlaying ? "Pause" : "Play";

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!track || isPublic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width;
    seek(ratio * track.durationMs);
  };

  const notPlayingState = (
    <div style={{ textAlign: "center", padding: isMobile ? "8px 20px" : 0 }}>
      {status === "no-playback" ? (
        <>
          <p className="font-inclusive-sans" style={{ fontSize: 13, color: colors.oliveDeep }}>Nothing playing right now</p>
          <p className="font-inclusive-sans" style={{ fontSize: 11, color: colors.oliveDeep, marginTop: 4 }}>Check back in a bit</p>
          {!isPublic && (
            <button onClick={disconnect} className="font-inclusive-sans" style={{ fontSize: 10, color: colors.oliveDeep, background: "none", border: "none", cursor: "pointer", marginTop: 10, textDecoration: "underline" }}>
              disconnect spotify
            </button>
          )}
        </>
      ) : status === "connecting" ? (
        <p className="font-inclusive-sans" style={{ fontSize: 13, color: colors.oliveDeep }}>Connecting…</p>
      ) : (
        <>
          <p className="font-inclusive-sans" style={{ fontSize: 12, color: colors.oliveDeep, marginBottom: 12 }}>
            {status === "error" ? errorMessage : "See what I'm actually listening to"}
          </p>
          <PrimaryButton onClick={connect} color={colors.olive} arrow={false}>connect spotify</PrimaryButton>
        </>
      )}
    </div>
  );

  if (isMobile) {
    // Mobile: slim horizontal bar, album art peeking from the left edge.
    return (
      <div style={{ position: "relative", width: "100%", height: 120, borderRadius: 16, overflow: "hidden", backgroundColor: colors.sand, border: `1px solid ${colors.sandLine}` }}>
        {status === "connected" && track ? (
          <>
            <div style={{ position: "absolute", left: -81, top: "calc(50% - 80px)" }}>
              <Vinyl size={160} art={artSrc} spinning={spinning} />
            </div>

            <div style={{ position: "absolute", left: 103, right: 16, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-inclusive-sans font-medium" style={{ fontSize: 9, lineHeight: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: colors.orange, marginBottom: 2 }}>
                    {stateLabel}
                  </p>
                  <p className="font-inclusive-sans" style={{ fontSize: 10, lineHeight: "12px", letterSpacing: "0.02em", textTransform: "uppercase", color: colors.oliveDeep, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.artist}
                  </p>
                  <p className="font-caslon not-italic" style={{ fontSize: 14, lineHeight: "18px", letterSpacing: "-0.02em", fontWeight: 600, color: colors.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.name}
                  </p>
                </div>
                <button
                  onClick={togglePlay}
                  aria-label={playLabel}
                  title={playLabel}
                  style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: withAlpha(colors.oliveDeep, 0.2), border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {track.isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="4" y="3" width="3" height="10" rx="1" fill={colors.oliveDeep} />
                      <rect x="9" y="3" width="3" height="10" rx="1" fill={colors.oliveDeep} />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 3L13 8L5 13V3Z" fill={colors.oliveDeep} />
                    </svg>
                  )}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div onClick={handleSeek} style={{ position: "relative", height: 6, display: "flex", alignItems: "center", cursor: isPublic ? "default" : "pointer" }}>
                  <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: colors.olive, borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: colors.orange, width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%` }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="font-inclusive-sans" style={{ fontSize: 8, lineHeight: "10px", color: colors.oliveDeep }}>
                    {formatTrackTime(track.progressMs)} / {formatTrackTime(track.durationMs)}
                  </p>
                  <Volume2 size={16} color={colors.oliveDeep} />
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="font-inclusive-sans" style={{ position: "absolute", bottom: 4, left: 103, fontSize: 9, color: colors.orange }}>{errorMessage}</p>
            )}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {notPlayingState}
          </div>
        )}
      </div>
    );
  }

  // Desktop: vinyl peeking from the top, spins continuously.
  return (
    <div
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        backgroundColor: colors.sand, border: `1px solid ${colors.sandLine}`,
        height: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      {/* Disc: 428px, peeking from the top (Figma: left -18, top -216) */}
      <div style={{ position: "absolute", top: -216, left: "50%", transform: "translateX(-50%)" }}>
        <Vinyl size={428} art={artSrc} spinning={spinning} />
      </div>

      <div style={{ padding: "0 28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {status === "connected" && track ? (
          <>
            <div style={{ textAlign: "center" }}>
              <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: "14px", letterSpacing: "0.06em", textTransform: "uppercase", color: colors.orange, marginBottom: 6 }}>
                {stateLabel}
              </p>
              <p className="font-inclusive-sans" style={{ fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: colors.oliveDeep }}>
                {track.artist}
              </p>
              <p className="font-caslon not-italic" style={{ fontSize: 24, fontWeight: 600, color: colors.ink, marginTop: 4 }}>
                {track.name}
              </p>
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={togglePlay}
                aria-label={playLabel}
                  title={playLabel}
                style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: colors.oliveDeep }}
              >
                {track.isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="2" width="3" height="12" rx="1" fill="currentColor" />
                    <rect x="10" y="2" width="3" height="12" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3L13 8L5 13V3Z" fill="currentColor" />
                  </svg>
                )}
              </button>
              <div onClick={handleSeek} style={{ position: "relative", flex: 1, height: 10, display: "flex", alignItems: "center", cursor: isPublic ? "default" : "pointer" }}>
                <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: colors.olive, borderRadius: 2 }} />
                <div
                  style={{
                    position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: colors.orange,
                    width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%`,
                  }}
                />
              </div>
              <p className="font-inclusive-sans font-medium" style={{ fontSize: 12, color: colors.ink, whiteSpace: "nowrap", flexShrink: 0 }}>
                {formatTrackTime(track.progressMs)} <span style={{ color: colors.oliveDeep }}>/ {formatTrackTime(track.durationMs)}</span>
              </p>
            </div>
            {errorMessage && (
              <p className="font-inclusive-sans" style={{ fontSize: 11, color: colors.orange, textAlign: "center", marginTop: -12 }}>{errorMessage}</p>
            )}
            {!isPublic && (
              <button onClick={disconnect} className="font-inclusive-sans" style={{ fontSize: 10, color: colors.oliveDeep, background: "none", border: "none", cursor: "pointer", marginTop: -12, textDecoration: "underline" }}>
                disconnect spotify
              </button>
            )}
          </>
        ) : (
          notPlayingState
        )}
      </div>
    </div>
  );
}

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
