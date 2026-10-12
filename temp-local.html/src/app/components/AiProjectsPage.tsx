import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AiProject {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  status: string;
  statusColor: string;
  accent: string;
  year: string;
}

export const AI_PROJECTS: AiProject[] = [
  {
    id: 0,
    title: "Design critique assistant",
    description: "An LLM-powered tool that gives structured UX feedback on screen designs using heuristic frameworks.",
    longDescription:
      "Trained a prompt chain that walks through Nielsen's 10 heuristics and outputs a prioritised critique with severity scores. Built on GPT-4o with a vision API for reading uploaded Figma exports. The real challenge was getting the model to reason about hierarchy and visual flow, not just check checklists.",
    tags: ["GPT-4o", "Vision API", "React", "Prompt engineering"],
    status: "In use",
    statusColor: "#c3be6f",
    accent: "#c3be6f",
    year: "2024",
  },
  {
    id: 1,
    title: "User research synthesizer",
    description: "Paste in raw interview transcripts, get back themes, quotes, and a synthesis memo in seconds.",
    longDescription:
      "Built a multi-step pipeline: chunk transcripts → extract atomic observations → cluster by theme → generate synthesis. Uses embeddings for clustering so similar insights from different sessions group naturally. Cut 3-hour synthesis sessions down to 20 minutes of editing an AI draft.",
    tags: ["Embeddings", "Clustering", "Next.js", "Anthropic API"],
    status: "Shipping soon",
    statusColor: "#c67d39",
    accent: "#c67d39",
    year: "2024",
  },
  {
    id: 2,
    title: "Accessibility audit plugin",
    description: "A Figma plugin that scans selected frames for WCAG violations and suggests fixes inline.",
    longDescription:
      "Checks contrast ratios, touch target sizes, text scaling, and missing alt text markers. Added an LLM layer to explain each violation in plain English and suggest concrete fixes. The plugin writes comments directly into the Figma file so the audit becomes part of the design history.",
    tags: ["Figma API", "WCAG 2.2", "TypeScript", "Claude"],
    status: "Beta",
    statusColor: "#dda1ae",
    accent: "#dda1ae",
    year: "2023",
  },
  {
    id: 3,
    title: "Conversational UI prototyper",
    description: "Describe a conversation flow in plain text. Get back a fully interactive chat prototype.",
    longDescription:
      "Type something like 'a chatbot that helps users pick a savings plan based on their goals' and get a working prototype with branching logic, fallbacks, and persona-driven responses. Built mainly to prototype banking assistant flows before committing them to engineering sprints.",
    tags: ["LLM", "Dialogue trees", "React", "TailwindCSS"],
    status: "Exploring",
    statusColor: "#625e37",
    accent: "#625e37",
    year: "2023",
  },
  {
    id: 4,
    title: "Design token documenter",
    description: "Reads a Figma library and auto-generates a living design system documentation site.",
    longDescription:
      "Connects to the Figma REST API, pulls all published styles and components, and generates a structured doc site with usage examples and do/don't guidelines. The LLM layer writes the rationale for each token based on usage context — so the docs explain *why* the token exists, not just what value it holds.",
    tags: ["Figma REST API", "Static site gen", "LLM", "Design systems"],
    status: "Paused",
    statusColor: "rgba(227,217,206,0.4)",
    accent: "rgba(227,217,206,0.3)",
    year: "2023",
  },
  {
    id: 5,
    title: "Emotion-driven palette generator",
    description: "Describe the feeling you want a UI to evoke. Get back a full colour system with semantic tokens.",
    longDescription:
      "A curiosity project that started from noticing how hard it is to articulate why a palette feels 'right'. Feeds the emotional brief through an LLM that reasons about colour psychology, then maps to a full token structure (surface, primary, accent, semantic). The output is copy-paste-ready as CSS custom properties.",
    tags: ["Colour theory", "LLM reasoning", "CSS tokens", "Vite"],
    status: "Live",
    statusColor: "#c3be6f",
    accent: "#c3be6f",
    year: "2024",
  },
];

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: AiProject;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ backgroundColor: "rgba(227,217,206,0.1)", scale: 1.005 }}
      style={{
        borderRadius: 12,
        padding: "24px",
        cursor: "pointer",
        border: "1px solid rgba(227,217,206,0.08)",
        transition: "background 0.15s, border 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(227,217,206,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(227,217,206,0.08)";
      }}
    >
      {/* Image placeholder */}
      <div
        style={{
          height: 200,
          backgroundColor: "rgba(227,217,206,0.07)",
          borderRadius: 8,
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(227,217,206,0.06)",
        }}
      >
        <svg
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.15,
          }}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="#e3d9ce"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="#e3d9ce"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="#e3d9ce"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
          }}
        >
          <span
            className="font-jakarta font-medium"
            style={{
              fontSize: 11,
              color: project.accent,
              backgroundColor: `${project.accent}18`,
              padding: "3px 8px",
              borderRadius: 20,
              letterSpacing: "0.4px",
            }}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-jakarta"
            style={{
              fontSize: 11,
              color: "rgba(227,217,206,0.5)",
              backgroundColor: "rgba(227,217,206,0.06)",
              padding: "2px 8px",
              borderRadius: 20,
              letterSpacing: "0.3px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <p
        className="font-caslon not-italic"
        style={{
          fontSize: 22,
          lineHeight: "28px",
          color: "#e3d9ce",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {project.title}
      </p>
      <p
        className="font-jakarta"
        style={{ fontSize: 14, lineHeight: "20px", color: "rgba(227,217,206,0.6)" }}
      >
        {project.description}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
        <p
          className="font-caslon"
          style={{ fontSize: 13, color: "rgba(227,217,206,0.5)", fontStyle: "italic" }}
        >
          learn more
        </p>
        <p
          className="font-caslon"
          style={{ fontSize: 14, color: "rgba(227,217,206,0.5)", lineHeight: 1 }}
        >
          →
        </p>
      </div>
    </motion.div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: AiProject;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              zIndex: 200,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              backgroundColor: "#1a1a0f",
              borderRadius: 20,
              padding: 40,
              zIndex: 201,
              border: "1px solid rgba(227,217,206,0.12)",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "rgba(227,217,206,0.08)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#e3d9ce" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-jakarta"
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

            <p
              className="font-caslon not-italic"
              style={{ fontSize: 28, lineHeight: "36px", color: "#e3d9ce", fontWeight: 600, marginBottom: 12 }}
            >
              {project.title}
            </p>

            <div
              style={{
                height: 1,
                backgroundColor: "rgba(227,217,206,0.1)",
                marginBottom: 20,
              }}
            />

            <p
              className="font-jakarta"
              style={{ fontSize: 15, lineHeight: "26px", color: "rgba(227,217,206,0.75)" }}
            >
              {project.longDescription}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 32,
                paddingTop: 20,
                borderTop: "1px solid rgba(227,217,206,0.08)",
              }}
            >
              <span
                className="font-jakarta font-medium"
                style={{
                  fontSize: 12,
                  color: project.accent,
                  backgroundColor: `${project.accent}15`,
                  padding: "4px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.4px",
                }}
              >
                {project.status}
              </span>
              <p className="font-jakarta" style={{ fontSize: 12, color: "rgba(227,217,206,0.35)" }}>
                {project.year}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface AiProjectsPageProps {
  onBack: () => void;
}

export function AiProjectsPage({ onBack }: AiProjectsPageProps) {
  const [selectedProject, setSelectedProject] = useState<AiProject | null>(null);

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#212012",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      {/* Top nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "rgba(33,32,18,0.9)",
          backdropFilter: "blur(12px)",
          padding: "16px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(227,217,206,0.06)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "1px solid rgba(227,217,206,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            transition: "border 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(227,217,206,0.05)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(227,217,206,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(227,217,206,0.15)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="#e3d9ce" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-jakarta" style={{ fontSize: 13, color: "#e3d9ce" }}>
            back to portfolio
          </p>
        </button>

        <p
          className="font-caslon not-italic"
          style={{ fontSize: 18, color: "#e3d9ce", fontWeight: 600, opacity: 0.85 }}
        >
          Laxmi Mahajan
        </p>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: "64px 48px 48px", maxWidth: 900 }}
      >
        <p
          className="font-jakarta font-medium uppercase"
          style={{ fontSize: 12, letterSpacing: "0.48px", color: "#c3be6f", marginBottom: 16 }}
        >
          AI Experiments
        </p>
        <p
          className="font-caslon not-italic"
          style={{ fontSize: 48, lineHeight: "56px", color: "#e3d9ce", fontWeight: 600, marginBottom: 16 }}
        >
          sometimes i tinker with ai
        </p>
        <p
          className="font-jakarta"
          style={{ fontSize: 18, lineHeight: "28px", color: "rgba(227,217,206,0.6)", maxWidth: 560 }}
        >
          these are all the things i build out of sheer curiosity and cope with anxiety — mostly tools that scratch my own itches as a designer
        </p>
      </motion.div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "rgba(227,217,206,0.08)",
          margin: "0 48px 48px",
        }}
      />

      {/* Projects grid */}
      <div
        style={{
          padding: "0 48px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 1200,
        }}
      >
        {AI_PROJECTS.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="font-jakarta"
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "rgba(227,217,206,0.25)",
          marginTop: 64,
          padding: "0 48px",
        }}
      >
        more experiments living in private repos and Notion — ask me about them
      </motion.p>
    </div>
  );
}
