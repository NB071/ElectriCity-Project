import { createFileRoute } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/shop/catalog/CatalogFilters";
import { PaginatedCatalog } from "@/components/shop/catalog/PaginatedCatalog";
import { useEffect } from "react";
import { useCatalogStore } from "@/stores";

type CatalogSearch = {
    brand_id?: number;
    model_id?: number;
    condition?: "new" | "used";
    price_min?: number;
    price_max?: number;
    body_shape?: string;
    q?: string;
};

function optionalNumber(value: unknown) {
    const parsed = Number(value);
    return value !== undefined && value !== "" && Number.isFinite(parsed) ? parsed : undefined;
}

export const Route = createFileRoute("/(shop)/_layout/catalog/")({
    validateSearch: (search: Record<string, unknown>): CatalogSearch => {
        return {
            brand_id: optionalNumber(search.brand_id),
            model_id: optionalNumber(search.model_id),
            condition: search.condition === "new" || search.condition === "used" ? search.condition : undefined,
            price_min: optionalNumber(search.price_min),
            price_max: optionalNumber(search.price_max),
            body_shape: typeof search.body_shape === "string" ? search.body_shape : undefined,
            q: typeof search.q === "string" ? search.q : undefined,
        };
    },
    component: CatalogRouteComponent,
});

function CatalogRouteComponent() {
    const { brand_id, model_id, condition, price_min, price_max, body_shape, q } = Route.useSearch();
    const setFilters = useCatalogStore((state) => state.setFilters);

    useEffect(() => {
        const next: {
            brand_id?: number;
            model_id?: number;
            condition?: "new" | "used";
            price_min?: number;
            price_max?: number;
            body_shape?: string[];
            q?: string;
        } = {};
        if (brand_id) next.brand_id = brand_id;
        if (model_id) next.model_id = model_id;
        if (condition) next.condition = condition;
        if (price_min != null) next.price_min = price_min;
        if (price_max != null) next.price_max = price_max;
        if (body_shape) next.body_shape = [body_shape];
        if (q?.trim()) next.q = q.trim();
        if (Object.keys(next).length > 0) setFilters(next);
    }, [body_shape, brand_id, condition, model_id, price_max, price_min, q, setFilters]);

    return (
        <div className="bg-background min-h-screen pt-20 pb-24 md:pt-28">
            <div className="mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">New and Used Cars For Sale</h1>
                </div>

                <div className="flex flex-col gap-8 md:flex-row md:items-start lg:gap-10">
                    <aside className="w-full shrink-0 md:w-[320px]">
                        <CatalogFilters />
                    </aside>

                    <main className="w-full min-w-0 flex-1">
                        <PaginatedCatalog />
                    </main>
                </div>
            </div>
        </div>
    );
}
