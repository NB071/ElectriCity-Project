import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { apiClient, AUTH_PATHS, type ApiError, type ApiResponse } from "@/integrations/axios";
import { shouldRetryAuthQuery, type AuthUser } from "@/hooks/use-me";

export const meQueryOptions = queryOptions<AuthUser, ApiError>({
    queryKey: ["auth", "me", null],
    queryFn: async ({ signal }) => {
        const { data } = await apiClient.get<ApiResponse<AuthUser>>(AUTH_PATHS.ME, { signal });
        return data.data as AuthUser;
    },
    retry: shouldRetryAuthQuery,
});

export async function ensureAuthUser(queryClient: QueryClient): Promise<AuthUser | null> {
    try {
        return await queryClient.ensureQueryData(meQueryOptions);
    } catch {
        return null;
    }
}

export function dashboardHomeFor(user: Pick<AuthUser, "role"> | null | undefined): "/dashboard/admin" | "/dashboard/customer" {
    return user?.role === "admin" ? "/dashboard/admin" : "/dashboard/customer";
}

export function safeRedirectPath(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (!value.startsWith("/") || value.startsWith("//")) return undefined;
    return value;
}
