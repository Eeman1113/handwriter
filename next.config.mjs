/** @type {import('next').NextConfig} */

// GitHub Pages serves this project from /handwriter, so asset URLs need that
// prefix in production. Locally the app lives at the root and the prefix is "".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default {
  output: 'export',          // fully static -- no server needed
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};
