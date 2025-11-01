// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/authContext";
import React from "react";

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
            <Toaster position="top-center" />
        </AuthProvider>
        </body>
        </html>
    );
}
