// app/api/payment/verify/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { paymentReference } = await req.json();
        if (!paymentReference)
            return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });

        // Get Monnify Auth Token
        const authRes = await fetch("https://sandbox.monnify.com/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: process.env.MONNIFY_API_KEY,
                secretKey: process.env.MONNIFY_SECRET_KEY,
            }),
        });

        const { responseBody: authData } = await authRes.json();
        const token = authData.accessToken;

        // Verify Transaction
        const verifyRes = await fetch(
            `https://sandbox.monnify.com/api/v1/transactions/${paymentReference}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const { responseBody: result } = await verifyRes.json();

        if (result.paymentStatus === "PAID") {
            // ✅ Optionally save this to Firestore
            // await addDoc(collection(db, "payments"), { reference: paymentReference, ...result });
            return NextResponse.json({ success: true, result });
        } else {
            return NextResponse.json({ success: false, result });
        }
    } catch (err) {
        console.error("Verification error:", err);
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
