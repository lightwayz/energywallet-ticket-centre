"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPage() {
    const { user, resendVerification, loading } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!loading && user) {
            // Redirect verified or social users
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
        try {
            await resendVerification();
            setMessage("Verification email sent. Please check your inbox.");
        } catch (err) {
            console.error(err);
            setMessage("Failed to resend verification. Try again later.");
        }
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-energy-black text-white">
            <div className="bg-white/10 p-8 rounded-xl w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold mb-4 text-energy-orange">
                    Verify Your Email
                </h1>
                <p className="text-gray-300 mb-4">
                    We sent a verification link to <strong>{user?.email}</strong>.
                </p>
                <p className="text-gray-400 mb-4">
                    Please click the link in the email to activate your account.
                </p>
                <button
                    onClick={handleResend}
                    className="bg-energy-orange text-energy-black px-4 py-2 rounded-lg hover:bg-orange-400"
                >
                    Resend Verification Email
                </button>
                {message && <p className="mt-3 text-sm text-gray-200">{message}</p>}
            </div>
        </div>
    );
}
