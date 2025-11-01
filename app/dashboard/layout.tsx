// noinspection JSUnusedLocalSymbols

"use client";

import Header from "@/components/Header";
import { useAuth } from "@/lib/authContext";
import React from "react";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-energy-black text-white">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-energy-black text-white">
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    );
}
