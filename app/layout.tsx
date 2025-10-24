// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { geistMono, geistSans } from "@/lib/fonts";
import ClientWrapper from "@/app/ClientWrapper";
import React from "react";

export const metadata = {
    title: "Energywallet Ticket Centre",
    description: "Buy and manage event tickets for Energywallet events.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ Wraps both AuthProvider and ClientWrapper */}
        <AuthProvider>
            <ClientWrapper>{children}</ClientWrapper>
        </AuthProvider>
        </body>
        </html>
    );
}
