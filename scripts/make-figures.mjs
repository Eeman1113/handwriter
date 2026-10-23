/**
 * Generates the diagrams used on the "How it works" page.
 *
 * Author: Eeman Majumder <eeman.majumder@gmail.com>
 *
 * Every figure is real output from the engine, measured and baked into
 * src/lib/figures.ts at fixed seeds. Nothing here is drawn by hand or faked,
 * so the diagrams stay honest if the model ever changes.
 *
 * Run: node scripts/make-figures.mjs
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

const r = (n) => Math.round(n * 100) / 100;

/** Flip to SVG coordinates and fit into a padded box. */
function figure(strokes, { scale = 3, pad = 6 } = {}) {
  const b = hw.bounds(strokes);
  const map = ([x, y]) => [r(pad + (x - b.minX) * scale), r(pad + (b.maxY - y) * scale)];
  const d = strokes.map((s) =>
    s.map((p, i) => { const [x, y] = map(p); return `${i ? 'L' : 'M'}${x} ${y}`; }).join('')
  ).join('');
  return { d, w: r(b.width * scale + pad * 2), h: r(b.height * scale + pad * 2) };
}

const out = {};

// 1. The same word written five times -- the case against it being a font.
out.variation = [101, 202, 303, 404, 505].map((seed) => {
  const { lines } = hw.generate('always', { style: 9, bias: 0.95, seed });
  return figure(lines[0].strokes, { scale: 3.2 });
});

// 2. What the neatness (sampling temperature) control actually does.
// A phrase rather than a single word: the drift between settings shows up over
// a longer run of letters, where it is actually visible.
out.neatness = [0.15, 0.5, 0.95, 1.5].map((bias) => {
  const { lines } = hw.generate('the same word', { style: 9, bias, seed: 23 });
  return { bias, ...figure(lines[0].strokes, { scale: 2.6 }) };
});

// 3. A sample of the 80 hands.
out.hands = [0, 9, 16, 22, 40, 52, 63, 71].map((style) => {
  const { lines } = hw.generate('writing', { style, bias: 1.0, seed: 31 });
  return { style, ...figure(lines[0].strokes, { scale: 2.8 }) };
});

// 4. Anatomy of a pen path: every sampled point, and where the pen lifts.
{
  const { lines } = hw.generate('pen', { style: 9, bias: 1.0, seed: 12 });
  const strokes = lines[0].strokes;
  const b = hw.bounds(strokes);
  const scale = 9, pad = 16;
  const map = ([x, y]) => [r(pad + (x - b.minX) * scale), r(pad + (b.maxY - y) * scale)];

  const down = strokes.map((s) =>
    s.map((p, i) => { const [x, y] = map(p); return `${i ? 'L' : 'M'}${x} ${y}`; }).join('')
  );
  // Where the pen leaves the paper: the gap between one stroke's end and the next one's start.
  const up = strokes.slice(0, -1).map((s, i) => {
    const [x1, y1] = map(s[s.length - 1]);
    const [x2, y2] = map(strokes[i + 1][0]);
    return `M${x1} ${y1}L${x2} ${y2}`;
  });
  // Thin the dots out; every sampled point would be an unreadable smear.
  const points = strokes.flatMap((s) => s.filter((_, i) => i % 3 === 0).map(map));

  out.anatomy = {
    down, up, points,
    w: r(b.width * scale + pad * 2),
    h: r(b.height * scale + pad * 2),
    totalPoints: strokes.reduce((n, s) => n + s.length, 0),
    strokeCount: strokes.length,
  };
}

// 5. Multi-line layout: baselines, ascent, descent and the gap between lines.
{
  const text = ['Dear Sir,', 'the rent is', 'overdue.'];
  const scale = 3.0, pad = 16, labelGutter = 84;
  const made = text.map((t, i) =>
    hw.generate(t, { style: 9, bias: 1.05, seed: 400 + i * 11 }).lines[0].strokes
  );
  const bs = made.map((s) => hw.bounds(s));
  const ascent = Math.max(...bs.map((b) => b.maxY)) * scale;
  const descent = Math.max(...bs.map((b) => -b.minY)) * scale;
  // Derive the gap from the measured metrics rather than guessing: one line's
  // descenders must clear the next line's ascenders, with a little air.
  const gap = Math.round(ascent + descent + 10);
  const first = pad + ascent;

  const lines = made.map((strokes, i) => {
    const b = bs[i];
    const baseline = first + gap * i;
    const d = strokes.map((s) =>
      s.map(([x, y], j) => `${j ? 'L' : 'M'}${r(labelGutter + (x - b.minX) * scale)} ${r(baseline - y * scale)}`).join('')
    ).join('');
    return { d, baseline: r(baseline), width: r(b.width * scale) };
  });

  out.multiline = {
    lines, ascent: r(ascent), descent: r(descent), gap, labelGutter,
    // the right margin has to hold the "line gap" label, which sits outside the writing
    w: r(labelGutter + Math.max(...bs.map((b) => b.width)) * scale + pad + 62),
    h: r(first + gap * (made.length - 1) + descent + pad),
  };
}

// 6. A word kept as separate strokes, so the page can animate it being written.
{
  const { lines } = hw.generate('handwriting', { style: 9, bias: 1.05, seed: 21 });
  const strokes = lines[0].strokes;
  const b = hw.bounds(strokes);
  const scale = 4.2, pad = 10;
  out.writing = {
    strokes: strokes.map((s) =>
      s.map(([x, y], i) =>
        `${i ? 'L' : 'M'}${r(pad + (x - b.minX) * scale)} ${r(pad + (b.maxY - y) * scale)}`
      ).join('')
    ),
    w: r(b.width * scale + pad * 2),
    h: r(b.height * scale + pad * 2),
  };
}

// 7. The word used in the transparency demo.
{
  const { lines } = hw.generate('transparent', { style: 9, bias: 1.05, seed: 88 });
  out.transparency = figure(lines[0].strokes, { scale: 3.4 });
}

const banner = `/**
 * Figure geometry for the "How it works" page.
 *
 * GENERATED FILE -- do not edit by hand.
 * Produced by scripts/make-figures.mjs from real engine output at fixed seeds.
 *
 * Author: Eeman Majumder <eeman.majumder@gmail.com>
 */

`;
fs.writeFileSync(
  path.join(root, 'src/lib/figures.ts'),
  banner + 'export const FIGURES = ' + JSON.stringify(out, null, 2) + ' as const;\n'
);

console.log('figures written:');
console.log(`  variation    ${out.variation.length} renderings`);
console.log(`  neatness     ${out.neatness.length} levels`);
console.log(`  hands        ${out.hands.length} styles`);
console.log(`  anatomy      ${out.anatomy.strokeCount} strokes, ${out.anatomy.totalPoints} points`);
console.log(`  multiline    ${out.multiline.lines.length} lines`);
console.log(`  writing      ${out.writing.strokes.length} strokes (animated)`);
