/**
 * Site-wide constants and structured data.
 *
 * Author: Eeman Majumder <eeman.majumder@gmail.com>
 *
 * Everything here is machine-readable metadata -- it reaches crawlers through
 * <head> tags and JSON-LD, and never renders in the interface.
 */

export const SITE = {
  name: 'handwriter',
  url: 'https://eeman1113.github.io/handwriter',
  title: 'handwriter — free text to handwriting generator (transparent SVG & PNG)',
  tagline: 'Text into real handwriting. Download it as a transparent SVG or PNG.',
  description:
    'Free text to handwriting generator. Convert typed text into realistic handwriting ' +
    'with a neural network and download it as a transparent SVG or PNG. Supports multiple ' +
    'lines, 80 handwriting styles, adjustable neatness, size, spacing, pen width and ink ' +
    'colour. Runs entirely in your browser — no sign-up, no upload, no watermark.',
  repo: 'https://github.com/Eeman1113/handwriter',
} as const;

export const AUTHOR = {
  name: 'Eeman Majumder',
  email: 'eeman.majumder@gmail.com',
  github: 'https://github.com/Eeman1113',
  url: 'https://github.com/Eeman1113',
} as const;

/**
 * Search terms this page genuinely answers. Kept to things the tool actually
 * does -- a keyword the page cannot deliver on costs more than it gains.
 */
export const KEYWORDS = [
  'text to handwriting',
  'text to handwriting converter',
  'handwriting generator',
  'convert text to handwriting',
  'handwriting generator online',
  'free text to handwriting',
  'realistic handwriting generator',
  'handwriting synthesis',
  'text to handwriting svg',
  'handwriting png transparent background',
  'transparent handwriting generator',
  'handwritten text generator',
  'ai handwriting generator',
  'neural network handwriting',
  'handwriting font alternative',
  'cursive text generator',
  'digital handwriting tool',
  'handwriting svg download',
  'multiline handwriting generator',
  'handwriting assignment generator',
];

/** JSON-LD: the app itself. */
export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE.name,
  alternateName: 'handwriter — text to handwriting generator',
  url: SITE.url,
  description: SITE.description,
  applicationCategory: 'DesignApplication',
  applicationSubCategory: 'Handwriting generator',
  operatingSystem: 'Any — runs in a web browser',
  browserRequirements: 'Requires JavaScript and a modern browser',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Convert typed text into realistic handwriting',
    'Download as transparent SVG',
    'Download as transparent PNG',
    'Multi-line text support',
    '80 handwriting styles',
    'Adjustable neatness, size, line spacing and pen width',
    'Preset and custom ink colours',
    'Runs entirely client-side with no upload',
  ],
  softwareVersion: '1.0.0',
  license: 'https://opensource.org/licenses/MIT',
  codeRepository: SITE.repo,
  author: {
    '@type': 'Person',
    name: AUTHOR.name,
    email: AUTHOR.email,
    url: AUTHOR.url,
    sameAs: [AUTHOR.github],
  },
  creator: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
  maintainer: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
  publisher: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
};

/** JSON-LD: the site, so search engines can show a name for it. */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: 'en',
  author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
};

/**
 * JSON-LD: questions people actually type when looking for this.
 * The answers are true of the tool, which is what makes this eligible for
 * rich results rather than just ignored.
 */
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I convert text to handwriting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Type or paste your text, pick one of the 80 handwriting styles, and the ' +
          'neural network writes it out stroke by stroke. You can then download the ' +
          'result as an SVG or PNG with a transparent background.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this a handwriting font?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'No. A font reuses the same glyph every time a letter appears. handwriter ' +
          'samples each stroke from a recurrent mixture-density network, so repeated ' +
          'letters and words are never identical — which is what makes the output look ' +
          'handwritten rather than typeset.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I download handwriting with a transparent background?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. Both the SVG and the PNG export with a fully transparent background, so ' +
          'the writing can be placed over any paper texture, photo or document.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it support multiple lines?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. Every newline becomes a new line of handwriting and blank lines become ' +
          'vertical gaps, so paragraphs keep their shape.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is handwriter free, and is my text uploaded anywhere?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'It is free and open source under the MIT licence. The model runs entirely in ' +
          'your browser, so your text is never sent to a server.',
      },
    },
  ],
};
