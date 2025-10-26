"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import PurchaseTicket from "@/components/PurchaseTicket";
import EventList from "@/components/EventList";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function EventSearch() {
    const [showList, setShowList] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement | null>(null); // 🆕 ref for click detection

    // 🔥 Fetch events dynamically from Firestore
    useEffect(() => {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents = snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name || doc.data().title || "Untitled Event",
            }));
            setEvents(fetchedEvents);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 🆕 Detect click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowList(false);
            }
        };

        if (showList) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showList]);

    const buttonVariants = {
        inactive: {
            backgroundColor: "#FFA500",
            scale: 1,
            boxShadow: "0px 0px 0px rgba(255,165,0,0)",
            transition: { duration: 0.3, ease: easeOut },
        },
        active: {
            backgroundColor: "#FFA500",
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

    const buttonLabel = loading
        ? "Loading Events..."
        : selectedEvent
            ? "Purchase Ticket"
            : "Search Event";

    const handleEventSelect = (event: string) => {
        setSelectedEvent(event);
        setShowList(false);
    };

    return (
        <div className="text-center py-12">
            {/* 🔸 Title */}
            <motion.h1
                className="text-3xl md:text-4xl font-bold mb-8 tracking-widest"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
        <span className="bg-gradient-to-r from-[#FFA500] to-[#FFD580] bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(255,165,0,0.6)]">
          UPCOMING&nbsp;EVENTS
        </span>
            </motion.h1>

            {/* 🔘 Main Button */}
            <div className="relative my-10" ref={dropdownRef}>
                <motion.button
                    variants={buttonVariants}
                    initial="inactive"
                    animate={showList ? "active" : "inactive"}
                    onClick={() => {
                        if (!loading) setShowList(!showList);
                    }}
                    disabled={loading}
                    className={`px-6 py-3 text-energy-black rounded-2xl font-semibold shadow-md focus:outline-none ${
                        loading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                >
                    {buttonLabel}
                </motion.button>

                {/* 🧾 Dropdown List */}
                <AnimatePresence>
                    {showList && !selectedEvent && (
                        <motion.div
                            key="dropdown"
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute left-1/2 -translate-x-1/2 mt-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg text-left border border-gray-800 z-50 max-h-80 overflow-y-auto w-72"
                            style={{ pointerEvents: "auto" }}
                        >
                            {events.length === 0 ? (
                                <div className="px-6 py-3 text-gray-400">
                                    No events available
                                </div>
                            ) : (
                                events.map((event) => (
                                    <button
                                        key={event.id}
                                        onClick={() => handleEventSelect(event.name)}
                                        className="block w-full px-6 py-3 text-white rounded-2xl text-left hover:bg-orange-400 transition"
                                    >
                                        {event.name}
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 🎟 Purchase Ticket Section */}
            {selectedEvent && (
                <motion.div
                    key={selectedEvent}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                >
                    <PurchaseTicket
                        eventName={selectedEvent}
                        eventId={selectedEvent.replace(/\s/g, "-").toLowerCase()}
                    />
                </motion.div>
            )}

            {/* 📋 Show Event Details */}
            {selectedEvent && (
                <motion.div
                    key={`list-${selectedEvent}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="mt-12"
                >
                    <EventList selectedEvent={selectedEvent} />
                </motion.div>
            )}
        </div>
    );
}
