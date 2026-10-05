import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost, type BlogCategory } from "@/app/data/blogPosts";
import { BLOG_INSET, BlogFilterTabs, BlogJournal } from "@/app/components/blog/BlogJournal";
import { BlogTrail } from "@/app/components/blog/BlogTrail";
import { markPostRead } from "@/app/lib/readPosts";

import { BlogPostDrawer } from "@/app/components/blog/BlogPostDrawer";
import { colors, withAlpha } from "@/app/theme/tokens";


// Blog post slug in the URL, e.g. /portfolio/blog/sukoon
// (base-aware so it matches the app's deployed path, see vite.config.ts `base`)
const BLOG_BASE = `${import.meta.env.BASE_URL}blog/`;
const blogUrl = (slug: string) => `${BLOG_BASE}${slug}`;
const slugFromPath = (pathname: string) =>
  pathname.startsWith(BLOG_BASE) ? pathname.slice(BLOG_BASE.length).replace(/\/$/, "") : null;

export function BlogSection({ onDrawerChange }: { onDrawerChange?: (open: boolean) => void }) {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Let the host (App) hide the mobile bottom nav while a blog post is open.
  useEffect(() => { onDrawerChange?.(!!selectedPost); }, [selectedPost, onDrawerChange]);

  const filtered = activeCategory ? BLOG_POSTS.filter((p) => p.category === activeCategory) : BLOG_POSTS;
  const inset = isMobile ? BLOG_INSET.mobile : BLOG_INSET.desktop;

  // Give the drawer real page semantics: pushing a slugged URL means the browser's
  // back button closes the drawer instead of leaving the site entirely.
  const openPost = (post: BlogPost) => {
    markPostRead(post.id);
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

      {/* Edge to edge: only the text is inset, matching the case study cards (36px / 16px). */}
      <div style={{ padding: isMobile ? "28px 0 48px" : "40px 0 64px" }}>
        <div style={{ marginBottom: 20, padding: `0 ${inset}px` }}>
          <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: colors.oliveDeep, marginBottom: 8 }}>
            i write, sometimes
          </p>
          <p className="font-caslon not-italic" style={{ fontSize: 36, lineHeight: "44px", color: colors.ink, fontWeight: 600 }}>
            ideas that probably<br />should stay in my notes app
          </p>
        </div>

        {BLOG_POSTS.length > 0 && (
          <div style={{ marginBottom: isMobile ? 12 : 16, padding: `0 ${inset}px` }}>
            <BlogFilterTabs categories={BLOG_CATEGORIES} active={activeCategory} onChange={setActiveCategory} />
          </div>
        )}

        {BLOG_POSTS.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ paddingTop: 48, paddingBottom: 32, textAlign: "center" }}
          >
            <p className="font-caslon not-italic" style={{ fontSize: 28, color: colors.ink, fontWeight: 600, marginBottom: 8, lineHeight: "36px" }}>
              <em>working on something worth reading</em>
            </p>
            <p className="font-inclusive-sans" style={{ fontSize: 13, color: colors.oliveDeep, opacity: 0.6, lineHeight: "20px" }}>
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
          <>
            <BlogJournal posts={filtered} isMobile={isMobile} onOpen={openPost} />

            {/* Reference: a game-like alternative layout to compare against the notebook */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `0 ${inset}px`, margin: `${isMobile ? 40 : 56}px 0 14px` }}>
              <span className="font-inclusive-sans font-semibold" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.ink, backgroundColor: colors.pink, borderRadius: 20, padding: "3px 9px" }}>
                reference
              </span>
              <p className="font-caslon" style={{ fontSize: 15, fontStyle: "italic", color: colors.oliveDeep }}>a gamified alternative</p>
              <div style={{ flex: 1, height: 1, backgroundColor: withAlpha(colors.ink, 0.1) }} />
            </div>
            <BlogTrail posts={filtered} isMobile={isMobile} onOpen={openPost} />
          </>
        )}
      </div>
    </section>
  );
}
