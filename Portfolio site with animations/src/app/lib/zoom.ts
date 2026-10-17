// On desktop the whole site renders at 90% (html { zoom } in styles/layout.css), so it
// looks the same at the browser's 100% as it used to at 90%.
// Pointer coordinates and getBoundingClientRect() come back in screen px, while styles,
// offsets and scrollTop stay in the page's own px - toCss() converts screen → page px.
export function pageZoom(): number {
  if (typeof document === "undefined") return 1;
  const root = document.documentElement as HTMLElement & { currentCSSZoom?: number };
  const z = root.currentCSSZoom ?? parseFloat(getComputedStyle(root).zoom || "1");
  return z > 0 ? z : 1;
}

export const toCss = (screenPx: number) => screenPx / pageZoom();
