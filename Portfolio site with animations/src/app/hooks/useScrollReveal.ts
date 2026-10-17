// Site-wide text reveal: as a paragraph or heading scrolls into view, its lines
// rise up from behind a mask one after another (GSAP SplitText).
// Visibility comes from an IntersectionObserver against the viewport, so it works
// in every scroller - the page card and the case study / blog / about drawers,
// which scroll on their own and never move the page card.
// Once a block has finished revealing, the split is undone so React keeps owning
// the original DOM. Opt a block (and everything inside it) out with data-no-reveal.
import { useEffect } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const TARGETS = "h1, h2, h3, h4, p, li, blockquote";
// interactive or dynamic bits that shouldn't be split
const SKIP = "[data-no-reveal], button, a, label, input, textarea, select, svg, [contenteditable]";
const CONTROLS = "button, input, textarea, select, [role='button'], [contenteditable]";

export function useScrollReveal(scroller: HTMLElement | null, enabled: boolean) {
  useEffect(() => {
    if (!scroller || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = new WeakSet<Element>();
    const splits = new Map<Element, SplitText>();
    let cancelled = false;

    const eligible = (el: Element) =>
      !seen.has(el) &&
      !el.closest(SKIP) &&
      !el.querySelector(TARGETS) && // innermost text blocks only
      !el.querySelector(CONTROLS) && // splitting rebuilds the DOM, which would drop React's handlers
      (el.textContent ?? "").trim().length > 1;

    const reveal = (el: Element) => {
      const split = splits.get(el);
      if (!split) return;
      splits.delete(el);
      gsap.to(split.lines, {
        yPercent: 0,
        duration: 1.05,
        ease: "expo.out",
        stagger: 0.09,
        onComplete: () => split.revert(),
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          reveal(e.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px" }
    );

    const setup = () => {
      if (cancelled) return;
      // Drawers live inside the page card or are portalled to <body>; both are covered.
      document.body.querySelectorAll(TARGETS).forEach((el) => {
        if (!eligible(el)) return;
        // not laid out yet (closed panel, hidden tab) - try again on a later pass
        if ((el as HTMLElement).offsetParent === null) return;
        seen.add(el);
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "reveal-line" });
        gsap.set(split.lines, { yPercent: 105 });
        splits.set(el, split);
        io.observe(el);
      });
    };

    // New content (opened drawers, loaded notes) gets picked up as it appears.
    let pending = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(setup, 60);
    });

    document.fonts.ready.then(() => {
      if (cancelled) return;
      setup();
      observer.observe(document.body, { childList: true, subtree: true });
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      io.disconnect();
      window.clearTimeout(pending);
      splits.forEach((split) => split.revert());
      splits.clear();
    };
  }, [scroller, enabled]);
}
