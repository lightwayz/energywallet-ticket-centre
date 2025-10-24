"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    sendEmailVerification,
    User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export interface AppUser extends FirebaseUser {
    role?: string;
}

interface AuthContextProps {
    user: AppUser | null;
    role: string | null;
    loading: boolean;
    logout: () => Promise<void>;
    googleLogin: () => Promise<void>;
    resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    role: null,
    loading: true,
    logout: async () => {},
    googleLogin: async () => {},
    resendVerification: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const ref = doc(db, "users", firebaseUser.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    setRole(snap.data().role || "user");
                } else {
                    // Default role = user
                    await setDoc(ref, { email: firebaseUser.email, role: "user" });
                    setRole("user");
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
    };

    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const resendVerification = async () => {
        if (auth.currentUser && !auth.currentUser.emailVerified) {
            await sendEmailVerification(auth.currentUser);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, role, loading, logout, googleLogin, resendVerification }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
