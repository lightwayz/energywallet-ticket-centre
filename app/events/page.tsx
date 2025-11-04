// noinspection JSIgnoredPromiseFromCall

"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PurchaseTicket from "@/components/PurchaseTicket";
import { getEvents } from "@/lib/api/events";

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

    useEffect(() => {
        async function fetchEvents() {
            try {
                const rawData = await getEvents();

                const parsed = rawData.map((e: any) => ({
                    ...e,
                    price: Number(String(e.price).replace(/[^0-9.]/g, "")) || 0, // ✅ sanitize here
                }));

                setEvents(parsed);
            } catch (err) {
                console.error("Failed to load events", err);
            }
        }

        fetchEvents();
    }, []);

    const handleSelectEvent = (event: Event) => {
        setSelectedEvent(event);
        setShowPurchase(true);

        setTimeout(() => {
            document.getElementById("purchase-ticket")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="min-h-screen bg-energy-black text-white flex flex-col items-center justify-center px-4 py-10"
        >
            <h1 className="text-3xl font-bold text-energy-orange mb-10 text-center">
                Energy Events Portal ⚡
            </h1>

            <div className="grid gap-4 w-full max-w-3xl mb-10">
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.03 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-lg cursor-pointer hover:bg-gray-700 transition"
                        onClick={() => handleSelectEvent(event)}
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

            {showPurchase && selectedEvent && (
                <motion.div
                    id="purchase-ticket"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <PurchaseTicket
                        eventName={selectedEvent.title}
                        eventId={selectedEvent.id}
                        price={selectedEvent.price}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
