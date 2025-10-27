import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { formData, userToken } = await req.json();
        const decoded = await adminAuth.verifyIdToken(userToken);
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

        if (userDoc.data()?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        await adminDb.collection("events").doc(params.id).update(formData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { userToken } = await req.json();
        const decoded = await adminAuth.verifyIdToken(userToken);
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

        if (userDoc.data()?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        await adminDb.collection("events").doc(params.id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
