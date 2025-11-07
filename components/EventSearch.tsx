"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// ✨ Floating energy particles
function EnergyParticles() {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        setParticles(
            Array.from({ length: 25 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
            }))
        );
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden z-[1]">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-1.5 h-1.5 rounded-full bg-energy-orange/70 shadow-[0_0_6px_2px_rgba(255,165,0,0.6)]"
                    style={{
                        top: `${p.y}%`,
                        left: `${p.x}%`,
                    }}
                    animate={{
                        y: ["0%", "3%", "-2%", "0%"],
                        x: ["0%", "2%", "-1%", "0%"],
                        opacity: [0.8, 1, 0.6, 0.8],
                    }}
                    transition={{
                        duration: 6 + Math.random() * 4,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

export default function EventSearch() {
    const [loading] = useState(false);
    const buttonLabel = loading ? "Loading Events..." : "View Events";

    return (
        <div className="relative min-h-screen text-center overflow-hidden flex flex-col items-center justify-center">
            {/* 🌌 Fullscreen Static Background */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: "url('/eventback.jpg')",
                    backgroundAttachment: "fixed", // keeps image static
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    opacity: 0.4, // subtle visibility
                }}
            />

            {/* ✨ Energy Particles */}
            <EnergyParticles />

            {/* Dark Overlay */}
            <motion.div
                className="absolute inset-0 bg-black/45 z-[2]"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 1.2 }}
            />

            {/* Foreground Content */}
            <div className="relative z-10 max-w-3xl mx-auto px-4 backdrop-blur-sm">
                <motion.h1
                    className="text-3xl md:text-4xl font-bold mb-8 tracking-widest text-energy-orange drop-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    UPCOMING&nbsp;EVENTS
                </motion.h1>

                <p className="text-gray-300 mb-8">
                    Discover electrifying experiences near you — powered by EnergyWallet.
                </p>

                {/* View Events Button */}
                <Link href="/events" className="group relative inline-block">
                    <motion.button
                        className="relative px-10 py-4 text-lg rounded-2xl font-semibold border-2 border-energy-orange
               bg-energy-orange text-energy-black shadow-lg transition-all duration-500 overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="relative z-20">{buttonLabel}</span>

                        {/* Hover Transparent Overlay */}
                        <span
                            className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: "rgba(255, 165, 0, 0.15)",
                                backdropFilter: "blur(2px)",
                            }}
                        />

                        {/* Shimmer Sweep */}
                        <motion.span
                            className="absolute top-0 left-[-70%] w-[40%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent
                 rounded-2xl opacity-0 group-hover:opacity-80"
                            whileHover={{ left: "120%" }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                        />
                    </motion.button>
                </Link>
            </div>
        </div>
    );
}
