import { useState } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/stores";
import { VehicleCard, type CatalogListItem } from "@/components/shop/VehicleCard";
import { SimplePagination } from "@/components/data-table/simple-pagination";
import { QueryError } from "@/components/common/QueryError";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type SortValue } from "@/zod/browse-catalog";
import { useBrowseVehicles, useSearchVehicles } from "@/hooks/api/catalog/use-vehicles";
import { toBrowseFilters, toCatalogListItem } from "@/lib/map-catalog-vehicle";

const PAGE_SIZE = 6;

export function PaginatedCatalog() {
    const filters = useCatalogStore((state) => state.filters);
    const setSort = useCatalogStore((state) => state.setSort);

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

    const searchQuery = filters.q?.trim() ?? "";
    const isSearching = searchQuery.length > 0;
    const browseFilters = toBrowseFilters(filters);
    const filtersSignature = JSON.stringify({ ...browseFilters, q: searchQuery });

    const [prevFiltersSignature, setPrevFiltersSignature] = useState(filtersSignature);
    const filtersChanged = filtersSignature !== prevFiltersSignature;

    if (filtersChanged) {
        setPrevFiltersSignature(filtersSignature);
        setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    }

    const pageIndex = filtersChanged ? 0 : pagination.pageIndex;
    const page = pageIndex + 1;

    const browseQuery = useBrowseVehicles(browseFilters, page, PAGE_SIZE, { enabled: !isSearching });
    const searchQueryResult = useSearchVehicles(searchQuery, browseFilters, page, PAGE_SIZE, { enabled: isSearching });

    const active = isSearching ? searchQueryResult : browseQuery;
    const { data, isLoading, isError, error, refetch, isFetching } = active;

    const items = (data?.items ?? [])
        .map((vehicle) => toCatalogListItem(vehicle, filters.promo))
        .filter((item): item is CatalogListItem => item != null);

    const total = data?.pagination.total ?? 0;
    const from = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
    const to = Math.min((pageIndex + 1) * PAGE_SIZE, total);
    return (
        <div className="flex h-full w-full flex-col">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-foreground text-sm font-medium">
                    {isLoading ? "Loading vehicles..." : `Showing ${from} to ${to} of ${total} vehicles`}
                </p>
                <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">Sort by</span>
                    <Select value={filters.sort || "added_desc"} onValueChange={(val) => setSort(val as SortValue)}>
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

            {isLoading ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
            ) : isError ? (
                <QueryError
                    title="Couldn't load vehicles"
                    message="We couldn't load the catalog right now."
                    error={error}
                    onRetry={() => void refetch()}
                    isRetrying={isFetching}
                />
            ) : items.length === 0 ? (
                <div className="bg-muted/20 border-muted flex w-full flex-col items-center justify-center rounded-2xl border border-dashed py-24">
                    <p className="text-lg font-medium">No vehicles found</p>
                    <p className="text-muted-foreground mt-1 text-sm">Try adjusting your filters to find what you're looking for.</p>
                </div>
            ) : (
                <CatalogResults
                    items={items}
                    total={total}
                    pagination={{ ...pagination, pageIndex }}
                    onPaginationChange={setPagination}
                    isFetching={isFetching}
                />
            )}
        </div>
    );
}

type CatalogResultsProps = {
    items: CatalogListItem[];
    total: number;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    isFetching: boolean;
};

function CatalogResults({ items, total, pagination, onPaginationChange, isFetching }: CatalogResultsProps) {
    "use no memo";

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data: items,
        columns: [],
        pageCount: Math.max(1, Math.ceil(total / pagination.pageSize)),
        state: { pagination },
        onPaginationChange,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className={cn("flex flex-col gap-10", isFetching && "opacity-60")}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {items.map((vehicle) => (
                    <VehicleCard key={vehicle.id} item={vehicle} />
                ))}
            </div>

            {total > PAGE_SIZE ? (
                <div className="border-muted/50 flex justify-center border-t pt-8 pb-4">
                    <SimplePagination table={table} totalRows={total} />
                </div>
            ) : null}
        </div>
    );
}
