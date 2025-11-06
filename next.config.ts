import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "5qrlkwth1mh05rxp.public.blob.vercel-storage.com",
            },
        ],
    },
};

module.exports = nextConfig;


export default nextConfig;


