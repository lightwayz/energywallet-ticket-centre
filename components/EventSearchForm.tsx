"use client";
import React, { useState } from "react";
import TicketCheckoutModal from "@/components/TicketCheckoutModal";
import toast from "react-hot-toast";

export default function EventSearchForm() {
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEvent(e.target.value);
    };

    const handlePurchaseClick = () => {
        if (!selectedEvent) {
            toast.error("Please select an event first.");
            return;
        }
        setShowModal(true);
    };

    const eventPriceMap: Record<string, number> = {
        "Energy Summit 2025": 5000,
        "Solar Expo 2025": 7000,
        "Hydrogen Futures Forum": 8000,
    };

    return (
        <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
            <label className="block mb-2 text-sm text-gray-400">Select an Event</label>
            <select
                value={selectedEvent ?? ""}
                onChange={handleSelect}
                className="w-full p-2 rounded-md text-black"
            >
                <option value="">-- Choose an event --</option>
                {Object.keys(eventPriceMap).map((event) => (
                    <option key={event} value={event}>
                        {event}
                    </option>
                ))}
            </select>

            <button
                onClick={handlePurchaseClick}
                disabled={!selectedEvent}
                className="mt-4 w-full bg-energy-orange text-black font-semibold p-2 rounded-lg hover:bg-orange-500 disabled:opacity-50"
            >
                Purchase Ticket
            </button>

            {showModal && selectedEvent && (
                <TicketCheckoutModal
                    eventId={selectedEvent.toLowerCase().replace(/\s+/g, "-")}
                    eventName={selectedEvent}
                    price={eventPriceMap[selectedEvent]}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
