/**
 * Diagrams for the "How it works" page.
 *
 * Author: Eeman Majumder <eeman.majumder@gmail.com>
 *
 * The handwriting in these figures is real engine output baked at fixed seeds
 * (see scripts/make-figures.mjs), not illustration. Everything is inline SVG
 * drawn with currentColor so it follows the light and dark palettes.
 */
import { FIGURES as F } from '@/lib/figures';

function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption>{children}</figcaption>;
}

/** The word being written one stroke at a time. */
export function FigWriting() {
  return (
    <figure className="fig fig-writing">
      <svg viewBox={`0 0 ${F.writing.w} ${F.writing.h}`} role="img"
           aria-label="The word handwriting being drawn stroke by stroke">
        {F.writing.strokes.map((d, i) => (
          <path
            key={i} d={d} className="ink draw" pathLength={1}
            style={{ animationDelay: `${i * 0.26}s` }}
          />
        ))}
      </svg>
      <Caption>
        The network does not place letters. It emits one small pen movement after
        another, and the letters are what the movements add up to.
      </Caption>
    </figure>
  );
}

/** Five renderings of one word, to show nothing repeats. */
export function FigVariation() {
  return (
    <figure className="fig">
      <div className="fig-stack">
        {F.variation.map((f, i) => (
          <svg key={i} viewBox={`0 0 ${f.w} ${f.h}`} role="img"
               aria-label={`The word always, rendering ${i + 1} of 5`}>
            <path d={f.d} className="ink" />
          </svg>
        ))}
      </div>
      <Caption>
        One word, written five times by the same hand. A font would give five
        identical copies; look at the loop on each <em>l</em> and the tail of each
        <em> y</em>.
      </Caption>
    </figure>
  );
}

/** Anatomy of a pen path. */
export function FigAnatomy() {
  const { down, up, points, w, h, totalPoints } = F.anatomy;
  // widened from the baked literal so the plural check below is a normal comparison
  const strokeCount: number = F.anatomy.strokeCount;
  return (
    <figure className="fig">
      <svg viewBox={`0 0 ${w} ${h}`} role="img"
           aria-label="A magnified pen path showing sampled points and where the pen lifts">
        {up.map((d, i) => <path key={`u${i}`} d={d} className="pen-up" />)}
        {down.map((d, i) => <path key={`d${i}`} d={d} className="ink thin" />)}
        {points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.1} className="dot" />)}
      </svg>
      <div className="legend">
        <span><i className="k-line" /> pen down</span>
        <span><i className="k-dash" /> pen lifted</span>
        <span><i className="k-dot" /> sampled point</span>
      </div>
      <Caption>
        Three letters, magnified. {totalPoints} points were sampled to draw them, in{' '}
        {strokeCount} stroke{strokeCount === 1 ? '' : 's'} — the dashed jump is the moment
        the pen leaves the paper.
      </Caption>
    </figure>
  );
}

/** What the neatness slider does. */
export function FigNeatness() {
  return (
    <figure className="fig">
      <div className="fig-rows">
        {F.neatness.map((f) => (
          <div className="fig-row" key={f.bias}>
            <span className="row-label">{f.bias.toFixed(2)}</span>
            <svg viewBox={`0 0 ${f.w} ${f.h}`} role="img"
                 aria-label={`The phrase the same word at neatness ${f.bias}`}>
              <path d={f.d} className="ink" />
            </svg>
          </div>
        ))}
      </div>
      <div className="axis">
        <span>loose, hurried</span>
        <span className="rule" aria-hidden="true" />
        <span>careful, deliberate</span>
      </div>
      <Caption>
        One phrase at four neatness settings. The slider is the network&rsquo;s sampling
        temperature: low lets the pen wander off the most likely path, high keeps it on
        it. The effect is cumulative — the longer the line, the further loose writing
        drifts.
      </Caption>
    </figure>
  );
}

