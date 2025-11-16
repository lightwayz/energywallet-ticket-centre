"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import React, { useState } from "react";

export type TicketPurchaseModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    ticketId: string;
    ticketPrice: number;
};

export default function TicketPurchaseModal({
                                                open,
                                                onClose,
                                                onSubmit,
                                                ticketId,
                                                ticketPrice,
                                            }: TicketPurchaseModalProps) {

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            ticketId,
            ticketPrice,
        });
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md overflow-y-auto z-50 flex justify-center py-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white text-black shadow-xl relative max-w-3xl w-full rounded-3xl p-10"
                        transition={{ duration: 0.25 }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-700 hover:text-black"
                        >
                            <X size={28} />
                        </button>

                        <h2 className="text-3xl font-bold text-center mb-4">
                            Enter Your Details
                        </h2>

                        <p className="text-center text-gray-600 mb-8">
                            Your ticket receipt will be sent to your email.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block font-semibold mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-100 rounded-xl p-3"
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-gray-100 rounded-xl p-3"
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full bg-gray-100 rounded-xl p-3"
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-energy-orange text-black font-semibold p-4 rounded-xl hover:bg-orange-400"
                            >
                                Continue to Payment
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
