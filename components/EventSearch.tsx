"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// ✨ Floating energy particles that drift toward the cursor
function EnergyParticles({ mouse }: { mouse: { x: number; y: number } }) {
    type P = { id: number; x: number; y: number; strength: number };
    const [particles, setParticles] = useState<P[]>([]);

    useEffect(() => {
        const p = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            strength: 6 + Math.random() * 14,
        }));
        setParticles(p);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden z-[1] pointer-events-none">
            {particles.map((p) => {
                const dx = (mouse.x - 0.5) * p.strength;
                const dy = (mouse.y - 0.5) * p.strength;

                return (
                    <motion.div
                        key={p.id}
                        className="absolute w-1.5 h-1.5 rounded-full bg-energy-orange/70 shadow-[0_0_6px_2px_rgba(255,165,0,0.6)]"
                        style={{ top: `${p.y}%`, left: `${p.x}%` }}
                        animate={{ x: dx, y: dy, opacity: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 40,
                            damping: 18,
                            mass: 0.6,
                        }}
                    />
                );
            })}
        </div>
    );
}

export default function EventSearch() {
    const [loading] = useState(false);
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
    const buttonLabel = loading ? "Loading Events..." : "View Events";

    return (
        <div
            className="relative min-h-screen text-center overflow-hidden flex flex-col items-center justify-center"
            onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const nx = (e.clientX - rect.left) / rect.width;
                const ny = (e.clientY - rect.top) / rect.height;
                setMouse({ x: Math.max(0, Math.min(1, nx)), y: Math.max(0, Math.min(1, ny)) });
            }}
            onMouseLeave={() => setMouse({ x: 0.5, y: 0.5 })}
        >

            {/* 🌅 Unified EnergyWallet Gradient Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #ffe0c7 40%, #ff8c3a 100%)",
                }}
            />

            {/* eventback overlay image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: "url('/eventback.jpg')",
                    backgroundAttachment: "fixed",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    opacity: 0.50,
                }}
            />

            {/* ✨ Particles */}
            <EnergyParticles mouse={mouse} />

            {/* Dark Overlay */}
            <motion.div
                className="absolute inset-0 bg-black/45 z-[2]"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0.5 }}
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

                <Link href="/events" className="group relative inline-block">
                    <motion.button
                        className="relative px-10 py-4 text-lg rounded-2xl font-semibold border-2 border-energy-orange
                        bg-energy-orange text-energy-black shadow-lg transition-all duration-500 overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="relative z-20">{buttonLabel}</span>

                        {/* Hover glaze */}
                        <span
                            className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: "rgba(255, 165, 0, 0.15)",
                                backdropFilter: "blur(2px)",
                            }}
                        />

                        {/* Shimmer */}
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
