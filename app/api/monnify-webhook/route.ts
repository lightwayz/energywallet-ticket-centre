import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { generateTicketPDF } from "@/lib/ticketUtils";
import { sendTicketEmailServer } from "@/lib/server/ticketUtils.server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function verifyMonnifySignature(body: any, signature: string): boolean {
    const computedHash = crypto
        .createHmac("sha512", process.env.MONNIFY_SECRET_KEY!)
        .update(JSON.stringify(body))
        .digest("hex");
    return computedHash === signature;
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const signature = req.headers.get("monnify-signature");

        if (!signature || !verifyMonnifySignature(payload, signature)) {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
        }

        const {
            transactionReference,
            paymentReference,
            paidOn,
            paymentStatus,
            amountPaid,
            customerEmail,
            customerName,
            metaData,
            productName,
        } = payload.eventData || payload;

        if (!transactionReference || !paymentStatus) {
            return NextResponse.json({ success: false, message: "Invalid webhook payload" }, { status: 400 });
        }

        await adminDb.collection("payments").doc(transactionReference).set(
            {
                reference: paymentReference,
                amount: amountPaid,
                status: paymentStatus,
                buyerEmail: customerEmail,
                buyerName: customerName,
                eventId: metaData?.eventId || null,
                eventName: metaData?.eventName || productName || "Energy Summit 2025",
                createdAt: paidOn ? new Date(paidOn) : new Date(),
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );

        if (paymentStatus === "PAID") {
            const pdfBuffer = await generateTicketPDF({
                name: customerName || "Guest User",
                eventName: productName || "Energy Summit 2025",
                reference: paymentReference,
            });

            await sendTicketEmailServer({
                to: customerEmail,
                name: customerName || "Guest User",
                eventName: productName || "Energy Summit 2025",
                reference: paymentReference,
                pdfBuffer,
            });
        }

        return NextResponse.json({ success: true, message: "Webhook processed" });
    } catch (error: any) {
        console.error("❌ Webhook Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
