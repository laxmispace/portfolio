import { useRef, useState, useEffect } from "react";
import { motion, useTransform, AnimatePresence } from "motion/react";
import { useScrollProgress } from "../ScrollContext";
import { useIsMobile } from "../useIsMobile";
import { BLOG_POSTS, type BlogPost, type BlogCategory } from "./BlogDetail";

const MARTEL = { fontFamily: "'Martel', serif", fontWeight: 600 };
function withMartel(text: string) {
  const parts = text.split("सुकून");
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i < parts.length - 1
      ? [part, <span key={i} style={MARTEL}>सुकून</span>]
      : [part]
  );
}
import { BlogPostDrawer } from "./BlogPostDrawer";
import imgPhoto from "figma:asset/4dfdf49b488289ec55070ff65a3c23b4f7ef8355.png";

const CHIPS: BlogCategory[] = ["write about design", "personal musings", "life in a nutshell"];

// Blog post slug in the URL, e.g. /portfolio/blog/sukoon
// (base-aware so it matches the app's deployed path, see vite.config.ts `base`)
const BLOG_BASE = `${import.meta.env.BASE_URL}blog/`;
const blogUrl = (slug: string) => `${BLOG_BASE}${slug}`;
const slugFromPath = (pathname: string) =>
  pathname.startsWith(BLOG_BASE) ? pathname.slice(BLOG_BASE.length).replace(/\/$/, "") : null;

function BlogListItem({ post, isNewest, onClick }: { post: BlogPost; isNewest: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderBottom: "1px solid rgba(33,32,18,0.1)", padding: "24px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {isNewest && (
            <span style={{ backgroundColor: "#dda1ae", borderRadius: 20, padding: "2px 8px" }}>
              <p className="font-inclusive-sans font-semibold" style={{ fontSize: 9, color: "#212012", letterSpacing: "0.5px", textTransform: "uppercase" }}>new</p>
            </span>
          )}
          <span style={{ backgroundColor: "rgba(98,94,55,0.1)", borderRadius: 20, padding: "2px 10px" }}>
            <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, color: "#625e37", letterSpacing: "0.3px", textTransform: "uppercase" }}>{post.category}</p>
          </span>
          <p className="font-inclusive-sans" style={{ fontSize: 12, color: "#625e37", opacity: 0.55 }}>{post.date}</p>
          <span style={{ color: "rgba(98,94,55,0.3)", fontSize: 10 }}>·</span>
          <p className="font-inclusive-sans" style={{ fontSize: 12, color: "#625e37", opacity: 0.45 }}>{post.readTime}</p>
        </div>
        <p
          className="font-caslon not-italic"
          style={{ fontSize: 24, lineHeight: "30px", color: "#212012", fontWeight: 600, marginBottom: 6, textDecoration: hov ? "underline" : "none", textUnderlineOffset: 3, transition: "text-decoration 0.1s" }}
        >
          {withMartel(post.title)}
        </p>
        <p className="font-inclusive-sans" style={{ fontSize: 14, lineHeight: "20px", color: "#625e37", opacity: 0.75 }}>
          {post.subtitle}
        </p>
      </div>
      <motion.p
        animate={{ x: hov ? 5 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-caslon"
        style={{ fontSize: 22, color: "rgba(33,32,18,0.25)", flexShrink: 0, marginTop: 4 }}
      >
        →
      </motion.p>
    </motion.div>
  );
}

