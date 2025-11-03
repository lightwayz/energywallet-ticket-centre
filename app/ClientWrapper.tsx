// app/ClientWrapper.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";

export default function ClientWrapper({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timeout = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(timeout);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) return null;

    return <>{children}</>;
}
