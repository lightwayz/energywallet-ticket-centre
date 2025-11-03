// noinspection JSIgnoredPromiseFromCall

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
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Admin Components
import AdminGuard from "@/components/AdminGuard";
import AdminDashboard from "@/components/admin/AdminDashboard";
import EventManager from "@/components/admin/EventManager";
import EventModal from "@/components/admin/EventModal";
import PaymentManager from "@/components/admin/PaymentManager";
import PurchaseManager from "@/components/admin/PurchaseManager";

export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"dashboard" | "events" | "payments" | "purchases">("dashboard");
    const [events, setEvents] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    // 🟢 Fetch Events & Payments
    useEffect(() => {
        fetchAll();
    }, [tab]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const evtSnap = await getDocs(collection(db, "events"));
            const paySnap = await getDocs(collection(db, "payments"));
            setEvents(evtSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setPayments(paySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Logout
    const handleLogout = async () => {
        await signOut(auth);
        document.cookie = "userRole=; path=/; max-age=0";
        toast.success("Logged out successfully");
        router.push("/admin/login");
    };

    // 🔹 Go to Admin Work page
    const goToAdminWork = () => router.push("/admin/work");

    // 🔹 Open Edit Modal
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

    // 🔹 Save or Update Event
    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let bannerUrl = formData.bannerUrl || "";
            if (bannerFile) {
                setUploading(true);
                const form = new FormData();
                form.append("file", bannerFile);
                const res = await fetch("/api/upload-banner", { method: "POST", body: form });
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
                toast.success("Event updated!");
            } else {
                await addDoc(collection(db, "events"), {
                    ...eventData,
                    createdAt: Timestamp.now(),
                });
                toast.success("Event added!");
            }

            setShowModal(false);
            await fetchAll();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save event");
        }
    };

    // 🔹 Delete Event
    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Delete this event permanently?")) return;
        await deleteDoc(doc(db, "events", id));
        toast.success("Event deleted.");
        await fetchAll();
    };

    // 🔹 Confirm & Delete Payment
    const handleConfirmPayment = async (id: string) => {
        await updateDoc(doc(db, "payments", id), { status: "PAID", confirmedAt: Timestamp.now() });
        toast.success("Payment confirmed.");
        await fetchAll();
    };

    const handleDeletePayment = async (id: string) => {
        await deleteDoc(doc(db, "payments", id));
        toast.success("Payment deleted.");
        await fetchAll();
    };

    // 🔹 Render UI
    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                {/* 🔹 Top Nav */}
                <nav className="flex justify-between mb-6 border-b border-gray-700 pb-3">
                    <div className="flex gap-4 text-sm">
                        <a href="/" className="text-gray-300 hover:text-white">Home</a>
                        <a href="/admin/logs" className="text-gray-300 hover:text-white">Events log</a>
                        <button onClick={goToAdminWork} className="text-gray-300 hover:text-emerald-400 font-semibold">
                            Admin
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold"
                    >
                        Logout
                    </button>
                </nav>

                {/* 🔹 Tabs */}
                <div className="flex gap-3 mb-6">
                    {["dashboard", "events", "payments", "purchases"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`px-4 py-2 rounded-lg font-semibold ${
                                tab === t
                                    ? t === "dashboard"
                                        ? "bg-orange-500"
                                        : t === "events"
                                            ? "bg-emerald-500"
                                            : t === "payments"
                                                ? "bg-blue-500"
                                                : "bg-purple-500"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* 🔹 Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-gray-500 rounded-full"></div>
                    </div>
                ) : tab === "dashboard" ? (
                    <AdminDashboard events={events} payments={payments} />
                ) : tab === "events" ? (
                    <EventManager events={events} onEdit={openEditModal} onDelete={handleDeleteEvent} />
                ) : tab === "payments" ? (
                    <PaymentManager payments={payments} onConfirm={handleConfirmPayment} onDelete={handleDeletePayment} />
                ) : (
                    <PurchaseManager purchases={[]} onDelete={function(): Promise<void> {
                                        throw new Error("Function not implemented.");
                                    } } />
                )}

                {/* 🔹 Modal */}
                {showModal && (
                    <EventModal
                        formData={formData}
                        setFormData={setFormData}
                        handleSaveEvent={handleSaveEvent}
                        setShowModal={setShowModal}
                        editMode={editMode}
                        uploading={uploading}
                        setBannerFile={setBannerFile}
                    />
                )}
            </div>
        </AdminGuard>
    );
}
