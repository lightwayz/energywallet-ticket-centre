"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isWhitelistedAdmin } from "@/lib/adminWhitelist";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const storedEmail = localStorage.getItem("adminEmail");
            const activeEmail = user?.email || storedEmail;

            if (activeEmail && isWhitelistedAdmin(activeEmail)) {
                localStorage.setItem("adminEmail", activeEmail);
                setAuthorized(true);
            } else {
                localStorage.removeItem("adminEmail");
                setAuthorized(false);
                router.replace("/admin/login");
            }

            setChecking(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (checking) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-400">
                Checking admin session...
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-400">
                Redirecting to login...
            </div>
        );
    }

    return <>{children}</>;
}
