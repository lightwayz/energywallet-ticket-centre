// noinspection JSIgnoredPromiseFromCall

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PurchaseTicket from "@/components/PurchaseTicket";
import Image from "next/image";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

export default function EventDetailsPage() {
    const params = useParams();

    // Support either /events/[eventId] or /events/[id]
    const rawId = (params as any)?.eventId ?? (params as any)?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [event, setEvent] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function loadEvent() {
            try {
                const ref = doc(db, "events", String(id));
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    setEvent({ id: snap.id, ...snap.data() });
                }
            } catch (e) {
                console.error("Failed to load event:", e);
            } finally {
                setLoading(false);
            }
        }

        loadEvent();
    }, [id]);

    if (loading) {
        return (
            <p className="text-center text-white mt-20 text-xl">
                Loading event...
            </p>
        );
    }

    if (!event) {
        return (
            <p className="text-center text-red-400 mt-20 text-xl">
                Event not found
            </p>
        );
    }

    // ✅ Full shareable URL for this event
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const shareUrl = `${baseUrl}/events/${event.id}`;

    return (
        <div className="min-h-screen bg-energy-black text-white p-6 md:p-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                {/* Banner */}
                <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6">
                    <Image
                        src={event.bannerUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Details */}
                <h1 className="text-3xl font-bold text-energy-orange">
                    {event.title}
                </h1>
                <p className="text-gray-300 mt-2">{event.description}</p>

                <div className="mt-4 text-lg space-y-1">
                    <p>📍 {event.location}</p>
                    <p>🗓️ {new Date(event.date).toLocaleDateString()}</p>
                    <p className="font-bold text-xl">💰 ₦{event.price}</p>
                </div>

                {/* 🔗 Share Block + QR Code */}
                <div className="mt-8 grid gap-6 md:grid-cols-[2.2fr,1.3fr]">
                    {/* LEFT: Shareable link and social buttons (EXISTING + polished) */}
                    <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl">
                        <p className="text-energy-orange font-semibold mb-2">
                            Shareable Link:
                        </p>

                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg">
                            <code className="text-gray-300 text-sm break-all">
                                {shareUrl}
                            </code>

                            <button
                                onClick={() => navigator.clipboard.writeText(shareUrl)}
                                className="ml-3 px-4 py-2 rounded-lg bg-energy-orange text-energy-black font-semibold hover:bg-orange-400"
                            >
                                Copy
                            </button>
                        </div>

                        {/* SOCIAL SHARE BUTTONS */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(
                                    `Get ticket for ${event.title}: ${shareUrl}`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 text-sm font-semibold"
                            >
                                WhatsApp
                            </a>

                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                    shareUrl
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                            >
                                Facebook
                            </a>

                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                                    shareUrl
                                )}&text=${encodeURIComponent(
                                    `Get ticket for ${event.title}`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-sky-500 rounded-lg hover:bg-sky-600 text-sm font-semibold"
                            >
                                X / Twitter
                            </a>
                        </div>
                    </div>

                    {/* RIGHT: QR SHARE CARD ✅ */}
                    <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-300 mb-3 text-center">
                            Scan this QR to open this event page instantly
                        </p>

                        <div className="bg-white p-3 rounded-2xl shadow-[0_0_18px_rgba(255,165,0,0.35)]">
                            <QRCode
                                value={shareUrl}
                                size={160}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            />
                        </div>

                        <p className="mt-3 text-xs text-gray-400 text-center">
                            Perfect for posters, social media graphics, or screens at the
                            event venue.
                        </p>
                    </div>
                </div>

                {/* Purchase Button (UNCHANGED) */}
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
