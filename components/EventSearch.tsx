"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import PurchaseTicket from "@/components/PurchaseTicket";
import EventList from "@/components/EventList";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function EventSearch() {
    const [showList, setShowList] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [events, setEvents] = useState<
        { id: string; name: string; description?: string; location?: string; price?: number }[]
    >([]);
    const [loading, setLoading] = useState(true);

    // 🔥 Fetch events dynamically from Firestore
    useEffect(() => {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents = snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().title || doc.data().name || "Unnamed Event",
                description: doc.data().description || "No description provided.",
                location: doc.data().location || "Unknown",
                price: doc.data().price || 0,
                date: doc.data().date,
            }));
            setEvents(fetchedEvents);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const buttonLabel = loading ? "Loading Events..." : "Search Event";

    const handleEventSelect = (eventName: string) => {
        setSelectedEvent(eventName);
        setShowList(false);
    };

    const buttonVariants = {
        inactive: { scale: 1, transition: { duration: 0.2, ease: easeOut } },
        active: { scale: 1.05, transition: { duration: 0.2, ease: easeOut } },
    };

    return (
        <div className="text-center py-12">
            <motion.h1
                className="text-3xl md:text-4xl font-bold mb-8 tracking-widest"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
        <span className=" from-white to-[#white] )]">
          UPCOMING&nbsp;EVENTS
        </span>
            </motion.h1>

            {/* 🔘 Main Search Button */}
            {!selectedEvent && (
                <div className="my-10">
                    <motion.button
                        variants={buttonVariants}
                        initial="inactive"
                        animate={showList ? "active" : "inactive"}
                        onClick={() => !loading && setShowList(true)}
                        disabled={loading}
                        className={`px-6 py-3 bg-energy-orange text-energy-black rounded-2xl font-semibold shadow-md focus:outline-none ${
                            loading ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                    >
                        {buttonLabel}
                    </motion.button>
                </div>
            )}

            {/* 🧾 Fullscreen Modal List */}
            <AnimatePresence>
                {showList && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700 text-white relative"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-energy-orange">
                                    Available Events
                                </h2>
                                <button
                                    onClick={() => setShowList(false)}
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Event Grid */}
                            {loading ? (
                                <div className="text-gray-400 text-center py-6">
                                    Loading events...
                                </div>
                            ) : events.length === 0 ? (
                                <p className="text-gray-400 text-center">No events available.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event) => {
                                        // @ts-ignore
                                        const formattedDate = !event.date?.toDate ? "No date available" : event.date.toDate().toLocaleString();
                                        return (
                                            <div
                                                key={event.id}
                                                onClick={() => handleEventSelect(event.name)}
                                                className="cursor-pointer bg-white/10 hover:bg-white/20 p-5 rounded-xl shadow-md transition border border-gray-700"
                                            >
                                                <h3 className="text-xl font-semibold text-energy-orange mb-2">
                                                    {event.name}
                                                </h3>
                                                <p className="text-gray-300 mb-3 text-sm">
                                                    {event.description}
                                                </p>
                                                <div className="text-gray-400 text-xs space-y-1">
                                                    <p><strong>Date:</strong> {formattedDate}</p>
                                                    <p><strong>Location:</strong> {event.location}</p>
                                                    <p><strong>Price:</strong> ₦{event.price}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🎟 Purchase Ticket Section */}
            {selectedEvent && (
                <motion.div
                    key={selectedEvent}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mt-8"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-energy-orange">
                        {selectedEvent}
                    </h2>
                    <PurchaseTicket
                        eventName={selectedEvent}
                        eventId={selectedEvent.replace(/\s/g, "-").toLowerCase()}
                    />
                </motion.div>
            )}

            {/* 📋 Event Details (optional) */}
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
