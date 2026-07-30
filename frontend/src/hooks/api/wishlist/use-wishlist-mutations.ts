import { useApiMutation } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { toast } from "sonner";
import { wishlistKeys, type WishlistIdsResponse } from "@/hooks/api/wishlist/use-wishlist";

// Endpoints: [POST] /api/dashboard/customer/wishlist, [DELETE] /api/dashboard/customer/wishlist/:cid

type AddToWishlistPayload = {
    cid: number;
};

type WishlistEntryResponse = {
    user_id: number;
    cid: number;
    added_at: string;
};

type RemoveFromWishlistResponse = {
    cid: number;
};

type WishlistIdsMutationContext = {
    previousIds: WishlistIdsResponse | undefined;
};

function readWishlistIdsCache() {
    return queryClient.getQueryData<WishlistIdsResponse>(wishlistKeys.ids());
}

function writeWishlistIdsCache(cids: number[]) {
    queryClient.setQueryData<WishlistIdsResponse>(wishlistKeys.ids(), { cids });
}

function addCidToIdsCache(cid: number) {
    const previous = readWishlistIdsCache();
    const next = new Set(previous?.cids ?? []);
    next.add(cid);
    writeWishlistIdsCache([...next]);
    return previous;
}

function removeCidFromIdsCache(cid: number) {
    const previous = readWishlistIdsCache();
    const next = new Set(previous?.cids ?? []);
    next.delete(cid);
    writeWishlistIdsCache([...next]);
    return previous;
}

function invalidateWishlistLists() {
    void queryClient.invalidateQueries({
        queryKey: wishlistKeys.all,
        predicate: (query) => query.queryKey[2] !== "ids",
    });
}

export const useAddToWishlist = () => {
    return useApiMutation<WishlistEntryResponse, AddToWishlistPayload, WishlistIdsMutationContext>({
        url: "/api/dashboard/customer/wishlist",
        method: "post",
        onMutate: async (variables) => {
            const cid = variables.body?.cid;
            if (cid == null) return { previousIds: readWishlistIdsCache() };

            await queryClient.cancelQueries({ queryKey: wishlistKeys.ids() });
            const previousIds = addCidToIdsCache(cid);
            return { previousIds };
        },
        onSuccess: () => {
            invalidateWishlistLists();
            toast.success("Added to wishlist");
        },
        onError: (error, _variables, context) => {
            if (context?.previousIds) {
                queryClient.setQueryData(wishlistKeys.ids(), context.previousIds);
            }
            toast.error(error.message || "Could not add to wishlist");
        },
    });
};

export const addToWishlistVariables = (cid: number) => ({
    body: { cid } satisfies AddToWishlistPayload,
});

export const useRemoveFromWishlist = () => {
    return useApiMutation<RemoveFromWishlistResponse, void, WishlistIdsMutationContext>({
        url: "/api/dashboard/customer/wishlist",
        method: "delete",
        onMutate: async (variables) => {
            const match = variables.url?.match(/\/wishlist\/(\d+)/);
            const cid = match ? Number(match[1]) : NaN;
            if (Number.isNaN(cid)) return { previousIds: readWishlistIdsCache() };

            await queryClient.cancelQueries({ queryKey: wishlistKeys.ids() });
            const previousIds = removeCidFromIdsCache(cid);
            return { previousIds };
        },
        onSuccess: () => {
            invalidateWishlistLists();
            toast.success("Removed from wishlist");
        },
        onError: (error, _variables, context) => {
            if (context?.previousIds) {
                queryClient.setQueryData(wishlistKeys.ids(), context.previousIds);
            }
            toast.error(error.message || "Could not remove from wishlist");
        },
    });
};

export const removeFromWishlistVariables = (cid: number | string) => ({
    url: `/api/dashboard/customer/wishlist/${cid}`,
});
