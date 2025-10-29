"use client";

import { motion } from "framer-motion";
import { Mail, Twitter, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <motion.footer
            id="contact"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-black/30 backdrop-blur-md border-t border-gray-800 text-gray-400 mt-16"
        >
            <div className="container mx-auto px-6 py-10 text-center space-y-6">
                <h3 className="text-xl font-semibold text-energy-orange">
                    Stay Connected
                </h3>

                <div className="flex justify-center gap-6 text-gray-400">
                    <a href="mailto:support@energywallet.io" className="hover:text-energy-orange transition">
                        <Mail size={20} />
                    </a>
                    <a href="https://twitter.com/energywallet" className="hover:text-energy-orange transition">
                        <Twitter size={20} />
                    </a>
                    <a href="https://instagram.com/energywallet" className="hover:text-energy-orange transition">
                        <Instagram size={20} />
                    </a>
                </div>

                <p className="text-xs text-gray-500">
                    © {new Date().getFullYear()} EnergyWallet Ticket Centre · All rights reserved.
                </p>
            </div>
        </motion.footer>
    );
}
