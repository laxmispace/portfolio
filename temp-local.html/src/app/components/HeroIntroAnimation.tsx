import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import birdsVideo from "../../assets/birds.mp4";

// Web-sized copies (~500-1200KB each, longest edge 700px) of a curated subset —
// the originals were 20-28MB camera-resolution PNGs each; decoding 14 of those
// at once for on-screen elements the size of a playing card is what was causing
// the stacking animation and paper video to stutter. Keep this set small.
import stack1 from "../../assets/stack images /optimized/1.jpg";
import stack2 from "../../assets/stack images /optimized/3.jpg";
import stack3 from "../../assets/stack images /optimized/20260425_202946 1.jpg";
import stack4 from "../../assets/stack images /optimized/20260803_120723 1.jpg";
import stack5 from "../../assets/stack images /optimized/IMG_20250816_120031_492 1.jpg";
import stack6 from "../../assets/stack images /optimized/IMG_20250927_143726_376 1.jpg";
import stack7 from "../../assets/stack images /optimized/IMG_20260321_190702_856 1.jpg";

const CITIES = [
  { text: "ಬೆಂಗಳೂರು, IN", font: "'Noto Sans Kannada', sans-serif" },
  { text: "Bangalore, IN", font: "'Plus Jakarta Sans', sans-serif" },
  { text: "बैंगलोर, IN", font: "'Noto Sans Devanagari', sans-serif" },
  { text: "ബംഗളൂരു, IN", font: "'Noto Sans Malayalam', sans-serif" },
];
const CITY_LINE_HEIGHT = 32;

// Frame 37: starts as a 360×360 square, grows straight up/down to 360×728.
const BOX_WIDTH = 360;
const BOX_START_HEIGHT = 360;
const BOX_GROWN_HEIGHT = 728;

// The photo "scroll" filmstrip that plays inside the box while it grows —
// a horizontal row of rounded cards scrolling left to right.
const SCROLL_IMAGES = [stack1, stack2, stack3, stack4, stack5, stack6, stack7];
const CARD_WIDTH = 300;
const CARD_HEIGHT = 220;
// Duplicated so scrolling exactly one pass lands back on an identical frame —
// looks seamless even if a tick runs slightly long.
const SCROLL_LOOP = [...SCROLL_IMAGES, ...SCROLL_IMAGES];

interface Props {
  onComplete: () => void;
}

function IntroContent({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cityGroupRef = useRef<HTMLDivElement>(null);
  const citySpinnerRef = useRef<HTMLDivElement>(null);
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const scrollColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    video?.play().catch(() => {});

    const ctx = gsap.context(() => {
      // ── Initial states ────────────────────────────────────────────────────────
      gsap.set(boxRef.current, { height: BOX_START_HEIGHT, opacity: 0, scale: 0.92 });
      gsap.set(cityGroupRef.current, { opacity: 0 });
      gsap.set(citySpinnerRef.current, { y: 0 });
      gsap.set(scrollWrapRef.current, { opacity: 0 });
      gsap.set(scrollColRef.current, { x: -CARD_WIDTH * SCROLL_IMAGES.length });

      const tl = gsap.timeline();

      // ── PHASE 1: Plain beige backdrop + Frame 37 box, holding for 3s total ────
      // (box entrance + the city-name cycle both fit inside this 3s window)
      tl.to(boxRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });

      tl.to(cityGroupRef.current, { opacity: 1, duration: 0.25 });
      CITIES.forEach((_, i) => {
        if (i > 0) {
          tl.to(citySpinnerRef.current, { y: -i * CITY_LINE_HEIGHT, duration: 0.25, ease: "none" });
        }
        tl.to({}, { duration: 0.3 }); // brief hold on this language
      });
      tl.to(cityGroupRef.current, { opacity: 0, duration: 0.3 });
      // ^ entrance(0.5) + fadeIn(0.25) + 4×hold(0.3) + 3×transition(0.25) + fadeOut(0.3) = 3.0s

      // ── PHASE 2: Box grows straight up/down while the photo filmstrip scrolls
      // left to right underneath, at a linear (no eased curve) pace. ────────────
      tl.addLabel("grow");
      tl.to(boxRef.current, { height: BOX_GROWN_HEIGHT, duration: 1.1, ease: "none" }, "grow");
      tl.to(scrollWrapRef.current, { opacity: 1, duration: 0.15 }, "grow");
      tl.to(
        scrollColRef.current,
        { x: 0, duration: 2.6, ease: "none" },
        "grow"
      );

      // ── PHASE 3: Video + photo stack scale down to zero together — the hero
      // content loads in underneath, seamlessly. ────────────────────────────────
      tl.addLabel("out");
      tl.call(onComplete, undefined, "out");
      tl.set(overlayRef.current, { pointerEvents: "none" }, "out");
      tl.to(boxRef.current, { scale: 0, opacity: 0, duration: 0.55, ease: "power2.in" }, "out");

      // Fully done — unmount the intro overlay.
      tl.call(() => setVisible(false), undefined, "out+=0.6");
    });

    return () => ctx.revert();
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {/* Frame 37 — birds video, fixed 360px width, height grows 360→728 centered */}
      <div
        ref={boxRef}
        style={{
          position: "relative",
          width: BOX_WIDTH,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          transformOrigin: "center center",
        }}
      >
        <video
          ref={videoRef}
          src={birdsVideo}
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {/* City names — one language visible at a time, spinning to the next */}
        <div
          ref={cityGroupRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            opacity: 0,
          }}
        >
          <div style={{ height: CITY_LINE_HEIGHT, overflow: "hidden" }}>
            <div ref={citySpinnerRef}>
              {CITIES.map((city, i) => (
                <p
                  key={i}
                  style={{
                    margin: 0,
                    height: CITY_LINE_HEIGHT,
                    fontFamily: city.font,
                    fontSize: "clamp(13px, 2vw, 16px)",
                    fontWeight: 500,
                    color: "#1a1007",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: "1.1em" }}>📍</span>
                  {city.text}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Photo filmstrip — a horizontal row of rounded cards scrolling left to
            right, linear pace, over the video while the box grows */}
        <div
          ref={scrollWrapRef}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            height: CARD_HEIGHT,
            transform: "translateY(-50%)",
            overflow: "hidden",
            opacity: 0,
          }}
        >
          <div ref={scrollColRef} style={{ display: "flex" }}>
            {SCROLL_LOOP.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                decoding="async"
                style={{
                  display: "block",
                  flexShrink: 0,
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroIntroAnimation({ onComplete }: Props) {
  return createPortal(<IntroContent onComplete={onComplete} />, document.body);
}
