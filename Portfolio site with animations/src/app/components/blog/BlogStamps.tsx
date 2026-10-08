// Blog posts as a little row of postage stamps: perforated edges, a doodle
// vignette, the title, the read time as the stamp's value, and a postmark with
// the date. Each sits slightly crooked and straightens up when you point at it.
// Scrolls sideways when there are more stamps than fit.
import { motion } from "motion/react";
import type { BlogPost } from "@/app/data/blogPosts";
import { MARTEL } from "@/app/lib/devanagari";
import { haptic } from "@/app/lib/feedback";
import { colors, fonts, withAlpha } from "@/app/theme/tokens";
import { CATEGORY_ACCENT, CATEGORY_DOODLE } from "./blogCategories";

const isLatin = (text: string) => /^[\x20-\x7E’'–-]+$/.test(text);
const FACES = [colors.pinkLight, colors.oliveLight, colors.sandLight];
const TILTS = [-2.5, 1.8, -1.2, 2.4];

function Postmark({ date }: { date: string }) {
  const label = `${date.toUpperCase()} · BENGALURU · `;
  return (
    <svg width="96" height="60" viewBox="0 0 96 60" aria-hidden="true" style={{ position: "absolute", top: -16, right: -26, transform: "rotate(-14deg)", pointerEvents: "none" }}>
      <defs>
        <path id={`pm-${date.replace(/\W/g, "")}`} d="M66 30 m-21 0 a21 21 0 1 1 42 0 a21 21 0 1 1 -42 0" />
      </defs>
      <g fill="none" stroke={withAlpha(colors.ink, 0.42)} strokeWidth="1.4" strokeLinecap="round">
        <circle cx="66" cy="30" r="26" />
        <circle cx="66" cy="30" r="15" />
        {[22, 30, 38].map((y) => (
          <path key={y} d={`M2 ${y} q 6 -4 12 0 t 12 0 t 12 0 t 10 0`} />
        ))}
      </g>
      <text fontFamily={fonts.label} fontSize="6.2" letterSpacing="1" fill={withAlpha(colors.ink, 0.5)}>
        <textPath href={`#pm-${date.replace(/\W/g, "")}`}>{label}</textPath>
      </text>
    </svg>
  );
}

function Stamp({ post, index, isMobile, onOpen }: { post: BlogPost; index: number; isMobile: boolean; onOpen: () => void }) {
  const face = FACES[index % FACES.length];
  const accent = CATEGORY_ACCENT[post.category];
  const tilt = TILTS[index % TILTS.length];
  // multiples of the 12px perforation pitch, so the holes land evenly on every edge
  const w = isMobile ? 204 : 228;
  const h = isMobile ? 264 : 300;

  return (
    <motion.button
      type="button"
      onClick={() => { haptic(10); onOpen(); }}
      initial={{ opacity: 0, y: 28, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ rotate: 0, y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 18, delay: index * 0.06 }}
      style={{
        position: "relative",
        flexShrink: 0,
        width: w,
        padding: 0,
        border: "none",
        background: "none",
        cursor: "pointer",
        textAlign: "left",
        scrollSnapAlign: "start",
        filter: `drop-shadow(0 8px 12px ${withAlpha(colors.ink, 0.12)})`,
      }}
    >
      {/* perforated edge: dots of the page colour sitting on the stamp's border */}
      <div
        style={{
          padding: 8,
          height: h,
          boxSizing: "border-box",
          background: `radial-gradient(circle, ${colors.sand} 3.4px, transparent 3.9px) -6px -6px / 12px 12px, ${face}`,
        }}
      >
        <div
          style={{
            backgroundColor: face,
            border: `1px solid ${withAlpha(colors.ink, 0.16)}`,
            padding: isMobile ? 12 : 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* the vignette */}
          <div
            style={{
              height: isMobile ? 76 : 86,
              borderRadius: 4,
              backgroundColor: withAlpha(accent, 0.22),
              backgroundImage: `radial-gradient(${withAlpha(colors.ink, 0.08)} 1px, transparent 1.2px)`,
              backgroundSize: "8px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span style={{ fontSize: isMobile ? 32 : 38 }} aria-hidden="true">{CATEGORY_DOODLE[post.category]}</span>
            <span className="font-caslon" style={{ position: "absolute", left: 8, top: 6, fontSize: 11, fontStyle: "italic", color: withAlpha(colors.ink, 0.55) }}>
              no. {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <p className="font-inclusive-sans uppercase" style={{ fontSize: 9, letterSpacing: "0.12em", color: colors.oliveDeep }}>
            {post.category}
          </p>
          <p
            className="font-caslon not-italic"
            style={{
              fontSize: isMobile ? 18 : 20,
              lineHeight: isMobile ? "22px" : "24px",
              fontWeight: 600,
              color: colors.ink,
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
            className="font-inclusive-sans"
            style={{
              fontSize: 12,
              lineHeight: "17px",
              fontWeight: 300,
              color: withAlpha(colors.ink, 0.72),
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.subtitle}
          </p>

          {/* the stamp's value */}
          <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span className="font-caslon" style={{ fontSize: 22, lineHeight: "22px", color: colors.ink }}>
              {post.readTime.replace(/\D+/g, "")}
              <span className="font-inclusive-sans uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", marginLeft: 3, color: colors.oliveDeep }}>min</span>
            </span>
            <span className="font-inclusive-sans" style={{ fontSize: 11, color: colors.orange }}>read →</span>
          </div>
        </div>
      </div>

      <Postmark date={post.date} />
    </motion.button>
  );
}

export function BlogStamps({ posts, isMobile, onOpen }: { posts: BlogPost[]; isMobile: boolean; onOpen: (post: BlogPost) => void }) {
  const inset = isMobile ? 16 : 36;
  return (
    <div
      style={{
        display: "flex",
        gap: isMobile ? 20 : 32,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        scrollPaddingLeft: inset,
        scrollbarWidth: "none",
        // room for the tilt, hover lift and postmarks
        padding: `28px ${inset + 24}px 28px ${inset}px`,
      }}
    >
      {posts.map((post, i) => (
        <Stamp key={post.id} post={post} index={i} isMobile={isMobile} onOpen={() => onOpen(post)} />
      ))}
    </div>
  );
}
