
"use client";
import { useEffect } from "react";

export default function ConfettiBurst() {
    useEffect(() => {
        import("canvas-confetti").then(({ default: confetti }) => {
            confetti({ particleCount: 120, spread: 60, origin: { y: 0.7 } });
        });
    }, []);
    return null;
}
