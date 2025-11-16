"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import Link from "next/link";

type Props = {
    eventId: string;
    eventName: string;
    price: number | string;
};

export default function PurchaseTicket({ eventId, eventName, price }: Props) {
    const cleanAmount = Number(String(price).replace(/[^0-9.]/g, ""));

    const checkoutURL = `/ticketcentre/checkout?eventId=${eventId}&eventName=${encodeURIComponent(
        eventName
    )}&price=${cleanAmount}`;

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center my-8"
        >
            <Link href={checkoutURL}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-energy-orange text-energy-black rounded-2xl
                               font-semibold shadow-md hover:bg-orange-400"
                >
                    Purchase Ticket
                </motion.button>
            </Link>
        </motion.div>
    );
}
