import { AUTH_PATHS } from "@/integrations/axios";
import { useApiQuery } from "@/hooks/use-api";

// type(s)
export type AuthUser = {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    role: string;
    [key: string]: unknown;
};

// Cached profile for the signed-in user ("GET /api/auth/me").
// Relies on httpOnly "access_token" cookie and/or Authorization header via "apiClient".
export function useMe(options?: { enabled?: boolean; fields?: string }) {
    const params = options?.fields ? { fields: options.fields } : undefined;

    return useApiQuery<AuthUser>({
        queryKey: ["auth", "me", options?.fields ?? null],
        url: AUTH_PATHS.ME,
        params,
        enabled: options?.enabled ?? true,
    });
}
