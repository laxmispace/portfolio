import { useEffect, useRef, useState } from "react";
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform, type OGLRenderingContext } from "ogl";
import { colors, withAlpha } from "@/app/theme/tokens";

// A circular, infinitely-wrapping WebGL photo carousel — ported from the
// mechanics of https://github.com/bizarro/infinite-circular-webgl-gallery
// (Codrops, MIT licensed), reworked to run confined to a container element
// instead of the page: its own canvas size, its own scroll/drag capture,
// no window-level listeners. Drag or scroll horizontally to spin.

const galleryModules = import.meta.glob<{ default: string }>(
  "@/assets/personal/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true }
);
const GALLERY_IMAGES = Object.keys(galleryModules)
  .sort()
  .map((key) => galleryModules[key].default);

const VERTEX = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uWaveAmp;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z = (sin(p.x * 4.0 + uTime) + cos(p.y * 2.0 + uTime)) * uWaveAmp * (0.1 + uSpeed * 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;
  uniform vec2 uImageSizes;
  uniform vec2 uPlaneSizes;
  uniform sampler2D tMap;
  varying vec2 vUv;
  void main() {
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    gl_FragColor.rgb = texture2D(tMap, uv).rgb;
    gl_FragColor.a = 1.0;
  }
`;

const CARD_HEIGHT_FRACTION = 0.62; // card height as a fraction of the viewport height
const CARD_ASPECT = 0.78; // card width / height
const CARD_GAP_FRACTION = 0.16; // gap between cards as a fraction of card width
const ARC_FACTOR = 0.55; // how much cards dip toward the edges

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mapRange(n: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + ((n - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// Repeats the image list until there are enough cards for a smooth infinite wrap.
function ensureMinimumItems(images: string[], minimum = 10) {
  if (images.length === 0) return [];
  const out: string[] = [];
  while (out.length < minimum) out.push(...images);
  return out;
}

interface GalleryPlane {
  mesh: Mesh;
  program: Program;
  x: number;
  extra: number;
  width: number;
  widthTotal: number;
}

class CircularGalleryEngine {
  private container: HTMLElement;
  private renderer: Renderer;
  private gl: OGLRenderingContext;
  private camera: Camera;
  private scene: Transform;
  private planes: GalleryPlane[] = [];
  private raf = 0;
  private resizeObserver!: ResizeObserver;

  private screen = { width: 1, height: 1 };
  private viewport = { width: 1, height: 1 };

  private scroll = { current: 0, target: 0, last: 0, ease: 0.075 };
  private direction: "left" | "right" = "right";
  private isDown = false;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private snapTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(container: HTMLElement, images: string[]) {
    this.container = container;

    this.renderer = new Renderer({ alpha: false, dpr: Math.min(window.devicePixelRatio, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0.851, 0.827, 0.769, 1); // #d9d3c4 — soft neutral frame, close to the page cream

    const canvas = this.gl.canvas as HTMLCanvasElement;
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block", touchAction: "pan-y" });
    container.appendChild(canvas);

    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;

    this.scene = new Transform();

    this.onResize();
    this.createPlanes(images);
    this.addEventListeners();
    this.update();
  }

  private createPlanes(images: string[]) {
    const geometry = new Plane(this.gl, { heightSegments: 30, widthSegments: 60 });

    this.planes = images.map((src, index) => {
      const texture = new Texture(this.gl, { generateMipmaps: false });
      const program = new Program(this.gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        uniforms: {
          tMap: { value: texture },
          uPlaneSizes: { value: [0, 0] },
          uImageSizes: { value: [0, 0] },
          uSpeed: { value: 0 },
          uTime: { value: 100 * Math.random() },
          uWaveAmp: { value: 0 },
        },
      });

      const img = new Image();
      img.src = src;
      img.onload = () => {
        texture.image = img;
        program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
      };

      const mesh = new Mesh(this.gl, { geometry, program });
      mesh.setParent(this.scene);

      const plane: GalleryPlane = { mesh, program, x: 0, extra: 0, width: 0, widthTotal: 0 };
      this.layoutPlane(plane, index, images.length);
      return plane;
    });
  }

  private layoutPlane(plane: GalleryPlane, index: number, length: number) {
    plane.mesh.scale.y = this.viewport.height * CARD_HEIGHT_FRACTION;
    plane.mesh.scale.x = plane.mesh.scale.y * CARD_ASPECT;
    plane.program.uniforms.uPlaneSizes.value = [plane.mesh.scale.x, plane.mesh.scale.y];
    plane.program.uniforms.uWaveAmp.value = plane.mesh.scale.y * 0.08;

    const gap = plane.mesh.scale.x * CARD_GAP_FRACTION;
    plane.width = plane.mesh.scale.x + gap;
    plane.widthTotal = plane.width * length;
    plane.x = plane.width * index;
  }

  private onResize = () => {
    const rect = this.container.getBoundingClientRect();
    this.screen = { width: Math.max(rect.width, 1), height: Math.max(rect.height, 1) };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    this.planes.forEach((plane, i) => this.layoutPlane(plane, i, this.planes.length));
  };

  private onWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.scroll.target += event.deltaY * 0.0045;
    this.queueSnap();
  };

  private onPointerDown = (event: PointerEvent) => {
    this.isDown = true;
    this.dragStartX = event.clientX;
    this.dragStartScroll = this.scroll.target;
    this.container.style.cursor = "grabbing";
    if (this.snapTimeout) clearTimeout(this.snapTimeout);
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isDown) return;
    const distance = (this.dragStartX - event.clientX) * 0.012;
    this.scroll.target = this.dragStartScroll + distance;
  };

  private onPointerUp = () => {
    if (!this.isDown) return;
    this.isDown = false;
    this.container.style.cursor = "grab";
    this.queueSnap();
  };

  private queueSnap() {
    if (this.snapTimeout) clearTimeout(this.snapTimeout);
    this.snapTimeout = setTimeout(() => {
      const first = this.planes[0];
      if (!first) return;
      const itemIndex = Math.round(Math.abs(this.scroll.target) / first.width);
      const snapped = first.width * itemIndex;
      this.scroll.target = this.scroll.target < 0 ? -snapped : snapped;
    }, 180);
  }

  private addEventListeners() {
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.container);

    this.container.addEventListener("wheel", this.onWheel, { passive: false });
    this.container.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
  }

  private update = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    this.direction = this.scroll.current > this.scroll.last ? "right" : "left";
    const speed = this.scroll.current - this.scroll.last;

    this.planes.forEach((plane) => {
      const x = plane.x - this.scroll.current - plane.extra;
      plane.mesh.position.x = x;
      plane.mesh.position.y = (Math.cos((x / plane.widthTotal) * Math.PI) - 1) * (plane.mesh.scale.y * ARC_FACTOR);
      plane.mesh.rotation.z = mapRange(x, -plane.widthTotal, plane.widthTotal, Math.PI, -Math.PI);

      plane.program.uniforms.uTime.value += 0.04;
      plane.program.uniforms.uSpeed.value = speed;

      const offset = plane.mesh.scale.x / 2;
      const isBefore = x + offset < -this.viewport.width;
      const isAfter = x - offset > this.viewport.width;

      if (this.direction === "right" && isBefore) plane.extra -= plane.widthTotal;
      if (this.direction === "left" && isAfter) plane.extra += plane.widthTotal;
    });

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    if (this.snapTimeout) clearTimeout(this.snapTimeout);
    this.resizeObserver.disconnect();
    this.container.removeEventListener("wheel", this.onWheel);
    this.container.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    (this.gl.canvas as HTMLCanvasElement).remove();
  }
}

export function InfiniteCircularGallery({ height = 420 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasImages] = useState(GALLERY_IMAGES.length > 0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasImages) return;

    const engine = new CircularGalleryEngine(container, ensureMinimumItems(GALLERY_IMAGES));
    container.style.cursor = "grab";

    return () => engine.destroy();
  }, [hasImages]);

  if (!hasImages) {
    return (
      <div
        style={{
          height,
          borderRadius: 20,
          border: `1px dashed ${withAlpha(colors.ink, 0.15)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="font-caslon" style={{ fontSize: 14, color: withAlpha(colors.ink, 0.35), fontStyle: "italic" }}>
          drop photos into src/assets/personal/gallery to bring this gallery to life
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${withAlpha(colors.ink, 0.08)}`,
        position: "relative",
      }}
    />
  );
}
