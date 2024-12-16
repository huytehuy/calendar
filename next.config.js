/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
        has: [
          {
            type: 'cookie',
            key: 'next-auth.session-token'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 