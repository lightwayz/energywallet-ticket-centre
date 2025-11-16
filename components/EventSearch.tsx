"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";

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

    // GLOBAL PARALLAX
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1200], [0, -280]); // ULTRA parallax

    return (
        <>
            {/* 🔥 WHITE SPACE BELOW HEADER (THE FIX) */}
            <div className="h-8 bg-white w-full"></div>

            {/* EVERYTHING SCROLLS INTO HEADER */}
            <motion.div style={{ y }}>

                <div
                    className="relative min-h-screen text-center overflow-hidden flex flex-col items-center justify-center"

                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const nx = (e.clientX - rect.left) / rect.width;
                        const ny = (e.clientY - rect.top) / rect.height;
                        setMouse({ x: nx, y: ny });
                    }}
                    onMouseLeave={() => setMouse({ x: 0.5, y: 0.5 })}
                >

                    {/* BACKGROUND IMAGE */}
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center z-0 max-w-6xl mx-auto rounded-2xl"
                        style={{
                            backgroundImage: "url('/eventback.jpg')",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                        }}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                    />

                    {/* ORANGE SOFT OVERLAY */}
                    <motion.div
                        className="absolute inset-0 z-0 max-w-6xl mx-auto rounded-2xl"
                        style={{
                            background:
                                "linear-gradient(180deg, #ffffff00 0%, #FFF4E600 20%, #FF9F1C44 90%)",
                        }}
                    />

                    {/* DARK OVERLAY */}
                    <div className="absolute inset-0 bg-black/45 z-[2] max-w-6xl mx-auto rounded-2xl" />

                    {/* PARTICLES */}
                    <EnergyParticles mouse={mouse} />

                    {/* FOREGROUND */}
                    <div className="relative z-20 max-w-3xl mx-auto px-4 backdrop-blur-sm mt-10">
                        <motion.h1
                            className="text-3xl md:text-4xl font-bold mb-8 tracking-widest text-energy-orange drop-shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            UPCOMING EVENTS
                        </motion.h1>

                        <p className="text-gray-300 mb-8">
                            Discover electrifying experiences near you — powered by EnergyWallet.
                        </p>

                        <Link href="/events" className="group relative inline-block">
                            <motion.button
                                className="relative px-10 py-4 text-lg rounded-2xl font-semibold border-2 border-energy-orange bg-energy-orange text-energy-black shadow-lg"
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="relative z-20">{buttonLabel}</span>
                            </motion.button>
                        </Link>
                    </div>

                </div>

            </motion.div>
        </>
    );
}
