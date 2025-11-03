import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { put } from "@vercel/blob";

// ✅ Make this route dynamic
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const userToken = req.headers.get("authorization")?.split("Bearer ")[1];

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 🔒 Optional: Verify Firebase Admin/ID token
        if (!userToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = auth.currentUser;
        if (!user) {
            return NextResponse.json({ error: "Invalid user" }, { status: 403 });
        }

        // ✅ Upload file to Vercel Blob
        const blob = await put(`banners/${Date.now()}-${file.name}`, file, {
            access: "public",
        });

        return NextResponse.json({
            success: true,
            url: blob.downloadUrl,
        });
    } catch (err: any) {
        console.error("❌ Blob Upload Error:", err);
        return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
