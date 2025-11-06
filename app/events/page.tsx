// noinspection JSIgnoredPromiseFromCall

"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function EventsPage() {
    const [events, setEvents] = useState<
        {
            id: string;
            name: string;
            description?: string;
            location?: string;
            price?: number;
            bannerUrl?: string;
            date?: any;
        }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const controls = useAnimation();

    useEffect(() => {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().title || "Untitled Event",
                description: doc.data().description || "No description provided",
                location: doc.data().location || "Unknown",
                price: Number(String(doc.data().price || "0").replace(/[^0-9.]/g, "")),
                bannerUrl: doc.data().bannerUrl || "/placeholder-banner.jpg",
                date: doc.data().date,
            }));
            setEvents(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 🎞️ Background Ken Burns slow pan effect
    useEffect(() => {
        controls.start({
            scale: [1, 1.1],
            x: [0, -20],
            y: [0, -10],
            transition: { duration: 40, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        });
    }, [controls]);

    return (
        <div className="relative min-h-screen text-white overflow-hidden">
            {/* 🌌 Cinematic Background */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center"
                animate={controls}
                style={{ backgroundImage: "url('/eventback.jpg')", opacity: 0.25 }}
            />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-0" />

            {/* Header */}
            <div className="relative z-10 px-6 py-6 flex justify-between items-center border-b border-gray-800 backdrop-blur-md bg-black/30 stic-ky top-0">
                <h1 className="text-3xl font-bold text-energy-orange drop-shadow-md">
                    Available Events
                </h1>
                <Link
                    href="/"
                    className="text-sm px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition"
                >
                    ← Back to Home
                </Link>
            </div>

            {/* Events Grid */}
            <div className="relative z-10 p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    <p className="text-gray-400 text-center col-span-full">Loading events...</p>
                ) : events.length === 0 ? (
                    <p className="text-gray-400 text-center col-span-full">No events available.</p>
                ) : (
                    events.map((event) => (
                        <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="relative group cursor-pointer bg-white/5 rounded-2xl shadow-lg overflow-hidden border border-gray-700 hover:border-energy-orange/60 hover:shadow-energy-orange/20 backdrop-blur-sm"
                        >
                            {/* 🖼️ Banner */}
                            <div className="relative w-full h-48 overflow-hidden">
                                <Image
                                    src={event.bannerUrl || "/placeholder-banner.jpg"}
                                    alt={event.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            </div>

                            {/* 🎟️ Event Info */}
                            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/40 backdrop-blur-md text-left">
                                <h3 className="text-lg font-semibold text-energy-orange truncate">{event.name}</h3>
                                <p className="text-gray-300 text-sm truncate">{event.description}</p>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>📍 {event.location}</span>
                                    {event.date && (
                                        <span>
                      🗓️ {new Date(event.date.seconds * 1000).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                    </span>
                                    )}
                                </div>
                                <p className="text-sm text-white mt-2">
                                    💰 <strong>₦{event.price?.toLocaleString()}</strong>
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
