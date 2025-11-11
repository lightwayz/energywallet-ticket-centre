export const dynamic = "force-dynamic"; // disables static prerender
export const revalidate = 0; // no caching

import React, { Suspense } from "react";
import VerifyPageContent from "./VerifyPageContent";

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
