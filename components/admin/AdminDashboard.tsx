"use client";
import React from "react";
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

export default function AdminDashboard({ payments, events }: any) {
    const COLORS = ["#FFA500", "#00C49F", "#FF8042", "#0088FE"];

    const totalRevenue = payments
        .filter((p: any) => p.status === "PAID")
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    interface ChartDataInput {
        name: string;
        revenue: number;
    }

    const revenueByEvent = Object.values(
        payments.reduce((acc: Record<string, ChartDataInput>, p: { status: string; eventName: string; amount: any; }) => {
            if (p.status === "PAID") {
                const event = p.eventName || "Unknown Event";
                if (!acc[event]) acc[event] = { name: event, revenue: 0 };
                acc[event].revenue += p.amount || 0;
            }
            return acc;
        }, {} as Record<string, ChartDataInput>)
    ) as ChartDataInput[];


    const paymentsOverTime = payments
        .filter((p: any) => p.status === "PAID" && p.createdAt?.seconds)
        .map((p: any) => ({
            date: new Date(p.createdAt.seconds * 1000).toLocaleDateString(),
            amount: p.amount || 0,
        }));

    return (
        <div className="w-full space-y-10">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-energy-orange">Analytics Dashboard</h2>
                <p className="text-gray-400 mt-1">Revenue, payments, and sales overview</p>
            </div>

            {/* Summary Cards */}
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

                <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-energy-orange">
                        Revenue by Event
                    </h3>
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
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
