"use client";

import Header from "@/components/Header";
import { useAuth } from "@/lib/authContext";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // Don’t run redirects on admin pages
        if (pathname.startsWith("/admin")) return;

        if (!user) {
            router.push("/register"); // or your login page
        } else if (!user.emailVerified) {
            router.push("/verify-email");
        } else if (role === "admin") {
            router.push("/admin"); // admin has its own layout now
        } else {
            router.push("/dashboard"); // stay here
        }
    }, [user, role, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-energy-black text-white">
                <p>Checking authentication...</p>
            </div>
        );
    }

    // Prevent flashing
    if (!user || !user.emailVerified) return null;

    return (
        <div className="min-h-screen bg-energy-black text-white">
            <Header />
            <div className="container mx-auto px-4 pt-6">{children}</div>
        </div>
    );
}
