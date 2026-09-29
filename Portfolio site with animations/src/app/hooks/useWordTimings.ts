import { useEffect, useState } from "react";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

// One array of word timings per paragraph, matching the shape written by
// scripts/generate-voiceovers.mjs. Returns null until loaded, or if the
// slug has no .words.json yet (narration not generated) — callers should
// fall back to plain text rendering in that case.
export function useWordTimings(url: string): WordTiming[][] | null {
  const [timings, setTimings] = useState<WordTiming[][] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTimings(null);
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setTimings(data);
      })
      .catch(() => {
        if (!cancelled) setTimings(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return timings;
}
