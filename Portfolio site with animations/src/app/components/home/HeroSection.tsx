import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, useTransform, AnimatePresence } from "motion/react";
import { useScrollProgress } from "@/app/context/ScrollContext";
import { MobileHeader } from "@/app/components/layout/MobileHeader";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import iciciSymbol from "@/assets/icici-symbol.png";
import backgroundVideo from "@/assets/background.mp4";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      });
      setTime(`IST — ${t.toUpperCase()}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="font-inclusive-sans font-semibold text-[#212012] uppercase" style={{ fontSize: 12, letterSpacing: "0.48px" }}>
      {time}
    </p>
  );
}

function LoadingTimer() {
  const [visible, setVisible] = useState(true);
  const R = 10;
  const CIRC = 2 * Math.PI * R;
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2900);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ position: "absolute", bottom: 36, right: 40, zIndex: 10 }}
        >
          <svg width={26} height={26} viewBox="0 0 26 26" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={13} cy={13} r={R} fill="none" stroke="#625e37" strokeWidth={1} opacity={0.18} />
            <motion.circle
              cx={13} cy={13} r={R}
              fill="none" stroke="#625e37" strokeWidth={1} strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2.2, ease: "linear", delay: 0.3 }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Decorative background video ───────────────────────────────────────────────
// The same clip dropped in twice, low-opacity and feather-masked so its
// rectangular edges dissolve into the cream page instead of showing a hard cut.
// Pulled from the test build's hero (src/assets/background.mp4).
function BackgroundVideo() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          width: 422,
          height: 750,
          left: -60,
          bottom: 40,
          overflow: "hidden",
          backgroundColor: "#e3d9ce",
          transform: "rotate(15.43deg)",
          isolation: "isolate",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
          maskImage: "radial-gradient(ellipse 62% 58% at center, black 32%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 58% at center, black 32%, transparent 78%)",
        }}
      >
        <video
          src={backgroundVideo}
          autoPlay muted loop playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "hard-light", display: "block" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          width: 482,
          height: 909,
          right: -120,
          top: -220,
          overflow: "hidden",
          backgroundColor: "#e3d9ce",
          transform: "scale(-1, -1)",
          isolation: "isolate",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
          maskImage: "radial-gradient(ellipse 62% 58% at center, black 32%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 58% at center, black 32%, transparent 78%)",
        }}
      >
        <video
          src={backgroundVideo}
          autoPlay muted loop playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "hard-light", display: "block" }}
        />
      </div>
    </>
  );
}

// ── Inline company marks ─────────────────────────────────────────────────────
// Flat olive tiles, 36×36 at 8px radius — matches the Figma spec exactly. ICICI
// carries its real symbol (cropped from the wordmark asset); viisa + efacts
// stay blank placeholders until their logo files exist.
function LogoTile({ children, size }: { children?: ReactNode; size: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * (8 / 36),
        backgroundColor: "#c3be6f",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

// Centered on the text box as one unit — `verticalAlign: middle` lines the
// whole row up on the text's middle rather than its baseline.
function CompanyRow({ size }: { size: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, verticalAlign: "middle" }}>
      <LogoTile size={size}>
        <img src={iciciSymbol} alt="ICICI Bank" style={{ width: size * 0.5, height: "auto", display: "block" }} />
      </LogoTile>
      <LogoTile size={size} />
      <LogoTile size={size} />
    </span>
  );
}

// ── Emphasis spans — dark/accent runs inside the olive body copy. Color only —
// the whole hero stays at Inclusive Sans medium (500), never semi-bold/bold. ──
function DarkText({ children, uppercase = false }: { children: ReactNode; uppercase?: boolean }) {
  return (
    <span style={{ color: "#1e1e1e", textTransform: uppercase ? "uppercase" : undefined }}>
      {children}
    </span>
  );
}
function AccentText({ children }: { children: ReactNode }) {
  return <span style={{ color: "#c67d39" }}>{children}</span>;
}

// ── Terminal-style typewriter for the closing line ─────────────────────────────
// Types the line out char-by-char behind a "›" prompt, holds, wipes it, and
// loops — a little running terminal. Blinking block caret throughout.
function TypewriterLine({ text, fontSize, marginTop }: { text: string; fontSize: number; marginTop: number }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (count < text.length) t = setTimeout(() => setCount((c) => c + 1), 52);
      else t = setTimeout(() => setPhase("holding"), 2600);
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), 1600);
    } else {
      if (count > 0) t = setTimeout(() => setCount((c) => c - 1), 26);
      else t = setTimeout(() => setPhase("typing"), 500);
    }
    return () => clearTimeout(t);
  }, [count, phase, text]);

  return (
    <p
      style={{
        fontFamily: "'Spline Sans Mono', ui-monospace, monospace",
        fontSize,
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
        color: "#625e37",
        marginTop,
        whiteSpace: "pre-wrap",
      }}
    >
      <span style={{ color: "#c67d39", opacity: 0.7 }}>{"› "}</span>
      {text.slice(0, count)}
      <motion.span
        aria-hidden
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.05, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
        style={{ color: "#625e37" }}
      >
        ▋
      </motion.span>
    </p>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollYProgress = useScrollProgress(sectionRef, ["start start", "end start"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -38]);

  return (
    <div ref={sectionRef} style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <BackgroundVideo />
      <LoadingTimer />

      <motion.div style={{ display: "flex", flexDirection: "column", height: "100%", opacity, y: contentY, position: "relative", zIndex: 2 }}>
        {isMobile ? (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
            <MobileHeader />
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center justify-between"
            style={{ padding: "24px 40px 0" }}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
            <p className="font-inclusive-sans font-semibold text-[#212012] uppercase" style={{ fontSize: 12, letterSpacing: "0.48px" }}>
            📍 based in bangalore
            </p>
            <LiveClock />
          </motion.div>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "0 12px 80px" : "0 160px 80px" }}>
          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ maxWidth: 700, textAlign: "left", width: "100%" }}
          >
            {/* Greeting — sentence case */}
            <motion.p
              className="font-inclusive-sans"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              style={{
                fontSize: isMobile ? 18 : 24,
                fontWeight: 500,
                lineHeight: isMobile ? "22px" : "28px",
                letterSpacing: "-0.01em",
                color: "#1e1e1e",
                marginBottom: isMobile ? 14 : 20,
              }}
            >
              Hello, this is Laxmi!
            </motion.p>

            <p
              className="font-inclusive-sans"
              style={{
                fontSize: isMobile ? 22 : 36,
                fontWeight: 400,
                lineHeight: isMobile ? "30px" : "48px",
                letterSpacing: "-0.02em",
                color: "#625e37",
              }}
            >
              {"I'm a "}
              <DarkText>product designer</DarkText>
              {" with "}
              <AccentText>3+ years</AccentText>
              {" "}
              <DarkText>of experience.</DarkText>
              {" Previously "}
              <DarkText>built products for</DarkText>
              {" "}
              <CompanyRow size={isMobile ? 26 : 36} />
              {"  "}
              <DarkText>  and have hand's-on experience working</DarkText>
              {" on design systems, designing intuitive UI's, prototyping, and building smaller functional ai projects."}
            </p>

            <TypewriterLine
              text="A rookie design engineer in the making."
              fontSize={isMobile ? 15 : 20}
              marginTop={isMobile ? 16 : 24}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
