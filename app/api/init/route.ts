import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";


export const dynamic = "force-dynamic"; // ensures webhook isn't statically optimized

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const event = await req.json();
        console.log("🔔 Monnify Webhook Event:", event);

        // ✅ Validate secret key (recommended)
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.MONNIFY_SECRET_KEY}`) {
            console.warn("❌ Unauthorized Monnify webhook call");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // ✅ Extract transaction details
        const paymentStatus = event?.eventData?.paymentStatus;
        const paymentReference = event?.eventData?.paymentReference;
        const amountPaid = event?.eventData?.amountPaid;

        if (!paymentReference || !paymentStatus) {
            return NextResponse.json({ message: "Invalid webhook payload" }, { status: 400 });
        }

        // ✅ Extract eventId from payment reference (e.g., TICKET-<eventId>-<timestamp>)
        const eventId = paymentReference.split("-")[1];

        // ✅ Mark ticket as paid
        if (paymentStatus === "PAID") {
            const ticketRef = doc(db, "tickets", paymentReference);
            await updateDoc(ticketRef, {
                status: "paid",
                amountPaid,
                updatedAt: new Date().toISOString(),
            });
            console.log(`✅ Ticket ${paymentReference} marked as PAID`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Webhook error:", error.message);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Reject other HTTP methods
export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
