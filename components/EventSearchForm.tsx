"use client";
import React from "react";
import toast from "react-hot-toast";

interface EventSearchFormProps {
    selectedEvent: string | null;
    onSelectEvent: (event: string) => void;
    onPurchaseClick: () => void;
}

const EventSearchForm: React.FC<EventSearchFormProps> = ({
                                                             selectedEvent,
                                                             onSelectEvent,
                                                             onPurchaseClick,
                                                         }) => {
    const eventPriceMap: Record<string, number> = {
        "Energy Summit 2025": 5000,
        "Solar Expo 2025": 7000,
        "Hydrogen Futures Forum": 8000,
    };

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSelectEvent(e.target.value);
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
                onClick={() => {
                    if (!selectedEvent) {
                        toast.error("Please select an event first.");
                    } else {
                        onPurchaseClick();
                    }
                }}
                disabled={!selectedEvent}
                className="mt-4 w-full bg-energy-orange text-black font-semibold p-2 rounded-lg hover:bg-orange-500 disabled:opacity-50"
            >
                Purchase Ticket
            </button>
        </div>
    );
};

export default EventSearchForm;
