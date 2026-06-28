/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tell Next.js to use the App Router
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
