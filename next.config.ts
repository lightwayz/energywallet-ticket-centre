/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "5qrlkwth1mh05rxp.public.blob.vercel-storage.com",
            },
            {
                protocol: "https",
                hostname: "developer.apple.com",
            },
            {
                protocol: "https",
                hostname: "play.google.com",
            }
        ],
    },
};

module.exports = nextConfig;
export default nextConfig;
