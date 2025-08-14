/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'dongardner.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'cdn.redfin.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
    ],
  },
};

export default nextConfig;
