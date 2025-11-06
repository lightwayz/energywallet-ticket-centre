"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// ✨ Helper to generate particles dynamically
function EnergyParticles() {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        // Generate random positions
        const p = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
        }));
        setParticles(p);
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

    // 🌀 3D parallax background
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const rotateX = useTransform(y, [0, 1], [10, -10]);
    const rotateY = useTransform(x, [0, 1], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - left) / width;
        const py = (e.clientY - top) / height;
        x.set(px);
        y.set(py);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    const buttonLabel = loading ? "Loading Events..." : "View Events";

    return (
        <div
            className="relative min-h-[85vh] text-center overflow-hidden flex flex-col items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* 🌌 Animated 3D background */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: "url('/eventback.jpg')",
                    rotateX,
                    rotateY,
                    transformPerspective: 1000,
                    opacity: 0.35, // 🔥 slightly stronger visibility
                }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
            />

            {/* ✨ Floating AI Particles */}
            <EnergyParticles />

            {/* Overlay */}
            <motion.div
                className="absolute inset-0 bg-black/45 z-[2]"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 1.2 }}
            />

            {/* Foreground */}
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

                <Link
                    href="/events"
                    className="px-8 py-4 text-lg bg-energy-orange text-energy-black rounded-2xl font-semibold shadow-lg hover:bg-orange-400 transition"
                >
                    {buttonLabel}
                </Link>
            </div>
        </div>
    );
}
