// "Leave a note" - a grid-paper board between two wooden rails at the end of the page.
// Visitors peel a post-it off the pad, write on it, then carry it across the board and
// stick it wherever they click. Anyone can drag the notes around afterwards. Notes never
// overlap each other or the headline, scribble and pad - a dashed outline shows where a
// note will land - and every spot is saved, so the next visitor sees the board as it was
// left. On phones the pad sits on top and the board runs down below it.
import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AnimatePresence, animate, motion, useAnimate, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity,
  type MotionValue, type Variants,
} from "motion/react";
import {
  AVATARS, cooldownRemaining, fetchNotes, isGuestbookConfigured, LIMITS, moveNote, NOTE_COLORS, postNote, validate,
  type Avatar, type DraftErrors, type GuestbookDraft, type GuestbookNote, type NoteColor,
} from "@/app/lib/guestbook";
import { haptic, softTick } from "@/app/lib/feedback";
import { colors, fonts, withAlpha } from "@/app/theme/tokens";
import woodImg from "@/assets/guestbook/wood@2x.jpg";
import woodMobileImg from "@/assets/guestbook/wood-mobile@2x.jpg";
import arrowImg from "@/assets/guestbook/arrow.svg";
import pandaImg from "@/assets/guestbook/panda.svg";
import cowImg from "@/assets/guestbook/cow.svg";
import frogImg from "@/assets/guestbook/frog.svg";
import koalaImg from "@/assets/guestbook/koala.svg";
import catImg from "@/assets/guestbook/cat.svg";
import flowerPinkImg from "@/assets/guestbook/flower-pink.svg";
import flowerOrangeImg from "@/assets/guestbook/flower-orange.svg";
import flowerGreenImg from "@/assets/guestbook/flower-green.svg";

const AVATAR_IMG: Record<Avatar, string> = { panda: pandaImg, cow: cowImg, frog: frogImg, koala: koalaImg, cat: catImg };
const FLOWER_IMG: Record<NoteColor, string> = { pink: flowerPinkImg, orange: flowerOrangeImg, green: flowerGreenImg };

// Per colour: the sheet on the pad, the form it opens into (its labels, avatar rings and
// button) and the note it becomes on the board.
const PALETTE: Record<NoteColor, { pad: string; form: string; label: string; ring: string; button: string; note: string }> = {
  orange: { pad: colors.orange, form: "#E8CBB0", label: "#B4692B", ring: "#D9A779", button: "#F0DBC6", note: "#E8CBB0" },
  pink: { pad: "#E4B4BE", form: "#E4B4BE", label: "#D07C8D", ring: "#D68F9E", button: "#EBC7CE", note: "#E4B4BE" },
  green: { pad: colors.olive, form: "#E1DEB7", label: "#8C8640", ring: "#B9B47A", button: "#ECEAD2", note: "#E1DEB7" },
};
const META = "#53502D";
const HINT = "#B6B07C";
const PAD_SHADOW = "2px 2px 4px 4px rgba(0,0,0,0.15)";
const EASE = [0.16, 1, 0.3, 1] as const;
// The grid paper, drawn as crisp 1px lines (colours sampled from the design's grid image).
const PAPER = "#F8EFE6";
const GRID_LINE = "#B3AAA1";

// ── Board geometry ────────────────────────────────────────────────────────────
// Everything lives in one coordinate space: px inside the board (the "frame"), rails
// included. The headline/pad "stage" is drawn at design size and scaled to fit.
const DESK = { rail: 48, baseH: 640, stageW: 833, stageH: 600, cell: 43 };
const MOB = { rail: 32, stageW: 358, stageIdleH: 430, freeH: 300, cell: 22 };
const NOTE_W = 240;
const NOTE_H = 154;
const GAP = 8; // breathing room kept around every note

interface Geometry {
  mobile: boolean;
  rail: number;
  baseH: number; // resting board height; grows when notes need more room
  cell: number;
  s: number; // stage scale
  stageX: number;
  stageY: number;
  k: number; // note scale
  noteW: number;
  noteH: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMaxBase: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function geometry(mobile: boolean, width: number): Geometry {
  const k = mobile ? 0.72 : width < 1100 ? 0.85 : 1;
  const noteW = NOTE_W * k;
  const noteH = NOTE_H * k;
  const rail = mobile ? MOB.rail : DESK.rail;
  const stageY = rail + 10;
  let s: number, stageX: number, baseH: number;
  if (mobile) {
    s = clamp((width - 32) / MOB.stageW, 0.8, 1.15);
    stageX = (width - MOB.stageW * s) / 2;
    baseH = stageY + MOB.stageIdleH * s + MOB.freeH + rail;
  } else {
    // fits the width, and the height left between the rails
    s = Math.min(clamp((width / 2388) * 1.35, 0.62, 1), (DESK.baseH - 2 * rail - 20) / DESK.stageH);
    stageX = width - DESK.stageW * s;
    baseH = DESK.baseH;
  }
  const xMin = 12;
  const yMin = rail + 10 + 16 * k; // headroom for a sticker poking above the note
  return {
    mobile, rail, baseH, cell: mobile ? MOB.cell : DESK.cell, s, stageX, stageY, k, noteW, noteH,
    xMin, xMax: Math.max(xMin, width - 12 - noteW), yMin, yMaxBase: Math.max(yMin, baseH - rail - 10 - noteH),
  };
}

/** stored position → top-left of the note, in board px */
function toFrame(g: Geometry, posX: number, posY: number) {
  return { x: g.xMin + posX * (g.xMax - g.xMin), y: g.yMin + posY * (g.yMaxBase - g.yMin) };
}

function fromFrame(g: Geometry, x: number, y: number) {
  const rx = g.xMax - g.xMin;
  const ry = g.yMaxBase - g.yMin;
  return { pos_x: rx ? clamp((x - g.xMin) / rx, 0, 1) : 0.5, pos_y: ry ? clamp((y - g.yMin) / ry, 0, 50) : 0 };
}

// ── Collision ─────────────────────────────────────────────────────────────────
interface Rect { l: number; t: number; r: number; b: number }
interface Point { x: number; y: number }

/** axis-aligned box around a w×h box at (x, y) turned by `deg` around its centre */
function turnedBox(x: number, y: number, w: number, h: number, deg: number): Rect {
  const a = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(a));
  const s = Math.abs(Math.sin(a));
  const bw = w * c + h * s;
  const bh = w * s + h * c;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return { l: cx - bw / 2, t: cy - bh / 2, r: cx + bw / 2, b: cy + bh / 2 };
}

function footprint(g: Geometry, x: number, y: number, tilt: number): Rect {
  const r = turnedBox(x, y, g.noteW, g.noteH, tilt);
  return { l: r.l - GAP, t: r.t - GAP - 14 * g.k, r: r.r + GAP, b: r.b + GAP };
}

const overlaps = (a: Rect, b: Rect) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

/** Nearest spot to `want` where a note fits without touching anything in `blockers`. */
function findSpot(g: Geometry, want: Point, tilt: number, blockers: Rect[], yMax: number): Point {
  const fits = (x: number, y: number) => {
    const f = footprint(g, x, y, tilt);
    return !blockers.some((b) => overlaps(f, b));
  };
  const at = (x: number, y: number) => ({ x: clamp(x, g.xMin, g.xMax), y: clamp(y, g.yMin, yMax) });
  const c = at(want.x, want.y);
  if (fits(c.x, c.y)) return c;
  // spiral outwards, ring by ring
  for (let r = 12; r <= 420; r += 12) {
    const n = Math.ceil((2 * Math.PI * r) / 14);
    let best: Point | null = null;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n;
      const p = at(c.x + r * Math.cos(a), c.y + r * Math.sin(a));
      const d = Math.hypot(p.x - c.x, p.y - c.y);
      if (d < bestD && fits(p.x, p.y)) { best = p; bestD = d; }
    }
    if (best) return best;
  }
  // nothing close by: first free spot reading down the board (it grows if it has to)
  for (let y = g.yMin; y <= g.yMin + 8000; y += g.noteH / 3) {
    for (let x = g.xMin; x <= g.xMax; x += g.noteW / 4) if (fits(x, y)) return { x, y };
  }
  return c;
}

