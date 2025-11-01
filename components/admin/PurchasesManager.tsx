"use client";

import React, { useMemo, useState } from "react";
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
    const [filterEvent, setFilterEvent] = useState<string>("All");
    const [sortKey, setSortKey] = useState<keyof Purchase>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const perPage = 10;

    // 🔹 Extract unique event names
    const eventNames = useMemo(() => {
        const set = new Set(purchases.map((p) => p.eventName || "Unknown"));
        return ["All", ...Array.from(set)];
    }, [purchases]);

    // 🔹 Filter + sort purchases
    const filtered = useMemo(() => {
        let list = filterEvent === "All"
            ? purchases
            : purchases.filter((p) => p.eventName === filterEvent);

        return [...list].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (!aVal || !bVal) return 0;
            if (typeof aVal === "string") {
                return sortOrder === "asc"
                    ? aVal.localeCompare(bVal as string)
                    : (bVal as string).localeCompare(aVal);
            }
            if (typeof aVal === "number") {
                return sortOrder === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal;
            }
            if (aVal?.seconds && bVal?.seconds) {
                return sortOrder === "asc"
                    ? aVal.seconds - bVal.seconds
                    : bVal.seconds - aVal.seconds;
            }
            return 0;
        });
    }, [purchases, filterEvent, sortKey, sortOrder]);

    // 🔹 Pagination
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    // 🔹 CSV Export
    const handleExport = () => {
        const header = [
            "User Name",
            "User Email",
            "Event Name",
            "Amount",
            "Status",
            "Reference",
            "Date",
        ];
        const rows = filtered.map((p) => [
            p.userName,
            p.userEmail,
            p.eventName,
            p.amount,
            p.paymentStatus,
            p.paymentRef,
            p.createdAt?.toDate
                ? p.createdAt.toDate().toLocaleString()
                : "—",
        ]);

        const csvContent =
            [header, ...rows].map((e) => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ticket_purchases.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSort = (key: keyof Purchase) => {
        if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    return (
        <div className="space-y-6">
            {/* 🔹 Filters and Export */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex gap-3 items-center">
                    <label className="text-gray-300 text-sm">Filter by Event:</label>
                    <select
                        className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700"
                        value={filterEvent}
                        onChange={(e) => {
                            setFilterEvent(e.target.value);
                            setPage(1);
                        }}
                    >
                        {eventNames.map((name) => (
                            <option key={name}>{name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleExport}
                    className="bg-energy-orange text-black px-4 py-2 rounded-lg hover:bg-orange-400 transition font-semibold"
                >
                    Export CSV
                </button>
            </div>

            {/* 🔹 Table */}
            <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-800 text-gray-100">
                    <tr>
                        {[
                            { key: "userName", label: "User" },
                            { key: "userEmail", label: "Email" },
                            { key: "eventName", label: "Event" },
                            { key: "amount", label: "Amount (₦)" },
                            { key: "paymentStatus", label: "Status" },
                            { key: "paymentRef", label: "Reference" },
                            { key: "createdAt", label: "Date" },
                        ].map(({ key, label }) => (
                            <th
                                key={key}
                                onClick={() => handleSort(key as keyof Purchase)}
                                className="p-3 cursor-pointer select-none hover:text-energy-orange transition"
                            >
                                {label}{" "}
                                {sortKey === key &&
                                    (sortOrder === "asc" ? "▲" : "▼")}
                            </th>
                        ))}
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginated.map((p) => (
                        <motion.tr
                            key={p.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-gray-800 hover:bg-gray-800/50"
                        >
                            <td className="p-3">{p.userName || "N/A"}</td>
                            <td className="p-3">{p.userEmail}</td>
                            <td className="p-3">{p.eventName}</td>
                            <td className="p-3">₦{p.amount.toLocaleString()}</td>
                            <td
                                className={`p-3 font-semibold ${
                                    p.paymentStatus === "PAID"
                                        ? "text-green-400"
                                        : "text-yellow-400"
                                }`}
                            >
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

            {/* 🔹 Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
