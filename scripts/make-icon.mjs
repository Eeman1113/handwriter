/**
 * Writes the favicon with the engine, so the icon is the same hand as the logo.
 *
 * Produces src/app/icon.svg -- an adaptive SVG favicon that is near-black on
 * light backgrounds and near-white on dark ones, via a prefers-color-scheme
 * rule embedded in the file itself.
 *
 * Run: node scripts/make-icon.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

globalThis.fetch = async () => {
  const b = fs.readFileSync(path.join(root, 'public/d.bin'));
  return { ok: true, status: 200, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
};

const hw = await import(path.join(root, 'src/lib/handwriting.js'));
await hw.loadModel('/d.bin');

const STYLE = 0, SEED = 29, BIAS = 1.2;
const BOX = 64;      // viewBox size
const INSET = 9;     // breathing room inside the square
const STROKE = 7;    // chunky enough to read at 16px

const { lines } = hw.generate('h', { style: STYLE, bias: BIAS, seed: SEED });
const strokes = lines[0].strokes;
const b = hw.bounds(strokes);

// Fit the glyph into the square, keeping its aspect ratio and centring it.
const avail = BOX - INSET * 2;
const scale = Math.min(avail / b.width, avail / b.height);
const ox = (BOX - b.width * scale) / 2;
const oy = (BOX - b.height * scale) / 2;
const r = (n) => Math.round(n * 100) / 100;

const d = strokes.map((s) =>
  s.map(([x, y], i) =>
    `${i ? 'L' : 'M'}${r(ox + (x - b.minX) * scale)} ${r(oy + (b.maxY - y) * scale)}`
  ).join('')
).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">
<style>
path { stroke: #16161a }
@media (prefers-color-scheme: dark) { path { stroke: #ededea } }
</style>
<path d="${d}" fill="none" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

fs.writeFileSync(path.join(root, 'src/app/icon.svg'), svg);
console.log(`icon.svg written — ${strokes.length} stroke(s), ${svg.length} bytes`);

// Hand the geometry to the PNG step so both icons are the exact same glyph.
fs.writeFileSync(path.join(root, 'scripts/.icon-geometry.json'),
  JSON.stringify({ box: BOX, stroke: STROKE, path: d }));
