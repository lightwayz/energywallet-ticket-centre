"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // ✅ Prevent hydration mismatch by delaying render until client mount
    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const userSnap = await getDoc(doc(db, "users", user.uid));
                const userData = userSnap.data();
                if (!userData || userData.role !== "admin") {
                    router.push("/login");
                    return;
                }

                setIsAdmin(true);
            } catch (err) {
                console.error(err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (!hasMounted) return null; // ✅ prevents SSR mismatch

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return <p className="text-center mt-20 text-gray-400">Access denied.</p>;
    }

    if (loading || !hasMounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
                <div className="animate-pulse text-lg">Loading admin dashboard...</div>
            </div>
        );
    }


    return <>{children}</>;
}
