import { useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { AUTH_PATHS } from "@/integrations/axios";
import { meQueryOptions, clearAuthenticatedState } from "@/lib/auth";
import type { AuthUser } from "@/hooks/use-me";
import { toast } from "sonner";

// type(s)

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number?: string | null;
};

export type CartMergeResult = {
    merged: boolean;
    moved_items: number;
    error?: string;
};

export type LoginResponse = {
    user: AuthUser;
    cart_merge?: CartMergeResult;
};

export type RegisterResponse = AuthUser;

export type LogoutResponse = { loggedOut: boolean };
export type LogoutAllResponse = { loggedOutAllDevices: boolean };

export const authKeys = {
    me: ["auth", "me"] as const,
    sessions: ["auth", "sessions"] as const,
};

// hook(s)

// Endpoint: [POST] /api/auth/login
export const useLogin = () => {
    return useApiMutation<LoginResponse, LoginPayload>({
        url: AUTH_PATHS.LOGIN,
        method: "post",
        onSuccess: (data) => {
            queryClient.removeQueries();
            queryClient.setQueryData(meQueryOptions.queryKey, data.user);
            toast.success("Welcome back", {
                description: data.user.first_name ? `Signed in as ${data.user.first_name}` : undefined,
            });
            if (data.cart_merge?.error) {
                toast.warning("Signed in, but your guest cart could not be merged.");
            } else if (data.cart_merge?.merged && data.cart_merge.moved_items > 0) {
                toast.message("Cart updated", {
                    description: `${data.cart_merge.moved_items} item(s) moved from your guest cart.`,
                });
            }
        },
    });
};

// Endpoint: [POST] /api/auth/register
export const useRegister = () => {
    return useApiMutation<RegisterResponse, RegisterPayload>({
        url: "/api/auth/register",
        method: "post",
        onSuccess: () => {
            toast.success("Account created");
        },
    });
};

// Endpoint: [POST] /api/auth/logout (current device only)
export const useLogout = () => {
    return useApiMutation<LogoutResponse, void>({
        url: AUTH_PATHS.LOGOUT,
        method: "post",
        onSuccess: () => {
            toast.success("Signed out");
        },
        onError: (error) => {
            toast.error(error.message || "Could not sign out");
        },
        onSettled: () => {
            clearAuthenticatedState();
        },
    });
};

// Endpoint: [POST] /api/auth/logout-all (every device, including this one)
export const useLogoutAll = () => {
    return useApiMutation<LogoutAllResponse, void>({
        url: AUTH_PATHS.LOGOUT_ALL,
        method: "post",
        onSuccess: () => {
            toast.success("Signed out of all devices");
        },
        onError: (error) => {
            toast.error(error.message || "Could not sign out of all devices");
        },
        onSettled: () => {
            clearAuthenticatedState();
        },
    });
};
