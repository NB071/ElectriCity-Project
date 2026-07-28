import { useApiQuery, usePaginatedQuery } from "@/hooks/use-api";

// Endpoints: [GET] /api/shop/catalog/brands, [GET] /api/shop/catalog/brands/:brandId

export type BrandLogo = {
    media_id: number;
    url: string | null;
    file_type: string | null;
    alt_text: string | null;
};

export type Brand = {
    id: number;
    name: string;
    country: string | null;
    logo: BrandLogo | null;
    is_featured: boolean;
    display_order: number | null;
};

export type BrandDetail = Brand & {
    description: string | null;
    website_url: string | null;
    created_at: string;
    updated_at: string;
};

export type BrandLite = {
    id: number;
    name: string;
};

const brandKeys = {
    all: ["brands"] as const,
    paginated: (page: number, limit: number) => [...brandKeys.all, "paginated", page, limit] as const,
    featured: () => [...brandKeys.all, "featured"] as const,
    lite: () => [...brandKeys.all, "lite"] as const,
    detail: (brandId: number) => [...brandKeys.all, brandId] as const,
};

// Full paginated brand list, ordered by display_order then name
export const useGetBrands = (page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<Brand>({
        queryKey: brandKeys.paginated(page, limit),
        url: "/api/shop/catalog/brands",
        page,
        limit,
    });
};

// Featured brands only, no pagination. Same query key everywhere, so About Us,
// catalog filters, and the footer all share one cached request.
export const useGetFeaturedBrands = () => {
    return useApiQuery<{ items: Brand[] }>({
        queryKey: brandKeys.featured(),
        url: "/api/shop/catalog/brands",
        method: "get",
        params: { is_featured: true },
        staleTime: 1000 * 60 * 30, // brands change rarely, cache for 30 minutes
    });
};

// Lightweight { id, name } pairs for filter dropdowns, no pagination
export const useGetBrandsLite = () => {
    return useApiQuery<{ items: BrandLite[] }>({
        queryKey: brandKeys.lite(),
        url: "/api/shop/catalog/brands",
        method: "get",
        params: { lite: true },
        staleTime: 1000 * 60 * 30,
    });
};

// Endpoints: [GET] /api/shop/catalog/brands/:brandId
export const useGetBrandById = (brandId: number) => {
    return useApiQuery<BrandDetail>({
        queryKey: brandKeys.detail(brandId),
        url: `/api/shop/catalog/brands/${brandId}`,
        method: "get",
        enabled: Number.isFinite(brandId) && brandId > 0,
    });
};
