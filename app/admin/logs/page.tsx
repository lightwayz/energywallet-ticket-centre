"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import AdminGuard from "@/components/AdminGuard";

interface LogEntry {
    id: string;
    status: string;
    reference?: string;
    customerEmail?: string;
    eventName?: string;
    paymentStatus?: string;
    receivedAt?: any;
    timestamp?: any;
    error?: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        const q = query(collection(db, "monnify_logs"), orderBy("receivedAt", "desc"), limit(100));
        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LogEntry[];
            setLogs(data);
        });
        return () => unsubscribe();
    }, []);

    const filteredLogs =
        filter === "ALL" ? logs : logs.filter((log) => log.status === filter);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                    <h1 className="text-2xl font-bold text-emerald-400">Monnify Webhook Logs</h1>
                    <div className="flex gap-2">
                        {["ALL", "PAID_AND_TICKET_SENT", "FAILED_SIGNATURE", "INVALID_PAYLOAD", "ERROR"].map(
                            (status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                        filter === status
                                            ? "bg-emerald-600"
                                            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                                    }`}
                                >
                                    {status.replace(/_/g, " ")}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {filteredLogs.length === 0 ? (
                    <p className="text-gray-400 text-center mt-20">No logs found yet.</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredLogs.map((log, i) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className={`p-4 rounded-lg border ${
                                    log.status === "PAID_AND_TICKET_SENT"
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : log.status === "FAILED_SIGNATURE"
                                            ? "border-red-500 bg-red-500/10"
                                            : log.status === "ERROR"
                                                ? "border-yellow-500 bg-yellow-500/10"
                                                : "border-gray-700 bg-gray-800"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-semibold text-energy-orange">
                                        {log.status.replace(/_/g, " ")}
                                    </h2>
                                    <span className="text-xs text-gray-400">
                    {formatDistanceToNow(
                        log.receivedAt?.toDate?.() || log.timestamp?.toDate?.() || new Date(),
                        { addSuffix: true }
                    )}
                  </span>
                                </div>

                                {log.reference && (
                                    <p className="text-sm text-gray-300">
                                        <strong>Ref:</strong> {log.reference}
                                    </p>
                                )}
                                {log.customerEmail && (
                                    <p className="text-sm text-gray-400">
                                        <strong>Email:</strong> {log.customerEmail}
                                    </p>
                                )}
                                {log.eventName && (
                                    <p className="text-sm text-gray-400">
                                        <strong>Event:</strong> {log.eventName}
                                    </p>
                                )}
                                {log.error && (
                                    <p className="text-sm text-red-400 mt-2">
                                        <strong>Error:</strong> {log.error}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}
