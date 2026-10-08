// Site-wide text reveal: as a paragraph or heading scrolls into view, its lines
// rise up from behind a mask one after another (GSAP SplitText + ScrollTrigger).
// Once a block has finished revealing, the split is undone so React keeps owning
// the original DOM. Opt a block (and everything inside it) out with data-no-reveal.
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const TARGETS = "h1, h2, h3, h4, p, li, blockquote";
// interactive or dynamic bits that shouldn't be split
const SKIP = "[data-no-reveal], button, a, label, input, textarea, select, svg, [contenteditable]";

export function useScrollReveal(scroller: HTMLElement | null, enabled: boolean) {
  useEffect(() => {
    if (!scroller || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = new WeakSet<Element>();
    const live = new Set<{ split: SplitText; trigger: ScrollTrigger }>();
    let cancelled = false;

    const eligible = (el: Element) =>
      !seen.has(el) &&
      !el.closest(SKIP) &&
      !el.querySelector(TARGETS) && // innermost text blocks only
      (el.textContent ?? "").trim().length > 1 &&
      (el as HTMLElement).offsetParent !== null;

    const setup = () => {
      if (cancelled) return;
      scroller.querySelectorAll(TARGETS).forEach((el) => {
        if (!eligible(el)) return;
        seen.add(el);
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "reveal-line" });
        gsap.set(split.lines, { yPercent: 105 });
        const entry = {
          split,
          trigger: ScrollTrigger.create({
            trigger: el,
            scroller,
            start: "top 92%",
            once: true,
            onEnter: () => {
              gsap.to(split.lines, {
                yPercent: 0,
                duration: 1.05,
                ease: "expo.out",
                stagger: 0.09,
                onComplete: () => { split.revert(); live.delete(entry); },
              });
            },
          }),
        };
        live.add(entry);
      });
      ScrollTrigger.refresh();
    };

    // New content (loaded notes, opened panels) gets picked up as it appears.
    let pending = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(setup, 250);
    });

    document.fonts.ready.then(() => {
      if (cancelled) return;
      setup();
      observer.observe(scroller, { childList: true, subtree: true });
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(pending);
      live.forEach(({ split, trigger }) => { trigger.kill(); split.revert(); });
      live.clear();
    };
  }, [scroller, enabled]);
}
