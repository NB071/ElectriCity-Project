import { useApiQuery, usePaginatedQuery } from "@/hooks/use-api";
import { useAuthStatus } from "@/hooks/use-me";

// Endpoints:
// [GET] /api/dashboard/customer/wishlist
// [GET] /api/dashboard/customer/wishlist/ids

export type WishlistCatalogItem = {
    cid: number;
    item_type: string;
    name: string;
    base_price: number;
    quantity: number;
    is_active: boolean;
    primary_image_url: string | null;
};

export type WishlistItem = {
    cid: number;
    added_at: string;
    catalog_item: WishlistCatalogItem;
};

export type WishlistIdsResponse = {
    cids: number[];
};

export const wishlistKeys = {
    all: ["customer", "wishlist"] as const,
    ids: () => [...wishlistKeys.all, "ids"] as const,
};

/**
 * Paginated wishlist for the dashboard table (full catalog rows).
 */
export const useGetWishlist = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<WishlistItem>({
        queryKey: wishlistKeys.all,
        url: "/api/dashboard/customer/wishlist",
        method: "get",
        page,
        limit,
        refetchOnMount: true,
    });
};

/**
 * Lightweight wishlist membership set for shop bookmark toggles.
 * Cached aggressively; mutations update this optimistically so cards stay in sync
 * without refetching on every catalog page mount.
 */
export const useGetWishlistIds = () => {
    const { user, status } = useAuthStatus();
    const enabled = status === "authenticated" && user?.role === "customer";

    return useApiQuery<WishlistIdsResponse, Set<number>>({
        queryKey: wishlistKeys.ids(),
        url: "/api/dashboard/customer/wishlist/ids",
        method: "get",
        enabled,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        select: (data) => new Set(data.cids),
    });
};

export const useIsInWishlist = (cid: number | string | null | undefined) => {
    const { data: ids, isPending, isFetching, isError } = useGetWishlistIds();
    const numericCid = cid == null || cid === "" ? null : Number(cid);
    const saved = numericCid != null && !Number.isNaN(numericCid) ? Boolean(ids?.has(numericCid)) : false;

    return {
        saved,
        isPending,
        isFetching,
        isError,
        ids,
    };
};
