import { useApiQuery, useApiMutation, usePaginatedQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import type { AddressFormValues } from "@/zod/address";
import { toast } from "sonner";

export type AddressResponse = AddressFormValues & {
    address_id: number;
    created_at: string;
    updated_at: string;
};

export const addressKeys = {
    all: ["addresses"] as const,
    detail: (id: string | number) => [...addressKeys.all, id] as const,
};

// Endpoints: [GET] /api/auth/me/addresses
export const useGetMyAddresses = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<AddressResponse>({
        queryKey: addressKeys.all,
        url: "/api/auth/me/addresses",
        page,
        limit,
    });
};

// Endpoints: [GET] /api/auth/me/addresses/:addressId
export const useGetMyAddress = (addressId: string | number) => {
    return useApiQuery<AddressResponse>({
        queryKey: addressKeys.detail(addressId),
        url: `/api/auth/me/addresses/${addressId}`,
        method: "get",
        enabled: !!addressId,
    });
};

// Endpoints: [POST] /api/auth/me/addresses
export const useAddMyAddress = () => {
    return useApiMutation<AddressResponse, AddressFormValues>({
        url: "/api/auth/me/addresses",
        method: "post",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            toast.success("Address added");
        },
        onError: (error) => {
            toast.error(error.message || "Could not add address");
        },
    });
};

// Endpoints: [PATCH] /api/auth/me/addresses/:addressId
export const useUpdateMyAddress = (addressId: string | number) => {
    return useApiMutation<AddressResponse, Partial<AddressFormValues>>({
        url: `/api/auth/me/addresses/${addressId}`,
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            queryClient.invalidateQueries({ queryKey: addressKeys.detail(addressId) });
            toast.success("Address updated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not update address");
        },
    });
};

// Endpoints: [DELETE] /api/auth/me/addresses/:addressId
export const useDeleteMyAddress = (addressId: string | number) => {
    return useApiMutation<{ success: boolean }, void>({
        url: `/api/auth/me/addresses/${addressId}`,
        method: "delete",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            toast.success("Address removed");
        },
        onError: (error) => {
            toast.error(error.message || "Could not remove address");
        },
    });
};

// Endpoints: [PATCH] /api/auth/me/addresses/:addressId/default
export const useSetDefaultMyAddress = (addressId: string | number) => {
    return useApiMutation<{ success: boolean }, void>({
        url: `/api/auth/me/addresses/${addressId}/default`,
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            toast.success("Default address updated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not set default address");
        },
    });
};
