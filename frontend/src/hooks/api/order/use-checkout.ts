import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api";
import { apiClient } from "@/integrations/axios";
import type { ApiResponse } from "@/integrations/axios";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { cartKeys } from "@/hooks/api/cart/use-cart-queries";
import { vehicleKeys } from "@/hooks/api/catalog/use-vehicles";
import { useCheckoutDraftStore } from "@/stores";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CheckoutApiPayload } from "@/lib/checkout";

// Endpoints: [POST] /api/shop/checkout, [POST] /api/shop/checkout/calculate

export type CheckoutCalculateLine = {
    cid: number;
    config_id: number | null;
    quantity: number;
    unit_price: number;
    line_total: number;
};

export type CheckoutCalculateResponse = {
    currency: "CAD";
    province: string;
    tax_rate: number;
    subtotal: number;
    tax: number;
    total: number;
    tax_breakdown: {
        type: string;
        rates: {
            gst: number;
            pst: number;
            hst: number;
            applicable: number;
        };
        amounts: {
            gst: number;
            pst: number;
            hst: number;
            tax: number;
        };
    };
    items: CheckoutCalculateLine[];
};

export type CheckoutLineItem = {
    cid: number;
    config_id: number | null;
    name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
};

export type CheckoutResponse = {
    order_id: number;
    order_status: string;
    payment_status: string;
    subtotal: number;
    tax: number;
    total: number;
    payment: {
        attempt_id: number;
        status: string;
        payment_method: string;
    };
    items: CheckoutLineItem[];
};

export const checkoutKeys = {
    all: ["checkout"] as const,
    calculate: (province: string) => [...checkoutKeys.all, "calculate", province] as const,
    result: ["checkout-data"] as const,
};

type UseCalculateCheckoutOptions = {
    enabled?: boolean;
};

/**
 * Debounced-friendly calculate query. Posts province to the server and returns
 * tax breakdown + totals using the caller's cart session / auth.
 */
export function useCalculateCheckout(province: string, options?: UseCalculateCheckoutOptions) {
    const normalized = province.trim();
    const enabled = (options?.enabled ?? true) && normalized.length > 0;

    return useQuery({
        queryKey: checkoutKeys.calculate(normalized),
        queryFn: async ({ signal }): Promise<CheckoutCalculateResponse> => {
            const { data } = await apiClient.request<ApiResponse<CheckoutCalculateResponse>>({
                url: "/api/shop/checkout/calculate",
                method: "post",
                data: {
                    shipping_address: { province: normalized },
                },
                signal,
            });
            return data.data as CheckoutCalculateResponse;
        },
        enabled,
        placeholderData: (previousData) => previousData,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useCheckout() {
    const navigate = useNavigate();
    const resetDraft = useCheckoutDraftStore((s) => s.reset);

    return useApiMutation<CheckoutResponse, CheckoutApiPayload>({
        url: "/api/shop/checkout",
        method: "post",
        retry: false,
        onSuccess: async (response) => {
            queryClient.setQueryData(checkoutKeys.result, response);
            await Promise.all([
                queryClient.refetchQueries({ queryKey: cartKeys.all, type: "all" }),
                queryClient.refetchQueries({ queryKey: vehicleKeys.all, type: "all" }),
                queryClient.refetchQueries({ queryKey: ["compare"], type: "all" }),
                queryClient.refetchQueries({ queryKey: ["brands"], type: "all" }),
                queryClient.refetchQueries({ queryKey: ["configurations"], type: "all" }),
            ]);
            resetDraft();
            toast.success("Order placed successfully");
            void navigate({ to: "/checkout-success" });
        },
        onError: (error) => {
            toast.error(error.message || "Could not place order");
        },
    });
}