// ── The stage: headline card, pad and form, laid out in design px ─────────────
interface Slot { x: number; y: number; r: number }
const STAGE: Record<"desktop" | "mobile", {
  padScale: number;
  card: { x: number; y: number; w: number; h: number };
  pads: Record<NoteColor, Slot>;
  tucked: [Slot, Slot];
  form: { x: number; y: number; w: number };
  hint: { x: number; y: number; r: number; size: number };
  arrow: { x: number; y: number; w: number; r: number };
}> = {
  desktop: {
    padScale: 1,
    card: { x: 266, y: 20, w: 547, h: 222 },
    pads: { orange: { x: 353, y: 241, r: 0.8 }, pink: { x: 415, y: 296, r: -8.74 }, green: { x: 513, y: 224, r: -10.06 } },
    tucked: [{ x: 377, y: 12, r: 0.8 }, { x: 537, y: 4, r: -10.06 }],
    form: { x: 359, y: 40, w: 420 },
    hint: { x: 0, y: 340, r: -11.94, size: 28 },
    arrow: { x: 126, y: 367, w: 189, r: 0 },
  },
  mobile: {
    padScale: 0.62,
    card: { x: 0, y: 0, w: 358, h: 214 },
    pads: { orange: { x: 150, y: 236, r: 0.8 }, pink: { x: 182, y: 268, r: -8.74 }, green: { x: 212, y: 226, r: -10.06 } },
    tucked: [{ x: 168, y: 2, r: 0.8 }, { x: 206, y: -4, r: -10.06 }],
    form: { x: 0, y: 30, w: 358 },
    hint: { x: 4, y: 288, r: -9, size: 24 },
    arrow: { x: 14, y: 328, w: 122, r: -6 },
  },
};
const PAD_W = 239.05;
const PAD_H = 232.25;
const ARROW_RATIO = 62.18 / 189;

/** The headline, scribble and pad, as board-px boxes notes have to stay clear of. */
function stageObstacles(g: Geometry): Rect[] {
  const L = STAGE[g.mobile ? "mobile" : "desktop"];
  const toBoard = (r: Rect): Rect => ({ l: g.stageX + r.l * g.s, t: g.stageY + r.t * g.s, r: g.stageX + r.r * g.s, b: g.stageY + r.b * g.s });
  const hintW = L.hint.size * 6;
  const pw = PAD_W * L.padScale;
  const ph = PAD_H * L.padScale;
  return [
    { l: L.card.x, t: L.card.y, r: L.card.x + L.card.w, b: L.card.y + L.card.h },
    turnedBox(L.hint.x, L.hint.y, hintW, L.hint.size * 1.4, L.hint.r),
    turnedBox(L.arrow.x, L.arrow.y, L.arrow.w, L.arrow.w * ARROW_RATIO, L.arrow.r),
    ...NOTE_COLORS.map((c) => turnedBox(L.pads[c].x, L.pads[c].y, pw, ph, L.pads[c].r)),
  ].map(toBoard);
}

// Placeholder notes from me, shown while the board is still empty.
const SEEDS: GuestbookNote[] = [
  { id: "seed-1", created_at: "", name: "Laxmi", company: "this board", role: "host", message: "Your note could be stuck right here ✨", avatar: "frog", sticker: "pink", color: "pink", pos_x: 0.02, pos_y: 0.72, tilt: -4.15 },
  { id: "seed-2", created_at: "", name: "Laxmi", company: "this board", role: "host", message: "Say hi, share feedback, or tell me what you're building 👋", avatar: null, sticker: "green", color: "orange", pos_x: 0.2, pos_y: 0.42, tilt: 0 },
  { id: "seed-3", created_at: "", name: "Laxmi", company: "this board", role: "host", message: "Recruiters, designers, curious humans - all welcome 💌", avatar: null, sticker: "orange", color: "green", pos_x: 0.38, pos_y: 0.8, tilt: 10 },
];

const emptyDraft = (color: NoteColor): GuestbookDraft => ({ name: "", company: "", role: "", message: "", avatar: null, sticker: null, color });

type Phase = "idle" | "writing" | "placing" | "sticking";
type CardState =
  | { kind: "hello" }
  | { kind: "placing" }
  | { kind: "thanks"; name: string }
  | { kind: "error"; message: string };

const CSS = `
.gb-input { background: none; border: none; outline: none; padding: 0; width: 100%; min-width: 0; font-family: ${fonts.serif}; font-weight: 500; color: ${colors.ink}; }
.gb-input::placeholder { color: ${withAlpha(colors.ink, 0.5)}; opacity: 1; }
.gb-field .gb-rule { height: 1px; background: ${withAlpha(colors.ink, 0.2)}; transition: background-color .2s; }
.gb-field:focus-within .gb-rule { background: ${withAlpha(colors.ink, 0.65)}; }
.gb-field[data-error="true"] .gb-rule { background: ${colors.error}; }
.gb-field .gb-arrow { display: inline-block; color: ${withAlpha(colors.ink, 0.5)}; transition: transform .3s cubic-bezier(.16,1,.3,1), color .2s; }
.gb-field:focus-within .gb-arrow { transform: translateX(3px); color: ${colors.ink}; }
.gb-pick:focus-visible, .gb-pad:focus-visible, .gb-btn:focus-visible, .gb-note:focus-visible { outline: 2px solid ${colors.ink}; outline-offset: 3px; }
`;

// ── Notes ─────────────────────────────────────────────────────────────────────
// Variant resolvers get the element's own `custom` - which can be missing (e.g. a
// variant propagated from a parent), so every field has a fallback.
type NoteAnim = { tilt?: number; delay?: number } | undefined;
const noteVariants: Variants = {
  hidden: (c: NoteAnim) => ({ opacity: 0, scale: 1.14, y: -16, rotate: (c?.tilt ?? 0) + 7 }),
  landing: (c: NoteAnim) => ({ opacity: 1, scale: 1.05, y: 0, rotate: c?.tilt ?? 0 }),
  shown: (c: NoteAnim) => ({
    opacity: 1, scale: 1, y: 0, rotate: c?.tilt ?? 0,
    transition: { type: "spring", stiffness: 420, damping: 24, delay: c?.delay ?? 0 },
  }),
};
const stickerVariants: Variants = {
  hidden: { scale: 0, rotate: -70 },
  landing: { scale: 0, rotate: -70 },
  shown: (c: NoteAnim) => ({ scale: 1, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 14, delay: (c?.delay ?? 0) + 0.22 } }),
};

