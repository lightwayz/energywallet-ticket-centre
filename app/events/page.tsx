"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import EventSearchForm from "@/components/EventSearchForm";
import PurchaseTicket from "@/components/PurchaseTicket";


export default function EventsPage() {
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [showPurchase, setShowPurchase] = useState(false);



    const handleSelectEvent = (event: string) => {
        setSelectedEvent(event);
        setShowPurchase(false);
    };

    const handlePurchaseClick = () => {
        if (!selectedEvent) return;
        setShowPurchase(true);
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

            <div className="w-full max-w-md mb-8">
                <EventSearchForm
                    selectedEvent={selectedEvent}
                    onSelectEvent={handleSelectEvent}
                    onPurchaseClick={handlePurchaseClick}
                />
            </div>

            {showPurchase && selectedEvent && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <PurchaseTicket eventName={selectedEvent} />
                </motion.div>
            )}
        </motion.div>
    );
}
