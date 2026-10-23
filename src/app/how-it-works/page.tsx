/**
 * Author: Eeman Majumder <eeman.majumder@gmail.com>
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  FigAnatomy, FigHands, FigMultiline, FigNeatness,
  FigPipeline, FigTransparency, FigVariation, FigWriting,
} from '@/components/Figures';
import { AUTHOR, KEYWORDS, SITE, faqSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'How handwriter turns text into handwriting, explained with diagrams: a recurrent ' +
    'mixture-density network predicts one pen movement at a time, so no two renderings ' +
    'are the same. Covers handwriting synthesis, the neatness control, multi-line ' +
    'layout, and transparent SVG and PNG export.',
  keywords: KEYWORDS,
  alternates: { canonical: '/how-it-works/' },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: 'article',
    title: `How it works — ${SITE.name}`,
    description:
      'Diagrams and plain English: how a neural network turns typed text into realistic handwriting.',
    url: `${SITE.url}/how-it-works/`,
  },
};

export default function HowItWorks() {
  return (
    <div className="wrap prose">
      <header>
        <Link href="/" className="logo-link" aria-label="handwriter home">
          <Logo />
        </Link>
      </header>

      <h1>How it works</h1>

      <p className="lead">
        handwriter turns typed text into handwriting by predicting pen movements, one
        after another, the way a hand actually produces them. It is not a font — and
        the difference shows up everywhere once you know to look.
      </p>

      <FigWriting />

      <h2>Why it isn&rsquo;t a handwriting font</h2>
      <p>
        A handwriting font stores one fixed drawing per character. Every <em>e</em> on
        the page is the same <em>e</em>, so the eye picks up the repetition immediately
        and the result reads as typeset rather than written.
      </p>
      <p>
        This tool has no glyphs to reuse. A recurrent mixture-density network — the
        architecture Alex Graves introduced in{' '}
        <a href="https://arxiv.org/abs/1308.0850" rel="noopener">
          Generating Sequences With Recurrent Neural Networks
        </a>{' '}
        (2013) — reads your text and emits a stream of small pen offsets, each sampled
        from a probability distribution conditioned on everything written so far.
      </p>

      <FigVariation />

      <h2>What the network actually emits</h2>
      <p>
        At each step the network predicts three things: how far the pen moves
        horizontally, how far vertically, and whether it stays on the paper. That last
        value is what separates one stroke from the next — lift the pen, move, put it
        back down, and you have crossed a <em>t</em> or started a new letter.
      </p>

      <FigAnatomy />

      <p>
        Because each step is <em>sampled</em> rather than looked up, the pen can take a
        slightly different route every time. That is the whole trick. Letters come out
        related but never identical, joins change depending on what comes next, and
        baselines drift the way real writing drifts.
      </p>

      <FigPipeline />

      <h2>What the controls do</h2>

      <h3>Neatness</h3>
      <p>
        The most interesting control. It is the sampling temperature: how strongly the
        network is pushed toward its single most likely next move. Turn it down and the
        pen wanders into something hurried and scrawled; turn it up and every stroke is
        pulled onto the most probable path.
      </p>

      <FigNeatness />

      <h3>Hand</h3>
      <p>
        One of 80 writing styles, each learned from a different writer. A hand sets the
        slant, the letter shapes, and how often the pen is lifted between letters.
      </p>

      <FigHands />

      <h3>Size, line spacing, pen width, ink and alignment</h3>
      <p>
        These are applied when the strokes are drawn, not when they are generated.
        Changing them restyles the writing already on screen instantly, with no new
        trip through the network — which is why only the text, the hand and the
        neatness need a rewrite.
      </p>

      <h2>Multi-line text</h2>
      <p>
        Each line is written independently and placed on its own baseline, so pressing
        Enter starts a new line and a blank line leaves a vertical gap. Paragraphs keep
        their shape, which matters when the output is going onto a form, a letter or a
        worksheet.
      </p>

      <FigMultiline />

      <h2>Transparent SVG and PNG</h2>
      <p>
        Nothing ever paints a background. The SVG is a single path with no backing
        rectangle, and the PNG is rasterised onto an untouched canvas, so every pixel
        that is not ink stays fully transparent.
      </p>

      <FigTransparency />

      <p>
        The SVG stays vector, so it scales to any size and opens in Illustrator, Figma
        or Inkscape as editable paths. The PNG is rendered at three times the
        on-screen size, which is enough for print.
      </p>

      <h2>Privacy</h2>
      <p>
        The model is about 2.5 MB of weights, fetched once and then run in your browser.
        Your text is never sent anywhere, there is no account, and there is no
        watermark. The whole project is open source under the MIT licence.
      </p>

      <h2>Common questions</h2>

      <h3>Can I use the output commercially?</h3>
      <p>
        Yes. The code is MIT licensed and the handwriting it produces is yours to use.
      </p>

      <h3>Why does the same word look different each time?</h3>
      <p>
        Because each rendering is sampled fresh — see the five <em>always</em>
        {' '}above. Press the write button again and you get a new, equally valid version
        of the same words.
      </p>

      <h3>Which characters are supported?</h3>
      <p>
        Upper and lower case English letters, digits and common punctuation. Characters
        the model never saw in training are skipped rather than guessed at.
      </p>

      <p className="back">
        <Link href="/">← Back to the generator</Link>
      </p>

      <footer>
        <p>
          handwriter is free and open source.{' '}
          <a href={SITE.repo} rel="noopener">
            Source on GitHub
          </a>
          .
        </p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
