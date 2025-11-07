"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import PurchaseTicket from "@/components/PurchaseTicket";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const purchaseRef = useRef<HTMLDivElement | null>(null);

    // 🔥 Load events from Firestore
    useEffect(() => {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setEvents(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    price: Number(String(doc.data().price || "0").replace(/[^0-9.]/g, "")),
                }))
            );
        });
        return () => unsub();
    }, []);

    // 🔁 Auto-scroll to ticket section on selection
    useEffect(() => {
        if (selectedEvent && purchaseRef.current) {
            setTimeout(() => {
                purchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
        }
    }, [selectedEvent]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative min-h-screen bg-energy-black text-white overflow-hidden flex flex-col items-center justify-start py-10"
        >
            {/* 🖼️ Static Background */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: "url('/eventback.jpg')",
                    opacity: 0.45,
                }}
            />
            <div className="absolute inset-0 bg-black/50 z-0" /> {/* Reduced blur/dark overlay slightly */}

            {/* 🏠 Back to Home */}
            <div className="fixed top-6 left-6 z-30">
                <Link
                    href="/"
                    className="px-6 py-2 rounded-xl bg-energy-orange text-energy-black font-semibold shadow-md border border-energy-orange
            hover:bg-transparent hover:text-energy-orange transition-all duration-300 backdrop-blur-sm"
                >
                    ← Back to Home
                </Link>
            </div>

            {/* 🧡 Header */}
            <motion.h1
                className="text-3xl md:text-4xl font-bold text-energy-orange mb-10 text-center relative z-10 drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Available Events
            </motion.h1>

            {/* 🎟 Event Cards */}
            <div className="relative z-10 grid gap-10 w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6">
                {events.map((event) => {
                    const isSelected = selectedEvent?.id === event.id;
                    return (
                        <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.07, z: 40 }}
                            animate={{
                                scale: isSelected ? 1.15 : 1,
                                zIndex: isSelected ? 50 : 1,
                                opacity: isSelected ? 1 : 0.75, // more visible than before
                                filter: isSelected ? "brightness(1)" : "brightness(0.9)", // removed blur for clarity
                            }}
                            transition={{ type: "spring", stiffness: 120, damping: 15 }}
                            onClick={() => setSelectedEvent(event)}
                            className={`cursor-pointer bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl border
                ${
                                isSelected
                                    ? "border-energy-orange shadow-[0_0_25px_4px_rgba(255,165,0,0.5)]"
                                    : "border-gray-700"
                            }
                shadow-lg hover:shadow-energy-orange/40 transition-all transform-gpu`}
                        >
                            {/* 🖼 Banner */}
                            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
                                <Image
                                    src={event.bannerUrl || "/placeholder-banner.jpg"}
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>

                            <h2 className="text-xl font-semibold text-energy-orange">{event.title}</h2>
                            <p className="text-gray-300 text-sm">📍 {event.location}</p>
                            <p className="text-gray-300 text-sm">🗓️ {new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-gray-300 text-sm">💰 ₦{event.price}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* 💳 Purchase Ticket Section */}
            {selectedEvent && (
                <motion.div
                    ref={purchaseRef}
                    id="purchase-ticket"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-20 mt-16 text-center"
                >
                    {/* 🔥 Unified Purchase Ticket Button */}
                    <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            boxShadow: [
                                "0 0 12px rgba(255,165,0,0.6)",
                                "0 0 24px rgba(255,165,0,0.8)",
                                "0 0 12px rgba(255,165,0,0.6)",
                            ],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "mirror",
                        }}
                        className="inline-block"
                    >
                        <PurchaseTicket
                            eventId={selectedEvent.id}
                            eventName={selectedEvent.title}
                            price={selectedEvent.price}
                        />
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
}
