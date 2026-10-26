import { useRef } from "react";
import { motion, useTransform } from "motion/react";
import { useScrollProgress } from "@/app/context/ScrollContext";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { AI_PROJECTS as ALL_AI_PROJECTS, isOpenableAiProject, type AiProject } from "@/app/data/aiProjects";
import { AiProjectDrawer } from "@/app/components/ai-projects/AiProjectDrawer";
import { AiProjectFrame } from "@/app/components/ai-projects/AiProjectFrame";
import { colors, textStyles, withAlpha } from "@/app/theme/tokens";
import { SquiggleLink } from "@/app/components/ui/Buttons";
import { BASE_URL, slugify, useRoutedSelection } from "@/app/lib/routedSelection";

// AI project slug in the URL, e.g. /portfolio/ai-project/browser-piano
const AI_PROJECT_BASE = `${BASE_URL}ai-project/`;

// Featured on the homepage: openable projects first, then fill up to 3 with the rest.
const FEATURED_AI_PROJECTS: AiProject[] = [...ALL_AI_PROJECTS]
  .sort((a, b) => (isOpenableAiProject(b) ? 1 : 0) - (isOpenableAiProject(a) ? 1 : 0))
  .slice(0, 3);

// ── Main section ───────────────────────────────────────────────────────────────
export function AiProjectsSection({ onViewAll }: { onViewAll?: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { selected: selectedProject, open: openProject, close: closeProject } = useRoutedSelection({
    items: ALL_AI_PROJECTS.filter(isOpenableAiProject),
    slugOf: (p) => slugify(p.title),
    stateKey: "aiProjectSlug",
    urlFor: (slug) => `${AI_PROJECT_BASE}${slug}`,
    closedUrl: () => BASE_URL,
    slugFromLocation: () => {
      const { pathname } = window.location;
      return pathname.startsWith(AI_PROJECT_BASE) ? pathname.slice(AI_PROJECT_BASE.length).replace(/\/$/, "") : null;
    },
  });

  const scrollYProgress = useScrollProgress(sectionRef, ["start end", "end start"]);
  const sectionY     = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -40]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.97, 1, 1, 0.99]);

  return (
    <section ref={sectionRef} style={{ padding: isMobile ? "40px 16px 24px" : "80px 40px 40px" }}>
      <AiProjectDrawer project={selectedProject} onClose={closeProject} />

      <motion.div
        style={{
          y: sectionY, scale: sectionScale,
          backgroundColor: colors.ink, borderRadius: isMobile ? 12 : 16, overflow: "hidden",
          // Mobile: no side padding so the project frames run edge to edge; text keeps its own inset.
          padding: isMobile ? "32px 0 28px" : "48px 40px 40px", display: "flex", flexDirection: "column", gap: 32,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", padding: isMobile ? "0 20px" : 0 }}>
          <p className="font-caslon not-italic text-center" style={{ color: colors.sand, fontSize: isMobile ? 26 : 52, lineHeight: isMobile ? "38px" : "70px", fontWeight: 500, letterSpacing: "-0.03em" }}>
            sometimes i tinker with ai
          </p>
          <p className="text-center" style={{ ...textStyles.byline, color: withAlpha(colors.sand, 0.6), marginTop: 8 }}>
            things i build out of sheer curiosity and to cope with anxiety
          </p>
          {onViewAll && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <SquiggleLink onClick={onViewAll} style={{ fontSize: isMobile ? 18 : 22, lineHeight: isMobile ? "24px" : "28px" }}>view all ai projects</SquiggleLink>
            </div>
          )}
        </div>

        {/* Project cards - clickable only when there's something to open */}
        <div style={{ display: "flex", gap: isMobile ? 40 : 16, flexDirection: isMobile ? "column" : "row" }}>
          {FEATURED_AI_PROJECTS.map((project, i) => {
            const clickable = isOpenableAiProject(project);
            return (
              <motion.div
                key={project.id}
                className="ai-project-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={clickable && !isMobile ? { y: -4 } : undefined}
                onClick={clickable ? () => openProject(project) : undefined}
                style={{ flex: 1, cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.55 }}
              >
                <motion.div
                  style={{
                    // Same 353:240 frame on web and mobile, so the artwork scales
                    // identically. On mobile the frame runs edge to edge.
                    ...(isMobile
                      ? { aspectRatio: "353 / 240", borderRadius: 0, border: "none" }
                      : { aspectRatio: "353 / 240", borderRadius: 8, border: `1px solid ${project.accent}28` }),
                    backgroundColor: withAlpha(colors.sand, 0.07),
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
                  {/* Subtle expand hint - web only; mobile shows the inline arrow instead */}
                  {clickable && !isMobile && (
                    <div style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", backgroundColor: project.frameKey ? withAlpha(colors.ink, 0.18) : withAlpha(colors.sand, 0.06), display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                        <path d="M2 8L8 2M8 2H4M8 2V6" stroke={project.frameKey ? withAlpha(colors.white, 0.85) : withAlpha(colors.sand, 0.5)} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </motion.div>

                {isMobile ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "stretch" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexGrow: 1, minWidth: 0 }}>
                        <p className="font-caslon not-italic" style={{ color: colors.sand, fontSize: 16, lineHeight: "21px", fontWeight: 600 }}>
                          {project.title}
                        </p>
                        <p className="font-caslon" style={{ color: withAlpha(colors.sand, 0.8), fontSize: 12, lineHeight: "12px", fontStyle: "italic", fontWeight: 500 }}>
                          {project.kind === "extension" ? "Chrome extension" : "Web app"}
                        </p>
                      </div>
                      {clickable && (
                        <p className="font-caslon not-italic" style={{ color: colors.sand, fontSize: 26, lineHeight: "24px", fontWeight: 600, flexShrink: 0 }}>
                          →
                        </p>
                      )}
                    </div>
                    <p className="font-inclusive-sans" style={{ color: colors.sand, fontSize: 13, lineHeight: "17px", letterSpacing: "-0.02em" }}>
                      {project.description}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-caslon not-italic" style={{ color: colors.sand, fontSize: 18, lineHeight: "22px", fontWeight: 600 }}>
                      {project.title}
                    </p>
                    <p className="font-inclusive-sans" style={{ color: withAlpha(colors.sand, 0.5), fontSize: 13, lineHeight: "18px", marginTop: 4 }}>
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
