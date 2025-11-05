// noinspection JSUnusedLocalSymbols,JSFunctionExpressionToArrowFunction,ES6ShorthandObjectProperty

"use client";

import {useEffect, useState} from "react";
import AiConcierge from "@/components/AiConcierge";

interface ClientWrapperProps {
    children?: undefined
}

/**
 * ClientWrapper ensures AiConcierge only mounts client-side,
 * avoiding hydration mismatch errors.
 */
export default function ClientWrapper({children}: ClientWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timeout = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(timeout);
    }, []);

    // 🧩 Prevent hydration mismatch
    if (!mounted) return null;

    return <AiConcierge/>;
}
