"use client";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { FaAndroid, FaApple } from "react-icons/fa";

export default function DownloadApp() {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center my-12"
        >
            <h3 className="text-lg font-semibold mb-4 text-energy-orange">Download EnergyWallet</h3>
            <div className="flex justify-center gap-6">
                <a
                    href="#"
                    className="flex items-center gap-2 px-6 py-3 bg-energy-black border border-energy-orange text-energy-orange rounded-2xl hover:bg-energy-orange hover:text-energy-black transition"
                >
                    <FaAndroid /> Android
                </a>
                <a
                    href="#"
                    className="flex items-center gap-2 px-6 py-3 bg-energy-black border border-energy-orange text-energy-orange rounded-2xl hover:bg-energy-orange hover:text-energy-black transition"
                >
                    <FaApple /> iOS
                </a>
            </div>
        </motion.div>
    );
}
