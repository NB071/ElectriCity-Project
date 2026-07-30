import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { authKeys, useLogoutAll } from "./use-auth";
import { toast } from "sonner";

// type(s)

export type SessionDTO = {
    session_id: string;
    device_label: string | null;
    ip_address: string | null;
    user_agent: string | null;
    last_seen_at: string;
    created_at: string;
    is_current: boolean;
};

export type SessionListResponse = {
    sessions: SessionDTO[];
};

export type RevokeSessionResponse = {
    revoked: boolean;
};

// hook(s)

// Endpoint: [GET] /api/auth/me/sessions
export const useGetSessions = (options?: { enabled?: boolean }) => {
    return useApiQuery<SessionListResponse, SessionDTO[]>({
        queryKey: authKeys.sessions,
        url: "/api/auth/me/sessions",
        select: (data) => data.sessions,
        enabled: options?.enabled ?? true,
    });
};

// Endpoint: [DELETE] /api/auth/me/sessions/:sessionId
export const useRevokeSession = () => {
    return useApiMutation<RevokeSessionResponse, void>({
        url: "/api/auth/me/sessions",
        method: "delete",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.sessions });
            toast.success("Device signed out");
        },
        onError: (error) => {
            toast.error(error.message || "Could not revoke session");
        },
    });
};

export const revokeSessionVariables = (sessionId: string) => ({
    url: `/api/auth/me/sessions/${sessionId}`,
});

// Endpoint: [POST] /api/auth/logout-all
export const useDeleteSessions = () => {
    return useLogoutAll();
};
