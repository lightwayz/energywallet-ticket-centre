import React from "react";
import AdminGuard from "@/components/AdminGuard";

export const metadata = {
    title: "Admin • EnergyWallet",
};

export const viewport = {
    themeColor: "#0a0a0a",
    colorScheme: "dark",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        // <AdminGuard>
        <section className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="container mx-auto px-4 py-8">{children}</div>
        </section>)
            {/*</AdminGuard>*/}
    // );
}
