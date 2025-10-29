import { NextRequest, NextResponse } from "next/server";
import { generateTicketPDF } from "@/lib/ticketUtils";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { reference, email, name, eventName } = await req.json();

        if (!reference || !email) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // 🎟 Generate the ticket PDF
        const pdfBuffer = await generateTicketPDF({
            name: name || "Guest User",
            eventName: eventName || "Energy Summit 2025",
            reference,
        });

        // 🟢 Convert Uint8Array → Node Buffer
        const bufferContent = Buffer.from(pdfBuffer);

        // ✉️ Setup mail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // ✉️ Send confirmation email with PDF
        await transporter.sendMail({
            from: `"EnergyWallet Tickets" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: `🎟 Your Ticket Confirmation - ${eventName || "Energy Summit 2025"}`,
            html: `
        <h2>✅ Ticket Confirmation</h2>
        <p>Hi ${name || "Guest"},</p>
        <p>Thank you for purchasing your ticket for <b>${eventName || "Energy Summit 2025"}</b>.</p>
        <p>Your Ticket Reference: <b>${reference}</b></p>
        <p>The attached PDF contains your QR-based ticket.</p>
        <br/>
        <p style="font-size:0.9em;color:gray;">Powered by EnergyWallet</p>
      `,
            attachments: [
                {
                    filename: `${(eventName || "Energy Summit 2025").replace(/\s/g, "_")}_${reference}.pdf`,
                    // 🟢 FIXED: Buffer used here
                    content: bufferContent,
                    contentType: "application/pdf",
                },
            ],
        });

        console.log(`📧 Ticket email sent to ${email}`);

        return NextResponse.json({
            success: true,
            message: "Email confirmation sent successfully",
        });
    } catch (error: any) {
        console.error("❌ Email send error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
