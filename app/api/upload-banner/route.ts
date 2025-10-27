import { put } from "@vercel/blob";

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), {
            status: 400,
        });
    }

    const blob = await put(`event-banners/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
    });

    return new Response(JSON.stringify({ url: blob.url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
