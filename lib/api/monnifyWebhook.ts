import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

// 🚀 Monnify webhook handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const event = req.body;
        console.log("🔔 Monnify Webhook Event:", event);

        // ✅ Validate secret key (optional but recommended)
        const authHeader = req.headers["authorization"];
        if (authHeader !== `Bearer ${process.env.MONNIFY_SECRET_KEY}`) {
            console.warn("❌ Unauthorized Monnify webhook call");
            return res.status(401).json({ message: "Unauthorized" });
        }

        // ✅ Extract transaction details
        const paymentStatus = event?.eventData?.paymentStatus;
        const paymentReference = event?.eventData?.paymentReference;
        const amountPaid = event?.eventData?.amountPaid;

        if (!paymentReference || !paymentStatus) {
            return res.status(400).json({ message: "Invalid webhook payload" });
        }

        // ✅ Extract eventId from payment reference
        // Example: TICKET-<eventId>-<timestamp>
        const eventId = paymentReference.split("-")[1];

        if (paymentStatus === "PAID") {
            // ✅ Update Firestore
            const ticketRef = doc(db, "tickets", paymentReference);
            await updateDoc(ticketRef, {
                status: "paid",
                amountPaid,
                updatedAt: new Date().toISOString(),
            });

            console.log(`✅ Ticket ${paymentReference} marked as PAID`);
        }

        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("❌ Webhook error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
