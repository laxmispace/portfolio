// The walking character holding a flower, looping every 3 seconds. Used big in the
// hero and small on the loading screen. Each instance gets its own id prefix so the
// SVG's masks, gradients and leg shapes never clash between copies.
import { useEffect, useRef, type CSSProperties } from "react";
import markup from "@/assets/walker/walker.svg?raw";
import { initWalker } from "./initWalker";
import "./walker.css";

let instances = 0;

export function Walker({ className, style }: { className?: string; style?: CSSProperties }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const prefix = `wk${++instances}`;
    host.innerHTML = markup.replace(/(id="|url\(#|href="#)(walker-|leg)/g, `$1${prefix}-$2`);
    const svg = host.querySelector("svg");
    const destroy = svg ? initWalker(svg, prefix) : undefined;
    return () => {
      destroy?.();
      host.innerHTML = "";
    };
  }, []);

  return <div ref={hostRef} className={className} style={style} />;
}