/** A sample of the available hands. */
export function FigHands() {
  return (
    <figure className="fig">
      <div className="fig-grid">
        {F.hands.map((f) => (
          <div className="fig-cell" key={f.style}>
            <svg viewBox={`0 0 ${f.w} ${f.h}`} role="img"
                 aria-label={`The word writing in hand ${f.style + 1}`}>
              <path d={f.d} className="ink" />
            </svg>
            <span className="cell-label">Hand {f.style + 1}</span>
          </div>
        ))}
      </div>
      <Caption>
        Eight of the 80 hands, all writing the same word. Each was learned from a
        different person&rsquo;s writing.
      </Caption>
    </figure>
  );
}

/** How lines are stacked, with the metrics labelled. */
export function FigMultiline() {
  const { lines, ascent, descent, gap, labelGutter, w, h } = F.multiline;
  const right = w - 22;
  const b0 = lines[0].baseline;
  const b1 = lines[1].baseline;

  return (
    <figure className="fig">
      <svg viewBox={`0 0 ${w} ${h}`} role="img"
           aria-label="Three handwritten lines with baselines, ascent, descent and line gap marked">
        {/* baselines */}
        {lines.map((l, i) => (
          <line key={i} x1={labelGutter - 10} y1={l.baseline} x2={right - 26} y2={l.baseline}
                className="guide" />
        ))}
        {/* ascent and descent on the first line */}
        <line x1={labelGutter - 10} y1={b0 - ascent} x2={right - 26} y2={b0 - ascent} className="guide faint" />
        <line x1={labelGutter - 10} y1={b0 + descent} x2={right - 26} y2={b0 + descent} className="guide faint" />
        <g className="measure">
          <line x1={labelGutter - 22} y1={b0 - ascent} x2={labelGutter - 22} y2={b0} />
          <line x1={labelGutter - 22} y1={b0} x2={labelGutter - 22} y2={b0 + descent} />
          <line x1={right - 14} y1={b0} x2={right - 14} y2={b1} />
        </g>
        <text className="tag" x={labelGutter - 28} y={b0 - ascent / 2} textAnchor="end">ascent</text>
        <text className="tag" x={labelGutter - 28} y={b0 + descent / 2 + 3} textAnchor="end">descent</text>
        <text className="tag" x={right - 8} y={b0 + gap / 2} textAnchor="start">line gap</text>
        {/* the writing itself */}
        {lines.map((l, i) => <path key={`p${i}`} d={l.d} className="ink" />)}
      </svg>
      <Caption>
        Each line is written on its own and dropped onto its own baseline. The tallest
        ascender and deepest descender across all lines set the image height, so nothing
        is ever clipped.
      </Caption>
    </figure>
  );
}

/** Why a transparent background matters. */
export function FigTransparency() {
  const f = F.transparency;
  const svg = (
    <svg viewBox={`0 0 ${f.w} ${f.h}`} role="img" aria-label="The word transparent">
      <path d={f.d} className="ink" />
    </svg>
  );
  return (
    <figure className="fig">
      <div className="fig-compose">
        <div className="pane checker">
          {svg}
          <span className="pane-label">the exported file</span>
        </div>
        <div className="pane paper">
          {svg}
          <span className="pane-label">dropped onto paper</span>
        </div>
        <div className="pane photo">
          {svg}
          <span className="pane-label">over a photo</span>
        </div>
      </div>
      <Caption>
        The same file in three places. Nothing paints a background, so every pixel that
        is not ink stays transparent and the writing takes on whatever is underneath.
      </Caption>
    </figure>
  );
}

/** What happens between typing and downloading. */
export function FigPipeline() {
  const steps = [
    { k: 'Text', d: 'what you type' },
    { k: 'Network', d: 'predicts pen offsets' },
    { k: 'Strokes', d: 'points, pen up/down' },
    { k: 'SVG / PNG', d: 'transparent export' },
  ];
  return (
    <figure className="fig">
      <ol className="pipeline">
        {steps.map((s, i) => (
          <li key={s.k}>
            <span className="step-n">{i + 1}</span>
            <span className="step-k">{s.k}</span>
            <span className="step-d">{s.d}</span>
          </li>
        ))}
      </ol>
      <Caption>
        Only the first two steps involve the network. Size, colour, spacing and
        alignment are applied at the last step, which is why changing them is instant.
      </Caption>
    </figure>
  );
}
