// The blog section, built to the Figma frames ("web - 4", "mobile - 4").
//
// Desktop - a 400px-tall card on a 12-column grid (36px margins, 16px gutters), rounded at
//   the top only: the intro at 36/36; a light-olive band from column 4 to the right edge
//   holding the latest post 24px in (its picture fills the card, the text sits on a sand
//   fade with a NEW badge); an olive band from column 8 to the right edge with "Read more" -
//   every older post as a row (a 120px shaped picture beside title, subtitle, meta),
//   scrolling on its own.
// Phone - edge to edge: the intro centred, the light-olive band with the latest post, and
//   the olive "Read more" band over its bottom: tinted cards (an 80px shaped picture, a
//   one-line title with an orange arrow, the topic) scrolling sideways.
// Posts are sorted newest first by date, so adding one moves the previous latest into
// "Read more" by itself. Every picture plays the post's looping video if it has one.
import { motion, useReducedMotion } from "motion/react";
import type { BlogPost } from "@/app/data/blogPosts";
import { MARTEL } from "@/app/lib/devanagari";
import { haptic } from "@/app/lib/feedback";
import { colors, textStyles, withAlpha } from "@/app/theme/tokens";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const META = colors.oliveDeep; // #625E37 - subtitles, meta, labels
const RULE = withAlpha(colors.oliveDeep, 0.3); // the divider between "Read more" rows
const CARD_BG = "#53502D"; // the section's deep olive card

// Desktop grid: 12 columns, 36px margins, 16px gutters, across the card's width.
const MARGIN = 36;
const GUTTER = 16;
const COL = `((100% - ${MARGIN * 2}px - ${GUTTER * 11}px) / 12)`;
/** left edge of column n (1-based), as a parenthesised CSS length */
const colStart = (n: number) => `(${MARGIN}px + ${n - 1} * (${COL} + ${GUTTER}px))`;
const BAND_H = 400; // the light-olive and olive bands
const PAD_Y = 36; // the dark card's padding above and below them
const SECTION_H = BAND_H + PAD_Y * 2;

const isLatin = (text: string) => /^[\x20-\x7E’'–-]+$/.test(text);
// "Mar 2025" → "Mar ‘25", "12 Jul 2026" → "12 Jul ‘26"
const shortDate = (date: string) => date.replace(/\b(\d{2})(\d{2})$/, "‘$2");
const minutes = (readTime: string) => `${readTime.replace(/\D+/g, "").padStart(2, "0")} mins`;
const topicOf = (p: BlogPost) => p.topic ?? p.category.replace(/^\w/, (c) => c.toUpperCase());
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const dateKey = (date: string) => {
  const year = Number(date.match(/\d{4}/)?.[0] ?? 0);
  const month = MONTHS.findIndex((m) => date.toLowerCase().includes(m));
  const day = Number(date.match(/^(\d{1,2})\s/)?.[1] ?? 1);
  return year * 10000 + Math.max(month, 0) * 100 + day;
};

// ── Type (from the frames) ──
const SERIF = "'Libre Caslon Condensed', serif";
const SANS = "'Inclusive Sans', sans-serif";
const T = {
  eyebrow: { fontFamily: SANS, fontWeight: 400, fontSize: 12, lineHeight: "16px", textTransform: "uppercase" as const },
  // the intro uses the site's shared label, and a headline that sits on the bands' top edge
  label: textStyles.label,
  headline: (m: boolean) => ({ fontFamily: SERIF, fontWeight: 500, fontSize: m ? 24 : 32, lineHeight: m ? "32px" : "40px", letterSpacing: "-0.02em" }),
  title: { fontFamily: SERIF, fontWeight: 600, fontSize: 16, lineHeight: "21px" },
  body: { fontFamily: SANS, fontWeight: 400, fontSize: 12, lineHeight: "18px" },
  meta: { fontFamily: SANS, fontWeight: 400, fontSize: 12, lineHeight: "16px" },
  metaSmall: { fontFamily: SANS, fontWeight: 400, fontSize: 10, lineHeight: "12px" },
  badge: { fontFamily: SANS, fontWeight: 500, fontSize: 10, lineHeight: "12px" },
};
const clamp = (lines: number) => ({ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical" as const, overflow: "hidden" });

// Shapes the "Read more" pictures cycle through (desktop 120px / 12px, phone 80px / 8px).
const SHAPES = (r: number, s: number) => [
  `${s}px ${r}px ${r}px ${s}px`, // half-moon, round on the right
  `${r}px ${s}px ${s}px ${s}px`, // quarter, round top-left
  `${r}px ${r}px ${s}px ${s}px`, // arch
  `${s}px ${s}px ${r}px ${s}px`, // quarter, round bottom-right
];

/** A post's picture: its looping video, its first image, or a soft placeholder. */
function PostMedia({ post }: { post: BlogPost }) {
  const fill = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const, display: "block" };
  if (post.video) return <video src={post.video} autoPlay muted loop playsInline aria-hidden="true" style={fill} />;
  const img = post.images?.[0] ?? post.stampImage;
  if (img) return <img src={img} alt="" loading="lazy" decoding="async" style={fill} />;
  return <span aria-hidden="true" style={{ ...fill, background: `radial-gradient(120% 90% at 30% 70%, ${colors.pinkLight} 0%, ${colors.sand} 100%)` }} />;
}

/** A picture clipped to its shape. clip-path (not just overflow + radius) keeps the video
 *  inside the rounded edge even while it zooms, and in Safari. */
function Pic({ post, radius, style }: { post: BlogPost; radius: string | number; style: React.CSSProperties }) {
  const r = typeof radius === "number" ? `${radius}px` : radius;
  return (
    <span style={{ position: "relative", display: "block", overflow: "hidden", borderRadius: r, clipPath: `inset(0 round ${r})`, flexShrink: 0, ...style }}>
      <motion.span variants={{ hover: { scale: 1.06 } }} transition={{ duration: 0.7, ease: EASE }} style={{ position: "absolute", inset: 0, display: "block" }}>
        <PostMedia post={post} />
      </motion.span>
    </span>
  );
}

const Dot = () => <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: 2, background: META, flexShrink: 0 }} />;

