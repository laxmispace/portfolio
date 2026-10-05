// /style-guide — the portfolio's design system on one page. Everything here is rendered
// from src/app/theme/tokens.ts and the real shared components, so it can't drift from
// what the site actually uses.
import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { colors, fonts, motionTokens, radii, shadows, spacing, typeScale, withAlpha, type ColorToken } from "@/app/theme/tokens";
import {
  BodyText, DataTable, ImageCarousel, IterationLabel, LayerItem, MediaCaption, MediaPanel, NumberedCallout,
  PhoneRow, PhoneScreen, PullQuote, SectionHeading, SubHeading, ThumbnailPlaceholder,
} from "@/app/components/case-study/CaseStudyPrimitives";
import { CaseStudyTab } from "@/app/components/home/ProjectsSection";
import { MadeWithLove } from "@/app/components/layout/MadeWithLove";
import { BlogFilterTabs } from "@/app/components/blog/BlogJournal";
import { BLOG_CATEGORIES, type BlogCategory } from "@/app/data/blogPosts";
import sampleScreen from "@/assets/ai-projects/breathing.png";

// ── Content ────────────────────────────────────────────────────────────────────
const COLOR_GROUPS: { title: string; note: string; tokens: { token: ColorToken; usage: string }[] }[] = [
  {
    title: "Text & dark surfaces",
    note: "Ink carries every heading and the dark containers; body grey is reserved for long-form copy.",
    tokens: [
      { token: "ink", usage: "Headings, primary text, dark containers (select projects, AI section)" },
      { token: "body", usage: "Case study body copy and table text" },
      { token: "white", usage: "Phone-screen strokes, text on orange buttons" },
    ],
  },
  {
    title: "Brand accents",
    note: "One accent per case study — olive, orange, pink — each with a light tint for its image placeholder.",
    tokens: [
      { token: "olive", usage: "Case study 1 card, About me drawer" },
      { token: "oliveLight", usage: "Case study 1 image placeholder" },
      { token: "oliveDeep", usage: "Secondary text, active nav item, meta labels" },
      { token: "orange", usage: "Primary accent: links, caption ticks, callouts, case study 2" },
      { token: "orangeLight", usage: "Case study 2 image placeholder" },
      { token: "pink", usage: "Case study 3, “new” tags, blog filter chips" },
      { token: "pinkLight", usage: "Case study 3 image placeholder, photo-strip gradient" },
      { token: "brown", usage: "Layer titles, carousel counter, bullet arrows" },
    ],
  },
  {
    title: "Sand surfaces",
    note: "The warm neutrals everything sits on, lightest to darkest.",
    tokens: [
      { token: "sandLight", usage: "App background, mobile nav band" },
      { token: "sandPanel", usage: "Image panels behind screenshots, table body" },
      { token: "sand", usage: "Page surface, table headers" },
      { token: "sandBorder", usage: "Table and panel borders" },
      { token: "sandLine", usage: "Dividers in the About me drawer" },
    ],
  },
  {
    title: "Feedback",
    note: "Used sparingly — only for things that went wrong.",
    tokens: [{ token: "error", usage: "Reserved for error states and failed loads" }],
  },
];

const INK_RAMP = [0.06, 0.1, 0.2, 0.4, 0.5, 0.6, 0.8];

const FONT_FAMILIES: { key: keyof typeof fonts; name: string; role: string; sample: string }[] = [
  { key: "serif", name: "Libre Caslon Condensed", role: "Headings, titles, italic accents", sample: "select projects" },
  { key: "sans", name: "Inclusive Sans", role: "Body copy and interface text", sample: "Why the obvious fix wasn't enough" },
  { key: "label", name: "Plus Jakarta Sans", role: "Captions, table headers, numerals", sample: "STATE 1 - HAS A CREDIT CARD" },
  { key: "devanagari", name: "Martel", role: "Hindi words inside English copy", sample: "सुकून" },
];

