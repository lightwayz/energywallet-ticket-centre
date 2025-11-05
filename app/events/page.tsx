// noinspection JSIgnoredPromiseFromCall

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import PurchaseTicket from "@/components/PurchaseTicket";
import { getEvents } from "@/lib/api/events";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), { ssr: false });

type Event = {
    id: string;
    title: string;
    location: string;
    date: string;
    description: string;
    price: number | string;
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showPurchase, setShowPurchase] = useState(false);
    const [showBackground, setShowBackground] = useState(false);

    // 🔥 Load events
    useEffect(() => {
        async function fetchEvents() {
            try {
                const rawData = await getEvents();
                const parsed = rawData.map((e: any) => ({
                    ...e,
                    price: Number(String(e.price).replace(/[^0-9.]/g, "")) || 0,
                }));
                setEvents(parsed);
            } catch (err) {
                console.error("Failed to load events", err);
            }
        }

        fetchEvents();
    }, []);

    // 🎬 Handle event selection
    const handleSelectEvent = (event: Event) => {
        setSelectedEvent(event);
        setShowPurchase(true);
        setShowBackground(true);

        setTimeout(() => {
            document.getElementById("purchase-ticket")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative min-h-screen bg-energy-black text-white flex flex-col items-center justify-center px-4 py-10 overflow-hidden"
        >
            {/* 🌌 Dynamic transparent event background */}
            <AnimatePresence>
                {showBackground && (
                    <motion.div
                        key="event-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.25 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 z-0 bg-cover bg-center animate-slow-pan"
                        style={{
                            backgroundImage: "url('/eventback.jpg')",
                            mixBlendMode: "overlay",
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ✨ 3D Ambient Scene */}
            <div className="relative z-10 w-full max-w-5xl mb-10">
                <ThreeScene />
            </div>

            {/* 🔠 Title */}
            <h1 className="relative z-10 text-3xl font-bold text-energy-orange mb-10 text-center drop-shadow-lg">
                Energywallet Tickets
            </h1>

            {/* 🧾 Event list */}
            <div className="relative z-10 grid gap-4 w-full max-w-3xl mb-10">
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => handleSelectEvent(event)}
                        className="bg-gray-800 p-6 rounded-xl shadow-lg cursor-pointer hover:bg-gray-700 transition"
                    >
                        <h2 className="text-xl font-semibold text-energy-orange">{event.title}</h2>
                        <p className="text-gray-400 text-sm mb-1">📍 {event.location}</p>
                        <p className="text-gray-400 text-sm mb-1">
                            🗓️ {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400 text-sm">💰 ₦{event.price}</p>
                    </motion.div>
                ))}
            </div>

            {/* 🎟️ Purchase section */}
            <AnimatePresence>
                {showPurchase && selectedEvent && (
                    <motion.div
                        id="purchase-ticket"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-md"
                    >
                        <PurchaseTicket
                            eventName={selectedEvent.title}
                            eventId={selectedEvent.id}
                            price={selectedEvent.price}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
