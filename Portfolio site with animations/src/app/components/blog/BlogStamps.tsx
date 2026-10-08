// Blog posts as dark postage stamps: a perforated stamp (src/assets/Blogs/stamp.svg)
// holding the post's picture, its read time and topic, the title and the subtitle.
// The two newest sit beside the section's intro (each a quarter of the row wide, plus
// 4px a side); on phones they go under it and scroll sideways. Any older posts are
// listed below as rows, each with a small stamp.
// Everything inside a stamp is sized against the stamp's own width (container query
// units, from the 664px-wide design) with a readable floor for the text, so a stamp
// looks the same at any size. Over a stamp, the pointer becomes a round "read the
// blog" badge; on touch screens the badge sits on each stamp's corner instead.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, type MotionValue, type Variants } from "motion/react";
import type { BlogPost } from "@/app/data/blogPosts";
import { MARTEL } from "@/app/lib/devanagari";
import { haptic } from "@/app/lib/feedback";
import { colors, fonts } from "@/app/theme/tokens";
import stampSvg from "@/assets/Blogs/stamp.svg";
import arrowSvg from "@/assets/Blogs/arrow.svg";

const isLatin = (text: string) => /^[\x20-\x7E’'–-]+$/.test(text);
const META = "#837D49";
const BADGE = 98.8; // the cursor badge, at design size

// design px → share of the stamp's 664px width, with a floor so nothing gets too small
const cq = (px: number, min: number) => `max(${min}px, ${((px / 664) * 100).toFixed(2)}cqw)`;
const cqClamp = (px: number, min: number) => `clamp(${min}px, ${((px / 664) * 100).toFixed(2)}cqw, ${px}px)`;

// "Mar 2025" → "Mar ‘25", "12 Jul 2026" → "12 Jul ‘26"
const shortDate = (date: string) => date.replace(/\b(\d{2})(\d{2})$/, "‘$2");
const minutes = (readTime: string) => `${readTime.replace(/\D+/g, "").padStart(2, "0")} mins`;
const topicOf = (post: BlogPost) => post.topic ?? post.category.charAt(0).toUpperCase() + post.category.slice(1);

/** Hovering with a mouse (or trackpad) - the only time a custom cursor makes sense. */
function useFinePointer() {
  const query = "(hover: hover) and (pointer: fine)";
  const [fine, setFine] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setFine(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

/** The round "read the blog" badge: a slowly turning ring of text around an arrow. */
function ReadBadge({ size = BADGE }: { size?: number | string }) {
  const reduce = useReducedMotion();
  const ring = "read the blog · read the blog · ";
  return (
    <div style={{ position: "relative", width: size, height: size, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: `${(1.4 / BADGE) * 100}%`, borderRadius: "50%", backgroundColor: colors.oliveDeep }} />
      <motion.svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 12, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", left: "50%", top: "50%", width: `${(64 / BADGE) * 100}%`, height: `${(64 / BADGE) * 100}%`, translateX: "-50%", translateY: "-50%" }}
      >
        <defs>
          <path id="read-badge-ring" d="M32 32 m-26 0 a26 26 0 1 1 52 0 a26 26 0 1 1 -52 0" />
        </defs>
        <text fill={colors.sand} fontFamily={fonts.sans} fontWeight={500} fontSize="8.6">
          <textPath href="#read-badge-ring" textLength="162" lengthAdjust="spacing">{ring}</textPath>
        </text>
      </motion.svg>
      <img
        src={arrowSvg}
        alt=""
        style={{ position: "absolute", left: "50%", top: "50%", width: `${(17.35 / BADGE) * 100}%`, transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}

/** The badge following the pointer while it's over a stamp. */
function CursorBadge({ x, y, show }: { x: MotionValue<number>; y: MotionValue<number>; show: boolean }) {
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.5 });
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          style={{ position: "fixed", left: -BADGE / 2, top: -BADGE / 2, x: sx, y: sy, zIndex: 9999, pointerEvents: "none" }}
        >
          <ReadBadge />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const imageVariants: Variants = { rest: { scale: 1 }, hover: { scale: 1.05 } };

function Stamp({ post, index, finePointer, onOpen, onHover }: {
  post: BlogPost; index: number; finePointer: boolean; onOpen: () => void; onHover: (on: boolean) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      className="blog-stamp"
      aria-label={`Read “${post.title}”`}
      onClick={() => { haptic(10); onHover(false); onOpen(); }}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.985 }}
      variants={{ rest: { y: 0 }, hover: { y: reduce ? 0 : -6 } }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: reduce ? 0 : index * 0.06 }}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        aspectRatio: "664 / 885",
        padding: 0,
        border: "none",
        background: `url(${stampSvg}) center / 100% 100% no-repeat`,
        containerType: "inline-size",
        textAlign: "left",
        cursor: finePointer ? "none" : "pointer",
        filter: "drop-shadow(0 10px 16px rgba(33,32,18,0.18))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          gap: cq(24, 10),
          padding: `calc(${cq(32, 12)} + 4px) calc(${cq(32, 12)} + 4px) calc(${cq(40, 20)} + 4px)`,
        }}
      >
        {/* the picture: 600×539 in the design; it gives up height first when space is tight */}
        <div
          style={{
            flex: "0 1 auto",
            minHeight: 0,
            width: "100%",
            aspectRatio: "600 / 539",
            borderRadius: cq(16, 6),
            backgroundColor: colors.sand,
            overflow: "hidden",
          }}
        >
          {post.stampImage && (
            <motion.img
              src={post.stampImage}
              alt=""
              variants={reduce ? undefined : imageVariants}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
        </div>

        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: cq(12, 8), fontFamily: fonts.sans, fontWeight: 500, fontSize: cqClamp(14, 12), lineHeight: 24 / 14, color: META, whiteSpace: "nowrap", overflow: "hidden" }}>
          <span>{minutes(post.readTime)}</span>
          <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: META, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{topicOf(post)}</span>
        </div>

        <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: cq(12, 4) }}>
          <p
            style={{
              fontFamily: fonts.serif,
              fontWeight: 600,
              fontSize: cqClamp(24, 16),
              lineHeight: 31 / 24,
              color: colors.sand,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              ...(isLatin(post.title) ? null : MARTEL),
            }}
          >
            {post.title}
          </p>
          <p
            style={{
              fontFamily: fonts.sans,
              fontWeight: 500,
              fontSize: cqClamp(16, 13),
              lineHeight: 1.5,
              color: colors.oliveDeep,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.subtitle}
          </p>
        </div>
      </div>

      {/* touch screens have no cursor, so the badge sits on the corner as in the design */}
      {!finePointer && (
        <div aria-hidden="true" style={{ position: "absolute", left: `${(594 / 664) * 100}%`, top: `${(-39 / 885) * 100}%` }}>
          <ReadBadge size={`${((BADGE / 664) * 100).toFixed(2)}cqw`} />
        </div>
      )}
    </motion.button>
  );
}

