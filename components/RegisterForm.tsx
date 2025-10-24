"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1️⃣ Create a user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2️⃣ Update display name
            await updateProfile(user, { displayName: name });

            // 3️⃣ Send verification email
            await sendEmailVerification(user);
            alert("✅ Verification email sent! Please check your inbox.");

            // 4️⃣ Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                role: "user",
                createdAt: new Date().toISOString(),
            });

            // 5️⃣ Redirect to the login page after registration
            router.push("/login");
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-energy-black text-white">
            <motion.form
                onSubmit={handleRegister}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4 border border-gray-800"
            >
                <h1 className="text-2xl font-bold text-center text-energy-orange">
                    Create Account
                </h1>

                <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                    className="w-full bg-energy-orange text-energy-black py-2 rounded-lg font-semibold hover:bg-orange-400 transition"
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </motion.button>

                <p className="text-center text-sm text-gray-400 mt-3">
                    Already have an account?{" "}
                    <a href="/login" className="text-energy-orange hover:underline">
                        Login
                    </a>
                </p>
            </motion.form>
        </div>
    );
}
