import { useRef, useState } from "react";
import { motion, useTransform } from "motion/react";
import { useScrollProgress } from "@/app/context/ScrollContext";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { AI_PROJECTS as ALL_AI_PROJECTS, isOpenableAiProject, type AiProject } from "@/app/data/aiProjects";
import { AiProjectDrawer } from "@/app/components/ai-projects/AiProjectDrawer";
import { AiProjectFrame } from "@/app/components/ai-projects/AiProjectFrame";

// Featured on the homepage: openable projects first, then fill up to 3 with the rest.
const FEATURED_AI_PROJECTS: AiProject[] = [...ALL_AI_PROJECTS]
  .sort((a, b) => (isOpenableAiProject(b) ? 1 : 0) - (isOpenableAiProject(a) ? 1 : 0))
  .slice(0, 3);

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
export function AiProjectsSection({ onViewAll }: { onViewAll?: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [selectedProject, setSelectedProject] = useState<AiProject | null>(null);

  const scrollYProgress = useScrollProgress(sectionRef, ["start end", "end start"]);
  const sectionY     = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -40]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.97, 1, 1, 0.99]);

  return (
    <section ref={sectionRef} style={{ padding: isMobile ? "40px 16px 24px" : "80px 40px 40px" }}>
      <AiProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />

      <motion.div
        style={{
          y: sectionY, scale: sectionScale,
          backgroundColor: "#212012", borderRadius: isMobile ? 12 : 16, overflow: "hidden",
          // Mobile: no side padding so the project frames run edge to edge; text keeps its own inset.
          padding: isMobile ? "32px 0 28px" : "48px 40px 40px", display: "flex", flexDirection: "column", gap: 32,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", padding: isMobile ? "0 20px" : 0 }}>
          <p className="font-caslon not-italic text-center" style={{ color: "#e3d9ce", fontSize: isMobile ? 26 : 36, lineHeight: "normal" }}>
            sometimes i tinker with ai
          </p>
          <p className="font-inclusive-sans text-center" style={{ color: "rgba(227,217,206,0.55)", fontSize: isMobile ? 13 : 15, lineHeight: "normal", marginTop: 8 }}>
            things i build out of sheer curiosity and to cope with anxiety
          </p>
          {onViewAll && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <ViewAllButton onClick={onViewAll} />
            </div>
          )}
        </div>

        {/* Project cards — clickable only when there's something to open */}
        <div style={{ display: "flex", gap: isMobile ? 40 : 16, flexDirection: isMobile ? "column" : "row" }}>
          {FEATURED_AI_PROJECTS.map((project, i) => {
            const clickable = isOpenableAiProject(project);
            return (
              <motion.div
                key={project.id}
                className="aipf-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={clickable && !isMobile ? { y: -4 } : undefined}
                onClick={clickable ? () => setSelectedProject(project) : undefined}
                style={{ flex: 1, cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.55 }}
              >
                <motion.div
                  style={{
                    // Same 353:240 frame on web and mobile, so the artwork scales
                    // identically. On mobile the frame runs edge to edge.
                    ...(isMobile
                      ? { aspectRatio: "353 / 240", borderRadius: 0, border: "none" }
                      : { aspectRatio: "353 / 240", borderRadius: 8, border: `1px solid ${project.accent}28` }),
                    backgroundColor: "rgba(227,217,206,0.07)",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: isMobile ? 16 : 14,
                  }}
                  whileHover={clickable && !isMobile ? { borderColor: `${project.accent}60` } : undefined}
                  transition={{ duration: 0.2 }}
                >
                  {project.frameKey && <AiProjectFrame frameKey={project.frameKey} isMobile={isMobile} />}
                  {!project.frameKey && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: project.accent, opacity: 0.5 }} />
                  )}
                  {/* Subtle expand hint — web only; mobile shows the inline arrow instead */}
                  {clickable && !isMobile && (
                    <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderRadius: "50%", backgroundColor: project.frameKey ? "rgba(33,32,18,0.18)" : "rgba(227,217,206,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 8L8 2M8 2H4M8 2V6" stroke={project.frameKey ? "rgba(255,255,255,0.7)" : "rgba(227,217,206,0.35)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </motion.div>

                {isMobile ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "stretch" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexGrow: 1, minWidth: 0 }}>
                        <p className="font-caslon not-italic" style={{ color: "#E3D9CE", fontSize: 16, lineHeight: "21px", fontWeight: 600 }}>
                          {project.title}
                        </p>
                        <p className="font-caslon" style={{ color: "rgba(227,217,206,0.8)", fontSize: 12, lineHeight: "12px", fontStyle: "italic", fontWeight: 500 }}>
                          {project.kind === "extension" ? "Chrome extension" : "Web app"}
                        </p>
                      </div>
                      {clickable && (
                        <p className="font-caslon not-italic" style={{ color: "#E3D9CE", fontSize: 20, lineHeight: "20px", fontWeight: 600, flexShrink: 0 }}>
                          →
                        </p>
                      )}
                    </div>
                    <p className="font-inclusive-sans" style={{ color: "#E3D9CE", fontSize: 13, lineHeight: "17px", letterSpacing: "-0.02em" }}>
                      {project.description}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-caslon not-italic" style={{ color: "#e3d9ce", fontSize: 18, lineHeight: "22px", fontWeight: 600 }}>
                      {project.title}
                    </p>
                    <p className="font-inclusive-sans" style={{ color: "rgba(227,217,206,0.5)", fontSize: 13, lineHeight: "18px", marginTop: 4 }}>
                      {project.description}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
