// noinspection ES6UnusedImports

"use client";

import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface AdminDashboardProps {
    payments: any[];
    events: any[];
}

export default function AdminDashboard({ payments, events }: AdminDashboardProps) {
    const COLORS = ["#FFA500", "#00C49F", "#FF8042", "#0088FE"];

    // 🧮 KPIs
    const totalEvents = events.length;
    const totalPayments = payments.length;
    const totalRevenue = payments
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingPayments = payments.filter((p) => p.status !== "PAID").length;

    // 📊 Revenue by Event
    const revenueByEvent = Object.values(
        payments.reduce((acc: any, p: any) => {
            if (p.status === "PAID") {
                const event = p.eventName || "Unknown Event";
                if (!acc[event]) acc[event] = { name: event, revenue: 0 };
                acc[event].revenue += p.amount || 0;
            }
            return acc;
        }, {})
    );

    // 📈 Payments Over Time
    const paymentsOverTime = payments
        .filter((p) => p.status === "PAID" && p.createdAt?.seconds)
        .map((p) => ({
            date: new Date(p.createdAt.seconds * 1000).toLocaleDateString(),
            amount: p.amount || 0,
        }));

    return (
        <div className="w-full space-y-10">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-energy-orange">Admin Analytics Dashboard</h2>
                <p className="text-gray-400 mt-1">Track revenue, events, and sales performance</p>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border-l-4 border-emerald-500">
                    <h3 className="text-gray-400 mb-2">Total Events</h3>
                    <p className="text-3xl font-bold text-white">{totalEvents}</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border-l-4 border-blue-500">
                    <h3 className="text-gray-400 mb-2">Total Payments</h3>
                    <p className="text-3xl font-bold text-white">{totalPayments}</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border-l-4 border-purple-500">
                    <h3 className="text-gray-400 mb-2">Pending Payments</h3>
                    <p className="text-3xl font-bold text-white">{pendingPayments}</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border-l-4 border-orange-500">
                    <h3 className="text-gray-400 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-energy-orange">
                        ₦{totalRevenue.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                {/* Line Chart - Revenue Over Time */}
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-energy-orange">
                        Revenue Over Time
                    </h3>
                    {paymentsOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={paymentsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="date" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1f2937", borderRadius: "0.5rem" }}
                                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#FFA500"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center mt-10">
                            No revenue data available yet.
                        </p>
                    )}
                </div>

                {/* Pie Chart - Revenue by Event */}
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-energy-orange">
                        Revenue by Event
                    </h3>
                    {revenueByEvent.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    dataKey="revenue"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {revenueByEvent.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1f2937", borderRadius: "0.5rem" }}
                                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center mt-10">
                            No event revenue data yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Recent Payments Table */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mt-10">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Recent Payments</h3>
                {payments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No payment records found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                <th className="py-2 px-3">User</th>
                                <th className="py-2 px-3">Event</th>
                                <th className="py-2 px-3">Amount</th>
                                <th className="py-2 px-3">Status</th>
                                <th className="py-2 px-3">Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.slice(0, 6).map((p, i) => (
                                <tr key={i} className="border-b border-gray-700 text-sm">
                                    <td className="py-2 px-3">{p.userEmail || "N/A"}</td>
                                    <td className="py-2 px-3">{p.eventName || "—"}</td>
                                    <td className="py-2 px-3 text-emerald-400">
                                        ₦{parseFloat(p.amount || 0).toLocaleString()}
                                    </td>
                                    <td
                                        className={`py-2 px-3 font-semibold ${
                                            p.status === "PAID" ? "text-emerald-400" : "text-yellow-400"
                                        }`}
                                    >
                                        {p.status || "Pending"}
                                    </td>
                                    <td className="py-2 px-3 text-gray-400">
                                        {p.createdAt?.toDate
                                            ? p.createdAt.toDate().toLocaleDateString()
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
