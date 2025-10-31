"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const userRole = document.cookie
            .split("; ")
            .find((row) => row.startsWith("userRole="))
            ?.split("=")[1];

        if (userRole === "admin") {
            router.push("/admin");
        } else {
            router.push("/admin/login");
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
            Redirecting to your dashboard...
        </div>
    );
}
