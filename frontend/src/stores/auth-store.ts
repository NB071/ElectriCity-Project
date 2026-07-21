import { create } from "zustand";

/** Thin session mirror for guards / chrome. Profile data stays in React Query (`useMe`). */
export type AuthUser = {
    user_id: number;
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
};

export type AuthStatus = "unknown" | "authenticated" | "guest";

type AuthState = {
    user: AuthUser | null;
    status: AuthStatus;

    setUser: (user: AuthUser | null) => void;
    setStatus: (status: AuthStatus) => void;
    clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: {
        user_id: 1,
        email: "admin@electricity.com",
        role: "admin",
        first_name: "Admin",
        last_name: "User",
    },
    status: "authenticated",

    setUser: (user) =>
        set({
            user,
            status: user ? "authenticated" : "guest",
        }),

    setStatus: (status) => set({ status }),

    clear: () => set({ user: null, status: "guest" }),
}));
