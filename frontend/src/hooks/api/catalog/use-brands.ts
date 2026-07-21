import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/shop/catalog/brands, [GET] /api/shop/catalog/brands/:brandId

export const useGetBrands = () => {
    // TODO: implement paginated
};

export const useGetBrandById = () => {
    // TODO: implement query
};

