// app/layout.tsx
// noinspection TypeScriptExplicitMemberType

import "./globals.css";
import {AuthProvider} from "@/lib/authContext";
import ClientWrapper from "@/app/ClientWrapper";
import React from "react";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <AuthProvider>
            <ClientWrapper>{children}</ClientWrapper>
        </AuthProvider>
        </body>
        </html>
    );
}
