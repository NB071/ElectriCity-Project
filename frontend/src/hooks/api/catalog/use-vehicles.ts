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
    promotions: CatalogPromotion[];
    vehicle: VehicleSpecs | null;
};

const vehicleKeys = {
    all: ["vehicles"] as const,
    paginated: (filters: BrowseCatalogFilters, page: number, limit: number) => [...vehicleKeys.all, "paginated", filters, page, limit] as const,
    detail: (cid: number) => [...vehicleKeys.all, cid] as const,
    search: (query: string, filters: BrowseCatalogFilters, page: number, limit: number) => [
        ...vehicleKeys.all,
        "search",
        query,
        filters,
        page,
        limit,
    ] as const,
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
export const useBrowseVehicles = (filters: BrowseCatalogFilters, page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<CatalogVehicle>({
        queryKey: vehicleKeys.paginated(filters, page, limit),
        url: "/api/shop/catalog/vehicles",
        page,
        limit,
        params: toQueryParams(filters),
    });
};

// Endpoints: [GET] /api/shop/catalog/vehicles/search
export const useSearchVehicles = (searchQuery: string, filters: BrowseCatalogFilters = { sort: "added_desc" }, page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<CatalogVehicle>({
        queryKey: vehicleKeys.search(searchQuery, filters, page, limit),
        url: "/api/shop/catalog/vehicles/search",
        page,
        limit,
        params: { q: searchQuery, ...toQueryParams(filters) },
        enabled: searchQuery.trim().length > 0,
    });
};

// Endpoints: [GET] /api/shop/catalog/:cid
export const useGetVehicleDetails = (cid: number) => {
    return useApiQuery<CatalogVehicle>({
        queryKey: vehicleKeys.detail(cid),
        url: `/api/shop/catalog/${cid}`,
        method: "get",
        enabled: Number.isFinite(cid) && cid > 0,
    });
};
