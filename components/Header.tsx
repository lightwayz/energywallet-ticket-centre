"use client";

import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import logo from "@/lib/img/Energy_Wallet_logo_ICON[1].png";
import Link from "next/link";

export default function Header() {
    // Scroll progress bar
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.001,
    });

    // Glassy banner colour
    const bgColor = useTransform(
        scrollYProgress,
        [0, 0.6, 1],
        [
            "rgba(255,140,0,0.85)", // **ENERGY ORANGE at top**
            "rgba(255,140,0,0.70)",
            "rgba(255,140,0,0.55)",
        ]
    );

    const borderColor = useTransform(
        scrollYProgress,
        [0, 1],
        ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)"]
    );

    return (
        <header className="fixed top-0 left-0 w-full z-[999]">
        <AnimatePresence>
                <motion.header
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                        background: bgColor,
                        borderBottomColor: borderColor,
                    }}
                    className="
        fixed top-0 w-full
        backdrop-blur-xl
        border-b
        shadow-[0_4px_20px_rgba(0,0,0,0.08)]
        z-50
    "
                >

                {/* Scroll Progress Bar */}
                    <motion.div
                        style={{ scaleX }}
                        className="
                            origin-left
                            h-[4px]
                            bg-gradient-to-r
                            from-orange-400 via-yellow-300 to-orange-500
                        "
                    />

                    {/* ⭐ The CONTAINER that gives spacing left/right/top */}
                    <div className="max-w-5xl mx-auto px-6 pt-6 pb-4 text-center">

                        {/* Logo + Title */}
                        <Link
                            href="/"
                            className="flex items-center justify-center cursor-pointer group"
                        >
                            <motion.div
                                animate={{ rotate: [0, 2, -2, 0], scale: [1, 1.03, 1] }}
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
                                    className="w-32 h-auto drop-shadow-[0_0_8px_rgba(255,165,0,0.5)]"
                                />
                            </motion.div>

                            <motion.h2
                                className="text-xl font-semibold tracking-wide ml-2 flex text-white"
                                animate={{
                                    color: ["#ffffff", "#FFE8C2", "#ffffff"],
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                }}
                            >
                                EnergyWallet
                            </motion.h2>
                        </Link>

                        {/* Subtitle — now CENTERED again */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="text-2xl md:text-3xl font-bold tracking-widest text-white mt-4"
                        >
                            TICKET CENTRE
                        </motion.h1>

                    </div>
                </motion.header>
            </AnimatePresence>
        </header>
    );
}
