import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [POST] /api/shop/checkout

export const useCheckout = () => {
    return useApiMutation({
        url: "/api/shop/checkout",
        method: "post"
    })
};

