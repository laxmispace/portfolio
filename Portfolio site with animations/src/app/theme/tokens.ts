// Design tokens — the single source of truth for the portfolio's colours, type,
// spacing and radii. Components import these instead of hard-coding values, and
// the style guide page (/style-guide) renders straight from this file.
// The same colours exist as CSS variables / Tailwind colours in src/styles/theme.css.

export const colors = {
  // Text & dark surfaces
  ink: "#212012",
  body: "#444444",
  white: "#FFFFFF",

  // Brand accents (one per case study)
  olive: "#C3BE6F",
  oliveLight: "#D2CE93",
  oliveDeep: "#625E37",
  orange: "#C67D39",
  orangeLight: "#D19761",
  pink: "#DDA1AE",
  pinkLight: "#EBC7CF",
  brown: "#735933",

  // Sand surfaces, lightest → darkest
  sandLight: "#ECE6DF",
  sandPanel: "#E7DED5",
  sand: "#E3D9CE",
  sandBorder: "#DACCBE",
  sandLine: "#D1C0AE",

  // Objects (the blog diary)
  paper: "#F7F1E3",
  leather: "#4B4628",

  // Feedback
  error: "#C0392B",
} as const;

export type ColorToken = keyof typeof colors;

/** `withAlpha(colors.ink, 0.4)` → "rgba(33,32,18,0.4)" */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export const fonts = {
  serif: "'Libre Caslon Condensed', serif", // headings, titles, italic accents
  sans: "'Inclusive Sans', sans-serif", // body copy and UI
  label: "'Plus Jakarta Sans', sans-serif", // small labels, captions, numerals
  devanagari: "'Martel', serif", // Hindi words (सुकून)
  mono: "'Spline Sans Mono', monospace", // code and token names (style guide)
  hand: "'Caveat', cursive", // handwriting: the diary and post-its
} as const;

// Type scale as used across the site and the case studies: [size, line-height] in px.
export const typeScale = {
  display: { font: "serif", size: 48, lineHeight: 56, weight: 400, usage: "Section titles on desktop (select projects)" },
  headline: { font: "serif", size: 36, lineHeight: 44, weight: 600, usage: "Homepage section headings, About me" },
  caseStudyTitle: { font: "serif", size: 28, lineHeight: 36, weight: 600, usage: "Case study title in the drawer" },
  cardTitle: { font: "serif", size: 22, lineHeight: 28, weight: 600, usage: "Case study cards (mobile), sticky notes" },
  sectionHeading: { font: "serif", size: 20, lineHeight: 26, weight: 600, usage: "Case study section headings" },
  quote: { font: "serif", size: 16, lineHeight: 20, weight: 600, usage: "PM brief / pull quotes" },
  layerTitle: { font: "sans", size: 16, lineHeight: 20, weight: 600, usage: "Layer titles, sub-headings" },
  bodyLarge: { font: "sans", size: 16, lineHeight: 24, weight: 400, usage: "Long-form body (FASTag case study, blog)" },
  body: { font: "sans", size: 14, lineHeight: 20, weight: 400, usage: "Case study body copy" },
  small: { font: "sans", size: 13, lineHeight: 16, weight: 500, usage: "HMW items, descriptions" },
  tableCell: { font: "sans", size: 12, lineHeight: 20, weight: 400, usage: "Table cells, meta text" },
  label: { font: "label", size: 12, lineHeight: 16, weight: 600, usage: "Table headers, numbered badges" },
  caption: { font: "label", size: 10, lineHeight: 13, weight: 500, usage: "Image captions" },
} as const;

// Spacing scale (px). Case studies use 12 inside a section, 16 heading → content,
// 24 between groups and 52 between sections.
export const spacing = [4, 8, 12, 16, 20, 24, 32, 36, 40, 52] as const;

export const radii = {
  xs: 2, // thumbnails inside thumbnails
  sm: 4, // tabs' inner edge, small chips
  md: 5, // phone screenshots
  lg: 8, // image panels, HMW box, preview cards
  xl: 12, // tables, form fields, mobile tabs
  xxl: 16, // case study cards, dark containers
  drawer: 24, // drawers and page containers
  pill: 999,
} as const;

export const shadows = {
  card: "0 18px 40px rgba(33,32,18,0.18)",
  note: "0 1px 2px rgba(33,32,18,0.12), 0 14px 28px rgba(33,32,18,0.14)",
  sheet: "0 -8px 32px rgba(33,32,18,0.18)",
} as const;

export const motionTokens = {
  // The site's signature ease-out curve, used for nearly every transition.
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
} as const;
