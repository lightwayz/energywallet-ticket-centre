"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isWhitelistedAdmin } from "@/lib/adminWhitelist";
import toast from "react-hot-toast";

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
            const { user } = await signInWithEmailAndPassword(auth, email, password);

            // ✅ Whitelist validation
            if (!isWhitelistedAdmin(user.email)) {
                toast.error("Access denied. Not an admin.");
                return;
            }

            localStorage.setItem("adminEmail", user.email!);
            toast.success("Welcome, Admin!");
            router.push("/admin");
        } catch (err: any) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <form onSubmit={handleLogin} className="w-80 space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 bg-gray-800 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 bg-gray-800 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 rounded py-2 font-semibold"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
