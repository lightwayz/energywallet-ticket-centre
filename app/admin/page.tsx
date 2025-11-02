// noinspection JSIgnoredPromiseFromCall

"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPage() {
    const router = useRouter();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        price: "",
        bannerUrl: "",
    });

    // Fetch events
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const evtSnap = await getDocs(collection(db, "events"));
            setEvents(evtSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Logout
    const handleLogout = async () => {
        await signOut(auth);
        document.cookie = "userRole=; path=/; max-age=0";
        toast.success("Logged out successfully");
        router.push("/admin/login");
    };

    // Handle Create or Update
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editMode && currentEvent) {
                await updateDoc(doc(db, "events", currentEvent.id), {
                    ...formData,
                    date: Timestamp.fromDate(new Date(formData.date)),
                    updatedAt: Timestamp.now(),
                });
                toast.success("Event updated successfully!");
            } else {
                await addDoc(collection(db, "events"), {
                    ...formData,
                    date: Timestamp.fromDate(new Date(formData.date)),
                    createdAt: Timestamp.now(),
                });
                toast.success("Event created successfully!");
            }

            setFormData({
                title: "",
                description: "",
                date: "",
                location: "",
                price: "",
                bannerUrl: "",
            });
            setEditMode(false);
            setCurrentEvent(null);
            await fetchEvents();
        } catch (err) {
            console.error("Error saving event:", err);
            toast.error("Failed to save event.");
        }
    };

    // Edit Event
    const handleEdit = (event: any) => {
        setEditMode(true);
        setCurrentEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date?.toDate
                ? event.date.toDate().toISOString().slice(0, 16)
                : event.date,
            location: event.location,
            price: event.price,
            bannerUrl: event.bannerUrl || "",
        });
    };

    // Delete Event
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteDoc(doc(db, "events", id));
            toast.success("Event deleted successfully!");
            await fetchEvents();
        } catch (err) {
            console.error("Error deleting event:", err);
            toast.error("Failed to delete event.");
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                {/* 🔹 Top Navigation */}
                <nav className="flex justify-between items-center mb-8 border-b border-gray-700 pb-3">
                    <div className="flex gap-4 text-sm">
                        <a href="/" className="text-gray-300 hover:text-white">Home</a>
                        <a href="/events" className="text-gray-300 hover:text-white">Events</a>
                        <a href="/admin" className="text-gray-300 hover:text-white font-semibold">Admin</a>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold"
                    >
                        Logout
                    </button>
                </nav>

                {/* 🔹 Event Form */}
                <form onSubmit={handleSave} className="bg-gray-800 p-6 rounded-xl mb-8">
                    <h2 className="text-xl font-bold mb-4 text-energy-orange">
                        {editMode ? "Edit Event" : "Add New Event"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Event Title"
                            className="p-2 rounded bg-gray-700 text-white"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            className="p-2 rounded bg-gray-700 text-white"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        <input
                            type="datetime-local"
                            className="p-2 rounded bg-gray-700 text-white"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price (₦)"
                            className="p-2 rounded bg-gray-700 text-white"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Banner URL"
                            className="p-2 rounded bg-gray-700 text-white col-span-2"
                            value={formData.bannerUrl}
                            onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                        />
                    </div>
                    <textarea
                        placeholder="Event Description"
                        className="w-full mt-4 p-2 rounded bg-gray-700 text-white"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <button
                        type="submit"
                        className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                        {editMode ? "Update Event" : "Add Event"}
                    </button>
                </form>

                {/* 🔹 Event List */}
                <h2 className="text-2xl font-semibold mb-4 text-energy-orange">All Events</h2>
                {loading ? (
                    <p className="text-gray-400">Loading events...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event.id} className="bg-gray-800 rounded-xl p-5 shadow-lg">
                                {event.bannerUrl && (
                                    <div className="overflow-hidden rounded-lg mb-3">
                                        <img
                                            src={event.bannerUrl}
                                            alt="Event Banner"
                                            className="w-full h-40 object-cover transition-transform duration-500 hover:scale-110"
                                        />
                                    </div>
                                )}
                                <h3 className="text-lg font-semibold text-emerald-400">{event.title}</h3>
                                <p className="text-gray-300">{event.description}</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    📍 {event.location} <br />
                                    🕒 {event.date?.toDate
                                    ? event.date.toDate().toLocaleString()
                                    : event.date}
                                </p>
                                <p className="text-energy-orange font-semibold mt-2">₦{event.price}</p>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}
