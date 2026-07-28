/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Netlify works best with this setting
  output: 'standalone',
};

module.exports = nextConfig;
