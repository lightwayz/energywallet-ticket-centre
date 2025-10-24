"use client";

import React from "react";

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
                <option value="Energy Summit 2025">Energy Summit 2025</option>
                <option value="Solar Expo 2025">Solar Expo 2025</option>
                <option value="Hydrogen Futures Forum">Hydrogen Futures Forum</option>
            </select>

            <button
                onClick={onPurchaseClick}
                disabled={!selectedEvent}
                className="mt-4 w-full bg-energy-orange text-black font-semibold p-2 rounded-lg hover:bg-orange-500 disabled:opacity-50"
            >
                Purchase Ticket
            </button>
        </div>
    );
};

export default EventSearchForm;
