// Leonida Legend — GTA 6 trophy guide entry (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html, style.css,
// app.js, tracker.js, roadmap.js and data/trophies.json. It opens in desktop
// Chrome with the network off and loads nothing from outside app/.
//
// This program is the hand-in: it copies app/ and screenshots/ from beside
// this file into the output directory (MAKEFUN_OUTPUT_DIR, or /output in the
// grader) and writes /output/dossier.json with buildDossier from the vendored
// make.fun library. vendor/makefun-frontend.ts is the kit's copy, unchanged —
// the scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output dir so a stale screenshot or dossier can never
// survive into the hand-in.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's caps, from the kit's reference/gate.json: at most 4 screenshots
// of at most 256 KiB each, at most 993 files and 48 MiB in app/, and the
// dossier text capped at 160 KiB. buildDossier refuses anything past them,
// so a bad entry fails here instead of silently shipping.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
