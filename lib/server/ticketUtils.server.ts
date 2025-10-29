import nodemailer from "nodemailer";

/**
 * ✉️ Send Ticket Email (server-only)
 */
export async function sendTicketEmailServer({
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
    // 🟢 Convert Uint8Array → Buffer
    const bufferContent = Buffer.from(pdfBuffer);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"EnergyWallet Tickets" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: `🎟 Your ${eventName} Ticket Confirmation`,
        html: `
      <h2>✅ Payment Confirmed</h2>
      <p>Hi ${name},</p>
      <p>Thank you for purchasing your ticket for <b>${eventName}</b>.</p>
      <p>Your Ticket Reference: <b>${reference}</b></p>
      <p>The QR-based ticket is attached below.</p>
      <br/>
      <p style="font-size:0.9em;color:gray">Powered by EnergyWallet</p>
    `,
        attachments: [
            {
                filename: `${eventName.replace(/\s/g, "_")}_${reference}.pdf`,
                // 🟢 Use Buffer here
                content: bufferContent,
                contentType: "application/pdf",
            },
        ],
    });

    console.log(`📧 Ticket email sent to ${to}`);
}

export default sendTicketEmailServer;
