import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // important for serverless

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, buyerName, buyerEmail, eventId, eventName } = body;

        // 🧠 Validate inputs
        if (!amount || !buyerName || !buyerEmail || !eventId) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ Monnify API request
        const monnifyResponse = await fetch(
            `${process.env.MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
                    ).toString("base64")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    customerName: buyerName,
                    customerEmail: buyerEmail,
                    paymentReference: `TICKET-${eventId}-${Date.now()}`,
                    paymentDescription: `Payment for ${eventName}`,
                    currencyCode: "NGN",
                    contractCode: process.env.MONNIFY_CONTRACT_CODE,
                    redirectUrl: "https://energywallet-ticket-centre.vercel.app/payment-success",
                }),
            }
        );

        const data = await monnifyResponse.json();

        if (!monnifyResponse.ok || !data.responseBody?.checkoutUrl) {
            console.error("❌ Monnify Init Error:", data);
            return NextResponse.json(
                { success: false, message: "Monnify initialization failed", data },
                { status: 500 }
            );
        }

        // ✅ Return checkout link
        return NextResponse.json({
            success: true,
            checkoutUrl: data.responseBody.checkoutUrl,
            reference: data.responseBody.paymentReference,
        });
    } catch (error: any) {
        console.error("❌ Payment init error:", error.message);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
