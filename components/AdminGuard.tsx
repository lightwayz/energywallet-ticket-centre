"use client";


import React from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

// import React, { useEffect, useState } from "react";
// import {
//     onAuthStateChanged,
//     setPersistence,
//     browserLocalPersistence,
// } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// import { useRouter, usePathname } from "next/navigation";
// import toast from "react-hot-toast";
//
// export default function AdminGuard({ children }: { children: React.ReactNode }) {
//     const router = useRouter();
//     const pathname = usePathname();
//     const [loading, setLoading] = useState(true);
//     const [authorized, setAuthorized] = useState(false);
//
//     useEffect(() => {
//         setPersistence(auth, browserLocalPersistence).then(() => {
//             const unsubscribe = onAuthStateChanged(auth, (user) => {
//                 const allowedAdmins = ["admin@energywallet.io", "lightways@energywallet.io"];
//
//                 if (user && allowedAdmins.includes(user.email || "")) {
//                     setAuthorized(true);
//
//                     // 🔁 Auto-redirect to dashboard if already logged in
//                     if (pathname === "/admin/login") {
//                         router.push("/dashboard");
//                     }
//                 } else if (!user) {
//                     if (pathname !== "/admin/login") {
//                         toast.error("admin access only");
//                         router.push("/admin/login");
//                     }
//                 }
//
//                 setLoading(false);
//             });
//
//             return () => unsubscribe();
//         });
//     }, [router, pathname]);
//
//     if (loading)
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-black text-white">
//                 <p>Verifying access...</p>
//             </div>
//         );
//
//     return authorized ? <>{children}</> : null;
// }
