import {PDFDocument, rgb, StandardFonts} from "pdf-lib";

export async function generateTicket({ name, eventName, reference }: any) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([400, 250]);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawText("🎟 Energywallet Ticket", {
        x: 80,
        y: 210,
        size: 18,
        font,
        color: rgb(0.1, 0.4, 0.9),
    });

    page.drawText(`Name: ${name}`, { x: 40, y: 160, size: 12, font });
    page.drawText(`Event: ${eventName}`, { x: 40, y: 130, size: 12, font });
    page.drawText(`Reference: ${reference}`, { x: 40, y: 100, size: 12, font });
    page.drawText(`Status: ✅ Confirmed`, { x: 40, y: 70, size: 12, font });

    return await pdf.save();
}
