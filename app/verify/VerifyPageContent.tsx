// noinspection JSIgnoredPromiseFromCall

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { db, functions } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { generateTicketPDF } from "@/lib/ticketUtils";
import toast from "react-hot-toast";

export default function VerifyPageContent() {
    const params = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [transaction, setTransaction] = useState<any>(null);
    const [eventLink, setEventLink] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        const ref = params.get("paymentReference");
        if (ref) verifyPayment(ref);
    }, [params]);

    const verifyPayment = async (paymentReference: string) => {
        try {
            const res = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentReference }),
            });
            const data = await res.json();

            if (data.success && data.result) {
                const tx = data.result;
                setTransaction(tx);
                setEmail(tx.customerEmail || "");
                setStatus("success");

                // fetch admin-generated event link
                const eventId = tx.product;
                if (eventId) {
                    const docRef = doc(db, "events", eventId);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) setEventLink(snap.data().eventLink || null);
                }

                await addDoc(collection(db, "payments"), {
                    reference: tx.paymentReference,
                    amount: tx.amountPaid,
                    customerEmail: tx.customerEmail,
                    status: tx.paymentStatus,
                    paidOn: Timestamp.now(),
                    eventId: tx.product,
                });
            } else setStatus("failed");
        } catch (err) {
            console.error("❌ Verification failed:", err);
            setStatus("failed");
        }
    };

    const handleSendEmail = async () => {
        if (!transaction) return;
        if (!email.trim()) return toast.error("Please enter a valid email address.");
        setSendingEmail(true);

        try {
            const reference = transaction.paymentReference;
            const name = transaction.customerName || "Guest User";
            const eventName = eventLink ?? transaction.product ?? "EnergyWallet Event";

            const pdfBytes: Uint8Array = await generateTicketPDF({ name, eventName, reference });
            const pdfBase64 = btoa(Array.from(pdfBytes).map((b) => String.fromCharCode(b)).join(""));

            // local download
            // @ts-ignore
            const blob = new Blob([pdfBytes.buffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${reference}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            // email via Cloud Function
            const sendTicketEmail = httpsCallable(functions, "sendTicketEmail");
            const res = await sendTicketEmail({ email, name, eventName, reference, pdfBase64 });

            if ((res.data as any)?.success) toast.success(`📧 Ticket sent to ${email}`);
            else toast.error("Ticket downloaded, but email failed.");
        } catch (err) {
            console.error(err);
            toast.error("Error sending/downloading ticket.");
        } finally {
            setSendingEmail(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!transaction) return;
        setDownloading(true);
        try {
            const reference = transaction.paymentReference;
            const eventName = eventLink ?? transaction.product ?? "EnergyWallet Event";
            const bytes = await generateTicketPDF({
                name: transaction.customerName || "Guest User",
                eventName,
                reference,
            });

            // @ts-ignore
            const blob = new Blob([bytes.buffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${reference}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success("🎟 Ticket downloaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate ticket PDF.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-energy-black text-white flex flex-col items-center justify-center px-6 text-center">
            {status === "loading" && (
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <Loader2 className="animate-spin text-energy-orange mb-4" size={50} />
                    <p className="text-gray-400 text-lg">Verifying your payment...</p>
                </motion.div>
            )}

            {status === "success" && transaction && (
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="bg-gray-900/80 border border-energy-orange/40 rounded-2xl p-8 shadow-lg max-w-md"
                >
                    <CheckCircle size={80} className="text-energy-orange mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-energy-orange mb-2">Payment Successful!</h1>

                    {eventLink && (
                        <a
                            href={eventLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline text-sm break-all"
                        >
                            View Event Details
                        </a>
                    )}

                    <p className="text-gray-400 mt-2 mb-1">💰 Amount: ₦{transaction.amountPaid}</p>
                    <p className="text-gray-400 mb-6">
                        Reference:{" "}
                        <span className="text-energy-orange font-mono">{transaction.paymentReference}</span>
                    </p>

                    <h3 className="font-semibold text-xl mb-3 text-energy-orange">Receipt Options</h3>
                    <p className="text-gray-400 mb-4">Enter your email to receive your ticket:</p>

                    <input
                        type="email"
                        value={email}
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-energy-orange mb-5"
                    />

                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            boxShadow: [
                                "0 0 12px rgba(255,165,0,0.6)",
                                "0 0 24px rgba(255,165,0,0.8)",
                                "0 0 12px rgba(255,165,0,0.6)",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                        onClick={handleSendEmail}
                        disabled={sendingEmail}
                        className="px-8 py-3 bg-energy-orange text-energy-black rounded-2xl font-semibold shadow-md
              hover:bg-transparent hover:text-energy-orange border border-energy-orange transition-all duration-300 disabled:opacity-60"
                    >
                        {sendingEmail ? "Sending Ticket..." : "Send Ticket via Email + Download"}
                    </motion.button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="mt-6 underline text-energy-orange hover:text-orange-400 disabled:opacity-50"
                    >
                        {downloading ? "Generating PDF..." : "Download Again"}
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/")}
                        className="mt-8 px-6 py-3 rounded-xl bg-energy-orange text-energy-black font-semibold shadow-md border border-energy-orange
              hover:bg-transparent hover:text-energy-orange transition-all duration-300"
                    >
                        ← Back to Home
                    </motion.button>
                </motion.div>
            )}

            {status === "failed" && (
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="bg-gray-900/80 border border-red-500/40 rounded-2xl p-8 shadow-lg max-w-md"
                >
                    <XCircle size={80} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Payment Failed</h1>
                    <p className="text-gray-400 mb-6">We couldn’t verify your transaction. Please try again.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-gray-300"
                    >
                        Back to Home
                    </button>
                </motion.div>
            )}
        </div>
    );
}
