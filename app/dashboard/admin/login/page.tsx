"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            const user = res.user;

            // ✅ You could verify an admin role from Firestore or custom claims
            if (user.email === "admin@energywallet.io") {
                document.cookie = `userRole=admin; path=/`;
                toast.success("Welcome, Admin!");
                router.push("/dashboard");
            } else {
                toast.error("Access denied: not an admin");
            }
        } catch (err: any) {
            console.error("Login failed:", err.message);
            toast.error("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-energy-dark text-white">
            <Toaster position="top-center" />
            <form
                onSubmit={handleLogin}
                className="bg-black/50 p-8 rounded-2xl border border-gray-700 w-full max-w-sm shadow-lg"
            >
                <h1 className="text-2xl font-bold text-energy-orange mb-6 text-center">
                    Admin Login
                </h1>

                <input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg text-black"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg text-black"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-energy-orange text-black font-semibold rounded-lg hover:bg-orange-400 transition"
                >
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
        </main>
    );
}
