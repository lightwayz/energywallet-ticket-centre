// noinspection JSIgnoredPromiseFromCall

"use client";

import { useState } from "react";

export default function AiConcierge() {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const speak = (text: string) => {
        try {
            const speechUtterance = new SpeechSynthesisUtterance(text);
            speechUtterance.rate = 1.05;
            window.speechSynthesis.speak(speechUtterance);
        } catch {}
    };

    const ask = async (message: string) => {
        setBusy(true);
        setLog((l) => [...l, `You: ${message}`]);
        try {
            const res = await fetch("/api/ai/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            const reply = data?.reply || "No answer.";
            setLog((l) => [...l, `AI: ${reply}`]);
            speak(reply);
        } catch {
            setLog((l) => [...l, "AI: Sorry, request failed."]);
        } finally {
            setBusy(false);
        }
    };

    const startVoice = () => {
        const SR =
            typeof window !== "undefined" &&
            ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

        if (!SR) {
            setLog((l) => [...l, "AI: Voice not supported on this browser."]);
            return;
        }

        const rec = new SR();
        rec.interimResults = false;
        rec.lang = "en-US";
        rec.onresult = (e: any) => {
            const text = e.results[0][0].transcript;
            ask(text);
        };
        rec.onerror = () => setLog((l) => [...l, "AI: Voice error."]);
        rec.start();
        setLog((l) => [...l, "🎙️ Listening..."]);
    };

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-50 rounded-full p-3 bg-energy-orange text-energy-black shadow-lg hover:scale-105 transition"
                aria-label="Open AI assistant"
            >
                {open ? "×" : "AI"}
            </button>

            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-[320px] rounded-2xl bg-gray-900 border border-gray-700 shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                        <h3 className="font-semibold text-white">Ticket Concierge</h3>
                        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                            ×
                        </button>
                    </div>
                    <div className="p-4 space-y-2 max-h-[280px] overflow-auto text-sm">
                        {log.length === 0 && (
                            <p className="text-gray-400">
                                Ask things like: “Tell me the price for I Go Save”, “When is Energy Summit?”
                            </p>
                        )}
                        {log.map((line, i) => (
                            <p key={i} className={line.startsWith("You:") ? "text-gray-200" : "text-emerald-300"}>
                                {line}
                            </p>
                        ))}
                    </div>
                    <div className="p-3 flex gap-2 border-t border-gray-800">
                        <button
                            onClick={() => ask("Find ticket details for 'I Go Save'")}
                            disabled={busy}
                            className="px-3 py-2 rounded-lg bg-energy-orange text-energy-black font-semibold disabled:opacity-60"
                        >
                            Ask
                        </button>
                        <button
                            onClick={startVoice}
                            disabled={busy}
                            className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10"
                        >
                            🎙️ Voice
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
