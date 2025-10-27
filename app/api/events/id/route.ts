import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

/**
 * Update a specific event (admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const { id } = params;
        const { formData, userToken } = await request.json();

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

/**
 * Delete a specific event (admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const { id } = params;
        const { userToken } = await request.json();

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
