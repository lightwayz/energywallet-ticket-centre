// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
} from "firebase/firestore";

// ✅ Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyChkW3O3Z42PkEjNhSiehuodgKuaUj_x5I",
    authDomain: "energywallet-ticket-centre.firebaseapp.com",
    projectId: "energywallet-ticket-centre",
    storageBucket: "energywallet-ticket-centre.firebasestorage.app",
    messagingSenderId: "645091665529",
    appId: "1:645091665529:web:2f2cb1ef441e347520d6a8",
};

// ✅ Initialize app only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Exports
export const auth = getAuth(app);
export const db = getFirestore(app);
export const eventsCollection = collection(db, "events");

// ✅ Add Event — ensure date is always stored as ISO string
export const addEvent = async (data: any) => {
    const formattedData = {
        ...data,
        date: typeof data.date === "string"
            ? data.date
            : data.date?.seconds
                ? new Date(data.date.seconds * 1000).toISOString()
                : new Date(data.date).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    return addDoc(eventsCollection, formattedData);
};

// ✅ Update Event — ensure date is always ISO string
export const updateEvent = async (id: string, data: any) => {
    const formattedData = {
        ...data,
        date: typeof data.date === "string"
            ? data.date
            : data.date?.seconds
                ? new Date(data.date.seconds * 1000).toISOString()
                : new Date(data.date).toISOString(),
        updatedAt: new Date().toISOString(),
    };
    return updateDoc(doc(db, "events", id), formattedData);
};

// ✅ Delete Event
export const deleteEvent = async (id: string) =>
    await deleteDoc(doc(db, "events", id));

// ✅ Real-time Listener (with timestamp normalization)
export const listenToEvents = (callback: (data: any[]) => void) => {
    const q = query(eventsCollection);
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => {
            const event = doc.data();

            return {
                id: doc.id,
                ...event,
                date: event.date?.seconds
                    ? new Date(event.date.seconds * 1000).toISOString()
                    : event.date,
                createdAt: event.createdAt?.seconds
                    ? new Date(event.createdAt.seconds * 1000).toISOString()
                    : event.createdAt,
                updatedAt: event.updatedAt?.seconds
                    ? new Date(event.updatedAt.seconds * 1000).toISOString()
                    : event.updatedAt,

                // ✅ If location is an object, stringify or format it
                location:
                    typeof event.location === "object"
                        ? Object.values(event.location).join(", ")
                        : event.location || "",
            };
        });

        callback(data);
    });
};
