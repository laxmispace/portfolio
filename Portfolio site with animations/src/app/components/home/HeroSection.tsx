import { useState, useEffect, useRef } from "react";
import { motion, useTransform } from "motion/react";
import { useScrollProgress } from "@/app/context/ScrollContext";
import { MobileHeader } from "@/app/components/layout/MobileHeader";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { Walker } from "@/app/components/walker/Walker";
import { colors, fonts } from "@/app/theme/tokens";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      });
      setTime(`IST - ${t.toUpperCase()}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="font-inclusive-sans font-semibold text-ink uppercase" style={{ fontSize: 12, letterSpacing: "0.48px" }}>
      {time}
    </p>
  );
}

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

  const scrollYProgress = useScrollProgress(sectionRef, ["start start", "end start"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -38]);
  const state = ready ? "shown" : "hidden";

  const copy = {
    fontFamily: fonts.serif,
    fontSize: isMobile ? 20 : 27,
    lineHeight: isMobile ? "27px" : "35px",
    letterSpacing: "-0.01em",
    color: colors.ink,
  } as const;
  const br = isMobile ? " " : <br />;

  return (
    <div ref={sectionRef} data-no-reveal style={{ height: isMobile ? "calc(100dvh - var(--mobile-nav-height))" : "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <motion.div style={{ display: "flex", flexDirection: "column", height: "100%", opacity, y: contentY, position: "relative", zIndex: 2 }}>
        <motion.div initial="hidden" animate={state} variants={fadeIn}>
          {isMobile ? (
            <MobileHeader />
          ) : (
            <div className="flex items-center justify-between" style={{ padding: "24px 38px 0" }}>
              <p className="font-inclusive-sans font-semibold text-ink uppercase" style={{ fontSize: 12, letterSpacing: "0.48px" }}>
                📍 based in bangalore
              </p>
              <LiveClock />
            </div>
          )}
        </motion.div>

        {/* Intro copy */}
        <div style={{ padding: isMobile ? "28px 16px 0" : "40px 38px 0", position: "relative", zIndex: 1 }}>
          <motion.p initial="hidden" animate={state} variants={rise(0)} style={{ ...copy, color: colors.oliveDeep, marginBottom: isMobile ? 16 : 30 }}>
            Hello, this is Laxmi!
          </motion.p>
          <motion.p initial="hidden" animate={state} variants={rise(0.1)} style={{ ...copy, marginBottom: isMobile ? 16 : 30 }}>
            I’m a product designer with 3+ years of work experience.{br}
            Previously designed experiences for ICICI Bank and a few B2B startups.
          </motion.p>
          <motion.p initial="hidden" animate={state} variants={rise(0.2)} style={copy}>
            Currently building small ai projects, upskilling and trying to be a{br}
            <em>Design Engineer</em> who can design, code and ship!
          </motion.p>
        </div>

        {/* The walker strolls along the bottom right */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={ready ? { opacity: 1, x: 0, transition: { duration: 1.1, ease: EASE, delay: 0.25 } } : { opacity: 0, x: 60 }}
          style={
            isMobile
              ? { width: "min(80%, 40dvh)", alignSelf: "flex-end", marginTop: "auto", marginBottom: 20, marginRight: 8 }
              : { position: "absolute", right: "5%", bottom: "4%", width: "clamp(300px, 36%, 600px)" }
          }
        >
          <Walker />
        </motion.div>
      </motion.div>
    </div>
  );
}
