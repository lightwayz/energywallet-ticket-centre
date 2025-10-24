"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                // 🚫 Not logged in → redirect to log in
                router.replace("/login");
            } else if (!currentUser.emailVerified) {
                // ⚠ Logged in but email not verified
                alert("Please verify your email before accessing the dashboard.");
                router.replace("/login");
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-energy-black text-white">
                <p>Checking authentication...</p>
            </div>
        );
    }

    if (!user) return null;

    // ✅ Authenticated and verified user
    return <>{children}</>;
}
