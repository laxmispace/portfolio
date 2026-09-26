import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollContext } from "@/app/context/ScrollContext";
import { SideNav, type NavSection } from "@/app/components/layout/SideNav";
import { AboutMeDrawer } from "@/app/components/about/AboutMeDrawer";
import { HeroSection } from "@/app/components/home/HeroSection";
import { ProjectsSection } from "@/app/components/home/ProjectsSection";
import { AiProjectsSection } from "@/app/components/home/AiProjectsSection";
import { BlogSection } from "@/app/components/home/BlogSection";
import { AiProjectsPage } from "@/app/components/ai-projects/AiProjectsPage";
import { PersonalSection } from "@/app/components/home/PersonalSection";
import { MobileBottomNav } from "@/app/components/layout/MobileBottomNav";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { softTick } from "@/app/lib/feedback";
import { colors } from "@/app/theme/tokens";
 
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
            background: `linear-gradient(to right, ${colors.oliveDeep}, ${colors.olive}, ${colors.orange}, ${colors.pink})`,
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
    if (typeof window === "undefined") return false;
    const returningFromSpotify =
      window.location.search.includes("code=") ||
      sessionStorage.getItem("spotify_reopen_about") === "1";
    if (returningFromSpotify) sessionStorage.removeItem("spotify_reopen_about");
    return returningFromSpotify;
  });
  const [csDrawerOpen, setCsDrawerOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const scrollCallbackRef = useCallback((node: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setScrollEl(node);
  }, []);

  // Stable individual refs (rules-of-hooks: same call order every render)
  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aiProjectsRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);

  // Suppress the manual-scroll sound while a nav-driven smooth scroll is running.
  const programmaticUntil = useRef(0);
  const scrollIdle = useRef(true);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout>>();

  const navigateTo = useCallback((section: NavSection) => {
    const map: Record<NavSection, React.RefObject<HTMLDivElement | null>> = {
      home: homeRef, projects: projectsRef, "ai-projects": aiProjectsRef, blog: blogRef,
    };
    const target = map[section].current;
    const container = scrollRef.current;
    if (!target || !container) return;
    programmaticUntil.current = Date.now() + 800;
    container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    setActiveSection(section);
  }, []);

  // One soft blip at the start of each manual scroll gesture (not nav clicks).
  const handleCardScroll = useCallback(() => {
    if (Date.now() < programmaticUntil.current) return;
    if (scrollIdle.current) {
      scrollIdle.current = false;
      softTick(0.028);
    }
    clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = setTimeout(() => { scrollIdle.current = true; }, 240);
  }, []);

  // Lock background scroll while the About Me drawer is open — otherwise
  // wheel/trackpad input over the drawer also scrolls the page behind it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.overflowY = aboutOpen ? "hidden" : "auto";
  }, [aboutOpen]);

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
        const order: NavSection[] = ["home", "projects", "ai-projects", "blog"];
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

    [homeRef, projectsRef, aiProjectsRef, blogRef].forEach((r) => {
      if (r.current) observer.observe(r.current);
    });

    return () => observer.disconnect();
    // Re-run once the scroll element (and with it the section refs) has mounted —
    // on first render those refs are still null and nothing gets observed.
  }, [scrollEl]);

  if (page === "ai-projects") {
    return (
      <div
        className="h-screen w-screen"
        style={{ minWidth: 1280, backgroundColor: colors.ink, overflowY: "auto" }}
      >
        <AiProjectsPage onBack={() => setPage("portfolio")} />
      </div>
    );
  }

  return (
    <>
    <SiteLoader />
    <div
      className="app-shell h-screen w-screen bg-white flex overflow-hidden"
      style={{ padding: 12 }}
    >
      <div className="app-shell__panel flex flex-1 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.sandLight }}>
        <AboutMeDrawer
          open={aboutOpen}
          onClose={() => setAboutOpen(false)}
          onViewAiProjects={() => { setAboutOpen(false); setPage("ai-projects"); }}
        />
        <div className="app-shell__side-nav">
          <SideNav activeSection={activeSection} onNavigate={navigateTo} />
        </div>

        <div ref={scrollCallbackRef} onScroll={isMobile ? handleCardScroll : undefined} className="flex-1 overflow-y-auto app-shell__scroller" style={{ scrollbarWidth: "none", position: "relative" }}>

          <ScrollContext.Provider value={scrollEl}>
            <div
              className="rounded-2xl"
              style={{
                backgroundColor: colors.sand,
                minHeight: "100%",
                borderRadius: isMobile ? "0 0 16px 16px" : undefined,
              }}
            >
              {scrollEl && (
                <>
                  <div ref={homeRef} id="home">
                    <HeroSection />
                  </div>

                  <div ref={projectsRef} id="projects">
                    <ProjectsSection onDrawerChange={setCsDrawerOpen} />
                  </div>

                  <div ref={aiProjectsRef} id="ai-projects">
                    <AiProjectsSection onViewAll={() => setPage("ai-projects")} />
                  </div>

                  <PersonalSection onAboutOpen={() => setAboutOpen(true)} />

                  <div ref={blogRef} id="blog">
                    <BlogSection onDrawerChange={setBlogOpen} />
                  </div>
                </>
              )}
              {/* Breathing room above the card's rounded bottom edge */}
              <div className="rounded-b-2xl" style={{ height: isMobile ? 20 : 33, backgroundColor: isMobile ? colors.sand : colors.oliveLight }} />
            </div>
          </ScrollContext.Provider>
        </div>

        {/* Bottom nav band — fixed to the lower 20%, homepage only, no drawer open */}
        {isMobile && !aboutOpen && !csDrawerOpen && !blogOpen && (
          <MobileBottomNav activeSection={activeSection} onNavigate={navigateTo} />
        )}
      </div>
    </div>
    </>
  );
}
