import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

        if (!base64) {
            return NextResponse.json({ error: "Missing FIREBASE_SERVICE_ACCOUNT_BASE64" }, { status: 500 });
        }

        const decoded = JSON.parse(
            Buffer.from(base64, "base64").toString("utf-8")
        );

        // ✅ Only show safe, non-sensitive fields
        const { project_id, client_email, private_key_id } = decoded;

        return NextResponse.json({
            project_id,
            client_email,
            private_key_id_present: !!private_key_id,
            success: true,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
