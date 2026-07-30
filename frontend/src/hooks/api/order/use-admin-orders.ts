import { useApiMutation, useApiQuery, usePaginatedQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { toast } from "sonner";
import type { CustomerOrderDetail } from "@/hooks/api/order/use-customer-orders";

// Endpoints:
// [GET] /api/dashboard/admin/orders
// [GET] /api/dashboard/admin/orders/:orderId
// [PATCH] /api/dashboard/admin/orders/:orderId/status
// [PATCH] /api/dashboard/admin/orders/:orderId/payment-status

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUSES = ["unpaid", "paid", "failed"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Allowed admin order_status transitions (mirrors backend VALIDATIONS.ORDER_STATUS_TRANSITIONS). */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

/** Allowed payment_status transitions (mirrors backend VALIDATIONS.PAYMENT_STATUS_TRANSITIONS). */
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
    unpaid: ["paid", "failed"],
    failed: ["paid", "unpaid"],
    paid: [],
};

export type AdminOrderListItem = {
    order_id: number;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    subtotal: number;
    tax: number;
    total: number;
    item_count: number;
    created_at: string;
    updated_at: string;
    user_id: number | null;
    guest_email: string | null;
    user?: {
        user_id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
};

export type AdminOrderDetail = CustomerOrderDetail & {
    user_id: number | null;
    guest_email: string | null;
    user?: {
        user_id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
};

type UpdateOrderStatusPayload = {
    order_status: OrderStatus;
};

type UpdateOrderStatusResponse = {
    order_id: number;
    order_status: OrderStatus;
};

type UpdatePaymentStatusPayload = {
    payment_status: PaymentStatus;
};

type UpdatePaymentStatusResponse = {
    order_id: number;
    payment_status: PaymentStatus;
};

const adminOrderKeys = {
    all: ["admin", "orders"] as const,
    list: (page: number, limit: number) => [...adminOrderKeys.all, "list", { page, limit }] as const,
    detail: (orderId: number | string) => [...adminOrderKeys.all, "detail", orderId] as const,
};

function isOrderStatus(value: string): value is OrderStatus {
    return (ORDER_STATUSES as readonly string[]).includes(value);
}

function isPaymentStatus(value: string): value is PaymentStatus {
    return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

/**
 * Returns order statuses an admin may move to from the current state.
 * Shipped/delivered also require payment_status === paid (backend ConflictError otherwise).
 */
export function getAllowedOrderStatusTransitions(
    orderStatus: string,
    paymentStatus: string,
): OrderStatus[] {
    if (!isOrderStatus(orderStatus)) {
        return [];
    }

    const allowed = ORDER_STATUS_TRANSITIONS[orderStatus];
    return allowed.filter((status) => {
        if (status === "shipped" || status === "delivered") {
            return paymentStatus === "paid";
        }
        return true;
    });
}

/** Returns payment statuses an admin may move to from the current state. */
export function getAllowedPaymentStatusTransitions(paymentStatus: string): PaymentStatus[] {
    if (!isPaymentStatus(paymentStatus)) {
        return [];
    }
    return [...PAYMENT_STATUS_TRANSITIONS[paymentStatus]];
}

export const useGetAdminOrders = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<AdminOrderListItem>({
        queryKey: adminOrderKeys.all,
        url: "/api/dashboard/admin/orders",
        method: "get",
        page,
        limit,
    });
};

export const useGetAdminOrderById = (id: string | number, enabled: boolean = true) => {
    return useApiQuery<AdminOrderDetail>({
        queryKey: adminOrderKeys.detail(id),
        url: `/api/dashboard/admin/orders/${id}`,
        method: "get",
        enabled: enabled && id !== "" && id != null,
    });
};

export const useUpdateAdminOrderStatus = () => {
    return useApiMutation<UpdateOrderStatusResponse, UpdateOrderStatusPayload>({
        url: "/api/dashboard/admin/orders",
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
            toast.success("Order status updated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not update order status");
        },
    });
};

export const updateAdminOrderStatusVariables = (orderId: number | string, orderStatus: OrderStatus) => ({
    url: `/api/dashboard/admin/orders/${orderId}/status`,
    body: { order_status: orderStatus } satisfies UpdateOrderStatusPayload,
});

export const useUpdateAdminOrderPaymentStatus = () => {
    return useApiMutation<UpdatePaymentStatusResponse, UpdatePaymentStatusPayload>({
        url: "/api/dashboard/admin/orders",
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
            toast.success("Payment status updated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not update payment status");
        },
    });
};

export const updateAdminOrderPaymentStatusVariables = (
    orderId: number | string,
    paymentStatus: PaymentStatus,
) => ({
    url: `/api/dashboard/admin/orders/${orderId}/payment-status`,
    body: { payment_status: paymentStatus } satisfies UpdatePaymentStatusPayload,
});

export { adminOrderKeys };
