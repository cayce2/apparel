/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ascendapparel.us" },
      { protocol: "https", hostname: "antoniosclothing.com" },
    ],
  },
};
module.exports = nextConfig;
