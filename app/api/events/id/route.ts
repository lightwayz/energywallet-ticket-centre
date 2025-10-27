import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

// 🟢 UPDATE Event
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params; // ✅ unwrap the Promise
        const { formData, userToken } = await req.json();

        // ✅ Verify admin
        const decoded = await adminAuth.verifyIdToken(userToken);
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

        if (userDoc.data()?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await adminDb.collection("events").doc(id).update(formData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// 🔴 DELETE Event
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const { userToken } = await req.json();

        const decoded = await adminAuth.verifyIdToken(userToken);
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

        if (userDoc.data()?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await adminDb.collection("events").doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
