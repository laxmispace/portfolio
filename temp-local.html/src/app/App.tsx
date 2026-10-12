import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollContext } from "./ScrollContext";
import { SideNav, type NavSection } from "./components/SideNav";
import { AboutMeDrawer } from "./components/AboutMeDrawer";
import { HeroSection } from "./components/HeroSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { AiPlaygroundSection } from "./components/AiPlayground";
import { TinkeringSection } from "./components/TinkeringSection";
import { AiProjectsPage } from "./components/AiProjectsPage";
import { PersonalSection } from "./components/PersonalSection";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { useIsMobile } from "./useIsMobile";

// ── 0→100% site loading bar ───────────────────────────────────────────────────
// Fixed to the bottom of the viewport, fills left-to-right with a palette gradient,
// then fades out. Signals "page ready" without blocking interaction.
function SiteLoader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            scaleX: { duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] },
            opacity: { duration: 0.4 },
          }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 3,
            zIndex: 99999,
            transformOrigin: "left center",
            // All four palette colours: olive → yellow-green → orange → pink
            background: "linear-gradient(to right, #625e37, #c3be6f, #c67d39, #dda1ae)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [page, setPage] = useState<"portfolio" | "ai-projects">("portfolio");
  const [activeSection, setActiveSection] = useState<NavSection>("home");
  const [aboutOpen, setAboutOpen] = useState(() => {
    // Reopen the About Me drawer after the Spotify OAuth redirect lands back
    // here — the player that started the connect lives inside it.
    const returningFromSpotify = window.location.search.includes("code=") || sessionStorage.getItem("spotify_reopen_about") === "1";
    if (returningFromSpotify) sessionStorage.removeItem("spotify_reopen_about");
    return returningFromSpotify;
  });
  const [csDrawerOpen, setCsDrawerOpen] = useState(false);
  const [heroIntroDone, setHeroIntroDone] = useState(false);
  const handleHeroIntroComplete = useCallback(() => setHeroIntroDone(true), []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const scrollCallbackRef = useCallback((node: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setScrollEl(node);
  }, []);

  // Stable individual refs (rules-of-hooks: same call order every render)
  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const tinkeringRef = useRef<HTMLDivElement>(null);

  // Lock background scroll while the About Me drawer is open — otherwise
  // wheel/trackpad input over the drawer also scrolls the page behind it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.overflowY = aboutOpen ? "hidden" : "auto";
  }, [aboutOpen]);

  const navigateTo = useCallback((section: NavSection) => {
    const map: Record<NavSection, React.RefObject<HTMLDivElement | null>> = {
      home: homeRef, projects: projectsRef, "ai-playground": aiRef, tinkering: tinkeringRef,
    };
    const target = map[section].current;
    const container = scrollRef.current;
    if (!target || !container) return;
    container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    setActiveSection(section);
  }, []);

  // IntersectionObserver: section becomes active when it crosses the viewport midpoint.
  // This works correctly even for the sticky projects zone (100vh + 1200px tall).
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const intersecting = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => intersecting.set(e.target.id, e.isIntersecting));

        // First section in DOM order that is currently crossing the centre wins
        const order: NavSection[] = ["home", "projects", "ai-playground", "tinkering"];
        for (const id of order) {
          if (intersecting.get(id)) {
            setActiveSection(id);
            break;
          }
        }
      },
      {
        root: container,
        rootMargin: "-49% 0px -49% 0px", // thin 2% band at viewport centre
        threshold: 0,
      }
    );

    [homeRef, projectsRef, aiRef, tinkeringRef].forEach((r) => {
      if (r.current) observer.observe(r.current);
    });

    return () => observer.disconnect();
  }, []);

  if (page === "ai-projects") {
    return (
      <div className="h-screen w-screen" style={{ minWidth: 1280, backgroundColor: "#212012" }}>
        <AiProjectsPage onBack={() => setPage("portfolio")} />
      </div>
    );
  }

  return (
    <>
    <SiteLoader />
    <style>{`
      ::-webkit-scrollbar { display: none; }
      * { box-sizing: border-box; }
      @media (max-width: 768px) {
        .portfolio-outer { padding: 0 !important; }
        .portfolio-inner { border-radius: 0 !important; }
        .side-nav-hide { display: none !important; }
        .m-hide { display: none !important; }
        .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
        .m-pad-section { padding: 48px 16px 64px !important; }
        .m-col { flex-direction: column !important; }
        .m-full { width: 100% !important; min-width: unset !important; }
        .m-text-sm { font-size: 28px !important; line-height: 38px !important; }
        .m-text-hero { font-size: 30px !important; line-height: 42px !important; }
        .m-text-section { font-size: 28px !important; line-height: 36px !important; }
        .m-stack { flex-direction: column !important; flex-wrap: wrap !important; }
        .m-no-scroll { overflow: visible !important; }
        .m-card-h { height: auto !important; min-height: 320px !important; }
      }
    `}</style>
    <div
      className="portfolio-outer h-screen w-screen bg-white flex overflow-hidden"
      style={{ padding: 12 }}
    >
      <div className="portfolio-inner flex flex-1 rounded-2xl overflow-hidden" style={{ backgroundColor: "#ece6df" }}>
        <AboutMeDrawer
          open={aboutOpen}
          onClose={() => setAboutOpen(false)}
          onViewAiProjects={() => { setAboutOpen(false); setPage("ai-projects"); }}
        />
        {/* Not rendered at all until the hero intro finishes — the sidebar's own
            width would otherwise be reserved in this flex row even at opacity 0,
            pushing the intro animation off true center of the full card. */}
        {heroIntroDone && (
          <motion.div
            className="side-nav-hide"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <SideNav activeSection={activeSection} onNavigate={navigateTo} />
          </motion.div>
        )}

        <div ref={scrollCallbackRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", position: "relative" }}>

          <ScrollContext.Provider value={scrollEl}>
            <div className="rounded-2xl" style={{ backgroundColor: "#e3d9ce", minHeight: "100%" }}>
              {scrollEl && (
                <>
                  <div ref={homeRef} id="home">
                    <HeroSection onIntroComplete={handleHeroIntroComplete} />
                  </div>

                  <div ref={projectsRef} id="projects">
                    <ProjectsSection onDrawerChange={setCsDrawerOpen} />
                  </div>

                  <div ref={aiRef} id="ai-playground">
                    <AiPlaygroundSection onViewAll={() => setPage("ai-projects")} />
                  </div>

                  <PersonalSection onAboutOpen={() => setAboutOpen(true)} />

                  <div ref={tinkeringRef} id="tinkering">
                    <TinkeringSection />
                  </div>
                </>
              )}
              {/* Extra bottom space so floating mobile nav doesn't cover content */}
              <div className="rounded-b-2xl" style={{ height: isMobile ? 72 : 33, backgroundColor: "#d2ce93" }} />
            </div>
          </ScrollContext.Provider>
        </div>
      </div>
    </div>

    {/* Mobile bottom nav — hidden when any drawer is open */}
    {isMobile && !aboutOpen && !csDrawerOpen && (
      <MobileBottomNav activeSection={activeSection} onNavigate={navigateTo} />
    )}
    </>
  );
}
