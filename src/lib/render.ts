/**
 * Turns the engine's stroke geometry into SVG, and SVG into PNG.
 *
 * Both exports are transparent: nothing ever paints a background, so the
 * writing drops straight onto whatever it is placed over.
 */
import { bounds, type Line, type Stroke } from './handwriting';

/**
 * Roughly one em in model units -- the network's own sense of how tall its
 * writing is. Line spacing is expressed as a multiple of this rather than of
 * `scale`, so changing the size does not change how tight the lines sit.
 */
const MODEL_EM = 10;

export interface LayoutOptions {
  /** Pixels per model unit. Roughly "how big is the writing". */
  scale: number;
  /** Baseline-to-baseline distance, as a multiple of one em. */
  lineHeight: number;
  /** Transparent margin around the writing, in pixels. */
  padding: number;
  align: 'left' | 'center' | 'right';
}

export interface StyleOptions {
  color: string;
  strokeWidth: number;
}

/** A line's strokes, positioned in final SVG pixel coordinates. */
interface PlacedLine {
  strokes: Stroke[];
}

/**
 * Model space has y pointing up with the baseline at 0; SVG has y pointing
 * down. This flips the axis and drops each line onto its own baseline.
 */
function layout(lines: Line[], opts: LayoutOptions) {
  const { scale, lineHeight, padding, align } = opts;
  const gap = scale * MODEL_EM * lineHeight;

  // How far the tallest ascender rises and the deepest descender falls,
  // so nothing gets clipped at the top or bottom of the image.
  let ascent = 0;
  let descent = 0;
  const widths: number[] = [];

  for (const line of lines) {
    if (!line.strokes.length) { widths.push(0); continue; }
    const b = bounds(line.strokes);
    widths.push(b.width * scale);
    ascent = Math.max(ascent, b.maxY * scale);
    descent = Math.max(descent, -b.minY * scale);
  }

  const contentWidth = Math.max(...widths, 1);
  const width = contentWidth + padding * 2;
  const height = padding * 2 + ascent + descent + gap * (lines.length - 1);
  const firstBaseline = padding + ascent;

  const placed: PlacedLine[] = lines.map((line, i) => {
    if (!line.strokes.length) return { strokes: [] };
    const b = bounds(line.strokes);
    const lineWidth = b.width * scale;
    const slack = contentWidth - lineWidth;
    const indent = align === 'center' ? slack / 2 : align === 'right' ? slack : 0;
    const originX = padding + indent - b.minX * scale;
    const baselineY = firstBaseline + gap * i;

    return {
      strokes: line.strokes.map((stroke) =>
        stroke.map(([x, y]) => [originX + x * scale, baselineY - y * scale] as [number, number]),
      ),
    };
  });

  return { placed, width, height };
}

const round = (n: number) => Math.round(n * 100) / 100;

function toPathData(strokes: Stroke[]): string {
  const parts: string[] = [];
  for (const stroke of strokes) {
    if (stroke.length < 2) continue;
    parts.push(`M${round(stroke[0][0])} ${round(stroke[0][1])}`);
    for (let i = 1; i < stroke.length; i++) {
      parts.push(`L${round(stroke[i][0])} ${round(stroke[i][1])}`);
    }
  }
  return parts.join(' ');
}

/** Build a standalone SVG document. No background rect -- it stays transparent. */
export function toSVG(lines: Line[], layoutOpts: LayoutOptions, style: StyleOptions): string {
  const { placed, width, height } = layout(lines, layoutOpts);
  const d = placed.map((line) => toPathData(line.strokes)).filter(Boolean).join(' ');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}"`,
    ` viewBox="0 0 ${round(width)} ${round(height)}" fill="none">`,
    `<path d="${d}" stroke="${style.color}" stroke-width="${style.strokeWidth}"`,
    ` stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    `</svg>`,
  ].join('');
}

/** Rasterise an SVG string to a transparent PNG blob at the given pixel ratio. */
export function toPNG(svg: string, pixelRatio = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(img.height * pixelRatio));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get a 2D canvas context'));
        return;
      }
      // Deliberately no fillRect: untouched canvas pixels stay fully transparent.
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        blob ? resolve(blob) : reject(new Error('Could not encode the PNG'));
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not rasterise the SVG'));
    };
    img.src = url;
  });
}

/** Hand a blob to the browser as a download. */
export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** A filename derived from the text itself, e.g. "hello-world.svg". */
export function filenameFor(text: string, ext: string): string {
  const slug = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${slug || 'handwriting'}.${ext}`;
}
