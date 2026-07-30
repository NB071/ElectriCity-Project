import { useApiQuery, usePaginatedQuery } from "@/hooks/use-api";

// Endpoints: [GET] /api/dashboard/customer/orders, [GET] /api/dashboard/customer/orders/:id

export type CustomerOrderListItem = {
    order_id: number;
    order_status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    payment_status: "unpaid" | "paid" | "failed";
    subtotal: number;
    tax: number;
    total: number;
    item_count: number;
    additional_information: string | null;
    created_at: string;
    updated_at: string;
};

export type CustomerOrderDetail = Omit<CustomerOrderListItem, "item_count"> & {
    items: Array<{
        order_item_id: number;
        cid: number;
        config_id: number | null;
        quantity: number;
        unit_price: number;
        line_total: number;
        catalog_item: {
            cid: number;
            item_type: string;
            name: string;
            base_price: number;
            is_active: boolean;
        };
        configuration: {
            config_id: number;
            total_price: number;
            created_at: string;
            options: Array<{
                category_id: number;
                category_name: string;
                select_type: string;
                option_id: number;
                name: string;
                price_delta: number;
            }>;
        } | null;
    }>;
    addresses: Array<{
        address_type: "shipping" | "billing";
        full_name: string;
        phone_number: string | null;
        street: string;
        city: string;
        province: string;
        country: string;
        postal_code: string;
    }>;
    payment_attempts: Array<{
        attempt_id: number;
        order_id: number;
        amount: number;
        payment_method: string;
        status: string;
        attempted_at: string;
    }>;
};

const customerOrderKeys = {
    all: ["customer", "orders"] as const,
    detail: (orderId: number | string) => [...customerOrderKeys.all, "detail", orderId] as const,
};

export const useGetCustomerOrders = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<CustomerOrderListItem>({
        queryKey: customerOrderKeys.all,
        url: "/api/dashboard/customer/orders",
        method: "get",
        page,
        limit,
    });
};

export const useGetCustomerOrderById = (id: string | number, enabled: boolean = true) => {
    return useApiQuery<CustomerOrderDetail>({
        queryKey: customerOrderKeys.detail(id),
        url: `/api/dashboard/customer/orders/${id}`,
        method: "get",
        enabled: enabled && id !== "" && id != null,
    });
};