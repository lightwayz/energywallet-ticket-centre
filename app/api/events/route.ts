import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";


export async function GET() {
    try {
        const snapshot = await adminDb.collection("events").orderBy("date", "asc").get();
        const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { formData, userToken } = await req.json();
        const decoded = await adminAuth.verifyIdToken(userToken);
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
        const user = userDoc.data();

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const docRef = await adminDb.collection("events").add({
            ...formData,
            date: new Date(formData.date),
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error("Error adding event:", error);
        return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
    }
}
