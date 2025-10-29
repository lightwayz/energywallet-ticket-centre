import QRCode from "qrcode";
import PDFDocument from "pdfkit";

// ✅ Generate QR code data URL
export async function generateTicketQR(reference: string, eventName: string) {
    const qrData = `${eventName} | Reference: ${reference}`;
    return await QRCode.toDataURL(qrData);
}

// ✅ Generate PDF Buffer
export async function generateTicketPDF({
                                            name,
                                            eventName,
                                            reference,
                                        }: {
    name: string;
    eventName: string;
    reference: string;
}) {
    const qrCode = await generateTicketQR(reference, eventName);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});

    // Title
    doc.fontSize(22).fillColor("#FFA500").text("EnergyWallet Ticket", { align: "center" });
    doc.moveDown(1);

    doc
        .fontSize(16)
        .fillColor("#000000")
        .text(`Event: ${eventName}`, { align: "left" })
        .moveDown(0.3);
    doc.text(`Name: ${name}`);
    doc.text(`Reference: ${reference}`);
    doc.moveDown(1);

    // Insert QR Code
    doc.image(qrCode, {
        fit: [180, 180],
        align: "center",
        valign: "center",
    });

    doc.moveDown(1);
    doc
        .fontSize(12)
        .fillColor("gray")
        .text("Please present this QR code at the entrance for verification.", {
            align: "center",
        });

    doc.end();
    return await new Promise<Buffer>((resolve) => {
        const result = Buffer.concat(buffers);
        resolve(result);
    });
}
