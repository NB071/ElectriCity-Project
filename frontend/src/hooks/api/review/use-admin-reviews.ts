import { useApiQuery, usePaginatedQuery } from "@/hooks/use-api";
import { reviewKeys, type AdminReviewListDTO, type ReviewDetailDTO } from "./types";

// Endpoint: [GET] /api/dashboard/admin/reviews (every review on the platform)
export const useGetAdminReviews = (page: number = 1, limit: number = 10, options?: { enabled?: boolean }) => {
    return usePaginatedQuery<AdminReviewListDTO>({
        queryKey: reviewKeys.admin(),
        url: "/api/dashboard/admin/reviews",
        page,
        limit,
        enabled: options?.enabled ?? true,
    });
};

// Endpoint: [GET] /api/dashboard/admin/reviews/catalog/:cid
export const useGetAdminCatalogReviews = (cid: string | number | undefined, page: number = 1, limit: number = 10) => {
    return usePaginatedQuery<AdminReviewListDTO>({
        queryKey: [...reviewKeys.admin(), "catalog", String(cid ?? "")],
        url: `/api/dashboard/admin/reviews/catalog/${cid}`,
        page,
        limit,
        enabled: cid != null && cid !== "",
    });
};

// Endpoint: [GET] /api/dashboard/admin/reviews/:rid
export const useGetAdminReviewDetail = (rid: string | number | undefined) => {
    return useApiQuery<ReviewDetailDTO>({
        queryKey: reviewKeys.adminDetail(rid ?? ""),
        url: `/api/dashboard/admin/reviews/${rid}`,
        enabled: rid != null && rid !== "",
    });
};
