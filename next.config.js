/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig 