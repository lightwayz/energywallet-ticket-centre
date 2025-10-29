"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const TicketSchema = z.object({
    buyerName: z.string().min(2, "Name is required"),
    buyerEmail: z.string().email("Enter a valid email"),
    buyerPhone: z.string().optional(),
});

interface TicketCheckoutModalProps {
    eventId: string;
    eventName: string;
    price: number;
    onClose: () => void;
}

export default function TicketCheckoutModal({
                                                eventId,
                                                eventName,
                                                price,
                                                onClose,
                                            }: TicketCheckoutModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(TicketSchema),
    });

    const onSubmit = async (data: any) => {
        try {
            toast.loading("Initializing payment...");

            // Save guest record in Firestore
            await addDoc(collection(db, "payments"), {
                ...data,
                eventId,
                eventName,
                amount: price,
                status: "PENDING",
                createdAt: serverTimestamp(),
            });

            // Init Monnify payment
            const res = await fetch("/api/payment/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    amount: price,
                    eventId,
                    eventName,
                }),
            });

            const result = await res.json();
            toast.dismiss();

            if (!result.checkoutUrl) throw new Error("Failed to get checkout URL");

            toast.success("Ticket purchase initiated successfully 🎟️");
            reset();

            // Redirect to Monnify
            window.location.href = result.checkoutUrl;
        } catch (err: any) {
            console.error(err);
            toast.dismiss();
            toast.error("Failed to initiate payment. Please try again.");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                key="checkout-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ y: 80, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-energy-black text-white rounded-3xl shadow-xl w-[90%] max-w-md p-8 relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-gray-400 hover:text-white"
                    >
                        <X size={22} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <motion.div
                            initial={{ rotate: -20, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="bg-energy-orange/10 rounded-full p-4 mb-3"
                        >
                            <Ticket className="text-energy-orange" size={40} />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-energy-orange mb-1">
                            Get Your Ticket
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {eventName} — ₦{price.toLocaleString()}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <input
                                {...register("buyerName")}
                                placeholder="Full Name"
                                className="w-full px-4 py-3 bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-energy-orange outline-none"
                            />
                            {errors.buyerName && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.buyerName.message?.toString()}
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                {...register("buyerEmail")}
                                placeholder="Email Address"
                                className="w-full px-4 py-3 bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-energy-orange outline-none"
                            />
                            {errors.buyerEmail && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.buyerEmail.message?.toString()}
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                {...register("buyerPhone")}
                                placeholder="Phone Number (optional)"
                                className="w-full px-4 py-3 bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-energy-orange outline-none"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={isSubmitting}
                            type="submit"
                            className={`w-full py-3 rounded-2xl font-semibold transition flex justify-center items-center gap-2 ${
                                isSubmitting
                                    ? "bg-gray-700 cursor-not-allowed text-gray-300"
                                    : "bg-energy-orange text-energy-black hover:bg-orange-400"
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Processing...
                                </>
                            ) : (
                                <>Proceed to Payment</>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
