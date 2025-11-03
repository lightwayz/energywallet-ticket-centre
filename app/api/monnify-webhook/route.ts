import { NextRequest, NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { buyerEmail, buyerName, eventId, eventName } = await req.json();
        console.log("🟢 [Init] Payment request received for:", { buyerEmail, eventId, eventName });

        // ✅ 1. Fetch actual event price from Firestore
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (!eventDoc.exists()) {
            console.error("❌ Event not found:", eventId);
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        const eventData = eventDoc.data();
        let amount = Number(eventData?.price || 0);

        if (isNaN(amount) || amount <= 0) {
            console.error("❌ Invalid event amount:", eventData?.price);
            return NextResponse.json({ message: "Invalid event amount" }, { status: 400 });
        }

        console.log("✅ Using ticket price:", amount);

        // ✅ 2. Prepare Monnify credentials
        const baseUrl = process.env.MONNIFY_BASE_URL!;
        const apiKey = process.env.MONNIFY_API_KEY!;
        const secretKey = process.env.MONNIFY_SECRET_KEY!;
        const contractCode = process.env.MONNIFY_CONTRACT_CODE!;

        if (!baseUrl || !apiKey || !secretKey || !contractCode) {
            console.error("❌ Missing Monnify environment variables!");
            return NextResponse.json({ message: "Missing Monnify config" }, { status: 500 });
        }

        const authToken = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

        // ✅ 3. Get Monnify access token
        const tokenRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${authToken}`,
                "Content-Type": "application/json",
            },
        });
        const tokenData = await tokenRes.json();

        if (!tokenData?.responseBody?.accessToken) {
            console.error("❌ Failed to get Monnify access token:", tokenData);
            return NextResponse.json({ message: "Failed to authorize Monnify" }, { status: 500 });
        }

        const accessToken = tokenData.responseBody.accessToken;
        console.log("✅ Monnify token acquired.");

        // ✅ 4. Initialize Monnify transaction
        const paymentReference = `TICKET-${eventId}-${Date.now()}`;
        const body = {
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
        };

        console.log("📤 Sending to Monnify:", body);

        const initRes = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const initData = await initRes.json();
        console.log("📥 Monnify init response:", initData);

        // ✅ 5. If Monnify succeeded
        if (initData?.requestSuccessful && initData?.responseBody?.checkoutUrl) {
            const checkoutUrl = initData.responseBody.checkoutUrl;

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

            console.log("✅ Purchase recorded, returning checkout URL.");
            return NextResponse.json({ checkoutUrl });
        } else {
            console.error("❌ Monnify Init Error:", initData);
            return NextResponse.json({ message: "Monnify init failed", raw: initData }, { status: 500 });
        }
    } catch (error: any) {
        console.error("❌ Payment Init Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
