import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { generateTicketPDF, sendTicketEmail } from "@/lib/ticketUtils";
import crypto from "crypto";

export const dynamic = "force-dynamic"; // ensures serverless execution

/**
 * ✅ Verify Monnify signature
 */
function verifyMonnifySignature(body: any, signature: string): boolean {
    const computedHash = crypto
        .createHmac("sha512", process.env.MONNIFY_SECRET_KEY!)
        .update(JSON.stringify(body))
        .digest("hex");

    return computedHash === signature;
}

/**
 * 🔔 Handle Monnify Webhook
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log("🔔 Monnify Webhook Received:", payload);

        // ✅ Verify signature
        const signature = req.headers.get("monnify-signature");
        if (!signature || !verifyMonnifySignature(payload, signature)) {
            console.warn("❌ Invalid Monnify signature");
            return NextResponse.json(
                { success: false, message: "Invalid signature" },
                { status: 401 }
            );
        }

        // ✅ Extract transaction details
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
            return NextResponse.json(
                { success: false, message: "Invalid webhook payload" },
                { status: 400 }
            );
        }

        // ✅ Store or update in Firestore
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
                    eventName: metaData?.eventName || productName || "Energy Summit 2025",
                    createdAt: paidOn ? new Date(paidOn) : new Date(),
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );

        console.log(`✅ Payment recorded: ${transactionReference} (${paymentStatus})`);

        // ✅ Only send a ticket when payment is successful
        if (paymentStatus === "PAID") {
            // 🎟 Generate ticket PDF
            const pdfBuffer = await generateTicketPDF({
                name: customerName || "Guest User",
                eventName: productName || "Energy Summit 2025",
                reference: paymentReference,
            });

            // ✉️ Send confirmation email with ticket attached
            await sendTicketEmail({
                to: customerEmail,
                name: customerName || "Guest User",
                eventName: productName || "Energy Summit 2025",
                reference: paymentReference,
                pdfBuffer,
            });

            console.log(`📧 Ticket email sent to ${customerEmail}`);
        }

        return NextResponse.json({ success: true, message: "Webhook processed" });
    } catch (error: any) {
        console.error("❌ Webhook Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * ❌ Reject other HTTP methods
 */
export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
