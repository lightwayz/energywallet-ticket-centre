"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface EventFormProps {
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  editingEvent: any | null;
  clearEdit: () => void;
}

export default function EventForm({ onAdd, onUpdate, editingEvent, clearEdit }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDate(editingEvent.date);
      setLocation(editingEvent.location);
      setPrice(editingEvent.price);
      setDescription(editingEvent.description);
    } else {
      setTitle("");
      setDate("");
      setLocation("");
      setPrice(0);
      setDescription("");
    }
  }, [editingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = { title, date, location, price, description };
    try {
      if (editingEvent) {
        await onUpdate(editingEvent.id, eventData);
        clearEdit();
      } else {
        await onAdd(eventData);
      }
      setTitle("");
      setDate("");
      setLocation("");
      setPrice(0);
      setDescription("");
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  return (
      <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
      >
        <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
        />
        <input
            type="date"
            placeholder="Event Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
        />
        <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
        />
        <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            className="px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
        />
        <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="px-4 py-2 rounded-lg bg-transparent border border-gray-700 focus:outline-none"
        />
        <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-energy-orange py-2 rounded-lg font-semibold hover:bg-orange-400 transition"
        >
          {editingEvent ? "Update Event" : "Add Event"}
        </motion.button>
      </motion.form>
  );
}
