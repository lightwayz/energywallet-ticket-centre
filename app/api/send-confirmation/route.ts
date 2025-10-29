import { NextRequest, NextResponse } from "next/server";
import { generateTicketPDF } from "@/lib/ticketUtils";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { reference, email, eventName = "Energy Summit 2025" } = await req.json();

        const pdfBuffer = await generateTicketPDF({
            name: "Guest User",
            eventName,
            reference,
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"EnergyWallet Tickets" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Your Ticket Confirmation",
            html: `
        <h2>✅ Ticket Email Sent</h2>
        <p>Your reference: <b>${reference}</b></p>
        <p>Attached below is your ticket with QR code.</p>
      `,
            attachments: [
                {
                    filename: `${eventName.replace(/\s/g, "_")}_${reference}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 });
    }
}
