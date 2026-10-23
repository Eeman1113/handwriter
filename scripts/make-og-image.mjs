/**
 * Writes the geometry for the social preview image (Open Graph / Twitter card).
 *
 * Author: Eeman Majumder <eeman.majumder@gmail.com>
 * Run this, then `python3 scripts/make-og-image.py` to render the PNG.
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

// Same hand and seed as the wordmark, so the card matches the site.
const { lines } = hw.generate('handwriter', { style: 9, bias: 1.1, seed: 3 });
const strokes = lines[0].strokes;
const b = hw.bounds(strokes);

fs.writeFileSync(path.join(root, 'scripts/.og-geometry.json'), JSON.stringify({
  strokes, minX: b.minX, maxY: b.maxY, width: b.width, height: b.height,
}));
console.log(`og geometry: ${strokes.length} strokes, ${b.width.toFixed(1)} x ${b.height.toFixed(1)} units`);
