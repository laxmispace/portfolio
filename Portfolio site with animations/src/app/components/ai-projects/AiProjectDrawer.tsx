import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Download, CirclePlay } from "lucide-react";
import type { AiProject } from "@/app/data/aiProjects";
import { useIsMobile } from "@/app/hooks/useIsMobile";

interface AiProjectDrawerProps {
  project: AiProject | null;
  onClose: () => void;
}

function WebAppBody({ project }: { project: AiProject }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [project.id]);

  return (
    <div style={{ flex: 1, position: "relative", backgroundColor: "#e3d9ce" }}>
      {!loaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="font-caslon" style={{ fontSize: 14, color: "rgba(33,32,18,0.3)", fontStyle: "italic" }}>
            loading project…
          </p>
        </div>
      )}
      {project.url && (
        <iframe
          key={project.id}
          src={project.url}
          title={project.title}
          onLoad={() => setLoaded(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allow="fullscreen; autoplay; camera; microphone; geolocation"
        />
      )}
    </div>
  );
}

function ExtensionBody({ project }: { project: AiProject }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "40px 48px 56px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-inclusive-sans"
            style={{
              fontSize: 11,
              color: project.accent,
              backgroundColor: `${project.accent}15`,
              padding: "3px 8px",
              borderRadius: 20,
              letterSpacing: "0.3px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="font-caslon not-italic" style={{ fontSize: 26, lineHeight: "32px", color: "#e3d9ce", fontWeight: 600, marginBottom: 16, maxWidth: 640 }}>
        {project.title}
      </p>

      <p className="font-inclusive-sans" style={{ fontSize: 15, lineHeight: "25px", color: "rgba(227,217,206,0.75)", marginBottom: 32, maxWidth: 640 }}>
        {project.longDescription}
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {project.downloadUrl && (
          <a
            href={project.downloadUrl}
            download
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 20px", borderRadius: 10,
              backgroundColor: project.accent, textDecoration: "none",
            }}
          >
            <Download size={15} color="#212012" />
            <span className="font-inclusive-sans font-medium" style={{ fontSize: 13, color: "#212012" }}>
              download extension
            </span>
          </a>
        )}
        {project.videoUrl && (
          <button
            onClick={() => setShowVideo((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 20px", borderRadius: 10,
              backgroundColor: "rgba(227,217,206,0.08)",
              border: "1px solid rgba(227,217,206,0.2)",
              cursor: "pointer",
            }}
          >
            <CirclePlay size={15} color="#e3d9ce" />
            <span className="font-inclusive-sans font-medium" style={{ fontSize: 13, color: "#e3d9ce" }}>
              {showVideo ? "hide walkthrough" : "how to use"}
            </span>
          </button>
        )}
      </div>

      {showVideo && project.videoUrl && (
        <div
          style={{
            marginTop: 28,
            position: "relative",
            paddingTop: "56.25%",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(227,217,206,0.1)",
          }}
        >
          <iframe
            src={project.videoUrl}
            title={`${project.title} — how to use`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

// Wide side drawer (like the blog drawer) that either runs a project's live
// url as an iframe, or — for browser extensions — shows a download button
// and an inline "how to use" video walkthrough.
export function AiProjectDrawer({ project, onClose }: AiProjectDrawerProps) {
  const isMobile = useIsMobile(768);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  const isExtension = project?.kind === "extension";

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 599,
              backgroundColor: "rgba(33,32,18,0.4)",
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
              position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 600,
              width: isMobile ? "100%" : "min(1200px, 90vw)",
              borderRadius: isMobile ? 0 : "24px 0 0 24px",
              backgroundColor: "#212012",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "-24px 0 60px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "12px 20px",
                flexShrink: 0,
                borderBottom: "1px solid rgba(227,217,206,0.1)",
                backgroundColor: "#212012",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <button
                  onClick={onClose}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    backgroundColor: "rgba(227,217,206,0.08)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={15} color="#e3d9ce" />
                </button>
                <div style={{ minWidth: 0 }}>
                  <p
                    className="font-caslon not-italic"
                    style={{
                      fontSize: 16,
                      color: "#e3d9ce",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {project.title}
                  </p>
                  <p className="font-inclusive-sans" style={{ fontSize: 11, color: "rgba(227,217,206,0.45)" }}>
                    {isExtension ? "chrome extension" : "running live · fully interactive"}
                  </p>
                </div>
              </div>

              {!isExtension && project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(227,217,206,0.15)",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  <span className="font-inclusive-sans" style={{ fontSize: 12, color: "#e3d9ce" }}>
                    open in new tab
                  </span>
                  <ExternalLink size={13} color="#e3d9ce" />
                </a>
              )}
            </div>

            {isExtension ? <ExtensionBody project={project} /> : <WebAppBody project={project} />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
