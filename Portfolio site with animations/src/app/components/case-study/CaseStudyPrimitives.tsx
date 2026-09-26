// Shared building blocks for case study pages — layout, type and image/gallery helpers.
// Kept separate from the protected content (protectedCaseStudies.tsx) so they ship in the
// public bundle while the case study text and screens stay encrypted until unlocked.
import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { colors, withAlpha } from "@/app/theme/tokens";

// ─── Spacer: exact, one-off vertical space anywhere inside .case-study-flow ──────────
// Usage: <Spacer size={24} /> between any two elements. Pick from the shared
// scale (4, 8, 12, 16, 20, 24, 40) so spacing stays consistent across case studies.
export type SpacingSize = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40;
export function Spacer({ size = 16 }: { size?: SpacingSize }) {
  return <div className="case-study-spacer" style={{ height: size, flexShrink: 0 }} aria-hidden="true" />;
}

// ─── Shared: card thumbnail placeholder ──────────────────────────────────────
export function ThumbnailPlaceholder({
  bgColor, strokeColor, height = "100%", iconSize = 40,
}: {
  bgColor: string; strokeColor: string; height?: string | number; iconSize?: number;
}) {
  return (
    <div style={{ width: "100%", height, backgroundColor: bgColor, borderRadius: 4, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: [`repeating-linear-gradient(0deg,transparent,transparent 39px,${strokeColor}18 39px,${strokeColor}18 40px)`, `repeating-linear-gradient(90deg,transparent,transparent 39px,${strokeColor}18 39px,${strokeColor}18 40px)`].join(",") }} />
      {iconSize > 0 && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" style={{ position: "relative", zIndex: 1 }}>
          <rect x="4" y="11" width="32" height="22" rx="3" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.35" />
          <circle cx="20" cy="22" r="6" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.35" />
          <path d="M14 11V10a2 2 0 012-2h8a2 2 0 012 2v1" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.35" />
          <circle cx="32" cy="15" r="1.5" fill={strokeColor} fillOpacity="0.35" />
        </svg>
      )}
    </div>
  );
}

// ─── Universal image treatment: 5px-rounded, 1px white stroke sitting outside the edge ──
// A plain `border` sits inside the box and dents the rounded clip — this draws the stroke
// as a separate absolutely-positioned sibling instead, exactly like PhoneStrip's original technique.
export function StrokedImage({
  src, alt = "", bgColor = colors.sandPanel, strokeColor = colors.orange, iconSize = 32,
  aspectRatio, height, radius = 5,
}: {
  src?: string; alt?: string; bgColor?: string; strokeColor?: string; iconSize?: number;
  aspectRatio?: string; height?: string | number; radius?: number;
}) {
  return (
    <div style={{ position: "relative", width: "100%", ...(aspectRatio ? { aspectRatio } : { height: height ?? "100%" }) }}>
      <div className="case-study-media__frame" style={{ width: "100%", height: "100%", borderRadius: radius, overflow: "hidden", backgroundColor: bgColor }}>
        {src ? (
          <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <ThumbnailPlaceholder bgColor={bgColor} strokeColor={strokeColor} height="100%" iconSize={iconSize} />
        )}
      </div>
    </div>
  );
}

