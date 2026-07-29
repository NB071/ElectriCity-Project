import { createFileRoute } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/shop/catalog/CatalogFilters";
import { PaginatedCatalog } from "@/components/shop/catalog/PaginatedCatalog";
import { useEffect } from "react";
import { useCatalogStore } from "@/stores";

type DealsSearch = {
    promo?: "hot_deal" | "seasonal" | "clearance" | "featured";
    brand_id?: string;
};

export const Route = createFileRoute("/(shop)/_layout/catalog/deals")({
    validateSearch: (search: Record<string, unknown>): DealsSearch => {
        return {
            brand_id: search.brand_id as string | undefined,
            promo: search.promo as DealsSearch["promo"] | undefined,
        };
    },
    component: DealsRouteComponent,
});

function DealsRouteComponent() {
    const { brand_id, promo } = Route.useSearch();
    const setFilters = useCatalogStore((state) => state.setFilters);

    useEffect(() => {
        setFilters({
            brand_id: brand_id ? Number(brand_id) : undefined,
            promo: promo || "hot_deal",
        });

        return () => {
            useCatalogStore.getState().setFilters({ promo: undefined });
        };
    }, [brand_id, promo, setFilters]);

    return (
        <div className="bg-background min-h-screen pt-20 pb-24 md:pt-28">
            <div className="mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">Special Deals & Promotions</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Discover limited-time savings on top electric vehicles right now.</p>
                </div>

                <div className="flex flex-col gap-8 md:flex-row md:items-start lg:gap-10">
                    {/* Filter Sidebar */}
                    <aside className="w-full shrink-0 md:w-[320px]">
                        <CatalogFilters preserveOnClear={{ promo: promo || "hot_deal" }} />
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
