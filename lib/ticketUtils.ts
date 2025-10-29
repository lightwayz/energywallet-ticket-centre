import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

/**
 * 🧾 Generate QR Code as Data URL
 */
export async function generateQRCode(data: string): Promise<string> {
    return await QRCode.toDataURL(data, { width: 160, margin: 1 });
}

/**
 * 🎟 Generate Ticket PDF (with QR)
 */
export async function generateTicketPDF({
                                            name,
                                            eventName,
                                            reference,
                                        }: {
    name: string;
    eventName: string;
    reference: string;
}): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([420, 280]);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdf.embedFont(StandardFonts.Helvetica);

    const orange = rgb(1, 0.65, 0);
    const gray = rgb(0.2, 0.2, 0.2);

    // QR Code
    const qrDataUrl = await generateQRCode(reference);
    const qrImage = await pdf.embedPng(qrDataUrl);

    page.drawRectangle({
        x: 0,
        y: 230,
        width: 420,
        height: 50,
        color: orange,
    });

    page.drawText("EVENT TICKET", {
        x: 75,
        y: 245,
        size: 14,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Name: ${name}`, { x: 40, y: 170, size: 12, font: normalFont, color: gray });
    page.drawText(`Event: ${eventName}`, { x: 40, y: 145, size: 12, font: normalFont, color: gray });
    page.drawText(`Reference: ${reference}`, { x: 40, y: 120, size: 12, font: normalFont, color: gray });
    page.drawText(`Status: ✅ Confirmed`, { x: 40, y: 95, size: 12, font: normalFont, color: gray });
    page.drawText(`Powered by EnergyWallet`, { x: 40, y: 50, size: 10, font: normalFont, color: rgb(0.4, 0.4, 0.4) });

    // Draw QR code image
    page.drawImage(qrImage, {
        x: 280,
        y: 90,
        width: 100,
        height: 100,
    });

    return await pdf.save();
}

/**
 * ✉️ Send Ticket Email with Attached PDF
 */
export async function sendTicketEmail({
                                          to,
                                          name,
                                          eventName,
                                          reference,
                                          pdfBuffer,
                                      }: {
    to: string;
    name: string;
    eventName: string;
    reference: string;
    pdfBuffer: Uint8Array;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Tickets" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: "🎟 Your EnergyWallet Ticket Confirmation",
        html: `
      <h2>✅ Payment Confirmed</h2>
      <p>Hi ${name},</p>
      <p>Thank you for purchasing your ticket for <b>${eventName}</b>.</p>
      <p>Your Ticket Reference: <b>${reference}</b></p>
      <p>The QR-based ticket is attached below. Please keep it safe.</p>
      <br/>
      <a href="https://energywallet-ticket-centre.vercel.app/ticket/${reference}" 
         style="display:inline-block;background:#FFA500;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;">
         View Ticket
      </a>
      <p style="margin-top:20px;">Powered by EnergyWallet</p>
    `,
        attachments: [
            {
                filename: `${eventName.replace(/\s/g, "_")}_${reference}.pdf`,
                content: pdfBuffer,
            },
        ],
    };


    // @ts-ignore
    transporter.sendMail(mailOptions);
    console.log(`📧 Ticket sent to ${to}`);
}

/**
 * 🔁 Resend Confirmation Email (Client-safe call)
 */
export async function resendConfirmation(reference: string, email: string) {
    try {
        const res = await fetch("/api/send-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference, email }),
        });

        const result = await res.json();
        if (result.success) {
            return { ok: true, message: "Email confirmation sent successfully!" };
        } else {
            throw new Error(result.message || "Failed to send confirmation");
        }
    } catch (err) {
        console.error("❌ Resend error:", err);
        return { ok: false, message: "Error sending confirmation email" };
    }
}
