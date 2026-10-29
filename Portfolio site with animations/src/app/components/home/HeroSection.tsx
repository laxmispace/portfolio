import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion, useTransform } from "motion/react";
import { useScrollProgress } from "@/app/context/ScrollContext";
import { MobileHeader } from "@/app/components/layout/MobileHeader";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { Walker } from "@/app/components/walker/Walker";
import { colors, fonts, textStyles } from "@/app/theme/tokens";
import { Clouds, Night, PullCord, SLEEPER } from "@/app/components/home/HeroNight";

/** "IST - 06:30:12 PM" on desktop; `short` (phones) drops the zone and seconds: "06:30 PM". */
function LiveClock({ color, short = false, style }: { color: string; short?: boolean; style?: React.CSSProperties }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit", minute: "2-digit", ...(short ? {} : { second: "2-digit" }), hour12: true,
      }).toUpperCase();
      setTime(short ? t : `IST - ${t}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [short]);
  return (
    <p style={{ ...textStyles.label, ...style, color, transition: "color 0.7s" }}>
      {time}
    </p>
  );
}

// The phone's bottom-left place/time: a notch smaller and tighter than the usual label.
const CORNER = { fontSize: 10, lineHeight: "12px", fontWeight: 500 } as const;

// Entrances wait for the loading screen to finish (`ready`), so they play in view.
const EASE = [0.16, 1, 0.3, 1] as const;
// The copy glides up from the bottom of the screen into place as the loader fades.
const rise = (delay: number) => ({
  hidden: { opacity: 0, y: 260 },
  shown: { opacity: 1, y: 0, transition: { duration: 1.3, ease: EASE, delay } },
});
const fadeIn = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.8, ease: EASE, delay: 0.4 } },
};

export function HeroSection({ ready = true }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  const scrollYProgress = useScrollProgress(sectionRef, ["start start", "end start"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -38]);
  const state = ready ? "shown" : "hidden";
  // the pull cord's night mode - the hero only, and only for this visit
  const [night, setNight] = useState(false);
  const ink = night ? colors.sand : colors.ink;

  const copy = {
    fontFamily: fonts.serif,
    fontSize: isMobile ? 20 : 27,
    lineHeight: isMobile ? "27px" : "35px",
    fontWeight: isMobile ? 600 : 400, // phones: semibold, like "select projects"
    letterSpacing: "-0.01em",
    color: ink,
    transition: "color 0.7s",
  } as const;
  const br = isMobile ? " " : <br />;
  // at night the day's copy steps back (fainter, and on phones it squeezes down a size)
  // and a night-time line joins it at full size
  const dimmed = { opacity: night ? 0.5 : 1, transition: "opacity 0.7s" };
  const dayCopy = isMobile
    ? { ...copy, fontSize: night ? 15 : 20, lineHeight: night ? "20px" : "27px", transition: "color 0.7s, font-size 0.6s cubic-bezier(0.16, 1, 0.3, 1), line-height 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }
    : copy;

  return (
    <div ref={sectionRef} data-no-reveal style={{ height: isMobile ? "calc(100dvh - var(--mobile-nav-height))" : "calc(100vh / var(--page-zoom))", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <Night on={night} layer="below" isMobile={isMobile} />
      {/* the pull cord, hanging from the top edge */}
      <div style={{ position: "absolute", top: 0, ...(isMobile ? { right: 76 } : { right: "24%" }), zIndex: 6 }}>
        <PullCord on={night} onToggle={() => setNight((n) => !n)} height={isMobile ? 92 : 128} />
      </div>
      <motion.div style={{ display: "flex", flexDirection: "column", height: "100%", opacity, y: contentY, position: "relative", zIndex: 2 }}>
        <motion.div initial="hidden" animate={state} variants={fadeIn}>
          {isMobile ? (
            <div style={{ filter: night ? "invert(0.88) hue-rotate(180deg)" : undefined, transition: "filter 0.7s" }}>
              <MobileHeader />
            </div>
          ) : (
            <div className="flex items-center justify-between" style={{ padding: "24px 38px 0" }}>
              <p style={{ ...textStyles.label, color: ink, transition: "color 0.7s" }}>
                📍 based in bangalore
              </p>
              <LiveClock color={ink} />
            </div>
          )}
        </motion.div>

        {/* Intro copy */}
        <div style={{ padding: isMobile ? "28px 16px 0" : "40px 38px 0", position: "relative", zIndex: 1 }}>
          <motion.p initial="hidden" animate={state} variants={rise(0)} style={{ ...dayCopy, marginBottom: isMobile ? (night ? 10 : 16) : 30, transition: `${dayCopy.transition}, margin-bottom 0.6s` }}>
            <span style={dimmed}>
              I’m a product designer with 3+ years of work experience.{br}
              Previously designed experiences for ICICI Bank and a few B2B startups.
            </span>
          </motion.p>
          <motion.p initial="hidden" animate={state} variants={rise(0.1)} style={dayCopy}>
            <span style={dimmed}>
              Currently building small ai projects, upskilling and trying to be a{br}
              <em>Design Engineer</em> who can design, code and ship!
            </span>
          </motion.p>
          <AnimatePresence initial={false}>
            {night && (
              <motion.p
                key="night-line"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.35 } }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.3 } }}
                style={{ ...copy, marginTop: isMobile ? 16 : 30 }}
              >
                Nights are for books, rabbit holes, and ‘what if’ experiments.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* The walker strolls along the bottom right */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={ready ? { opacity: 1, x: 0, transition: { duration: 1.1, ease: EASE, delay: 0.25 } } : { opacity: 0, x: 60 }}
          style={
            isMobile
              ? { width: "min(78%, 40dvh)", alignSelf: "flex-end", marginTop: "auto", marginBottom: 40, marginRight: 8 } // tucked bottom-right, clear of the place/time block
              : { position: "absolute", right: "5%", bottom: "4%", width: "clamp(300px, 36%, 600px)" }
          }
        >
          <div style={{ position: "relative" }}>
            {/* clouds drift behind the walker */}
            <Clouds dim={night} />
            {/* by day the walker strolls; pull the cord and he's asleep on the moon instead */}
            <motion.div animate={{ opacity: night && SLEEPER ? 0 : 1 }} transition={{ duration: 0.6, ease: EASE }} style={{ position: "relative", zIndex: 1 }}>
              <Walker />
            </motion.div>
            <AnimatePresence>
              {night && SLEEPER && (
                <motion.div
                  key="sleeper"
                  initial={{ opacity: 0, y: 24, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: EASE, delay: 0.2 } }}
                  exit={{ opacity: 0, y: 16, transition: { duration: 0.4 } }}
                  style={{ position: "absolute", right: isMobile ? "6%" : "2%", bottom: 0, height: isMobile ? "100%" : "135%", zIndex: 2, pointerEvents: "none", transformOrigin: "50% 100%" }}
                >
                  {/* a slow, gentle float so he drifts in place instead of sitting still */}
                  <motion.img
                    src={SLEEPER}
                    alt="The character asleep on a crescent moon, tapping a boot as music notes drift up"
                    animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [-1.2, 1.2, -1.2] }}
                    transition={{ y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
                    style={{ display: "block", height: "100%", width: "auto", transformOrigin: "50% 70%" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        {/* phones: place and time in the bottom-left corner; the time lines up with the
            word "bangalore", not the pin, so the pin hangs in its own column */}
        {isMobile && (
          <motion.div
            initial="hidden"
            animate={state}
            variants={fadeIn}
            style={{ position: "absolute", left: 16, bottom: 8, zIndex: 3, display: "grid", gridTemplateColumns: "auto auto", columnGap: 4, alignItems: "center" }}
          >
            <span aria-hidden="true" style={{ ...textStyles.label, ...CORNER }}>📍</span>
            <p style={{ ...textStyles.label, ...CORNER, color: ink, transition: "color 0.7s" }}>bangalore</p>
            <span style={{ gridColumn: 2 }}><LiveClock color={ink} short style={CORNER} /></span>
          </motion.div>
        )}
      </motion.div>
      <Night on={night} layer="above" isMobile={isMobile} />
    </div>
  );
}
