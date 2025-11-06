"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import PurchaseTicket from "@/components/PurchaseTicket";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const purchaseRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
        if (selectedEvent && purchaseRef.current) {
            setTimeout(() => {
                purchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
        }
    }, [selectedEvent]);

    // 🧠 Shared motion values for subtle 3D hover
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const rotateX = useTransform(y, [0, 1], [8, -8]);
    const rotateY = useTransform(x, [0, 1], [-8, 8]);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative min-h-screen bg-energy-black text-white overflow-hidden flex flex-col items-center justify-start py-10"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* 🌌 Background */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: "url('/eventback.jpg')",
                    opacity: 0.4,
                    rotateX,
                    rotateY,
                    transformPerspective: 1000,
                }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
            />
            <motion.div className="absolute inset-0 bg-black/60 z-0" />

            {/* Header */}
            <h1 className="text-3xl md:text-4xl font-bold text-energy-orange mb-10 text-center relative z-10 drop-shadow-lg">
                Available Events
            </h1>

            {/* Event Grid */}
            <div className="relative z-10 grid gap-8 w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6">
                {events.map((event) => {
                    const isSelected = selectedEvent?.id === event.id;
                    return (
                        <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.05, rotateY: 2 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setSelectedEvent(event)}
                            className={`cursor-pointer bg-gray-900/70 backdrop-blur-md p-5 rounded-2xl border
                ${isSelected ? "border-energy-orange shadow-[0_0_25px_4px_rgba(255,165,0,0.5)]" : "border-gray-700"}
                shadow-lg hover:shadow-energy-orange/40 transition-all transform-gpu perspective-1000`}
                        >
                            {/* 🖼 Event Banner */}
                            <motion.div
                                className="relative w-full h-48 rounded-xl overflow-hidden mb-3"
                                style={{ rotateX, rotateY, transformPerspective: 1000 }}
                            >
                                <Image
                                    src={event.bannerUrl || "/placeholder-banner.jpg"}
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </motion.div>

                            <h2 className="text-xl font-semibold text-energy-orange">{event.title}</h2>
                            <p className="text-gray-400 text-sm">📍 {event.location}</p>
                            <p className="text-gray-400 text-sm">🗓️ {new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-sm">💰 ₦{event.price}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* 🎟 Purchase Section */}
            {selectedEvent && (
                <motion.div
                    ref={purchaseRef}
                    id="purchase-ticket"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-20 mt-16"
                >
                    <PurchaseTicket
                        eventId={selectedEvent.id}
                        eventName={selectedEvent.title}
                        price={selectedEvent.price}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
