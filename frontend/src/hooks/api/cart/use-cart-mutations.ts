import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/shop/cart, [POST] /api/shop/cart/items, [PATCH] /api/shop/cart/items/:id, [DELETE] /api/shop/cart

export const useGetCart = () => {
    // TODO: implement query
};

export const useAddToCart = () => {
    // TODO: implement mutation
};

export const useUpdateCartItem = () => {
    // TODO: implement mutation
};

export const useClearCart = () => {
    // TODO: implement mutation
};

