import { createFileRoute } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/shop/catalog/CatalogFilters";
import { PaginatedCatalog } from "@/components/shop/catalog/PaginatedCatalog";
import { useEffect } from "react";
import { useCatalogStore } from "@/stores";

type CatalogSearch = {
    brand_id?: string;
};

export const Route = createFileRoute("/(shop)/_layout/catalog/")({
    validateSearch: (search: Record<string, unknown>): CatalogSearch => {
        return {
            brand_id: search.brand_id as string | undefined,
        };
    },
    component: CatalogRouteComponent,
});

function CatalogRouteComponent() {
    const { brand_id } = Route.useSearch();
    const setFilters = useCatalogStore((state) => state.setFilters);

    useEffect(() => {
        // Hydrate initial filters from search parameters if any exist
        if (brand_id) {
            setFilters({ brand_id: Number(brand_id) });
        }
    }, [brand_id, setFilters]);

    return (
        <div className="bg-background min-h-screen pt-20 pb-24 md:pt-28">
            <div className="mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">New and Used Cars For Sale</h1>
                </div>

                <div className="flex flex-col gap-8 md:flex-row md:items-start lg:gap-10">
                    {/* Filter Sidebar */}
                    <aside className="w-full shrink-0 md:w-[320px]">
                        <CatalogFilters />
                    </aside>

                    {/* Main Catalog View */}
                    <main className="w-full min-w-0 flex-1">
                        <PaginatedCatalog />
                    </main>
                </div>
            </div>
        </div>
    );
}
