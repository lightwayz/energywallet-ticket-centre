// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import ClientWrapper from "@/app/ClientWrapper";
import React from "react";

export const metadata = {
    title: "Ticket Centre",
    description: "Buy and manage event tickets for events.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        {/* ✅ Wraps both AuthProvider and ClientWrapper */}
        <AuthProvider>
            <ClientWrapper>{children}</ClientWrapper>
        </AuthProvider>
        </body>
        </html>
    );
}
