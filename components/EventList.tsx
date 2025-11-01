// noinspection ES6ShorthandObjectProperty

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";

type EventListProps = {
    selectedEvent: string;
};

type Ticket = {
    id: string;
    name: string;
    price: string;
};

export default function EventList({ selectedEvent }: EventListProps) {
    const { user, role } = useAuth(); // ✅ use role from context
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");

    // 🔹 Real-time ticket fetching
    useEffect(() => {
        const q = query(collection(db, "tickets"), where("eventName", "==", selectedEvent));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Ticket[];
            setTickets(data);
        });
        return () => unsubscribe();
    }, [selectedEvent]);

    // 🔹 Delete ticket
    const deleteTicket = async (ticketId: string) => {
        if (!user) return;
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        try {
            await deleteDoc(doc(db, "tickets", ticketId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete ticket.");
        }
    };

    // 🔹 Open edit modal
    const openEditModal = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setNewName(ticket.name);
        setNewPrice(ticket.price);
    };

    // 🔹 Save edits
    const saveEdit = async () => {
        if (!editingTicket) return;
        try {
            await updateDoc(doc(db, "tickets", editingTicket.id), {
                name: newName,
                price: newPrice,
            });
            setEditingTicket(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update ticket.");
        }
    };

    // 🔹 Add a new ticket
    const addTicket = async () => {
        if (!newName || !newPrice)
            return alert("Please provide both name and price.");
        try {
            await addDoc(collection(db, "tickets"), {
                name: newName,
                price: newPrice,
                eventName: selectedEvent,
            });
            setModalOpen(false);
            setNewName("");
            setNewPrice("");
        } catch (err) {
            console.error(err);
            alert("Failed to add ticket.");
        }
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                {role === "admin" && ( // ✅ check a role from context
                    <motion.button
                        onClick={() => setModalOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition"
                    >
                        Add Ticket
                    </motion.button>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {tickets.map((ticket) => (
                    <motion.div
                        key={ticket.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-lg text-center"
                    >
                        <h2 className="text-lg font-semibold text-energy-orange mb-2">
                            {ticket.name}
                        </h2>
                        <p className="text-gray-300">{ticket.price}</p>

                        {role === "admin" ? ( // ✅ admin-only buttons
                            <div className="flex justify-center gap-2 mt-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openEditModal(ticket)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
                                >
                                    Edit
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => deleteTicket(ticket.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-400 transition"
                                >
                                    Delete
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-4 px-5 py-2 bg-energy-orange text-energy-black rounded-lg font-semibold hover:bg-orange-400 transition"
                            >
                                Get Ticket
                            </motion.button>
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {/* 🔹 Modal for Add/Edit */}
            <AnimatePresence>
                {(modalOpen || editingTicket) && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl w-full max-w-md text-white"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <h3 className="text-xl font-bold text-energy-orange mb-4">
                                {editingTicket ? "Edit Ticket" : "Add New Ticket"}
                            </h3>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ticket Name"
                                className="w-full mb-3 p-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="Ticket Price"
                                className="w-full mb-3 p-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        setModalOpen(false);
                                        setEditingTicket(null);
                                        setNewName("");
                                        setNewPrice("");
                                    }}
                                    className="px-4 py-2 bg-gray-500 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingTicket ? saveEdit : addTicket}
                                    className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-400 transition"
                                >
                                    {editingTicket ? "Save" : "Add"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
