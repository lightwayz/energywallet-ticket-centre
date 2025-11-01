"use client";

import React from "react";
import { motion } from "framer-motion";

interface Purchase {
    id: string;
    userEmail: string;
    userName: string;
    eventId: string;
    eventName: string;
    amount: number;
    paymentStatus: string;
    paymentRef: string;
    createdAt?: any;
}

interface Props {
    purchases: Purchase[];
    onDelete: (id: string) => Promise<void>;
}

export default function PurchasesManager({ purchases, onDelete }: Props) {
    if (!purchases || purchases.length === 0) {
        return <p className="text-gray-400 text-center">No purchases yet.</p>;
    }

    return (
        <div className="overflow-x-auto bg-gray-900 rounded-xl p-4 border border-gray-800">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-800 text-gray-100">
                <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Event</th>
                    <th className="p-3">Amount (₦)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                </tr>
                </thead>
                <tbody>
                {purchases.map((p) => (
                    <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                        <td className="p-3">{p.userName || "N/A"}</td>
                        <td className="p-3">{p.userEmail}</td>
                        <td className="p-3">{p.eventName}</td>
                        <td className="p-3">₦{p.amount.toLocaleString()}</td>
                        <td className={`p-3 font-semibold ${p.paymentStatus === "PAID" ? "text-green-400" : "text-yellow-400"}`}>
                            {p.paymentStatus}
                        </td>
                        <td className="p-3">{p.paymentRef}</td>
                        <td className="p-3">
                            {p.createdAt?.toDate
                                ? p.createdAt.toDate().toLocaleString()
                                : "—"}
                        </td>
                        <td className="p-3 text-right">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onDelete(p.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                            >
                                Delete
                            </motion.button>
                        </td>
                    </motion.tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
