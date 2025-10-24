import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, Timestamp } from "firebase/firestore";

const eventsCol = collection(db, "events");

// Create event
export const createEvent = async (data: {
    title: string;
    date: string;
    location: string;
    price: number;
    description: string;
}) => {
    const docRef = await addDoc(eventsCol, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
};

// Get all events
export const getEvents = async () => {
    const snapshot = await getDocs(eventsCol);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title || "",
            date: data.date || "",
            location: data.location || "",
            price: data.price || 0,
            description: data.description || "",
        };
    });
};

// Update event
export const updateEvent = async (id: string, data: Partial<any>) => {
    const docRef = doc(db, "events", id);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

// Delete event
export const deleteEvent = async (id: string) => {
    const docRef = doc(db, "events", id);
    await deleteDoc(docRef);
};
