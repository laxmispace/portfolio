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
      setTime(`IST — ${t.toUpperCase()}`);
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
const rise = (delay: number) => ({
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE, delay } },
});

export function HeroSection({ ready = true }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollYProgress = useScrollProgress(sectionRef, ["start start", "end start"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -38]);
  const state = ready ? "shown" : "hidden";

  const copy = {
    fontFamily: fonts.serif,
    fontSize: isMobile ? 24 : 36,
    lineHeight: isMobile ? "31px" : "46px",
    letterSpacing: "-0.01em",
    color: colors.ink,
  } as const;
  const br = isMobile ? " " : <br />;

  return (
    <div ref={sectionRef} style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <motion.div style={{ display: "flex", flexDirection: "column", height: "100%", opacity, y: contentY, position: "relative", zIndex: 2 }}>
        <motion.div initial="hidden" animate={state} variants={rise(0)}>
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
        <div style={{ padding: isMobile ? "40px 16px 0" : "clamp(48px, 9vh, 112px) 12% 0", position: "relative", zIndex: 1 }}>
          <motion.p initial="hidden" animate={state} variants={rise(0.1)} style={{ ...copy, color: colors.oliveDeep, marginBottom: isMobile ? 24 : 40 }}>
            Hello, this is Laxmi!
          </motion.p>
          <motion.p initial="hidden" animate={state} variants={rise(0.2)} style={{ ...copy, marginBottom: isMobile ? 24 : 40 }}>
            I’m a product designer with 3+ years of work experience.{br}
            Previously designed experiences for ICICI Bank and a few B2B startups.
          </motion.p>
          <motion.p initial="hidden" animate={state} variants={rise(0.3)} style={copy}>
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
              ? { width: "82%", alignSelf: "flex-end", marginTop: "auto", marginBottom: 32, marginRight: 8 }
              : { position: "absolute", right: "5%", bottom: "4%", width: "clamp(300px, 36%, 600px)" }
          }
        >
          <Walker />
        </motion.div>
      </motion.div>
    </div>
  );
}
