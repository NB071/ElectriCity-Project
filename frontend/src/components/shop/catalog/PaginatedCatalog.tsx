import { useState, useEffect } from "react";
import { useCatalogStore } from "@/stores";
import { VehicleCard, type CatalogListItem } from "@/components/shop/VehicleCard";
import { SimplePagination } from "@/components/data-table/simple-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type SortValue } from "@/zod/browse-catalog";
import { Loader2 } from "lucide-react";
import { MOCK_VEHICLES } from "./mockVehicles";

type PaginationData = {
    total: number;
    limit: number;
    offset: number;
};

export function PaginatedCatalog() {
    const filters = useCatalogStore((state) => state.filters);
    const setSort = useCatalogStore((state) => state.setSort);

    const [vehicles, setVehicles] = useState<CatalogListItem[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({ total: 0, limit: 6, offset: 0 });
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                params.append("limit", "6");
                params.append("offset", String(pageIndex * 6));

                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        if (Array.isArray(value)) {
                            if (value.length > 0) {
                                params.append(key, value.join(","));
                            }
                        } else {
                            params.append(key, String(value));
                        }
                    }
                });

                // Decide between browse or search endpoint
                const endpoint =
                    filters.q && filters.q.trim().length > 0
                        ? `/api/shop/catalog/vehicles/search?${params.toString()}`
                        : `/api/shop/catalog/vehicles?${params.toString()}`;

                const res = await fetch(endpoint).catch(() => null);
                if (!res || !res.ok) throw new Error("Failed to fetch, falling back to mock data");
                const data = await res.json();

                if (data.success) {
                    setVehicles(data.data.items || []);
                    setPagination(data.data.pagination);
                }
            } catch (err) {
                console.log("Using mock data as fallback");
                await new Promise((r) => setTimeout(r, 400));

                let mocked = [...MOCK_VEHICLES];
                if (filters.brand_id) {
                    mocked = mocked.filter((v) => v.brand.id === Number(filters.brand_id));
                }
                if (filters.condition) {
                    mocked = mocked.filter((v) => v.vehicle.condition === filters.condition);
                }
                if (filters.promo) {
                    mocked = mocked.filter((v) => v.category === filters.promo);
                }
                if (filters.q) {
                    const search = filters.q.toLowerCase();
                    mocked = mocked.filter((v) => v.name.toLowerCase().includes(search));
                }
                if (filters.sort) {
                    if (filters.sort === "price_asc") mocked.sort((a, b) => a.base_price - b.base_price);
                    if (filters.sort === "price_desc") mocked.sort((a, b) => b.base_price - a.base_price);
                    if (filters.sort === "year_desc") mocked.sort((a, b) => b.vehicle.year - a.vehicle.year);
                    if (filters.sort === "year_asc") mocked.sort((a, b) => a.vehicle.year - b.vehicle.year);
                    if (filters.sort === "mileage_asc") mocked.sort((a, b) => a.vehicle.mileage - b.vehicle.mileage);
                    if (filters.sort === "mileage_desc") mocked.sort((a, b) => b.vehicle.mileage - a.vehicle.mileage);
                }

                const limit = 6;
                const offset = pageIndex * limit;

                setVehicles(mocked.slice(offset, offset + limit));
                setPagination({ total: mocked.length, limit, offset });
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [filters, pageIndex]);

    useEffect(() => {
        setPageIndex(0);
    }, [filters]);

    const handleSortChange = (val: string) => {
        setSort(val as SortValue);
    };

    return (
        <div className="flex h-full w-full flex-col">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-foreground text-sm font-medium">
                    {loading
                        ? "Loading vehicles..."
                        : `Showing ${vehicles.length > 0 ? pageIndex * 6 + 1 : 0} to ${Math.min((pageIndex + 1) * 6, pagination.total)} of ${pagination.total} vehicles`}
                </p>
                <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">Sort by</span>
                    <Select value={filters.sort || "added_desc"} onValueChange={handleSortChange}>
                        <SelectTrigger className="h-9 w-45 bg-white">
                            <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="added_desc">Best Match</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="year_desc">Year: Newest</SelectItem>
                            <SelectItem value="year_asc">Year: Oldest</SelectItem>
                            <SelectItem value="mileage_asc">Mileage: Lowest</SelectItem>
                            <SelectItem value="mileage_desc">Mileage: Highest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading && vehicles.length === 0 ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
            ) : vehicles.length === 0 ? (
                <div className="bg-muted/20 border-muted flex w-full flex-col items-center justify-center rounded-2xl border border-dashed py-24">
                    <p className="text-lg font-medium">No vehicles found</p>
                    <p className="text-muted-foreground mt-1 text-sm">Try adjusting your filters to find what you're looking for.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {vehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} item={vehicle} saved={false} onToggleSave={() => {}} />
                        ))}
                    </div>

                    {pagination.total > 6 && (
                        <div className="border-muted/50 flex justify-center border-t pt-8 pb-4">
                            <SimplePagination
                                table={
                                    {
                                        getCanPreviousPage: () => pageIndex > 0,
                                        getCanNextPage: () => (pageIndex + 1) * 6 < pagination.total,
                                        previousPage: () => setPageIndex((p) => Math.max(0, p - 1)),
                                        nextPage: () => setPageIndex((p) => p + 1),
                                        getPageCount: () => Math.ceil(pagination.total / 6),
                                        getState: () => ({ pagination: { pageIndex, pageSize: 6 } }),
                                        setPageIndex: (index: number) => setPageIndex(index),
                                        getFilteredRowModel: () => ({ rows: { length: pagination.total } }),
                                    } as any
                                }
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
