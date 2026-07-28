import { useApiQuery } from "@/hooks/use-api";
import type { CartResponse } from "./use-cart-mutations";

export const cartKeys = {
    all: ["cart"] as const,
    list: (params: { page: number; limit: number; sort?: string }) => [...cartKeys.all, "list", params] as const,
    summary: (params: { limit: number }) => [...cartKeys.all, "summary", params] as const,
};

export type CartSummaryPreviewItem = {
    cart_item_id: number;
    cid: number;
    name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    primary_image_url: string | null;
};

export type CartSummaryResponse = {
    cart_id: number | null;
    item_count: number;
    quantity_total: number;
    subtotal: number;
    preview: CartSummaryPreviewItem[];
    preview_limit: number;
    session_token: string | null;
    is_guest: boolean;
};

type UseGetCartOptions = {
    enabled?: boolean;
};

// Endpoints: [GET] /api/shop/cart
export const useGetCart = (page: number = 1, limit: number = 10, sort?: string, options?: UseGetCartOptions) => {
    return useApiQuery<CartResponse>({
        queryKey: cartKeys.list({ page, limit, sort }),
        url: "/api/shop/cart",
        method: "get",
        params: { page, limit, ...(sort ? { sort } : {}) },
        enabled: options?.enabled ?? true,
    });
};

// Endpoints: [GET] /api/shop/cart/summary
export const useGetCartSummary = (limit: number = 5, options?: UseGetCartOptions) => {
    return useApiQuery<CartSummaryResponse>({
        queryKey: cartKeys.summary({ limit }),
        url: "/api/shop/cart/summary",
        method: "get",
        params: { limit },
        enabled: options?.enabled ?? true,
    });
};
