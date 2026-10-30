import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, Heart } from "lucide-react";
import { TextLink } from "@/app/components/ui/Buttons";
import { fetchLikes, sendLike, hasLiked, rememberLiked } from "@/app/lib/blogLikes";
import { BLOG_POSTS, type BlogPost } from "@/app/data/blogPosts";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { useWordTimings, type WordTiming } from "@/app/hooks/useWordTimings";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { MARTEL, withMartel } from "@/app/lib/devanagari";
import { colors, withAlpha } from "@/app/theme/tokens";

// Pre-generated ElevenLabs narration + word timing live in public/audio/blog/
// (see scripts/generate-voiceovers.mjs) - base-aware so it resolves whether
// served at "/" locally or "/portfolio/" on GitHub Pages.
const blogAudioUrl = (slug: string) => `${import.meta.env.BASE_URL}audio/blog/${slug}.mp3`;
const blogWordsUrl = (slug: string) => `${import.meta.env.BASE_URL}audio/blog/${slug}.words.json`;

// Renders one paragraph with a per-word karaoke-style highlight synced to audio
// playback (Spotify-lyrics style) once timing data has loaded; falls back to
// plain text (still Martel-aware) before narration/timings exist for this post.
function HighlightedParagraph({ text, timing, currentTime }: { text: string; timing?: WordTiming[]; currentTime: number }) {
  if (!timing || timing.length === 0) return <>{withMartel(text)}</>;

  const activeIndex = timing.findIndex((w) => currentTime >= w.start && currentTime < w.end);

  return (
    <>
      {timing.map((w, i) => (
        <span key={i}>
          <span
            style={{
              backgroundColor: i === activeIndex ? withAlpha(colors.orange, 0.12) : "transparent",
              borderRadius: 2,
              transition: "background-color 0.1s ease",
            }}
          >
            {w.word === "सुकून" ? <span style={MARTEL}>{w.word}</span> : w.word}
          </span>{" "}
        </span>
      ))}
    </>
  );
}

function BlogAudioPlayer({ slug, currentTimeRef }: { slug: string; currentTimeRef: (t: number) => void }) {
  const { playing, toggle, seekToFraction, available, progress, timeLabel, currentTime } = useAudioPlayer(blogAudioUrl(slug));

  useEffect(() => {
    currentTimeRef(currentTime);
  }, [currentTime, currentTimeRef]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
      <button
        onClick={toggle}
        disabled={!available}
        style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: colors.olive, border: "none", cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        {playing ? <Pause size={13} fill={colors.ink} color={colors.ink} /> : <Play size={13} fill={colors.ink} color={colors.ink} />}
      </button>
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekToFraction((e.clientX - rect.left) / rect.width);
        }}
        style={{ flex: 1, height: 2, backgroundColor: withAlpha(colors.ink, 0.1), borderRadius: 1, position: "relative", cursor: available ? "pointer" : "default" }}
      >
        <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: colors.olive, borderRadius: 1 }} />
      </div>
      <p className="font-inclusive-sans" style={{ fontSize: 11, color: colors.oliveDeep, opacity: 0.6, letterSpacing: "0.1px", flexShrink: 0 }}>
        {available ? timeLabel : "narration coming soon"}
      </p>
    </div>
  );
}

interface BlogPostDrawerProps {
  post: BlogPost | null;
  onClose: () => void;
  onNavigate: (post: BlogPost) => void;
}

