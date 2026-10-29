import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { colors, withAlpha } from "@/app/theme/tokens";
import { GITHUB_URL, GITHUB_USER } from "@/app/lib/links";

// ── GitHub card: the contribution graph (the green squares), in the site's olives ──
// Data comes from a free public API that scrapes the GitHub profile, so the static
// site needs no token. Only as many recent weeks as fit the card's width are drawn.

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

const API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;
const CARD_HEIGHT = 188;
const CELL = 10;
const GAP = 3;

// Empty → busiest, in the site's olives.
const LEVELS = [colors.sandBorder, colors.oliveLight, colors.olive, withAlpha(colors.oliveDeep, 0.75), colors.oliveDeep];

// One fetch per page load, shared by every mount of the card.
let cache: Promise<{ total: number; days: Day[] }> | null = null;
function loadContributions() {
  cache ??= fetch(API)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d: { total: { lastYear: number }; contributions: Day[] }) => ({ total: d.total.lastYear, days: d.contributions }))
    .catch((e) => {
      cache = null; // let the next open try again
      throw e;
    });
  return cache;
}

// Columns of 7 (Sunday → Saturday); the first week is padded so weekdays line up.
function toWeeks(days: Day[]): (Day | null)[][] {
  if (!days.length) return [];
  const pad = new Date(days[0].date + "T00:00:00").getDay();
  const cells: (Day | null)[] = [...Array(pad).fill(null), ...days];
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function label(d: Day) {
  const when = new Date(d.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${d.count || "No"} contribution${d.count === 1 ? "" : "s"} on ${when}`;
}

/** `height` defaults to the card's own 188px; pass "100%" to match a taller neighbour. */
export function GithubCard({ isMobile, height = CARD_HEIGHT }: { isMobile: boolean; height?: number | string }) {
  const [data, setData] = useState<{ total: number; days: Day[] } | null>(null);
  const [fit, setFit] = useState(20);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    loadContributions().then((d) => live && setData(d), () => {}); // on failure the empty squares stay
    return () => { live = false; };
  }, []);

  // How many week columns fit the card right now.
  useLayoutEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;
    const measure = () => setFit(Math.max(1, Math.floor((el.clientWidth + GAP) / (CELL + GAP))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Squares ripple in from the newest week once the data lands.
  useEffect(() => {
    if (!data || !gridRef.current) return;
    const cols = gridRef.current.children;
    gsap.fromTo(cols, { opacity: 0, y: 3 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: { each: 0.012, from: "end" } });
  }, [data]);

  const weeks = data ? toWeeks(data.days).slice(-fit) : Array.from({ length: fit }, () => Array(7).fill(null));

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: "100%", height, backgroundColor: colors.sandLight, padding: `16px ${isMobile ? 12 : 16}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 16 : 20, lineHeight: isMobile ? "20px" : "26px", letterSpacing: "-0.01em", fontWeight: 600, color: colors.ink }}>GitHub contributions</p>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile" style={{ width: 24, height: 24, display: "block" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.5" />
            <path d="M9 15L15 9M15 9H10M15 9V14" stroke={colors.ink} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <div ref={gridWrapRef} style={{ display: "flex", justifyContent: "flex-end" }}>
        <div ref={gridRef} style={{ display: "flex", gap: GAP }}>
          {weeks.map((week, w) => (
            <div key={w} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {Array.from({ length: 7 }, (_, d) => {
                const day = week[d];
                return (
                  <span
                    key={d}
                    title={day ? label(day) : undefined}
                    style={{ width: CELL, height: CELL, borderRadius: 2.5, backgroundColor: day ? LEVELS[day.level] : data ? "transparent" : colors.sand }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
