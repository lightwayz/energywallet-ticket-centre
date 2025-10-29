"use client";
import React, { useState } from "react";
import { generateTicketPDF } from "@/lib/pdf";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { CheckCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function PurchaseTicket({
                                           eventId = "event-1",
                                           eventName = "Energy Summit 2025",
                                       }: {
    eventId?: string;
    eventName?: string;
}) {
    const [ticketCode, setTicketCode] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false); // 👈 controls visibility

    const handlePurchase = async () => {
        if (loading) return;
        setLoading(true);

        const generatedCode = `EW-${Math.floor(100000 + Math.random() * 900000)}`;
        setTicketCode(generatedCode);

        try {
            const res = await fetch("/app/api/payment/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 5000,
                    buyerName: "Guest User",
                    buyerEmail: "info@energywalletng.com",
                    eventId,
                    eventName,
                }),
            });

            const data = await res.json();
            if (!data.checkoutUrl) throw new Error("No checkout URL returned");

            await addDoc(collection(db, "payments"), {
                eventId,
                eventName,
                buyerEmail: "info@energywalletng.com",
                buyerName: "Guest User",
                amount: 5000,
                status: "PENDING",
                ticketCode: generatedCode,
                createdAt: serverTimestamp(),
            });

            window.location.href = data.checkoutUrl;
        } catch (err) {
            console.error("Payment init error:", err);
            alert("Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const bytes = await generateTicketPDF({
                name: "Guest User",
                eventName,
                reference: ticketCode,
            });

            // @ts-ignore
            const blob = new Blob([new Uint8Array(bytes.buffer)], {
                type: "application/pdf",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${eventName.replace(/\s/g, "_")}_${ticketCode}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate ticket PDF.");
        }
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center my-8"
        >
            {/* 🟢 Only show this button first */}
            {!showPayment && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPayment(true)}
                    className="px-8 py-3 bg-energy-orange text-energy-black rounded-2xl font-semibold shadow-md hover:bg-orange-400"
                >
                    Purchase Ticket
                </motion.button>
            )}

            {/* 🎟 Show payment button only after click */}
            {showPayment && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePurchase}
                        disabled={loading}
                        className={`px-8 py-3 rounded-2xl font-semibold shadow-md transition ${
                            loading
                                ? "bg-gray-600 cursor-not-allowed text-gray-300"
                                : "bg-energy-orange text-energy-black hover:bg-orange-400"
                        }`}
                    >
                        {loading ? "Processing..." : "Continue to Payment"}
                    </motion.button>
                </motion.div>
            )}

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
