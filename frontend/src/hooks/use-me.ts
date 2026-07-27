import { AUTH_PATHS } from "@/integrations/axios";
import type { ApiError } from "@/integrations/axios";
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

export type AuthStatus = "unknown" | "authenticated" | "guest";

export function shouldRetryAuthQuery(failureCount: number, error: ApiError): boolean {
    if (error.status === 401 || error.status === 403) return false;
    return failureCount < 2;
}

// Cached profile for the signed-in user ("GET /api/auth/me").
// Relies on httpOnly "access_token" cookie and/or Authorization header via "apiClient".
export function useMe(options?: { enabled?: boolean; fields?: string }) {
    const params = options?.fields ? { fields: options.fields } : undefined;

    return useApiQuery<AuthUser>({
        queryKey: ["auth", "me", options?.fields ?? null],
        url: AUTH_PATHS.ME,
        params,
        enabled: options?.enabled ?? true,
        retry: shouldRetryAuthQuery,
    });
}

export function useAuthStatus(): { user: AuthUser | null; status: AuthStatus; isLoading: boolean } {
    const { data, isPending, isError } = useMe();

    const status: AuthStatus = data ? "authenticated" : isError ? "guest" : isPending ? "unknown" : "guest";

    return { user: data ?? null, status, isLoading: isPending };
}