function Dot() {
  return <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: META, flexShrink: 0 }} />;
}

/** An older post as a row: a small stamp, then date · read time · topic, title, subtitle. */
function ListRow({ post, index, isMobile, finePointer, onOpen, onHover }: {
  post: BlogPost; index: number; isMobile: boolean; finePointer: boolean; onOpen: () => void; onHover: (on: boolean) => void;
}) {
  const reduce = useReducedMotion();
  // 111×148 with a 95×128 picture in the design; a little smaller on phones
  const k = isMobile ? 0.8 : 1;
  return (
    <motion.button
      type="button"
      className="blog-stamp"
      aria-label={`Read “${post.title}”`}
      onClick={() => { haptic(10); onHover(false); onOpen(); }}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : index * 0.05 }}
      style={{
        display: "flex", alignItems: "center", gap: isMobile ? 16 : 24, width: "100%",
        padding: 0, border: "none", background: "none", textAlign: "left", cursor: finePointer ? "none" : "pointer",
      }}
    >
      <motion.div
        variants={{ rest: { rotate: 0, y: 0 }, hover: { rotate: reduce ? 0 : -3, y: reduce ? 0 : -3 } }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        style={{
          position: "relative", flexShrink: 0, width: 111 * k, height: 148 * k,
          background: `url(${stampSvg}) center / 100% 100% no-repeat`,
          filter: "drop-shadow(0 6px 10px rgba(33,32,18,0.16))",
        }}
      >
        <div style={{ position: "absolute", left: 8 * k, top: 10 * k, width: 95 * k, height: 128 * k, borderRadius: 8 * k, backgroundColor: colors.sand, overflow: "hidden" }}>
          {post.stampImage && <img src={post.stampImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        </div>
      </motion.div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: isMobile ? 10 : 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, fontFamily: fonts.sans, fontWeight: 500, fontSize: isMobile ? 12 : 14, lineHeight: "24px", color: META, whiteSpace: "nowrap", overflow: "hidden" }}>
          <span>{shortDate(post.date)}</span>
          <Dot />
          <span>{minutes(post.readTime)}</span>
          <Dot />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{topicOf(post)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 12 }}>
          <motion.p
            variants={{ rest: { x: 0 }, hover: { x: reduce ? 0 : 4 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              fontFamily: fonts.serif, fontWeight: 600, fontSize: isMobile ? 20 : 24, lineHeight: isMobile ? "26px" : "31px", color: colors.ink,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              ...(isLatin(post.title) ? null : MARTEL),
            }}
          >
            {post.title}
          </motion.p>
          <p
            style={{
              fontFamily: fonts.sans, fontWeight: 500, fontSize: isMobile ? 14 : 16, lineHeight: isMobile ? "20px" : "24px", color: colors.oliveDeep,
              display: "-webkit-box", WebkitLineClamp: isMobile ? 2 : 1, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {post.subtitle}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

const FEATURED = 2; // how many of the newest posts get a full stamp

/** The whole shelf: the intro beside the newest stamps, then the rest as a list. */
export function BlogStamps({ posts, isMobile, intro, onOpen }: {
  posts: BlogPost[]; isMobile: boolean; intro: React.ReactNode; onOpen: (post: BlogPost) => void;
}) {
  const inset = isMobile ? 16 : 36;
  const finePointer = useFinePointer();
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const featured = posts.slice(0, FEATURED);
  const rest = posts.slice(FEATURED);
  const hover = (on: boolean) => setHovering(on && finePointer);

  return (
    <div
      onPointerMove={(e) => { if (e.pointerType === "mouse") { x.set(e.clientX); y.set(e.clientY); } }}
      style={{ padding: `0 ${inset}px`, containerType: "inline-size" }}
    >
      <style>{`.blog-stamp:focus-visible { outline: 2px solid ${colors.ink}; outline-offset: 4px; }`}</style>

      <div style={isMobile
        ? { display: "flex", flexDirection: "column", gap: 4 }
        : { display: "flex", alignItems: "flex-start", gap: 48 }}
      >
        <div style={isMobile ? undefined : { flex: "0 1 auto", maxWidth: 380, minWidth: 0 }}>{intro}</div>

        <div
          style={isMobile
            ? {
                display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none",
                // edge to edge, with room above for the corner badges and below for the shadow
                margin: `0 -${inset}px`, padding: `36px ${inset}px 24px`, scrollPaddingLeft: inset,
              }
            : { display: "flex", gap: 24, flex: "none" }}
        >
          {featured.map((post, i) => (
            <div
              key={post.id}
              style={isMobile
                ? { flex: "0 0 calc(min(78vw, 300px) + 8px)", scrollSnapAlign: "start" }
                // a quarter of the row, as if four stamps sat side by side, plus 4px a side
                : { width: "calc((100cqw - 72px) / 4 + 8px)" }}
            >
              <Stamp post={post} index={i} finePointer={finePointer} onOpen={() => onOpen(post)} onHover={hover} />
            </div>
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <div style={{ marginTop: isMobile ? 24 : 56, display: "flex", flexDirection: "column", gap: isMobile ? 20 : 28 }}>
          {rest.map((post, i) => (
            <div key={post.id} style={{ display: "contents" }}>
              {i > 0 && <div aria-hidden="true" style={{ height: 1, backgroundColor: "rgba(33,32,18,0.2)" }} />}
              <ListRow post={post} index={i} isMobile={isMobile} finePointer={finePointer} onOpen={() => onOpen(post)} onHover={hover} />
            </div>
          ))}
        </div>
      )}

      {finePointer && <CursorBadge x={x} y={y} show={hovering} />}
    </div>
  );
}
