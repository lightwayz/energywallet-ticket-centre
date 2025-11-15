import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/authContext";
import ClientWrapper from "@/app/ClientWrapper";
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
        <html lang="en">
        {/* Body inherits gradient from globals.css */}
        <body className={`${inter.className} min-h-screen`}>
        <AuthProvider>
            {children}

            {/* Mounted only on a client */}
            <ClientWrapper />

            <Toaster position="top-center" />
        </AuthProvider>
        </body>
        </html>
    );
}
