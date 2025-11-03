// noinspection JSIgnoredPromiseFromCall

"use client";

import React, { useEffect, useState } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // ❗ keep only Firestore + Auth
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import AdminGuard from "@/components/AdminGuard";


export default function AdminPage() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        price: "",
        bannerUrl: "",
    });

    // 🔹 Fetch all events
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        const snap = await getDocs(collection(db, "events"));
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
        toast.success("Logged out");
        router.push("/admin/login");
    };

    // ✅ Banner Upload (Vercel Blob only)
    const handleBannerUpload = async (file: File) => {
        setUploading(true);
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            });

            const formData = new FormData();
            formData.append("file", compressed, file.name);

            const res = await fetch("/api/blob/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`, // ✅ admin auth
                },
                body: formData,
            });

            const data = await res.json();

            if (!data.url) throw new Error(data.error || "Upload failed");

            setFormData((prev) => ({ ...prev, bannerUrl: data.url }));
            setPreview(data.url);
            toast.success("✅ Banner uploaded successfully!");
            return data.url;
        } catch (err) {
            console.error("❌ Upload failed:", err);
            toast.error("Upload failed");
            return "";
        } finally {
            setUploading(false);
        }
    };



    // ✅ Save / Update Event
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            if (!formData.title.trim()) {
                toast.error("Please enter an event title");
                return;
            }
            if (!formData.date) {
                toast.error("Please select a valid date and time");
                return;
            }

            const eventDate = new Date(formData.date);
            if (isNaN(eventDate.getTime())) {
                toast.error("Invalid date format.");
                return;
            }

            const payload = {
                ...formData,
                date: Timestamp.fromDate(eventDate),
                updatedAt: Timestamp.now(),
            };

            if (editMode && currentEvent) {
                await updateDoc(doc(db, "events", currentEvent.id), payload);
                toast.success("✅ Event updated successfully!");
            } else {
                await addDoc(collection(db, "events"), {
                    ...payload,
                    createdAt: Timestamp.now(),
                });
                toast.success("✅ Event created successfully!");
            }

            setFormData({
                title: "",
                description: "",
                date: "",
                location: "",
                price: "",
                bannerUrl: "",
            });
            setPreview(null);
            setEditMode(false);
            await fetchEvents();
        } catch (err) {
            console.error("❌ Save error:", err);
            toast.error("Failed to save event");
        } finally {
            setUploading(false);
        }
    };

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
        setPreview(event.bannerUrl || null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this event?")) return;
        await deleteDoc(doc(db, "events", id));
        toast.success("✅ Event deleted");
        await fetchEvents();
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                {/* Nav */}
                <nav className="flex justify-between items-center mb-8 border-b border-gray-700 pb-3">
                    <div className="flex gap-4 text-sm">
                        <a href="/" className="text-gray-300 hover:text-white">Home</a>
                        <a href="/admin/work" className="text-gray-300 hover:text-white">Events log</a>
                        <a href="/admin" className="text-gray-300 hover:text-white font-semibold">Admin</a>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold"
                    >
                        Logout
                    </button>
                </nav>

                {/* Event Form */}
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
                    </div>

                    {/* Drag & Drop Banner */}
                    <div
                        onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleBannerUpload(file);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        className="mt-4 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-700 transition"
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mx-auto h-40 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <>
                                <p className="text-gray-400 mb-2">Drag & drop banner here</p>
                                <p className="text-gray-500 text-sm mb-2">or</p>
                                <label className="cursor-pointer text-emerald-400 underline">
                                    Select a file
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleBannerUpload(file);
                                        }}
                                    />
                                </label>
                            </>
                        )}
                    </div>

                    <textarea
                        placeholder="Event Description"
                        className="w-full mt-4 p-2 rounded bg-gray-700 text-white"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <button
                        type="submit"
                        disabled={uploading}
                        className={`mt-4 px-4 py-2 rounded-lg font-semibold ${
                            uploading ? "bg-gray-500 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"
                        }`}
                    >
                        {uploading ? "Saving..." : editMode ? "Update Event" : "Add Event"}
                    </button>
                </form>

                {/* Event List */}
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
                                    🕒{" "}
                                    {event.date?.toDate
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