// ─── SectionBlock: scroll-reveal wrapper ─────────────────────────────────────
export function SectionBlock({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div
      id={id}
      data-section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-8% 0px -5% 0px" }}
      style={{ scrollMarginTop: 88 }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ children, isMobile = false }: { children: React.ReactNode; isMobile?: boolean }) {
  return (
    <p className="font-caslon not-italic case-study-heading" style={{
      fontSize: isMobile ? 24 : 24,
      color: colors.ink, fontWeight: 600, lineHeight: "normal",
    }}>
      {children}
    </p>
  );
}

export function BodyText({ children, color = colors.body }: { children: React.ReactNode; color?: string; isMobile?: boolean }) {
  return (
    <p className="font-inclusive-sans font-normal case-study-paragraph" style={{
      fontSize: 16,
      lineHeight: "24px",
      color,
      letterSpacing: "0.15px",
    }}>
      {children}
    </p>
  );
}

export function SubHeading({ children, isMobile = false }: { children: React.ReactNode; isMobile?: boolean }) {
  return (
    <p className="font-inclusive-sans font-medium" style={{
      fontSize: isMobile ? 16 : 16,
      lineHeight: isMobile ? "24px" : "24px",
      color: "#333333",
      letterSpacing: isMobile ? "0.15px" : "0.16px",
    }}>
      {children}
    </p>
  );
}

// Carousel — one Figma-exact "Frame 1597884708" card (584×645 @ desktop) shown fully,
// the rest of the slides reduced to 60×40px (scaled down on mobile) clickable thumbnails.
interface CarouselSlide {
  src?: string;
  /** Interactive embed (e.g. a Figma prototype URL). Takes precedence over `src`
      for both the staged frame and its thumbnail — the thumbnail shows a scaled,
      non-interactive preview of the same embed. */
  embed?: string;
  /** A set of phone screens laid out side by side inside the 8:5 frame (and its thumbnail). */
  images?: string[];
  caption: string;
}

// Phone screens for a carousel slide. Scaled as one group to fit *inside* the frame on both
// axes (object-fit: contain, but for the whole set): the tallest screen never exceeds the
// frame's height and the row never exceeds its width, so nothing spills on narrow screens.
// Works the same in the staged 8:5 frame and the 80×54 thumbnail.
function CarouselPhoneSet({ images, stroke = true }: { images: string[]; stroke?: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState<Record<number, { w: number; h: number }>>({});

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inset = 0.92; // breathing room inside the frame, as a share of each axis
  const gap = box.w * 0.04;
  const sizes = images.map((_, i) => natural[i]);
  const ready = box.w > 0 && sizes.every(Boolean);
  const scale = ready
    ? Math.min(
        (box.h * inset) / Math.max(...sizes.map((n) => n!.h)),
        (box.w * inset - gap * (images.length - 1)) / sizes.reduce((sum, n) => sum + n!.w, 0),
      )
    : 0;

  return (
    <div ref={boxRef} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap, overflow: "hidden" }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            setNatural((prev) => ({ ...prev, [i]: { w, h } }));
          }}
          style={{
            display: "block", flexShrink: 0,
            width: ready ? sizes[i]!.w * scale : 0,
            height: ready ? sizes[i]!.h * scale : 0,
            opacity: ready ? 1 : 0,
            borderRadius: stroke ? 5 : 1, border: stroke ? `1px solid ${colors.white}` : "none", boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
}

export function ImageCarousel({ slides, isMobile = false, bgColor = colors.sandPanel, maxWidth }: { slides: CarouselSlide[]; isMobile?: boolean; bgColor?: string; maxWidth?: number }) {
  const [active, setActive] = useState(0);
  const current = slides[active];
  const strokeColor = colors.orange;
  const thumbW = isMobile ? 64 : 80;
  const thumbH = isMobile ? 44 : 54;

  return (
    <div className="case-study-media" style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12, width: "100%", maxWidth: isMobile ? undefined : maxWidth }}>
      {/* Full frame — the one active slide. Web: 16/12 padding, rounded 8. Mobile: edge-to-edge
          (no side padding, no rounding), just a 10px gap before the caption row. */}
      <div
        style={{
          display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center",
          padding: isMobile ? "0 0 10px" : "16px 12px",
          gap: 10,
          width: "100%",
          backgroundColor: bgColor,
          borderRadius: isMobile ? 0 : 8,
        }}
      >
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          gap: isMobile ? 10 : 16,
          width: "100%",
        }}>
          {current.embed ? (
            <div style={{ position: "relative", width: "100%", aspectRatio: "8 / 5" }}>
              <iframe
                src={current.embed}
                title={current.caption}
                allowFullScreen
                style={{
                  width: "100%", height: "100%", display: "block",
                  border: `1px solid ${strokeColor}`, borderRadius: 8, backgroundColor: bgColor,
                }}
              />
            </div>
          ) : current.images ? (
            <div style={{ width: "100%", aspectRatio: "8 / 5" }}>
              <CarouselPhoneSet key={active} images={current.images} />
            </div>
          ) : (
            <StrokedImage src={current.src} alt={current.caption} bgColor={bgColor} strokeColor={strokeColor} aspectRatio="8 / 5" radius={8} iconSize={32} />
          )}

          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: isMobile ? "0 12px" : "0 8px", gap: isMobile ? 4 : 6, width: "100%", flexShrink: 0 }}>
            <div style={{ width: isMobile ? 2 : 3, height: isMobile ? 12 : 13, borderRadius: 4, backgroundColor: strokeColor, flexShrink: 0 }} />
            <p className={isMobile ? "font-inclusive-sans font-normal" : "font-jakarta font-medium"} style={{
              flex: 1, minWidth: 0,
              fontSize: 10, lineHeight: isMobile ? "12px" : "13px", letterSpacing: "0.01em",
              color: withAlpha(colors.ink, 0.5),
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {current.caption}
            </p>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <p className={isMobile ? "font-inclusive-sans font-normal" : "font-jakarta font-medium"} style={{ fontSize: 10, lineHeight: isMobile ? "12px" : "13px", letterSpacing: "0.01em", color: colors.brown }}>
                {active + 1}
              </p>
              <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(colors.brown, 0.3) }} />
              <p className={isMobile ? "font-inclusive-sans font-normal" : "font-jakarta font-medium"} style={{ fontSize: 10, lineHeight: isMobile ? "12px" : "13px", letterSpacing: "0.01em", color: withAlpha(colors.brown, 0.5) }}>
                {slides.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails — always all N slides (N = the counter's total), active one highlighted.
          Never conditionally removed, so the row never reorders and every slide stays reachable. */}
      {slides.length > 1 && (
        <div className="case-study-thumb-row" style={{ display: "flex", flexWrap: "nowrap", gap: 12, padding: isMobile ? "0 24px" : 0, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={slide.caption}
              aria-current={i === active}
              style={{
                position: "relative", display: "block", flexShrink: 0,
                width: thumbW, height: thumbH,
                padding: 0, border: "none", background: "none", cursor: "pointer",
                borderRadius: 4, overflow: "hidden",
                opacity: i === active ? 1 : 0.55,
                transition: "opacity 0.15s ease",
              }}
            >
              {slide.embed ? (
                <div style={{
                  width: 800, height: 800 * (thumbH / thumbW),
                  transform: `scale(${thumbW / 800})`, transformOrigin: "top left",
                  pointerEvents: "none",
                }}>
                  <iframe
                    src={slide.embed}
                    title=""
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{ width: "100%", height: "100%", border: "none", display: "block", backgroundColor: bgColor }}
                  />
                </div>
              ) : slide.images ? (
                <div style={{ width: "100%", height: "100%", backgroundColor: bgColor }}>
                  <CarouselPhoneSet images={slide.images} stroke={false} />
                </div>
              ) : slide.src ? (
                <img src={slide.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <ThumbnailPlaceholder bgColor={bgColor} strokeColor={strokeColor} height="100%" iconSize={12} />
              )}
              <div style={{
                position: "absolute", inset: -1, borderRadius: 5, pointerEvents: "none",
                border: i === active ? `1.5px solid ${strokeColor}` : `1px solid ${colors.white}`,
              }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Before/after comparison panel — matches Figma "Frame 1597884703" 1:1 (584×298 @ desktop):
// a single "before" image on top (#E7DED5), two "after" images side by side below (#ECE6DF),
// each with its own caption. Percentages/aspect-ratio driven so it scales proportionally on mobile.
export function LandingComparisonPanel({
  before, beforeCaption, after, afterCaption,
}: {
  before?: string; beforeCaption: string; after: [string?, string?]; afterCaption: string;
}) {
  const strokeColor = colors.orange;
  const captionRow = (text: string) => (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "0 4px", gap: 6, width: "100%", flexShrink: 0 }}>
      <div style={{ width: 3, height: 13, borderRadius: 4, backgroundColor: strokeColor, flexShrink: 0 }} />
      <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: "13px", letterSpacing: "0.01em", color: withAlpha(colors.ink, 0.5) }}>
        {text}
      </p>
    </div>
  );

  return (
    <div className="case-study-media" style={{ display: "flex", flexDirection: "column", width: "100%", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 0", gap: 10, width: "100%", backgroundColor: colors.sandPanel }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, width: "45.72%" }}>
          <StrokedImage src={before} bgColor={colors.sandPanel} strokeColor={strokeColor} aspectRatio="267 / 80" />
          {captionRow(beforeCaption)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 0", gap: 10, width: "100%", backgroundColor: colors.sandLight }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, width: "84.93%" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 24, width: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <StrokedImage src={after[0]} bgColor={colors.sandLight} strokeColor={strokeColor} aspectRatio="236 / 80" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <StrokedImage src={after[1]} bgColor={colors.sandLight} strokeColor={strokeColor} aspectRatio="236 / 80" />
            </div>
          </div>
          {captionRow(afterCaption)}
        </div>
      </div>
    </div>
  );
}

export function IterationLabel({ children, isMobile = false }: { children: React.ReactNode; isMobile?: boolean }) {
  return (
    <p className="font-inclusive-sans font-medium case-study-subheading" style={{
      fontSize: isMobile ? 16 : 18,
      lineHeight: isMobile ? "21px" : "24px",
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      color: colors.orange,
    }}>
      {children}
    </p>
  );
}

// Iteration thumbnail row — matches Figma's "Iteration - N" pattern: a caption above a
// row of small same-height state thumbnails (not a big-image carousel like ImageCarousel).
export function IterationThumbnailRow({ caption, images, aspectRatio = "98 / 48", isMobile = false }: { caption: string; images: string[]; aspectRatio?: string; isMobile?: boolean }) {
  return (
    <div className="case-study-media" style={{
      display: "flex", flexDirection: "column", gap: 12,
      width: "100%", backgroundColor: colors.sandPanel, borderRadius: 8,
      padding: isMobile ? 12 : 16,
    }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
        <div style={{ width: 3, height: 13, borderRadius: 4, backgroundColor: colors.orange, flexShrink: 0 }} />
        <p className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: "13px", letterSpacing: "0.01em", color: withAlpha(colors.ink, 0.5) }}>
          {caption}
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {images.map((src, i) => (
          <div key={i} style={{ flex: isMobile ? "1 1 28%" : "1 1 15%", minWidth: isMobile ? 84 : 80 }}>
            <StrokedImage src={src} bgColor={colors.sandPanel} strokeColor={colors.orange} aspectRatio={aspectRatio} radius={0} />
          </div>
        ))}
      </div>
    </div>
  );
}

// State → treatment table (CS2 card exploration, iteration 3) — same visual language as JTBDTable.
interface StateTreatmentRow { state: string; treatment: string; }

export function StateTreatmentTable({ rows, isMobile = false }: { rows: StateTreatmentRow[]; isMobile?: boolean }) {
  return (
    <div className="case-study-media" style={{ display: "flex", flexDirection: "column", width: "100%", border: `1px solid ${colors.sandBorder}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, width: "100%", backgroundColor: colors.sand }}>
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, padding: isMobile ? "10px 0 10px 12px" : "10px 0 10px 16px",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: colors.body,
        }}>
          State
        </p>
        <TableColumnDivider />
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, textAlign: "left", padding: isMobile ? "10px 12px 10px 0" : "10px 16px 10px 0",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: colors.body,
        }}>
          Treatment
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", backgroundColor: colors.sandPanel, padding: isMobile ? "10px 14px" : "12px 16px", gap: 12 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", gap: 12 }}>
            <p className="font-inclusive-sans font-medium" style={{ flex: 1, fontSize: 12, lineHeight: "16px", letterSpacing: "0.25px", color: colors.body }}>
              {i + 1}. {row.state}
            </p>
            <TableColumnDivider />
            <p className="font-inclusive-sans font-normal" style={{ flex: 1, fontSize: 12, lineHeight: "20px", letterSpacing: "0.25px", color: colors.body }}>
              {row.treatment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple 2x2 image grid (CS2 recharge "the problem" — old reference flows, no per-image caption)
export function ImageGrid2x2({ images }: { images: string[] }) {
  return (
    <div className="case-study-media" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
      {images.map((src, i) => (
        <StrokedImage key={i} src={src} bgColor={colors.sandPanel} strokeColor={colors.orange} aspectRatio="270 / 169" />
      ))}
    </div>
  );
}

// Vertical divider between the JTBD/Context columns — table border colour, 1px stroke,
// stretches to the height of whichever row it sits in.
export function TableColumnDivider() {
  return <div style={{ alignSelf: "stretch", width: 1, backgroundColor: colors.sandBorder, flexShrink: 0 }} />;
}
