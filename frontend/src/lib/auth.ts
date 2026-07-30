import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { AUTH_PATHS } from "@/integrations/axios/constants";
import { session } from "@/integrations/axios/session";
import type { ApiError, ApiResponse } from "@/integrations/axios/types";
import { queryClient as appQueryClient } from "@/integrations/tanstack-query/query-client";
import { shouldRetryAuthQuery, type AuthUser } from "@/hooks/use-me";

export const meQueryOptions = queryOptions<AuthUser | null, ApiError>({
    queryKey: ["auth", "me", null],
    queryFn: async ({ signal }) => {
        const { apiClient } = await import("@/integrations/axios/client");
        const { data } = await apiClient.get<ApiResponse<AuthUser | null>>(AUTH_PATHS.ME, { signal });
        return (data.data as AuthUser | null) ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: shouldRetryAuthQuery,
});

/**
 * This helper function ensures that the authenticated user is returned from the query client.
 */
export async function ensureAuthUser(queryClient: QueryClient): Promise<AuthUser | null> {
    try {
        return await queryClient.ensureQueryData(meQueryOptions);
    } catch {
        return null;
    }
}

/**
 * This helper function clears the in-memory client session and React Query cache when auth cookies die
 * (logout, refresh failure on a protected call, account delete).
 */
export function clearAuthenticatedState(): void {
    session.clear();
    appQueryClient.removeQueries();
}

/**
 * This helper function marks the user as a guest when the guest probe fails (/me with no session).
 * Cache guest state, do not clear the cart or redirect from public pages.
 */
export function markAsGuest(): void {
    appQueryClient.setQueryData(meQueryOptions.queryKey, null);
}

/**
 * This helper function handles hard session expiry after a failed refresh on a non-guest request.
 * Redirects to login only when leaving a protected dashboard route.
 */
export function handleSessionExpiry(): void {
    clearAuthenticatedState();

    void import("@/router").then(({ router }) => {
        const href = router.state.location.href;
        if (!href.startsWith("/dashboard")) return;

        void router.navigate({
            to: "/auth/login",
            search: { redirect: safeRedirectPath(href) },
        });
    });
}

/**
 * This helper function returns the dashboard home path for the given user role.
 */
export function dashboardHomeFor(user: Pick<AuthUser, "role"> | null | undefined): "/dashboard/admin" | "/dashboard/customer" {
    return user?.role === "admin" ? "/dashboard/admin" : "/dashboard/customer";
}

/**
 * This helper function returns the safe redirect path for the given value.
 */
export function safeRedirectPath(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (!value.startsWith("/") || value.startsWith("//")) return undefined;
    return value;
}
