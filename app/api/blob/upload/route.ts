// app/api/blob/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
        const blob = await put(`event-banners/${Date.now()}-${file.name}`, file, {
            access: "public",
        });

        return NextResponse.json({ url: blob.url });
    } catch (err) {
        console.error("❌ Upload failed:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
