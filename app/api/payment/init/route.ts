import { NextRequest, NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

type PaymentPayload = {
    buyerEmail: string;
    buyerName: string;
    eventId: string;
    eventName: string;
    amount: number;
};

export async function POST(req: NextRequest) {
    try {
        const { buyerEmail, buyerName, eventId, eventName, amount }: PaymentPayload = await req.json();

        console.log("🟢 Payment request received:", { buyerEmail, eventId, eventName, amount });

        // ✅ Skip Firestore — validate amount is okay
        if (isNaN(amount) || amount <= 0) {
            console.error("❌ Invalid amount:", amount);
            return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
        }

        // ✅ Monnify credentials
        const baseUrl = process.env.MONNIFY_BASE_URL!;
        const apiKey = process.env.MONNIFY_API_KEY!;
        const secretKey = process.env.MONNIFY_SECRET_KEY!;
        const contractCode = process.env.MONNIFY_CONTRACT_CODE!;

        if (!baseUrl || !apiKey || !secretKey || !contractCode) {
            console.error("❌ Missing Monnify env config");
            return NextResponse.json({ message: "Missing Monnify config" }, { status: 500 });
        }

        const authToken = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

        // ✅ Step 1: Get Monnify token
        const tokenRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${authToken}`,
                "Content-Type": "application/json",
            },
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData?.responseBody?.accessToken;

        if (!accessToken) {
            console.error("❌ Failed to get Monnify access token:", tokenData);
            return NextResponse.json({ message: "Failed to authorize Monnify" }, { status: 500 });
        }

        // ✅ Step 2: Initialize payment
        const paymentReference = `TICKET-${eventId}-${Date.now()}`;
        const initRes = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
                customerName: buyerName,
                customerEmail: buyerEmail,
                paymentReference,
                paymentDescription: `Ticket for ${eventName}`,
                currencyCode: "NGN",
                contractCode,
                redirectUrl: "https://energywallet-ticket-centre.vercel.app/verify",
                paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
                metadata: { eventId, eventName },
            }),
        });

        const initData = await initRes.json();

        if (initData?.requestSuccessful && initData?.responseBody?.checkoutUrl) {
            await addDoc(collection(db, "purchases"), {
                userEmail: buyerEmail,
                userName: buyerName,
                eventId,
                eventName,
                amount,
                paymentStatus: "PENDING",
                paymentRef: paymentReference,
                createdAt: serverTimestamp(),
            });

            console.log("✅ Purchase recorded. Redirecting to Monnify.");
            return NextResponse.json({ checkoutUrl: initData.responseBody.checkoutUrl });
        }

        console.error("❌ Monnify init failed:", initData);
        return NextResponse.json({ message: "Monnify init failed", raw: initData }, { status: 500 });
    } catch (err: any) {
        console.error("❌ Payment Init Error:", err);
        return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
