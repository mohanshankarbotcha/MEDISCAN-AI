/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
    domains: []
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Midiscanai'
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