function Meta({ post }: { post: BlogPost }) {
  return (
    <span style={{ ...T.meta, color: META, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span>{shortDate(post.date)}</span><Dot /><span>{minutes(post.readTime)}</span><Dot /><span>{topicOf(post)}</span>
    </span>
  );
}

const Title = ({ post, lines = 1 }: { post: BlogPost; lines?: number }) => (
  <span style={{ ...T.title, color: colors.ink, ...clamp(lines), minWidth: 0, ...(isLatin(post.title) ? null : MARTEL) }}>{post.title}</span>
);

/** A clickable post: rises in on scroll; its picture zooms a little on hover. */
function PostButton({ post, onOpen, children, style }: { post: BlogPost; onOpen: (p: BlogPost) => void; children: React.ReactNode; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      className="blog-post"
      aria-label={`Read “${post.title}”`}
      onClick={() => { haptic(10); onOpen(post); }}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover="hover"
      style={{ display: "block", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", ...style }}
    >
      {children}
    </motion.button>
  );
}

/** The latest post: its picture fills the card; the text sits on a sand fade over a blur. */
function Latest({ post, onOpen, m }: { post: BlogPost; onOpen: (p: BlogPost) => void; m: boolean }) {
  const r = m ? 12 : 16;
  return (
    <PostButton post={post} onOpen={onOpen} style={{ width: "100%", height: m ? 240 : "100%" }}>
      <span style={{ position: "relative", display: "block", height: "100%", borderRadius: r, overflow: "hidden", clipPath: `inset(0 round ${r}px)` }}>
        <Pic post={post} radius={r} style={{ position: "absolute", inset: 0 }} />
        {/* the blur, fading in from the top so it has no hard edge */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, height: m ? "75%" : "50%",
            backdropFilter: `blur(${m ? 14 : 6}px)`, WebkitBackdropFilter: `blur(${m ? 14 : 6}px)`,
            maskImage: "linear-gradient(0deg, #000 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(0deg, #000 55%, transparent 100%)",
          }}
        />
        <span
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, top: m ? 0 : undefined, justifyContent: "flex-end",
            padding: m ? "0 12px 12px" : "40px 12px 12px", display: "flex", flexDirection: "column", gap: 16,
            // on phones the fade runs the card's full height so the byline stays readable
            background: m
              ? `linear-gradient(0deg, ${colors.sand} 0%, ${withAlpha(colors.sand, 0.85)} 35%, ${withAlpha(colors.sand, 0)} 100%)`
              : `linear-gradient(0deg, ${colors.sand} 0%, ${withAlpha(colors.sand, 0)} 100%)`,
          }}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <Title post={post} />
              <span style={{ ...T.badge, padding: "2px 4px", borderRadius: 4, background: colors.ink, color: colors.olive, flexShrink: 0 }}>NEW</span>
            </span>
            <span style={{ ...T.body, color: META, ...clamp(3) }}>{post.subtitle}</span>
          </span>
          <span style={{ height: 1, background: colors.sand }} />
          <Meta post={post} />
        </span>
      </span>
    </PostButton>
  );
}

const ReadMoreLabel = ({ count }: { count: number }) => (
  <span style={{ ...T.eyebrow, color: META, display: "flex", alignItems: "center", gap: 8 }}>
    Read more <Dot /> {count}
  </span>
);

/** Desktop row: a 120px shaped picture, title and subtitle on top, meta at the bottom. */
function Row({ post, index, onOpen }: { post: BlogPost; index: number; onOpen: (p: BlogPost) => void }) {
  const shapes = SHAPES(120, 12);
  return (
    <PostButton post={post} onOpen={onOpen} style={{ width: "100%" }}>
      <span style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
        <Pic post={post} radius={shapes[index % shapes.length]} style={{ width: 120, height: 120 }} />
        <span style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16, minWidth: 0, flex: 1 }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Title post={post} />
            <span style={{ ...T.body, color: META, ...clamp(3) }}>{post.subtitle}</span>
          </span>
          <Meta post={post} />
        </span>
      </span>
    </PostButton>
  );
}

/** Phone card: an 80px shaped picture, a one-line title with an orange arrow, the topic. */
function CardItem({ post, index, onOpen }: { post: BlogPost; index: number; onOpen: (p: BlogPost) => void }) {
  const shapes = SHAPES(80, 8);
  return (
    <PostButton post={post} onOpen={onOpen} style={{ width: 240, flexShrink: 0, scrollSnapAlign: "start" }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12, borderRadius: 12, background: withAlpha(colors.sand, 0.2) }}>
        <Pic post={post} radius={shapes[index % shapes.length]} style={{ width: 80, height: 80 }} />
        <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, minWidth: 0, display: "flex" }}><Title post={post} /></span>
            <motion.span
              aria-hidden="true"
              variants={{ hover: { x: 2 } }}
              style={{ width: 22, height: 22, borderRadius: 11, background: colors.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <svg width="12" height="11" viewBox="0 0 9 8" fill="none" style={{ marginLeft: 1 }}>
                <path d="M2.90826 0L8.84404 3.53211V4.44954L2.90826 8V6.83486L7.14679 4.44037L0 4.72477V3.38532L7.13762 3.66055L2.90826 1.23853V0Z" fill={colors.sand} />
              </svg>
            </motion.span>
          </span>
          <span style={{ ...T.metaSmall, color: META }}>{topicOf(post)}</span>
        </span>
      </span>
    </PostButton>
  );
}

