import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/customer/wishlist

export const useGetWishlist = (page : number = 1, limit: number = 20) => {
    return usePaginatedQuery({
        queryKey : ["customer", "wishlist"],
        url: "/api/dashboard/customer/wishlist",
        method: "get",
        page,
        limit
    })
};

