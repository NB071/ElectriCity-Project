import { usePaginatedQuery } from "@/hooks/use-api";
import { reviewKeys, type CustomerReviewDTO } from "./types";

// Endpoint: [GET] /api/dashboard/customer/reviews
export const useGetCustomerReviews = (page: number = 1, limit: number = 10, options?: { enabled?: boolean }) => {
    return usePaginatedQuery<CustomerReviewDTO>({
        queryKey: reviewKeys.customer(),
        url: "/api/dashboard/customer/reviews",
        page,
        limit,
        enabled: options?.enabled ?? true,
    });
};
