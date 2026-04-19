// Post-build: rewrite absolute /bass/ URLs in built HTML to page-relative paths.
//
// Why: Astro needs `base: '/bass'` so assets resolve on GH Pages
// (https://hyurtseven81.github.io/bass/...). That produces hrefs/srcs like
// "/bass/cheat-sheet/" and "/bass/assets/xxx.css" — which only work when the
// site is served from a host rooted above /bass/. Opening dist/index.html
// directly via file:// can't resolve those.
//
// Rewriting to page-relative ("./" or "../") works in BOTH contexts:
//   - Served at /bass/cheat-sheet/  → "../assets/..." → /bass/assets/... ✓
//   - file:///…/dist/cheat-sheet/   → "../assets/..." → /…/dist/assets/... ✓
//
// We only touch .html files. sw.js keeps its absolute /bass/ scope because
// service workers never run from file:// anyway (browser security).

import { readdir, readFile, writeFile } from 'node:fs/promises';

const DIST = new URL('../dist/', import.meta.url);

// recursive: true is stable on Node 20+, which is what GH Actions + withastro/action default to.
const entries = await readdir(DIST, { recursive: true });
const files = entries.filter((p) => p.endsWith('.html'));

let rewritten = 0;
for (const file of files) {
  // Depth = number of directories between this file and dist/.
  //   dist/index.html             → depth 0 → prefix "./"
  //   dist/cheat-sheet/index.html → depth 1 → prefix "../"
  // Normalize path separators for Windows, even though CI is Linux.
  const parts = file.replace(/\\/g, '/').split('/');
  const depth = parts.length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);

  const url = new URL(file.replace(/\\/g, '/'), DIST);
  const original = await readFile(url, 'utf8');

  // Only rewrite attribute values (href="...", src="..."), not arbitrary text.
  // Matches /bass/ at the start of an attribute value.
  const next = original.replace(
    /(href|src)="\/bass\//g,
    `$1="${prefix}`,
  );

  if (next !== original) {
    await writeFile(url, next);
    rewritten++;
  }
}

console.log(`  make-relative: rewrote ${rewritten}/${files.length} HTML file(s)`);
