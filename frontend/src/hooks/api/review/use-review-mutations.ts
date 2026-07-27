import { useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { reviewKeys, type PublishReviewResponse } from "./types";

// type(s)

export type SubmitReviewPayload = {
    title?: string | null;
    body: string;
    rating: number; // 1-5, validated server-side
};

// hook(s)

// Endpoint: [POST] /api/shop/catalog/:cid/reviews (customer only)
export const useSubmitReview = (cid: string | number) => {
    return useApiMutation<PublishReviewResponse, SubmitReviewPayload>({
        url: `/api/shop/catalog/${cid}/reviews`,
        method: "post",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.vehicle(cid) });
            queryClient.invalidateQueries({ queryKey: reviewKeys.customer() });
            queryClient.invalidateQueries({ queryKey: ["vehicles", String(cid)] });
        },
    });
};

// Endpoint: [DELETE] /api/dashboard/admin/reviews/:rid (admin only, hard delete)
export const useDeleteAdminReview = () => {
    return useApiMutation<{ review_id: number }, void>({
        url: "/api/dashboard/admin/reviews",
        method: "delete",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.all });
        },
    });
};

export const deleteAdminReviewVariables = (reviewId: number | string) => ({
    url: `/api/dashboard/admin/reviews/${reviewId}`,
});
