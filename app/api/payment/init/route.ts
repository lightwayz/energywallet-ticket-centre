import { NextRequest, NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { buyerEmail, buyerName, eventId, eventName } = await req.json();

        // ✅ 1. Fetch actual ticket price from Firestore
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (!eventDoc.exists()) {
            console.error("❌ Event not found:", eventId);
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        const eventData = eventDoc.data();
        const amount = Number(eventData?.price || 0);

        if (isNaN(amount) || amount <= 0) {
            console.error("❌ Invalid event amount:", amount);
            return NextResponse.json({ message: "Invalid event amount" }, { status: 400 });
        }

        // ✅ 2. Monnify credentials
        const baseUrl = process.env.MONNIFY_BASE_URL!;
        const apiKey = process.env.MONNIFY_API_KEY!;
        const secretKey = process.env.MONNIFY_SECRET_KEY!;
        const contractCode = process.env.MONNIFY_CONTRACT_CODE!;
        const authToken = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

        // ✅ 3. Generate Monnify access token
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
            console.error("❌ Failed to get Monnify access token:", tokenData);
            return NextResponse.json({ message: "Failed to authorize Monnify" }, { status: 500 });
        }

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

        // ✅ 5. Save a purchase if Monnify returns a checkout link
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

            return NextResponse.json({
                checkoutUrl: initData.responseBody.checkoutUrl,
            });
        } else {
            console.error("❌ Monnify Init Error:", initData);
            return NextResponse.json({ message: "Monnify init failed" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("❌ Payment Init Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
