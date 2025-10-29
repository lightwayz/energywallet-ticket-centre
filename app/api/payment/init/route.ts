import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { amount, buyerEmail, buyerName, eventId, eventName } = await req.json();

        const auth = Buffer.from(
            `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
        ).toString("base64");

        const body = {
            amount,
            customerEmail: buyerEmail,
            customerName: buyerName,
            paymentReference: `TICKET-${eventId}-${Date.now()}`,
            paymentDescription: `Ticket for ${eventName}`,
            currencyCode: "NGN",
            contractCode: process.env.MONNIFY_CONTRACT_CODE,
            redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify`,
        };

        const response = await fetch(
            "https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        if (!data.requestSuccessful) {
            throw new Error(data.responseMessage || "Payment initialization failed");
        }

        return NextResponse.json({ checkoutUrl: data.responseBody.checkoutUrl });
    } catch (error: any) {
        console.error("❌ Payment init error:", error.message);
        return NextResponse.json(
            { message: "Payment initialization failed" },
            { status: 500 }
        );
    }
}
