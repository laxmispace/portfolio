import { useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { haptic } from "@/app/lib/feedback";
import { colors } from "@/app/theme/tokens";
import { BUTTERFLY_SPRITE, FLOWER_SPRITE, type Sprite } from "./loveSprites";

// Heart outline in a 24×24 box.
const HEART_PATH =
  "M12 21s-7.5-4.6-9.6-9.2C.9 8.5 2.6 4.5 6.3 4.1c2.1-.2 3.9.9 5.7 3 1.8-2.1 3.6-3.2 5.7-3 3.7.4 5.4 4.4 3.9 7.7C19.5 16.4 12 21 12 21z";

// Tapping the heart throws a little bouquet: the hero's pink flower and the footer's
// butterfly burst out of the heart, tumble or flutter about, and a few more drift down
// from the top of the screen. Plain DOM + Web Animations, cleaned up when they finish.
const svgFor = (sp: Sprite) =>
  `<svg viewBox="${sp.viewBox}" width="100%" height="100%" style="display:block;overflow:visible">${sp.paths
    .map((p) => `<path d="${p.d}" fill="${p.color}"${p.evenodd ? ' fill-rule="evenodd"' : ""}/>`)
    .join("")}</svg>`;
const FLOWER_SVG = svgFor(FLOWER_SPRITE);
const BUTTERFLY_SVG = svgFor(BUTTERFLY_SPRITE);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function fling(layer: HTMLElement, x0: number, y0: number, butterfly: boolean, fromTop: boolean) {
  const size = butterfly ? rand(26, 38) : rand(18, 28);
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;will-change:transform,opacity`;
  el.innerHTML = butterfly ? BUTTERFLY_SVG : FLOWER_SVG;
  layer.appendChild(el);
  if (butterfly) {
    // wings: a quick flap, squashing the drawing sideways about its middle
    (el.firstElementChild as SVGElement).animate(
      [{ transform: "scaleX(1)" }, { transform: "scaleX(0.35)" }],
      { duration: rand(110, 160), iterations: Infinity, direction: "alternate", easing: "ease-in-out" },
    );
  }
  const dur = fromTop ? rand(2600, 3600) : rand(1800, 2600);
  const angle = fromTop ? Math.PI / 2 : rand(-Math.PI * 0.95, -Math.PI * 0.05); // up and outward from the heart
  const speed = fromTop ? rand(20, 60) : rand(220, 420);
  const gravity = butterfly ? 60 : 380; // butterflies float, flowers fall
  const spin = butterfly ? rand(-25, 25) : rand(-540, 540);
  const wobble = butterfly ? rand(18, 34) : rand(4, 10);
  const frames: Keyframe[] = [];
  for (let k = 0; k <= 16; k++) {
    const t = (k / 16) * (dur / 1000);
    const x = x0 + Math.cos(angle) * speed * t + wobble * Math.sin(t * 5 + size);
    const y = y0 + Math.sin(angle) * speed * t + 0.5 * gravity * t * t;
    const s = k === 0 ? 0.3 : 1;
    frames.push({ transform: `translate(${x}px, ${y}px) rotate(${(spin * k) / 16}deg) scale(${s})`, opacity: k > 12 ? (16 - k) / 4 : 1 });
  }
  el.animate(frames, { duration: dur, easing: "linear", delay: fromTop ? rand(200, 700) : 0, fill: "backwards" }).finished.then(() => el.remove());
}

function burstBouquet(from: DOMRect) {
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:10000;overflow:hidden";
  document.body.appendChild(layer);
  const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
  for (let i = 0; i < 22; i++) fling(layer, x0, y0, i % 3 === 0, false);
  for (let i = 0; i < 8; i++) fling(layer, rand(0, window.innerWidth), -30, i % 2 === 0, true);
  window.setTimeout(() => layer.remove(), 4800);
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** `heart` colours the heart and its ripples; it defaults to the site orange. */
export function MadeWithLove({ fontSize = 12, color = colors.oliveDeep, heart = colors.orange }: { fontSize?: number; color?: string; heart?: string }) {
  const heartRef = useRef<HTMLButtonElement>(null);
  const pulse = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const ringSize = fontSize + 8;

  const celebrate = async () => {
    haptic(12);
    const pulsing = pulse.start({ scale: [1, 1.45, 0.9, 1.25, 1], transition: { duration: 0.6, ease: "easeOut" } });
    if (!prefersReducedMotion() && heartRef.current) {
      setTimeout(() => heartRef.current && burstBouquet(heartRef.current.getBoundingClientRect()), 180);
    }
    await pulsing;
  };

  return (
    <p className="font-inclusive-sans" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize, lineHeight: 1.3, color, margin: 0 }}>
      designed and built with love
      <motion.button
        ref={heartRef}
        type="button"
        onClick={celebrate}
        animate={pulse}
        whileHover={{ scale: 1.15 }}
        aria-label="Send some love"
        style={{ position: "relative", display: "inline-flex", padding: 2, margin: -2, border: "none", background: "none", cursor: "pointer" }}
      >
        {/* Two staggered ripples breathe out from behind the heart so it reads as tappable */}
        {!reduceMotion &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.5], opacity: [0.45, 0] }}
              transition={{ duration: 1.8, delay: i * 0.9, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" }}
              style={{
                position: "absolute", left: "50%", top: "50%", width: ringSize, height: ringSize,
                marginLeft: -ringSize / 2, marginTop: -ringSize / 2, borderRadius: "50%",
                border: `1.5px solid ${heart}`, pointerEvents: "none",
              }}
            />
          ))}
        <svg width={fontSize + 2} height={fontSize + 2} viewBox="0 0 24 24" aria-hidden="true" style={{ position: "relative" }}>
          <path d={HEART_PATH} fill={heart} />
        </svg>
      </motion.button>
    </p>
  );
}
