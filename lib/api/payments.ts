import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { eventId, buyer } = JSON.parse(req.body);

    // 1️⃣ Authenticate with Monnify API (server-side)
    const secretKey = process.env.MONNIFY_SECRET_KEY;
    const apiKey = process.env.MONNIFY_API_KEY;

    const authRes = await fetch("https://sandbox.monnify.com/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey }),
    });
    const authData = await authRes.json();
    const token = authData.responseBody.accessToken;

    // 2️⃣ Create payment session
    const paymentRes = await fetch("https://sandbox.monnify.com/api/v2/merchant/transactions/init-transaction", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            amount: 1000, // ticket price
            currencyCode: "NGN",
            customerName: buyer,
            paymentReference: `TICKET-${eventId}-${Date.now()}`,
            redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-success?event=${eventId}`,
        }),
    });
    const paymentData = await paymentRes.json();

    res.status(200).json({ paymentUrl: paymentData.responseBody.checkoutUrl });
}
