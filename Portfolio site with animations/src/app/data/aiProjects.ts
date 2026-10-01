
import { colors, withAlpha } from "@/app/theme/tokens";export type AiProjectKind = "webapp" | "extension";

/** Projects with hand-designed card artwork — see AiProjectFrame. */
export type AiProjectFrameKey = "piano" | "job-tracker" | "breathing";

export interface AiProject {
  id: number;
  /** Defaults to "webapp" when omitted. */
  kind?: AiProjectKind;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  status: string;
  statusColor: string;
  accent: string;
  year?: string;
  /** webapp: live, embeddable demo URL — runs inside the side drawer as an iframe. */
  url?: string;
  /** extension: link to the packaged extension file, offered as a download. */
  downloadUrl?: string;
  /** extension: YouTube embed URL for the "how to use" walkthrough. */
  videoUrl?: string;
  /** When set, the card's image area renders the matching hand-designed frame. */
  frameKey?: AiProjectFrameKey;
}

// A project is clickable/openable when it has something to actually show —
// a live url for webapps, or a download/video for extensions.
export function isOpenableAiProject(project: AiProject): boolean {
  if (project.kind === "extension") return Boolean(project.downloadUrl || project.videoUrl);
  return Boolean(project.url);
}

// Order matters: the homepage AI section features the first three *openable*
// projects (see AiPlayground.tsx), so the ones with hand-designed frames lead.
export const AI_PROJECTS: AiProject[] = [
  {
    id: 9,
    title: "Browser piano",
    description:
      "A tiny playable piano that lives in a browser tab — mouse or computer keyboard, sound on, no install.",
    longDescription:
      "A small piano you can play right in the browser — click the keys or use your computer keyboard, with a clean tactile keybed and nothing else in the way. Built on the Web Audio API on a slow afternoon because I wanted to noodle without opening a DAW. No sign-up, no tracking, just open it and play.",
    tags: ["Web Audio", "Interactive", "Web app"],
    status: "Live",
    statusColor: colors.orange,
    accent: colors.orange,
    url: "https://laxmispace.github.io/piano/",
    frameKey: "piano",
  },
  {
    id: 2,
    kind: "extension",
    title: "Job hunt tracker",
    description: "A Chrome extension for keeping track of job applications without leaving the browser.",
    longDescription:
      "A lightweight Chrome extension that helps track job applications — company, role, status, and dates — right from the browser toolbar instead of a scattered spreadsheet. Download the packaged extension below, or watch the walkthrough to see it in action.",
    tags: ["Chrome extension", "Job search", "Productivity"],
    status: "Live",
    statusColor: colors.orange,
    accent: colors.orange,
    // Served as a static file — drop the packaged extension at
    // public/downloads/job-hunt-tracker.zip (see public/downloads/README.md).
    downloadUrl: `${import.meta.env.BASE_URL}downloads/job-hunt-tracker.zip`,
    frameKey: "job-tracker",
  },
  {
    id: 0,
    title: "Breathing app for anxiety",
    description:
      "A guided breathing exercise app to help calm anxiety in the moment — open it and it just works.",
    longDescription:
      "A small web app that walks you through a paced breathing pattern with a calming visual guide. Built as a personal tool first — something to open on a hard day without having to think — then cleaned up enough to share. No sign-up, no tracking, just open it and breathe.",
    tags: ["Wellness", "Interactive", "Web app"],
    status: "Live",
    statusColor: colors.olive,
    accent: colors.olive,
    url: "https://laxmispace.github.io/breathing-app/",
    frameKey: "breathing",
  },
  {
    id: 1,
    title: "Therapy app",
    description: "A gentle, guided space to check in with yourself — built the same way the breathing app was.",
    longDescription:
      "A companion to the breathing app — a small web tool for checking in with how you're actually doing, built out of the same personal need. No sign-up, no tracking, just open it and use it.",
    tags: ["Wellness", "Interactive", "Web app"],
    status: "Live",
    statusColor: colors.pink,
    accent: colors.pink,
    url: "https://laxmispace.github.io/therapy-app-/",
  },
  {
    id: 3,
    title: "Design critique assistant",
    description: "An LLM-powered tool that gives structured UX feedback on screen designs using heuristic frameworks.",
    longDescription:
      "Trained a prompt chain that walks through Nielsen's 10 heuristics and outputs a prioritised critique with severity scores. Built on GPT-4o with a vision API for reading uploaded Figma exports. The real challenge was getting the model to reason about hierarchy and visual flow, not just check checklists.",
    tags: ["GPT-4o", "Vision API", "React", "Prompt engineering"],
    status: "In use",
    statusColor: colors.olive,
    accent: colors.olive,
    year: "2024",
  },
  {
    id: 4,
    title: "User research synthesizer",
    description: "Paste in raw interview transcripts, get back themes, quotes, and a synthesis memo in seconds.",
    longDescription:
      "Built a multi-step pipeline: chunk transcripts → extract atomic observations → cluster by theme → generate synthesis. Uses embeddings for clustering so similar insights from different sessions group naturally. Cut 3-hour synthesis sessions down to 20 minutes of editing an AI draft.",
    tags: ["Embeddings", "Clustering", "Next.js", "Anthropic API"],
    status: "Shipping soon",
    statusColor: colors.orange,
    accent: colors.orange,
    year: "2024",
  },
  {
    id: 5,
    title: "Accessibility audit plugin",
    description: "A Figma plugin that scans selected frames for WCAG violations and suggests fixes inline.",
    longDescription:
      "Checks contrast ratios, touch target sizes, text scaling, and missing alt text markers. Added an LLM layer to explain each violation in plain English and suggest concrete fixes. The plugin writes comments directly into the Figma file so the audit becomes part of the design history.",
    tags: ["Figma API", "WCAG 2.2", "TypeScript", "Claude"],
    status: "Beta",
    statusColor: colors.pink,
    accent: colors.pink,
    year: "2023",
  },
  {
    id: 6,
    title: "Conversational UI prototyper",
    description: "Describe a conversation flow in plain text. Get back a fully interactive chat prototype.",
    longDescription:
      "Type something like 'a chatbot that helps users pick a savings plan based on their goals' and get a working prototype with branching logic, fallbacks, and persona-driven responses. Built mainly to prototype banking assistant flows before committing them to engineering sprints.",
    tags: ["LLM", "Dialogue trees", "React", "TailwindCSS"],
    status: "Exploring",
    statusColor: colors.oliveDeep,
    accent: colors.oliveDeep,
    year: "2023",
  },
  {
    id: 7,
    title: "Design token documenter",
    description: "Reads a Figma library and auto-generates a living design system documentation site.",
    longDescription:
      "Connects to the Figma REST API, pulls all published styles and components, and generates a structured doc site with usage examples and do/don't guidelines. The LLM layer writes the rationale for each token based on usage context — so the docs explain *why* the token exists, not just what value it holds.",
    tags: ["Figma REST API", "Static site gen", "LLM", "Design systems"],
    status: "Paused",
    statusColor: withAlpha(colors.sand, 0.4),
    accent: withAlpha(colors.sand, 0.3),
    year: "2023",
  },
  {
    id: 8,
    title: "Emotion-driven palette generator",
    description: "Describe the feeling you want a UI to evoke. Get back a full colour system with semantic tokens.",
    longDescription:
      "A curiosity project that started from noticing how hard it is to articulate why a palette feels 'right'. Feeds the emotional brief through an LLM that reasons about colour psychology, then maps to a full token structure (surface, primary, accent, semantic). The output is copy-paste-ready as CSS custom properties.",
    tags: ["Colour theory", "LLM reasoning", "CSS tokens", "Vite"],
    status: "Live",
    statusColor: colors.olive,
    accent: colors.olive,
    year: "2024",
  },
];
