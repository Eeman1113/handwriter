# handwriter

Turn text into real handwriting and download it as a **transparent SVG or PNG**.

**[→ Try it](https://eeman1113.github.io/handwriter/)**

Not a font. Every rendering is sampled from a recurrent mixture-density network
that emits one pen movement at a time, so the same word is never written the
same way twice — letters join differently, baselines drift, and repeated words
look related rather than identical.

## What it does

- **Multi-line** — newlines become new lines, blank lines become gaps.
- **Transparent exports** — nothing paints a background, so the writing drops
  straight onto whatever you place it over. SVG stays vector; PNG renders at 3×.
- **80 hands** to pick from, plus controls for neatness, size, line spacing,
  pen width and alignment.
- **Preset inks** — seven everyday pen colours a tap away, with a colour picker
  behind them for anything else.
- **Runs entirely in the browser.** No API, no key, no upload — the model is
  2.5 MB of weights fetched once and run client-side.
- Works on phones.

Size, spacing, colour, pen width and alignment all re-render from the strokes
already on screen, so only changing the *text*, *hand* or *neatness* needs the
network to write again.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Build the static site:

```bash
npm run build        # → out/
```

## Deploying

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. Enable it once under
**Settings → Pages → Source → GitHub Actions**.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/handwriter` because Pages serves the
site from a subpath. Hosting at a domain root instead? Drop that variable.

## How it works

| | |
|---|---|
| `src/lib/handwriting.js` | The network. Decodes the weights, runs the RNN, returns strokes. No DOM. |
| `src/lib/render.ts` | Lays strokes out into lines and turns them into SVG, then PNG. |
| `src/app/page.tsx` | The interface. |
| `src/components/Logo.tsx` | The wordmark — written by the engine, baked at a fixed seed. |
| `src/app/icon.svg` | Favicon: a handwritten `h`, also engine-made. |
| `public/d.bin` | Model weights (2.5 MB). |

The logo is not set in a typeface: it is the word *handwriter* run through the
same network, frozen at style 9 / seed 3 so it looks identical on every visit
and never waits on the model to load. Its strokes use `currentColor`, so it is
black on light and white on dark. Regenerate it with
`node scripts/make-logo.mjs`.

The favicon is the same idea — a handwritten `h` rather than a letterform from
a font. `icon.svg` carries its own `prefers-color-scheme` rule, so it is dark
on light tab bars and light on dark ones. The iOS touch icon cannot be
transparent, so it gets a solid ink tile instead:

```bash
node scripts/make-icon.mjs        # writes src/app/icon.svg
python3 scripts/make-apple-icon.py  # then src/app/apple-icon.png (needs Pillow)
```

`generate()` returns stroke geometry in abstract model units with the baseline
at `y = 0` and `y` pointing up; `render.ts` flips the axis and scales it. That
split is deliberate — the engine knows nothing about pixels, so the same
strokes can be re-laid out at any size without re-running the network.

Generation is synchronous and blocks the main thread for a moment on long text.

### Reproducible output

Pass a seed to get the same handwriting every time — useful for tests, or for
regenerating an asset exactly:

```js
import { loadModel, generate } from './src/lib/handwriting.js';

await loadModel('/d.bin');
const { lines } = generate('hello\nworld', { style: 9, bias: 0.85, seed: 42 });
```

Omit `seed` and every call writes something new.

## Credits

The model and generation code come from
[calligrapher.ai](https://www.calligrapher.ai) by Sean Vasquez, which implements
Alex Graves' [*Generating Sequences With Recurrent Neural
Networks*](https://arxiv.org/abs/1308.0850) (2013), §5. This project reworks
that engine into a dependency-free module and builds a new interface and export
pipeline around it.

## Licence

MIT
