"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import AdminGuard from "@/components/AdminGuard";
import Header from "@/components/Header";

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        toast.success("Logged out");
        router.push("/admin/login");
    };

    return (
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
                        Welcome to your Admin Dashboard ⚡
                    </h1>
                    <p className="text-gray-300 mb-6">
                        You are successfully logged in as an admin. Only authorized admins can access this page.
                    </p>

                    <button
                        onClick={handleLogout}
                        className="bg-energy-orange text-black px-4 py-2 rounded-lg hover:bg-orange-400 transition"
                    >
                        Logout
                    </button>
                </motion.main>
            </div>
        </AdminGuard>
    );
}
