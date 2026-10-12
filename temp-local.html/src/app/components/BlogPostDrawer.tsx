import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { BLOG_POSTS, type BlogPost } from "./BlogDetail";

const MARTEL = { fontFamily: "'Martel', serif", fontWeight: 600 };

// Wraps every occurrence of सुकून in a Martel span so the Devanagari word
// always renders in the correct typeface regardless of surrounding font.
function withMartel(text: string) {
  const parts = text.split("सुकून");
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i < parts.length - 1
      ? [part, <span key={i} style={MARTEL}>सुकून</span>]
      : [part]
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
        borderBottom: isLast ? "none" : "1px solid rgba(33,32,18,0.08)",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div>
        <span style={{ backgroundColor: "rgba(98,94,55,0.1)", borderRadius: 20, padding: "2px 10px", display: "inline-block", marginBottom: 6 }}>
          <p className="font-jakarta font-medium" style={{ fontSize: 10, color: "#625e37", letterSpacing: "0.3px", textTransform: "uppercase" }}>
            {post.category}
          </p>
        </span>
        <p
          className="font-caslon not-italic"
          style={{ fontSize: 17, lineHeight: "22px", color: "#212012", fontWeight: 600, textDecoration: hov ? "underline" : "none", transition: "text-decoration 0.1s" }}
        >
          {post.title}
        </p>
        <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.6, marginTop: 2 }}>
          {post.date} · {post.readTime}
        </p>
      </div>
      <motion.p
        animate={{ x: hov ? 5 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-caslon"
        style={{ fontSize: 20, color: "rgba(33,32,18,0.3)", flexShrink: 0 }}
      >
        →
      </motion.p>
    </div>
  );
}

export function BlogPostDrawer({ post, onClose, onNavigate }: BlogPostDrawerProps) {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (post) {
      const el = scrollableRef.current;
      if (el) el.scrollTop = 0;
      setScrolled(false);
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
              backgroundColor: "rgba(33,32,18,0.4)",
              backdropFilter: "blur(4px)",
            }}
          />
          <motion.div
            key="drawer"
            initial={{ x: 740 }}
            animate={{ x: 0 }}
            exit={{ x: 740 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0, width: 700, zIndex: 500,
              borderRadius: "24px 0 0 24px",
              backgroundColor: "#e3d9ce",
              overflow: "hidden",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 20, right: 20, zIndex: 10,
                width: 36, height: 36, borderRadius: "50%",
                backgroundColor: "rgba(33,32,18,0.08)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} color="#212012" />
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
                  backgroundColor: "#e3d9ce",
                  padding: scrolled ? "14px 56px 14px 36px" : "36px 56px 20px 36px",
                  borderBottom: scrolled ? "1px solid rgba(33,32,18,0.1)" : "1px solid transparent",
                  transition: "padding 0.3s ease, border-color 0.3s ease",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ backgroundColor: "rgba(221,161,174,0.28)", borderRadius: 20, padding: "3px 10px" }}>
                    <p className="font-jakarta font-medium" style={{ fontSize: 10, color: "#a06070", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                      {post.category}
                    </p>
                  </span>
                  <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.6 }}>{post.date}</p>
                  <span style={{ color: "rgba(98,94,55,0.3)", fontSize: 10 }}>·</span>
                  <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.5 }}>{post.readTime}</p>
                </div>
                <motion.p
                  className="font-caslon not-italic"
                  animate={{ fontSize: scrolled ? "17px" : "28px", lineHeight: scrolled ? "22px" : "34px" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ color: "#212012", fontWeight: 600, paddingRight: 48 }}
                >
                  {withMartel(post.title)}
                </motion.p>
              </div>

              {/* Body */}
              <div style={{ padding: "28px 52px 40px 36px" }}>
                <p className="font-jakarta" style={{ fontSize: 16, lineHeight: "25px", color: "#625e37", opacity: 0.9, marginBottom: 28 }}>
                  {post.subtitle}
                </p>
                <div style={{ height: 1, backgroundColor: "rgba(33,32,18,0.1)", marginBottom: 32 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {post.body.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                      className="font-caslon not-italic"
                      style={{ fontSize: 17, lineHeight: "30px", color: "#212012", opacity: 0.85 }}
                    >
                      {typeof para === "string" ? withMartel(para) : para}
                    </motion.p>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(33,32,18,0.08)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#c3be6f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <p className="font-caslon" style={{ fontSize: 16, color: "#212012", fontWeight: 600 }}>L</p>
                  </div>
                  <div>
                    <p className="font-jakarta font-semibold" style={{ fontSize: 14, color: "#212012" }}>Laxmi Mahajan</p>
                    <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.6 }}>UX designer · Bangalore</p>
                  </div>
                </div>
              </div>

              {/* Related */}
              <div style={{ padding: "32px 52px 56px 36px", borderTop: "1px solid rgba(33,32,18,0.1)" }}>
                <p className="font-jakarta font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.5px", color: "rgba(33,32,18,0.35)", marginBottom: 8 }}>
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
