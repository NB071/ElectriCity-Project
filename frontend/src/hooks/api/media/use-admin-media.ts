import { useApiMutation, usePaginatedQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { toast } from "sonner";

// Endpoints:
// [GET] /api/dashboard/admin/media
// [POST] /api/dashboard/admin/media
// [DELETE] /api/dashboard/admin/media/:mediaId
// [POST] /api/dashboard/admin/catalog/:cid/media
// [PATCH] /api/dashboard/admin/catalog/:cid/media/:mediaId/primary
// [DELETE] /api/dashboard/admin/catalog/:cid/media/:mediaId

export type AdminMediaListItem = {
    media_id: number;
    url: string;
    file_type: string | null;
    alt_text: string | null;
    uploaded_at: string;
    linked_cid: number | null;
    is_primary: boolean;
};

export type RegisterAdminMediaPayload = {
    url: string;
    file_type: string;
    alt_text?: string | null;
    cid?: number;
    display_order?: number;
    is_primary?: boolean;
};

export type RegisterAdminMediaResponse = {
    media_id: number;
};

export type LinkAdminMediaPayload = {
    media_id: number;
    display_order?: number;
    is_primary?: boolean;
};

export type LinkAdminMediaResponse = {
    cid: number;
    media_id: number;
};

export type SetPrimaryAdminMediaResponse = {
    cid: number;
    media_id: number;
    is_primary: true;
};

export type DeleteAdminMediaResponse = {
    media_id: number;
};

export type UnlinkAdminMediaResponse = {
    cid: number;
    media_id: number;
};

const adminMediaKeys = {
    all: ["admin", "media"] as const,
    list: (page: number, limit: number) => [...adminMediaKeys.all, "list", { page, limit }] as const,
};

export const useGetAdminMedia = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<AdminMediaListItem>({
        queryKey: adminMediaKeys.all,
        url: "/api/dashboard/admin/media",
        method: "get",
        page,
        limit,
    });
};

export const useRegisterAdminMedia = () => {
    return useApiMutation<RegisterAdminMediaResponse, RegisterAdminMediaPayload>({
        url: "/api/dashboard/admin/media",
        method: "post",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminMediaKeys.all });
            toast.success("Media registered");
        },
        onError: (error) => {
            toast.error(error.message || "Could not register media");
        },
    });
};

export const useDeleteAdminMedia = () => {
    return useApiMutation<DeleteAdminMediaResponse, void>({
        url: "/api/dashboard/admin/media",
        method: "delete",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminMediaKeys.all });
            toast.success("Media deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Could not delete media");
        },
    });
};

export const deleteAdminMediaVariables = (mediaId: number | string) => ({
    url: `/api/dashboard/admin/media/${mediaId}`,
});

export const useLinkAdminMedia = () => {
    return useApiMutation<LinkAdminMediaResponse, LinkAdminMediaPayload>({
        url: "/api/dashboard/admin/catalog",
        method: "post",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminMediaKeys.all });
            toast.success("Media linked to catalog item");
        },
        onError: (error) => {
            toast.error(error.message || "Could not link media");
        },
    });
};

export const linkAdminMediaVariables = (
    cid: number | string,
    mediaId: number,
    options?: { display_order?: number; is_primary?: boolean },
) => ({
    url: `/api/dashboard/admin/catalog/${cid}/media`,
    body: {
        media_id: mediaId,
        ...(options?.display_order != null ? { display_order: options.display_order } : {}),
        ...(options?.is_primary != null ? { is_primary: options.is_primary } : {}),
    } satisfies LinkAdminMediaPayload,
});

export const useSetPrimaryAdminMedia = () => {
    return useApiMutation<SetPrimaryAdminMediaResponse, void>({
        url: "/api/dashboard/admin/catalog",
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminMediaKeys.all });
            toast.success("Primary image updated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not set primary image");
        },
    });
};

export const setPrimaryAdminMediaVariables = (cid: number | string, mediaId: number | string) => ({
    url: `/api/dashboard/admin/catalog/${cid}/media/${mediaId}/primary`,
});

export const useUnlinkAdminMedia = () => {
    return useApiMutation<UnlinkAdminMediaResponse, void>({
        url: "/api/dashboard/admin/catalog",
        method: "delete",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminMediaKeys.all });
            toast.success("Media unlinked from catalog item");
        },
        onError: (error) => {
            toast.error(error.message || "Could not unlink media");
        },
    });
};

export const unlinkAdminMediaVariables = (cid: number | string, mediaId: number | string) => ({
    url: `/api/dashboard/admin/catalog/${cid}/media/${mediaId}`,
});

export { adminMediaKeys };
