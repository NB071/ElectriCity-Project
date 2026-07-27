import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

//Endpoints: [PUT] /api/dashboard/customer/payments/${paymentID}

export const useUpdatePaymentStatus = (attempt_id: string) => {
    return useApiMutation({
        url: `/api/dashboard/customer/payments/${attempt_id}`,
        method: "patch"
    })
};