/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/BR_Portfolio',
  assetPrefix: '/BR_Portfolio/',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
