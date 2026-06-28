/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Completely disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript errors during builds (optional)
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;