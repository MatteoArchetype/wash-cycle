/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the entire eslint block
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;