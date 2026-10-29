import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { AiProject } from "@/app/data/aiProjects";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { colors, withAlpha } from "@/app/theme/tokens";
import { ICON_BUTTON, PrimaryButton, TextLink } from "@/app/components/ui/Buttons";

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
    <div style={{ flex: 1, position: "relative", backgroundColor: colors.sand }}>
      {!loaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="font-caslon" style={{ fontSize: 14, color: withAlpha(colors.ink, 0.3), fontStyle: "italic" }}>
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

      <p className="font-caslon not-italic" style={{ fontSize: 26, lineHeight: "32px", color: colors.sand, fontWeight: 600, marginBottom: 16 }}>
        {project.title}
      </p>

      <p className="font-inclusive-sans" style={{ fontSize: 15, lineHeight: "25px", color: withAlpha(colors.sand, 0.75), marginBottom: 32 }}>
        {project.longDescription}
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {project.videoUrl && (
          <PrimaryButton onClick={() => setShowVideo((v) => !v)} color={colors.sand} deep={colors.orange}>
            {showVideo ? "hide walkthrough" : "how to use"}
          </PrimaryButton>
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
            border: `1px solid ${withAlpha(colors.sand, 0.1)}`,
          }}
        >
          <iframe
            src={project.videoUrl}
            title={`${project.title} - how to use`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

// Typeface: why it exists and where the original lives, then a live type tester set in the
// font itself, then the repo. (The drawer's header already carries the title.)
const TYPE_SAMPLE = "ಫ್ಯಾಕಲ್ಟಿ ಗ್ಲಿಫಿಕ್ ಕನ್ನಡ";
function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: colors.sand, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: withAlpha(colors.sand, 0.4) }}>
      {children}
    </a>
  );
}
function TypefaceBody({ project }: { project: AiProject }) {
  const isMobile = useIsMobile();
  const [text, setText] = useState(TYPE_SAMPLE);
  const [size, setSize] = useState(isMobile ? 44 : 72);
  const body = { fontSize: 15, lineHeight: "25px", color: withAlpha(colors.sand, 0.75) } as const;

  return (
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: isMobile ? "28px 20px 48px" : "40px 48px 56px" }}>
      <p className="font-inclusive-sans" style={{ ...body, marginBottom: 12 }}>{project.longDescription}</p>
      {project.original && (
        <p className="font-inclusive-sans" style={{ ...body, marginBottom: 32 }}>
          The Latin is by {project.original.author} - <InlineLink href={project.original.repoUrl}>see the repo</InlineLink> - and you can find
          Faculty Glyphic on <InlineLink href={project.original.googleFontsUrl}>Google Fonts</InlineLink>.
        </p>
      )}

      {/* the tester: type anything - Kannada or Latin - and size it up or down */}
      <div style={{ border: `1px solid ${withAlpha(colors.sand, 0.12)}`, borderRadius: 12, padding: isMobile ? 16 : 24, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
          <span className="font-inclusive-sans" style={{ fontSize: 11, letterSpacing: "0.5px", textTransform: "uppercase", color: withAlpha(colors.sand, 0.5) }}>
            type to try it
          </span>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="font-inclusive-sans" style={{ fontSize: 11, color: withAlpha(colors.sand, 0.5), minWidth: 34, textAlign: "right" }}>{size}px</span>
            <input
              type="range"
              min={20}
              max={140}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              aria-label="Font size"
              style={{ width: isMobile ? 110 : 160, accentColor: project.accent }}
            />
          </label>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          aria-label="Type to try the font"
          rows={2}
          style={{
            width: "100%", resize: "vertical", background: "none", border: "none", outline: "none", padding: 0,
            fontFamily: "'Faculty Glyphic Kannada', serif", fontSize: size, lineHeight: 1.45, color: colors.sand,
          }}
        />
      </div>

      {project.repoUrl && (
        <PrimaryButton href={project.repoUrl} color={colors.orange} deep={colors.sand} ariaLabel="View Faculty Glyphic Kannada on GitHub (opens in a new tab)">
          view on github
        </PrimaryButton>
      )}
    </div>
  );
}

