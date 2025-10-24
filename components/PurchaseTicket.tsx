"use client";
import React, { useState } from "react";
import { generateTicketPDF } from "@/lib/pdf";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { CheckCircle } from "lucide-react"; // ✅ sleek success icon

export default function PurchaseTicket({
                                           eventId = "event-1",
                                           eventName = "Energy Summit 2025",
                                       }: {
    eventId?: string;
    eventName?: string;
}) {
    const [showForm, setShowForm] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [ticketCode, setTicketCode] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const buttonVariants = {
        initial: { scale: 1, boxShadow: "0px 0px 0px rgba(255,165,0,0)" },
        hover: { scale: 1.05, boxShadow: "0px 6px 14px rgba(255,165,0,0.5)" },
        tap: { scale: 0.95, boxShadow: "0px 0px 0px rgba(255,165,0,0.3)" },
    };

    const formVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
    };

    // ✅ Handle form submit
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue) return;

        const generatedCode = `EW-${Math.floor(100000 + Math.random() * 900000)}`;
        setTicketCode(generatedCode);

        try {
            // 🔸 Simulate backend call
            const res = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 5000,
                    buyerName: inputValue.includes("@") ? "Email User" : "Phone User",
                    buyerEmail: inputValue.includes("@") ? inputValue : "user@energywallet.io",
                    eventId,
                }),
            });

            const data = await res.json();
            if (data.checkoutUrl) {
                // redirect (in real flow)
                window.location.href = data.checkoutUrl;
            }

            setIsSubmitted(true);
            setTimeout(() => setShowSuccess(true), 1000);
        } catch (err) {
            console.error("Payment error:", err);
            alert("Failed to initiate payment. Please try again.");
        }
    };

    // ✅ Generate PDF ticket
    const handleDownloadPDF = async () => {
        const doc = await generateTicketPDF({
            eventName,
            ticketCode,
            emailOrPhone: inputValue,
        });
        doc.save(`${ticketCode}.pdf`);
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center my-12"
        >
            {/* 🎟 Main Purchase Button */}
            {!showForm && !showSuccess && (
                <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setShowForm(true)}
                    className="px-8 py-4 bg-energy-orange text-energy-black font-semibold rounded-2xl shadow-lg focus:outline-none"
                >
                    Purchase Ticket
                </motion.button>
            )}

            {/* ✉️ Form */}
            <AnimatePresence mode="wait">
                {showForm && !isSubmitted && (
                    <motion.form
                        key="form"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onSubmit={handleFormSubmit}
                        className="mt-6 flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-gray-800 w-full max-w-sm mx-auto"
                    >
                        <input
                            type="text"
                            required
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter Email or Phone Number"
                            className="w-full px-4 py-3 rounded-xl bg-transparent border border-gray-700 text-white focus:outline-none focus:border-energy-orange placeholder-gray-400"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full px-6 py-3 bg-energy-orange text-energy-black font-semibold rounded-xl shadow-md hover:bg-orange-400 transition"
                        >
                            Continue to Payment
                        </motion.button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* ✅ Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        key="success-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: easeOut }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-energy-black border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ duration: 0.6, ease: "backOut" }}
                                className="flex justify-center mb-6"
                            >
                                <CheckCircle size={80} className="text-energy-orange" />
                            </motion.div>

                            <h2 className="text-2xl font-bold text-energy-orange mb-2">
                                Ticket Confirmed!
                            </h2>
                            <p className="text-gray-300 mb-4">
                                Your ticket code is{" "}
                                <span className="text-energy-orange font-mono">{ticketCode}</span>
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDownloadPDF}
                                className="px-6 py-3 bg-energy-orange text-energy-black font-semibold rounded-xl shadow-md hover:bg-orange-400 transition w-full mb-3"
                            >
                                Download Ticket PDF
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowSuccess(false)}
                                className="text-gray-400 hover:text-white underline"
                            >
                                Close
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
