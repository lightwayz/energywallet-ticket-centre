// noinspection JSIgnoredPromiseFromCall,ExceptionCaughtLocallyJS

"use client";

import React, { useEffect, useState } from "react";
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
    const [tab, setTab] = useState<"events" | "payments">("events");
    const [events, setEvents] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals & Forms
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        price: "",
        bannerUrl: "",
    });

    /* 🔹 Fetch Events / Payments */
    useEffect(() => {
        fetchAll();
    }, [tab]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            if (tab === "events") {
                const snapshot = await getDocs(collection(db, "events"));
                setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
            } else {
                const snapshot = await getDocs(collection(db, "payments"));
                setPayments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
            }
        } catch (err) {
            console.error("Error fetching:", err);
        } finally {
            setLoading(false);
        }
    };

    /* 🔹 Modal Handlers */
    const openAddModal = () => {
        setEditMode(false);
        setFormData({
            title: "",
            description: "",
            date: "",
            location: "",
            price: "",
            bannerUrl: "",
        });
        setBannerFile(null);
        setShowModal(true);
    };

    const openEditModal = (event: any) => {
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
        setBannerFile(null);
        setShowModal(true);
    };

    /* 🔹 Delete Event */
    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Delete this event permanently?")) return;
        try {
            await deleteDoc(doc(db, "events", id));
            alert("Event deleted.");
            await fetchAll();
        } catch (err) {
            console.error(err);
            alert("Failed to delete event.");
        }
    };

    /* 🔹 Save or Update Event with Vercel Blob */
    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let bannerUrl = formData.bannerUrl || "";

            if (bannerFile) {
                setUploading(true);
                const form = new FormData();
                form.append("file", bannerFile);

                const res = await fetch("/api/upload-banner", {
                    method: "POST",
                    body: form,
                });

                if (!res.ok) throw new Error("Upload failed.");
                const data = await res.json();
                bannerUrl = data.url;
                setUploading(false);
            }

            const eventData = {
                ...formData,
                bannerUrl,
                date: Timestamp.fromDate(new Date(formData.date)),
                updatedAt: Timestamp.now(),
            };

            if (editMode && currentEvent) {
                await updateDoc(doc(db, "events", currentEvent.id), eventData);
                alert("Event updated successfully!");
            } else {
                await addDoc(collection(db, "events"), {
                    ...eventData,
                    createdAt: Timestamp.now(),
                });
                alert("Event added successfully!");
            }

            setShowModal(false);
            await fetchAll();
        } catch (err) {
            console.error(err);
            alert("Failed to save event.");
        } finally {
            setUploading(false);
        }
    };

    /* 🔹 Payment Confirmation / Delete */
    const handleConfirmPayment = async (id: string) => {
        if (!confirm("Confirm this payment as successful?")) return;
        try {
            await updateDoc(doc(db, "payments", id), {
                status: "PAID",
                confirmedAt: Timestamp.now(),
            });
            alert("Payment confirmed.");
            await fetchAll();
        } catch (err) {
            console.error("Error confirming payment:", err);
            alert("Failed to confirm payment.");
        }
    };

    const handleDeletePayment = async (id: string) => {
        if (!confirm("Delete this payment record?")) return;
        try {
            await deleteDoc(doc(db, "payments", id));
            alert("Payment deleted.");
            await fetchAll();
        } catch (err) {
            console.error(err);
            alert("Failed to delete payment.");
        }
    };

    /* ───────────────────────────────────────────── */

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-energy-orange">
                        Admin Dashboard
                    </h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTab("events")}
                            className={`px-4 py-2 rounded-lg ${
                                tab === "events"
                                    ? "bg-emerald-500"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            Events
                        </button>
                        <button
                            onClick={() => setTab("payments")}
                            className={`px-4 py-2 rounded-lg ${
                                tab === "payments"
                                    ? "bg-blue-500"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            Payments
                        </button>
                    </div>
                </div>

                {/* Add Event Button */}
                {tab === "events" && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={openAddModal}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold"
                        >
                            + Add Event
                        </button>
                    </div>
                )}

                {/* Loader */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-gray-500 rounded-full"></div>
                    </div>
                ) : tab === "events" ? (
                    <EventManager events={events} onEdit={openEditModal} onDelete={handleDeleteEvent} />
                ) : (
                    <PaymentManager
                        payments={payments}
                        onConfirm={handleConfirmPayment}
                        onDelete={handleDeletePayment}
                    />
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
                            <h2 className="text-lg font-semibold mb-4 text-emerald-400">
                                {editMode ? "Edit Event" : "Add New Event"}
                            </h2>

                            <form onSubmit={handleSaveEvent} className="space-y-4">
                                <input
                                    name="title"
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                />
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                />
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                />
                                <input
                                    name="location"
                                    placeholder="Location"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                />
                                <input
                                    name="price"
                                    type="number"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                />

                                {/* Banner Upload */}
                                <div>
                                    <label className="block mb-2 text-sm text-gray-400">
                                        Event Banner
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setBannerFile(e.target.files ? e.target.files[0] : null)
                                        }
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                    {uploading && (
                                        <p className="text-xs text-yellow-400 mt-2">Uploading...</p>
                                    )}
                                    {formData.bannerUrl && !bannerFile && (
                                        <img
                                            src={formData.bannerUrl}
                                            alt="Banner preview"
                                            className="mt-3 rounded-lg max-h-40 object-cover"
                                        />
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-600 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                                    >
                                        {uploading
                                            ? "Uploading..."
                                            : editMode
                                                ? "Update"
                                                : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}

/* 🎟 EVENT MANAGER */
function EventManager({ events, onEdit, onDelete }: any) {
    if (events.length === 0)
        return <p className="text-gray-400 text-center">No events found.</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
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

/* 💳 PAYMENT MANAGER */
function PaymentManager({ payments, onConfirm, onDelete }: any) {
    if (payments.length === 0)
        return <p className="text-gray-400 text-center">No payments yet.</p>;

    return (
        <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg p-5">
            <table className="min-w-full text-left border-collapse">
                <thead>
                <tr className="text-gray-300 border-b border-gray-700">
                    <th className="p-3">Buyer</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Event</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {payments.map((p: any) => (
                    <tr
                        key={p.id}
                        className="border-b border-gray-700 hover:bg-gray-700/30"
                    >
                        <td className="p-3">{p.buyerName || "N/A"}</td>
                        <td className="p-3">{p.buyerEmail || "—"}</td>
                        <td className="p-3">{p.eventName || "—"}</td>
                        <td className="p-3">₦{p.amount}</td>
                        <td
                            className={`p-3 font-semibold ${
                                p.status === "PAID"
                                    ? "text-emerald-400"
                                    : p.status === "FAILED"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                            }`}
                        >
                            {p.status}
                        </td>
                        <td className="p-3 flex gap-2">
                            {p.status !== "PAID" && (
                                <button
                                    onClick={() => onConfirm(p.id)}
                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded text-sm"
                                >
                                    Confirm
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(p.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
