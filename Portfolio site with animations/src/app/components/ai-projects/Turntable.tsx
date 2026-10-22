import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { Vinyl } from "@/app/components/about/Vinyl";
import { colors, withAlpha } from "@/app/theme/tokens";
import vinylDisc from "@/assets/vinyl-player/vinyl-disc.png";

// A record player. The record turns only while the needle is on it: lift the tonearm off
// (click it, or drag it) and the platter coasts to a stop under its own momentum; set it
// back down and it spins up again. While it plays, the arm creeps slowly inwards across
// the grooves, like the real thing.

const BOX = 240; // the deck, square
const PIVOT = { x: 212, y: 34 };
const ARM_LEN = 150;
const PARKED = 0; // degrees - hanging straight down, beside the platter
const ON_RECORD = 22; // the needle's first groove
const INNERMOST = 31; // where it drifts to by the end of a side
const DROP_AT = 13; // let go past this and the needle drops onto the record
const RPM_DEG = 70; // degrees per second at speed - slow and unhurried

const DISC = 184;
const DISC_C = { x: 108, y: 128 };

function Deck() {
  const discRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [playing, setPlaying] = useState(true);
  const [lifted, setLifted] = useState(false);
  const spin = useRef({ v: RPM_DEG, rot: 0 });
  const angle = useRef(ON_RECORD);
  const fid = useId().replace(/:/g, "");

  // the platter: integrate its angle every frame from a speed GSAP eases up and down
  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;
    const tick = (_t: number, dt: number) => {
      spin.current.rot = (spin.current.rot + (spin.current.v * dt) / 1000) % 360;
      disc.style.transform = `rotate(${spin.current.rot}deg)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useEffect(() => {
    gsap.to(spin.current, playing ? { v: RPM_DEG, duration: 0.9, ease: "power2.out" } : { v: 0, duration: 2.6, ease: "power1.out" });
  }, [playing]);

  const setArm = (deg: number, opts: gsap.TweenVars = {}) =>
    gsap.to(armRef.current, {
      rotation: deg,
      svgOrigin: `${PIVOT.x} ${PIVOT.y}`,
      ...opts,
      onUpdate() {
        angle.current = gsap.getProperty(armRef.current, "rotation") as number;
      },
    });

  // start with the needle down, drifting in
  useEffect(() => {
    gsap.set(armRef.current, { rotation: ON_RECORD, svgOrigin: `${PIVOT.x} ${PIVOT.y}` });
    setArm(INNERMOST, { duration: 120, ease: "none" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drop = (from: number) => {
    setLifted(false);
    setPlaying(true);
    gsap.killTweensOf(armRef.current);
    setArm(Math.max(from, ON_RECORD), { duration: 0.35, ease: "power2.out" });
    // the needle settles into the groove with a tiny bounce, then rides inwards
    gsap.fromTo(armRef.current, { y: -2 }, { y: 0, duration: 0.5, ease: "bounce.out", delay: 0.3 });
    gsap.delayedCall(0.6, () => setArm(INNERMOST, { duration: 120, ease: "none" }));
  };

  const park = () => {
    setLifted(false);
    setPlaying(false);
    gsap.killTweensOf(armRef.current);
    setArm(PARKED, { duration: 0.7, ease: "power2.inOut" });
  };

  // drag the arm by its headshell; a quick click just lifts it off / puts it back
  const drag = useRef<{ moved: boolean; startDeg: number } | null>(null);
  const toLocal = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const k = BOX / r.width;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  };
  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { moved: false, startDeg: angle.current };
    gsap.killTweensOf(armRef.current);
    setLifted(true);
    setPlaying(false);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = toLocal(e);
    const deg = (Math.atan2(-(p.x - PIVOT.x), p.y - PIVOT.y) * 180) / Math.PI;
    const clamped = Math.max(PARKED, Math.min(INNERMOST + 4, deg));
    if (Math.abs(clamped - drag.current.startDeg) > 1.5) drag.current.moved = true;
    if (drag.current.moved) setArm(clamped, { duration: 0.12, ease: "power1.out" });
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      // a click: lift it off if it was on, put it on if it was parked
      if (d.startDeg >= DROP_AT) park();
      else drop(ON_RECORD);
      return;
    }
    if (angle.current >= DROP_AT) drop(angle.current);
    else park();
  };

  return (
    <div style={{ position: "relative", width: BOX, height: BOX }}>
      {/* plinth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          background: `linear-gradient(160deg, #F1EBE2, #E2D8CB)`,
          boxShadow: `inset 0 1px 0 ${withAlpha(colors.white, 0.8)}, inset 0 -2px 0 ${withAlpha(colors.ink, 0.08)}, 0 10px 22px ${withAlpha(colors.ink, 0.18)}`,
        }}
      />
      {/* platter rim */}
      <div
        style={{
          position: "absolute",
          left: DISC_C.x - DISC / 2 - 7,
          top: DISC_C.y - DISC / 2 - 7,
          width: DISC + 14,
          height: DISC + 14,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #4a483d, #23221a 70%)",
          boxShadow: `0 4px 10px ${withAlpha(colors.ink, 0.35)}`,
        }}
      />
      {/* the record, turned by the ticker */}
      <div ref={discRef} style={{ position: "absolute", left: DISC_C.x - DISC / 2, top: DISC_C.y - DISC / 2, width: DISC, height: DISC, willChange: "transform" }}>
        <Vinyl size={DISC} art={vinylDisc} spinning={false} />
      </div>
      {/* light on the grooves - it stays put while the record turns under it */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: DISC_C.x - DISC / 2,
          top: DISC_C.y - DISC / 2,
          width: DISC,
          height: DISC,
          borderRadius: "50%",
          pointerEvents: "none",
          background: `conic-gradient(from 20deg, transparent 0deg, ${withAlpha(colors.white, 0.14)} 28deg, transparent 56deg, transparent 180deg, ${withAlpha(colors.white, 0.1)} 210deg, transparent 240deg)`,
          mixBlendMode: "screen",
        }}
      />

      {/* tonearm */}
      <svg ref={svgRef} viewBox={`0 0 ${BOX} ${BOX}`} width={BOX} height={BOX} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
        <defs>
          <filter id={`${fid}-rest`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.2" floodColor={colors.ink} floodOpacity="0.3" />
          </filter>
          <filter id={`${fid}-lift`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="9" stdDeviation="4" floodColor={colors.ink} floodOpacity="0.32" />
          </filter>
        </defs>
        {/* the rest the arm parks on */}
        <rect x={PIVOT.x - 5} y={PIVOT.y + ARM_LEN - 18} width={10} height={14} rx={3} fill="#cfc6b8" stroke={withAlpha(colors.ink, 0.15)} />
        {/* the pivot's base stays put */}
        <circle cx={PIVOT.x} cy={PIVOT.y} r={17} fill="#d9d1c4" stroke={withAlpha(colors.ink, 0.12)} />
        <g
          ref={armRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          filter={`url(#${fid}-${lifted ? "lift" : "rest"})`}
          style={{ pointerEvents: "auto", cursor: lifted ? "grabbing" : "grab" }}
        >
          {/* counterweight */}
          <rect x={PIVOT.x - 7} y={PIVOT.y - 30} width={14} height={18} rx={3} fill="#3a3830" />
          {/* the arm itself, with a gentle kink near the head like an S-arm */}
          <path
            d={`M ${PIVOT.x} ${PIVOT.y - 14} L ${PIVOT.x} ${PIVOT.y + ARM_LEN - 40} Q ${PIVOT.x} ${PIVOT.y + ARM_LEN - 22} ${PIVOT.x - 8} ${PIVOT.y + ARM_LEN - 10}`}
            fill="none"
            stroke="#b8b0a2"
            strokeWidth={4.5}
            strokeLinecap="round"
          />
          <path
            d={`M ${PIVOT.x} ${PIVOT.y - 14} L ${PIVOT.x} ${PIVOT.y + ARM_LEN - 40}`}
            fill="none"
            stroke={withAlpha(colors.white, 0.5)}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          {/* headshell + cartridge */}
          <g transform={`rotate(24 ${PIVOT.x - 8} ${PIVOT.y + ARM_LEN - 10})`}>
            <rect x={PIVOT.x - 15} y={PIVOT.y + ARM_LEN - 14} width={14} height={22} rx={2.5} fill="#2c2b24" />
            <rect x={PIVOT.x - 12} y={PIVOT.y + ARM_LEN + 2} width={8} height={6} rx={1} fill={colors.orange} />
          </g>
          {/* pivot cap */}
          <circle cx={PIVOT.x} cy={PIVOT.y} r={8} fill="#8f887b" />
          <circle cx={PIVOT.x} cy={PIVOT.y} r={3} fill="#d9d1c4" />
        </g>
      </svg>

      {/* speed light */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 16,
          bottom: 14,
          width: 6,
          height: 6,
          borderRadius: 6,
          background: playing ? colors.orange : withAlpha(colors.ink, 0.2),
          boxShadow: playing ? `0 0 8px ${colors.orange}` : "none",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      />
    </div>
  );
}

export function Turntable() {
  return <Deck />;
}

export const TURNTABLE_SIZE = { w: BOX, h: BOX };
