import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { X, Volume2 } from "lucide-react";
import { useIsMobile } from "@/app/useIsMobile";
import { useSpotifyPlayer } from "@/app/useSpotifyPlayer";
import { AI_PROJECTS, isOpenableAiProject } from "../data/aiProjects";
import { AiProjectFrame } from "./AiProjectFrame";
import vinylDisc from "../../assets/vinyl-player/vinyl-disc.png";
import vinylRing from "../../assets/vinyl-player/vinyl-ring.png";
import gridBg from "../../assets/about-me-page/grid.png";
import envelopeStack from "../../assets/about-me-page/envelope-stack.png";
import myPhoto1 from "../../assets/about-me-page/my-photo-1.png";
import myPhoto2 from "../../assets/about-me-page/my-photo-2.png";
import bookCover1 from "../../assets/about-me-page/book-1.png";
import movieCover1 from "../../assets/about-me-page/movie-1.png";
import movieCover2 from "../../assets/about-me-page/movie-2.png";
import stackPhoto1 from "../../assets/stack images /optimized/20260425_203032 1.jpg";
import stackPhoto2 from "../../assets/stack images /optimized/20260613_184245(0) 1.jpg";
import stackPhoto3 from "../../assets/stack images /optimized/20260525_163747 1.jpg";
import stackPhoto4 from "../../assets/stack images /optimized/20260803_120329 1.jpg";
import stripPhoto5 from "../../assets/stack images /optimized/20260425_202946 1.jpg";
import stripPhoto6 from "../../assets/stack images /optimized/20260803_120723 1.jpg";
import stripPhoto7 from "../../assets/stack images /optimized/IMG_20250816_120031_492 1.jpg";
import stripPhoto8 from "../../assets/stack images /optimized/IMG_20260321_190702_856 1.jpg";

// ── Work experience data ───────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    period: "May 2024 – Present",
    role: "Product Designer",
    company: "Canvs Club · ICICI Bank",
    location: "Remote",
    bullets: [
      "Owned end-to-end product design across ICICI Bank's digital ecosystem — UCJ, CSP, RIB, Global App and iMobile — designing 100+ flows across live, in-development, and net-new design environments.",
      "Independently drove the Services platform and led design for Credit Cards and Forex Cards, turning complex banking journeys into clean, accessible experiences.",
      "Partnered closely with developers and cross-functional teams to ship quality work at speed in a fully remote, fast-paced environment, while reworking and scaling the design system independently.",
      "Mentored junior designers and led peer design reviews, raising craft and consistency across the team.",
    ],
    skills: ["Product Design", "Design Systems", "Cross-Platform", "Accessibility"],
    recommendation: { name: "Debprotim Roy", title: "CEO" },
  },
  {
    period: "May 2022 – Nov 2022",
    role: "Lead UI-UX Designer",
    company: "Space No. 10",
    location: "Bangalore",
    bullets: [
      "Led UX/UI design for client projects: redesigned Prakriya Hospital's website for improved user experience and revenue, designed an award-winning prototype for the JeevaRaksha emergency response app, and built Space No. 10's website and brand assets from concept to prototype.",
      "Optimised booking systems, created marketing materials, and established brand identities for client projects.",
      "Collaborated with cross-functional teams including marketing, developers, product managers, and executives through brainstorming sessions and design critiques.",
    ],
    skills: ["UI Design", "User Research", "Prototyping"],
  },
  {
    period: "2021 – Now",
    role: "Freelance UI-UX Designer",
    company: "Self-employed",
    location: "Bangalore",
    bullets: [
      "Addressed user and client challenges through comprehensive research, competitor analysis, and user interviews.",
      "Conceptualised information architectures, crafted user flows, and translated them into visually compelling web and mobile interfaces — websites, dashboards, web apps, and mobile apps.",
      "Developed style guides and design systems to streamline collaboration between design and development.",
    ],
    skills: ["UI Design", "Interaction Design", "Problem Solving"],
  },
];

// ── Books / Movies / Resources data ───────────────────────────────────────────
// `cover`/`poster`/`art` are optional — entries without one render a titled
// placeholder tile until the real asset is dropped in. Currently-reading books
// carry `reading: true` and are pinned to the front of the Books carousel.

type BookItem = { title: string; author: string; cover?: string; reading?: boolean };
type MovieItem = { title: string; year: string; poster?: string };
type ResourceItem = { title: string; kind: string; art?: string };

