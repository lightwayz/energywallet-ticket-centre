// noinspection JSIgnoredPromiseFromCall

"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

const COLORS = ["#FFA500", "#00C49F", "#FF8042", "#0088FE"];

// 🔹 Type definitions for Firestore and chart data
type PaymentDoc = {
    id: string;
    status?: string;
    amount?: number;
    eventName?: string;
    createdAt?: { seconds: number };
};

type EventDoc = {
    id: string;
    title?: string;
    price?: number;
    date?: any;
};

type ChartDataInput = {
    name: string;
    revenue: number;
};

export default function AdminDashboard() {
    const [payments, setPayments] = useState<PaymentDoc[]>([]);
    const [events, setEvents] = useState<EventDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const paySnap = await getDocs(collection(db, "payments"));
            const evtSnap = await getDocs(collection(db, "events"));

            const paymentData: PaymentDoc[] = paySnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as PaymentDoc[];

            const eventData: EventDoc[] = evtSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as EventDoc[];

            setPayments(paymentData);
            setEvents(eventData);

            // ✅ Calculate total revenue from PAID payments
            const revenue = paymentData
                .filter((p) => p.status === "PAID")
                .reduce((sum, p) => sum + (p.amount || 0), 0);

            setTotalRevenue(revenue);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading)
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Loading analytics...
            </div>
        );

    // ✅ Prepare data for charts
    const revenueByEvent: ChartDataInput[] = Object.values(
        payments.reduce((acc: Record<string, ChartDataInput>, p) => {
            if (p.status === "PAID") {
                const event = p.eventName || "Unknown Event";
                if (!acc[event]) acc[event] = { name: event, revenue: 0 };
                acc[event].revenue += p.amount || 0;
            }
            return acc;
        }, {})
    );

    const paymentsOverTime = payments
        .filter((p) => p.status === "PAID" && p.createdAt?.seconds)
        .map((p) => ({
            date: new Date(p.createdAt!.seconds * 1000).toLocaleDateString(),
            amount: p.amount || 0,
        }));

    return (
        <div className="w-full space-y-10">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-energy-orange">
                    Admin Analytics Dashboard
                </h2>
                <p className="text-gray-400 mt-1">
                    Real-time overview of ticket sales and revenue.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-gray-400 mb-2">Total Events</h3>
                    <p className="text-3xl font-bold text-white">{events.length}</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-gray-400 mb-2">Total Payments</h3>
                    <p className="text-3xl font-bold text-white">{payments.length}</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-gray-400 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-energy-orange">
                        ₦{totalRevenue.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                {/* Line Chart */}
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-energy-orange">
                        Revenue Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={paymentsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#FFA500"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-energy-orange">
                        Revenue by Event
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={revenueByEvent}
                                dataKey="revenue"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {revenueByEvent.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
