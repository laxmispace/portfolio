import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollContext } from "@/app/context/ScrollContext";
import { SideNav, type NavSection } from "@/app/components/layout/SideNav";
import { AboutMeDrawer } from "@/app/components/about/AboutMeDrawer";
import { HeroSection } from "@/app/components/home/HeroSection";
import { IntroLoader } from "@/app/components/layout/IntroLoader";
import { ProjectsSection } from "@/app/components/home/ProjectsSection";
import { AiProjectsSection } from "@/app/components/home/AiProjectsSection";
import { BlogSection } from "@/app/components/home/BlogSection";
import { GuestbookSection } from "@/app/components/home/GuestbookSection";
import { AiProjectsPage } from "@/app/components/ai-projects/AiProjectsPage";
import { PersonalSection } from "@/app/components/home/PersonalSection";
import { MobileBottomNav } from "@/app/components/layout/MobileBottomNav";
import { MadeWithLove } from "@/app/components/layout/MadeWithLove";
import { FOOTER_GROUND, SiteFooter } from "@/app/components/layout/SiteFooter";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { useScrollReveal } from "@/app/hooks/useScrollReveal";
import { softTick, windowsClick } from "@/app/lib/feedback";
import { colors } from "@/app/theme/tokens";
import { BASE_URL } from "@/app/lib/routedSelection";
 
type Page = "portfolio" | "ai-projects";

const LAB_HASH = "#lab";
// #lab, or a lab project at #lab/<slug>
const isLabHash = (hash: string) => hash === LAB_HASH || hash.startsWith(`${LAB_HASH}/`);
// The About Me drawer's own URL, e.g. /portfolio/about-me
const ABOUT_URL = `${BASE_URL}about-me`;
const isAboutPath = (pathname: string) => pathname.replace(/\/$/, "") === ABOUT_URL;
const NAV_SECTIONS: NavSection[] = ["home", "projects", "ai-projects", "about", "blog"];