const BOOKS: BookItem[] = [
  // currently reading — pinned first
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

// ── BooksAndMoviesCard ───────────────────────────────────────────────────────────
// Ported from the provided reference component: a single card with a Books/Movies
// tab switch, a 3-slot sliding cover carousel (prev/active/next), and one forward
// arrow that wraps around at the end.

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
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: "#e8bfc7" }}>
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
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#f1e0e5,#e0bfc8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px" }}>
                <span className="font-caslon not-italic" style={{ fontSize: 9, lineHeight: "12px", textAlign: "center", fontWeight: 600, color: "#7a4b57" }}>{book.title}</span>
              </div>
            )}
            <div style={{ position: "absolute", top: 0, left: "2.97px", height: "100%", width: 2, filter: "blur(1.4px)", backgroundColor: "rgba(35,30,30,0.3)" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 9, left: 64, display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: "#735933" }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "rgba(115,89,51,0.3)" }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: "rgba(115,89,51,0.5)" }}>{total}</span>
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
// so a plain CSS transition can't animate it — GSAP gives it a subtle fade+settle
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
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#efe4d5,#ddc7ac)", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 6px" }}>
          <span className="font-caslon not-italic" style={{ fontSize: 8.5, lineHeight: "11px", textAlign: "center", fontWeight: 600, color: "#6c5636" }}>{alt}</span>
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
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: "#e8d4bf" }}>
      <MovieImage key={`left-${prevIdx}`} src={MOVIES[prevIdx].poster} alt={MOVIES[prevIdx].title} slot="left" />
      <MovieImage key={`center-${activeIdx}`} src={MOVIES[activeIdx].poster} alt={MOVIES[activeIdx].title} slot="center" />
      <MovieImage key={`right-${nextIdx}`} src={MOVIES[nextIdx].poster} alt={MOVIES[nextIdx].title} slot="right" />
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: "#735933" }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "rgba(115,89,51,0.3)" }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: "rgba(115,89,51,0.5)" }}>{total}</span>
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

function BooksAndMoviesCard({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  const [tab, setTab] = useState<"books" | "movies">("books");
  const [bookIdx, setBookIdx] = useState(0);
  const [movieIdx, setMovieIdx] = useState(0);
  const isBooks = tab === "books";
  const textRef = useRef<HTMLDivElement>(null);

  const bg = isBooks ? "#ebc7ce" : "#e3d9ce";
  const arrowFill = isBooks ? "#D07C8D" : "#C67D39";
  const currentBook = BOOKS[bookIdx];
  const currentMovie = MOVIES[movieIdx];

  function nextItem() {
    if (isBooks) setBookIdx((i) => (i + 1) % BOOKS.length);
    else setMovieIdx((i) => (i + 1) % MOVIES.length);
  }

  const title = isBooks ? currentBook.title : currentMovie.title;
  const subtitle = isBooks ? currentBook.author.toUpperCase() : currentMovie.year;

  // Subtle GSAP crossfade whenever the displayed title/subtitle changes.
  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(textRef.current, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, [title, subtitle]);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: "100%", height: 188, backgroundColor: bg, transition: "background 0.4s ease" }}>
      {isBooks ? <BooksPanel activeIdx={bookIdx} /> : <MoviesPanel activeIdx={movieIdx} />}

      <div style={{ position: "absolute", left: 170, top: 16, right: m ? 12 : 16, height: 156, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setTab("books")}
            className="font-caslon"
            style={{ fontSize: 12, letterSpacing: "-0.02em", fontStyle: isBooks ? "italic" : "normal", textDecoration: isBooks ? "underline" : "none", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#212012" }}
          >
            Books
          </button>
          <button
            onClick={() => setTab("movies")}
            className="font-caslon"
            style={{ fontSize: 12, letterSpacing: "-0.02em", fontStyle: !isBooks ? "italic" : "normal", textDecoration: !isBooks ? "underline" : "none", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#212012" }}
          >
            Movies
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <div ref={textRef} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
            {isBooks && currentBook.reading && (
              <span style={{ alignSelf: "flex-start", backgroundColor: "#dda1ae", borderRadius: 20, padding: "2px 8px", marginBottom: 2 }}>
                <span className="font-inclusive-sans font-semibold" style={{ fontSize: 9, letterSpacing: "0.5px", textTransform: "uppercase", color: "#212012" }}>reading now</span>
              </span>
            )}
            <p className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: "#212012" }}>{title}</p>
            <p className="font-inclusive-sans uppercase" style={{ fontSize: 12, lineHeight: "16px", color: "rgba(33,32,18,0.5)" }}>{subtitle}</p>
          </div>
          <NextArrowButton onClick={nextItem} fill={arrowFill} />
        </div>
      </div>
    </div>
  );
}

// ── ResourcesCard ──────────────────────────────────────────────────────────────
// Same container language as BooksAndMoviesCard — stacked-tile carousel on the
// left, a label + cycling title + forward arrow on the right. Placeholder tiles
// until real artwork is dropped in.

function ResourcesPanel({ activeIdx }: { activeIdx: number }) {
  const total = RESOURCES.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: "#d4d2bd" }}>
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
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#eceadb,#d3d1b8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px" }}>
                <span className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 8, letterSpacing: "0.5px", textAlign: "center", color: "#6c6b4a" }}>{resource.kind}</span>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 9, left: 64, display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: "#6c6b4a" }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "rgba(108,107,74,0.3)" }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: "rgba(108,107,74,0.5)" }}>{total}</span>
      </div>
    </div>
  );
}

