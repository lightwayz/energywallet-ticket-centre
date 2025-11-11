"use client";
import React, { Suspense } from "react";
import VerifyPageContent from "./VerifyPageContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function VerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-energy-black text-white text-lg">
                    Loading payment verification...
                </div>
            }
        >
            <VerifyPageContent />
        </Suspense>
    );
}
