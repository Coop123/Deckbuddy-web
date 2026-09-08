#!/usr/bin/env node
/**
 * There is nothing to compile — this site is plain HTML, CSS and JS, and Vercel
 * can serve the repo root directly. This script exists only so the deploy also
 * succeeds when the Vercel project is configured for a framework build (a build
 * command of `npm run build`, or an output directory of `dist`), which is the
 * case when a project previously hosted an app. It copies the site into dist/.
 */
const fs = require('fs');
const path = require('path');

const OUT = 'dist';
const COPY = ['index.html', 'features.html', 'demo.html', 'call.html', '404.html', 'site.css', 'site.js', 'vercel.json'];

function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) copy(path.join(src, entry), path.join(dest, entry));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let files = 0;
for (const item of COPY) {
  if (!fs.existsSync(item)) {
    console.error(`build: missing ${item}`);
    process.exit(1);
  }
  copy(item, path.join(OUT, item));
}
(function count(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) count(path.join(dir, e.name)); else files++;
  }
})(OUT);

console.log(`build: copied ${files} files into ${OUT}/`);
