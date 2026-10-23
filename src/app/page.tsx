'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as hw from '@/lib/handwriting';
import type { Line } from '@/lib/handwriting';
import { download, filenameFor, toPNG, toSVG, type LayoutOptions } from '@/lib/render';

const MODEL_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/d.bin`;

const SAMPLE = `The quick brown fox
jumps over the lazy dog.`;

type Align = LayoutOptions['align'];

export default function Page() {
  const [text, setText] = useState(SAMPLE);
  const [style, setStyle] = useState(9);
  const [bias, setBias] = useState(0.85);
  const [scale, setScale] = useState(3);
  const [lineHeight, setLineHeight] = useState(2.2);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [color, setColor] = useState('#1a2a6c');
  const [align, setAlign] = useState<Align>('left');

  const [styles, setStyles] = useState(0);
  const [lines, setLines] = useState<Line[] | null>(null);
  const [status, setStatus] = useState('Loading the handwriting model…');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  // The text the current strokes were generated from. Re-generating is only
  // needed when the words or the pen itself change -- size, colour, spacing
  // and alignment are all applied at render time, with no new strokes.
  const generatedFor = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    hw.loadModel(MODEL_URL)
      .then(() => {
        if (cancelled) return;
        setStyles(hw.styleCount());
        setStatus('Ready.');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(true);
        setStatus(err.message);
      });
    return () => { cancelled = true; };
  }, []);

  const write = useCallback(() => {
    if (!hw.isLoaded() || !text.trim()) return;
    setBusy(true);
    setError(false);
    setStatus('Writing…');

    // Yield a frame so the button state paints before the main thread blocks.
    requestAnimationFrame(() => {
      try {
        const result = hw.generate(text, { style, bias });
        setLines(result.lines);
        generatedFor.current = `${text}|${style}|${bias}`;
        const count = result.lines.filter((l) => l.text).length;
        setStatus(`${count} line${count === 1 ? '' : 's'} written.`);
      } catch (err) {
        setError(true);
        setStatus((err as Error).message);
      } finally {
        setBusy(false);
      }
    });
  }, [text, style, bias]);

  // Write the sample once the model is ready, so the page is never empty.
  useEffect(() => {
    if (styles > 0 && lines === null) write();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styles]);

  const layoutOpts = useMemo<LayoutOptions>(
    () => ({ scale, lineHeight, padding: 24, align }),
    [scale, lineHeight, align],
  );

  const svg = useMemo(() => {
    if (!lines) return null;
    return toSVG(lines, layoutOpts, { color, strokeWidth });
  }, [lines, layoutOpts, color, strokeWidth]);

  const stale = lines !== null && generatedFor.current !== `${text}|${style}|${bias}`;

  const saveSVG = () => {
    if (!svg) return;
    download(new Blob([svg], { type: 'image/svg+xml' }), filenameFor(text, 'svg'));
  };

  const savePNG = async () => {
    if (!svg) return;
    try {
      download(await toPNG(svg, 3), filenameFor(text, 'png'));
    } catch (err) {
      setError(true);
      setStatus((err as Error).message);
    }
  };

  return (
    <div className="wrap">
      <header>
        <h1>handwriter</h1>
        <p className="tagline">
          Text into real handwriting. Download it as a transparent SVG or PNG.
        </p>
      </header>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type anything. Press Enter for a new line."
        spellCheck={false}
        aria-label="Text to write"
      />

      <div className="preview">
        {svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <p className="placeholder">
            {error ? 'Could not load the model.' : 'Your handwriting will appear here.'}
          </p>
        )}
      </div>

      <div className="controls">
        <div className="field">
          <label htmlFor="style">
            Hand <span className="value">{style + 1} / {styles || '…'}</span>
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(Number(e.target.value))}
            disabled={!styles}
          >
            {Array.from({ length: styles }, (_, i) => (
              <option key={i} value={i}>Hand {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="bias">
            Neatness <span className="value">{bias.toFixed(2)}</span>
          </label>
          <input
            id="bias" type="range" min={0.1} max={1.5} step={0.05}
            value={bias} onChange={(e) => setBias(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="size">
            Size <span className="value">{scale.toFixed(1)}×</span>
          </label>
          <input
            id="size" type="range" min={1} max={8} step={0.5}
            value={scale} onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="lh">
            Line spacing <span className="value">{lineHeight.toFixed(1)}</span>
          </label>
          <input
            id="lh" type="range" min={1.2} max={4} step={0.1}
            value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="sw">
            Pen width <span className="value">{strokeWidth.toFixed(1)}</span>
          </label>
          <input
            id="sw" type="range" min={0.5} max={6} step={0.25}
            value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="ink">Ink</label>
          <input
            id="ink" type="color" value={color}
            onChange={(e) => setColor(e.target.value)} aria-label="Ink colour"
          />
        </div>

        <div className="field span">
          <label>Align</label>
          <div className="segmented" role="group" aria-label="Alignment">
            {(['left', 'center', 'right'] as Align[]).map((a) => (
              <button
                key={a} type="button"
                aria-pressed={align === a}
                onClick={() => setAlign(a)}
              >
                {a[0].toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          className="action primary" onClick={write}
          disabled={busy || !styles || !text.trim()}
        >
          {busy ? 'Writing…' : stale ? 'Rewrite' : 'Write it again'}
        </button>
        <button className="action" onClick={saveSVG} disabled={!svg}>
          Download SVG
        </button>
        <button className="action" onClick={savePNG} disabled={!svg}>
          Download PNG
        </button>
      </div>

      <p className={`status${error ? ' error' : ''}`}>
        {stale && !busy && !error ? 'Text changed — press Rewrite.' : status}
      </p>

      <footer>
        <p>
          Every rendering is sampled fresh from a recurrent mixture-density network, so
          the same word is never written the same way twice. Both downloads have a fully
          transparent background.
        </p>
      </footer>
    </div>
  );
}
