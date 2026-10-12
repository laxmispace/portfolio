import { useRef, useState } from "react";
import { motion, useTransform, AnimatePresence } from "motion/react";
import { useScrollProgress } from "../ScrollContext";
import { useIsMobile } from "../useIsMobile";
import { X } from "lucide-react";

const AI_PROJECTS = [
  {
    title: "Design critique assistant",
    description: "LLM-powered UX feedback using heuristic frameworks",
    accent: "#c3be6f",
    tag: "LLM + UX",
    longDescription: "A conversational AI tool that takes screenshots or descriptions of UI designs and returns structured feedback using established UX heuristics — Nielsen's 10, WCAG guidelines, and Gestalt principles. Built to compress what takes hours in design reviews into minutes.",
    tech: ["GPT-4o", "Vision API", "React"],
    status: "Working prototype",
  },
  {
    title: "Research synthesizer",
    description: "Raw interview transcripts → themes + synthesis memo",
    accent: "#c67d39",
    tag: "NLP + Research",
    longDescription: "Paste in messy interview transcripts, get back a structured synthesis memo with emergent themes, representative quotes, and design implications. Cuts the most tedious part of user research in half. Currently handles up to 10 interviews at once.",
    tech: ["Claude API", "Python", "Markdown"],
    status: "In use",
  },
  {
    title: "Palette generator",
    description: "Describe a feeling, get a full colour system back",
    accent: "#dda1ae",
    tag: "Generative",
    longDescription: "Type something like 'anxious but hopeful, like waiting for test results' and get back a full colour system — primary, secondary, semantic tokens, dark mode variants. Built to explore whether emotion-to-color translation can be systematized.",
    tech: ["LLM", "CSS Variables", "Figma API"],
    status: "Experimental",
  },
];

type AiProject = typeof AI_PROJECTS[0];

// ── Per-project detail modal ───────────────────────────────────────────────────
function AiProjectModal({ project, onClose }: { project: AiProject | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 499, backgroundColor: "rgba(33,32,18,0.5)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            key="drawer"
            initial={{ x: 540 }}
            animate={{ x: 0 }}
            exit={{ x: 540 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0, width: 500, zIndex: 500,
              backgroundColor: "#212012", borderRadius: "20px 0 0 20px",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 20, right: 20,
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: "rgba(227,217,206,0.1)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={14} color="#e3d9ce" />
            </button>

            <div style={{ padding: "48px 36px 48px", flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
              {/* Accent tag */}
              <div style={{
                display: "inline-flex", backgroundColor: `${project.accent}20`,
                padding: "4px 12px", borderRadius: 100, marginBottom: 20,
                border: `1px solid ${project.accent}40`,
              }}>
                <p className="font-jakarta font-medium" style={{ fontSize: 11, color: project.accent, letterSpacing: "0.4px" }}>
                  {project.tag}
                </p>
              </div>

              <p className="font-caslon not-italic" style={{ fontSize: 28, color: "#e3d9ce", fontWeight: 600, lineHeight: "34px", marginBottom: 24 }}>
                {project.title}
              </p>

              {/* Thumbnail */}
              <div style={{
                height: 190, backgroundColor: "rgba(227,217,206,0.05)", borderRadius: 10,
                marginBottom: 24, position: "relative", overflow: "hidden",
                border: `1px solid ${project.accent}28`,
              }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: project.accent, opacity: 0.55 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p className="font-caslon" style={{ fontSize: 13, color: "rgba(227,217,206,0.18)", fontStyle: "italic" }}>preview coming soon</p>
                </div>
              </div>

              <p className="font-jakarta" style={{ fontSize: 15, lineHeight: "25px", color: "rgba(227,217,206,0.75)", marginBottom: 28 }}>
                {project.longDescription}
              </p>

              {/* Tech stack */}
              <div style={{ marginBottom: 28 }}>
                <p className="font-jakarta font-medium uppercase" style={{ fontSize: 10, letterSpacing: "0.5px", color: "rgba(227,217,206,0.3)", marginBottom: 10 }}>
                  built with
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {project.tech.map((t) => (
                    <span key={t} style={{ backgroundColor: "rgba(227,217,206,0.07)", borderRadius: 6, padding: "4px 10px" }}>
                      <p className="font-spline" style={{ fontSize: 12, color: "rgba(227,217,206,0.55)" }}>{t}</p>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: project.accent, flexShrink: 0 }} />
                <p className="font-jakarta" style={{ fontSize: 12, color: "rgba(227,217,206,0.45)" }}>{project.status}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── View all button ────────────────────────────────────────────────────────────
function ViewAllButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
    >
      <p className="font-caslon" style={{ fontSize: 14, color: "#e3d9ce", fontStyle: "italic", textDecoration: hovered ? "underline" : "none", transition: "text-decoration 0.1s" }}>
        view all ai projects
      </p>
      <motion.p
        animate={{ x: hovered ? 4 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-caslon"
        style={{ fontSize: 15, color: "#e3d9ce", lineHeight: 1 }}
      >
        →
      </motion.p>
    </button>
  );
}

// ── Main section ───────────────────────────────────────────────────────────────
export function AiPlaygroundSection({ onViewAll }: { onViewAll?: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [selectedProject, setSelectedProject] = useState<AiProject | null>(null);

  const scrollYProgress = useScrollProgress(sectionRef, ["start end", "end start"]);
  const sectionY     = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -40]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.97, 1, 1, 0.99]);

  return (
    <section ref={sectionRef} style={{ padding: isMobile ? "40px 16px 24px" : "80px 40px 40px" }}>
      <AiProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      <motion.div
        style={{
          y: sectionY, scale: sectionScale,
          backgroundColor: "#212012", borderRadius: isMobile ? 12 : 16, overflow: "hidden",
          padding: isMobile ? "32px 20px 28px" : "48px 40px 40px", display: "flex", flexDirection: "column", gap: 32,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <p className="font-caslon not-italic text-center" style={{ color: "#e3d9ce", fontSize: isMobile ? 26 : 36, lineHeight: "normal" }}>
            sometimes i tinker with ai
          </p>
          <p className="font-jakarta text-center" style={{ color: "rgba(227,217,206,0.55)", fontSize: isMobile ? 13 : 15, lineHeight: "normal", marginTop: 8 }}>
            things i build out of sheer curiosity and to cope with anxiety
          </p>
        </div>

        {/* Project cards — clickable */}
        <div style={{ display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
          {AI_PROJECTS.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedProject(project)}
              style={{ flex: 1, cursor: "pointer" }}
            >
              <motion.div
                style={{
                  height: isMobile ? 140 : 240,
                  backgroundColor: "rgba(227,217,206,0.07)",
                  borderRadius: 8,
                  border: `1px solid ${project.accent}28`,
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 14,
                }}
                whileHover={{ borderColor: `${project.accent}60` }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: project.accent, opacity: 0.5 }} />
                {/* Subtle expand hint */}
                <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(227,217,206,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 8L8 2M8 2H4M8 2V6" stroke="rgba(227,217,206,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.div>
              <p className="font-caslon not-italic" style={{ color: "#e3d9ce", fontSize: 18, lineHeight: "22px", fontWeight: 600 }}>
                {project.title}
              </p>
              <p className="font-jakarta" style={{ color: "rgba(227,217,206,0.5)", fontSize: 13, lineHeight: "18px", marginTop: 4 }}>
                {project.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer row */}
        {onViewAll && (
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
            <ViewAllButton onClick={onViewAll} />
          </div>
        )}
      </motion.div>
    </section>
  );
}
