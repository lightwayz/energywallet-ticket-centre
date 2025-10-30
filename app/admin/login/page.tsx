"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminGuard from "@/components/AdminGuard";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithEmailAndPassword(auth, email, password);

            const allowedAdmins = ["admin@energywallet.io", "lightways@energywallet.io"];
            if (!allowedAdmins.includes(result.user.email || "")) {
                toast.error("Access denied: Not an admin");
                return;
            }

            toast.success("Welcome back, Admin!");
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            toast.error("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-energy-black flex flex-col items-center justify-center text-white p-6">
                <h1 className="text-2xl font-bold text-energy-orange mb-6">Admin Login</h1>
                <form
                    onSubmit={handleLogin}
                    className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm"
                >
                    <label className="block mb-2 text-sm text-gray-400">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mb-4 rounded-md text-black"
                    />

                    <label className="block mb-2 text-sm text-gray-400">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 mb-6 rounded-md text-black"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded-lg font-semibold transition ${
                            loading ? "bg-gray-600" : "bg-energy-orange text-black hover:bg-orange-400"
                        }`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </AdminGuard>
    );
}
