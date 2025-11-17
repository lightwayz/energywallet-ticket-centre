// noinspection JSIgnoredPromiseFromCall

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import PurchaseTicket from "@/components/PurchaseTicket";
import HoloShareButton from "@/components/HoloShareButton";


export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);
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

    // ⌨️ ESC to close modal
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowModal(false);
        if (showModal) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showModal]);

    // Smooth scroll when confirming the purchase area (kept for consistency)
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
            {/* 🖼️ Static background */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('/eventback.jpg')", opacity: 0.45 }}
            />
            <div className="absolute inset-0 bg-black/50 z-0" />

            {/* 🏠 Back to Home */}
            <div className="fixed top-6 left-6 z-30">
                <Link
                    href="/"
                    className="px-6 py-2 rounded-xl bg-energy-orange text-energy-black font-semibold shadow-md border border-energy-orange hover:bg-transparent hover:text-energy-orange transition-all duration-300 backdrop-blur-sm"
                >
                    ← Back to Home
                </Link>
            </div>

            {/* Header */}
            <motion.h1
                className="text-3xl md:text-4xl font-bold text-energy-orange mb-10 text-center relative z-10 drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Available Events
            </motion.h1>

            {/* Grid */}
            <div className="relative z-10 grid gap-10 w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6">
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.07, z: 40 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        onClick={() => {
                            setSelectedEvent(event);
                            setShowModal(true);
                        }}
                        className={`cursor-pointer bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl border border-gray-700 shadow-lg hover:shadow-energy-orange/40 transition-all`}
                    >
                        {/* Banner */}
                        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
                            <Image
                                src={event.bannerUrl || "/placeholder-banner.jpg"}
                                alt={event.title}
                                fill
                                className="object-cover transition-transform duration-700 ease-out hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="flex justify-between items-center mt-3">
                                <HoloShareButton
                                    url={`${window.location.origin}/events/${event.id}`}
                                    title={event.title}
                                />
                            </div>


                        </div>

                        <h2 className="text-xl font-semibold text-energy-orange">{event.title}</h2>
                        <p className="text-gray-300 text-sm">📍 {event.location}</p>
                        <p className="text-gray-300 text-sm">🗓️ {new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-gray-300 text-sm">💰 ₦{event.price}</p>
                    </motion.div>
                ))}
            </div>

            {selectedEvent && (
                <button
                    onClick={() => {
                        navigator.share({
                            title: selectedEvent.title,
                            text: "Buy your ticket now!",
                            url: `${window.location.origin}/events/${selectedEvent.id}`,
                        });
                    }}
                    className="mt-6 text-energy-orange underline hover:text-white"
                >
                    Share this Event
                </button>
            )}

            {/* Holographic Preview Modal */}
            <AnimatePresence>
                {showModal && selectedEvent && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        {/* Card */}
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            className="relative z-50 w-[92vw] max-w-3xl bg-gray-900/70 border border-energy-orange/40 rounded-3xl shadow-[0_0_35px_rgba(255,165,0,0.25)] overflow-hidden"
                            initial={{ y: 24, scale: 0.98, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 24, scale: 0.98, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 16 }}
                        >
                            {/* Banner */}
                            <div className="relative w-full h-56 sm:h-72">
                                <Image
                                    src={selectedEvent.bannerUrl || "/placeholder-banner.jpg"}
                                    alt={selectedEvent.title}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 text-white border border-white/20 hover:bg-black/60 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8">
                                <h3 className="text-2xl font-bold text-energy-orange mb-2">
                                    {selectedEvent.title}
                                </h3>
                                <p className="text-gray-300 mb-4">{selectedEvent.description}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-300 mb-6">
                                    <div>📍 <span className="text-white">{selectedEvent.location}</span></div>
                                    <div>🗓️ <span className="text-white">{new Date(selectedEvent.date).toLocaleDateString()}</span></div>
                                    <div>💰 <span className="text-white">₦{selectedEvent.price}</span></div>
                                </div>

                                {/* Single Purchase Ticket button with the same orange style / effects */}
                                <div ref={purchaseRef} className="text-center">
                                    <motion.div
                                        whileHover={{ scale: 1.06 }}
                                        whileTap={{ scale: 0.96 }}
                                        animate={{
                                            boxShadow: [
                                                "0 0 12px rgba(255,165,0,0.6)",
                                                "0 0 24px rgba(255,165,0,0.8)",
                                                "0 0 12px rgba(255,165,0,0.6)",
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                                        className="inline-block"
                                    >
                                        <PurchaseTicket
                                            eventId={selectedEvent.id}
                                            eventName={selectedEvent.title}
                                            price={selectedEvent.price}
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
