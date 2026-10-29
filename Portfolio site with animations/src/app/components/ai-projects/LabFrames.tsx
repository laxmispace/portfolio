import type { CSSProperties } from "react";
import { colors, withAlpha } from "@/app/theme/tokens";

/** One-of-a-kind pills: the chosen one filled, the others outlined, so it's clear they're choices. */
export function pillStyle(on: boolean, ground: "light" | "dark" = "light"): CSSProperties {
  const fg = ground === "light" ? colors.ink : colors.sand;
  const bg = ground === "light" ? colors.sand : colors.ink;
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 11px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    lineHeight: "14px",
    fontWeight: 400,
    background: on ? fg : "transparent",
    color: on ? bg : withAlpha(fg, 0.75),
    boxShadow: on ? "none" : `inset 0 0 0 1px ${withAlpha(fg, 0.35)}`,
    transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
  };
}

/** Tracks whether `el` is on screen, so a piece can skip drawing frames nobody can see
 *  (keeps scrolling smooth on a phone). Returns the cleanup. */
export function watchVisible(el: Element, onChange: (visible: boolean) => void): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  const io = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), { rootMargin: "100px" });
  io.observe(el);
  return () => io.disconnect();
}
