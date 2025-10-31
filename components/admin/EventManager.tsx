"use client";

import React, {JSX} from "react";

interface EventManagerProps {
    events: any[];
    onEdit: (event: any) => void;
    onDelete: (id: string) => Promise<void> | void;
}

export default function EventManager({
                                         events,
                                         onEdit,
                                         onDelete,
                                     }: EventManagerProps): JSX.Element {
    if (!events || events.length === 0)
        return <p className="text-gray-400 text-center">No events found.</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
                const formattedDate = event.date?.toDate
                    ? event.date.toDate().toLocaleString()
                    : new Date(event.date).toLocaleString();

                return (
                    <div
                        key={event.id}
                        className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        {event.bannerUrl && (
                            <img
                                src={event.bannerUrl}
                                alt="Event banner"
                                className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                        )}
                        <h3 className="text-xl font-semibold text-emerald-400 mb-2">
                            {event.title}
                        </h3>
                        <p className="text-gray-300 mb-3">
                            {event.description || "No description."}
                        </p>
                        <div className="text-gray-400 text-sm space-y-1 mb-3">
                            <p>
                                <strong>Date:</strong> {formattedDate}
                            </p>
                            <p>
                                <strong>Location:</strong> {event.location || "Unknown"}
                            </p>
                            <p>
                                <strong>Price:</strong> ₦{event.price || 0}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => onEdit(event)}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(event.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
