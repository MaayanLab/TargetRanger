/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_ENTRYPOINT,
  async redirects() {
    return [
      {
        source: '/targetscreener',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
