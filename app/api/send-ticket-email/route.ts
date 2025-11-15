import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import admin from "firebase-admin";

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// ✉️ PrivateMail SMTP config
const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com", // or smtp.privateemail.com
    port: 465,
    secure: true,
    auth: {
        user: process.env.PRIVATE_EMAIL, // info@energywalletng.com
        pass: process.env.PRIVATE_EMAIL_PASSWORD,
    },
});

export async function POST(req: Request) {
    try {
        const { email, name, eventName, reference, pdfBase64 } = await req.json();

        if (!email || !pdfBase64 || !eventName) {
            return NextResponse.json(
                { success: false, message: "Missing required parameters" },
                { status: 400 }
            );
        }

        // 🔍 Fetch event details from the Firestore
        let bannerUrl: string | null = null;
        let eventData: any = {};
        const snap = await admin
            .firestore()
            .collection("events")
            .where("title", "==", eventName)
            .limit(1)
            .get();

        if (!snap.empty) {
            const doc = snap.docs[0];
            bannerUrl = doc.data().bannerUrl || null;
            eventData = doc.data();
        }

        // 🔗 Event link
        const link = `https://energywallet-ticket-centre.vercel.app/events/${encodeURIComponent(
            eventName.replace(/\s+/g, "-").toLowerCase()
        )}`;

        // 🧾 Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(reference, {
            color: { dark: "#000000", light: "#ffffff" },
            width: 180,
            margin: 1,
        });

        // 💳 Premium ticket design
        const htmlBody = `
      <div style="font-family:'Poppins',Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f4f6f9;padding:30px;color:#333;">
        <div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.1);">

          ${
            bannerUrl
                ? `<img src="${bannerUrl}" alt="Event Banner" style="width:100%;height:auto;max-height:260px;object-fit:cover;" />`
                : `<div style="background:linear-gradient(90deg,#ff9f1c,#ffbf69);height:180px;display:flex;align-items:center;justify-content:center;">
                   <h2 style="color:#000;font-size:22px;">🎟 EnergyWallet Event</h2>
                 </div>`
        }

          <div style="padding:30px;">
            <h2 style="color:#ff9f1c;text-align:center;margin:0 0 16px;font-size:24px;">🎫 Your E-Ticket for ${eventName}</h2>
            <p style="font-size:15px;text-align:center;color:#444;margin-bottom:25px;">
              Hi <strong>${name}</strong>, your purchase has been confirmed successfully.<br/>
              Please find your event details below.
            </p>

            <!-- Ticket-style card -->
            <div style="background:#111;color:#fff;border-radius:16px;padding:25px;margin-bottom:25px;position:relative;box-shadow:0 0 20px rgba(255,159,28,0.3);overflow:hidden;">
              <div style="position:absolute;top:-50px;left:-50px;width:120px;height:120px;border-radius:50%;background:rgba(255,159,28,0.1);"></div>
              <div style="position:absolute;bottom:-50px;right:-50px;width:120px;height:120px;border-radius:50%;background:rgba(255,159,28,0.1);"></div>

              <table style="width:100%;border-collapse:collapse;color:#fff;z-index:1;position:relative;">
                <tr>
                  <td style="padding:8px 0;"><strong>Event:</strong></td>
                  <td style="text-align:right;">${eventName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;"><strong>Date:</strong></td>
                  <td style="text-align:right;">${eventData?.date || "TBA"}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;"><strong>Location:</strong></td>
                  <td style="text-align:right;">${eventData?.location || "TBA"}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;"><strong>Price:</strong></td>
                  <td style="text-align:right;">₦${eventData?.price || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;"><strong>Ref No:</strong></td>
                  <td style="text-align:right;">${reference}</td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px dashed #ff9f1c;margin:20px 0;" />

              <div style="text-align:center;">
                <img src="${qrCodeDataUrl}" alt="QR Code" style="width:150px;height:150px;border-radius:12px;border:2px solid #ff9f1c;box-shadow:0 0 15px rgba(255,159,28,0.4);" />
                <p style="font-size:13px;color:#aaa;margin-top:8px;">Scan this code at the event gate</p>
              </div>
            </div>

            <div style="text-align:center;margin:25px 0;">
              <a href="${link}" 
                 style="background:#ff9f1c;color:#000;text-decoration:none;
                        padding:14px 36px;border-radius:10px;
                        display:inline-block;font-weight:600;font-size:16px;
                        box-shadow:0 3px 10px rgba(255,159,28,0.4);">
                🔗 View Event Details
              </a>
            </div>

            <p style="font-size:14px;color:#666;text-align:center;">
              Your ticket PDF is attached. Please keep it safe and present it for entry.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />
            <p style="text-align:center;font-size:13px;color:#888;">
              Powered by <strong>EnergyWallet Ticket Centre</strong> ⚡<br/>
              <a href="https://energywallet-ticket-centre.vercel.app" style="color:#ff9f1c;text-decoration:none;">energywallet.ng</a>
            </p>
          </div>
        </div>
      </div>
    `;

        await transporter.sendMail({
            from: `EnergyWallet ⚡ <${process.env.PRIVATE_EMAIL}>`,
            to: email,
            subject: `🎟 Your Ticket for ${eventName}`,
            html: htmlBody,
            attachments: [
                {
                    filename: `${eventName.replace(/\s+/g, "_")}_${reference}.pdf`,
                    content: Buffer.from(pdfBase64, "base64"),
                    contentType: "application/pdf",
                },
            ],
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("❌ Email send error:", err);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
