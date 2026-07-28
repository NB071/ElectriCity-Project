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

// Cached session probe ("GET /api/auth/me").
// Guests get 200 + null; signed-in users get the profile. Relies on httpOnly cookies.
export function useMe(options?: { enabled?: boolean; fields?: string }) {
    const params = options?.fields ? { fields: options.fields } : undefined;

    return useApiQuery<AuthUser | null>({
        queryKey: ["auth", "me", options?.fields ?? null],
        url: AUTH_PATHS.ME,
        params,
        enabled: options?.enabled ?? true,
        retry: shouldRetryAuthQuery,
    });
}

export function useAuthStatus(): { user: AuthUser | null; status: AuthStatus; isLoading: boolean } {
    const { data, isPending, isError, isSuccess } = useMe();

    const status: AuthStatus = isPending
        ? "unknown"
        : isSuccess && data
          ? "authenticated"
          : isError || isSuccess
            ? "guest"
            : "unknown";

    return { user: data ?? null, status, isLoading: isPending };
}
