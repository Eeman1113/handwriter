import fs from 'fs';
globalThis.fetch = async () => {
  const b = fs.readFileSync('/Users/eemanmajumder/code_shit/handwriter/public/d.bin');
  return { ok: true, status: 200, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
};
const hw = await import('/Users/eemanmajumder/code_shit/handwriter/src/lib/handwriting.js');
await hw.loadModel('/d.bin');

const STYLE = 9, SEED = 3, BIAS = 1.1, PAD = 1.5;
const { lines } = hw.generate('handwriter', { style: STYLE, bias: BIAS, seed: SEED });
const strokes = lines[0].strokes;
const b = hw.bounds(strokes);

const W = +(b.width + PAD * 2).toFixed(2);
const H = +(b.height + PAD * 2).toFixed(2);
const r = (n) => Math.round(n * 100) / 100;

// model space is y-up with the baseline at 0; SVG is y-down
const d = strokes.map((s) =>
  s.map(([x, y], i) =>
    `${i ? 'L' : 'M'}${r(x - b.minX + PAD)} ${r(b.maxY - y + PAD)}`
  ).join('')
).join('');

const tsx = `/**
 * The wordmark, written by the engine itself rather than set in a typeface.
 *
 * Baked at build time from style ${STYLE}, seed ${SEED} -- a fixed seed so the logo is
 * identical on every visit and does not wait on the 2.5 MB model to load.
 * Regenerate with: node scripts/make-logo.mjs
 *
 * Strokes inherit \`currentColor\`, so the mark follows the page text colour:
 * black on light, white on dark.
 */
export default function Logo({ title = 'handwriter' }: { title?: string }) {
  return (
    <svg
      className="logo"
      viewBox="0 0 ${W} ${H}"
      role="img"
      aria-label={title}
      fill="none"
    >
      <path
        d="${d}"
        stroke="currentColor"
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
`;
fs.writeFileSync('/Users/eemanmajumder/code_shit/handwriter/src/components/Logo.tsx', tsx);
console.log(`logo: ${W} x ${H}, ${strokes.length} strokes, ${d.length} bytes of path`);
