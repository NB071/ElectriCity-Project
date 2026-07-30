import { QueryClient } from "@tanstack/react-query";
import type { QueryClientConfig } from "@tanstack/react-query";

const queryClientConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            retry: 3,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: false,
            staleTime: 1000 * 60 * 5, // 5 minute stale time
            gcTime: 1000 * 60 * 10, // 10 minutes Garbage Collection
        },
        mutations: {
            retry: 0,
        },
    },
};

export const queryClient = new QueryClient(queryClientConfig);

export function getContext() {
    return { queryClient };
}
