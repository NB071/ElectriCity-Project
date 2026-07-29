import { useApiQuery, usePaginatedQuery } from "@/hooks/use-api";
import type { BrowseCatalogFilters } from "@/zod/browse-catalog";

// Endpoints: [GET] /api/shop/catalog/vehicles, [GET] /api/shop/catalog/vehicles/search, [GET] /api/shop/catalog/:cid

export type CatalogPromotion = {
    promo_id: number;
    name: string;
    description: string | null;
    discount_amount: number;
};

export type VehicleSpecs = {
    year: number;
    condition: "new" | "used";
    mileage: number;
    exterior_color: string;
    interior_color: string;
    body_shape: string;
    door_count: number;
    drivetrain: string;
};

export type CatalogVehicle = {
    id: number;
    item_type: "vehicle";
    name: string;
    brand: { id: number; name: string };
    model: { id: number; name: string };
    base_price: number;
    stock: number;
    is_active: boolean;
    primary_image_url: string | null;
    /* Browse/search only >> up to 5 preview URLs by display_order */
    image_urls?: string[];
    promotions: CatalogPromotion[];
    vehicle: VehicleSpecs | null;
};

export type CatalogBrandLogo = {
    media_id: number;
    url: string | null;
    file_type: string | null;
    alt_text: string | null;
};

export type CatalogOption = {
    option_id: number;
    name: string;
    price_delta: number;
};

export type CatalogOptionCategory = {
    category_id: number;
    name: string;
    select_type: "SINGLE" | "MULTI";
    options: CatalogOption[];
};

export type CatalogVehicleImage = {
    media_id: number;
    url: string;
    alt_text: string | null;
    display_order: number;
    is_primary: boolean;
};

export type CatalogVehicleDetails = {
    id: number;
    item_type: "vehicle";
    name: string;
    description: string | null;
    base_price: number;
    stock: number;
    is_active: boolean;
    review_count: number;
    avg_rating: number | null;
    brand: {
        id: number;
        name: string;
        country: string | null;
        is_featured: boolean;
        display_order: number | null;
        logo: CatalogBrandLogo | null;
    };
    model: { id: number; name: string; release_year: number | null };
    vehicle: {
        year: number | null;
        condition: "new" | "used";
        mileage: number | null;
        exterior_color: string | null;
        interior_color: string | null;
        body_shape: string | null;
        door_count: number | null;
        drivetrain: string | null;
    };
    equipped_options: CatalogOptionCategory[];
    customizations: CatalogOptionCategory[];
    promotions: CatalogPromotion[];
    history: {
        has_accidents: boolean;
        owners_count: number;
        report: { media_id: number; url: string; alt_text: string | null } | null;
    } | null;
    images: CatalogVehicleImage[];
};

const vehicleKeys = {
    all: ["vehicles"] as const,
    paginated: (filters: BrowseCatalogFilters, page: number, limit: number) => [...vehicleKeys.all, "paginated", filters, page, limit] as const,
    detail: (cid: number) => [...vehicleKeys.all, "detail", cid] as const,
    search: (query: string, filters: BrowseCatalogFilters, page: number, limit: number) =>
        [...vehicleKeys.all, "search", query, filters, page, limit] as const,
};

// arrays (body_shape) get comma-joined, matching the backend's multi-value filter parsing
function toQueryParams(filters: BrowseCatalogFilters) {
    const { body_shape, ...rest } = filters;
    return {
        ...rest,
        ...(body_shape && body_shape.length > 0 ? { body_shape: body_shape.join(",") } : {}),
    };
}

// Endpoints: [GET] /api/shop/catalog/vehicles
export const useBrowseVehicles = (
    filters: BrowseCatalogFilters,
    page: number = 1,
    limit: number = 20,
    options?: { enabled?: boolean }
) => {
    return usePaginatedQuery<CatalogVehicle>({
        queryKey: vehicleKeys.paginated(filters, page, limit),
        url: "/api/shop/catalog/vehicles",
        page,
        limit,
        params: toQueryParams(filters),
        enabled: options?.enabled ?? true,
    });
};

// Endpoints: [GET] /api/shop/catalog/vehicles/search
export const useSearchVehicles = (
    searchQuery: string,
    filters: BrowseCatalogFilters = { sort: "added_desc" },
    page: number = 1,
    limit: number = 20,
    options?: { enabled?: boolean }
) => {
    const trimmed = searchQuery.trim();
    return usePaginatedQuery<CatalogVehicle>({
        queryKey: vehicleKeys.search(trimmed, filters, page, limit),
        url: "/api/shop/catalog/vehicles/search",
        page,
        limit,
        params: { q: trimmed, ...toQueryParams(filters) },
        enabled: (options?.enabled ?? true) && trimmed.length > 0,
    });
};

// Endpoints: [GET] /api/shop/catalog/:cid
export const useGetVehicleDetails = (cid: number) => {
    return useApiQuery<CatalogVehicleDetails>({
        queryKey: vehicleKeys.detail(cid),
        url: `/api/shop/catalog/${cid}`,
        method: "get",
        enabled: Number.isFinite(cid) && cid > 0,
    });
};
