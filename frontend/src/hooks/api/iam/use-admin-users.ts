import { usePaginatedQuery } from "@/hooks/use-api";

// type(s)

export type AdminUserListDTO = {
    user_id: number;
    full_name: string;
    email: string;
    phone_number: string | null;
    role: string;
    is_deleted: boolean;
    created_at: string;
};

export const adminUserKeys = {
    all: ["admin", "users"] as const,
    list: () => [...adminUserKeys.all, "list"] as const,
    search: (q: string) => [...adminUserKeys.all, "search", q] as const,
};

// hook(s)

// Endpoint: [GET] /api/dashboard/admin/users
export const useGetAdminUsers = (page: number = 1, limit: number = 10, options?: { enabled?: boolean }) => {
    return usePaginatedQuery<AdminUserListDTO>({
        queryKey: adminUserKeys.list(),
        url: "/api/dashboard/admin/users",
        page,
        limit,
        enabled: options?.enabled ?? true,
    });
};

// Endpoint: [GET] /api/dashboard/admin/users/search?q=
export const useSearchAdminUsers = (query: string, page: number = 1, limit: number = 10, options?: { enabled?: boolean }) => {
    const q = query.trim();

    return usePaginatedQuery<AdminUserListDTO>({
        queryKey: adminUserKeys.search(q),
        url: "/api/dashboard/admin/users/search",
        page,
        limit,
        params: { q },
        enabled: (options?.enabled ?? true) && q.length > 0,
    });
};
