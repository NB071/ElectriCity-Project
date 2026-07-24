import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import type { PaginationMeta } from "@/hooks/use-api";

// Endpoints: [GET] /api/shop/cart, [POST] /api/shop/cart/items, [PATCH] /api/shop/cart/items/:id, [DELETE] /api/shop/cart/items/:id, [DELETE] /api/shop/cart

export type CartConfigurationOption = {
    category_id: number;
    category_name: string;
    select_type: "SINGLE" | "MULTI";
    option_id: number;
    name: string;
    price_delta: number;
};

export type CartConfiguration = {
    config_id: number;
    total_price: number;
    created_at: string;
    options: CartConfigurationOption[];
};

export type CartCatalogItemPromotion = {
    promo_id: number;
    name: string;
    description: string;
    discount_amount: number;
};

export type CartCatalogItem = {
    cid: number;
    item_type: string;
    name: string;
    base_price: number;
    stock: number;
    is_active: boolean;
    primary_image_url: string | null;
    promotions: CartCatalogItemPromotion[];
};

export type CartLine = {
    cart_item_id: number;
    cid: number;
    config_id: number | null;
    quantity: number;
    added_at: string;
    unit_price: number;
    line_total: number;
    catalog_item: CartCatalogItem;
    configuration: CartConfiguration | null;
};

export type CartResponse = {
    cart_id: number | null;
    items: CartLine[];
    pagination: PaginationMeta;
    sort: string;
    session_token: string | null;
    is_guest: boolean;
};

export type AddToCartBody = {
    cid: number;
    config_id?: number | null;
    quantity?: number;
};

export type UpdateCartItemBody = {
    quantity: number;
};

export type RemoveCartItemResponse = {
    cart_item_id: number;
    cid: number;
    session_token: string | null;
    is_guest: boolean;
};

export type ClearCartResponse = {
    cleared: true;
    session_token: string | null;
    is_guest: boolean;
};

const cartKeys = {
    all: ["cart"] as const,
    list: (params: { page: number; limit: number; sort?: string }) => [...cartKeys.all, "list", params] as const,
};

// Endpoints: [GET] /api/shop/cart
export const useGetCart = (page: number = 1, limit: number = 10, sort?: string) => {
    return useApiQuery<CartResponse>({
        queryKey: cartKeys.list({ page, limit, sort }),
        url: "/api/shop/cart",
        method: "get",
        params: { page, limit, ...(sort ? { sort } : {}) },
    });
};

// Endpoints: [POST] /api/shop/cart/items
export const useAddToCart = () => {
    return useApiMutation<CartLine, AddToCartBody>({
        url: "/api/shop/cart/items",
        method: "post",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

// Endpoints: [PATCH] /api/shop/cart/items/:cartItemId
// pass the item id in the url when calling mutate
export const useUpdateCartItem = () => {
    return useApiMutation<CartLine, UpdateCartItemBody>({
        url: "/api/shop/cart/items",
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

// Endpoints: [DELETE] /api/shop/cart/items/:cartItemId
// pass the item id in the url when calling mutate
export const useRemoveCartItem = () => {
    return useApiMutation<RemoveCartItemResponse, void>({
        url: "/api/shop/cart/items",
        method: "delete",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

// Endpoints: [DELETE] /api/shop/cart
export const useClearCart = () => {
    return useApiMutation<ClearCartResponse, void>({
        url: "/api/shop/cart",
        method: "delete",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};
