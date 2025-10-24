// app/admin/layout.tsx
"use client";

import AdminGuard from "@/components/AdminGuard";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminGuard>{children}</AdminGuard>;
}
