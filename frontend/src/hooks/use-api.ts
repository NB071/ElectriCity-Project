import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    type InfiniteData,
    type QueryKey,
    type UseInfiniteQueryOptions,
    type UseMutationOptions,
    type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import { apiClient, ApiError } from "@/integrations/axios";
import type { ApiResponse } from "@/integrations/axios";

// types
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 10,
    maxLimit: 100,
} as const;

export type PaginationParams = {
    page?: number;
    limit?: number;
};

export type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export type Paginated<T> = {
    items: T[];
    pagination: PaginationMeta;
};

type ApiQueryOptions<TQueryFnData, TData = TQueryFnData> = Omit<UseQueryOptions<TQueryFnData, ApiError, TData, QueryKey>, "queryKey" | "queryFn"> & {
    queryKey: QueryKey;
    url: string;
    method?: Extract<HttpMethod, "get">;
    params?: AxiosRequestConfig["params"];
    config?: Omit<AxiosRequestConfig, "url" | "method" | "params" | "signal">;
};

type ApiMutationVariables<TBody> = {
    url?: string;
    body?: TBody;
    params?: AxiosRequestConfig["params"];
};

type ApiMutationOptions<TData, TBody, TContext> = Omit<UseMutationOptions<TData, ApiError, ApiMutationVariables<TBody>, TContext>, "mutationFn"> & {
    url: string;
    method?: Exclude<HttpMethod, "get">;
    config?: Omit<AxiosRequestConfig, "url" | "method" | "data" | "params" | "signal">;
};

type PaginatedQueryOptions<TItem, TData = Paginated<TItem>> = Omit<ApiQueryOptions<Paginated<TItem>, TData>, "params"> & {
    page?: number;
    limit?: number;
    params?: Omit<Record<string, unknown>, "page" | "limit">;
};

type InfiniteApiQueryOptions<TItem> = Omit<
    UseInfiniteQueryOptions<Paginated<TItem>, ApiError, InfiniteData<Paginated<TItem>>, QueryKey, number>,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
> & {
    queryKey: QueryKey;
    url: string;
    limit?: number;
    params?: Omit<Record<string, unknown>, "page" | "limit">;
    config?: Omit<AxiosRequestConfig, "url" | "method" | "params" | "signal">;
};

// This function is used to clamp the limit to the maximum limit
function clampLimit(limit: number): number {
    return Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
}

// hook(s)

// This hook is used to fetch data from the API
function useApiQuery<TQueryFnData, TData = TQueryFnData>({
    queryKey,
    url,
    method = "get",
    params,
    config,
    ...queryOptions
}: ApiQueryOptions<TQueryFnData, TData>) {
    return useQuery({
        queryKey,
        queryFn: async ({ signal }): Promise<TQueryFnData> => {
            const { data } = await apiClient.request<ApiResponse<TQueryFnData>>({
                ...config,
                url,
                method,
                params,
                signal,
            });
            return data.data as TQueryFnData;
        },
        ...queryOptions,
    });
}

// This hook is used to fetch paginated data from the API
function usePaginatedQuery<TItem, TData = Paginated<TItem>>({
    queryKey,
    url,
    page = PAGINATION_DEFAULTS.page,
    limit = PAGINATION_DEFAULTS.limit,
    params,
    config,
    ...queryOptions
}: PaginatedQueryOptions<TItem, TData>) {
    const safeLimit = clampLimit(limit);
    const safePage = Math.max(1, page);

    return useApiQuery<Paginated<TItem>, TData>({
        queryKey: [...queryKey, { page: safePage, limit: safeLimit }],
        url,
        params: { ...params, page: safePage, limit: safeLimit },
        config,
        ...queryOptions,
    });
}

// This hook is used to fetch data in an infinite scroll manner
function useInfiniteApiQuery<TItem>({
    queryKey,
    url,
    limit = PAGINATION_DEFAULTS.limit,
    params,
    config,
    ...queryOptions
}: InfiniteApiQueryOptions<TItem>) {
    const safeLimit = clampLimit(limit);

    return useInfiniteQuery({
        queryKey: [...queryKey, { limit: safeLimit }],
        initialPageParam: PAGINATION_DEFAULTS.page,
        queryFn: async ({ pageParam, signal }): Promise<Paginated<TItem>> => {
            const { data } = await apiClient.request<ApiResponse<Paginated<TItem>>>({
                ...config,
                url,
                method: "get",
                params: { ...params, page: pageParam, limit: safeLimit },
                signal,
            });
            return data.data as Paginated<TItem>;
        },
        getNextPageParam: (last) => (last.pagination.hasNext ? last.pagination.page + 1 : undefined),
        ...queryOptions,
    });
}

// This hook is used to mutate data in the API
function useApiMutation<TData = unknown, TBody = unknown, TContext = unknown>({
    url: defaultUrl,
    method = "post",
    config,
    ...mutationOptions
}: ApiMutationOptions<TData, TBody, TContext>) {
    return useMutation({
        mutationFn: async ({ url, body, params }: ApiMutationVariables<TBody> = {}): Promise<TData> => {
            const { data } = await apiClient.request<ApiResponse<TData>>({
                ...config,
                url: url ?? defaultUrl,
                method,
                data: body,
                params,
            });

            if (!data.success) {
                const status = Number.parseInt(data.status, 10) || 500;
                throw new ApiError(data.data.message || "Request failed", {
                    status,
                    code: data.data.code,
                    details: data.data.details,
                    sentryEventId: data.data.sentry_event_id,
                });
            }

            return data.data as TData;
        },
        ...mutationOptions,
    });
}

export { useApiMutation, useApiQuery, useInfiniteApiQuery, usePaginatedQuery };
