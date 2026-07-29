import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { toast } from "sonner";

// Endpoints: [POST] /api/shop/catalog/configurations, [GET] /api/shop/catalog/configurations/:configId

export type ConfigurationOption = {
    category_id: number;
    category_name: string;
    select_type: "SINGLE" | "MULTI";
    option_id: number;
    name: string;
    price_delta: number;
};

export type Configuration = {
    config_id: number;
    catalog_item_id: number;
    total_price: number;
    created_at: string;
    options: ConfigurationOption[];
};

export type CreateConfigurationBody = {
    cid: number;
    option_ids: number[];
};

const configurationKeys = {
    all: ["configurations"] as const,
    detail: (configId: number) => [...configurationKeys.all, configId] as const,
};

// Endpoints: [POST] /api/shop/catalog/configurations
export const useCreateConfiguration = () => {
    return useApiMutation<Configuration, CreateConfigurationBody>({
        url: "/api/shop/catalog/configurations",
        method: "post",
        onError: (error) => {
            toast.error(error.message || "Could not save configuration");
        },
    });
};

// Endpoints: [GET] /api/shop/catalog/configurations/:configId
export const useGetConfigurationById = (configId: number) => {
    return useApiQuery<Configuration>({
        queryKey: configurationKeys.detail(configId),
        url: `/api/shop/catalog/configurations/${configId}`,
        method: "get",
        enabled: Number.isFinite(configId) && configId > 0,
    });
};