const CASE_STUDY_RHYTHM = [
  { gap: 16, label: "heading → content" },
  { gap: 12, label: "between blocks inside a section" },
  { gap: 24, label: "between groups (e.g. layers → summary)" },
  { gap: 52, label: "between sections" },
];

const SECTIONS = [
  { id: "colours", label: "colours" },
  { id: "typography", label: "typography" },
  { id: "spacing", label: "spacing" },
  { id: "shape", label: "radii & shadows" },
  { id: "motion", label: "motion" },
  { id: "components", label: "components" },
];

// ── Building blocks ───────────────────────────────────────────────────────────
const cssVarFor = (token: string) => `--color-${token.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}`;

function Code({ children }: { children: ReactNode }) {
  return (
    <code style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.oliveDeep, backgroundColor: withAlpha(colors.oliveDeep, 0.08), borderRadius: radii.sm, padding: "1px 5px" }}>
      {children}
    </code>
  );
}

function GuideSection({ id, index, title, intro, children }: { id: string; index: number; title: string; intro: string; children: ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: motionTokens.slow, ease: motionTokens.easeOut }}
      style={{ scrollMarginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${colors.sandLine}`, paddingTop: 24 }}>
        <p className="font-jakarta font-medium" style={{ fontSize: 11, letterSpacing: "0.08em", color: colors.orange }}>{String(index).padStart(2, "0")}</p>
        <h2 className="font-caslon not-italic" style={{ fontSize: 36, lineHeight: "44px", fontWeight: 600, color: colors.ink, margin: 0 }}>{title}</h2>
        <p className="font-inclusive-sans" style={{ fontSize: 15, lineHeight: "22px", color: colors.body, maxWidth: 620 }}>{intro}</p>
      </div>
      {children}
    </motion.section>
  );
}

function Card({ title, note, children, source }: { title?: string; note?: string; children: ReactNode; source?: string }) {
  return (
    <div style={{ backgroundColor: colors.sandLight, border: `1px solid ${colors.sandBorder}`, borderRadius: radii.xxl, padding: 20, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      {title && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p className="font-caslon not-italic" style={{ fontSize: 18, lineHeight: "22px", fontWeight: 600, color: colors.ink }}>{title}</p>
          {note && <p className="font-inclusive-sans" style={{ fontSize: 12, lineHeight: "17px", color: withAlpha(colors.ink, 0.6) }}>{note}</p>}
        </div>
      )}
      <div style={{ minWidth: 0 }}>{children}</div>
      {source && <p className="font-inclusive-sans" style={{ fontSize: 11, color: withAlpha(colors.ink, 0.45) }}>source: <Code>{source}</Code></p>}
    </div>
  );
}

function Grid({ min, children }: { min: number; children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`, gap: 16 }}>{children}</div>;
}

function Swatch({ token, usage }: { token: ColorToken; usage: string }) {
  const hex = colors[token];
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(hex).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }).catch(() => {});
  };
  return (
    <motion.button
      type="button"
      onClick={copy}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: motionTokens.easeOut }}
      title={`Copy ${hex}`}
      style={{ textAlign: "left", border: `1px solid ${colors.sandBorder}`, borderRadius: radii.xl, backgroundColor: colors.sandLight, padding: 0, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      <div style={{ height: 84, backgroundColor: hex, borderBottom: `1px solid ${withAlpha(colors.ink, 0.06)}`, position: "relative" }}>
        <span className="font-jakarta font-medium" style={{ position: "absolute", right: 10, bottom: 8, fontSize: 10, color: token === "ink" || token === "oliveDeep" || token === "brown" || token === "body" || token === "error" ? colors.white : colors.ink, opacity: copied ? 1 : 0, transition: "opacity 0.2s" }}>
          copied
        </span>
      </div>
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <p className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: colors.ink }}>{token}</p>
        <p style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.oliveDeep }}>{hex} · {cssVarFor(token)}</p>
        <p className="font-inclusive-sans" style={{ fontSize: 12, lineHeight: "16px", color: withAlpha(colors.ink, 0.6) }}>{usage}</p>
      </div>
    </motion.button>
  );
}

