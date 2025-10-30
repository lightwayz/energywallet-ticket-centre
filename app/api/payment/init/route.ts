import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { amount, buyerEmail, buyerName, eventId, eventName } = await req.json();

        const baseUrl = process.env.MONNIFY_BASE_URL!;
        const apiKey = process.env.MONNIFY_API_KEY!;
        const secretKey = process.env.MONNIFY_SECRET_KEY!;
        const contractCode = process.env.MONNIFY_CONTRACT_CODE!;

        const authToken = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

        // ✅ Step 1: Generate an access token
        const tokenRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${authToken}`,
                "Content-Type": "application/json",
            },
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.responseBody?.accessToken;

        if (!accessToken) {
            console.error("❌ Failed to get Monnify access token:", tokenData);
            return NextResponse.json({ message: "Failed to authorize Monnify" }, { status: 500 });
        }

        // ✅ Step 2: Initialize transaction
        const initRes = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
                customerName: buyerName,
                customerEmail: buyerEmail,
                paymentReference: `TICKET-${eventId}-${Date.now()}`,
                paymentDescription: `Ticket for ${eventName}`,
                currencyCode: "NGN",
                contractCode,
                redirectUrl: "https://energywallet-ticket-centre.vercel.app/verify",
                paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
                metadata: {
                    eventId,
                    eventName,
                },
            }),
        });

        const initData = await initRes.json();

        if (initData?.requestSuccessful && initData?.responseBody?.checkoutUrl) {
            return NextResponse.json({
                checkoutUrl: initData.responseBody.checkoutUrl,
            });
        } else {
            console.error("❌ Monnify Init Error:", initData);
            return NextResponse.json({ message: "Monnify init failed" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("❌ Payment Init Error:", error.message);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
