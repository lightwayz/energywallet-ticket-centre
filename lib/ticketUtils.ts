import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

/**
 * 🧾 Generate QR Code as Data URL (client-safe)
 */
export async function generateQRCode(data: string): Promise<string> {
    return await QRCode.toDataURL(data, { width: 160, margin: 1 });
}

/**
 * 🎟 Generate Ticket PDF (client-safe)
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

    // Generate QR code
    const qrDataUrl = await generateQRCode(reference);
    const qrImage = await pdf.embedPng(qrDataUrl);

    // Banner
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

    // Ticket details
    page.drawText(`Name: ${name}`, { x: 40, y: 170, size: 12, font: normalFont, color: gray });
    page.drawText(`Event: ${eventName}`, { x: 40, y: 145, size: 12, font: normalFont, color: gray });
    page.drawText(`Reference: ${reference}`, { x: 40, y: 120, size: 12, font: normalFont, color: gray });
    page.drawText(`Status: ✅ Confirmed`, { x: 40, y: 95, size: 12, font: normalFont, color: gray });
    page.drawText(`Powered by EnergyWallet`, { x: 40, y: 50, size: 10, font: normalFont, color: rgb(0.4, 0.4, 0.4) });

    // QR Code on ticket
    page.drawImage(qrImage, {
        x: 280,
        y: 90,
        width: 100,
        height: 100,
    });

    return await pdf.save();
}

/**
 * 🔁 Client-side resend confirmation trigger
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
