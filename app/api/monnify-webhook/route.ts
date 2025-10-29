import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { generateTicketPDF } from "@/lib/ticketUtils";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const dynamic = "force-dynamic"; // ensures serverless execution

// ✅ Verify Monnify signature
function verifyMonnifySignature(body: any, signature: string): boolean {
    const computedHash = crypto
        .createHmac("sha512", process.env.MONNIFY_SECRET_KEY!)
        .update(JSON.stringify(body))
        .digest("hex");

    return computedHash === signature;
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log("🔔 Monnify Webhook Received:", payload);

        // ✅ Verify Monnify signature
        const signature = req.headers.get("monnify-signature");
        if (!signature || !verifyMonnifySignature(payload, signature)) {
            console.warn("❌ Invalid Monnify signature");
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
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
            return NextResponse.json({ message: "Invalid webhook payload" }, { status: 400 });
        }

        // ✅ Store or update in Firestore
        await adminDb.collection("payments").doc(transactionReference).set(
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

        // Only proceed if payment succeeded
        if (paymentStatus === "PAID") {
            // 🎟 Generate QR Ticket PDF
            const pdfBuffer = await generateTicketPDF({
                name: customerName || "Guest User",
                eventName: productName || "Energy Summit 2025",
                reference: paymentReference,
            });

            // ✉️ Setup email transport
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            // ✉️ Send confirmation email with attachment
            await transporter.sendMail({
                from: `"EnergyWallet Tickets" <${process.env.SMTP_EMAIL}>`,
                to: customerEmail,
                subject: "Your EnergyWallet Ticket Confirmation",
                html: `
          <h2>✅ Payment Confirmed</h2>
          <p>Hi ${customerName || "Guest"},</p>
          <p>Thank you for purchasing your ticket to <b>${productName || "Energy Summit 2025"}</b>.</p>
          <p>Your Reference: <b>${paymentReference}</b></p>
          <p>Attached below is your QR-based ticket. Please keep it safe.</p>
          <br/>
          <a href="https://energywallet-ticket-centre.vercel.app/ticket/${paymentReference}"
             style="display:inline-block;background:#FFA500;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;">
             Download Ticket
          </a>
        `,
                attachments: [
                    {
                        filename: `${(productName || "Energy Summit 2025").replace(/\s/g, "_")}_${paymentReference}.pdf`,
                        content: pdfBuffer,
                    },
                ],
            });

            console.log(`📧 Ticket email sent to ${customerEmail}`);
        }

        console.log(`✅ Payment recorded: ${transactionReference} (${paymentStatus})`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Webhook Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