// Music player: nothing to embed - the drawer walks through how it was built,
// then the little behaviours worth knowing about.
function PlayerBody({ project }: { project: AiProject }) {
  const label: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    color: withAlpha(colors.sand, 0.45),
    marginBottom: 20,
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "40px 48px 56px" }}>
      <div>
        <p className="font-caslon not-italic" style={{ fontSize: 26, lineHeight: "32px", color: colors.sand, fontWeight: 600, marginBottom: 16 }}>
          {project.title}
        </p>
        <p className="font-inclusive-sans" style={{ fontSize: 15, lineHeight: "25px", color: withAlpha(colors.sand, 0.75), marginBottom: 48 }}>
          {project.longDescription}
        </p>

        {project.steps && (
          <>
            <p className="font-inclusive-sans" style={label}>how it's built</p>
            <ol style={{ listStyle: "none", padding: 0, margin: "0 0 48px", display: "flex", flexDirection: "column", gap: 28 }}>
              {project.steps.map((step, i) => (
                <li key={step.title} style={{ display: "flex", gap: 20 }}>
                  <span
                    className="font-caslon"
                    style={{ fontSize: 22, lineHeight: "26px", color: project.accent, width: 28, flexShrink: 0, fontStyle: "italic" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-caslon not-italic" style={{ fontSize: 18, lineHeight: "26px", color: colors.sand, marginBottom: 6 }}>
                      {step.title}
                    </p>
                    <p className="font-inclusive-sans" style={{ fontSize: 14, lineHeight: "23px", color: withAlpha(colors.sand, 0.65) }}>
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {project.interactions && (
          <>
            <p className="font-inclusive-sans" style={label}>interactions</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {project.interactions.map((line) => (
                <li key={line} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                  <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: project.accent, flexShrink: 0, transform: "translateY(-2px)" }} />
                  <p className="font-inclusive-sans" style={{ fontSize: 14, lineHeight: "23px", color: withAlpha(colors.sand, 0.75) }}>
                    {line}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// Wide side drawer (like the blog drawer) that either runs a project's live
// url as an iframe, or - for browser extensions - shows a download button
// and an inline "how to use" video walkthrough.
export function AiProjectDrawer({ project, onClose }: AiProjectDrawerProps) {
  const isMobile = useIsMobile(768);
  const [linkHover, setLinkHover] = useState(false);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  const isExtension = project?.kind === "extension";
  const isPlayer = project?.kind === "player";
  const isTypeface = project?.kind === "typeface";

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
              position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 600,
              width: isMobile ? "100%" : "min(1200px, calc(90vw / var(--page-zoom)))",
              borderRadius: isMobile ? 0 : "24px 0 0 24px",
              backgroundColor: colors.ink,
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
                padding: isMobile ? "12px 20px" : "12px 20px 12px 48px", // title lines up with the body copy
                flexShrink: 0,
                borderBottom: `1px solid ${withAlpha(colors.sand, 0.1)}`,
                backgroundColor: colors.ink,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <p
                    className="font-caslon not-italic"
                    style={{
                      fontSize: 24,
                      lineHeight: "30px",
                      color: colors.sand,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {project.title}
                  </p>
                  {!isTypeface && (
                    <p className="font-inclusive-sans" style={{ fontSize: 11, color: withAlpha(colors.sand, 0.45) }}>
                      {isExtension ? "chrome extension" : isPlayer ? "how it works" : "running live · fully interactive"}
                    </p>
                  )}
                </div>
              </div>

              {/* the new-tab link (web apps) and the close button sit on the right */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                {!isExtension && !isPlayer && !isTypeface && project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flexShrink: 0 }} onMouseEnter={() => setLinkHover(true)} onMouseLeave={() => setLinkHover(false)}>
                    <TextLink as="span" hovered={linkHover}>open in new tab</TextLink>
                  </a>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  style={{
                    width: isMobile ? ICON_BUTTON.mobile : ICON_BUTTON.desktop,
                    height: isMobile ? ICON_BUTTON.mobile : ICON_BUTTON.desktop,
                    borderRadius: "50%",
                    backgroundColor: withAlpha(colors.sand, 0.08),
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={15} color={colors.sand} />
                </button>
              </div>
            </div>

            {isExtension ? (
              <ExtensionBody project={project} />
            ) : isPlayer ? (
              <PlayerBody project={project} />
            ) : isTypeface ? (
              <TypefaceBody project={project} />
            ) : (
              <WebAppBody project={project} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
