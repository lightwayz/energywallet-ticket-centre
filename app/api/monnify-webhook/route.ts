// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const paymentStatus = body?.eventData?.paymentStatus;
        const paymentRef = body?.eventData?.paymentReference;

        console.log("🔔 Monnify webhook received:", body);

        if (paymentStatus === "PAID") {
            const purchaseQuery = doc(db, "purchases", paymentRef); // You may need to query by field if not using doc ID

            await updateDoc(purchaseQuery, {
                paymentStatus: "PAID",
                paidAt: new Date(),
            });

            return NextResponse.json({ message: "Webhook processed" });
        }

        return NextResponse.json({ message: "Ignored non-paid status" }, { status: 200 });
    } catch (err: any) {
        console.error("❌ Webhook error:", err);
        return NextResponse.json({ message: "Webhook failed" }, { status: 500 });
    }
}
