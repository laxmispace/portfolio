# Laxmi Mahajan — portfolio

React 18 + Vite + Motion, deployed to GitHub Pages at `/portfolio/`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build (needs `CASE_STUDY_PASSWORD`, see below) |
| `pnpm typecheck` | Strict TypeScript check, including unused code |
| `pnpm voiceover` | Regenerate case study / blog narration |

## Case study password

Case studies 1 and 2 are encrypted at build time with `CASE_STUDY_PASSWORD`
(AES-256-GCM) and decrypted in the browser after unlock. Set it in
`.env.local` for local work (git-ignored) and as a repository secret for the
GitHub Actions deploy. The build fails without it, and also fails if any case
study text leaks into the public bundle.

## Structure

```
src/
  app/
    App.tsx                 page shell + routing (portfolio, ai projects, style guide)
    components/
      layout/               side nav, mobile header / bottom nav / FAB, made-with-love
      home/                 homepage sections (hero, projects, AI projects, personal, blog)
      case-study/           drawer, password gate, shared primitives, protected content
      about/                About me drawer and photo gallery
      ai-projects/          AI projects page, project drawer, card artwork, animation demos
      blog/                 blog post drawer and list layouts
      style-guide/          /style-guide — the design system page
    theme/tokens.ts         colours, fonts, type scale, spacing, radii, shadows, motion
    context/  hooks/  lib/  data/
  assets/                   images, fonts, video (kebab-case paths)
  styles/                   global CSS: fonts, Tailwind, theme variables, app-shell layout
extensions/                 source of the job-tracker Chrome extension (not part of the site)
```

## Conventions

- Components: `PascalCase.tsx`, one main component per file; hooks `useThing.ts`;
  other modules `camelCase.ts`; folders and asset paths `kebab-case`.
- Constants `UPPER_SNAKE_CASE`; props for the phone layout are always `isMobile`.
- Colours come from `colors` / `withAlpha()` in `theme/tokens.ts` (or the matching
  Tailwind utilities like `text-ink`), never raw hex.
- CSS classes use the component name as a prefix with BEM-style parts:
  `case-study-flow`, `app-shell__scroller`, `ai-project-card__photo--piano`.
- Imports outside the current folder use the `@/` alias.
