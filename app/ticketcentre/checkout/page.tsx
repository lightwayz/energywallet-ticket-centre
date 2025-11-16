"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, easeOut } from "framer-motion";
import dynamicImport from "next/dynamic";

// Safe dynamic import (NO conflict with local variable names)
const ThreeScene = dynamicImport(() => import("@/components/ThreeScene"), {
    ssr: false,
});

// 🔥 ENERGYWALLET GLOWING BUTTON (Reusable)
const GlowingButton = ({
                           children,
                           loading,
                       }: {
    children: any;
    loading?: boolean;
}) => (
    <motion.button
        type="submit"
        disabled={loading}
        animate={{
            rotate: 360,
            transition: { repeat: Infinity, ease: "linear", duration: 6 },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.25, ease: easeOut }}
        className="
            relative px-10 py-4 rounded-full font-semibold text-white w-full mt-4
            bg-gradient-to-r from-[#FF7A00] via-[#FFA500] to-[#FF7A00]
            shadow-[0_0_25px_rgba(255,165,0,0.5)]
            border border-[#FFB84D]/40
            overflow-hidden select-none
            disabled:opacity-50
        "
    >
        {/* Glow background layer */}
        <span
            className="
                absolute inset-0 rounded-full
                bg-gradient-to-r from-[#FF7A00]/40 to-[#FFA500]/40
                blur-xl opacity-70 animate-pulse
            "
        />

        {/* Button text */}
        <span className="relative z-10 tracking-wide">
            {loading ? "Processing..." : children}
        </span>
    </motion.button>
);

export default function CheckoutPage() {
    const router = useRouter();
    const params = useSearchParams();

    // 🔹 Safe param extraction
    const eventId = params.get("eventId") ?? "";
    const eventName = params.get("eventName") ?? "Selected Event";
    const price = Number(params.get("price") ?? "0");

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            buyerName: formData.fullName,
            buyerEmail: formData.email,
            buyerPhone: formData.phone,
            eventId,
            eventName,
            amount: price,
        };

        console.log("📦 Sending payload:", payload);

        const res = await fetch("/api/payment/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("🔵 Monnify response:", data);

        if (data?.checkoutUrl) {
            window.location.href = data.checkoutUrl;
        } else {
            alert("Payment failed. " + (data?.message || ""));
        }

        setLoading(false);
    };


    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">

            {/* 🔸 3D HEADER */}
            <div className="w-full bg-white py-12 shadow-md border-b border-gray-100">
                <div className="max-w-5xl mx-auto transition-transform duration-700 ease-out">
                    <ThreeScene />
                </div>
            </div>

            {/* 🔸 EVENT SUMMARY */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mt-10"
            >
                <h1 className="text-3xl font-bold text-black">
                    Complete Your Ticket Order
                </h1>

                <p className="text-gray-700 mt-3">
                    Event: <span className="font-semibold">{eventName}</span>
                </p>

                <p className="text-gray-900 font-bold mt-1 text-xl">
                    Price: ₦{price}
                </p>
            </motion.div>

            {/* 🔸 FORM CARD */}
            <div className="flex justify-center mt-12 px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: easeOut }}
                    className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl border border-gray-200"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Full Name */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-100 rounded-xl p-3 text-gray-900"
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
                                }
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-100 rounded-xl p-3 text-gray-900"
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                className="w-full bg-gray-100 rounded-xl p-3 text-gray-900"
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />
                        </div>

                        {/* 🔥 MATCHING GLOWING BUTTON */}
                        <GlowingButton loading={loading}>
                            Continue to Payment
                        </GlowingButton>

                        {/* Cancel link */}
                        <p
                            onClick={() => router.back()}
                            className="mt-4 text-center text-gray-600 hover:text-black cursor-pointer underline"
                        >
                            Cancel / Go Back
                        </p>
                    </form>
                </motion.div>
            </div>

            {/* FOOTER */}
            <div className="bg-energy-orange text-black text-center py-6 mt-auto font-semibold shadow-inner">
                Powered by EnergyWallet
            </div>
        </div>
    );
}
