"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isWhitelistedAdmin } from "@/lib/adminWhitelist";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: "admin" | "user" | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    role: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<"admin" | "user" | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u?.email && isWhitelistedAdmin(u.email)) {
                setRole("admin");
            } else {
                setRole("user");
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, role }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
