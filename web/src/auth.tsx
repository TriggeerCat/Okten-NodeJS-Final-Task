import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStorage } from "./api";
import type { AuthResponse, User } from "./types";

interface SignUpData {
    name: string;
    email: string;
    password: string;
    tenant?: string;
}

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    signOut: () => Promise<void>;
    reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        if (!tokenStorage.get()) {
            setUser(null);
            return;
        }
        setUser(await api<User>("/auth/me").catch(() => null));
    }, []);

    useEffect(() => {
        reload().finally(() => setLoading(false));
        const onLogout = () => setUser(null);
        window.addEventListener("auth:logout", onLogout);
        return () => window.removeEventListener("auth:logout", onLogout);
    }, [reload]);

    const onAuth = ({ user, tokens }: AuthResponse) => {
        tokenStorage.set(tokens);
        setUser(user);
    };

    const value: AuthContextValue = {
        user,
        loading,
        reload,
        signIn: async (email, password) =>
            onAuth(await api<AuthResponse>("/auth/sign-in", { method: "POST", body: { email, password } })),
        signUp: async (data) =>
            onAuth(
                await api<AuthResponse>(data.tenant ? "/auth/sign-up-dealer" : "/auth/sign-up", {
                    method: "POST",
                    body: data
                })
            ),
        signOut: async () => {
            await api("/auth/sign-out", { method: "POST" }).catch(() => undefined);
            tokenStorage.set(null);
            setUser(null);
        }
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
