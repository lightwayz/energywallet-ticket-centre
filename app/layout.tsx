import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/authContext";
import React from "react";
import ClientWrapper from "@/app/ClientWrapper"; // ✅ use this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "EnergyWallet Ticket Centre",
    description: "Smart ticketing and event management system",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="bg-energy-black text-white">
        <body className={`${inter.className} min-h-screen`}>
        <AuthProvider>
            {children}
            <ClientWrapper children={undefined} /> {/* ✅ mounted only in browser */}
            <Toaster position="top-center" />
        </AuthProvider>
        </body>
        </html>
    );
}
