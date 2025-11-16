"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import EventList from "@/components/EventList";
import PurchaseTicket from "@/components/PurchaseTicket";
import dynamic from "next/dynamic";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), { ssr: false });

type Event = {
    id: string;
    title: string;
    price?: number | string;
};

export default function TicketCentrePage() {
    const [showList, setShowList] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<Event[]>([]);

    // 🔹 Real-time Firestore listener
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title as string,
                price: doc.data().price || 0,
            }));
            setEvents(data);
        });
        return () => unsubscribe();
    }, []);

    const buttonVariants = {
        inactive: {
            backgroundColor: "#FFA500",
            scale: 1,
            boxShadow: "0px 0px 0px rgba(255,165,0,0)",
            transition: { duration: 0.3, ease: easeOut },
        },
        active: {
            backgroundColor: "#FFD580",
            scale: 1.05,
            boxShadow: "0px 0px 12px rgba(255,165,0,0.5)",
            transition: { duration: 0.3, ease: easeOut },
        },
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.25, ease: easeOut },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.15 },
        },
    };

    const buttonLabel = selectedEvent ? "Purchase Ticket" : "View Events";

    return (
        <main className="min-h-screen bg-energy-black text-white px-6 py-12">

            {/* 3-D animated hero */}
            <div className="max-w-5xl mx-auto mb-10 transition-transform duration-700 ease-out">
                <ThreeScene />
            </div>


            <h1 className="text-3xl font-bold text-center text-energy-orange mb-8">
                Upcoming Events
            </h1>

            {/* Dropdown search button */}
            <motion.button
                variants={buttonVariants}
                initial="inactive"
                animate={{
                    rotate: 360,
                    transition: {
                        repeat: Infinity,
                        ease: "linear",
                        duration: 6,
                    },
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setShowList((prev) => !prev)}
                className="px-8 py-3 text-white font-bold rounded-2xl shadow-lg focus:outline-none relative z-40
             bg-gradient-to-r from-[#FF7A00] via-[#FFA500] to-[#FF7A00]
             border border-[#FFB84D]/30"
                style={{
                    boxShadow: "0 0 25px rgba(255,165,0,0.5)",
                }}
            >
                {buttonLabel}
            </motion.button>


            <AnimatePresence>
                    {showList && !selectedEvent && (
                        <motion.div
                            key="dropdown"
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute left-1/2 -translate-x-1/2 mt-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg text-left border border-gray-800 z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {events.map((event) => (
                                <button
                                    key={event.id}
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setShowList(false);
                                    }}
                                    className="block w-full px-6 py-3 text-white rounded-2xl text-left hover:bg-orange-400 transition"
                                >
                                    {event.title}
                                </button>
                            ))}
                        </motion.div>
                    )}
            </AnimatePresence>

            {/* 🎟 Purchase Ticket Section */}
            {selectedEvent && (
                <motion.div
                    key={selectedEvent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mt-12"
                >
                    <PurchaseTicket
                        eventName={selectedEvent.title}
                        eventId={selectedEvent.id}
                        price={selectedEvent.price || 0}
                    />
                </motion.div>
            )}

            {/* 📋 Event Details Section */}
            {selectedEvent && (
                <motion.div
                    key={`list-${selectedEvent.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="mt-12"
                >
                    <EventList selectedEvent={selectedEvent.title} />
                </motion.div>
            )}
        </main>
    );
}
