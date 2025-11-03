// noinspection JSIgnoredPromiseFromCall

"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function VerifyPage() {
    const params = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const verifyPayment = async () => {
            const ref = params.get("paymentReference");
            if (!ref) return;

            try {
                const purchasesRef = collection(db, "purchases");
                const q = query(purchasesRef, where("paymentRef", "==", ref));
                const snap = await getDocs(q);

                if (!snap.empty) {
                    const docSnap = snap.docs[0];
                    await updateDoc(docSnap.ref, {
                        paymentStatus: "PAID",
                        verifiedAt: Timestamp.now(),
                    });
                    setStatus("success");
                    toast.success("Payment verified successfully!");
                } else {
                    setStatus("not-found");
                }
            } catch (err) {
                console.error(err);
                setStatus("error");
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [params]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-400">
                Verifying your payment...
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-white">
            {status === "success" ? (
                <>
                    <h1 className="text-3xl font-bold text-emerald-400 mb-4">Payment Verified ✅</h1>
                    <p className="text-gray-300">Your ticket has been confirmed successfully.</p>
                    <button
                        onClick={() => router.push("/events")}
                        className="mt-6 px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-500"
                    >
                        Back to Events
                    </button>
                </>
            ) : status === "not-found" ? (
                <p className="text-red-500">Payment not found. Please contact support.</p>
            ) : (
                <p className="text-red-500">Payment verification failed. Please try again.</p>
            )}
        </div>
    );
}
