"use client";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

export default function ContactForm() {
    return (
        <motion.form
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-md mx-auto my-10 space-y-5"
        >
            <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-2xl bg-black/40 border border-gray-700 text-white placeholder-gray-400 focus:ring-energy-orange focus:border-energy-orange"
            />
            <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full rounded-2xl bg-black/40 border border-gray-700 text-white placeholder-gray-400 focus:ring-energy-orange focus:border-energy-orange"
            />
        </motion.form>
    );
}
