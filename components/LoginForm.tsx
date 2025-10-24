"use client";

import { useState } from "react";
import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // db = Firestore client instance
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const createOrUpdateUserDoc = async (uid: string, name: string | null, emailAddr: string | null) => {
        try {
            const ref = doc(db, "users", uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                await setDoc(ref, {
                    name: name || "",
                    email: emailAddr || "",
                    role: "user",
                    createdAt: serverTimestamp(),
                    lastSeen: serverTimestamp(),
                });
            } else {
                // optional: update lastSeen
                await setDoc(ref, { lastSeen: serverTimestamp() }, { merge: true });
            }
        } catch (err) {
            console.error("Failed to create/update user doc:", err);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // allow social providers even if emailVerified false; for email/pw require verification
            const isSocial = user.providerData?.some((p) => p.providerId && p.providerId !== "password");

            if (!user.emailVerified && !isSocial) {
                setError("Please verify your email before logging in.");
                setLoading(false);
                return;
            }

            // Ensure user doc exists
            await createOrUpdateUserDoc(user.uid, user.displayName || null, user.email || null);

            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            // friendly messaging — do not surface raw firebase error codes to users
            setError(err?.message || "Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        try {
            await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create or update firestore user doc
            await createOrUpdateUserDoc(user.uid, user.displayName || null, user.email || null);

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Google sign-in error:", err);
            setError("Failed to sign in with Google. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-energy-black text-white">
            <motion.form
                onSubmit={handleLogin}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-sm space-y-4 border border-gray-800"
            >
                <h1 className="text-2xl font-bold text-center text-energy-orange">Energywallet Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
                />

                {/* Remember me */}
                <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 accent-energy-orange"
                    />
                    Remember me
                </label>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full bg-energy-orange text-energy-black py-2 rounded-lg font-semibold hover:bg-orange-400 transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </motion.button>

                <div className="flex items-center gap-3">
                    <hr className="flex-1 border-gray-700" />
                    <span className="text-xs text-gray-400">or</span>
                    <hr className="flex-1 border-gray-700" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-700 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                    {/* You can put a Google SVG here */}
                    <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path fill="#EA4335" d="M24 9.5c3.13 0 5.82 1.09 7.94 2.98l5.94-5.94C34.8 3 29.73 1.5 24 1.5 14.6 1.5 6.87 6.77 3.27 14.4l6.92 5.36C11.9 13.4 17.5 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.13-2.8-.4-4.03H24v7.6h12.77c-.55 3.15-2.2 5.6-4.7 7.35l7.2 5.56C44.23 36.96 46.5 31.87 46.5 24.5z"/>
                        <path fill="#FBBC05" d="M10.2 28.86c-.6-1.8-.94-3.72-.94-5.86 0-2.14.34-4.06.94-5.86L3.27 12.38C1.15 16.8 0 21.6 0 24.99s1.15 8.19 3.27 12.61l6.93-8.74z"/>
                        <path fill="#34A853" d="M24 46.5c6.72 0 12.8-2.23 17.6-6.05l-8.4-6.48c-2.44 1.63-5.56 2.6-9.2 2.6-6.49 0-11.9-3.9-14.55-9.48L3.27 35.6C6.87 43.23 14.6 48.5 24 48.5z"/>
                    </svg>

                    <span className="text-sm">Sign in with Google</span>
                </button>

                <p className="text-center text-sm text-gray-400 mt-3">
                    Don’t have an account?{" "}
                    <a href="/register" className="text-energy-orange hover:underline">
                        Sign up
                    </a>
                </p>
            </motion.form>
        </div>
    );
}
