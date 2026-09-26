import { useState } from "react";
import { motion } from "motion/react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { InfiniteCircularGallery } from "@/app/components/about/InfiniteCircularGallery";

// ── Section ───────────────────────────────────────────────────────────────────

interface PersonalSectionProps {
  onAboutOpen?: () => void;
}

export function PersonalSection({ onAboutOpen }: PersonalSectionProps) {
  const isMobile = useIsMobile();
  const [hovAbout, setHovAbout] = useState(false);

  return (
    <section style={{ padding: isMobile ? "32px 16px 32px" : "40px 40px 40px" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 56 }}
      >
        <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: "#625e37", marginBottom: 12 }}>
          beyond pixels
        </p>
        <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 32 : 40, lineHeight: isMobile ? "40px" : "48px", color: "#212012", fontWeight: 600 }}>
          i have a life outside of figma
        </p>
        <p className="font-inclusive-sans" style={{ fontSize: 16, color: "#625e37", opacity: 0.7, marginTop: 12 }}>
          sketches, wood carving, badminton, and opinions on too many things
        </p>

        {/* About me CTA — shown below tagline */}
        {onAboutOpen && (
          <motion.button
            onClick={onAboutOpen}
            onMouseEnter={() => setHovAbout(true)}
            onMouseLeave={() => setHovAbout(false)}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 20, padding: 0 }}
          >
            <p className="font-caslon" style={{ fontSize: 15, color: "#212012", fontStyle: "italic", textDecoration: hovAbout ? "underline" : "none", textUnderlineOffset: 3, transition: "text-decoration 0.1s" }}>
              about me
            </p>
            <motion.p
              animate={{ x: hovAbout ? 4 : 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-caslon"
              style={{ fontSize: 16, color: "#212012", lineHeight: 1 }}
            >
              →
            </motion.p>
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <InfiniteCircularGallery height={isMobile ? 300 : 420} />
        <p className="font-inclusive-sans" style={{ fontSize: 12, color: "#625e37", opacity: 0.38, textAlign: "center", marginTop: 14 }}>
          drag or scroll to spin
        </p>
      </motion.div>
    </section>
  );
}
