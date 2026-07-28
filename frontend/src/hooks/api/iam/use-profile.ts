import { useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { AUTH_PATHS } from "@/integrations/axios";
import { clearAuthenticatedState } from "@/lib/auth";
import { useMe, type AuthUser } from "@/hooks/use-me";
import { authKeys } from "./use-auth";
import { toast } from "sonner";

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
            toast.success("Profile updated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not update profile");
        },
    });
};

// Endpoint: [DELETE] /api/auth/me (soft delete, the account is deactivated, not purged)
export const useDeleteProfile = () => {
    return useApiMutation<{ deleted: boolean }, DeleteProfilePayload>({
        url: AUTH_PATHS.ME,
        method: "delete",
        onSuccess: () => {
            clearAuthenticatedState();
            toast.success("Account deactivated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not deactivate account");
        },
    });
};
