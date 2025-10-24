import jsPDF from "jspdf";
import QRCode from "qrcode";

interface TicketPDFProps {
    eventName: string;
    ticketCode: string;
    emailOrPhone: string;
}

export const generateTicketPDF = async ({
                                            eventName,
                                            ticketCode,
                                            emailOrPhone,
                                        }: TicketPDFProps) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 165, 0); // Orange
    doc.setFont("helvetica", "bold");
    doc.text("EnergyWallet Ticket", 105, 20, { align: "center" });

    // Event Name
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`Event: ${eventName}`, 105, 40, { align: "center" });

    // Ticket Code
    doc.setFontSize(16);
    doc.setTextColor(255, 165, 0);
    doc.text(`Ticket Code: ${ticketCode}`, 105, 50, { align: "center" });

    // Email/Phone
    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.text(`Sent to: ${emailOrPhone}`, 105, 60, { align: "center" });

    // Generate QR code
    const qrData = `Ticket: ${ticketCode}\nEvent: ${eventName}\nEmail/Phone: ${emailOrPhone}`;
    const qrUrl = await QRCode.toDataURL(qrData);

    doc.addImage(qrUrl, "PNG", 80, 70, 50, 50);

    return doc;
};
