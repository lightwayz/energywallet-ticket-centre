// pages/api/initMonnifyPayment.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { eventId, buyer, amount } = req.body;

        // ✅ Step 1: Authenticate with Monnify
        const authRes = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: process.env.MONNIFY_API_KEY,
                secretKey: process.env.MONNIFY_SECRET_KEY,
            }),
        });

        const authData = await authRes.json();
        if (!authData?.responseBody?.accessToken) {
            throw new Error("Failed to authenticate with Monnify");
        }

        const token = authData.responseBody.accessToken;

        // ✅ Step 2: Create a payment session
        const paymentRes = await fetch(
            `${process.env.MONNIFY_BASE_URL}/api/v2/merchant/transactions/init-transaction`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    customerName: buyer,
                    paymentReference: `TICKET-${eventId}-${Date.now()}`,
                    paymentDescription: "Energywallet Ticket Purchase",
                    currencyCode: "NGN",
                    contractCode: process.env.MONNIFY_CONTRACT_CODE,
                    redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?event=${eventId}`,
                    paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
                }),
            }
        );

        const paymentData = await paymentRes.json();
        if (!paymentData?.responseBody?.checkoutUrl) {
            throw new Error(paymentData?.responseMessage || "Monnify transaction init failed");
        }

        return res.status(200).json({
            success: true,
            checkoutUrl: paymentData.responseBody.checkoutUrl,
        });
    } catch (error: any) {
        console.error("Monnify Init Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