// The post's looping thumbnail video (or its first picture), filling whatever box it's in.
function PostMedia({ post }: { post: BlogPost }) {
  const fill = { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" };
  if (post.video) return <video src={post.video} autoPlay muted loop playsInline style={fill} />;
  const img = post.images?.[0] ?? post.stampImage;
  if (img) return <img src={img} alt="" style={fill} />;
  return <span style={{ ...fill, background: `radial-gradient(120% 90% at 30% 70%, ${colors.pinkLight} 0%, ${colors.sand} 100%)` }} />;
}

// Each category keeps a colour, like each case study does.
const categoryColor = (post: BlogPost) => (post.category === "about design" ? colors.olive : colors.pink);

// "Read more" card, laid out like the case study ones: a faint wash of the category's
// colour, text left, small cover right; stacks on phones.
function RelatedBlogCard({ post, onClick, stacked }: { post: BlogPost; onClick: () => void; stacked: boolean }) {
  const [hovered, setHovered] = useState(false);
  const color = categoryColor(post);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="link"
      style={{
        cursor: "pointer", transition: "background-color 0.3s ease",
        backgroundColor: withAlpha(color, hovered ? 0.26 : 0.18), borderRadius: 12, padding: stacked ? 12 : 16,
        display: "flex", flexDirection: stacked ? "column-reverse" : "row", alignItems: stacked ? "stretch" : "center", gap: stacked ? 12 : 20,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <p className="font-caslon not-italic" style={{ fontSize: stacked ? 19 : 21, lineHeight: 1.3, color: colors.ink, fontWeight: 400 }}>
          {withMartel(post.title)}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <p className="font-inclusive-sans font-normal" style={{ fontSize: 10, lineHeight: "14px", letterSpacing: "0.06em", textTransform: "uppercase", color: withAlpha(colors.ink, 0.45) }}>
            {post.category}
          </p>
          <p className="font-inclusive-sans font-normal" style={{ fontSize: 12, lineHeight: "16px", color: colors.ink }}>{post.date} · {post.readTime}</p>
        </div>
        <div style={{ marginTop: 2 }}>
          <TextLink as="span" hovered={hovered} style={{ fontSize: 14 }}>read post</TextLink>
        </div>
      </div>
      <div style={{ width: stacked ? "100%" : 200, aspectRatio: "2 / 1", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
        <motion.div animate={{ scale: hovered ? 1.04 : 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ width: "100%", height: "100%" }}>
          <PostMedia post={post} />
        </motion.div>
      </div>
    </div>
  );
}

// The heart at the end of a post, with how many people have liked it.
function LikeButton({ slug }: { slug: string }) {
  const [liked, setLiked] = useState(() => hasLiked(slug));
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    setLiked(hasLiked(slug));
    setCount(null);
    fetchLikes(slug).then((n) => { if (live) setCount(n); });
    return () => { live = false; };
  }, [slug]);

  const toggle = async () => {
    if (busy) return;
    const next = !liked;
    setBusy(true);
    setLiked(next);
    rememberLiked(slug, next);
    setCount((c) => (c === null ? c : Math.max(0, c + (next ? 1 : -1))));
    const saved = await sendLike(slug, next ? 1 : -1);
    if (saved !== null) setCount(saved);
    setBusy(false);
  };

  // Until the counts load (or if they can't), the button still works and shows this browser's own like.
  const shown = count ?? (liked ? 1 : 0);
  return (
    // data-no-reveal: its text changes in place when liked, which the line reveal can't survive
    <div data-no-reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 56, paddingTop: 32, borderTop: `1px solid ${withAlpha(colors.ink, 0.08)}` }}>
      <p className="font-inclusive-sans" style={{ fontSize: 13, color: colors.oliveDeep, opacity: 0.7 }}>
        {liked ? "glad you liked it" : "enjoyed this?"}
      </p>
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.92 }}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this post" : "Like this post"}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, cursor: "pointer",
          border: `1px solid ${liked ? colors.pink : withAlpha(colors.ink, 0.15)}`,
          backgroundColor: liked ? withAlpha(colors.pink, 0.28) : "transparent",
          transition: "background-color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <motion.span key={String(liked)} initial={liked ? { scale: 0.4 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }} style={{ display: "flex" }}>
          <Heart size={18} color={liked ? "#c0566e" : colors.ink} fill={liked ? "#c0566e" : "none"} />
        </motion.span>
        <span className="font-inclusive-sans" style={{ fontSize: 14, color: colors.ink, minWidth: 8, fontVariantNumeric: "tabular-nums" }}>{shown}</span>
      </motion.button>
    </div>
  );
}

