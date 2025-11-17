"use client";

import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import logo from "@/lib/img/Energy_Wallet_logo_ICON[1].png";

export default function Header() {
    // Scroll progression bar
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
    });

    // Glass background
    const bgColor = useTransform(
        scrollYProgress,
        [0, 1],
        [
            "rgba(255,140,0,0.85)", // Energy orange glow
            "rgba(255,140,0,0.55)",
        ]
    );

    const borderColor = useTransform(
        scrollYProgress,
        [0, 1],
        ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.1)"]
    );

    return (
        <header className="fixed top-0 left-0 w-full z-[999]">
            <AnimatePresence>
                <motion.div
                    initial={{ y: -70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    style={{ background: bgColor, borderBottomColor: borderColor }}
                    className="
                        backdrop-blur-xl border-b shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                    "
                >
                    {/* Scroll Progress Bar */}
                    <motion.div
                        style={{ scaleX }}
                        className="
                            origin-left h-[4px]
                            bg-gradient-to-r
                            from-orange-400 via-yellow-300 to-orange-500
                        "
                    />

                    <div className="max-w-5xl mx-auto px-6 pt-6 pb-4 flex flex-col items-center text-center">

                        {/* LOGO + ENERGYWALLET NAME */}
                        <Link
                            href="/"
                            className="flex items-center justify-center cursor-pointer group"
                        >
                            <motion.div
                                animate={{ rotate: [0, 2, -2, 0] }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                }}
                                className="w-10 h-10 flex items-center justify-center"
                            >
                                <Image
                                    src={logo}
                                    alt="EnergyWallet Logo"
                                    width={200}
                                    height={80}
                                    priority
                                    className="w-32 drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                                />
                            </motion.div>

                            {/* TEXT WITH DROP-IN 'E' AND 'W' */}
                            <motion.h2
                                className="text-xl font-semibold tracking-wide ml-2 flex text-white"
                                animate={{ scale: [1, 1.03, 1] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                }}
                            >
                                <motion.span
                                    initial={{ y: -40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 180,
                                        damping: 18,
                                        delay: 0.4,
                                    }}
                                >
                                    E
                                </motion.span>
                                nergy
                                <motion.span
                                    initial={{ y: -40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 180,
                                        damping: 18,
                                        delay: 0.8,
                                    }}
                                >
                                    W
                                </motion.span>
                                allet
                            </motion.h2>
                        </Link>

                        {/* SUBTITLE */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="text-2xl md:text-3xl font-bold tracking-widest text-white mt-4"
                        >
                            TICKET CENTRE
                        </motion.h1>
                    </div>
                </motion.div>
            </AnimatePresence>
        </header>
    );
}
