import { useState, useEffect, useRef } from "react";
import { motion, useTransform, AnimatePresence } from "motion/react";
import { useScrollProgress } from "../ScrollContext";
import { MobileHeader } from "./MobileHeader";
import { useIsMobile } from "../useIsMobile";
import { Polaroid } from "./Polaroid";
import myPhoto from "../../assets/my-photo.jpg";

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

// ── Floating annotation callout ────────────────────────────────────────────────
function Annotation({
  label, value, color, left, top, rot, delay, floatAmp = 8, floatDur = 3.4, small = false,
}: {
  label: string; value: string; color: string;
  left: string; top: string; rot: number; delay: number;
  floatAmp?: number; floatDur?: number; small?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.78, y: 14, rotate: rot - 5 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: rot }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ position: "absolute", left, top, zIndex: 5, pointerEvents: "none" }}
    >
      <motion.div
        animate={{ y: [0, -floatAmp, 0] }}
        transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut", delay: delay * 0.4 }}
        style={{
          backgroundColor: color,
          borderRadius: small ? 8 : 12,
          padding: small ? "6px 10px" : "10px 14px",
          boxShadow: "0 4px 20px rgba(33,32,18,0.11), 0 1px 4px rgba(33,32,18,0.07)",
          border: "1.5px solid rgba(255,255,255,0.55)",
          minWidth: small ? 72 : 96,
        }}
      >
        <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: small ? 7 : 9, letterSpacing: "0.55px", color: "rgba(33,32,18,0.42)", marginBottom: 2 }}>{label}</p>
        <p className="font-caslon not-italic" style={{ fontSize: small ? 13 : 18, color: "#212012", fontWeight: 600, lineHeight: small ? "17px" : "22px", whiteSpace: "nowrap" }}>{value}</p>
      </motion.div>
      <svg style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", overflow: "visible", opacity: 0.22 }} width={2} height={18}>
        <line x1={1} y1={0} x2={1} y2={18} stroke="#212012" strokeWidth={1.5} strokeDasharray="2 3" />
      </svg>
    </motion.div>
  );
}

// ── Scribble underline for "canvs" ─────────────────────────────────────────────
function ScribbleUnderline({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 80 8" fill="none" style={{ position: "absolute", bottom: -3, left: 0, width: "100%", height: 8, overflow: "visible" }}>
      <motion.path
        d="M1 5.5 C 14 2, 28 7.5, 42 4, 56 0.5, 68 6.5, 79 3"
        stroke="#c67d39"
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollYProgress = useScrollProgress(sectionRef, ["start start", "end start"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -38]);

  return (
    <div ref={sectionRef} style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <LoadingTimer />

      {/* Floating annotation cards */}
      {isMobile ? (
        <>
          <Annotation small label="reach"      value="10M+ users"    color="#c3be6f" left="2%"  top="18%" rot={-5} delay={1.1}  floatAmp={5}  floatDur={3.9} />
          <Annotation small label="experience" value="3 yrs"         color="#dda1ae" left="62%" top="14%" rot={4}  delay={1.35} floatAmp={7}  floatDur={3.2} />
          <Annotation small label="status"     value="open rn ✦"    color="#e3d9ce" left="58%" top="62%" rot={-3} delay={1.55} floatAmp={6}  floatDur={4.1} />
          <Annotation small label="vibe"       value="tinkering"     color="#c67d39" left="2%"  top="64%" rot={5}  delay={1.75} floatAmp={8}  floatDur={2.9} />
        </>
      ) : (
        <>
          <Annotation label="reach"      value="10M+ users"    color="#c3be6f" left="3%"  top="22%" rot={-6} delay={1.1}  floatAmp={6}  floatDur={3.9} />
          <Annotation label="experience" value="3 yrs shipped" color="#dda1ae" left="73%" top="15%" rot={5}  delay={1.35} floatAmp={9}  floatDur={3.2} />
          <Annotation label="status"     value="open rn ✦"    color="#e3d9ce" left="79%" top="58%" rot={-4} delay={1.55} floatAmp={7}  floatDur={4.1} />
          <Annotation label="vibe"       value="tinkering"     color="#c67d39" left="2%"  top="60%" rot={7}  delay={1.75} floatAmp={10} floatDur={2.9} />
        </>
      )}

      {/* Taped-in "that's me" polaroid — a real photo among the typographic annotations */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 14, rotate: -13 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: -8 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}
        style={{ position: "absolute", left: isMobile ? "5%" : "3%", top: "42%", zIndex: 5, pointerEvents: "auto" }}
      >
        <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
          <Polaroid src={myPhoto} caption="hi, that's me" width={isMobile ? 84 : 118} rotate={0} tapeRotate={6} />
        </motion.div>
      </motion.div>


      <motion.div style={{ display: "flex", flexDirection: "column", height: "100%", opacity, y: contentY }}>
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

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "0 16px 80px" : "0 160px 80px" }}>
          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ maxWidth: 700, textAlign: "center", width: "100%" }}
          >
            <p className="font-caslon text-black text-center" style={{ fontSize: isMobile ? 24 : 48, lineHeight: isMobile ? "34px" : "58px" }}>
              <em>product designer.</em>
              {" three years shipping real product, most of it at "}
              <span style={{ position: "relative", display: "inline-block" }}>
                <em>canvs</em>
                {!isMobile && <ScribbleUnderline delay={0.9} />}
              </span>
              {", reshaping how "}
              <em>10M+ icici bank users</em>
              {" experience money. tinkering with ai, writing obsessively, looking for a startup worth getting obsessed over."}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 32 }}
            >
              <motion.span
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#c3be6f", display: "inline-block" }}
              />
              <p className="font-inclusive-sans font-medium" style={{ fontSize: 12, color: "#625e37", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                open to work
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
