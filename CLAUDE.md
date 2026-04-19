# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Static Astro site deployed to GitHub Pages as an offline-capable PWA (`https://hyurtseven81.github.io/bass/`). Four pages: hub, jazz cheat sheet, stage setlist, natural harmonics map. The stage setlist is the load-bearing use case — it must work on a phone when venue wifi dies.

## Commands

```bash
npm install
npm run dev       # astro dev, http://localhost:4321/bass/
npm run build     # → dist/ (includes generated sw.js + precache)
npm run preview   # serves dist/ at http://localhost:4321/bass/
```

CI: `.github/workflows/deploy.yml` builds and deploys on push to `main` via `withastro/action@v3` + `actions/deploy-pages@v4`.

## Architecture

### Pages are currently verbatim HTML

Each file under `src/pages/` is a full `<!DOCTYPE html>` document wrapped in Astro frontmatter (empty `---\n---\n` at the top). They were migrated from standalone HTML files, so they carry their own inline `<style is:global>` and `<script is:inline>`. This is deliberate — those attrs keep Astro from scope-mangling CSS or module-wrapping the scripts, which would break the global renderers.

Two data-driven renderers to know about:

- `src/pages/cheat-sheet.astro` — bass guitar jazz theory. DOM is generated on `DOMContentLoaded` from `SCALES` and `CHORDS` objects via `drawFretboard(canvas, scaleData)` and `drawChordVoicing(canvas, voicingNotes, rootFret)`. Fretboard uses `STRING_OFFSETS = [0, 5, 10, 15]` (semitones from low E). Note-type colors live in CSS custom properties under `:root`.
- `src/pages/harmonic-map.astro` — natural harmonics. `drawFretboard(canvas, partials)` renders 24-fret 4-string boards with nodes at `f = 12 · log₂(k/(k−m))` for partial *k*, node *m*. `pitchForPartial(stringIdx, k)` uses MIDI math to label sounding pitches.

`src/pages/setlist.astro` isn't data-driven in the same way — each song is an authored `.card` element. Runtime JS layers interaction: `tog`/`toggleAll` (collapse), `filter(q)` (search, also hides empty sections), and `injectMedia()` which reads `SONG_MEDIA` (title → Google Drive file ID + Spotify search query) and inserts a media row into each matching card.

### Cross-page links and base path

`astro.config.mjs` sets `base: '/bass'`. Astro prepends this to asset URLs automatically, but **does not rewrite `<a href>` values**. Rules:

- Hub (`index.astro`) uses `import.meta.env.BASE_URL` in template expressions.
- Pages use relative paths like `../cheat-sheet/` for cross-nav.
- Never hardcode `/bass/...` in `<a href>` — breaks on dev server if `base` changes.
- PWA registration uses hardcoded `/bass/...` because the SW must match the production scope; this is intentional.

### PWA

- `public/manifest.webmanifest` + `public/icon.svg` ship verbatim.
- `<link rel="manifest">` + SW registration are hand-injected in each page's `<head>` (just above `</head>`). `@vite-pwa/astro@1.2` doesn't auto-inject into Astro 5 pages — that's why they're manual.
- SW precaches all pages, CSS, icon, and Google Fonts. Test offline flow with `npm run preview` + devtools "Offline" mode, or install to phone home screen.

### Shared SVG (not yet factored)

Each setlist song card inlines ~30 lines of near-identical SVG for shell chord diagrams (4 per song × ~30 songs = a lot of duplication). This is the next obvious refactor — extract into a `<ShellChord notes={[...]} />` Astro component. Hasn't been done yet; touching shell chords today still means editing the raw SVG in `src/pages/setlist.astro`.

## Conventions

- UTF-8 mandatory. Turkish characters (`Ç ğ ı ö ü ş İ`) in the setlist and music symbols (`♯ ♭ Δ ★`) everywhere. Don't let an editor re-encode to Latin-1.
- Inline `<style>` tags → always `<style is:global>`. Inline `<script>` → always `<script is:inline>`.
- Astro frontmatter JSX interpolation is active in the template. Any literal `{` in the body (e.g., inside a JSON blob rendered as text) must be escaped. Scripts and styles are exempt — content inside `<script>` and `<style>` is passed through.
- When adding a new page: put the file under `src/pages/`, add the PWA head snippet (copy from an existing page), and link it from `index.astro`.

## Directories

- `src/pages/` — routes (one .astro per URL)
- `public/` — static copy-through (icon, manifest)
- `dist/` — build output, gitignored
- `backup/<date>/` — pre-Astro HTML snapshots, gitignored in spirit but currently tracked; not used at runtime
- `.github/workflows/deploy.yml` — GH Pages deploy

## Things NOT to do

- Don't introduce a bundler for the inline scripts — they depend on being globals, not modules.
- Don't add a Node-side framework (React, Vue) unless factoring components. Static HTML output is a feature, not a limitation.
- Don't run `terraform`, `sagemaker`, or anything from the personal defaults in `~/.claude/CLAUDE.md` — this project is a side site, those rules don't apply here.
