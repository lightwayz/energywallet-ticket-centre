"use client";

import AdminGuard from "@/components/AdminGuard";
import AdminDashboard from "@/components/AdminDashboard";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
                    className="container mx-auto px-4 py-12"
                >
                    <AdminDashboard />
                    <div className="text-center mt-12">
                        <button
                            onClick={handleLogout}
                            className="bg-energy-orange text-black px-6 py-2 rounded-lg hover:bg-orange-400 transition"
                        >
                            Logout
                        </button>
                    </div>
                </motion.main>
            </div>
        </AdminGuard>
    );
}
