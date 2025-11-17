"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PurchaseTicket({ eventId, eventName, price }: any) {
    const router = useRouter();

    const goToCheckout = () => {
        router.push(
            `/ticketcentre/checkout?eventId=${eventId}&eventName=${encodeURIComponent(
                eventName
            )}&price=${price}`
        );
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
                rotate: 0,
                transition: { repeat: Infinity, ease: "linear", duration: 6 },
            }}
            className="
                relative px-8 py-3 rounded-full font-semibold text-white
                bg-gradient-to-r from-[#FF7A00] via-[#FFA500] to-[#FF7A00]
                shadow-[0_0_25px_rgba(255,165,0,0.5)]
                border border-[#FFB84D]/40
            "
            onClick={goToCheckout}
        >
            Purchase Ticket
        </motion.button>
    );
}
