import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { Check, LayoutGrid, Rows3 } from "lucide-react";
import { MadeWithLove, type PopperKind } from "@/app/components/layout/MadeWithLove";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { colors, fonts, motionTokens, textStyles, withAlpha } from "@/app/theme/tokens";
import { Bookshelf, BOOKSHELF_SIZE } from "./Bookshelf";
import { ImageGen, IMAGE_GEN_SIZE } from "./ImageGen";
import { pillStyle } from "./LabFrames";
import { Turntable, TURNTABLE_SIZE } from "./Turntable";
import { VoiceOrb, VOICE_ORB_SIZE } from "./VoiceOrb";
import "./AnimationLab.css";

// The animation lab: every experiment sits on its own coloured panel, with a quiet
// caption underneath in the portfolio's own type - Caslon title, a small number, and
// chips for what it's built with. Only the text drawn inside the experiments
// themselves (the book spines and covers) is set in Hanken Grotesk.

type View = "grid" | "list";

// Every card is the same pale sand on the sand container; the experiments bring the colour.
const CARD_BG = colors.sandLight; // #ECE6DF
const CARD_LIGHT = "rgba(255,255,255,0.5)";

// ── Shell ──────────────────────────────────────────────────────────────────────

// Lays its child out at its design size (w × h) and scales it to fit the box it's in,
// centred - so every piece keeps its proportions, type included, at any card size.
function Fit({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ s: 0, x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const W = el.offsetWidth;
      const H = el.offsetHeight;
      const s = Math.min(W / w, H / h);
      setBox({ s, x: (W - w * s) / 2, y: (H - h * s) / 2 });
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [w, h]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: w,
          height: h,
          transform: `scale(${box.s})`,
          transformOrigin: "0 0",
          visibility: box.s ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Segmented<K extends string>({
  value,
  onChange,
  items,
  dark = true,
}: {
  value: K;
  onChange: (k: K) => void;
  items: { key: K; label?: string; Icon?: typeof LayoutGrid; aria?: string }[];
  /** on a dark ground (sand chips) or a light one (ink chips) */
  dark?: boolean;
}) {
  return (
    <div role="tablist" style={{ display: "inline-flex", gap: 4 }}>
      {items.map(({ key, label, Icon, aria }) => {
        const on = value === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={on}
            aria-label={aria ?? label}
            onClick={(e) => {
              e.stopPropagation();
              onChange(key);
            }}
            className="font-inclusive-sans"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: label ? "4px 10px" : "5px 8px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              lineHeight: "14px",
              fontWeight: 400,
              color: on ? (dark ? colors.ink : colors.sand) : withAlpha(dark ? colors.sand : colors.ink, 0.7),
              background: on ? (dark ? colors.sand : colors.ink) : "transparent",
              boxShadow: on ? "none" : `inset 0 0 0 1px ${withAlpha(dark ? colors.sand : colors.ink, 0.3)}`,
              transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {Icon && <Icon size={12} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

interface Piece {
  key: string;
  title: string;
  /** which device, and where on its screen the piece lives */
  where: string;
  tools: string[];
  /** design size of the framed scene, before it's scaled into the panel */
  size: { w: number; h: number };
  render: () => ReactNode;
}

function LabCard({ piece, index, view, phone }: { piece: Piece; index: number; view: View; phone: boolean }) {
  const compact = phone && view === "grid"; // two across on a phone
  const { w, h } = piece.size;
  // the framed scene fills its panel, 40px in from every edge on desktop (2.5% on a phone)
  const inset = phone ? "2.5%" : "40px";

  // a soft light that follows the cursor across the panel (GSAP keeps it buttery)
  const panelRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = panelRef.current;
    const light = lightRef.current;
    if (!el || !light || phone) return;
    const toX = gsap.quickTo(light, "x", { duration: 0.6, ease: "power3.out" });
    const toY = gsap.quickTo(light, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const k = el.offsetWidth / r.width;
      toX((e.clientX - r.left) * k);
      toY((e.clientY - r.top) * k);
    };
    const enter = () => gsap.to(light, { opacity: 1, duration: 0.4, ease: "power2.out" });
    const leave = () => gsap.to(light, { opacity: 0, duration: 0.6, ease: "power2.out" });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(light);
    };
  }, [phone]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: motionTokens.slow, delay: (index % 3) * 0.08, ease: motionTokens.easeOut }}
      style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 16, minWidth: 0 }}
    >
      <div
        ref={panelRef}
        style={{
          position: "relative",
          // square in the grids; a touch wider in the phone's list, where panels run full width
          aspectRatio: phone && view === "list" ? "5 / 4" : "1 / 1",
          borderRadius: compact ? 12 : 16,
          overflow: "hidden",
          background: CARD_BG,
          boxShadow: `inset 0 0 0 1px ${withAlpha(colors.ink, 0.06)}`,
          isolation: "isolate",
        }}
      >
        <div
          ref={lightRef}
          aria-hidden
          style={{
            position: "absolute",
            left: -220,
            top: -220,
            width: 440,
            height: 440,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${CARD_LIGHT}, transparent)`,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "absolute", inset }}>
          <Fit w={w} h={h}>
            {piece.render()}
          </Fit>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 2 : 8, padding: "0 2px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <p
            className="font-caslon not-italic"
            style={{ fontSize: compact ? 15 : 20, lineHeight: compact ? "20px" : "26px", fontWeight: 600, color: colors.ink }}
          >
            {piece.title}
          </p>
          <span style={{ fontFamily: fonts.label, fontSize: compact ? 10 : 12, lineHeight: "16px", color: withAlpha(colors.ink, 0.4), fontVariantNumeric: "tabular-nums" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <p style={{ ...textStyles.label, fontSize: compact ? 9 : 11, lineHeight: compact ? "12px" : "14px", color: colors.orange }}>{piece.where}</p>
        {!compact && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
            {["Figma", ...piece.tools].map((tool) => (
              <span
                key={tool}
                className="font-inclusive-sans"
                style={{
                  fontSize: 11,
                  lineHeight: "12px",
                  letterSpacing: "0.3px",
                  padding: "5px 8px",
                  borderRadius: 4,
                  color: withAlpha(colors.ink, 0.65),
                  boxShadow: `inset 0 0 0 1px ${withAlpha(colors.ink, 0.14)}`,
                  whiteSpace: "nowrap",
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ── Heart popper ───────────────────────────────────────────────────────────────
// The sign-off from the side nav, with the choice of poppers underneath.

const POPPER_COLOURS = [colors.pink, colors.pinkLight, colors.orange, colors.orangeLight, colors.olive, colors.oliveLight, colors.sand];
const POPPER_OPTIONS: { key: PopperKind; label: string }[] = [
  { key: "flower", label: "Flowers" },
  { key: "heart", label: "Hearts" },
  { key: "butterfly", label: "Butterflies" },
];

const HEART_SIZE = { w: 380, h: 150 };
// the site orange (hsl 29°, 55%, 50%) turned to red: same saturation and lightness, hue 0
const HEART_RED = "hsl(0, 55%, 50%)";

function HeartPopper() {
  const [kinds, setKinds] = useState<PopperKind[]>(["flower"]);
  // more can be added; the last one can't be taken away, so the heart always has something to throw
  const toggle = (k: PopperKind) =>
    setKinds((list) => (list.includes(k) ? (list.length > 1 ? list.filter((x) => x !== k) : list) : [...list, k]));

  return (
    <div style={{ width: HEART_SIZE.w, height: HEART_SIZE.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <div style={{ whiteSpace: "nowrap" }}>
        <MadeWithLove fontSize={20} color={colors.oliveDeep} heart={HEART_RED} kinds={kinds} palette={POPPER_COLOURS} ripples="heartbeat" />
      </div>

      <div role="group" aria-label="Poppers" style={{ display: "flex", gap: 8 }}>
        {POPPER_OPTIONS.map(({ key, label }) => {
          const on = kinds.includes(key);
          return (
            <motion.button
              key={key}
              aria-pressed={on}
              onClick={() => toggle(key)}
              whileTap={{ scale: 0.95 }}
              className="font-inclusive-sans"
              style={{ ...pillStyle(on, "light"), fontSize: 13, lineHeight: "16px", padding: "7px 14px" }}
            >
              <AnimatePresence initial={false}>
                {on && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 13, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    style={{ display: "inline-flex", overflow: "hidden" }}
                  >
                    <Check size={13} strokeWidth={3.2} />
                  </motion.span>
                )}
              </AnimatePresence>
              {label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Lab ────────────────────────────────────────────────────────────────────────

const PIECES: Piece[] = [
  {
    key: "voice",
    title: "Voice orb",
    where: "Phone · voice mode",
    tools: ["Three.js", "WebGL", "Web Audio", "GSAP"],
    size: VOICE_ORB_SIZE,
    render: () => <VoiceOrb />,
  },
  {
    key: "turntable",
    title: "Record player",
    where: "Web · About page",
    tools: ["React", "GSAP", "SVG"],
    size: TURNTABLE_SIZE,
    render: () => <Turntable />,
  },
  {
    key: "bookshelf",
    title: "Bookshelf",
    where: "Web · About page",
    tools: ["React", "Motion", "CSS 3D"],
    size: BOOKSHELF_SIZE,
    render: () => <Bookshelf />,
  },
  {
    key: "heart",
    title: "Heart popper",
    where: "Web · Sign-off",
    tools: ["React", "Motion", "Web Animations"],
    size: HEART_SIZE,
    render: () => <HeartPopper />,
  },
  {
    key: "imagegen",
    title: "Image shimmer",
    where: "Web · Chat",
    tools: ["Three.js", "WebGL", "GSAP"],
    size: IMAGE_GEN_SIZE,
    render: () => <ImageGen />,
  },
];

const VIEW_KEY = "lab-view";

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function AnimationLab() {
  const phone = useIsMobile(640);
  const [picked, setPicked] = useState<View>(readView);
  // the web is always three across; on a phone it's the viewer's choice
  const view: View = phone ? picked : "grid";
  const setView = (v: View) => {
    setPicked(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // private mode / blocked storage - the choice just won't stick
    }
  };

  return (
    <div>
      <p style={{ ...textStyles.byline, fontSize: phone ? 13 : 14, color: withAlpha(colors.ink, 0.65), marginBottom: phone ? 16 : 28, padding: "0 2px" }}>
        All of these animations are interactive, so {phone ? "tap" : "hover, click"} and play around.
      </p>
      {phone && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "0 2px" }}>
          <p style={{ ...textStyles.label, color: withAlpha(colors.ink, 0.5) }}>{PIECES.length} experiments</p>
          <Segmented
            dark={false}
            value={picked}
            onChange={setView}
            items={[
              { key: "grid", Icon: LayoutGrid, aria: "Grid" },
              { key: "list", Icon: Rows3, aria: "List" },
            ]}
          />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: phone && view === "list" ? "minmax(0, 1fr)" : phone ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
          columnGap: phone ? 12 : 32,
          rowGap: phone ? (view === "grid" ? 24 : 36) : 48,
        }}
      >
        {PIECES.map((piece, i) => (
          <LabCard key={piece.key} piece={piece} index={i} view={view} phone={phone} />
        ))}
      </div>
    </div>
  );
}
