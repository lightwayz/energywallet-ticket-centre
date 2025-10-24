"use client";

import Header from "@/components/Header";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push("/login");
        } else if (!user.emailVerified) {
            router.push("/verify-email");
        } else if (role === "admin") {
            router.push("/dashboard/admin");
        } else {
            router.push("/dashboard/user");
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-energy-black text-white">
                <p>Checking authentication...</p>
            </div>
        );
    }

    // Prevent flashing of wrong content before redirect
    if (!user || !user.emailVerified) return null;

    return (
        <div className="min-h-screen bg-energy-black text-white">
            {/* Persistent Header */}
            <Header />

            {/* Page content */}
            <div className="container mx-auto px-4 pt-6">{children}</div>
        </div>
    );
}
