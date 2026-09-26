// Page URLs, base-aware so they resolve at "/" locally and "/portfolio/" on GitHub Pages.
export const STYLE_GUIDE_PATH = `${import.meta.env.BASE_URL}style-guide`;

export const isStyleGuidePath = () => window.location.pathname.replace(/\/$/, "") === STYLE_GUIDE_PATH;
