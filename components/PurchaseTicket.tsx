// noinspection JSUnusedLocalSymbols,ES6ShorthandObjectProperty

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { CheckCircle } from "lucide-react";
import { generateTicketPDF } from "@/lib/ticketUtils";

// noinspection JSFunctionExpressionToArrowFunction
export default function PurchaseTicket({
                                           eventId,
                                           eventName,
                                           price,
                                       }: {
    eventId: string;
    eventName: string;
    price: number | string;
}) {
 {
    const [loading, setLoading] = useState(false);
    const [ticketCode, setTicketCode] = useState("");
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

     const handlePurchase = async () => {
         if (loading) return;
         setLoading(true);

         try {
             const cleanAmount = Number(String(price).replace(/[^0-9.]/g, ""));
             if (isNaN(cleanAmount) || cleanAmount <= 0) {
                 alert("Invalid ticket price");
                 return;
             }

             const res = await fetch("/api/payment/init", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
                     buyerName: "Guest User",
                     buyerEmail: "info@energywalletng.com",
                     eventId,
                     eventName,
                     amount: cleanAmount, // ✅ send the actual price
                 }),
             });

             const data = await res.json();

             if (!data?.checkoutUrl) throw new Error(data?.message || "No checkout URL returned");

             // ✅ Redirect to Monnify payment
             window.location.href = data.checkoutUrl;
         } catch (err) {
             console.error("Payment init error:", err);
             alert("Failed to initiate payment. Please check event ID or try again.");
         } finally {
             setLoading(false);
         }
     };


     const handleDownloadPDF = async () => {
        const reference = `EW-${Math.floor(100000 + Math.random() * 900000)}`;
        setTicketCode(reference);
        setShowSuccess(true);

        try {
            const bytes = await generateTicketPDF({
                name: "Guest User",
                eventName,
                reference,
            });

            // @ts-ignore
            const blob = new Blob([new Uint8Array(bytes.buffer)], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${eventName.replace(/\s/g, "_")}_${reference}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate ticket PDF.");
        }
    };

    return (
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center my-8">
            {!showPayment && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPayment(true)}
                               className="px-8 py-3 bg-energy-orange text-energy-black rounded-2xl font-semibold shadow-md hover:bg-orange-400">
                    Purchase Ticket
                </motion.button>
            )}

            {showPayment && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePurchase}
                                   disabled={loading} className={`px-8 py-3 rounded-2xl font-semibold shadow-md transition ${loading ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-energy-orange text-energy-black hover:bg-orange-400"}`}>
                        {loading ? "Processing..." : "Continue to Payment"}
                    </motion.button>
                </motion.div>
            )}

            <AnimatePresence>
                {showSuccess && (
                    <motion.div key="success-modal" initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, ease: easeOut }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }} className="bg-energy-black border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                            <CheckCircle size={80} className="text-energy-orange mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-energy-orange mb-2">Ticket Confirmed!</h2>
                            <p className="text-gray-300 mb-4">Your ticket code: <span className="text-energy-orange font-mono">{ticketCode}</span></p>
                            <button onClick={handleDownloadPDF} className="px-6 py-3 bg-energy-orange text-energy-black font-semibold rounded-xl shadow-md hover:bg-orange-400 w-full mb-3">Download Ticket PDF</button>
                            <button onClick={() => setShowSuccess(false)} className="text-gray-400 hover:text-white underline">Close</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}}
