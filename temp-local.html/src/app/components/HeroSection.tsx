import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useTransform, AnimatePresence } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
import { gsap } from "gsap";
import { useScrollProgress } from "../ScrollContext";
import { MobileHeader } from "./MobileHeader";
import { useIsMobile } from "../useIsMobile";
import { HeroIntroAnimation } from "./HeroIntroAnimation";
import backgroundVideo from "../../assets/background.mp4";
import position1Img from "../../assets/hero-my image/Position 1.png";
import position2Img from "../../assets/hero-my image/Position 2.png";

// ── Live IST clock ─────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
      setTime(`IND — ${t.toUpperCase()}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="font-jakarta font-semibold text-[#212012] uppercase" style={{ fontSize: 12, letterSpacing: "0.48px" }}>
      {time}
    </p>
  );
}

// ── Scribble underline under "Laxmi Mahajan" ──────────────────────────────────
function NameUnderline({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 220 6" fill="none" style={{ position: "absolute", bottom: -2, left: 0, width: "100%", height: 4, overflow: "visible" }}>
      <motion.path
        d="M2 3.5 C 30 1.5, 60 4.5, 90 2.5, 120 0.5, 150 3.5, 180 2, 218 3"
        stroke="#c3a52a"
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ── "Laxmi Mahajan" hover gallery ─────────────────────────────────────────────
// Hovering the name pops up a small photo card that instantly alternates
// between two source images every 800ms, for as long as it's hovered — and
// "Laxmi" itself switches to the accent color while hovered.
const NAME_GALLERY_IMAGES = [position1Img, position2Img];

function NameHoverGallery() {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!hovered) return;
    setImgIndex(0);
    const id = setInterval(() => {
      setImgIndex((i) => (i + 1) % NAME_GALLERY_IMAGES.length);
    }, 800);
    return () => clearInterval(id);
  }, [hovered]);

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => setHovered(false), []);

  return (
    <span
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
    >
      <span style={{ color: hovered ? "#C67D39" : "inherit", transition: "color 0.25s ease" }}>Laxmi</span> Mahajan
      <NameUnderline delay={0.5} />
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: 150,
              height: 190,
              overflow: "hidden",
              zIndex: 300,
              pointerEvents: "none",
            }}
          >
            <img
              src={NAME_GALLERY_IMAGES[imgIndex]}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// Lightens (positive amt) or darkens (negative amt) a "#rrggbb" color.
function shade(hex: string, amt: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

// ── Inline hoverable photo card ───────────────────────────────────────────────
// Outer div: GSAP entry (fly-in from stack). Inner div: CSS hover scale/rotate.
// Separating them prevents GSAP and React from fighting over the transform prop.
// showBackCard adds a lighter card peeking out behind the main one, for the
// single-photo look — groups with 2+ photos skip it (each photo doubling up
// on top of the group's own fan-apart already reads as cluttered). Hover state
// is controlled by the parent KeywordPhotoGroup, so hovering either the keyword
// text or any photo in the group fans all of that group's photos out together.
function InlinePhoto({
  color, width, height, rotate, entryDelay = 0, entryFromX = 0, entryFromY = -180,
  hovered = false, onEnter, onLeave, showBackCard = true,
  fanX = 0, fanY = -4, fanRotate = 0,
}: {
  color: string; width: number; height: number; rotate: number; entryDelay?: number;
  entryFromX?: number; entryFromY?: number;
  hovered?: boolean; onEnter?: () => void; onLeave?: () => void; showBackCard?: boolean;
  fanX?: number; fanY?: number; fanRotate?: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!outerRef.current) return;
    gsap.fromTo(
      outerRef.current,
      { opacity: 0, x: entryFromX, y: entryFromY, scale: 2.6 },
      { opacity: 1, x: 0, y: 0, scale: 1, delay: entryDelay, duration: 0.9, ease: "power4.out" }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backRotate = rotate > 0 ? rotate - 16 : rotate + 16;

  return (
    <div
      ref={outerRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        position: "relative",
        zIndex: hovered ? 200 : 2,
        flexShrink: 0,
        margin: "0 4px",
        width,
        height,
        cursor: "pointer",
      }}
    >
      {/* Back card — peeks out from behind the main one */}
      {showBackCard && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: shade(color, 45),
            border: "2px solid white",
            borderRadius: 4,
            transform: `rotate(${backRotate}deg) translate(-3px, -3px)`,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Front card */}
      <div
        style={{
          position: "relative",
          width,
          height,
          background: color,
          border: "2px solid white",
          borderRadius: 4,
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          transform: hovered
            ? `rotate(${rotate * 0.3 + fanRotate}deg) scale(1.22) translate(${fanX}px, ${fanY}px)`
            : `rotate(${rotate}deg)`,
        }}
      />
    </div>
  );
}

// ── Keyword + photo(s) hover group ────────────────────────────────────────────
// Pairs a semi-bold keyword with the photo(s) that sit beside it. Hovering
// either the keyword or any photo in the group triggers all of that group's
// photos to expand and fan apart together, and runs a GSAP hover animation
// (lift + scale + accent color) on the keyword text itself.
function KeywordPhotoGroup({
  label, photos,
}: {
  label: string;
  photos: Array<{
    color: string; width: number; height: number; rotate: number;
    entryDelay: number; entryFromX: number; entryFromY: number;
  }>;
}) {
  const [hovered, setHovered] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);

  const handleEnter = useCallback(() => {
    setHovered(true);
    if (labelRef.current) {
      gsap.to(labelRef.current, { color: "#C67D39", y: -3, scale: 1.06, duration: 0.3, ease: "back.out(2)" });
    }
  }, []);
  const handleLeave = useCallback(() => {
    setHovered(false);
    if (labelRef.current) {
      gsap.to(labelRef.current, { color: "#212012", y: 0, scale: 1, duration: 0.25, ease: "power2.out" });
    }
  }, []);

  const fanOffsets =
    photos.length === 2
      ? [{ fanX: -10, fanY: -6, fanRotate: -12 }, { fanX: 10, fanY: -6, fanRotate: 12 }]
      : photos.map(() => ({ fanX: 0, fanY: -6, fanRotate: 0 }));

  return (
    <>
      <span
        ref={labelRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{ display: "inline-block", fontWeight: 600, color: "#212012", cursor: "pointer" }}
      >
        {label}
      </span>
      {photos.map((p, i) => (
        <InlinePhoto
          key={i}
          {...p}
          hovered={hovered}
          onEnter={handleEnter}
          onLeave={handleLeave}
          showBackCard={photos.length === 1}
          {...fanOffsets[i]}
        />
      ))}
    </>
  );
}

// ── Main hero section ─────────────────────────────────────────────────────────
export function HeroSection({ onIntroComplete }: { onIntroComplete?: () => void } = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef2 = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const [introComplete, setIntroComplete] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const scrollYProgress = useScrollProgress(sectionRef, ["start start", "end start"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -38]);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    onIntroComplete?.();
  }, [onIntroComplete]);

  // Autoplay-with-sound is blocked by browsers until the visitor interacts.
  // Try to play immediately; if that's rejected, retry on the first interaction.
  // The second video instance is always muted, so it autoplays immediately regardless.
  useEffect(() => {
    bgVideoRef2.current?.play().catch(() => {});

    const video = bgVideoRef.current;
    if (!video) return;

    const retry = () => { video.play().catch(() => {}); };
    video.play().catch(() => {
      window.addEventListener("click", retry);
      window.addEventListener("keydown", retry);
    });

    return () => {
      window.removeEventListener("click", retry);
      window.removeEventListener("keydown", retry);
    };
  }, []);

  const toggleSound = useCallback(() => {
    const video = bgVideoRef.current;
    setSoundOn((prev) => {
      const next = !prev;
      if (video) {
        video.muted = !next;
        if (next) video.play().catch(() => {});
      }
      return next;
    });
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", zIndex: 0 }}
    >
      {/* Intro animation overlay — portal to body. It manages its own unmount once its
          reverse-play sequence finishes; introComplete flips partway through so the
          real hero content starts animating in underneath while it's still dissolving. */}
      <HeroIntroAnimation onComplete={handleIntroComplete} />

      {/* Decorative background video — sand-textured shadow, blended into its own cream backdrop.
          Masked with a feathered gradient so its rectangular edges dissolve into the
          page background instead of showing a hard cut line. */}
      <div
        style={{
          position: "absolute",
          width: 422,
          height: 750,
          left: -38,
          bottom: 107,
          overflow: "hidden",
          backgroundColor: "#E3D9CE",
          boxShadow: "inset 0px 4px 4px #E3D9CE",
          transform: "rotate(15.43deg)",
          isolation: "isolate",
          opacity: 0.1,
          pointerEvents: "none",
          zIndex: -1,
          maskImage: "radial-gradient(ellipse 62% 58% at center, black 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 58% at center, black 35%, transparent 78%)",
        }}
      >
        <video
          ref={bgVideoRef}
          src={backgroundVideo}
          autoPlay
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            mixBlendMode: "hard-light",
            display: "block",
          }}
        />
      </div>

      {/* Second instance of the same decorative video — "Frame 34", flipped vertically */}
      <div
        style={{
          position: "absolute",
          width: 482,
          height: 909,
          left: 560,
          top: -213,
          overflow: "hidden",
          backgroundColor: "#E3D9CE",
          boxShadow: "inset 0px 4px 4px #E3D9CE",
          transform: "scale(-1, -1)",
          isolation: "isolate",
          opacity: 0.1,
          pointerEvents: "none",
          zIndex: -1,
          maskImage: "radial-gradient(ellipse 62% 58% at center, black 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 58% at center, black 35%, transparent 78%)",
        }}
      >
        <video
          ref={bgVideoRef2}
          src={backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            mixBlendMode: "hard-light",
            display: "block",
          }}
        />
      </div>

      {/* Everything settles into frame once intro is done — a soft combined scale/blur/fade
          that overlaps with the intro overlay's own fade-out, rather than a plain opacity cut. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
        animate={
          introComplete
            ? { opacity: 1, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.96, filter: "blur(10px)" }
        }
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: "100%" }}
      >
      <motion.div style={{ display: "flex", flexDirection: "column", height: "100%", opacity, y: contentY }}>
        {/* ── Top bar ─────────────────────────────────────────────────────────── */}
        {isMobile ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={introComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <MobileHeader />
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center justify-between"
            style={{ padding: "24px 40px 0" }}
            initial={{ opacity: 0, y: -12 }}
            animate={introComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <p className="font-jakarta font-semibold text-[#212012] uppercase" style={{ fontSize: 12, letterSpacing: "0.48px" }}>
              based in bangalore
            </p>
            <LiveClock />
          </motion.div>
        )}

        {/* ── Hero content ─────────────────────────────────────────────────────── */}
        {isMobile ? (
          // Mobile: simplified bio text (keep original style)
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px 80px" }}>
            <motion.div
              initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
              animate={introComplete ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 28, filter: "blur(10px)" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ maxWidth: 360, textAlign: "center", width: "100%" }}
            >
              <p className="font-caslon text-black text-center" style={{ fontSize: 24, lineHeight: "34px" }}>
                <em>hello, this is Laxmi Mahajan</em>
                {" — product designer who loves sketching and solved complex problems at "}
                <em>canvs</em>
                {", and tinkers with code to build fun products."}
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={introComplete ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 28 }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#c3be6f", display: "inline-block" }}
                />
                <p className="font-jakarta font-medium" style={{ fontSize: 12, color: "#625e37", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                  open to work
                </p>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          // Desktop: Frame 4 design — large text with inline photo cards
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 40px 80px 60px",
              position: "relative",
            }}
          >
            {introComplete && (
              <>
                {/* Line 1 — a div, not a <p>: the name's hover popup renders a block-level
                    element, which isn't valid HTML nested inside a paragraph. */}
                <motion.div
                  className="font-caslon text-[#212012]"
                  style={{ fontSize: "clamp(32px, 3.8vw, 50px)", lineHeight: "1.15", letterSpacing: "-0.48px", whiteSpace: "nowrap" }}
                  initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                >
                  hello, this is{" "}
                  <NameHoverGallery />
                </motion.div>

                {/* Line 2: "product designer [photo] who loves sketching [photos right]" */}
                <motion.div
                  className="font-caslon text-[#212012]"
                  style={{
                    fontSize: "clamp(32px, 3.8vw, 50px)",
                    lineHeight: "1.2",
                    letterSpacing: "-0.48px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "nowrap",
                    marginTop: 6,
                    whiteSpace: "nowrap",
                  }}
                  initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                >
                  <KeywordPhotoGroup
                    label="product designer"
                    photos={[
                      { color: "#f5d13e", width: 38, height: 46, rotate: -8.87, entryDelay: 0.55, entryFromX: -80, entryFromY: -200 },
                    ]}
                  />
                  <span>who loves</span>
                  <KeywordPhotoGroup
                    label="sketching"
                    photos={[
                      { color: "#0037ff", width: 42, height: 60, rotate: 11.02, entryDelay: 0.7, entryFromX: 200, entryFromY: -200 },
                      { color: "#f5d13e", width: 44, height: 50, rotate: -8.18, entryDelay: 0.8, entryFromX: 250, entryFromY: -160 },
                    ]}
                  />
                </motion.div>

                {/* Line 3: "and solved complex problems at [red] and" */}
                <motion.div
                  className="font-caslon text-[#212012]"
                  style={{
                    fontSize: "clamp(32px, 3.8vw, 50px)",
                    lineHeight: "1.2",
                    letterSpacing: "-0.48px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "nowrap",
                    marginTop: 6,
                    whiteSpace: "nowrap",
                  }}
                  initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                >
                  <span>and solved complex problems</span>
                  <KeywordPhotoGroup
                    label="at"
                    photos={[
                      { color: "#e82020", width: 44, height: 48, rotate: -8.18, entryDelay: 0.9, entryFromX: 100, entryFromY: 200 },
                      { color: "#c3a52a", width: 38, height: 52, rotate: 13.95, entryDelay: 1.0, entryFromX: -60, entryFromY: 220 },
                    ]}
                  />
                  <span>and</span>
                </motion.div>

                {/* Line 4: "tinkers with code to build fun products [blue]" */}
                <motion.div
                  className="font-caslon text-[#212012]"
                  style={{
                    fontSize: "clamp(32px, 3.8vw, 50px)",
                    lineHeight: "1.2",
                    letterSpacing: "-0.48px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "nowrap",
                    marginTop: 6,
                    whiteSpace: "nowrap",
                  }}
                  initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                >
                  <span>tinkers with code to build fun</span>
                  <KeywordPhotoGroup
                    label="products"
                    photos={[
                      { color: "#0037ff", width: 42, height: 60, rotate: 11.02, entryDelay: 1.1, entryFromX: 250, entryFromY: 100 },
                    ]}
                  />
                </motion.div>

                {/* Open to work pill */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 36 }}
                >
                  <motion.span
                    animate={{ opacity: [1, 0.22, 1] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#c3be6f", display: "inline-block" }}
                  />
                  <p className="font-jakarta font-medium" style={{ fontSize: 12, color: "#625e37", letterSpacing: "0.45px", textTransform: "uppercase" }}>
                    open to work
                  </p>
                </motion.div>
              </>
            )}
          </div>
        )}
      </motion.div>
      </motion.div>

      {/* Bottom "select projects" peek bar (desktop) */}
      {!isMobile && introComplete && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            backgroundColor: "#212012",
            borderRadius: "24px 24px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <p
            className="font-caslon uppercase text-[#e3d9ce]"
            style={{ fontSize: 20, letterSpacing: "0.12em" }}
          >
            select projects
          </p>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ marginLeft: 12, color: "#c3be6f", fontSize: 16 }}
          >
            ↓
          </motion.div>
        </motion.div>
      )}

      {/* Sound on/off — fixed to the viewport corner, stays put while scrolling */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? "Mute background sound" : "Unmute background sound"}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1000,
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1px solid rgba(33,32,18,0.15)",
          backgroundColor: "#e3d9ce",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          color: "#212012",
        }}
      >
        {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </div>
  );
}