function ResourcesCard({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  const [idx, setIdx] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const current = RESOURCES[idx];

  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(textRef.current, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, [idx]);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: "100%", height: 188, backgroundColor: "#e0ddd0" }}>
      <ResourcesPanel activeIdx={idx} />

      <div style={{ position: "absolute", left: 170, top: 16, right: m ? 12 : 16, height: 156, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <p className="font-caslon" style={{ fontSize: 12, letterSpacing: "-0.02em", fontStyle: "italic", color: "#212012" }}>
          worth your time
        </p>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <div ref={textRef} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
            <p className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: "#212012" }}>{current.title}</p>
            <p className="font-inclusive-sans uppercase" style={{ fontSize: 12, lineHeight: "16px", color: "rgba(33,32,18,0.5)" }}>{current.kind}</p>
          </div>
          <NextArrowButton onClick={() => setIdx((i) => (i + 1) % RESOURCES.length)} fill="#8a8a5f" />
        </div>
      </div>
    </div>
  );
}

// ── MusicPlayerCard ──────────────────────────────────────────────────────────────
// Connected to the real Spotify account authorized in this browser — shows
// whatever is actually playing and controls that real playback (play/pause,
// seek). Spotify's control endpoints require Premium and an active device.

const RING_PATHS = {
  outer: "M150 75C150 116.421 116.421 150 75 150C33.5786 150 0 116.421 0 75C0 33.5786 33.5786 0 75 0C116.421 0 150 33.5786 150 75ZM19.6211 75C19.6211 105.585 44.4151 130.379 75 130.379C105.585 130.379 130.379 105.585 130.379 75C130.379 44.4151 105.585 19.6211 75 19.6211C44.4151 19.6211 19.6211 44.4151 19.6211 75Z",
  middle: "M118 59C118 91.5848 91.5848 118 59 118C26.4152 118 0 91.5848 0 59C0 26.4152 26.4152 0 59 0C91.5848 0 118 26.4152 118 59ZM19.1959 59C19.1959 80.9832 37.0168 98.8041 59 98.8041C80.9832 98.8041 98.8041 80.9832 98.8041 59C98.8041 37.0168 80.9832 19.1959 59 19.1959C37.0168 19.1959 19.1959 37.0168 19.1959 59Z",
  inner: "M88 44C88 68.3005 68.3005 88 44 88C19.6995 88 0 68.3005 0 44C0 19.6995 19.6995 0 44 0C68.3005 0 88 19.6995 88 44ZM2.10301 44C2.10301 67.1391 20.8609 85.897 44 85.897C67.1391 85.897 85.897 67.1391 85.897 44C85.897 20.8609 67.1391 2.10301 44 2.10301C20.8609 2.10301 2.10301 20.8609 2.10301 44Z",
};

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function MusicPlayerCard({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  const { status, track, errorMessage, connect, disconnect, togglePlay, seek } = useSpotifyPlayer();
  const artSrc = track?.albumArt || vinylDisc;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!track) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width;
    seek(ratio * track.durationMs);
  };

  const notPlayingState = (
    <div style={{ textAlign: "center", padding: m ? "8px 20px" : 0 }}>
      {status === "no-playback" ? (
        <>
          <p className="font-inclusive-sans" style={{ fontSize: 13, color: "#625e37" }}>Nothing playing right now</p>
          <p className="font-inclusive-sans" style={{ fontSize: 11, color: "rgba(33,32,18,0.5)", marginTop: 4 }}>Start a track on Spotify, then check back</p>
          <button onClick={disconnect} className="font-inclusive-sans" style={{ fontSize: 10, color: "rgba(33,32,18,0.4)", background: "none", border: "none", cursor: "pointer", marginTop: 10, textDecoration: "underline" }}>
            disconnect spotify
          </button>
        </>
      ) : status === "connecting" ? (
        <p className="font-inclusive-sans" style={{ fontSize: 13, color: "#625e37" }}>Connecting…</p>
      ) : (
        <>
          <p className="font-inclusive-sans" style={{ fontSize: 12, color: "#625e37", marginBottom: 12 }}>
            {status === "error" ? errorMessage : "See what I'm actually listening to"}
          </p>
          <button
            onClick={connect}
            className="font-inclusive-sans font-medium"
            style={{ fontSize: 13, color: "#fff", backgroundColor: "#1db954", border: "none", borderRadius: 20, padding: "10px 20px", cursor: "pointer" }}
          >
            Connect Spotify
          </button>
        </>
      )}
    </div>
  );

  if (m) {
    // Mobile: slim horizontal bar, album art peeking from the left edge.
    return (
      <div style={{ position: "relative", width: "100%", height: 120, borderRadius: 16, overflow: "hidden", backgroundColor: "#e3d9ce", border: "1px solid #d1c0ae" }}>
        {status === "connected" && track ? (
          <>
            <div style={{ position: "absolute", width: 160, height: 160, left: -81, top: "calc(50% - 80px)" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <img src={artSrc} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", boxShadow: "0px 1.5px 1.5px rgba(0,0,0,0.2)" }} />
                <svg viewBox="0 0 150 150" style={{ position: "absolute", left: "35%", top: "35%", width: "30%", height: "30%" }}>
                  <path d={RING_PATHS.outer} fill="#9799A5" />
                </svg>
                <svg viewBox="0 0 118 118" style={{ position: "absolute", left: "36.2%", top: "36.2%", width: "27.6%", height: "27.6%" }}>
                  <path d={RING_PATHS.middle} fill="#CAC4C8" stroke="#ABA7AB" strokeWidth="2" />
                </svg>
                <svg viewBox="0 0 88 88" style={{ position: "absolute", left: "39.7%", top: "39.7%", width: "20.6%", height: "20.6%" }}>
                  <path d={RING_PATHS.inner} fill="white" />
                </svg>
                <img src={vinylRing} alt="" style={{ position: "absolute", left: "37.1%", top: "37.1%", width: "25.7%", height: "25.7%" }} />
              </motion.div>
            </div>

            <div style={{ position: "absolute", left: 103, right: 16, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-inclusive-sans" style={{ fontSize: 10, lineHeight: "12px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#625e37", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.artist}
                  </p>
                  <p className="font-caslon not-italic" style={{ fontSize: 14, lineHeight: "18px", letterSpacing: "-0.02em", fontWeight: 600, color: "#212012", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.name}
                  </p>
                </div>
                <button
                  onClick={togglePlay}
                  aria-label={track.isPlaying ? "Pause" : "Play"}
                  style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(98,94,55,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {track.isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="4" y="3" width="3" height="10" rx="1" fill="#625E37" />
                      <rect x="9" y="3" width="3" height="10" rx="1" fill="#625E37" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 3L13 8L5 13V3Z" fill="#625E37" />
                    </svg>
                  )}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div onClick={handleSeek} style={{ position: "relative", height: 6, display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: "#c3be6f", borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: "#c67d39", width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%` }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="font-inclusive-sans" style={{ fontSize: 8, lineHeight: "10px", color: "#625e37" }}>
                    {formatTime(track.progressMs)} / {formatTime(track.durationMs)}
                  </p>
                  <Volume2 size={16} color="#625e37" />
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="font-inclusive-sans" style={{ position: "absolute", bottom: 4, left: 103, fontSize: 9, color: "#c67d39" }}>{errorMessage}</p>
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
        backgroundColor: "#e3d9ce", border: "1px solid #d1c0ae",
        height: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      <div style={{ position: "absolute", top: -180, left: "50%", transform: "translateX(-50%)", width: 400, height: 400 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          <img src={artSrc} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", boxShadow: "0px 4px 4px rgba(0,0,0,0.2)" }} />
          <svg viewBox="0 0 150 150" style={{ position: "absolute", left: "35%", top: "35%", width: "30%", height: "30%" }}>
            <path d={RING_PATHS.outer} fill="#9799A5" />
          </svg>
          <svg viewBox="0 0 118 118" style={{ position: "absolute", left: "36.2%", top: "36.2%", width: "27.6%", height: "27.6%" }}>
            <path d={RING_PATHS.middle} fill="#CAC4C8" stroke="#ABA7AB" strokeWidth="2" />
          </svg>
          <svg viewBox="0 0 88 88" style={{ position: "absolute", left: "39.7%", top: "39.7%", width: "20.6%", height: "20.6%" }}>
            <path d={RING_PATHS.inner} fill="white" />
          </svg>
          <img
            src={vinylRing}
            alt=""
            style={{ position: "absolute", left: "37.1%", top: "37.1%", width: "25.7%", height: "25.7%" }}
          />
        </motion.div>
      </div>

      <div style={{ padding: "0 28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {status === "connected" && track ? (
          <>
            <div style={{ textAlign: "center" }}>
              <p className="font-inclusive-sans" style={{ fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: "#625e37" }}>
                {track.artist}
              </p>
              <p className="font-caslon not-italic" style={{ fontSize: 24, fontWeight: 600, color: "#212012", marginTop: 4 }}>
                {track.name}
              </p>
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={togglePlay}
                aria-label={track.isPlaying ? "Pause" : "Play"}
                style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#625e37" }}
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
              <div onClick={handleSeek} style={{ position: "relative", flex: 1, height: 10, display: "flex", alignItems: "center", cursor: "pointer" }}>
                <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: "#c3be6f", borderRadius: 2 }} />
                <div
                  style={{
                    position: "absolute", left: 0, height: 2, borderRadius: 2, backgroundColor: "#c67d39",
                    width: `${Math.max(2, (track.progressMs / track.durationMs) * 100)}%`,
                  }}
                />
              </div>
              <p className="font-inclusive-sans font-medium" style={{ fontSize: 12, color: "#212012", whiteSpace: "nowrap", flexShrink: 0 }}>
                {formatTime(track.progressMs)} <span style={{ color: "rgba(33,32,18,0.5)" }}>/ {formatTime(track.durationMs)}</span>
              </p>
            </div>
            {errorMessage && (
              <p className="font-inclusive-sans" style={{ fontSize: 11, color: "#c67d39", textAlign: "center", marginTop: -12 }}>{errorMessage}</p>
            )}
            <button onClick={disconnect} className="font-inclusive-sans" style={{ fontSize: 10, color: "rgba(33,32,18,0.4)", background: "none", border: "none", cursor: "pointer", marginTop: -12, textDecoration: "underline" }}>
              disconnect spotify
            </button>
          </>
        ) : (
          notPlayingState
        )}
      </div>
    </div>
  );
}

// ── ExperienceRow ───────────────────────────────────────────────────────────────

// "May 2024 – Present" → "2024 – Present"; "May 2022 – Nov 2022" → "2022";
// "2021 – Now" → "2021 – Now". Refined copy comes later.
function yearRange(period: string): string {
  const years = period.match(/\d{4}/g) ?? [];
  if (years.length === 0) return period;
  const start = years[0];
  const end = /present|now/i.test(period) ? "Present" : years[years.length - 1];
  return start === end ? start : `${start} – ${end}`;
}

function YearPill({ period }: { period: string }) {
  return (
    <span
      className="font-inclusive-sans font-medium"
      style={{
        display: "inline-flex", alignItems: "center", whiteSpace: "nowrap",
        border: "1px solid rgba(33,32,18,0.22)", borderRadius: 20,
        padding: "3px 10px", fontSize: 11, letterSpacing: "0.2px", color: "#212012",
      }}
    >
      {yearRange(period)}
    </span>
  );
}

function ExperienceRow({ exp, index, isMobile }: { exp: typeof EXPERIENCE[0]; index: number; isMobile: boolean }) {
  const m = isMobile;

  const bulletsBlock = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {exp.bullets.map((b, i) => (
        <p key={i} className="font-inclusive-sans" style={{ fontSize: m ? 13 : 13.5, lineHeight: m ? "19px" : "18px", letterSpacing: "-0.02em", color: "#212012", opacity: 0.85 }}>
          {b}
        </p>
      ))}
      {exp.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {exp.skills.map((s) => (
            <span key={s} className="font-inclusive-sans font-medium" style={{ fontSize: 10, color: "#625e37", backgroundColor: "rgba(98,94,55,0.1)", padding: "3px 10px", borderRadius: 20 }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const recommendationBlock = exp.recommendation ? (
    <div>
      <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 10, letterSpacing: "0.4px", color: "#c67d39" }}>
        Recommendation
      </p>
      <p className="font-caslon not-italic" style={{ fontSize: 15, color: "#212012", marginTop: 4 }}>
        {exp.recommendation.name}, {exp.recommendation.title}
      </p>
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: m ? "18px 0" : "24px 0" }}>
        {m ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <p className="font-inclusive-sans font-semibold" style={{ fontSize: 16, color: "#625e37" }}>{exp.role}</p>
                <p className="font-inclusive-sans" style={{ fontSize: 13, color: "#625e37", marginTop: 2 }}>{exp.company} · {exp.location}</p>
              </div>
              <div style={{ flexShrink: 0 }}><YearPill period={exp.period} /></div>
            </div>
            {bulletsBlock}
            {recommendationBlock}
          </>
        ) : (
          <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
            {/* Left column fills the row height so the recommendation pins to its bottom edge */}
            <div style={{ width: 270, flexShrink: 0, display: "flex", flexDirection: "column" }}>
              <div>
                <p className="font-inclusive-sans font-semibold" style={{ fontSize: 16, color: "#625e37" }}>{exp.role}</p>
                <p className="font-inclusive-sans" style={{ fontSize: 14, color: "#625e37", marginTop: 2 }}>{exp.company} · {exp.location}</p>
                <div style={{ marginTop: 10 }}><YearPill period={exp.period} /></div>
              </div>
              {recommendationBlock && (
                <div style={{ marginTop: "auto", paddingTop: 28 }}>{recommendationBlock}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>{bulletsBlock}</div>
          </div>
        )}
      </div>
      {index < EXPERIENCE.length - 1 && <div style={{ height: 1, backgroundColor: "#d1c0ae" }} />}
    </motion.div>
  );
}

// ── AiProjectsRow ────────────────────────────────────────────────────────────────

function AiProjectsRow({ isMobile, onViewAll }: { isMobile: boolean; onViewAll?: () => void }) {
  const m = isMobile;
  const preview = AI_PROJECTS.slice(0, 3);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: m ? 12 : 16 }}>
        <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 16, letterSpacing: "0.02em", color: "#625e37" }}>
          AI projects I've been tinkering with...
        </p>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="font-inclusive-sans font-medium"
            style={{ fontSize: 12, color: "#c67d39", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            View all
          </button>
        )}
      </div>
      {/* Same card structure as the landing-page AI section (framed artwork +
          title + description), kept in the drawer's lighter palette. */}
      <div style={{ display: "flex", gap: m ? 24 : 16, flexDirection: m ? "column" : "row" }}>
        {preview.map((p) => {
          const clickable = isOpenableAiProject(p) || !!onViewAll;
          return (
            <motion.div
              key={p.id}
              onClick={onViewAll}
              whileHover={clickable && !m ? { y: -4 } : undefined}
              transition={{ duration: 0.2 }}
              style={{ flex: 1, cursor: clickable ? "pointer" : "default" }}
            >
              <div
                style={{
                  ...(m
                    ? { height: 200, borderRadius: 8 }
                    : { aspectRatio: "353 / 240", borderRadius: 8 }),
                  border: `1px solid ${p.accent}33`,
                  backgroundColor: "rgba(33,32,18,0.04)",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                {p.frameKey ? (
                  <AiProjectFrame frameKey={p.frameKey} isMobile={m} />
                ) : (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: p.accent, opacity: 0.5 }} />
                )}
              </div>
              <p className="font-caslon not-italic" style={{ fontSize: m ? 16 : 18, lineHeight: m ? "21px" : "22px", fontWeight: 600, color: "#212012" }}>
                {p.title}
              </p>
              <p className="font-inclusive-sans" style={{ fontSize: 13, lineHeight: "18px", color: "#212012", opacity: 0.6, marginTop: 4 }}>
                {p.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── PhotoFrameSection ────────────────────────────────────────────────────────────
// An endlessly looping film-strip of personal photos under the work-experience
// shelf. The row is a FIXED-HEIGHT track, so nothing in the layout ever shifts —
// only the frames scale within it. Each frame's height + opacity follow its live
// distance from the centre of the track, so whatever sits dead-centre is always
// full size (MAX_H) and fully opaque, tapering smoothly out to the edges. Scroll
// it, flick it, or click a frame and GSAP eases the track so that frame glides
// to the centre. Three identical copies are rendered and the scroll position is
// silently wrapped, so there is never an empty end.

const STRIP_PHOTOS: string[] = [
  stackPhoto1, stripPhoto5, stackPhoto3, stackPhoto4,
  stackPhoto2, stripPhoto6, stripPhoto7, stripPhoto8,
];
const N_PHOTOS = STRIP_PHOTOS.length;
const LOOP_PHOTOS = [...STRIP_PHOTOS, ...STRIP_PHOTOS, ...STRIP_PHOTOS];

function PhotoFrameSection({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  const MAX_H = m ? 168 : 230;      // fixed centre height — never changes
  const MIN_H = m ? 96 : 128;       // furthest-out frame
  const TRACK_H = MAX_H + 24;       // fixed row height → zero layout shift
  const SPAN = m ? 400 : 620;       // px over which a frame tapers MAX_H → MIN_H
  const GAP = 12;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef(0);
  const snapRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const interacted = useRef(false);

  // Exact width of one copy (8 frames + 8 gaps), measured from the DOM.
  const copyWidth = () => {
    const a = frameRefs.current[0];
    const b = frameRefs.current[N_PHOTOS];
    return a && b ? b.offsetLeft - a.offsetLeft : 0;
  };

  // Shape every frame from its distance to the track centre. Pure style writes,
  // no React state, so this is cheap enough to run on every scroll frame.
  const shape = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    for (const el of frameRefs.current) {
      if (!el) continue;
      const c = el.offsetLeft + el.offsetWidth / 2;
      const t = Math.min(Math.abs(c - mid) / SPAN, 1);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic falloff
      el.style.height = `${MAX_H - (MAX_H - MIN_H) * e}px`;
      el.style.opacity = `${1 - 0.25 * e}`;
    }
  };

  // Keep the scroll position inside the middle copy — invisible because all
  // three copies are identical.
  const wrap = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const w = copyWidth();
    if (!w) return;
    if (scroller.scrollLeft < w * 0.5) scroller.scrollLeft += w;
    else if (scroller.scrollLeft > w * 1.5) scroller.scrollLeft -= w;
  };

  const nearestFrame = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return null;
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    let best: HTMLDivElement | null = null;
    let bestD = Infinity;
    for (const el of frameRefs.current) {
      if (!el) continue;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = el; }
    }
    return best;
  };

  const centreFrame = (el: HTMLDivElement, animate: boolean) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const w = copyWidth();
    let start = scroller.scrollLeft;
    let target = el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2;
    // Pin both ends of the move into the middle copy so no wrap is needed
    // mid-flight (which would cause a visible jump).
    if (w) {
      while (target < w * 0.5) target += w;
      while (target > w * 1.5) target -= w;
      if (Math.abs(start - target) > w * 0.75) {
        start += start < target ? w : -w;
        scroller.scrollLeft = start;
      }
    }
    tweenRef.current?.kill();
    if (!animate) { scroller.scrollLeft = target; shape(); return; }
    const proxy = { x: start };
    tweenRef.current = gsap.to(proxy, {
      x: target,
      duration: m ? 0.72 : 0.92,
      ease: "power3.out",
      onUpdate: () => { scroller.scrollLeft = proxy.x; shape(); },
    });
  };

  const snapToNearest = () => {
    const el = nearestFrame();
    if (el) centreFrame(el, true);
  };

  const onScroll = () => {
    const tweening = !!tweenRef.current?.isActive();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!tweening) wrap();
      shape();
    });
    if (!tweening) {
      interacted.current = true;
      if (snapRef.current) clearTimeout(snapRef.current);
      snapRef.current = setTimeout(snapToNearest, 150);
    }
  };

  // Seed the track and centre it. Re-runs when the breakpoint flips (MAX_H
  // changes). No animation here — purely the resting layout.
  useLayoutEffect(() => {
    frameRefs.current.forEach((el) => { if (el) el.style.height = `${MAX_H}px`; });
    const startEl = frameRefs.current[N_PHOTOS + Math.floor(N_PHOTOS / 2)];
    if (startEl) centreFrame(startEl, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    if (snapRef.current) clearTimeout(snapRef.current);
    tweenRef.current?.kill();
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #EBC7CE 0%, #E3D9CE 66.83%)",
        padding: `${m ? 24 : 28}px 0 ${m ? 28 : 36}px`,
        overflow: "hidden",
      }}
    >
      {/* Centred heading + short vertical rule */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: `0 ${m ? 18 : 36}px`, marginBottom: m ? 22 : 30 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <p className="font-caslon not-italic" style={{ fontSize: 24, lineHeight: "28px", textAlign: "center", color: "#212012", fontWeight: 600 }}>
            Outside of work
          </p>
          <p className="font-caslon" style={{ fontSize: 24, lineHeight: "28px", fontStyle: "italic", textAlign: "center", color: "rgba(33,32,18,0.5)" }}>
            a few frames
          </p>
        </div>
        <span style={{ width: 2, height: 36, backgroundColor: "#212012" }} />
      </div>

      {/* Looping film-strip track — fixed height, deliberately wider than the drawer */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
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
        {LOOP_PHOTOS.map((src, i) => (
          <button
            key={i}
            onClick={() => { const el = frameRefs.current[i]; if (el) { interacted.current = true; centreFrame(el, true); } }}
            style={{
              flex: "0 0 auto", background: "none", border: "none", padding: 0, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", height: TRACK_H,
            }}
          >
            <div
              ref={(el) => { frameRefs.current[i] = el; }}
              style={{
                flex: "0 0 auto",
                backgroundColor: "#FFFFFF",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(33,32,18,0.14)",
                willChange: "height, opacity",
              }}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                onLoad={() => { if (!interacted.current) { const el = frameRefs.current[N_PHOTOS + Math.floor(N_PHOTOS / 2)]; if (el) centreFrame(el, false); } else { shape(); } }}
                style={{ height: "100%", width: "auto", display: "block", objectFit: "cover" }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AboutMeDrawer ──────────────────────────────────────────────────────────────

interface AboutMeDrawerProps {
  open: boolean;
  onClose: () => void;
  onViewAiProjects?: () => void;
}

export function AboutMeDrawer({ open, onClose, onViewAiProjects }: AboutMeDrawerProps) {
  const isMobile = useIsMobile(768);
  const m = isMobile;
  const drawerWidth = m ? "100%" : "min(900px, 90vw)";
  const drawerBorderRadius = m ? 0 : "24px 0 0 24px";
  const contentPad = m ? 18 : 36;

  // Loops the photo between the two poses, like a boomerang GIF.
  const [photoFrame, setPhotoFrame] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setPhotoFrame((f) => 1 - f), 1000);
    return () => clearInterval(id);
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
            style={{ position: "fixed", inset: 0, zIndex: 499, backgroundColor: "rgba(33,32,18,0.35)", backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="about-drawer"
            initial={{ x: m ? "100%" : 700 }}
            animate={{ x: 0 }}
            exit={{ x: m ? "100%" : 700 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: drawerWidth, zIndex: 500,
              borderRadius: drawerBorderRadius,
              backgroundColor: "#c3be6f",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button — always floats over whatever content is scrolled beneath it */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: m ? 14 : 20, right: m ? 14 : 20, zIndex: 20,
                width: m ? 32 : 36, height: m ? 32 : 36, borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.45)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.45)"; }}
            >
              <X size={15} color="#212012" />
            </button>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

              {/* ── Section A: olive hero ── */}
              <div style={{ position: "relative", backgroundColor: "#c3be6f" }}>
                <div
                  style={{
                    position: "absolute", top: 40, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${gridBg})`, backgroundSize: "cover", backgroundPosition: "top center", backgroundRepeat: "no-repeat",
                    opacity: 0.5, mixBlendMode: "multiply", pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1, padding: `${m ? 20 : 36}px ${contentPad}px 0` }}>
                <p className="font-caslon not-italic" style={{ fontSize: m ? 26 : 36, lineHeight: m ? "32px" : "47px", letterSpacing: "-0.02em", color: "#212012", fontWeight: 600, marginBottom: m ? 20 : 28 }}>
                  About me
                </p>

                {/* Photo collage: envelope stack backdrop + looping photo on top */}
                <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: m ? 20 : 32 }}>
                  <div style={{ position: "relative", width: m ? "82%" : "72%", maxWidth: 500 }}>
                    <img src={envelopeStack} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
                    <div
                      style={{
                        position: "absolute", left: "46%", top: m ? "-12%" : "-16%",
                        width: m ? "56%" : "48%", maxWidth: 320,
                        transform: "translateX(-50%) rotate(14deg)",
                        transformOrigin: "center top",
                      }}
                    >
                      {/* Boomerang between the two wave poses. Both frames live in
                          one fixed-ratio box (the wider pose's ratio) and are pinned
                          top-left at a matched pixel scale, so the head never moves
                          or resizes between frames — only the hand appears to wave.
                          Crossfade, never a hard src swap. */}
                      <div style={{ position: "relative", width: "100%", paddingBottom: "126.8%" }}>
                        <img
                          src={myPhoto2}
                          alt="Laxmi Mahajan"
                          style={{
                            position: "absolute", left: 0, top: 0, width: "100%", height: "auto",
                            opacity: photoFrame === 1 ? 1 : 0, transition: "opacity 0.28s ease",
                          }}
                        />
                        <img
                          src={myPhoto1}
                          alt=""
                          style={{
                            position: "absolute", left: 0, top: 0, width: `${(1776 / 2148) * 100}%`, height: "auto",
                            opacity: photoFrame === 0 ? 1 : 0, transition: "opacity 0.28s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="font-inclusive-sans" style={{ fontSize: m ? 14 : 18, lineHeight: m ? "21px" : "26px", textAlign: "center", letterSpacing: "-0.02em", color: "#212012", maxWidth: 560, margin: "0 auto", marginBottom: m ? 24 : 32 }}>
                  A small window into the things I return to outside of work — the books I read, the films I rewatch, and the songs on repeat.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: m ? 24 : 32 }}>
                  <motion.span
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#212012", display: "inline-block", flexShrink: 0 }}
                  />
                  <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: "#625e37", letterSpacing: "0.4px", textTransform: "uppercase" }}>open to work</p>
                </div>

                {/* Books/Movies + Music player row */}
                <div style={{ display: "flex", gap: m ? 16 : 24, flexDirection: m ? "column" : "row", alignItems: "flex-start", marginBottom: m ? 16 : 24 }}>
                  <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                    <BooksAndMoviesCard isMobile={m} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                    <MusicPlayerCard isMobile={m} />
                  </div>
                </div>

                {/* Resources — same card language as Books/Movies, aligned under it */}
                <div style={{ display: "flex", marginBottom: m ? 24 : 36 }}>
                  <div style={{ width: m ? "100%" : "calc(50% - 12px)" }}>
                    <ResourcesCard isMobile={m} />
                  </div>
                </div>
                </div>
              </div>

              {/* ── Section B: tan work-experience shelf ── */}
              <div style={{ backgroundColor: "#e3d9ce", borderRadius: m ? "16px 16px 0 0" : "24px 24px 0 0", padding: `${m ? 24 : 36}px ${contentPad}px` }}>
                <p className="font-caslon not-italic" style={{ fontSize: m ? 24 : 32, letterSpacing: "-0.02em", color: "#212012", fontWeight: 600, marginBottom: m ? 8 : 12 }}>
                  Work experience
                </p>
                <div style={{ minWidth: 0 }}>
                  {EXPERIENCE.map((exp, i) => (
                    <ExperienceRow key={exp.company} exp={exp} index={i} isMobile={m} />
                  ))}
                </div>

                <div style={{ height: 1, backgroundColor: "#d1c0ae", margin: `${m ? 16 : 20}px 0` }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: m ? "space-between" : "flex-start", gap: m ? 12 : 28 }}>
                  {[
                    { label: "LinkedIn", href: "https://in.linkedin.com/in/laxmi-mahajan" },
                    { label: "Email", href: "mailto:laxmimahajanwork@gmail.com" },
                    { label: "Resume", href: "https://drive.google.com/file/d/1cm1x-y31ugOERxl7MaLuoOYGnNq0r1p0/view?usp=sharing" },
                  ].map(({ label, href }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.15 }}
                      className="font-inclusive-sans font-medium"
                      style={{ fontSize: 14, color: "#c67d39", textDecoration: "none" }}
                    >
                      {label}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* ── Section B2: personal photo strip ── */}
              <PhotoFrameSection isMobile={m} />

              {/* ── Section C: olive AI-projects strip ── */}
              <div style={{ padding: `${m ? 24 : 36}px ${contentPad}px ${m ? 88 : 60}px` }}>
                <AiProjectsRow isMobile={m} onViewAll={onViewAiProjects} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
