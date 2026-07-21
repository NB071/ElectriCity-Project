import { useApiQuery, usePaginatedQuery } from "@/hooks/use-api";
import type { BrowseCatalogFilters } from "@/zod/browse-catalog";

// (Mock response type since we don't have a vehicle schema typed yet)
export type VehicleDTO = {
    id: string; // or number depending on backend
    brand: { name: string };
    model: { name: string };
    price: number;
    year: number;
};

const vehicleKeys = {
    all: ["vehicles"] as const,
    paginated: (filters: BrowseCatalogFilters) => [...vehicleKeys.all, "paginated", filters] as const,
    detail: (id: string) => [...vehicleKeys.all, id] as const,
    search: (query: string) => [...vehicleKeys.all, "search", query] as const,
};

// Endpoints: [GET] /api/shop/catalog/vehicles
export const useBrowseVehicles = (filters: BrowseCatalogFilters, page: number = 1, limit: number = 20) => {
    return usePaginatedQuery<VehicleDTO>({
        queryKey: vehicleKeys.paginated(filters),
        url: "/shop/catalog/vehicles",
        page,
        limit,
        params: filters,
        enabled: true,
    });
};

// Endpoints: [GET] /api/shop/catalog/vehicles/search
export const useSearchVehicles = (searchQuery: string) => {
    return useApiQuery<VehicleDTO[]>({
        queryKey: vehicleKeys.search(searchQuery),
        url: "/shop/catalog/vehicles/search",
        method: "get",
        params: { q: searchQuery },
        enabled: searchQuery.length > 2, // only fetch if user typed 3+ chars
    });
};
