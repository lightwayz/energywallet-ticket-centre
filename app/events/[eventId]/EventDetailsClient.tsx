"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PurchaseTicket from "@/components/PurchaseTicket";
import Image from "next/image";
import { motion } from "framer-motion";
import { QRCodeCanvas as QRCode } from "qrcode.react";

export default function EventDetailsClient({ eventId }: { eventId: string }) {
    const [event, setEvent] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!eventId || typeof eventId !== "string") {
            setError("Invalid event ID");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchEvent() {
            try {
                const ref = doc(db, "events", eventId);
                const snap = await getDoc(ref);

                if (cancelled) return;

                if (snap.exists()) {
                    setEvent({ id: snap.id, ...snap.data() });
                } else {
                    setError("Event not found");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load event");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchEvent();
        return () => { cancelled = true };
    }, [eventId]);

    if (loading) return <p className="text-center text-gray-400 mt-20">Loading event…</p>;
    if (error) return <p className="text-center text-red-400 mt-20">{error}</p>;
    if (!event) return <p className="text-center text-red-400 mt-20">Event not found</p>;

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.id}`;

    return (
        <div className="min-h-screen bg-energy-black text-white p-6 md:p-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                {/* Banner */}
                <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-xl">
                    <Image
                        src={event.bannerUrl || "/placeholder-banner.jpg"}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-energy-orange mt-6">{event.title}</h1>
                <p className="text-gray-300 mt-2">{event.description}</p>

                {/* Info */}
                <div className="mt-4 text-lg space-y-1 text-gray-200">
                    <p>📍 {event.location}</p>
                    <p>🗓️ {new Date(event.date).toLocaleDateString()}</p>
                    <p className="font-bold text-xl">💰 ₦{event.price}</p>
                </div>

                {/* SHARE SECTION */}
                <div className="mt-10 bg-gray-900/70 border border-gray-700 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-energy-orange mb-3">Share this Event</h2>

                    {/* Copy Link */}
                    <div className="flex gap-3">
                        <code className="flex-1 bg-black/40 px-3 py-2 rounded break-all">{shareUrl}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(shareUrl)}
                            className="bg-energy-orange text-black px-4 py-2 rounded hover:bg-orange-400"
                        >
                            Copy
                        </button>
                    </div>

                    <div className="mt-6 flex gap-6 items-center">
                        {/* QR */}
                        <div className="bg-white p-3 rounded-xl shadow">
                            <QRCode value={shareUrl} size={120} />
                        </div>

                        {/* Social Buttons */}
                        <div className="space-y-3">
                            <a
                                className="block bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                                target="_blank"
                                href={`https://wa.me/?text=${encodeURIComponent(
                                    `Get ticket for ${event.title}: ${shareUrl}`
                                )}`}
                            >
                                WhatsApp
                            </a>

                            <a
                                className="block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                                target="_blank"
                                href={`https://facebook.com/sharer/sharer.php?u=${shareUrl}`}
                            >
                                Facebook
                            </a>

                            <a
                                className="block bg-sky-500 px-4 py-2 rounded hover:bg-sky-600"
                                target="_blank"
                                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=Get%20ticket`}
                            >
                                Twitter / X
                            </a>
                        </div>
                    </div>
                </div>

                {/* Purchase */}
                <div className="mt-10">
                    <PurchaseTicket
                        eventId={event.id}
                        eventName={event.title}
                        price={event.price}
                    />
                </div>
            </motion.div>
        </div>
    );
}
