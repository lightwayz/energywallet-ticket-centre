// app/ClientWrapper.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";

export default function ClientWrapper({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) return null;

    return <>{children}</>;
}
