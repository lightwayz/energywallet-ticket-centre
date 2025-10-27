"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function VerifyPage() {
    const { user, resendVerification, loading } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            // ✅ Redirect verified or social users directly
            const isSocial = user.providerData?.some(
                (p) => p.providerId && p.providerId !== "password"
            );
            if (user.emailVerified || isSocial) {
                router.push("/dashboard");
            }
        }
    }, [user, loading, router]);

    const handleResend = async () => {
        setMessage("");
        setSending(true);
        try {
            await resendVerification();
            setMessage("✅ Verification email sent! Please check your inbox.");
        } catch (err) {
            console.error("Resend verification failed:", err);
            setMessage("❌ Failed to resend verification. Please try again later.");
        } finally {
            setSending(false);
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-energy-black text-gray-400">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-energy-orange" />
            </div>
        );

    return (
        <div className="min-h-screen flex items-center justify-center bg-energy-black text-white px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md text-center border border-gray-800 shadow-xl"
            >
                <h1 className="text-3xl font-bold text-energy-orange mb-3">
                    Verify Your Email
                </h1>

                <p className="text-gray-300 mb-2">
                    We’ve sent a verification link to:
                </p>
                <p className="text-energy-orange font-semibold mb-4">{user?.email}</p>

                <p className="text-gray-400 text-sm mb-6">
                    Please click the link in your email to activate your account. Once
                    verified, you’ll be redirected automatically.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={sending}
                    onClick={handleResend}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                        sending
                            ? "bg-gray-600 cursor-not-allowed text-gray-300"
                            : "bg-energy-orange text-energy-black hover:bg-orange-400"
                    }`}
                >
                    {sending ? "Sending..." : "Resend Verification Email"}
                </motion.button>

                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 text-sm ${
                            message.includes("✅")
                                ? "text-green-400"
                                : "text-red-400"
                        }`}
                    >
                        {message}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
}
