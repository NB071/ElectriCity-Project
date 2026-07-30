import { useApiQuery, usePaginatedQuery } from "@/hooks/use-api";

// Endpoints: [GET] /api/dashboard/customer/payments, [GET] /api/dashboard/admin/payments, [GET] /api/dashboard/admin/payments/:attemptId

export type PaymentMethod = "credit_card" | "debit_card" | "apple_pay";
export type PaymentAttemptStatus = "success" | "failed";

export type CustomerPaymentAttempt = {
    attempt_id: number;
    order_id: number;
    amount: number;
    payment_method: PaymentMethod;
    status: PaymentAttemptStatus;
    attempted_at: string;
};

export type AdminPaymentAttempt = CustomerPaymentAttempt & {
    user_id: number | null;
    user?: {
        user_id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
};

const customerPaymentKeys = {
    all: ["customer", "payments"] as const,
};

const adminPaymentKeys = {
    all: ["admin", "payments"] as const,
    detail: (attemptId: number | string) => [...adminPaymentKeys.all, "detail", attemptId] as const,
};

export const useGetCustomerPayments = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<CustomerPaymentAttempt>({
        queryKey: customerPaymentKeys.all,
        url: "/api/dashboard/customer/payments",
        method: "get",
        page,
        limit,
    });
};

export const useGetAdminPayments = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<AdminPaymentAttempt>({
        queryKey: adminPaymentKeys.all,
        url: "/api/dashboard/admin/payments",
        method: "get",
        page,
        limit,
    });
};

export const useGetAdminPaymentById = (attemptId: number | string, enabled: boolean = true) => {
    return useApiQuery<AdminPaymentAttempt>({
        queryKey: adminPaymentKeys.detail(attemptId),
        url: `/api/dashboard/admin/payments/${attemptId}`,
        method: "get",
        enabled: enabled && attemptId !== "" && attemptId != null,
    });
};
