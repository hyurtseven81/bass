# Bass

Personal bass guitar reference site — jazz cheat sheet, stage setlist, natural harmonics map. Built with Astro, deployed to GitHub Pages as a static PWA. Works offline on stage after first load.

Live: https://hyurtseven81.github.io/bass/

## Pages

- `/` — hub
- `/cheat-sheet/` — modes, chord voicings, fretboard renderer
- `/setlist/` — live performance setlist with collapsible song cards
- `/harmonic-map/` — 24-fret 4-string natural harmonics, partials 2–7

## Local development

```bash
npm install
npm run dev       # http://localhost:4321/bass/
npm run build     # → dist/
npm run preview   # serves the built dist/ at http://localhost:4321/bass/
```

Node 20+ recommended (CI uses 22).

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds and publishes to GitHub Pages via `withastro/action@v3`. No local deploy step needed.

First-time repo setup:
1. Create public repo `hyurtseven81/bass` on GitHub.
2. Push the code.
3. In the repo, Settings → Pages → Source: **GitHub Actions**.
4. Push to main; the first workflow run provisions the Pages site.

## Offline / PWA

The site ships a service worker (`sw.js`) that precaches all pages, CSS, fonts, and the icon. On a phone, open the site once over any connection, then tap "Add to Home Screen" — it launches standalone and survives offline (venue wifi dying no longer kills the setlist).

## Architecture

- `src/pages/*.astro` — one `.astro` file per route. Currently each page carries its own inline CSS and `<script is:inline>` block (data-driven fretboard/chord renderers). Safe to migrate incrementally to components.
- `public/` — static files copied verbatim to `dist/` (icon, manifest).
- `astro.config.mjs` — `site` + `base: '/bass'` for GH Pages, PWA integration.
- `backup/<date>/` — snapshot of the pre-Astro HTML files. Not used at runtime.

## Conventions

- All internal cross-page links use `import.meta.env.BASE_URL` (index) or relative `../route/` (other pages). Don't hardcode `/bass/` in source — the `base` config handles it.
- UTF-8 throughout (Turkish characters in the setlist; music symbols ♯ ♭ Δ ★ everywhere). Don't let an editor re-encode.
- Inline `<style>` and `<script>` are tagged `is:global` / `is:inline` so Astro doesn't scope-mangle them.