const EYEBROW = "i write. sometimes.";

// ── The section ──────────────────────────────────────────────────────────────
export function BlogColumns({ posts, isMobile: m, onOpen }: {
  posts: BlogPost[];
  isMobile: boolean;
  onOpen: (post: BlogPost) => void;
}) {
  const sorted = [...posts].sort((a, b) => dateKey(b.date) - dateKey(a.date));
  const [latest, ...older] = sorted;
  if (!latest) return null;

  const css = <style>{`.blog-post:focus-visible { outline: 2px solid ${colors.ink}; outline-offset: 4px; border-radius: 12px; } .blog-scroll::-webkit-scrollbar { display: none; }`}</style>;

  if (m) {
    return (
      <div style={{ background: CARD_BG, borderRadius: 24, overflow: "hidden", padding: "0 0 36px" }}>
        {css}
        <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8, textAlign: "center", color: colors.sand }}>
          <p style={T.label}>{EYEBROW}</p>
          <p style={T.headline(true)}>ideas that probably should stay in my notes app</p>
        </div>
        {/* light-olive band; the olive "Read more" band sits over its bottom */}
        <div style={{ background: colors.oliveLight, borderRadius: 16 }}>
          <div style={{ padding: "16px 16px 24px" }}>
            <Latest post={latest} onOpen={onOpen} m />
          </div>
          {older.length > 0 && (
            <div style={{ background: colors.olive, borderRadius: 16, padding: "16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "0 16px" }}><ReadMoreLabel count={older.length} /></div>
              <div
                className="blog-scroll"
                data-no-reveal
                style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", scrollPaddingLeft: 16, padding: "0 16px", scrollbarWidth: "none" }}
              >
                {older.map((post, i) => <CardItem key={post.slug} post={post} index={i} onOpen={onOpen} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: SECTION_H, background: CARD_BG, borderRadius: 24, overflow: "hidden" }}>
      {css}
      {/* intro: columns 1-3 */}
      <div style={{ position: "absolute", left: MARGIN, top: PAD_Y, width: `calc(3 * ${COL} + ${2 * GUTTER}px)`, display: "flex", flexDirection: "column", gap: 12, color: colors.sand }}>
        <p style={T.label}>{EYEBROW}</p>
        <p style={T.headline(false)}>ideas that probably should stay in my notes app</p>
      </div>

      {/* light-olive band: column 4 → right edge */}
      <div style={{ position: "absolute", top: PAD_Y, bottom: PAD_Y, left: `calc${colStart(4)}`, right: 0, background: colors.oliveLight, borderRadius: "24px 0 0 24px" }} />
      {/* the latest post: 24px inside the band's visible part (column 4 to column 8) */}
      <div style={{ position: "absolute", top: PAD_Y + 24, bottom: PAD_Y + 24, left: `calc(${colStart(4)} + 24px)`, width: `calc(${colStart(8)} - ${colStart(4)} - 48px)`, display: "flex" }}>
        <Latest post={latest} onOpen={onOpen} m={false} />
      </div>

      {/* olive band: column 8 → right edge; "Read more" scrolls inside it */}
      <div
        style={{
          position: "absolute", top: PAD_Y, bottom: PAD_Y, left: `calc${colStart(8)}`, right: 0, background: colors.olive, borderRadius: "24px 0 0 24px",
          padding: `27px ${MARGIN}px 0 24px`, display: "flex", flexDirection: "column", gap: 16,
        }}
      >
        <ReadMoreLabel count={older.length} />
        <div className="blog-scroll" data-no-reveal style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", scrollbarWidth: "none", paddingBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {older.map((post, i) => (
              <div key={post.slug} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {i > 0 && <span aria-hidden="true" style={{ height: 1, background: RULE }} />}
                <Row post={post} index={i} onOpen={onOpen} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
