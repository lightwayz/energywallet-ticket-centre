import functions from "firebase-functions";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

admin.initializeApp();

// Use environment config for security
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

// Create mail transporter using Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

// @ts-ignore
exports.sendTicketEmail = functions.https.onCall(async (data: { email: any; name: any; eventName: any; reference: any; pdfBase64: any; }, context: any) => {
    const { email, name, eventName, reference, pdfBase64 } = data;

    if (!email) {
        throw new functions.https.HttpsError("invalid-argument", "Email is required");
    }

    const mailOptions = {
        from: `EnergyWallet ⚡ <${gmailEmail}>`,
        to: email,
        subject: `🎟 Your Event Ticket – ${eventName}`,
        html: `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="color:#FF8C00;">EnergyWallet Ticket Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Thank you for purchasing a ticket for <strong>${eventName}</strong>.</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Event:</strong> ${eventName}</p>
        <p>Attached below is your ticket as a PDF.</p>
        <p>Thank you for using <b>EnergyWallet</b> ⚡</p>
      </div>
    `,
        attachments: [
            {
                filename: `${eventName}_Ticket.pdf`,
                content: pdfBase64,
                encoding: "base64",
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        await admin.firestore().collection("emailLogs").add({
            email,
            eventName,
            sentAt: admin.firestore.Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new functions.https.HttpsError("internal", "Failed to send email");
    }
});
