import { usePaginatedQuery } from "@/hooks/use-api";
import { reviewKeys, type CatalogReviewDTO } from "./types";

// Endpoint: [GET] /api/shop/catalog/:cid/reviews
export const useGetVehicleReviews = (cid: string | number | undefined, page: number = 1, limit: number = 10) => {
    return usePaginatedQuery<CatalogReviewDTO>({
        queryKey: reviewKeys.vehicle(cid ?? ""),
        url: `/api/shop/catalog/${cid}/reviews`,
        page,
        limit,
        enabled: cid != null && cid !== "",
    });
};
