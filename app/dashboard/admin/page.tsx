"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        price: "",
    });

    // ✅ Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterLocation, setFilterLocation] = useState("");

    // ✅ Fetch events
    const fetchEvents = async () => {
        try {
            const snapshot = await getDocs(collection(db, "events"));
            const eventsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setEvents(eventsData);
        } catch (err) {
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // ✅ Handle form input
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Add new event
    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.date) return alert("Title and date are required.");

        try {
            setSaving(true);
            await addDoc(collection(db, "events"), {
                ...formData,
                date: Timestamp.fromDate(new Date(formData.date)),
                createdAt: Timestamp.now(),
            });
            setShowModal(false);
            setFormData({ title: "", description: "", date: "", location: "", price: "" });
            await fetchEvents();
        } catch (err) {
            console.error("Error adding event:", err);
            alert("Failed to add event.");
        } finally {
            setSaving(false);
        }
    };

    // ✅ Open edit modal
    const handleEditClick = (event: any) => {
        setSelectedEvent(event);
        setFormData({
            title: event.title || "",
            description: event.description || "",
            date: event.date?.toDate
                ? event.date.toDate().toISOString().slice(0, 16)
                : "",
            location: event.location || "",
            price: event.price || "",
        });
        setShowEditModal(true);
    };

    // ✅ Update event
    const handleUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;

        try {
            setSaving(true);
            await updateDoc(doc(db, "events", selectedEvent.id), {
                ...formData,
                date: Timestamp.fromDate(new Date(formData.date)),
            });
            setShowEditModal(false);
            setSelectedEvent(null);
            await fetchEvents();
        } catch (err) {
            console.error("Error updating event:", err);
            alert("Failed to update event.");
        } finally {
            setSaving(false);
        }
    };

    // ✅ Delete event
    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteDoc(doc(db, "events", id));
            await fetchEvents();
        } catch (err) {
            console.error("Error deleting event:", err);
            alert("Failed to delete event.");
        }
    };

    // ✅ Search + filter logic
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch =
                event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDate =
                !filterDate ||
                (event.date?.toDate
                    ? event.date.toDate().toISOString().slice(0, 10) === filterDate
                    : new Date(event.date).toISOString().slice(0, 10) === filterDate);

            const matchesLocation =
                !filterLocation ||
                event.location?.toLowerCase() === filterLocation.toLowerCase();

            return matchesSearch && matchesDate && matchesLocation;
        });
    }, [events, searchTerm, filterDate, filterLocation]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        + Add Event
                    </button>
                </div>

                {/* ✅ Search and Filter Controls */}
                <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search by title, description, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        type="text"
                        placeholder="Filter by location"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="p-2 rounded bg-gray-700 text-white"
                    />
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setFilterDate("");
                            setFilterLocation("");
                        }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                    >
                        Clear
                    </button>
                </div>

                {/* ✅ Events Grid */}
                {filteredEvents.length === 0 ? (
                    <p className="text-gray-400 text-center">No matching events found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const formattedDate = event.date?.toDate
                                ? event.date.toDate().toLocaleString()
                                : event.date
                                    ? new Date(event.date).toLocaleString()
                                    : "No date available";

                            return (
                                <div
                                    key={event.id}
                                    className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition"
                                >
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
                                            <strong>Location:</strong>{" "}
                                            {event.location || "Unknown"}
                                        </p>
                                        <p>
                                            <strong>Price:</strong>{" "}
                                            {event.price ? `$${event.price}` : "Free"}
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEditClick(event)}
                                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ✅ Add Modal */}
                {showModal && (
                    <Modal
                        title="Add New Event"
                        formData={formData}
                        onClose={() => setShowModal(false)}
                        onSubmit={handleAddEvent}
                        onChange={handleChange}
                        saving={saving}
                    />
                )}

                {/* ✅ Edit Modal */}
                {showEditModal && (
                    <Modal
                        title="Edit Event"
                        formData={formData}
                        onClose={() => setShowEditModal(false)}
                        onSubmit={handleUpdateEvent}
                        onChange={handleChange}
                        saving={saving}
                        isEdit
                    />
                )}
            </div>
        </AdminGuard>
    );
}

/* ✅ Reusable Modal Component */
function Modal({
                   title,
                   formData,
                   onClose,
                   onSubmit,
                   onChange,
                   saving,
                   isEdit = false,
               }: any) {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
                <h2
                    className={`text-lg font-semibold mb-4 ${
                        isEdit ? "text-blue-400" : "text-emerald-400"
                    }`}
                >
                    {title}
                </h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={onChange}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={onChange}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        name="date"
                        type="datetime-local"
                        value={formData.date}
                        onChange={onChange}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        name="location"
                        placeholder="Location"
                        value={formData.location}
                        onChange={onChange}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        name="price"
                        placeholder="Price"
                        type="number"
                        value={formData.price}
                        onChange={onChange}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 ${
                                isEdit
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-emerald-500 hover:bg-emerald-600"
                            } rounded-lg`}
                        >
                            {saving
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update"
                                    : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