function EaseCurve() {
  const [x1, y1, x2, y2] = motionTokens.easeOut;
  const S = 120;
  const [played, setPlayed] = useState(0);
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <svg width={S + 16} height={S + 16} viewBox={`-8 -8 ${S + 16} ${S + 16}`} aria-label="Ease-out curve">
        <rect x={0} y={0} width={S} height={S} fill="none" stroke={colors.sandBorder} />
        <path d={`M0 ${S} C ${x1 * S} ${S - y1 * S}, ${x2 * S} ${S - y2 * S}, ${S} 0`} fill="none" stroke={colors.orange} strokeWidth={2.5} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 180 }}>
        <p className="font-inclusive-sans" style={{ fontSize: 13, lineHeight: "19px", color: colors.body }}>
          <Code>cubic-bezier(0.16, 1, 0.3, 1)</Code> — fast start, long soft landing. Used for drawers, cards, reveals and hovers.
        </p>
        <button
          type="button"
          onClick={() => setPlayed((n) => n + 1)}
          className="font-caslon"
          style={{ alignSelf: "flex-start", fontStyle: "italic", fontSize: 14, color: colors.ink, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          play it →
        </button>
        <div style={{ position: "relative", height: 28, borderRadius: radii.pill, backgroundColor: colors.sandPanel }}>
          <motion.div
            key={played}
            initial={{ left: "0%" }}
            animate={{ left: "calc(100% - 28px)" }}
            transition={{ duration: 1.1, ease: motionTokens.easeOut }}
            style={{ position: "absolute", top: 0, width: 28, height: 28, borderRadius: radii.pill, backgroundColor: colors.orange }}
          />
        </div>
      </div>
    </div>
  );
}

