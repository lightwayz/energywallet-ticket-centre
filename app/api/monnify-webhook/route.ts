import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    const payload = await req.json();
    console.log("🔔 Monnify Webhook:", payload);

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

    await adminDb.collection("payments").doc(transactionReference).set({
        reference: paymentReference,
        amount: amountPaid,
        status: paymentStatus,
        buyerEmail: customerEmail,
        buyerName: customerName,
        eventId: metaData?.eventId || null,
        eventName: metaData?.eventName || null,
        createdAt: new Date(paidOn),
    });

    return NextResponse.json({ received: true });
}
