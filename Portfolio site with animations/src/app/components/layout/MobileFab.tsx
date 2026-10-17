import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { haptic } from "@/app/lib/feedback";
import { colors, withAlpha } from "@/app/theme/tokens";
import { RESUME_URL } from "@/app/lib/links";

// ── Bubble FAB ────────────────────────────────────────────────────────────────
// Lives in the bottom sticky nav band (rendered by MobileBottomNav). Opening it pops
// the links out of the button as flat bubbles, close in size, that settle into
// a loose cluster above it, nearest first, each with an elastic overshoot - then
// they keep floating gently. Closing pulls them back into the button.
// The cluster and the scrim are position:fixed so the band's overflow:hidden can't clip them.

// ── Filled icons (24×24, drawn in currentColor) ──
type IconProps = { size: number };
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{children}</svg>
);
const ResumeIcon = ({ size }: IconProps) => svg(size, (
  <path fillRule="evenodd" d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V8h4.5L13 3.5ZM12 10a1 1 0 0 1 1 1v4.59l1.3-1.3a1 1 0 1 1 1.4 1.42l-3 3a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.42l1.3 1.3V11a1 1 0 0 1 1-1Z" />
));
const MailIcon = ({ size }: IconProps) => svg(size, (
  <>
    <path d="M3 6.2A2.2 2.2 0 0 1 5.2 4h13.6A2.2 2.2 0 0 1 21 6.2v.3l-9 5.6-9-5.6v-.3Z" />
    <path d="M3 8.85V17.8A2.2 2.2 0 0 0 5.2 20h13.6a2.2 2.2 0 0 0 2.2-2.2V8.85l-8.47 5.27a1 1 0 0 1-1.06 0L3 8.85Z" />
  </>
));
const GithubIcon = ({ size }: IconProps) => svg(size, (
  <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
));
const LinkedinIcon = ({ size }: IconProps) => svg(size, (
  <path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9C2 21.3 2.7 22 3.55 22h16.9c.85 0 1.55-.7 1.55-1.55V3.55C22 2.7 21.3 2 20.45 2ZM8.06 19.04H5.09V9.48h2.97v9.56ZM6.58 8.17a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.46 10.87h-2.96v-4.65c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.78V9.48h2.84v1.31h.04c.4-.75 1.36-1.55 2.81-1.55 3 0 3.56 1.98 3.56 4.55v5.25Z" />
));

// Where each bubble settles, from the button's centre (px, up is negative), and its size.
// Sizes stay close (46-54) and every bubble keeps 24px+ clear of its neighbours. The button
// sits near the right edge, so the cluster leans up and to the left.
const BUBBLES = [
  { label: "linkedin", href: "https://in.linkedin.com/in/laxmi-mahajan", Icon: LinkedinIcon, x: -6, y: -80, d: 46, tint: colors.pink },
  { label: "gmail", href: "mailto:laxmimahajanwork@gmail.com", Icon: MailIcon, x: -88, y: -118, d: 50, tint: colors.orangeLight },
  { label: "resume", href: RESUME_URL, Icon: ResumeIcon, x: -10, y: -160, d: 54, tint: colors.olive },
  { label: "github", href: "https://github.com/laxmispace", Icon: GithubIcon, x: -94, y: -208, d: 50, tint: colors.sandLight },
];

const FAB = 44;

/** A flat circle in one of the site's colours - no highlights or shadows. */
const flat = (tint: string) => ({ background: tint, border: "none" });

export function MobileFab() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const floats = useRef<gsap.core.Tween[]>([]);

  // Build the pop-out once; opening plays it, closing reverses it.
  useLayoutEffect(() => {
    const layer = layerRef.current;
    const trigger = triggerRef.current;
    if (!layer || !trigger) return;
    const ctx = gsap.context(() => {
      const bubbles = gsap.utils.toArray<HTMLElement>(".fab-bubble", layer);
      const t = gsap.timeline({ paused: true });
      t.set(layer, { visibility: "visible" })
        .fromTo(".fab-scrim", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0)
        .to(trigger.querySelector(".fab-plus"), { rotate: 135, duration: 0.5, ease: "back.out(2)" }, 0);
      bubbles.forEach((el, i) => {
        t.fromTo(
          el,
          { x: 0, y: 0, scale: 0.15, opacity: 0 },
          { x: Number(el.dataset.x), y: Number(el.dataset.y), scale: 1, opacity: 1, duration: 0.75, ease: "elastic.out(1, 0.6)" },
          0.04 + i * 0.07,
        );
      });
      tl.current = t;
    }, layer);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const t = tl.current;
    const layer = layerRef.current;
    const r = triggerRef.current?.getBoundingClientRect();
    if (!t || !layer || !r) return;
    floats.current.forEach((f) => f.kill());
    floats.current = [];
    const inners = gsap.utils.toArray<HTMLElement>(".fab-bubble-inner", layer);
    if (open) {
      gsap.set(layer.querySelector(".fab-centre"), { left: r.left + r.width / 2, top: r.top + r.height / 2 });
      t.timeScale(1).play().then(() => {
        // once settled, every bubble drifts on its own slow loop
        floats.current = inners.map((el, i) =>
          gsap.to(el, { y: i % 2 ? 5 : -5, x: i % 3 ? 2 : -2, duration: 1.6 + i * 0.35, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        );
      });
    } else {
      gsap.to(inners, { x: 0, y: 0, duration: 0.2 });
      t.timeScale(2.2).reverse();
    }
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div ref={layerRef} style={{ visibility: "hidden", pointerEvents: open ? "auto" : "none" }}>
        {/* Scrim - tap anywhere to close */}
        <div
          className="fab-scrim"
          onClick={close}
          style={{ position: "fixed", inset: 0, background: withAlpha(colors.ink, 0.35), backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", zIndex: 2147483644, opacity: 0 }}
        />
        {/* Zero-size anchor on the button's centre; the bubbles pop out from here */}
        <div className="fab-centre" style={{ position: "fixed", width: 0, height: 0, zIndex: 2147483646 }}>
          {BUBBLES.map((b) => (
            <a
              key={b.label}
              className="fab-bubble"
              data-x={b.x}
              data-y={b.y}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={b.label}
              tabIndex={open ? 0 : -1}
              onClick={close}
              style={{ position: "absolute", left: -b.d / 2, top: -b.d / 2, width: b.d, height: b.d, opacity: 0, textDecoration: "none" }}
            >
              <span
                className="fab-bubble-inner"
                style={{ ...flat(b.tint), display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: "50%" }}
              >
                <span style={{ color: colors.ink, display: "flex" }}><b.Icon size={Math.round(b.d * 0.42)} /></span>
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Trigger - a flat olive circle with a plus that turns into a cross */}
      <button
        ref={triggerRef}
        onClick={() => { haptic(8); setOpen((v) => !v); }}
        aria-label={open ? "Close links" : "Open links"}
        aria-expanded={open}
        style={{
          ...flat(colors.olive),
          width: FAB,
          height: FAB,
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 2147483647,
          padding: 0,
        }}
      >
        <svg className="fab-plus" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M9 2v14M2 9h14" stroke={colors.oliveDeep} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </>
  );
}
