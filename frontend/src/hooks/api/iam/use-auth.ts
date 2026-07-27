import { useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { AUTH_PATHS, clearClientSession } from "@/integrations/axios";
import type { AuthUser } from "@/hooks/use-me";

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

function resetAuthenticatedCache() {
    queryClient.removeQueries();
}

// hook(s)

// Endpoint: [POST] /api/auth/login
export const useLogin = () => {
    return useApiMutation<LoginResponse, LoginPayload>({
        url: AUTH_PATHS.LOGIN,
        method: "post",
        onSuccess: () => {
            resetAuthenticatedCache();
        },
    });
};

// Endpoint: [POST] /api/auth/register
export const useRegister = () => {
    return useApiMutation<RegisterResponse, RegisterPayload>({
        url: "/api/auth/register",
        method: "post",
    });
};

// Endpoint: [POST] /api/auth/logout (current device only)
export const useLogout = () => {
    return useApiMutation<LogoutResponse, void>({
        url: AUTH_PATHS.LOGOUT,
        method: "post",
        onSettled: () => {
            clearClientSession();
            resetAuthenticatedCache();
        },
    });
};

// Endpoint: [POST] /api/auth/logout-all (every device, including this one)
export const useLogoutAll = () => {
    return useApiMutation<LogoutAllResponse, void>({
        url: AUTH_PATHS.LOGOUT_ALL,
        method: "post",
        onSettled: () => {
            clearClientSession();
            resetAuthenticatedCache();
        },
    });
};