function FilterTabsDemo() {
  const [active, setActive] = useState<BlogCategory | null>(null);
  return <BlogFilterTabs categories={BLOG_CATEGORIES} active={active} onChange={setActive} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function StyleGuidePage({ onBack }: { onBack: () => void }) {
  const isMobile = useIsMobile();
  const pad = isMobile ? 16 : 48;

  return (
    <div className="app-shell h-screen w-screen flex" style={{ padding: 12, backgroundColor: colors.white }}>
      <div className="app-shell__panel flex-1 rounded-2xl" style={{ backgroundColor: colors.sand, overflowY: "auto" }}>
        {/* Header */}
        <header style={{ backgroundColor: colors.ink, color: colors.sand, padding: `${isMobile ? 24 : 40}px ${pad}px ${isMobile ? 28 : 44}px`, borderRadius: "0 0 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <button
            type="button"
            onClick={onBack}
            className="font-caslon"
            style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontStyle: "italic", color: colors.sand, background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <ArrowLeft size={15} /> back to portfolio
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p className="font-jakarta font-medium" style={{ fontSize: 11, letterSpacing: "0.1em", color: colors.orange }}>DESIGN SYSTEM</p>
            <h1 className="font-caslon not-italic" style={{ fontSize: isMobile ? 40 : 64, lineHeight: 1.05, fontWeight: 600, color: colors.sand, margin: 0 }}>
              the style guide
            </h1>
            <p className="font-inclusive-sans" style={{ fontSize: isMobile ? 14 : 16, lineHeight: "24px", color: withAlpha(colors.sand, 0.7), maxWidth: 640 }}>
              Every colour, type style, spacing step and component used across this portfolio and its case studies —
              pulled live from the same tokens and components the site is built with.
            </p>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className="font-inclusive-sans"
                style={{ fontSize: 12, color: colors.sand, textDecoration: "none", border: `1px solid ${withAlpha(colors.sand, 0.25)}`, borderRadius: radii.pill, padding: "5px 12px" }}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </header>

        <main style={{ padding: `${isMobile ? 32 : 48}px ${pad}px 80px`, display: "flex", flexDirection: "column", gap: isMobile ? 56 : 72, maxWidth: 1180, margin: "0 auto" }}>
          {/* 01 Colours */}
          <GuideSection id="colours" index={1} title="colours" intro="A warm, earthy palette: ink on sand, with one accent per case study. Tap any swatch to copy its hex. In code, use colors.<name> — or withAlpha(colors.<name>, opacity) for tints.">
            {COLOR_GROUPS.map((group) => (
              <div key={group.title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <p className="font-caslon not-italic" style={{ fontSize: 20, lineHeight: "26px", fontWeight: 600, color: colors.ink }}>{group.title}</p>
                  <p className="font-inclusive-sans" style={{ fontSize: 13, color: withAlpha(colors.ink, 0.6) }}>{group.note}</p>
                </div>
                <Grid min={190}>
                  {group.tokens.map((t) => <Swatch key={t.token} {...t} />)}
                </Grid>
              </div>
            ))}
            <Card title="Ink opacity ramp" note="Secondary text, borders and overlays are ink at an opacity, never a new grey." source="withAlpha(colors.ink, 0.4)">
              <div style={{ display: "flex", borderRadius: radii.lg, overflow: "hidden", border: `1px solid ${colors.sandBorder}` }}>
                {INK_RAMP.map((a) => (
                  <div key={a} style={{ flex: 1, height: 64, backgroundColor: withAlpha(colors.ink, a), display: "flex", alignItems: "flex-end", padding: 6 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 10, color: a >= 0.4 ? colors.sand : colors.ink }}>{a}</span>
                  </div>
                ))}
              </div>
            </Card>
          </GuideSection>

          {/* 02 Typography */}
          <GuideSection id="typography" index={2} title="typography" intro="A condensed serif for voice, a humanist sans for reading, and a geometric sans for tiny labels. Case studies use a compact 14/20 body; long-form writing uses 16/24.">
            <Grid min={250}>
              {FONT_FAMILIES.map((f) => (
                <Card key={f.key}>
                  <p style={{ fontFamily: fonts[f.key], fontSize: 56, lineHeight: 1, color: colors.ink, fontWeight: f.key === "serif" ? 600 : 500 }}>Aa</p>
                  <p style={{ fontFamily: fonts[f.key], fontSize: 16, lineHeight: "22px", color: colors.body, marginTop: 12 }}>{f.sample}</p>
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                    <p className="font-caslon not-italic" style={{ fontSize: 16, fontWeight: 600, color: colors.ink }}>{f.name}</p>
                    <p className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.6) }}>{f.role} · <Code>fonts.{f.key}</Code></p>
                  </div>
                </Card>
              ))}
            </Grid>
            <div style={{ border: `1px solid ${colors.sandBorder}`, borderRadius: radii.xxl, overflow: "hidden", backgroundColor: colors.sandLight }}>
              {Object.entries(typeScale).map(([name, t], i) => (
                <div key={name} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 8 : 24, alignItems: isMobile ? "flex-start" : "baseline", padding: "18px 20px", borderTop: i ? `1px solid ${colors.sandBorder}` : "none" }}>
                  <div style={{ width: isMobile ? "auto" : 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Code>typeScale.{name}</Code>
                    <p style={{ fontFamily: fonts.mono, fontSize: 11, color: withAlpha(colors.ink, 0.55), marginTop: 4 }}>{t.size}/{t.lineHeight} · {t.weight} · {t.font}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: fonts[t.font], fontSize: Math.min(t.size, isMobile ? 36 : t.size), lineHeight: `${t.lineHeight}px`, fontWeight: t.weight, color: colors.ink }}>
                      {name === "caption" ? "State 1 - Has a credit card" : "Designing backward to the screen"}
                    </p>
                    <p className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.55), marginTop: 4 }}>{t.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </GuideSection>

          {/* 03 Spacing */}
          <GuideSection id="spacing" index={3} title="spacing" intro="Everything snaps to a 4px grid. Case studies follow a fixed rhythm so every section reads the same way.">
            <Grid min={300}>
              <Card title="Scale" source="spacing">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {spacing.map((s) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: fonts.mono, fontSize: 11, width: 28, color: colors.oliveDeep }}>{s}</span>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: s * 4 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: motionTokens.easeOut }} style={{ height: 12, maxWidth: "calc(100% - 40px)", borderRadius: radii.xs, backgroundColor: colors.orange, opacity: 0.35 + s / 80 }} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Case study rhythm" note="How the gaps stack inside a case study drawer.">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {CASE_STUDY_RHYTHM.map((r) => (
                    <div key={r.label} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ height: 14, borderRadius: radii.sm, backgroundColor: withAlpha(colors.ink, 0.12) }} />
                      <div style={{ height: r.gap, display: "flex", alignItems: "center", gap: 8, borderLeft: `2px solid ${colors.orange}`, marginLeft: 8, paddingLeft: 10 }}>
                        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.orange }}>{r.gap}px</span>
                        <span className="font-inclusive-sans" style={{ fontSize: 11, color: withAlpha(colors.ink, 0.6) }}>{r.label}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 14, borderRadius: radii.sm, backgroundColor: withAlpha(colors.ink, 0.12) }} />
                </div>
              </Card>
            </Grid>
          </GuideSection>

          {/* 04 Radii & shadows */}
          <GuideSection id="shape" index={4} title="radii & shadows" intro="Soft, consistent corners — small for screenshots, larger as containers grow. Shadows are rare and always warm (ink-tinted).">
            <Grid min={130}>
              {Object.entries(radii).map(([name, r]) => (
                <div key={name} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: "100%", aspectRatio: "1", backgroundColor: colors.sandPanel, border: `1.5px solid ${colors.oliveDeep}`, borderRadius: Math.min(r, 60) }} />
                  <p style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.oliveDeep }}>radii.{name} · {r === 999 ? "pill" : `${r}px`}</p>
                </div>
              ))}
            </Grid>
            <Grid min={220}>
              {Object.entries(shadows).map(([name, s]) => (
                <div key={name} style={{ height: 110, borderRadius: radii.xl, backgroundColor: colors.sandLight, boxShadow: s, display: "flex", alignItems: "flex-end", padding: 14 }}>
                  <Code>shadows.{name}</Code>
                </div>
              ))}
            </Grid>
          </GuideSection>

          {/* 05 Motion */}
          <GuideSection id="motion" index={5} title="motion" intro="Motion explains where things come from: drawers slide in from the edge, sections rise 20px as they reveal, hovers lift cards 4–6px. Durations stay short.">
            <Grid min={320}>
              <Card title="The ease-out curve" source="motionTokens.easeOut"><EaseCurve /></Card>
              <Card title="Durations" source="motionTokens">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {([["fast", "hovers, taps, colour changes"], ["base", "expands, tab switches"], ["slow", "section reveals, drawers"]] as const).map(([k, use]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${colors.sandBorder}`, paddingBottom: 8 }}>
                      <Code>{k} · {motionTokens[k]}s</Code>
                      <span className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.6), textAlign: "right" }}>{use}</span>
                    </div>
                  ))}
                  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3, ease: motionTokens.easeOut }} className="font-inclusive-sans" style={{ marginTop: 6, padding: 14, borderRadius: radii.xl, backgroundColor: colors.olive, color: colors.ink, fontSize: 13, cursor: "default" }}>
                    hover me — this is the card lift
                  </motion.div>
                </div>
              </Card>
            </Grid>
          </GuideSection>

          {/* 06 Components */}
          <GuideSection id="components" index={6} title="components" intro="The building blocks of the case studies and homepage, rendered live. Case study content is composed only from these.">
            <Grid min={isMobile ? 280 : 340}>
              <Card title="Case study tab" note="Sits on top of each case study card; compact on mobile." source="home/ProjectsSection.tsx">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", paddingTop: 8 }}>
                  <CaseStudyTab color={colors.olive} label="CASE STUDY 1" />
                  <CaseStudyTab color={colors.orange} label="CASE STUDY 2" compact />
                </div>
                <div style={{ height: 10, backgroundColor: colors.olive, borderRadius: "0 8px 0 0", marginTop: -1, width: 180 }} />
              </Card>
              <Card title="Pull quote" note="For the brief or a single key statement." source="case-study/CaseStudyPrimitives.tsx">
                <PullQuote>Build <em>something</em> people declare once and never think about again.</PullQuote>
              </Card>
              <Card title="Numbered callout" note="How-might-we's, principles, short ordered lists." source="case-study/CaseStudyPrimitives.tsx">
                <NumberedCallout items={["Make it easy and confidence-building", "Approve genuine actions seamlessly", "Give users one clear view"]} />
              </Card>
              <Card title="Layer item" note="Emoji + brown title for layered reasoning." source="case-study/CaseStudyPrimitives.tsx">
                <LayerItem icon="📜" title="Layer 1 - Constraints">Separate switches for each channel. Enabling one doesn't enable the others.</LayerItem>
              </Card>
              <Card title="Data table" note="Two columns, numbered rows." source="case-study/CaseStudyPrimitives.tsx">
                <DataTable headers={["State", "Outcome"]} rows={[["Signed in", "Straight to the drawer"], ["Session expired", "Re-auth, then the drawer"]]} isMobile={isMobile} />
              </Card>
              <Card title="Phone panel + caption" note="Screens are 150px at design size and shrink to fit." source="case-study/CaseStudyPrimitives.tsx">
                <MediaPanel padding="16px 24px">
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 170 }}>
                    <PhoneRow gap="0"><PhoneScreen src={sampleScreen} alt="Sample screen" /></PhoneRow>
                    <MediaCaption>Caption sits under the screen</MediaCaption>
                  </div>
                </MediaPanel>
              </Card>
              <Card title="Image gallery" note="One slide at a time, counter + thumbnails." source="case-study/CaseStudyPrimitives.tsx">
                <ImageCarousel isMobile={false} slides={[{ caption: "Slide one" }, { caption: "Slide two" }, { caption: "Slide three" }]} />
              </Card>
              <Card title="Case study 2 type" note="The longer-form scale used in the FASTag case study." source="case-study/CaseStudyPrimitives.tsx">
                <div className="case-study-flow">
                  <SectionHeading>Section heading</SectionHeading>
                  <BodyText>Body text at 16/24 for longer reading.</BodyText>
                  <SubHeading>Sub-heading</SubHeading>
                  <IterationLabel>Iteration label</IterationLabel>
                </div>
              </Card>
              <Card title="Buttons & links" source="various">
                <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
                  <button type="button" className="font-inclusive-sans font-medium" style={{ height: 40, padding: "0 20px", fontSize: 14, color: colors.white, border: "none", borderRadius: radii.lg, backgroundColor: colors.orange, cursor: "pointer" }}>Primary button</button>
                  <span className="font-caslon" style={{ fontSize: 14, fontStyle: "italic", color: colors.ink }}>read case study →</span>
                </div>
              </Card>
              <Card title="Filter tabs" note="Quiet text tabs; the highlight slides and takes the category's colour." source="blog/BlogJournal.tsx">
                <FilterTabsDemo />
              </Card>
              <Card title="Image placeholder" note="Grid-paper fill used until real artwork lands." source="case-study/CaseStudyPrimitives.tsx">
                <div style={{ height: 120, borderRadius: radii.lg, overflow: "hidden" }}>
                  <ThumbnailPlaceholder bgColor={colors.pinkLight} strokeColor={colors.ink} iconSize={32} />
                </div>
              </Card>
              <Card title="Made with love" note="Footer sign-off — tap the heart." source="layout/MadeWithLove.tsx">
                <MadeWithLove fontSize={14} />
              </Card>
            </Grid>
          </GuideSection>
        </main>

        <footer style={{ padding: `24px ${pad}px 40px`, display: "flex", justifyContent: "center" }}>
          <MadeWithLove />
        </footer>
      </div>
    </div>
  );
}
