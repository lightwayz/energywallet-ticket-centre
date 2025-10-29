// app/layout.tsx
// noinspection TypeScriptExplicitMemberType

import "./globals.css";
import {AuthProvider} from "@/lib/authContext";
import ClientWrapper from "@/app/ClientWrapper";
import {Toaster} from "react-hot-toast";
import React from "react";


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <Toaster
            position="top-center"
            toastOptions={{
                style: { background: "#222", color: "#fff" },
                duration: 4000,
            }}
        />
        <AuthProvider>
            <ClientWrapper>{children}</ClientWrapper>
        </AuthProvider>
        </body>
        </html>
    );
}
