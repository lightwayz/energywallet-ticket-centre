import { NextRequest, NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

type PaymentPayload = {
    buyerEmail: string;
    buyerName: string;
    eventId: string;
    eventName: string;
};

export async function POST(req: NextRequest) {
    try {
        const { buyerEmail, buyerName, eventId, eventName }: PaymentPayload = await req.json();

        // ✅ 1. Get ticket price from Firestore
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            console.error("❌ Event not found:", eventId);
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        const eventData = eventSnap.data();
        const rawPrice = eventData?.price;
        const amount = Number(String(rawPrice).replace(/[^0-9.]/g, ""));

        if (isNaN(amount) || amount <= 0) {
            console.error("❌ Invalid event amount:", rawPrice);
            return NextResponse.json({ message: "Invalid event amount" }, { status: 400 });
        }

        console.log("✅ Using event price:", amount);

        // ✅ 2. Monnify credentials
        const baseUrl = process.env.MONNIFY_BASE_URL!;
        const apiKey = process.env.MONNIFY_API_KEY!;
        const secretKey = process.env.MONNIFY_SECRET_KEY!;
        const contractCode = process.env.MONNIFY_CONTRACT_CODE!;

        if (!baseUrl || !apiKey || !secretKey || !contractCode) {
            console.error("❌ Missing Monnify environment variables!");
            return NextResponse.json({ message: "Missing Monnify config" }, { status: 500 });
        }

        const authToken = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

        // ✅ 3. Get Monnify token
        const tokenRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${authToken}`,
                "Content-Type": "application/json",
            },
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.responseBody?.accessToken;

        if (!accessToken) {
            console.error("❌ Monnify auth failed:", tokenData);
            return NextResponse.json({ message: "Failed to authorize Monnify" }, { status: 500 });
        }

        console.log("✅ Monnify token acquired");

        // ✅ 4. Initialize Monnify transaction
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

        // ✅ 5. Save pending purchase
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

            console.log("✅ Purchase created, redirecting to Monnify checkout");
            return NextResponse.json({ checkoutUrl: initData.responseBody.checkoutUrl });
        }

        console.error("❌ Monnify init failed:", initData);
        return NextResponse.json({ message: "Monnify init failed" }, { status: 500 });
    } catch (err: any) {
        console.error("❌ Payment Init Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
