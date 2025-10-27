import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic"; // prevents static optimization

export async function POST(req: Request) {
    try {
        // 🔍 Parse incoming webhook payload
        const payload = await req.json();
        console.log("🔔 Monnify Webhook:", payload);

        // ✅ Optional — Validate authorization header for security
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.MONNIFY_SECRET_KEY}`) {
            console.warn("❌ Unauthorized Monnify webhook call");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // ✅ Extract key transaction details
        const {
            transactionReference,
            paymentReference,
            paidOn,
            paymentStatus,
            amountPaid,
            customerEmail,
            customerName,
            metaData,
        } = payload;

        if (!transactionReference || !paymentStatus) {
            return NextResponse.json(
                { message: "Invalid webhook payload" },
                { status: 400 }
            );
        }

        // ✅ Write to Firestore (upsert style)
        await adminDb
            .collection("payments")
            .doc(transactionReference)
            .set(
                {
                    reference: paymentReference,
                    amount: amountPaid,
                    status: paymentStatus,
                    buyerEmail: customerEmail,
                    buyerName: customerName,
                    eventId: metaData?.eventId || null,
                    eventName: metaData?.eventName || null,
                    createdAt: paidOn ? new Date(paidOn) : new Date(),
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );

        console.log(`✅ Payment recorded: ${transactionReference} (${paymentStatus})`);
        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("❌ Webhook Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
