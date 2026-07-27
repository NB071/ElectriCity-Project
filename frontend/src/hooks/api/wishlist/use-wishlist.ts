import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/customer/wishlist

export const useGetWishlist = () => {
    return usePaginatedQuery({
        queryKey : ["customer", "wishlist"],
        url: "/api/dashboard/customer/wishlist",
        method: "get"
    })
};

