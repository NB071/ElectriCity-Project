import { useApiQuery } from "@/hooks/use-api";
import { authKeys, useLogoutAll } from "./use-auth";

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

// Endpoint: [POST] /api/auth/logout-all
export const useDeleteSessions = () => {
    return useLogoutAll();
};
