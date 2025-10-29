"use client";

import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "@/lib/img/Energy_Wallet_logo_ICON[1].png";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // 🟠 Scroll progress glow bar
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.001,
    });

    // 🌗 Background color transitions based on scroll
    const bgColor = useTransform(
        scrollYProgress,
        [0, 0.6, 1],
        ["rgba(0,0,0,0.5)", "rgba(30,20,0,0.85)", "rgba(255,140,0,0.15)"]
    );
    const borderColor = useTransform(
        scrollYProgress,
        [0, 1],
        ["rgba(55,55,55,1)", "rgba(255,165,0,0.8)"]
    );

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            if (current > lastScrollY && current > 100) setHidden(true);
            else setHidden(false);
            setLastScrollY(current);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <header className="relative py-10 text-white flex flex-col items-center justify-center text-center overflow-hidden">
            <AnimatePresence>
                {!hidden && (
                    <motion.header
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                            background: bgColor,
                            borderBottomColor: borderColor,
                        }}
                        className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b shadow-lg"
                    >
                        {/* 🟠 Scroll progress bar */}
                        <motion.div
                            style={{ scaleX }}
                            className="origin-left h-[4px] bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-600 shadow-[0_0_10px_rgba(255,165,0,0.7)]"
                        />

                        {/* 🔹 Clickable Logo + Animated Title */}
                        <Link
                            href="/"
                            className="mt-16 flex items-center justify-center cursor-pointer group"
                        >
                            <motion.div
                                animate={{ rotate: [0, 2, -2, 0], scale: [1, 1.03, 1] }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                }}
                                className="w-10 h-10 flex items-center justify-center"
                            >
                                <Image
                                    src={logo}
                                    alt="EnergyWallet Logo"
                                    width={200}
                                    height={80}
                                    priority
                                    className="w-32 h-auto transition-transform duration-300 group-hover:scale-105"
                                />
                            </motion.div>

                            <motion.h2
                                className="text-lg md:text-xl font-semibold tracking-wide ml-2 flex"
                                animate={{
                                    color: ["#FFA500", "#F5F5F5", "#FFA500"],
                                    textShadow: [
                                        "0 0 6px rgba(255,165,0,0.5)",
                                        "0 0 10px rgba(245,245,245,0.7)",
                                        "0 0 6px rgba(255,165,0,0.5)",
                                    ],
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                }}
                            >
                                <motion.span
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 160,
                                        damping: 18,
                                        delay: 0.4,
                                    }}
                                >
                                    E
                                </motion.span>
                                nergy
                                <motion.span
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 160,
                                        damping: 18,
                                        delay: 0.7,
                                    }}
                                >
                                    W
                                </motion.span>
                                allet
                            </motion.h2>
                        </Link>

                        {/* 🔸 Static subtitle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="mt-6"
                        >
                            <h1 className="text-xl md:text-2xl font-bold tracking-widest">
                                <span className="text-[#FFA500]">TICKET</span>{" "}
                                <span className="text-[#FFA500]">CENTRE</span>
                            </h1>
                        </motion.div>
                    </motion.header>
                )}
            </AnimatePresence>
        </header>
    );
}
