"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminGuard from "@/components/AdminGuard";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

export default function DashboardPage() {
    const router = useRouter();
    const handleLogout = async () => {
        await signOut(auth);
        document.cookie = "userRole=; path=/; max-age=0"; // remove cookie
        toast.success("Logged out");
        router.push("/");
    };

    return (
        <ProtectedRoute>
            <AdminGuard>
                <div className="min-h-screen bg-energy-dark text-white flex flex-col items-center">
                    <Header />
                    <motion.main
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="container mx-auto px-4 py-12 text-center"
                    >
                        <h1 className="text-3xl font-bold text-energy-orange mb-4">
                            Welcome to your Dashboard ⚡
                        </h1>
                        <p className="text-gray-300">
                            You are successfully logged in and verified. Only admins can see this content.
                        </p>
                        {/* Add more dashboard content here */}
                        <button
                            onClick={handleLogout}
                            className="bg-energy-orange text-black px-4 py-2 rounded-lg hover:bg-orange-400 transition"
                        >
                            Logout
                        </button>
                    </motion.main>
                </div>
            </AdminGuard>
        </ProtectedRoute>
    );
}
