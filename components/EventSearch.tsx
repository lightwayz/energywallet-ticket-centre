"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import PurchaseTicket from "@/components/PurchaseTicket";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function EventSearch() {
    const [showList, setShowList] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [events, setEvents] = useState<
        { id: string; name: string; description?: string; location?: string; price?: number }[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().title || "Untitled Event",
                description: doc.data().description || "No description provided",
                location: doc.data().location || "Unknown",
                price: Number(String(doc.data().price || "0").replace(/[^0-9.]/g, "")),
                date: doc.data().date,
            }));
            setEvents(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEventSelect = (eventName: string) => {
        setSelectedEvent(eventName);
        setShowList(false);
    };

    // 🌀 3D parallax background
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const rotateX = useTransform(y, [0, 1], [10, -10]);
    const rotateY = useTransform(x, [0, 1], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - left) / width;
        const py = (e.clientY - top) / height;
        x.set(px);
        y.set(py);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    const buttonLabel = loading ? "Loading Events..." : "View Events";

    return (
        <div
            className="relative min-h-screen text-center py-12 overflow-hidden flex flex-col items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* 🌌 Background */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: "url('/eventback.jpg')",
                    opacity: 0.25,
                    rotateX,
                    rotateY,
                    transformPerspective: 1000,
                }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
            />

            <motion.div
                className="absolute inset-0 bg-black/65 z-0"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.65 }}
                transition={{ duration: 1.2 }}
            />

            {/* Foreground */}
            <div className="relative z-10 max-w-3xl mx-auto px-4 backdrop-blur-sm">
                <motion.h1
                    className="text-3xl md:text-4xl font-bold mb-8 tracking-widest text-energy-orange drop-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    UPCOMING&nbsp;EVENTS
                </motion.h1>

                {!selectedEvent && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !loading && setShowList(true)}
                        disabled={loading}
                        className={`px-8 py-4 text-lg bg-energy-orange text-energy-black rounded-2xl font-semibold shadow-lg ${
                            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-orange-400"
                        }`}
                    >
                        {buttonLabel}
                    </motion.button>
                )}

                {/* 🎟 Full-screen modal */}
                <AnimatePresence>
                    {showList && (
                        <motion.div
                            className="fixed inset-0 bg-black/95 z-50 overflow-y-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Frosted floating header */}
                            <div className="sticky top-0 z-10 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700 px-8 py-6 flex justify-between items-center">
                                <h2 className="text-3xl font-semibold text-energy-orange">Available Events</h2>
                                <button
                                    onClick={() => setShowList(false)}
                                    className="text-gray-400 hover:text-white text-2xl transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Full-screen event grid */}
                            <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {loading ? (
                                    <p className="text-gray-400 text-center col-span-full">
                                        Loading events...
                                    </p>
                                ) : events.length === 0 ? (
                                    <p className="text-gray-400 text-center col-span-full">
                                        No events available.
                                    </p>
                                ) : (
                                    events.map((event) => (
                                        <div
                                            key={event.id}
                                            onClick={() => handleEventSelect(event.name)}
                                            className="cursor-pointer bg-white/10 hover:bg-white/20 p-6 rounded-2xl shadow-lg transition border border-gray-700 h-full flex flex-col justify-between"
                                        >
                                            <div>
                                                <h3 className="text-2xl font-semibold text-energy-orange mb-3">
                                                    {event.name}
                                                </h3>
                                                <p className="text-gray-300 mb-3 text-sm line-clamp-3">
                                                    {event.description}
                                                </p>
                                                <p className="text-gray-400 text-xs">📍 {event.location}</p>
                                            </div>
                                            <div className="mt-4 text-gray-300 text-sm">
                                                💰 <strong>₦{event.price}</strong>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🧾 Purchase Ticket */}
                <AnimatePresence>
                    {selectedEvent && (
                        <motion.div
                            key={selectedEvent}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="mt-12"
                        >
                            <h2 className="text-2xl font-semibold mb-6 text-energy-orange drop-shadow-md">
                                {selectedEvent}
                            </h2>
                            <PurchaseTicket
                                eventName={selectedEvent}
                                eventId={selectedEvent.replace(/\s/g, "-").toLowerCase()}
                                price={1000}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
