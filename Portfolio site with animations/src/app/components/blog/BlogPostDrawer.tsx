import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause } from "lucide-react";
import { BLOG_POSTS, type BlogPost } from "@/app/data/blogPosts";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { useWordTimings, type WordTiming } from "@/app/hooks/useWordTimings";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { MARTEL, withMartel } from "@/app/lib/devanagari";
import { colors, withAlpha } from "@/app/theme/tokens";

// Pre-generated ElevenLabs narration + word timing live in public/audio/blog/
// (see scripts/generate-voiceovers.mjs) — base-aware so it resolves whether
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

function RelatedBlogLink({ post, isLast, onClick }: { post: BlogPost; isLast: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "16px 0",
        borderBottom: isLast ? "none" : `1px solid ${withAlpha(colors.ink, 0.08)}`,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div>
        <span style={{ backgroundColor: withAlpha(colors.oliveDeep, 0.1), borderRadius: 20, padding: "2px 10px", display: "inline-block", marginBottom: 6 }}>
          <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, color: colors.oliveDeep, letterSpacing: "0.3px", textTransform: "uppercase" }}>
            {post.category}
          </p>
        </span>
        <p
          className="font-caslon not-italic"
          style={{ fontSize: 17, lineHeight: "22px", color: colors.ink, fontWeight: 600, textDecoration: hov ? "underline" : "none", transition: "text-decoration 0.1s" }}
        >
          {post.title}
        </p>
        <p className="font-inclusive-sans" style={{ fontSize: 12, color: colors.oliveDeep, opacity: 0.6, marginTop: 2 }}>
          {post.date} · {post.readTime}
        </p>
      </div>
      <motion.p
        animate={{ x: hov ? 5 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-caslon"
        style={{ fontSize: 20, color: withAlpha(colors.ink, 0.3), flexShrink: 0 }}
      >
        →
      </motion.p>
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
              position: "fixed", right: 0, top: 0, bottom: 0, width: isMobile ? "100%" : "min(1120px, 94vw)", zIndex: 500,
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
              {/* Sticky header */}
              <div
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
                    <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, color: "#a06070", letterSpacing: "0.3px", textTransform: "uppercase" }}>
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

              {/* Body */}
              <div style={{ padding: isMobile ? "20px 16px 32px" : "28px 52px 40px 36px" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 48, paddingTop: 24, borderTop: `1px solid ${withAlpha(colors.ink, 0.08)}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: colors.olive, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <p className="font-caslon" style={{ fontSize: 16, color: colors.ink, fontWeight: 600 }}>L</p>
                  </div>
                  <div>
                    <p className="font-inclusive-sans font-semibold" style={{ fontSize: 14, color: colors.ink }}>Laxmi Mahajan</p>
                    <p className="font-inclusive-sans" style={{ fontSize: 12, color: colors.oliveDeep, opacity: 0.6 }}>UX designer · Bangalore</p>
                  </div>
                </div>
              </div>

              {/* Related */}
              <div style={{ padding: isMobile ? "24px 16px 48px" : "32px 52px 56px 36px", borderTop: `1px solid ${withAlpha(colors.ink, 0.1)}` }}>
                <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.5px", color: withAlpha(colors.ink, 0.35), marginBottom: 8 }}>
                  read more
                </p>
                {related.map((p, i) => (
                  <RelatedBlogLink
                    key={p.id}
                    post={p}
                    isLast={i === related.length - 1}
                    onClick={() => onNavigate(p)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
