"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back!");
            router.push("/dashboard/admin");
        } catch (err) {
            console.error(err);
            toast.error("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-energy-black flex items-center justify-center p-6 text-white">
            <form
                onSubmit={handleLogin}
                className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-6 text-energy-orange text-center">
                    Admin Login
                </h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-6 rounded bg-gray-700 text-white"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                        loading
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-energy-orange text-black hover:bg-orange-400"
                    }`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
