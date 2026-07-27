import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [POST] /api/dashboard/customer/wishlist/:id, [DELETE] /api/dashboard/customer/wishlist/:id

export const useAddToWishlist = (id: string) => {
    return useApiMutation({
        url: `/api/dashboard/customer/wishlist/${id}`,
        method: "post"
    })
};

export const useRemoveFromWishlist = (id: string) => {
    return useApiMutation({
        url: `/api/dashboard/customer/wishlist/${id}`,
        method: "delete"
    })
};

