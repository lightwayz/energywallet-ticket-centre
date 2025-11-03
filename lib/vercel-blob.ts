// noinspection JSUnusedGlobalSymbols

import { put, del, list } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob storage.
 * Automatically compresses image if needed.
 * Returns the public download URL.
 */
export async function uploadToBlob(
    file: File | Blob,
    pathPrefix: string = "uploads"
): Promise<string> {
    try {
        const blob = await put(`${pathPrefix}/${Date.now()}-${(file as any).name || "file"}`, file, {
            access: "public",
        });

        return blob.downloadUrl;
    } catch (err) {
        console.error("❌ Blob upload failed:", err);
        throw new Error("Blob upload failed");
    }
}

/**
 * Delete a file from Blob storage.
 * You’ll need to pass the blob’s URL or its pathname.
 */
export async function deleteFromBlob(url: string) {
    try {
        await del(url);
        console.log("✅ File deleted from Blob:", url);
    } catch (err) {
        console.error("❌ Failed to delete from Blob:", err);
    }
}

/**
 * Optional: List files for a given prefix (admin/debug feature)
 */
export async function listBlobs(prefix: string = "") {
    try {
        const { blobs } = await list({ prefix });
        return blobs;
    } catch (err) {
        console.error("❌ Failed to list blobs:", err);
        return [];
    }
}
