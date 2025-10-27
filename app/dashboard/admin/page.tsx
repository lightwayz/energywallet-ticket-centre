"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPage() {
    const [tab, setTab] = useState<"events" | "payments">("events");
    const [events, setEvents] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAll();
    }, [tab]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            if (tab === "events") {
                const snapshot = await getDocs(collection(db, "events"));
                setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
            } else {
                const snapshot = await getDocs(collection(db, "payments"));
                setPayments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
            }
        } catch (err) {
            console.error("Error fetching:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async (id: string) => {
        if (!confirm("Confirm this payment as successful?")) return;
        try {
            await updateDoc(doc(db, "payments", id), {
                status: "PAID",
                confirmedAt: Timestamp.now(),
            });
            alert("Payment confirmed.");
            fetchAll();
        } catch (err) {
            console.error("Error confirming payment:", err);
            alert("Failed to confirm payment.");
        }
    };

    const handleDeletePayment = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payment record?")) return;
        try {
            await deleteDoc(doc(db, "payments", id));
            alert("Payment deleted.");
            fetchAll();
        } catch (err) {
            console.error("Error deleting payment:", err);
            alert("Failed to delete payment.");
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                {/* Tabs */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-energy-orange">Admin Dashboard</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTab("events")}
                            className={`px-4 py-2 rounded-lg ${
                                tab === "events"
                                    ? "bg-emerald-500"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            Events
                        </button>
                        <button
                            onClick={() => setTab("payments")}
                            className={`px-4 py-2 rounded-lg ${
                                tab === "payments"
                                    ? "bg-blue-500"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            Payments
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-gray-500 rounded-full"></div>
                    </div>
                ) : tab === "events" ? (
                    <EventManager events={events} refresh={fetchAll} />
                ) : (
                    <PaymentManager
                        payments={payments}
                        onConfirm={handleConfirmPayment}
                        onDelete={handleDeletePayment}
                    />
                )}
            </div>
        </AdminGuard>
    );
}

/* 🎟 EVENT MANAGER */
function EventManager({ events }: any) {
    if (events.length === 0)
        return <p className="text-gray-400 text-center">No events found.</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
                const formattedDate = event.date?.toDate
                    ? event.date.toDate().toLocaleString()
                    : new Date(event.date).toLocaleString();

                return (
                    <div
                        key={event.id}
                        className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        <h3 className="text-xl font-semibold text-emerald-400 mb-2">
                            {event.title}
                        </h3>
                        <p className="text-gray-300 mb-3">{event.description || "No description."}</p>
                        <div className="text-gray-400 text-sm space-y-1 mb-3">
                            <p><strong>Date:</strong> {formattedDate}</p>
                            <p><strong>Location:</strong> {event.location || "Unknown"}</p>
                            <p><strong>Price:</strong> ₦{event.price || 0}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* 💳 PAYMENT MANAGER */
function PaymentManager({ payments, onConfirm, onDelete }: any) {
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
                {payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/30">
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
