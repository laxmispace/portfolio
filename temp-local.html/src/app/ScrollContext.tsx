import { createContext, useContext, useEffect } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

export const ScrollContext = createContext<HTMLDivElement | null>(null);

export function useScrollContainer() {
  return useContext(ScrollContext);
}

type OffsetWord = "start" | "end";
type OffsetPair = [OffsetWord, OffsetWord];

function parseOffset(s: string): [number, number] {
  const [a, b] = s.split(" ") as [OffsetWord, OffsetWord];
  return [a === "start" ? 0 : 1, b === "start" ? 0 : 1];
}

// Computes scrollYProgress (0→1) equivalent to motion's useScroll({ target, container, offset }).
// Uses a plain scroll listener so no ref-hydration timing issues arise.
export function useScrollProgress(
  targetRef: React.RefObject<HTMLElement | null>,
  offset: [string, string] = ["start start", "end end"]
): MotionValue<number> {
  const container = useContext(ScrollContext);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!container) return;

    const [startOffset, endOffset] = offset.map(parseOffset) as [ReturnType<typeof parseOffset>, ReturnType<typeof parseOffset>];

    const compute = () => {
      const target = targetRef.current;
      if (!target) return;

      const cRect = container.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const cH = cRect.height;

      // target position relative to container scroll origin
      const tTop = tRect.top - cRect.top + scrollTop;
      const tH = tRect.height;

      // scroll position when progress = 0
      const startScroll = tTop + startOffset[0] * tH - startOffset[1] * cH;
      // scroll position when progress = 1
      const endScroll   = tTop + endOffset[0]   * tH - endOffset[1]   * cH;

      const range = endScroll - startScroll;
      const raw = range === 0 ? 0 : (scrollTop - startScroll) / range;
      progress.set(Math.max(0, Math.min(1, raw)));
    };

    container.addEventListener("scroll", compute, { passive: true });
    compute();
    return () => container.removeEventListener("scroll", compute);
  }, [container, targetRef, offset[0], offset[1]]);

  return progress;
}
