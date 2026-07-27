import { useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { AUTH_PATHS, clearClientSession } from "@/integrations/axios";
import { useMe, type AuthUser } from "@/hooks/use-me";
import { authKeys } from "./use-auth";

// type(s)

export type UpdateProfilePayload = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string | null;
    current_password?: string;
    new_password?: string;
};

export type DeleteProfilePayload = {
    current_password: string;
};

// hook(s)

// Endpoint: [GET] /api/auth/me
export const useGetProfile = (options?: { enabled?: boolean; fields?: string }) => {
    return useMe(options);
};

// Endpoint: [PATCH] /api/auth/me
export const useUpdateProfile = () => {
    return useApiMutation<AuthUser, UpdateProfilePayload>({
        url: AUTH_PATHS.ME,
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.me });
        },
    });
};

// Endpoint: [DELETE] /api/auth/me (soft delete — the account is deactivated, not purged)
export const useDeleteProfile = () => {
    return useApiMutation<{ deleted: boolean }, DeleteProfilePayload>({
        url: AUTH_PATHS.ME,
        method: "delete",
        onSuccess: () => {
            clearClientSession();
            queryClient.removeQueries();
        },
    });
};
