// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
//
// /**
//  * Generates a downloadable ticket PDF for Energywallet events.
//  * @param name - Buyer’s name
//  * @param eventName - Event title
//  * @param reference - Unique ticket reference code
//  */
// export async function generateTicketPDF({ name, eventName, reference }: any) {
//     // Create a new PDF
//     const pdf = await PDFDocument.create();
//     const page = pdf.addPage([420, 260]);
//     const font = await pdf.embedFont(StandardFonts.HelveticaBold);
//     const normalFont = await pdf.embedFont(StandardFonts.Helvetica);
//
//     // Brand colors
//     const orange = rgb(1, 0.65, 0);
//     const gray = rgb(0.2, 0.2, 0.2);
//
//     // Header background bar
//     page.drawRectangle({
//         x: 0,
//         y: 210,
//         width: 420,
//         height: 50,
//         color: orange,
//     });
//
//     // Ticket Title
//     page.drawText("EVENT TICKET", {
//         x: 90,
//         y: 225,
//         size: 16,
//         font,
//         color: rgb(0, 0, 0),
//     });
//
//     // Buyer & Event Info
//     page.drawText(`Name: ${name}`, { x: 40, y: 160, size: 12, font: normalFont, color: gray });
//     page.drawText(`Event: ${eventName}`, { x: 40, y: 135, size: 12, font: normalFont, color: gray });
//     page.drawText(`Reference: ${reference}`, { x: 40, y: 110, size: 12, font: normalFont, color: gray });
//     page.drawText(`Status: ✅ Confirmed`, { x: 40, y: 85, size: 12, font: normalFont, color: gray });
//     page.drawText(`Powered by Energywallet`, { x: 40, y: 40, size: 10, font: normalFont, color: rgb(0.4, 0.4, 0.4) });
//
//     return await pdf.save();
// }
