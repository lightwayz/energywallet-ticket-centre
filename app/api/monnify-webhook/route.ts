import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, monnify-signature",
        },
    });
}

/**
 * Verify Monnify signature
 */
function verifyMonnifySignature(body: string, signature: string, secretKey: string): boolean {
    const computedHash = crypto.createHmac("sha512", secretKey).update(body).digest("hex");
    return computedHash === signature;
}

/**
 * Handle POST requests from Monnify
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.text(); // must use raw text for HMAC validation
        const signature = req.headers.get("monnify-signature") || "";
        const monnifySecretKey = process.env.MONNIFY_SECRET_KEY;

        if (!monnifySecretKey) {
            console.error("❌ Missing MONNIFY_SECRET_KEY environment variable");
            return NextResponse.json({ success: false, error: "Server misconfiguration" }, { status: 500 });
        }

        // Verify signature
        const isValidSignature = verifyMonnifySignature(body, signature, monnifySecretKey);
        if (!isValidSignature) {
            console.warn("⚠️ Invalid Monnify signature");
            return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
        }

        const data = JSON.parse(body);
        console.log("✅ Webhook received:", data);

        if (data.eventType === "SUCCESSFUL_TRANSACTION") {
            const event = data.eventData;
            const transactionRef = event.paymentReference || `txn_${Date.now()}`;

            await adminDb.collection("transactions").doc(transactionRef).set({
                reference: transactionRef,
                amount: event.amountPaid,
                customerName: event.customerName,
                customerEmail: event.customerEmail,
                description: event.paymentDescription,
                product: event.product,
                status: event.paymentStatus,
                createdAt: new Date().toISOString(),
            });

            console.log(`💾 Transaction ${transactionRef} saved to Firestore`);
        }

        return NextResponse.json({ success: true, message: "Webhook processed successfully" });
    } catch (error: any) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
