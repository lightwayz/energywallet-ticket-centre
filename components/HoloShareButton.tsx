"use client";

import { motion } from "framer-motion";

export default function HoloShareButton({ url, title }: { url: string; title: string }) {
    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title,
                text: "Buy your ticket now!",
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <motion.button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
                boxShadow: [
                    "0 0 10px rgba(255,165,0,0.6)",
                    "0 0 20px rgba(255,165,0,0.9)",
                    "0 0 10px rgba(255,165,0,0.6)"
                ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            className="px-4 py-1 rounded-xl bg-energy-orange/20 border border-energy-orange/60
                       text-energy-orange font-semibold text-xs tracking-wide
                       backdrop-blur-md hover:bg-energy-orange hover:text-black
                       transition-all duration-300"
        >
            Share
        </motion.button>
    );
}