export default function App() {
  const isMobile = useIsMobile();
  // The lab lives at #lab with its own history entry, so the browser's back button
  // (and the lab's own) return to the portfolio exactly where it was left.
  const [page, setPage] = useState<Page>(() => {
    if (typeof window === "undefined" || !isLabHash(window.location.hash)) return "portfolio";
    // Landed straight on the lab (a shared link): slip the portfolio in behind it, so the
    // browser's back button still goes home instead of off the site.
    if (!window.history.state?.lab) {
      const { pathname, search, hash } = window.location;
      window.history.replaceState(null, "", pathname + search);
      window.history.pushState({ lab: true }, "", hash);
    }
    return "ai-projects";
  });

  useEffect(() => {
    const onPop = () => {
      setPage(isLabHash(window.location.hash) ? "ai-projects" : "portfolio");
      setAboutOpen(isAboutPath(window.location.pathname));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openLab = useCallback(() => {
    window.history.pushState({ lab: true }, "", LAB_HASH);
    setPage("ai-projects");
  }, []);

  const closeLab = useCallback(() => {
    // Opened from the site: step back through history. Landed straight on #lab: just drop the hash.
    if (window.history.state?.lab) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setPage("portfolio");
  }, []);
  // The orange loading screen plays once per page load.
  // Landing straight on the lab skips it - it would only play over the lab.
  const [skipIntro] = useState(() => page === "ai-projects");
  const [introDone, setIntroDone] = useState(skipIntro);

  // Every button and link on the site answers with the old-Windows click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("button, a, [role='button']");
      if (el && !(el as HTMLButtonElement).disabled) windowsClick();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const [activeSection, setActiveSection] = useState<NavSection>("home");
  const [aboutOpen, setAboutOpen] = useState(() => {
    // Reopen the About Me drawer after the Spotify OAuth redirect lands back
    // here - the player that started the connect lives inside it.
    if (typeof window === "undefined") return false;
    const returningFromSpotify =
      window.location.search.includes("code=") ||
      sessionStorage.getItem("spotify_reopen_about") === "1";
    if (returningFromSpotify) sessionStorage.removeItem("spotify_reopen_about");
    return returningFromSpotify || isAboutPath(window.location.pathname);
  });

  // The About Me drawer gets its own URL too, so back closes it.
  const openAbout = useCallback(() => {
    window.history.pushState({ about: true }, "", ABOUT_URL);
    setAboutOpen(true);
  }, []);
  const closeAbout = useCallback(() => {
    if (window.history.state?.about) {
      window.history.back();
      return;
    }
    if (isAboutPath(window.location.pathname)) window.history.replaceState(null, "", BASE_URL);
    setAboutOpen(false);
  }, []);
  // Landed straight on /about-me: put the portfolio underneath so back stays on the site.
  useEffect(() => {
    if (!isAboutPath(window.location.pathname)) return;
    window.history.replaceState(null, "", BASE_URL);
    window.history.pushState({ about: true }, "", ABOUT_URL);
  }, []);
  const [csDrawerOpen, setCsDrawerOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  // Lines of text rise into place as they scroll into view (starts once the loader is gone).
  useScrollReveal(scrollEl, introDone);

  const scrollCallbackRef = useCallback((node: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setScrollEl(node);
  }, []);

  // Stable individual refs (rules-of-hooks: same call order every render)
  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aiProjectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);

  // Suppress the manual-scroll sound while a nav-driven smooth scroll is running.
  const programmaticUntil = useRef(0);
  const scrollIdle = useRef(true);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout>>();

  const navigateTo = useCallback((section: NavSection) => {
    const map: Record<NavSection, React.RefObject<HTMLDivElement | null>> = {
      home: homeRef, projects: projectsRef, "ai-projects": aiProjectsRef, about: aboutRef, blog: blogRef,
    };
    const target = map[section].current;
    const container = scrollRef.current;
    if (!target || !container) return;
    programmaticUntil.current = Date.now() + 800;
    container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    setActiveSection(section);
    // Each nav click gets its own URL: /portfolio/#projects (home is the bare URL).
    if (window.location.pathname.replace(/\/$/, "") === BASE_URL.replace(/\/$/, "") && !isLabHash(window.location.hash)) {
      window.history.replaceState(window.history.state, "", section === "home" ? BASE_URL : `${BASE_URL}#${section}`);
    }
  }, []);

  // Landed on /portfolio/#blog etc.: jump there once the page has rendered.
  useEffect(() => {
    if (!scrollEl || !introDone) return;
    const hash = window.location.hash.slice(1) as NavSection;
    if (!NAV_SECTIONS.includes(hash)) return;
    const t = setTimeout(() => navigateTo(hash), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollEl, introDone]);

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

  // Lock background scroll while the About Me drawer is open - otherwise
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
        const order: NavSection[] = ["home", "projects", "ai-projects", "about", "blog"];
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

    [homeRef, projectsRef, aiProjectsRef, aboutRef, blogRef].forEach((r) => {
      if (r.current) observer.observe(r.current);
    });

    return () => observer.disconnect();
    // Re-run once the scroll element (and with it the section refs) has mounted -
    // on first render those refs are still null and nothing gets observed.
  }, [scrollEl]);

  return (
    <>
    {/* The lab sits over the portfolio instead of replacing it, so coming back
        doesn't remount the site (and replay the intro) or lose the scroll spot. */}
    {page === "ai-projects" && (
      // inset: 0 instead of 100vh/100vw, so on a phone the scroller ends where the visible
      // screen does (100vh runs under the browser bars and clips the bottom)
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          backgroundColor: colors.ink,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <AiProjectsPage onBack={closeLab} />
      </div>
    )}
    {/* stays mounted so it can fade itself out over the hero */}
    {!skipIntro && <IntroLoader onDone={() => setIntroDone(true)} />}
    <div
      className="app-shell h-screen w-screen bg-white flex overflow-hidden"
      style={{ padding: 12 }}
    >
      <div className="app-shell__panel flex flex-1 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.sandLight }}>
        <AboutMeDrawer
          open={aboutOpen}
          onClose={closeAbout}
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
                    <HeroSection ready={introDone} />
                  </div>

                  <div ref={projectsRef} id="projects">
                    <ProjectsSection onDrawerChange={setCsDrawerOpen} />
                  </div>

                  <div ref={aiProjectsRef} id="ai-projects">
                    <AiProjectsSection onViewAll={openLab} />
                  </div>

                  <div ref={aboutRef} id="about">
                    <PersonalSection onAboutOpen={openAbout} />
                  </div>

                  <div ref={blogRef} id="blog">
                    <BlogSection onDrawerChange={setBlogOpen} />
                  </div>

                  <div id="guestbook">
                    <GuestbookSection isMobile={isMobile} />
                  </div>

                  <SiteFooter isMobile={isMobile} />
                </>
              )}
              {/* the footer's dark ground runs on a little past the drawing */}
              <div className={isMobile ? undefined : "rounded-b-2xl"} style={{ height: isMobile ? 24 : 33, marginTop: -1, position: "relative", backgroundColor: FOOTER_GROUND }} />
              {/* On phones the sign-off sits on its own strip, in the ground's colour, at the very end of the page, not in the sticky nav */}
              {isMobile && (
                <div className="rounded-b-2xl" style={{ display: "flex", justifyContent: "center", padding: "14px 16px 16px", backgroundColor: FOOTER_GROUND }}>
                  <MadeWithLove fontSize={13} color={colors.sand} heart={colors.sand} />
                </div>
              )}
            </div>
          </ScrollContext.Provider>
        </div>

        {/* Bottom nav band - fixed to the lower 20%, homepage only, no drawer open */}
        {isMobile && page === "portfolio" && !aboutOpen && !csDrawerOpen && !blogOpen && (
          <MobileBottomNav activeSection={activeSection} onNavigate={navigateTo} />
        )}
      </div>
    </div>
    </>
  );
}