export function BlogPostDrawer({ post, onClose, onNavigate }: BlogPostDrawerProps) {
  const isMobile = useIsMobile(768);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const wordTimings = useWordTimings(blogWordsUrl(post?.slug ?? ""));

  useEffect(() => {
    if (post) {
      const el = scrollableRef.current;
      if (el) el.scrollTop = 0;
      setScrolled(false);
      setAudioTime(0);
    }
  }, [post?.id]);

  const related = post ? BLOG_POSTS.filter((p) => p.id !== post.id) : [];

  return (
    <AnimatePresence>
      {post && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 499,
              backgroundColor: withAlpha(colors.ink, 0.4),
              backdropFilter: "blur(4px)",
            }}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0, width: isMobile ? "100%" : "min(1120px, calc(94vw / var(--page-zoom)))", zIndex: 500,
              borderRadius: isMobile ? 0 : "24px 0 0 24px",
              backgroundColor: colors.sand,
              overflow: "hidden",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 20, right: 20, zIndex: 10,
                width: 36, height: 36, borderRadius: "50%",
                backgroundColor: withAlpha(colors.ink, 0.08), border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} color={colors.ink} />
            </button>

            <div
              ref={scrollableRef}
              onScroll={(e) => setScrolled((e.target as HTMLDivElement).scrollTop > 20)}
              style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none" }}
            >
              {/* Sticky header - kept out of the line-by-line text reveal (useScrollReveal):
                  it changes text in place when "read more" swaps posts, which a split
                  paragraph can't survive */}
              <div
                data-no-reveal
                style={{
                  position: "sticky", top: 0, zIndex: 5,
                  backgroundColor: colors.sand,
                  padding: scrolled
                    ? `14px ${isMobile ? 48 : 56}px 14px ${isMobile ? 16 : 36}px`
                    : `${isMobile ? 20 : 36}px ${isMobile ? 48 : 56}px 20px ${isMobile ? 16 : 36}px`,
                  borderBottom: scrolled ? `1px solid ${withAlpha(colors.ink, 0.1)}` : "1px solid transparent",
                  transition: "padding 0.3s ease, border-color 0.3s ease",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ backgroundColor: withAlpha(colors.pink, 0.28), borderRadius: 20, padding: "3px 10px" }}>
                    <p className="font-inclusive-sans font-normal" style={{ fontSize: 10, color: "#a06070", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                      {post.category}
                    </p>
                  </span>
                  <p className="font-inclusive-sans" style={{ fontSize: 12, color: colors.oliveDeep, opacity: 0.6 }}>{post.date}</p>
                  <span style={{ color: withAlpha(colors.oliveDeep, 0.3), fontSize: 10 }}>·</span>
                  <p className="font-inclusive-sans" style={{ fontSize: 12, color: colors.oliveDeep, opacity: 0.5 }}>{post.readTime}</p>
                </div>
                <motion.p
                  className="font-caslon not-italic"
                  animate={{ fontSize: scrolled ? "17px" : "28px", lineHeight: scrolled ? "22px" : "34px" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ color: colors.ink, fontWeight: 600, paddingRight: 48 }}
                >
                  {withMartel(post.title)}
                </motion.p>
              </div>

              {/* Body - keyed by post so switching posts (via "read more") builds it fresh,
                  instead of React patching one post's paragraphs into another's */}
              <div key={post.id} style={{ padding: isMobile ? "20px 16px 32px" : "28px 52px 40px 36px" }}>
                {/* Hero cover: the same looping video as the post's thumbnail */}
                <div style={{ width: "100%", aspectRatio: isMobile ? "16 / 10" : "21 / 9", borderRadius: isMobile ? 10 : 14, overflow: "hidden", marginBottom: 24 }}>
                  <PostMedia post={post} />
                </div>
                <p className="font-inclusive-sans" style={{ fontSize: 16, lineHeight: "25px", color: colors.oliveDeep, opacity: 0.9, marginBottom: 20 }}>
                  {post.subtitle}
                </p>
                <BlogAudioPlayer slug={post.slug} currentTimeRef={setAudioTime} />
                <div style={{ height: 1, backgroundColor: withAlpha(colors.ink, 0.1), marginBottom: 32 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {post.body.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04 }}
                      className="font-caslon not-italic"
                      style={{ fontSize: 17, lineHeight: "30px", color: colors.ink, opacity: 0.85 }}
                    >
                      {typeof para === "string" ? (
                        <HighlightedParagraph text={para} timing={wordTimings?.[i]} currentTime={audioTime} />
                      ) : (
                        para
                      )}
                    </motion.p>
                  ))}
                </div>
                <LikeButton slug={post.slug} />
              </div>

              {/* Related - also out of the text reveal, for the same reason as the header */}
              <div data-no-reveal style={{ padding: isMobile ? "24px 16px 48px" : "32px 52px 56px 36px", borderTop: `1px solid ${withAlpha(colors.ink, 0.1)}` }}>
                <p className="font-inclusive-sans font-normal" style={{ fontSize: 11, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.4), textTransform: "uppercase", marginBottom: 12 }}>
                  Read more
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {related.map((p) => (
                    <RelatedBlogCard key={p.id} post={p} stacked={isMobile} onClick={() => onNavigate(p)} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
