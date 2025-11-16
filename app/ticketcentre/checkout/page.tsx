"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import CheckoutContent from "./checkoutContent";

// Fix dynamic import error
const ThreeScene = dynamic(() => import("@/components/ThreeScene"), { ssr: false });

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center text-gray-700">
                Loading checkout...
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