function NoteAvatar({ note }: { note: GuestbookNote }) {
  if (note.avatar) return <img src={AVATAR_IMG[note.avatar]} alt="" width={32} height={32} draggable={false} style={{ flexShrink: 0, display: "block" }} />;
  return (
    <span
      aria-hidden="true"
      style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0, backgroundColor: colors.orange,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: fonts.serif, fontWeight: 600, fontSize: 18, color: colors.sand,
      }}
    >
      {note.name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/** The post-it itself, at design size (240×154) - zoomed down where the board is small.
 *  Three lines of the message show; opening the note shows all of it. */
function NoteCard({ note, k, expanded = false, lifted = false, wiggle = false, delay = 0 }: {
  note: GuestbookNote; k: number; expanded?: boolean; lifted?: boolean; wiggle?: boolean; delay?: number;
}) {
  const meta = [note.company, note.role].map((s) => s.trim()).filter(Boolean);
  const stickerLeft = note.tilt > 2;
  return (
    <div style={{ zoom: k, position: "relative", width: NOTE_W }}>
      <div
        style={{
          height: expanded ? "auto" : NOTE_H, minHeight: NOTE_H, padding: "32px 12px 12px", backgroundColor: PALETTE[note.color].note, borderRadius: 4,
          display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 16,
          boxShadow: lifted
            ? `0 22px 34px ${withAlpha(colors.ink, 0.26)}, 0 4px 8px ${withAlpha(colors.ink, 0.12)}`
            : `0 1px 2px ${withAlpha(colors.ink, 0.12)}, 0 4px 10px ${withAlpha(colors.ink, 0.06)}`,
          transition: "box-shadow .35s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <p
          style={{
            fontFamily: fonts.serif, fontWeight: 500, fontSize: 14, lineHeight: "18px", color: colors.ink,
            whiteSpace: "pre-wrap", overflowWrap: "anywhere",
            ...(expanded ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }),
          }}
        >
          {note.message || " "}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NoteAvatar note={note} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: fonts.serif, fontWeight: 500, fontSize: 16, lineHeight: "21px", color: colors.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {note.name || " "}
            </p>
            {meta.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                {meta.map((m, i) => (
                  <span key={i} style={{ display: "contents" }}>
                    {i > 0 && <span style={{ width: 2, height: 2, borderRadius: "50%", backgroundColor: colors.orange, flexShrink: 0 }} />}
                    <span style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: 10, lineHeight: "12px", textTransform: "uppercase", color: META, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {note.sticker && (
        <motion.div
          variants={stickerVariants}
          custom={{ delay }}
          style={{ position: "absolute", top: -24, ...(stickerLeft ? { left: -14 } : { right: -18 }), width: 50.75, height: 50.64, pointerEvents: "none" }}
        >
          <motion.img
            src={FLOWER_IMG[note.sticker]}
            alt=""
            draggable={false}
            animate={{ rotate: wiggle ? 28 : 0, scale: wiggle ? 1.12 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 9 }}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </motion.div>
      )}
    </div>
  );
}

type NoteMotion = { x: MotionValue<number>; y: MotionValue<number> };

/** A note on the board. Its position is a pair of motion values the board drives
 *  directly while it's being dragged, and springs to its resting spot otherwise. */
function PlacedNote({ note, pos, g, index, fresh, focused, dragging, interactive, register, onPress, onToggle }: {
  note: GuestbookNote; pos: Point; g: Geometry; index: number; fresh: boolean; focused: boolean; dragging: boolean;
  interactive: boolean;
  register: (id: GuestbookNote["id"], m: NoteMotion | null) => void;
  onPress: (id: GuestbookNote["id"], e: React.PointerEvent) => void;
  onToggle: () => void;
}) {
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const x = useMotionValue(pos.x);
  const y = useMotionValue(pos.y);
  const delay = fresh ? 0 : Math.min(index, 14) * 0.06;
  const onLeftHalf = pos.x < (g.xMin + g.xMax) / 2;

  useEffect(() => {
    register(note.id, { x, y });
    return () => register(note.id, null);
  }, [note.id, register, x, y]);

  useEffect(() => {
    if (dragging) return;
    if (reduce) { x.set(pos.x); y.set(pos.y); return; }
    const spring = { type: "spring" as const, stiffness: 320, damping: 26 };
    const ax = animate(x, pos.x, spring);
    const ay = animate(y, pos.y, spring);
    return () => { ax.stop(); ay.stop(); };
  }, [pos.x, pos.y, dragging, reduce, x, y]);

  const lifted = dragging || focused || hover;
  return (
    <motion.div
      data-note
      onPointerDown={interactive ? (e) => onPress(note.id, e) : undefined}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      style={{
        position: "absolute", left: 0, top: 0, x, y,
        zIndex: dragging ? 1001 : focused ? 1000 : hover ? 999 : index + 1,
        pointerEvents: interactive ? "auto" : "none",
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "pan-y", // a swipe still scrolls the page; press-and-hold picks the note up
        WebkitTouchCallout: "none",
      }}
    >
      <motion.div
        custom={{ tilt: note.tilt, delay }}
        variants={reduce ? undefined : noteVariants}
        initial={reduce ? false : fresh ? "landing" : "hidden"}
        {...(fresh ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, amount: 0.3 } })}
        style={{ rotate: note.tilt, transformOrigin: `${onLeftHalf ? "20%" : "80%"} 30%` }}
      >
        <motion.div
          className="gb-note"
          role="button"
          tabIndex={interactive ? 0 : -1}
          aria-expanded={focused}
          aria-label={`Note from ${note.name}: ${note.message}`}
          onKeyDown={(e) => { if (interactive && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onToggle(); } }}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          animate={{
            y: dragging ? -4 : focused ? -8 : hover ? -6 : 0,
            rotate: focused ? -note.tilt : dragging ? 3 : hover ? -note.tilt * 0.35 : 0,
            scale: dragging ? 1.06 : focused ? (g.mobile ? 1.45 : 1.18) : hover ? 1.03 : 1,
          }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 26 }}
          style={{ outline: "none", transformOrigin: "inherit", userSelect: "none", WebkitUserSelect: "none" }}
        >
          <NoteCard note={note} k={g.k} expanded={focused} lifted={lifted} wiggle={hover && !reduce && !dragging} delay={delay} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Dashed outline of where a note will land when it's let go. */
function LandingSpot({ g, x, y, show }: { g: Geometry; x: MotionValue<number>; y: MotionValue<number>; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute", left: 0, top: 0, x, y, width: g.noteW, height: g.noteH, zIndex: 0, borderRadius: 4,
            border: `1.5px dashed ${withAlpha(colors.ink, 0.45)}`, backgroundColor: withAlpha(colors.ink, 0.05), pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}

/** The note being carried: it trails the pointer on a spring and swings as it moves. */
function Ghost({ note, g, x, y, busy, touch, onStick, onBack }: {
  note: GuestbookNote; g: Geometry; x: MotionValue<number>; y: MotionValue<number>; busy: boolean; touch: boolean;
  onStick: () => void; onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const spring = reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 420, damping: 34, mass: 0.7 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const vx = useVelocity(sx);
  const swing = useSpring(useTransform(vx, (v) => (reduce ? 0 : clamp(v * 0.012, -14, 14))), { stiffness: 220, damping: 16 });
  const rotate = useTransform(swing, (s) => note.tilt + s);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.55 }}
      animate={{ opacity: 1, scale: busy ? 1 : 1.05 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      style={{ position: "absolute", left: 0, top: 0, x: sx, y: sy, rotate, zIndex: 90, transformOrigin: "50% 10%", pointerEvents: touch ? "auto" : "none", touchAction: "none" }}
    >
      <NoteCard note={note} k={g.k} lifted={!busy} />
      {touch && (
        <div onPointerDown={(e) => e.stopPropagation()} style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 14, display: "flex", justifyContent: "center", gap: 8 }}>
          <motion.button
            type="button"
            className="gb-btn"
            onClick={onStick}
            disabled={busy}
            whileTap={{ scale: 0.94 }}
            style={{
              border: `2px solid ${colors.ink}`, borderRadius: 32, padding: "6px 12px", whiteSpace: "nowrap",
              backgroundColor: colors.ink, color: colors.sand, boxShadow: `3px 3px 0 ${withAlpha(colors.ink, 0.3)}`,
              fontFamily: fonts.serif, fontWeight: 600, fontSize: 14, lineHeight: "18px", textTransform: "uppercase",
            }}
          >
            {busy ? "sticking…" : "stick it here ✓"}
          </motion.button>
          <motion.button
            type="button"
            className="gb-btn"
            onClick={onBack}
            disabled={busy}
            whileTap={{ scale: 0.94 }}
            aria-label="Keep editing"
            style={{
              border: `2px solid ${colors.ink}`, borderRadius: 32, width: 34, height: 34, flexShrink: 0,
              backgroundColor: colors.sand, color: colors.ink, fontSize: 14, lineHeight: 1,
            }}
          >
            ✕
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ── The form ──────────────────────────────────────────────────────────────────
function LineField({ value, onChange, placeholder, maxLength, error, size, autoComplete, inputRef }: {
  value: string; onChange: (v: string) => void; placeholder: string; maxLength: number; error?: string; size: number;
  autoComplete?: string; inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label className="gb-field" data-error={Boolean(error)} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: size, lineHeight: "18px" }}>
        <span className="gb-arrow" style={{ fontFamily: fonts.serif, fontWeight: 500 }}>→</span>
        <input
          ref={inputRef}
          className="gb-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          style={{ fontSize: size, lineHeight: "18px" }}
        />
        {error && <span style={{ fontFamily: fonts.hand, fontSize: 17, lineHeight: "18px", color: colors.error, whiteSpace: "nowrap" }}>{error}</span>}
      </span>
      <span className="gb-rule" />
    </label>
  );
}

function Composer({ draft, errors, status, mobile, shakeKey, trap, onTrap, onChange, onSubmit, onClose }: {
  draft: GuestbookDraft; errors: DraftErrors; status: string; mobile: boolean; shakeKey: number; trap: string;
  onTrap: (v: string) => void;
  onChange: (patch: Partial<GuestbookDraft>) => void; onSubmit: (e: FormEvent) => void; onClose: () => void;
}) {
  const p = PALETTE[draft.color];
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLFormElement>();
  const nameRef = useRef<HTMLInputElement>(null);
  const avatar = mobile ? { size: 52, icon: 36, gap: 10 } : { size: 64, icon: 44, gap: 16 };
  const text = mobile ? 16 : 14; // 16px keeps iOS from zooming into the field

  useEffect(() => {
    if (mobile) return;
    const t = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 380);
    return () => clearTimeout(t);
  }, [mobile]);

  useEffect(() => {
    if (shakeKey && scope.current && !reduce) animate(scope.current, { x: [0, -8, 7, -5, 3, 0] }, { duration: 0.42 });
  }, [shakeKey, animate, scope, reduce]);

  const label = (t: string) => (
    <span style={{ fontFamily: fonts.sans, fontSize: 12, lineHeight: "14px", textTransform: "uppercase", color: p.label, letterSpacing: "0.02em" }}>{t}</span>
  );

  return (
    <form ref={scope} onSubmit={onSubmit} noValidate style={{ position: "relative", padding: mobile ? "20px 16px 20px" : "24px 16px", display: "flex", flexDirection: "column", gap: 32 }}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Put the post-it back"
        className="gb-btn"
        style={{ position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: "50%", border: "none", background: "transparent", color: withAlpha(colors.ink, 0.5), fontSize: 14, cursor: "pointer" }}
      >
        ✕
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {label("pick an avatar")}
        <div role="radiogroup" aria-label="Pick an avatar" style={{ display: "flex", alignItems: "center", gap: avatar.gap }}>
          {AVATARS.map((a, i) => {
            const on = draft.avatar === a;
            return (
              <motion.button
                key={a}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={a}
                className="gb-pick"
                onClick={() => { softTick(0.035); onChange({ avatar: on ? null : a }); }}
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: on ? 1.08 : 1, opacity: 1, y: on ? -2 : 0 }}
                whileHover={reduce ? undefined : { rotate: i % 2 ? 8 : -8, y: -3 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 420, damping: 18, delay: reduce ? 0 : 0.18 + i * 0.04 }}
                style={{
                  width: avatar.size, height: avatar.size, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                  backgroundColor: colors.sand, display: "flex", alignItems: "center", justifyContent: "center",
                  border: on ? `2px solid ${colors.ink}` : `1px solid ${p.ring}`,
                  boxShadow: on ? `2px 2px 0 ${colors.ink}` : "none",
                }}
              >
                <img src={AVATAR_IMG[a]} alt="" width={avatar.icon} height={avatar.icon} style={{ display: "block", pointerEvents: "none" }} />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <LineField inputRef={nameRef} value={draft.name} onChange={(v) => onChange({ name: v })} placeholder="Your name" maxLength={LIMITS.name} error={errors.name} size={text} autoComplete="name" />
        <LineField value={draft.company} onChange={(v) => onChange({ company: v })} placeholder="Your company" maxLength={LIMITS.company} size={text} autoComplete="organization" />
        <LineField value={draft.role} onChange={(v) => onChange({ role: v })} placeholder="Your role" maxLength={LIMITS.role} size={text} autoComplete="organization-title" />
        <label className="gb-field" data-error={Boolean(errors.message)} style={{ display: "flex", gap: 8, position: "relative" }}>
          <span className="gb-arrow" style={{ fontFamily: fonts.serif, fontWeight: 500, fontSize: text, lineHeight: "18px", paddingTop: 0 }}>→</span>
          <textarea
            className="gb-input"
            value={draft.message}
            onChange={(e) => onChange({ message: e.target.value })}
            placeholder="Your advice/note..."
            maxLength={LIMITS.message}
            rows={3}
            style={{
              resize: "none", fontSize: text, lineHeight: "34px", height: 102, marginTop: -8,
              backgroundImage: `repeating-linear-gradient(180deg, transparent 0 33px, ${errors.message ? colors.error : withAlpha(colors.ink, 0.2)} 33px 34px)`,
            }}
          />
          <span style={{ position: "absolute", right: 0, top: -2, display: "flex", gap: 8, alignItems: "baseline", pointerEvents: "none" }}>
            {errors.message && <span style={{ fontFamily: fonts.hand, fontSize: 17, color: colors.error }}>{errors.message}</span>}
            {draft.message.length > LIMITS.message - 60 && (
              <span style={{ fontFamily: fonts.sans, fontSize: 10, color: withAlpha(colors.ink, 0.5) }}>{LIMITS.message - draft.message.length}</span>
            )}
          </span>
        </label>
      </div>

      {/* honeypot - hidden from people, irresistible to bots */}
      <input
        value={trap}
        onChange={(e) => onTrap(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="website"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
      />

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          {label("pick a sticker")}
          <div role="radiogroup" aria-label="Pick a sticker" style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {NOTE_COLORS.map((c) => {
              const on = draft.sticker === c;
              return (
                <motion.button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${c} flower`}
                  className="gb-pick"
                  onClick={() => { softTick(0.035); onChange({ sticker: on ? null : c }); }}
                  animate={{ scale: on ? 1.22 : 1, rotate: on ? 24 : 0, opacity: draft.sticker && !on ? 0.55 : 1 }}
                  whileHover={reduce ? undefined : { rotate: on ? 40 : 18, scale: on ? 1.28 : 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 420, damping: 12 }}
                  style={{ width: 36, height: 36, padding: 0, border: "none", background: "none", cursor: "pointer", borderRadius: "50%" }}
                >
                  <img src={FLOWER_IMG[c]} alt="" width={36} height={36} style={{ display: "block", pointerEvents: "none" }} />
                </motion.button>
              );
            })}
          </div>
        </div>
        <motion.button
          type="submit"
          className="gb-btn"
          disabled={!isGuestbookConfigured}
          initial={{ x: 0, y: 0, boxShadow: `4px 4px 0 ${colors.ink}` }}
          whileHover={isGuestbookConfigured ? { x: -1, y: -1, boxShadow: `5px 5px 0 ${colors.ink}` } : undefined}
          whileTap={isGuestbookConfigured ? { x: 3, y: 3, boxShadow: `1px 1px 0 ${colors.ink}` } : undefined}
          transition={{ duration: 0.12 }}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", flexShrink: 0,
            backgroundColor: p.button, border: `2px solid ${colors.ink}`, borderRadius: 32,
            fontFamily: fonts.serif, fontWeight: 600, fontSize: 16, lineHeight: "21px", textTransform: "uppercase", color: colors.ink,
            cursor: isGuestbookConfigured ? "pointer" : "not-allowed", opacity: isGuestbookConfigured ? 1 : 0.5,
          }}
        >
          {isGuestbookConfigured ? "post it" : "soon"} <span aria-hidden="true">→</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {(status || !isGuestbookConfigured) && (
          <motion.p
            key={status || "soon"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: -18, fontFamily: fonts.hand, fontSize: 18, lineHeight: "20px", color: status ? colors.error : withAlpha(colors.ink, 0.55), textAlign: "right" }}
          >
            {status || "the board opens for notes soon ✍️"}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

// ── Stage pieces ──────────────────────────────────────────────────────────────
function HeadlineCard({ card, mobile, minH, onBack }: { card: CardState; mobile: boolean; minH: number; onBack: () => void }) {
  const title = { fontFamily: fonts.serif, fontWeight: 400, fontSize: mobile ? 24 : 28, lineHeight: mobile ? "32px" : "36px", color: colors.sand };
  const body = { fontFamily: fonts.sans, fontWeight: 400, fontSize: mobile ? 16 : 20, lineHeight: mobile ? "24px" : "28px", color: colors.sand };
  let content: React.ReactNode;
  if (card.kind === "placing") {
    content = (
      <>
        <p style={title}>Now find it a <i>spot</i>.</p>
        <p style={body}>{mobile ? "Drag it anywhere on the board, then tap “stick it here”." : "Move it around and click anywhere on the board to stick it."}</p>
        <button type="button" className="gb-btn" onClick={onBack} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: 0, fontFamily: fonts.hand, fontSize: 20, color: HINT, cursor: "pointer" }}>
          ← keep editing
        </button>
      </>
    );
  } else if (card.kind === "thanks") {
    content = (
      <>
        <p style={title}>Stuck! Thank you, <i>{card.name}</i>.</p>
        <p style={body}>It's on the board for whoever comes by next - and it's on its way to me. I read every one.</p>
      </>
    );
  } else if (card.kind === "error") {
    content = (
      <>
        <p style={title}>Hmm, it didn't <i>stick</i>.</p>
        <p style={body}>{card.message} - {mobile ? "tap “stick it here”" : "click the board"} to try again.</p>
      </>
    );
  } else {
    content = (
      <>
        <p style={title}>You made it this far - thank you, <i>genuinely</i>!</p>
        <p style={body}>If something stuck with you, if you have thoughts, feedback, or just want to say hi - leave a note. I read every one.</p>
      </>
    );
  }
  return (
    <div aria-live="polite" style={{ backgroundColor: colors.ink, padding: mobile ? 20 : 24, minHeight: minH }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={card.kind}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Hint({ mobile }: { mobile: boolean }) {
  const L = STAGE[mobile ? "mobile" : "desktop"];
  const reduce = useReducedMotion();
  const reveal = reduce ? {} : {
    initial: { clipPath: "inset(0 100% 0 0)" },
    whileInView: { clipPath: "inset(0 0% 0 0)" },
    viewport: { once: true, amount: 0.6 },
  };
  return (
    <div aria-hidden="true">
      <motion.p
        {...reveal}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          position: "absolute", left: L.hint.x, top: L.hint.y, width: L.hint.size * 6, height: L.hint.size * 1.4, rotate: L.hint.r,
          fontFamily: fonts.hand, fontWeight: 700, fontSize: L.hint.size, lineHeight: 1.4, color: HINT, whiteSpace: "nowrap",
        }}
      >
        pick a post it
      </motion.p>
      <motion.img
        src={arrowImg}
        alt=""
        {...reveal}
        transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        style={{ position: "absolute", left: L.arrow.x, top: L.arrow.y, width: L.arrow.w, rotate: L.arrow.r }}
      />
    </div>
  );
}

function Pads({ phase, chosen, mobile, onPick }: { phase: Phase; chosen: NoteColor; mobile: boolean; onPick: (c: NoteColor) => void }) {
  const L = STAGE[mobile ? "mobile" : "desktop"];
  const reduce = useReducedMotion();
  const writing = phase === "writing";
  const others = NOTE_COLORS.filter((c) => c !== chosen);
  const w = PAD_W * L.padScale;
  const h = PAD_H * L.padScale;

  return (
    <>
      {NOTE_COLORS.map((c) => {
        if (writing && c === chosen) return null;
        const slot = writing ? L.tucked[others.indexOf(c)] : L.pads[c];
        const idle = phase === "idle";
        return (
          <motion.button
            key={c}
            type="button"
            className="gb-pad"
            aria-label={`Write on the ${c} post-it`}
            disabled={!idle}
            onClick={() => onPick(c)}
            initial={false}
            animate={{ left: slot.x, top: slot.y, rotate: slot.r, y: 0, opacity: 1 }}
            whileHover={idle && !reduce ? { y: -10, rotate: slot.r + 3, boxShadow: "4px 10px 14px 4px rgba(0,0,0,0.16)" } : undefined}
            whileTap={idle ? { scale: 0.97 } : undefined}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
            style={{
              position: "absolute", width: w, height: h, padding: 0, border: "none", borderRadius: 4,
              backgroundColor: PALETTE[c].pad, boxShadow: PAD_SHADOW, cursor: idle ? "pointer" : "default",
            }}
          />
        );
      })}
    </>
  );
}

// ── The board ─────────────────────────────────────────────────────────────────
// The wood is used at its own proportions and tiled sideways - never stretched.
function Rail({ edge, h, mobile }: { edge: "top" | "bottom"; h: number; mobile: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", left: 0, right: 0, height: h, zIndex: 50, ...(edge === "top" ? { top: 0 } : { bottom: 0 }),
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.5) 0, rgba(0,0,0,0) 11px, rgba(0,0,0,0) calc(100% - 11px), rgba(0,0,0,0.5) 100%), url(${mobile ? woodMobileImg : woodImg})`,
        backgroundSize: `100% 100%, auto ${h}px`,
        backgroundRepeat: "no-repeat, repeat-x",
        boxShadow: edge === "top" ? "0 3px 6px rgba(33,32,18,0.22)" : "0 -3px 6px rgba(33,32,18,0.18)",
        pointerEvents: "none",
      }}
    />
  );
}

/** The stage drawn at design size, scaled into place on the board. */
function StageLayer({ g, h, z, children, layerRef }: { g: Geometry; h: number; z: number; children: ReactNode; layerRef?: React.Ref<HTMLDivElement> }) {
  const w = g.mobile ? MOB.stageW : DESK.stageW;
  return (
    <div ref={layerRef} style={{ position: "absolute", left: g.stageX, top: g.stageY, width: w * g.s, height: h * g.s, zIndex: z, scrollMarginTop: 24 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${g.s})`, transformOrigin: "0 0" }}>
        {children}
      </div>
    </div>
  );
}

/** The element that scrolls the page (the app's scroller, not the window). */
function scrollParent(el: HTMLElement | null): HTMLElement {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

// If the board ever breaks, it disappears on its own instead of taking the page down.
class BoardBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error("Guestbook board crashed:", error); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function GuestbookSection({ isMobile }: { isMobile: boolean }) {
  return (
    <BoardBoundary>
      <GuestbookBoard isMobile={isMobile} />
    </BoardBoundary>
  );
}

type NoteId = GuestbookNote["id"];
interface Press {
  id: NoteId; pointerId: number; tilt: number; touch: boolean; active: boolean; timer: number;
  sx: number; sy: number; cx: number; cy: number; grabX: number; grabY: number;
}

function GuestbookBoard({ isMobile }: { isMobile: boolean }) {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  const [notes, setNotes] = useState<GuestbookNote[]>([]);
  const [loading, setLoading] = useState(isGuestbookConfigured);
  const [phase, setPhase] = useState<Phase>("idle");
  const [draft, setDraft] = useState<GuestbookDraft>(emptyDraft("pink"));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [status, setStatus] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [trap, setTrap] = useState(""); // honeypot
  const [card, setCard] = useState<CardState>({ kind: "hello" });
  const [freshId, setFreshId] = useState<NoteId | null>(null);
  const [focusId, setFocusId] = useState<NoteId | null>(null);
  const [draggingId, setDraggingId] = useState<NoteId | null>(null);
  const [moved, setMoved] = useState<Map<NoteId, { pos_x: number; pos_y: number }>>(() => new Map());
  const [landing, setLanding] = useState(false);
  const [tilt, setTilt] = useState(0);
  const [formH, setFormH] = useState(0);
  const [touchInput, setTouchInput] = useState(isMobile); // last input was a finger, not a mouse

  const gx = useMotionValue(0); // the carried note
  const gy = useMotionValue(0);
  const landX = useMotionValue(0); // where a let-go note will land
  const landY = useMotionValue(0);

  const g = useMemo(() => geometry(isMobile, width || (isMobile ? 375 : 1200)), [isMobile, width]);
  const L = STAGE[isMobile ? "mobile" : "desktop"];
  const obstacles = useMemo(() => stageObstacles(g), [g]);
  const shown = useMemo(() => (notes.length ? notes : loading ? [] : SEEDS), [notes, loading]);

  // Settle every note into the nearest free spot to where it was left, oldest first, so
  // nothing overlaps whatever the screen size (and the board grows if it runs out of room).
  const layout = useMemo(() => {
    const spots = new Map<NoteId, Point>();
    const rects = new Map<NoteId, Rect>();
    const blockers = [...obstacles];
    let bottom = 0;
    for (const n of shown) {
      const o = moved.get(n.id) ?? n;
      const p = findSpot(g, toFrame(g, o.pos_x, o.pos_y), n.tilt, blockers, Infinity);
      const f = footprint(g, p.x, p.y, n.tilt);
      spots.set(n.id, p);
      rects.set(n.id, f);
      blockers.push(f);
      bottom = Math.max(bottom, p.y + g.noteH);
    }
    return { spots, rects, bottom };
  }, [shown, moved, g, obstacles]);

  const placing = phase === "placing" || phase === "sticking";
  // While carrying a note onto a full board, open up a fresh strip at the bottom.
  const boardFull = useMemo(() => {
    if (!placing) return false;
    const yl = g.baseH - g.rail - 10 - g.noteH;
    const blockers = [...obstacles, ...layout.rects.values()];
    const p = findSpot(g, { x: g.xMin, y: g.yMin }, 0, blockers, yl);
    return p.y > yl || blockers.some((b) => overlaps(footprint(g, p.x, p.y, 0), b));
  }, [placing, g, obstacles, layout]);
  let frameH = Math.max(g.baseH, layout.bottom + 10 + g.rail);
  if (placing && boardFull) frameH = Math.max(frameH, layout.bottom + g.noteH + 40 + g.rail);
  const stageH = isMobile ? (phase === "writing" ? Math.max(MOB.stageIdleH, L.form.y + formH + 24) : MOB.stageIdleH) : DESK.stageH;
  if (isMobile && phase === "writing") frameH = Math.max(frameH, g.stageY + stageH * g.s + 10 + g.rail);
  const yLimit = Math.max(g.yMin, frameH - g.rail - 10 - g.noteH);

  // Latest values for the pointer handlers, which are created once.
  const live = useRef({ g, layout, obstacles, yLimit, tilt, shown, phase });
  live.current = { g, layout, obstacles, yLimit, tilt, shown, phase };

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    setWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isGuestbookConfigured) return;
    fetchNotes().then(setNotes).catch(() => setNotes([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (card.kind !== "thanks") return;
    const t = setTimeout(() => setCard({ kind: "hello" }), 6000);
    return () => clearTimeout(t);
  }, [card]);

  // The form's height decides how tall the phone stage grows while writing.
  const formObserver = useRef<ResizeObserver | null>(null);
  const formCallbackRef = useCallback((el: HTMLDivElement | null) => {
    formRef.current = el;
    formObserver.current?.disconnect();
    formObserver.current = null;
    if (!el) return;
    formObserver.current = new ResizeObserver(() => setFormH(el.offsetHeight));
    formObserver.current.observe(el);
  }, []);

  // ── Pointer plumbing (made once; reads `live`) ──────────────────────────────
  const motions = useRef(new Map<NoteId, NoteMotion>());
  const press = useRef<Press | null>(null);
  const carrying = useRef<number | null>(null); // pointer id dragging the carried note (touch)
  const pointer = useRef<Point | null>(null); // last mouse position
  const landingOn = useRef(false);
  const edge = useRef<{ x: number; y: number; onScroll: () => void } | null>(null);
  const edgeFrame = useRef(0);

  const ctl = useMemo(() => {
    const local = (cx: number, cy: number) => {
      const r = frameRef.current!.getBoundingClientRect();
      return { x: cx - r.left, y: cy - r.top };
    };
    const blockersExcept = (id: NoteId | null) => {
      const { obstacles, layout } = live.current;
      const out = [...obstacles];
      layout.rects.forEach((r, k) => { if (k !== id) out.push(r); });
      return out;
    };
    const showLanding = (x: number, y: number, t: number, id: NoteId | null) => {
      const { g, yLimit } = live.current;
      const spot = findSpot(g, { x, y }, t, blockersExcept(id), yLimit);
      landX.set(spot.x);
      landY.set(spot.y);
      const off = Math.hypot(spot.x - x, spot.y - y) > 6;
      if (off !== landingOn.current) { landingOn.current = off; setLanding(off); }
      return spot;
    };
    const hideLanding = () => { landingOn.current = false; setLanding(false); };

    // Dragging near the top/bottom of the screen scrolls the page along with it.
    const beginEdge = (x: number, y: number, onScroll: () => void) => {
      edge.current = { x, y, onScroll };
      if (edgeFrame.current) return;
      const sc = scrollParent(frameRef.current);
      const tick = () => {
        const e = edge.current;
        if (!e) { edgeFrame.current = 0; return; }
        const zone = 80;
        const bottom = window.innerHeight - (window.innerWidth <= 768 ? 90 : 0);
        const v = e.y < zone ? -((zone - e.y) / zone) * 16 : e.y > bottom - zone ? ((e.y - (bottom - zone)) / zone) * 16 : 0;
        if (v) {
          const before = sc.scrollTop;
          sc.scrollTop += v;
          if (sc.scrollTop !== before) e.onScroll();
        }
        edgeFrame.current = requestAnimationFrame(tick);
      };
      edgeFrame.current = requestAnimationFrame(tick);
    };
    const updateEdge = (x: number, y: number) => { if (edge.current) { edge.current.x = x; edge.current.y = y; } };
    const endEdge = () => { edge.current = null; };

    // the carried note: a mouse holds it by its top edge; a finger holds it from below
    const carryTo = (cx: number, cy: number, touch: boolean) => {
      if (!frameRef.current) return;
      const { g, yLimit, tilt } = live.current;
      const p = local(cx, cy);
      const x = clamp(p.x - g.noteW / 2, g.xMin, g.xMax);
      const y = clamp(touch ? p.y - g.noteH - 20 : p.y - 16, g.yMin, yLimit);
      gx.set(x);
      gy.set(y);
      showLanding(x, y, tilt, null);
    };
    const nudgeCarried = (dx: number, dy: number) => {
      const { g, yLimit, tilt } = live.current;
      const x = clamp(gx.get() + dx, g.xMin, g.xMax);
      const y = clamp(gy.get() + dy, g.yMin, yLimit);
      gx.set(x);
      gy.set(y);
      showLanding(x, y, tilt, null);
    };
    const settleCarried = () => {
      const { g, yLimit, tilt } = live.current;
      const spot = findSpot(g, { x: gx.get(), y: gy.get() }, tilt, blockersExcept(null), yLimit);
      gx.set(spot.x);
      gy.set(spot.y);
      hideLanding();
      return spot;
    };

    // notes already on the board
    const moveHeld = () => {
      const p = press.current;
      const m = p && motions.current.get(p.id);
      if (!p || !m || !frameRef.current) return;
      const { g, yLimit } = live.current;
      const at = local(p.cx, p.cy);
      const x = clamp(at.x - p.grabX, g.xMin, g.xMax);
      const y = clamp(at.y - p.grabY, g.yMin, yLimit);
      m.x.set(x);
      m.y.set(y);
      showLanding(x, y, p.tilt, p.id);
    };
    const activate = () => {
      const p = press.current;
      if (!p || p.active) return;
      p.active = true;
      setDraggingId(p.id);
      setFocusId(null);
      haptic(10);
      softTick(0.035);
      beginEdge(p.cx, p.cy, moveHeld);
    };
    const release = () => {
      const p = press.current;
      if (p) clearTimeout(p.timer);
      press.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      endEdge();
    };
    const drop = (p: Press) => {
      const m = motions.current.get(p.id);
      const { g, yLimit } = live.current;
      if (m) {
        const spot = findSpot(g, { x: m.x.get(), y: m.y.get() }, p.tilt, blockersExcept(p.id), yLimit);
        const pos = fromFrame(g, spot.x, spot.y);
        setMoved((prev) => new Map(prev).set(p.id, pos));
        moveNote(p.id, pos).catch(() => { /* stays moved for this visit */ });
      }
      setDraggingId(null);
      hideLanding();
      softTick(0.05);
      haptic(8);
    };
    function onMove(e: PointerEvent) {
      const p = press.current;
      if (!p || e.pointerId !== p.pointerId) return;
      p.cx = e.clientX;
      p.cy = e.clientY;
      const d = Math.hypot(p.cx - p.sx, p.cy - p.sy);
      if (!p.active) {
        if (!p.touch && d > 4) activate();
        else if (p.touch && d > 10) { release(); return; } // it's a scroll, not a pick-up
      }
      if (p.active) { moveHeld(); updateEdge(p.cx, p.cy); }
    }
    function onUp(e: PointerEvent) {
      const p = press.current;
      if (!p || e.pointerId !== p.pointerId) return;
      const tap = !p.active && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < 6;
      release();
      if (p.active) drop(p);
      else if (tap) setFocusId((f) => (f === p.id ? null : p.id));
    }
    function onCancel(e: PointerEvent) {
      const p = press.current;
      if (!p || e.pointerId !== p.pointerId) return;
      release();
      if (p.active) drop(p);
    }
    const pressNote = (id: NoteId, e: React.PointerEvent) => {
      if (press.current || (e.pointerType === "mouse" && e.button !== 0)) return;
      const m = motions.current.get(id);
      if (!m || !frameRef.current) return;
      if (e.pointerType === "mouse") e.preventDefault(); // no text selection while dragging
      const at = local(e.clientX, e.clientY);
      const note = live.current.shown.find((n) => n.id === id);
      const p: Press = {
        id, pointerId: e.pointerId, tilt: note?.tilt ?? 0, touch: e.pointerType !== "mouse", active: false, timer: 0,
        sx: e.clientX, sy: e.clientY, cx: e.clientX, cy: e.clientY, grabX: at.x - m.x.get(), grabY: at.y - m.y.get(),
      };
      // a finger has to rest on a note for a moment to pick it up, so swiping still scrolls
      if (p.touch) p.timer = window.setTimeout(activate, 260);
      press.current = p;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    };

    return { local, carryTo, nudgeCarried, settleCarried, showLanding, hideLanding, beginEdge, updateEdge, endEdge, pressNote, release };
  }, [gx, gy, landX, landY]);

  useEffect(() => () => { ctl.release(); cancelAnimationFrame(edgeFrame.current); }, [ctl]);

  const register = useCallback((id: NoteId, m: NoteMotion | null) => {
    if (m) motions.current.set(id, m);
    else motions.current.delete(id);
  }, []);

  // A held note or carried note must not scroll the page on touch screens.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => { if (press.current?.active || carrying.current !== null) e.preventDefault(); };
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  // Track the mouse while writing/carrying, and carry the note with it.
  useEffect(() => {
    if (phase !== "writing" && phase !== "placing") return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current = { x: e.clientX, y: e.clientY };
      if (phase === "placing") ctl.carryTo(e.clientX, e.clientY, false);
    };
    // the page scrolls under a still mouse - keep the note under it
    const onScroll = () => { if (phase === "placing" && !isMobile && pointer.current) ctl.carryTo(pointer.current.x, pointer.current.y, false); };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("scroll", onScroll, true);
    return () => { window.removeEventListener("pointermove", onMove); document.removeEventListener("scroll", onScroll, true); };
  }, [phase, isMobile, ctl]);

  const pick = (color: NoteColor) => {
    softTick(0.05);
    haptic(8);
    setDraft((d) => ({ ...d, color }));
    setStatus("");
    setFocusId(null);
    setPhase("writing");
  };

  const closeForm = () => setPhase("idle");

  const backToWriting = () => {
    carrying.current = null;
    ctl.endEdge();
    ctl.hideLanding();
    setPhase("writing");
    setCard({ kind: "hello" });
    if (isMobile) stageRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isGuestbookConfigured) return;
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length) { setShakeKey((k) => k + 1); return; }
    if (trap) { setPhase("idle"); setCard({ kind: "thanks", name: draft.name.trim() }); return; }
    const wait = cooldownRemaining();
    if (wait) { setStatus(`give it ${Math.ceil(wait / 1000)}s before sticking another one`); return; }

    // Tear the note off the form, then let it fly to the pointer (or the board, on a phone).
    const frame = frameRef.current;
    const form = formRef.current;
    if (frame && form) {
      const fr = form.getBoundingClientRect();
      const at = ctl.local(fr.left + fr.width / 2, fr.top + fr.height / 2);
      gx.set(at.x - g.noteW / 2);
      gy.set(at.y - g.noteH / 2);
    }
    const newTilt = Math.round((Math.random() * 14 - 7) * 100) / 100;
    setTilt(newTilt);
    live.current.tilt = newTilt;
    setStatus("");
    setPhase("placing");
    setCard({ kind: "placing" });
    softTick(0.04);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (isMobile) {
        // drop it into the open board just under the pad, and bring that into view
        const want = { x: (g.xMin + g.xMax) / 2, y: g.stageY + MOB.stageIdleH * g.s + 10 };
        const spot = ctl.showLanding(want.x, want.y, newTilt, null);
        gx.set(spot.x);
        gy.set(spot.y);
        ctl.hideLanding();
        const sc = scrollParent(frameRef.current);
        const r = frameRef.current?.getBoundingClientRect();
        if (r) sc.scrollBy({ top: r.top + spot.y - window.innerHeight * 0.3, behavior: reduce ? "auto" : "smooth" });
      } else if (pointer.current) {
        ctl.carryTo(pointer.current.x, pointer.current.y, false);
      }
    }));
  };

  const stick = async () => {
    if (live.current.phase !== "placing") return;
    carrying.current = null;
    ctl.endEdge();
    const spot = ctl.settleCarried();
    const placement = { ...fromFrame(g, spot.x, spot.y), tilt };
    setPhase("sticking");
    softTick(0.07);
    haptic(14);
    try {
      const note = await postNote(draft, placement);
      setFreshId(note.id);
      setNotes((all) => [...all, note]);
      setCard({ kind: "thanks", name: note.name });
      setDraft(emptyDraft(draft.color));
      setErrors({});
      setPhase("idle");
    } catch (err) {
      setCard({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong" });
      setPhase("placing");
    }
  };

  // Keyboard: Esc steps back; while carrying, arrows nudge the note and Enter sticks it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phase === "writing") closeForm();
        else if (phase === "placing") backToWriting();
        else if (focusId !== null) setFocusId(null);
        return;
      }
      if (phase !== "placing") return;
      const step = e.shiftKey ? 48 : 16;
      const nudges: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const d = nudges[e.key];
      if (d) {
        e.preventDefault();
        ctl.nudgeCarried(d[0], d[1]);
      } else if (e.key === "Enter") {
        e.preventDefault();
        stick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onFrameClick = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (target.closest("button, a, input, textarea, [data-gb-card]")) return;
    if (phase === "placing" && !touchInput) { stick(); return; }
    if (phase === "idle" && !target.closest("[data-note]")) setFocusId(null);
  };

  // On a phone, the carried note goes wherever a finger presses and drags on the board.
  const onFramePointerDown = (e: React.PointerEvent) => {
    if (phase !== "placing" || e.pointerType === "mouse" || (e.target as Element).closest("button")) return;
    carrying.current = e.pointerId;
    ctl.carryTo(e.clientX, e.clientY, true);
    ctl.beginEdge(e.clientX, e.clientY, () => { if (edge.current) ctl.carryTo(edge.current.x, edge.current.y, true); });
  };
  const onFramePointerMove = (e: React.PointerEvent) => {
    if (carrying.current !== e.pointerId) return;
    ctl.carryTo(e.clientX, e.clientY, true);
    ctl.updateEdge(e.clientX, e.clientY);
  };
  const endCarry = (e: React.PointerEvent) => {
    if (carrying.current !== e.pointerId) return;
    carrying.current = null;
    ctl.endEdge();
  };

  const ghostNote: GuestbookNote = {
    ...draft, id: "ghost", created_at: "", pos_x: 0, pos_y: 0, tilt,
    name: draft.name.trim(), company: draft.company.trim(), role: draft.role.trim(), message: draft.message.trim(),
  };

  const stage = (
    <>
      {isMobile && <Hint mobile />}
      <AnimatePresence>
        {phase !== "writing" && (
          <motion.div
            key="card"
            data-gb-card
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ position: "absolute", left: L.card.x, top: L.card.y, width: L.card.w }}
          >
            <HeadlineCard card={card} mobile={isMobile} minH={L.card.h} onBack={backToWriting} />
          </motion.div>
        )}
      </AnimatePresence>
      <Pads phase={phase} chosen={draft.color} mobile={isMobile} onPick={pick} />
      <AnimatePresence>
        {phase === "writing" && (
          <motion.div
            key="form"
            ref={formCallbackRef}
            initial={{ left: L.pads[draft.color].x, top: L.pads[draft.color].y, width: PAD_W * L.padScale, height: PAD_H * L.padScale, rotate: L.pads[draft.color].r, backgroundColor: PALETTE[draft.color].pad }}
            animate={{ left: L.form.x, top: L.form.y, width: L.form.w, height: "auto", rotate: 0, backgroundColor: PALETTE[draft.color].form }}
            exit={{ left: L.pads[draft.color].x, top: L.pads[draft.color].y, width: PAD_W * L.padScale, height: PAD_H * L.padScale, rotate: L.pads[draft.color].r, backgroundColor: PALETTE[draft.color].pad, transition: { duration: reduce ? 0 : 0.35, ease: EASE } }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 26 }}
            style={{ position: "absolute", overflow: "hidden", borderRadius: 4, boxShadow: PAD_SHADOW, zIndex: 5 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.22, duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              style={{ width: L.form.w }}
            >
              <Composer
                draft={draft}
                errors={errors}
                status={status}
                mobile={isMobile}
                shakeKey={shakeKey}
                trap={trap}
                onTrap={setTrap}
                onChange={(patch) => {
                  setDraft((d) => ({ ...d, ...patch }));
                  setErrors((er) => {
                    const next = { ...er };
                    for (const key of Object.keys(patch) as (keyof GuestbookDraft)[]) delete next[key];
                    return next;
                  });
                  if (status) setStatus("");
                }}
                onSubmit={submit}
                onClose={closeForm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <section aria-label="Leave me a note" style={{ padding: isMobile ? "16px 0 0" : "24px 0 0" }}>
      <style>{CSS}</style>
      <motion.div
        ref={frameRef}
        onClick={onFrameClick}
        onPointerDownCapture={(e) => { const t = e.pointerType !== "mouse"; if (t !== touchInput) setTouchInput(t); }}
        onPointerDown={onFramePointerDown}
        onPointerMove={onFramePointerMove}
        onPointerUp={endCarry}
        onPointerCancel={endCarry}
        initial={false}
        animate={{ height: frameH }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 30 }}
        style={{
          position: "relative", overflow: "hidden", isolation: "isolate",
          backgroundColor: PAPER,
          backgroundImage: `linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px), linear-gradient(180deg, ${GRID_LINE} 1px, transparent 1px)`,
          backgroundSize: `${g.cell}px ${g.cell}px`,
          backgroundPosition: `0 ${g.rail}px`,
          cursor: placing && !touchInput ? "grabbing" : undefined,
          userSelect: placing || draggingId !== null ? "none" : undefined,
          touchAction: placing && touchInput ? "none" : undefined,
        }}
      >
        <Rail edge="top" h={g.rail} mobile={isMobile} />
        <Rail edge="bottom" h={g.rail} mobile={isMobile} />

        {width > 0 && (
          <>
            {/* desktop: the "pick a post it" scribble sits under everything else */}
            {!isMobile && <StageLayer g={g} h={DESK.stageH} z={1}><Hint mobile={false} /></StageLayer>}
            <StageLayer g={g} h={stageH} z={phase === "writing" ? 80 : 40} layerRef={stageRef}>{stage}</StageLayer>

            {/* notes sit above the rails and the stage */}
            <div style={{ position: "absolute", inset: 0, zIndex: 60, pointerEvents: "none" }}>
              <LandingSpot g={g} x={landX} y={landY} show={landing} />
              {loading && (
                <p style={{ position: "absolute", left: g.xMin, top: g.yMin + 8, fontFamily: fonts.hand, fontSize: 20, color: withAlpha(colors.ink, 0.45) }}>
                  peeling notes off the board…
                </p>
              )}
              {shown.map((note, i) => (
                <PlacedNote
                  key={note.id}
                  note={note}
                  pos={layout.spots.get(note.id) ?? { x: g.xMin, y: g.yMin }}
                  g={g}
                  index={i}
                  fresh={note.id === freshId}
                  focused={note.id === focusId}
                  dragging={note.id === draggingId}
                  interactive={!placing && phase !== "writing"}
                  register={register}
                  onPress={ctl.pressNote}
                  onToggle={() => setFocusId((f) => (f === note.id ? null : note.id))}
                />
              ))}
            </div>
          </>
        )}

        <AnimatePresence>
          {phase === "writing" && (
            <motion.div
              key="dim"
              aria-hidden="true"
              onClick={closeForm}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: "absolute", inset: 0, zIndex: 70, backgroundColor: "rgba(0,0,0,0.2)" }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {placing && (
            <Ghost key="ghost" note={ghostNote} g={g} x={gx} y={gy} busy={phase === "sticking"} touch={touchInput} onStick={stick} onBack={backToWriting} />
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
