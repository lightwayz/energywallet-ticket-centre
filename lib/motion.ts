// lib/motion.ts
import { Variants } from "framer-motion";

/**
 * 🌟 Energywallet Motion Library
 * Centralized animation variants to ensure consistent motion design.
 * Brand colors:
 * - Light Orange: #FFA500
 * - Deep Black: #0D0D0D
 */

/** 🔼 Fade In + Slide Up */
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

/** ✨ Soft Fade In (no movement) */
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

/** 🎯 Button Press / Hover States */
export const buttonVariants: Variants = {
    inactive: {
        backgroundColor: "#FFA500",
        scale: 1,
        boxShadow: "0px 0px 0px rgba(255,165,0,0)",
        transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
        scale: 1.05,
        boxShadow: "0px 6px 14px rgba(255,165,0,0.5)",
        transition: { duration: 0.3, ease: "easeOut" },
    },
    tap: {
        scale: 0.95,
        boxShadow: "0px 0px 0px rgba(255,165,0,0.3)",
        transition: { duration: 0.2, ease: "easeOut" },
    },
};

/** 🪄 Dropdowns, Modals, Cards */
export const dropdownVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -10,
        scale: 0.98,
        transition: { duration: 0.2 },
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: "0px 4px 20px rgba(255,165,0,0.2)",
        transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.15 },
    },
};

/** 💫 Subtle Glow Effect for Logo or Brand Elements */
export const glowPulse: Variants = {
    initial: { scale: 1, boxShadow: "0 0 0 rgba(255,165,0,0)" },
    animate: {
        scale: [1, 1.03, 1],
        boxShadow: [
            "0 0 0 rgba(255,165,0,0)",
            "0 0 20px rgba(255,165,0,0.6)",
            "0 0 0 rgba(255,165,0,0)",
        ],
        transition: {
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
        },
    },
};
