import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { colors, withAlpha } from "@/app/theme/tokens";
import linocut from "@/assets/about-photos/2.1.jpg";

// The shimmer an AI image generator shows before the picture arrives - a soft lattice of
// diamonds with light sweeping across it - drawn in a three.js shader. Hover the card and
// it starts "generating": the diamonds swell and ripple out from the cursor, and the
// picture resolves from the top down, blurred at first, sharpening as it lands, each
// diamond flipping over to its piece of the image. Move away and it dissolves back.

const CARD_W = 360;
const CARD_H = 400;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uHover;   // 0..1, eased in and out with GSAP
  uniform float uReveal;  // 0..1, the picture landing from the top
  uniform vec2 uMouse;    // px, y up
  uniform sampler2D uTex;
  uniform vec2 uTexAspect; // scale for a cover-fit crop

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 p = vUv * uRes;
    float cell = 13.0;
    // a lattice turned 45° - every cell is a diamond
    vec2 r = vec2(p.x + p.y, p.x - p.y) * 0.70710678;
    vec2 id = floor(r / cell);
    vec2 g = fract(r / cell) - 0.5;
    vec2 cc = (id + 0.5) * cell;
    vec2 cp = vec2(cc.x + cc.y, cc.x - cc.y) * 0.70710678; // the cell's centre, back in px

    // light: a slow diagonal sweep, plus ripples out of the cursor while hovered
    float sweep = 0.5 + 0.5 * sin((cp.x + cp.y) * 0.018 - uTime * 2.2);
    float dm = length(cp - uMouse);
    float ripple = sin(dm * 0.07 - uTime * 6.0) * exp(-dm / 110.0) * uHover;
    float energy = clamp(sweep * (0.55 + 0.45 * uHover) + ripple * 0.8, 0.0, 1.0);

    float size = 0.2 + 0.2 * energy;
    float edge = max(abs(g.x), abs(g.y));
    float dia = 1.0 - smoothstep(size - 0.09, size + 0.09, edge);

    vec3 base = vec3(0.905, 0.898, 0.886);
    vec3 tile = vec3(0.985, 0.98, 0.972);
    vec3 col = mix(base, tile, dia * (0.55 + 0.45 * energy));
    col += 0.035 * sweep;

    // the picture landing: a soft front moving down, each diamond flipping at its own moment
    float front = uRes.y * (1.0 - uReveal * 1.5);
    float t = clamp((cp.y - front) / 70.0 + (hash(id) - 0.5) * 0.6, 0.0, 1.0);
    vec2 uv = (vUv - 0.5) * uTexAspect + 0.5;
    float blur = mix(5.5, 0.0, smoothstep(0.0, 1.0, uReveal)) + (1.0 - t) * 2.0;
    vec3 img = texture2D(uTex, uv, blur).rgb;
    col = mix(col, img, t * smoothstep(0.0, 0.08, uReveal));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Placeholder() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(CARD_W, CARD_H, false);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(renderer.domElement);

    const tex = new THREE.TextureLoader().load(linocut, (t) => {
      const img = t.image as HTMLImageElement;
      const ia = img.width / img.height;
      const ca = CARD_W / CARD_H;
      uniforms.uTexAspect.value.set(ia > ca ? ca / ia : 1, ia > ca ? 1 : ia / ca);
    });
    // left undecoded: the shader writes colour straight out, so the photo's own sRGB values pass through as-is
    tex.minFilter = THREE.LinearMipmapLinearFilter;

    const uniforms = {
      uRes: { value: new THREE.Vector2(CARD_W, CARD_H) },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uReveal: { value: 0 },
      uMouse: { value: new THREE.Vector2(CARD_W / 2, CARD_H / 2) },
      uTex: { value: tex },
      uTexAspect: { value: new THREE.Vector2(1, 1) },
    };
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const tick = (_t: number, dt: number) => {
      uniforms.uTime.value += dt / 1000;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    const mouseTo = {
      x: gsap.quickTo(uniforms.uMouse.value, "x", { duration: 0.4, ease: "power3.out" }),
      y: gsap.quickTo(uniforms.uMouse.value, "y", { duration: 0.4, ease: "power3.out" }),
    };
    const start = () => {
      gsap.to(uniforms.uHover, { value: 1, duration: 0.5, ease: "power2.out" });
      gsap.to(uniforms.uReveal, {
        value: 1,
        duration: 4.2 * (1 - uniforms.uReveal.value),
        ease: "power1.inOut",
      });
    };
    const stop = () => {
      gsap.to(uniforms.uHover, { value: 0, duration: 0.8, ease: "power2.out" });
      gsap.to(uniforms.uReveal, { value: 0, duration: 0.9, ease: "power2.inOut" });
    };

    let pointer = "mouse";
    let on = false;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const k = CARD_W / r.width;
      mouseTo.x((e.clientX - r.left) * k);
      mouseTo.y(CARD_H - (e.clientY - r.top) * k);
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      on = true;
      start();
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      on = false;
      stop();
    };
    const down = (e: PointerEvent) => {
      pointer = e.pointerType;
      move(e);
    };
    // a tap on a phone toggles it
    const click = () => {
      if (pointer === "mouse") return;
      on = !on;
      if (on) start();
      else stop();
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointerdown", down);
    host.addEventListener("click", click);

    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("click", click);
      gsap.ticker.remove(tick);
      gsap.killTweensOf(uniforms.uHover);
      gsap.killTweensOf(uniforms.uReveal);
      tex.dispose();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} style={{ width: CARD_W, height: CARD_H, borderRadius: 12, overflow: "hidden", cursor: "pointer" }} />;
}

const BUBBLE_ROOM = 34; // the prompt bubble sits just above the card's top edge

export function ImageGen() {
  return (
    <div style={{ position: "relative", width: CARD_W + 20, height: CARD_H + BUBBLE_ROOM }}>
      <div style={{ position: "absolute", left: 0, top: BUBBLE_ROOM, boxShadow: `0 20px 40px ${withAlpha(colors.ink, 0.16)}`, borderRadius: 12 }}>
        <Placeholder />
      </div>
      {/* the prompt that asked for it */}
      <div
        className="font-inclusive-sans"
        style={{
          position: "absolute",
          right: 0,
          top: 8,
          padding: "10px 14px",
          borderRadius: "16px 16px 4px 16px",
          background: colors.ink,
          color: colors.sand,
          fontSize: 12,
          lineHeight: "16px",
          boxShadow: `0 10px 24px ${withAlpha(colors.ink, 0.25)}`,
          zIndex: 2,
        }}
      >
        a linocut portrait of an old man in a hat
      </div>
    </div>
  );
}

export const IMAGE_GEN_SIZE = { w: CARD_W + 20, h: CARD_H + BUBBLE_ROOM };