export function TinkeringSection({ onDrawerChange }: { onDrawerChange?: (open: boolean) => void }) {
  const photoRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [activeChip, setActiveChip] = useState<BlogCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Let the host (App) hide the mobile bottom nav while a blog post is open.
  useEffect(() => { onDrawerChange?.(!!selectedPost); }, [selectedPost, onDrawerChange]);

  const scrollYProgress = useScrollProgress(photoRef, ["start end", "end start"]);
  const imageY = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  const filtered = activeChip ? BLOG_POSTS.filter((p) => p.category === activeChip) : BLOG_POSTS;

  // Give the drawer real page semantics: pushing a slugged URL means the browser's
  // back button closes the drawer instead of leaving the site entirely.
  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    window.history.pushState({ blogSlug: post.slug }, "", blogUrl(post.slug));
  };

  const closePost = () => {
    if (window.history.state?.blogSlug) {
      window.history.back();
    } else {
      setSelectedPost(null);
    }
  };

  // Deep link: landing directly on the blog-post URL opens that drawer.
  // Replace the entry first so "back" from the drawer always lands on the
  // plain portfolio URL rather than exiting the site.
  useEffect(() => {
    const slug = slugFromPath(window.location.pathname);
    const post = slug ? BLOG_POSTS.find((p) => p.slug === slug) : undefined;
    if (post) {
      window.history.replaceState(null, "", import.meta.env.BASE_URL);
      window.history.pushState({ blogSlug: post.slug }, "", blogUrl(post.slug));
      setSelectedPost(post);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser back/forward: sync the drawer to whatever slug (or lack of one) the
  // history entry we've landed on carries.
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const slug = (e.state as { blogSlug?: string } | null)?.blogSlug;
      const post = slug ? BLOG_POSTS.find((p) => p.slug === slug) : undefined;
      setSelectedPost(post ?? null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <BlogPostDrawer
        post={selectedPost}
        onClose={closePost}
        onNavigate={openPost}
      />

      <div style={{ padding: isMobile ? "28px 16px 60px" : "40px 40px 80px" }}>
        <div style={{ marginBottom: 28 }}>
          <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: "#625e37", marginBottom: 8 }}>
            i write, sometimes
          </p>
          <p className="font-caslon not-italic" style={{ fontSize: 36, lineHeight: "44px", color: "#212012", fontWeight: 600 }}>
            ideas that probably<br />should stay in my notes app
          </p>
        </div>

        {/* Pink chip filter bar */}
        <div
          style={{
            backgroundColor: "rgba(221,161,174,0.14)",
            border: "1px solid rgba(221,161,174,0.3)",
            borderRadius: 14,
            padding: "10px 16px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: "rgba(160,96,112,0.6)", letterSpacing: "0.4px", textTransform: "uppercase", flexShrink: 0, marginRight: 4 }}>
            filter
          </p>
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(activeChip === chip ? null : chip)}
              style={{
                background: activeChip === chip ? "#dda1ae" : "rgba(221,161,174,0.2)",
                border: `1px solid ${activeChip === chip ? "#dda1ae" : "rgba(221,161,174,0.38)"}`,
                borderRadius: 20, padding: "5px 12px", cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <p className="font-inclusive-sans font-medium" style={{ fontSize: 11, color: activeChip === chip ? "#212012" : "#a06070" }}>
                {chip}
              </p>
            </button>
          ))}
          <AnimatePresence>
            {activeChip && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={() => setActiveChip(null)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "5px 4px" }}
              >
                <p className="font-inclusive-sans" style={{ fontSize: 11, color: "rgba(160,96,112,0.5)" }}>clear ×</p>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {BLOG_POSTS.length > 0 && (
          <p className="font-inclusive-sans" style={{ fontSize: 12, color: "#625e37", opacity: 0.4, marginBottom: 4 }}>
            {filtered.length} essay{filtered.length !== 1 ? "s" : ""}{activeChip ? ` in "${activeChip}"` : " · opinions on design, systems, and fintech"}
          </p>
        )}

        {BLOG_POSTS.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ paddingTop: 48, paddingBottom: 32, textAlign: "center" }}
          >
            <p className="font-caslon not-italic" style={{ fontSize: 28, color: "#212012", fontWeight: 600, marginBottom: 8, lineHeight: "36px" }}>
              <em>working on something worth reading</em>
            </p>
            <p className="font-inclusive-sans" style={{ fontSize: 13, color: "#625e37", opacity: 0.6, lineHeight: "20px" }}>
              check back soon - the drafts are living their best life in my notes app
            </p>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginTop: 28 }}
            >
              <span style={{ fontSize: 28 }}>✍️</span>
            </motion.div>
          </motion.div>
        ) : (
          <div>
            {filtered.map((post, i) => (
              <BlogListItem
                key={post.id}
                post={post}
                isNewest={!activeChip && i === 0}
                onClick={() => openPost(post)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
