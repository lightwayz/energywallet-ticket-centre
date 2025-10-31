"use client";

import React from "react";

interface PaymentManagerProps {
    payments: any[];
    onConfirm: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function PaymentManager({
                                           payments,
                                           onConfirm,
                                           onDelete,
                                       }: PaymentManagerProps) {
    if (payments.length === 0)
        return <p className="text-gray-400 text-center">No payments yet.</p>;

    return (
        <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg p-5">
            <table className="min-w-full text-left border-collapse">
                <thead>
                <tr className="text-gray-300 border-b border-gray-700">
                    <th className="p-3">Buyer</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Event</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {payments.map((p) => (
                    <tr
                        key={p.id}
                        className="border-b border-gray-700 hover:bg-gray-700/30"
                    >
                        <td className="p-3">{p.buyerName || "N/A"}</td>
                        <td className="p-3">{p.buyerEmail || "—"}</td>
                        <td className="p-3">{p.eventName || "—"}</td>
                        <td className="p-3">₦{p.amount}</td>
                        <td
                            className={`p-3 font-semibold ${
                                p.status === "PAID"
                                    ? "text-emerald-400"
                                    : p.status === "FAILED"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                            }`}
                        >
                            {p.status}
                        </td>
                        <td className="p-3 flex gap-2">
                            {p.status !== "PAID" && (
                                <button
                                    onClick={() => onConfirm(p.id)}
                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded text-sm"
                                >
                                    Confirm
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(p.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
