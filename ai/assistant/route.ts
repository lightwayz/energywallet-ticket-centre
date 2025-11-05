// noinspection JSUnusedGlobalSymbols

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";


export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const snap = await getDocs(collection(db, "events"));
        const events = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

        // naive match
        const found = events.find(e => {
            const title = (e.title || "").toString().toLowerCase();
            return message?.toLowerCase().includes(title);
        });

        if (found) {
            const price = String(found.price ?? "").replace(/[^\d.]/g, "");
            const reply = `I found "${found.title}" in ${found.location}. It’s on ${found.date?.toDate ? found.date.toDate().toLocaleString() : "a scheduled date"}. Ticket price is ₦${price || "—"}. Want me to open purchase for it?`;
            return NextResponse.json({ reply, event: { id: found.id, title: found.title, price: price ? Number(price) : 0 }});
        }

        return NextResponse.json({ reply: "I couldn't find that event. Try the exact title shown in the list."});
    } catch (e) {
        return NextResponse.json({ reply: "Sorry, something went wrong."}, { status: 500 });
    }
}
