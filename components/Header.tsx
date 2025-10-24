"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import logo from "@/lib/img/Energywallet logo.png";
import { useAuth } from "@/lib/authContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="relative py-10 bg-energy-black text-white flex flex-col items-center justify-center text-center overflow-hidden">
            {/* 🔹 Top Navigation Bar */}
            <div className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-energy-dark/60 backdrop-blur-md">
                <h1 className="text-xl font-bold text-energy-orange">⚡ Energywallet</h1>

                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-sm md:text-base">{user.email}</span>
                        <motion.button
                            onClick={() => signOut(auth)}
                            whileTap={{ scale: 0.95 }}
                            className="bg-energy-orange text-white px-3 py-1 rounded-lg font-semibold hover:bg-orange-400 transition"
                        >
                            Logout
                        </motion.button>
                    </div>
                ) : (
                    <a href="/login" className="text-energy-orange hover:underline">
                        Login
                    </a>
                )}
            </div>

            {/* 🔹 Animated Logo + Text */}
            <motion.div
                className="mt-16 flex items-center justify-center"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <motion.div
                    animate={{
                        rotate: [0, 2, -2, 0],
                        scale: [1, 1.03, 1],
                    }}
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
                        // height={80}
                        style={{ height: "auto" }}
                        priority
                        className="w-32 h-auto"
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
            </motion.div>

            {/* 🔸 Static TICKET CENTRE title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mt-8"
            >
                <h1 className="text-xl md:text-2xl font-bold tracking-widest">
                    <span className="text-[#FFA500]">TICKET</span>{" "}
                    <span className="text-[#D3D3D3]">CENTRE</span>
                </h1>
            </motion.div>
        </header>
    );
}
