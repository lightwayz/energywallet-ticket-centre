"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type AdminGuardProps = {
    children: ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Prevents infinite redirect loop
                if (window.location.pathname !== "/admin/login") {
                    router.replace("/admin/login");
                }
            } else {
                setIsReady(true);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (!isReady) return null;

    return <>{children}</>;
}
