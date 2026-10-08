import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "motion/react";
import { colors, withAlpha } from "@/app/theme/tokens";

// ── Photos ────────────────────────────────────────────────────────────────────
const PHOTOS = [
  "https://images.unsplash.com/photo-1654514438820-97d39ca8cc50?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400&q=85",
  "https://images.unsplash.com/photo-1744686909434-fd158fca1c35?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400&q=85",
  "https://images.unsplash.com/photo-1654514434402-bc8d2b179817?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400&q=85",
  "https://images.unsplash.com/photo-1753164597554-e315d2d5cc8d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400&q=85",
  "https://images.unsplash.com/photo-1654765436522-f59e5cbadcc8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400&q=85",
];

// ─────────────────────────────────────────────────────────────────────────────
// 01 · NAME AS IMAGE
// The word "laxmi" is the canvas. Photos fill the letterforms.
// Name and identity are literally the same thing.
// ─────────────────────────────────────────────────────────────────────────────
function NameAsImageDemo() {
  const [activePhoto, setActivePhoto] = useState(0);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { backgroundPosition: "38% 28%" },
      { backgroundPosition: "62% 72%", duration: 14, ease: "none", repeat: -1, yoyo: true }
    );
  }, [activePhoto]);

  return (
    <div
      style={{
        position: "relative",
        height: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        gap: 18,
      }}
    >
      <motion.div
        key={activePhoto}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55 }}
        ref={bgRef}
        style={{
          fontFamily: "'Libre Caslon Condensed', Georgia, serif",
          fontSize: "clamp(70px, 15vw, 106px)",
          fontWeight: 700,
          letterSpacing: "-3px",
          lineHeight: 1,
          textTransform: "lowercase",
          backgroundImage: `url(${PHOTOS[activePhoto]})`,
          backgroundSize: "140% 200%",
          backgroundPosition: "38% 28%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          userSelect: "none",
        }}
      >
        laxmi
      </motion.div>

      <p
        style={{
          fontFamily: "'Inclusive Sans', sans-serif",
          fontSize: 10,
          color: withAlpha(colors.ink, 0.32),
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        product designer · bangalore
      </p>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {PHOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActivePhoto(i)}
            style={{
              width: i === activePhoto ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === activePhoto ? colors.oliveDeep : withAlpha(colors.ink, 0.18),
              border: "none",
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
              padding: 0,
            }}
          />
        ))}
      </div>

      <p
        style={{
          position: "absolute",
          bottom: 10,
          fontSize: 10,
          color: withAlpha(colors.ink, 0.2),
          fontFamily: "'Inclusive Sans', sans-serif",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        tap dots to change the photo inside the name
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 02 · THE WHOLE SCENE TILTS
// Not individual photos - the entire 3D scene rotates on mouse.
// Photos at different Z depths diverge. Looks like actual space.
// This is what Apple does for M-series chip hero pages.
// ─────────────────────────────────────────────────────────────────────────────
function SceneTiltDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const LAYERS = [
    { src: PHOTOS[2], x: -88, y: -24, z: 20,  rot: -8,  w: 90,  h: 118 },
    { src: PHOTOS[0], x: 4,   y: -44, z: 70,  rot: 4,   w: 110, h: 142 },
    { src: PHOTOS[4], x: 92,  y: -18, z: 30,  rot: 10,  w: 84,  h: 110 },
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width  * 2 - 1) * 11;
      ty = -((e.clientY - r.top)  / r.height * 2 - 1) * 7;
    };
    const onTouch = (e: TouchEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.touches[0].clientX - r.left) / r.width  * 2 - 1) * 11;
      ty = -((e.touches[0].clientY - r.top)  / r.height * 2 - 1) * 7;
    };
    const onLeave = () => { tx = 0; ty = 0; };

    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.transform = `perspective(900px) rotateY(${cx}deg) rotateX(${cy}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    el.addEventListener("mousemove",  onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchmove",  onTouch, { passive: true });
    el.addEventListener("touchend",   onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current!);
      el.removeEventListener("mousemove",  onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchmove",  onTouch);
      el.removeEventListener("touchend",   onLeave);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        touchAction: "none",
        cursor: "crosshair",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${withAlpha(colors.ink, 0.055)} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {LAYERS.map((layer, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: layer.w,
              height: layer.h,
              left: `calc(50% + ${layer.x - layer.w / 2}px)`,
              top:  `calc(50% + ${layer.y - layer.h / 2}px)`,
              borderRadius: 10,
              overflow: "hidden",
              transform: `translateZ(${layer.z}px) rotate(${layer.rot}deg)`,
              boxShadow: `0 ${8 + layer.z * 0.3}px ${24 + layer.z * 0.6}px rgba(33,32,18,${0.14 + i * 0.04})`,
              border: `2.5px solid ${withAlpha(colors.white, 0.75)}`,
            }}
          >
            <img src={layer.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%) translateZ(90px)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'Libre Caslon Condensed', Georgia, serif",
              fontSize: 13,
              fontStyle: "italic",
              color: withAlpha(colors.ink, 0.38),
              letterSpacing: "0.3px",
            }}
          >
            product designer
          </span>
        </div>
      </div>

      <p
        style={{
          position: "absolute",
          bottom: 10,
          fontSize: 10,
          color: withAlpha(colors.ink, 0.2),
          fontFamily: "'Inclusive Sans', sans-serif",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        move or drag - the whole scene tilts
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 03 · RACK FOCUS
// Three photos side by side. One is sharp; the others blur out.
// Every 3 seconds the focus shifts - smooth cinematic DOF transition.
// No interaction needed. Works on all devices identically.
// A camera metaphor: a designer who notices what others blur out.
// ─────────────────────────────────────────────────────────────────────────────
function RackFocusDemo() {
  const [focus, setFocus] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setFocus(f => (f + 1) % 3), 2800);
    return () => clearInterval(id);
  }, []);

  const LINEUP = [
    { src: PHOTOS[1], label: "editorial" },
    { src: PHOTOS[0], label: "portrait"  },
    { src: PHOTOS[3], label: "candid"    },
  ];

  return (
    <div
      style={{
        position: "relative",
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "0 20px",
        overflow: "hidden",
      }}
    >
      {LINEUP.map((photo, i) => {
        const dist = Math.abs(i - focus);
        return (
          <div key={i} style={{ flex: 1, maxWidth: 138, position: "relative" }}>
            <motion.div
              animate={{
                filter: `blur(${dist === 0 ? 0 : dist === 1 ? 5 : 9}px)`,
                scale:   dist === 0 ? 1 : 0.87,
                opacity: dist === 0 ? 1 : 0.44,
              }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: 194,
                borderRadius: 10,
                overflow: "hidden",
                border: `2.5px solid ${withAlpha(colors.white, 0.7)}`,
                boxShadow: i === focus
                  ? `0 14px 44px ${withAlpha(colors.ink, 0.26)}`
                  : `0 3px 12px ${withAlpha(colors.ink, 0.1)}`,
                transition: "box-shadow 0.9s ease",
              }}
            >
              <img src={photo.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
            </motion.div>

            <div style={{ height: 22, marginTop: 8, display: "flex", justifyContent: "center" }}>
              <AnimatePresence mode="wait">
                {i === focus && (
                  <motion.p
                    key={`label-${focus}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 }}
                    style={{
                      fontFamily: "'Libre Caslon Condensed', Georgia, serif",
                      fontSize: 12,
                      fontStyle: "italic",
                      color: colors.oliveDeep,
                      letterSpacing: "0.3px",
                    }}
                  >
                    {photo.label}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ width: i === focus ? 18 : 5, background: i === focus ? colors.oliveDeep : withAlpha(colors.ink, 0.18) }}
            transition={{ duration: 0.35 }}
            style={{ height: 4, borderRadius: 2 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 04 · ELASTIC WEB
// Five photos orbiting a center, connected by elastic SVG lines.
// Move the mouse near a photo - it bends toward you, lines stretch.
// Move away - spring physics snap everything back. The whole thing is alive.
// SVG lines updated directly each frame (no React re-renders) for 60fps.
// ─────────────────────────────────────────────────────────────────────────────
function ElasticWebDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const photoRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs     = useRef<(SVGLineElement | null)[]>([]);
  const rafRef       = useRef<number>();

  const N = 5;
  const RING_R = 88;

  const INIT = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(a) * RING_R, y: Math.sin(a) * RING_R * 0.65 };
  });

  useEffect(() => {
    const pos = INIT.map(p => ({ ...p }));
    const vel = INIT.map(() => ({ vx: 0, vy: 0 }));
    let mx = 0, my = 0;

    photoRefs.current.forEach((el, i) => {
      if (el) { gsap.set(el, { x: pos[i].x, y: pos[i].y }); el.style.opacity = "0"; }
    });
    photoRefs.current.forEach((el, i) => {
      if (el) gsap.to(el, { opacity: 1, duration: 0.4, delay: i * 0.08 });
    });

    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx = e.clientX - r.left - r.width / 2;
      my = e.clientY - r.top  - r.height / 2;
    };
    const onTouch = (e: TouchEvent) => {
      const r = el.getBoundingClientRect();
      mx = e.touches[0].clientX - r.left - r.width / 2;
      my = e.touches[0].clientY - r.top  - r.height / 2;
    };
    const onLeave = () => { mx = 0; my = 0; };

    const tick = () => {
      const svg = svgRef.current;
      const sw = svg?.getBoundingClientRect().width  ?? 400;
      const sh = svg?.getBoundingClientRect().height ?? 300;

      pos.forEach((p, i) => {
        const sx = (INIT[i].x - p.x) * 0.055;
        const sy = (INIT[i].y - p.y) * 0.055;
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pull = dist < 140 ? (1 - dist / 140) * 0.038 : 0;

        vel[i].vx = (vel[i].vx + sx + dx * pull) * 0.875;
        vel[i].vy = (vel[i].vy + sy + dy * pull) * 0.875;
        p.x += vel[i].vx;
        p.y += vel[i].vy;

        const photoEl = photoRefs.current[i];
        if (photoEl) gsap.set(photoEl, { x: p.x, y: p.y });

        const line = lineRefs.current[i];
        if (line) {
          line.setAttribute("x1", String(sw / 2 + p.x));
          line.setAttribute("y1", String(sh / 2 + p.y));
          line.setAttribute("x2", String(sw / 2));
          line.setAttribute("y2", String(sh / 2));
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    el.addEventListener("mousemove",  onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchmove",  onTouch, { passive: true });
    el.addEventListener("touchend",   onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current!);
      el.removeEventListener("mousemove",  onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchmove",  onTouch);
      el.removeEventListener("touchend",   onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "crosshair",
        touchAction: "pan-y",
        overflow: "hidden",
      }}
    >
      <svg
        ref={svgRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {Array.from({ length: N }, (_, i) => (
          <line
            key={i}
            ref={el => { lineRefs.current[i] = el; }}
            stroke={withAlpha(colors.oliveDeep, 0.18)}
            strokeWidth={1}
            strokeDasharray="3 5"
          />
        ))}
        <circle cx="50%" cy="50%" r={3} fill={withAlpha(colors.oliveDeep, 0.28)} />
      </svg>

      {PHOTOS.slice(0, N).map((url, i) => (
        <div
          key={i}
          ref={el => { photoRefs.current[i] = el; }}
          style={{
            position: "absolute",
            width: 68,
            height: 88,
            borderRadius: 8,
            overflow: "hidden",
            border: `2.5px solid ${withAlpha(colors.white, 0.75)}`,
            boxShadow: `0 6px 22px ${withAlpha(colors.ink, 0.18)}`,
          }}
        >
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        </div>
      ))}

      <p
        style={{
          position: "absolute",
          bottom: 10,
          fontSize: 10,
          color: withAlpha(colors.ink, 0.2),
          fontFamily: "'Inclusive Sans', sans-serif",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        approach any photo - it bends toward you
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 05 · CINEMATIC STRIP
// A horizontal filmstrip you drag with momentum + snap-to-frame.
// Sprocket holes, frame numbers, caption reveals.
// Feels like holding a real roll of film - physical and intentional.
// ─────────────────────────────────────────────────────────────────────────────
function CinematicStripDemo() {
  const trackRef  = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>();
  const [activeIdx, setActiveIdx] = useState(2);

  const STRIP = [
    { src: PHOTOS[0], frame: "01", caption: "portrait"  },
    { src: PHOTOS[2], frame: "02", caption: "character" },
    { src: PHOTOS[1], frame: "03", caption: "light"     },
    { src: PHOTOS[4], frame: "04", caption: "candid"    },
    { src: PHOTOS[3], frame: "05", caption: "motion"    },
  ];

  const CARD_W = 108;
  const GAP    = 14;
  const STRIDE = CARD_W + GAP;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const minX = -(STRIP.length - 1) * STRIDE;
    const maxX = 0;
    const clamp = (v: number) => Math.max(minX, Math.min(maxX, v));

    let targetX  = -2 * STRIDE;
    let currentX = targetX;
    let isDragging = false;
    let startX = 0;
    let dragStart = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.1;
      track.style.transform = `translateX(calc(-50% + ${currentX}px))`;
      const idx = Math.max(0, Math.min(STRIP.length - 1, Math.round(-currentX / STRIDE)));
      setActiveIdx(idx);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onDown = (clientX: number) => {
      isDragging = true;
      startX = clientX;
      dragStart = targetX;
    };
    const onDrag = (clientX: number) => {
      if (!isDragging) return;
      targetX = clamp(dragStart + (clientX - startX) * 1.3);
    };
    const onUp = () => {
      if (!isDragging) return;
      isDragging = false;
      const idx = Math.round(-targetX / STRIDE);
      targetX = clamp(-idx * STRIDE);
    };

    const container = track.parentElement!;
    const onMouseDown  = (e: MouseEvent) => onDown(e.clientX);
    const onMouseMove  = (e: MouseEvent) => onDrag(e.clientX);
    const onTouchStart = (e: TouchEvent) => onDown(e.touches[0].clientX);
    const onTouchMove  = (e: TouchEvent) => onDrag(e.touches[0].clientX);

    container.addEventListener("mousedown",  onMouseDown);
    window.addEventListener(   "mousemove",  onMouseMove);
    window.addEventListener(   "mouseup",    onUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove",  onTouchMove,  { passive: true });
    container.addEventListener("touchend",   onUp);

    return () => {
      cancelAnimationFrame(rafRef.current!);
      container.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener(   "mousemove",  onMouseMove);
      window.removeEventListener(   "mouseup",    onUp);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove",  onTouchMove);
      container.removeEventListener("touchend",   onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Sprockets = () => (
    <div style={{ position: "absolute", left: 0, right: 0, display: "flex", gap: 18, justifyContent: "center", pointerEvents: "none" }}>
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} style={{ width: 8, height: 6, borderRadius: 2, background: withAlpha(colors.ink, 0.11), flexShrink: 0 }} />
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        height: 300,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
        touchAction: "pan-y",
      }}
    >
      <div style={{ position: "absolute", top: 18 }}><Sprockets /></div>

      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: GAP,
            paddingLeft: "50%",
            paddingRight: "50%",
            willChange: "transform",
            transform: `translateX(calc(-50% + ${-2 * STRIDE}px))`,
          }}
        >
          {STRIP.map((item, i) => {
            const dist = Math.abs(i - activeIdx);
            return (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: CARD_W,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  opacity:   dist === 0 ? 1 : dist === 1 ? 0.48 : 0.22,
                  transform: `scale(${dist === 0 ? 1 : 0.91}) translateY(${dist === 0 ? 0 : 7}px)`,
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: withAlpha(colors.ink, 0.28),
                    letterSpacing: "1px",
                  }}
                >
                  {item.frame}
                </span>

                <div
                  style={{
                    width: CARD_W,
                    height: 158,
                    borderRadius: 6,
                    overflow: "hidden",
                    border: i === activeIdx ? `2.5px solid ${withAlpha(colors.white, 0.9)}` : `2px solid ${withAlpha(colors.white, 0.35)}`,
                    boxShadow: i === activeIdx ? `0 12px 36px ${withAlpha(colors.ink, 0.24)}` : "none",
                    transition: "border-color 0.4s, box-shadow 0.4s",
                  }}
                >
                  <img src={item.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                </div>

                <span
                  style={{
                    fontFamily: "'Libre Caslon Condensed', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: 11,
                    color: i === activeIdx ? colors.oliveDeep : withAlpha(colors.ink, 0.22),
                    transition: "color 0.4s ease",
                  }}
                >
                  {item.caption}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 22 }}><Sprockets /></div>

      <p
        style={{
          position: "absolute",
          bottom: 8,
          fontSize: 10,
          color: withAlpha(colors.ink, 0.2),
          fontFamily: "'Inclusive Sans', sans-serif",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        drag the strip
      </p>
    </div>
  );
}

// ── Demo catalogue (rendered by AiProjectsPage's "animation" tab) ──────────────
export const ANIMATION_DEMOS = [
  {
    number: "01",
    title: "Name as Image",
    tagline: "The word 'laxmi' is the canvas - photos fill the letterforms. Your name and your work are literally one thing.",
    Component: NameAsImageDemo,
  },
  {
    number: "02",
    title: "The Whole Scene Tilts",
    tagline: "Not individual photos moving - the entire 3D scene rotates on mouse. Exactly what Apple uses for M-series hero pages.",
    Component: SceneTiltDemo,
  },
  {
    number: "03",
    title: "Rack Focus",
    tagline: "Three photos, one sharp at a time. Every 3 seconds the focus shifts - smooth cinematic DOF. No interaction. Works on everything.",
    Component: RackFocusDemo,
  },
  {
    number: "04",
    title: "Elastic Web",
    tagline: "Five photos on invisible elastic strings. Move close - they bend toward you. Pull away - spring physics snap them back.",
    Component: ElasticWebDemo,
  },
  {
    number: "05",
    title: "Cinematic Strip",
    tagline: "A draggable filmstrip with momentum and snap-to-frame. Sprocket holes. Feels like holding an actual roll of film.",
    Component: CinematicStripDemo,
  },
];
