"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminGuard from "@/components/AdminGuard";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import React from "react";

export default function DashboardPage() {
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
                    </motion.main>
                </div>
            </AdminGuard>
        </ProtectedRoute>
    );
}
