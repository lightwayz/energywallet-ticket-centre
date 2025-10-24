"use client";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
    const { user, resendVerification } = useAuth();
    const router = useRouter();
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (user?.emailVerified) {
            router.push("/dashboard");
        }
    }, [user]);

    const handleResend = async () => {
        await resendVerification();
        setSent(true);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-energy-black text-white">
            <div className="bg-energy-dark p-8 rounded-2xl text-center max-w-md">
                <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
                <p className="mb-6">
                    A verification link was sent to <span className="text-energy-orange font-semibold">{user?.email}</span>.
                    Please check your inbox and click the link to activate your account.
                </p>

                <button
                    onClick={handleResend}
                    className="bg-energy-orange text-black px-5 py-2 rounded hover:bg-orange-400 transition"
                >
                    Resend Verification Email
                </button>

                {sent && (
                    <p className="text-green-400 mt-3">Verification email sent again ✅</p>
                )}
            </div>
        </main>
    );
}
