import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/customer/payments, [GET] /api/dashboard/admin/payments

export const useGetCustomerPayments = () => {
    // TODO: implement paginated
};

export const useGetAdminPayments = () => {
    // TODO: implement paginated
};

export const useUpdatePaymentStatus = () => {
    // TODO: implement mutation
};

