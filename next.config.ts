import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'dongardner.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'cdn.redfin.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' }
    ]
  },
  async redirects() {
    return [
      // legacy create routes → new wizard
      { source: '/resident/new', destination: '/resident/create', permanent: true },
      { source: '/resident/start', destination: '/resident/create', permanent: true },
      { source: '/resident/form', destination: '/resident/create', permanent: true },
      { source: '/resident/pitch/new', destination: '/resident/create', permanent: true },
      { source: '/resident/pitch/create', destination: '/resident/create', permanent: true },
      { source: '/resident/pitch-builder', destination: '/resident/create', permanent: true }
    ];
  }
};

export default nextConfig;
