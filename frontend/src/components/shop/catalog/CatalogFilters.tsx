import { useEffect, useState } from "react";
import type { BrowseCatalogFilters } from "@/zod/browse-catalog";
import { useCatalogStore } from "@/stores";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "@/hooks/use-debounced-value";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useGetBrandsLite } from "@/hooks/api/catalog/use-brands";
import { useGetVehicleFacets } from "@/hooks/api/catalog/use-vehicles";

const BODY_SHAPES = ["SUV", "Sedan", "Hatchback", "Coupe", "Convertible", "Truck"];
const DRIVETRAINS = ["AWD", "FWD", "RWD", "4WD"] as const;
const PROMOTIONS = [
    { value: "hot_deal", label: "Hot Deal" },
    { value: "seasonal", label: "Seasonal" },
    { value: "clearance", label: "Clearance" },
    { value: "featured", label: "Featured" },
] as const;
const ANY = "any";

type CatalogFiltersProps = {
    preserveOnClear?: Partial<BrowseCatalogFilters>;
};

export function CatalogFilters({ preserveOnClear }: CatalogFiltersProps = {}) {
    const filters = useCatalogStore((state) => state.filters);
    const setFilters = useCatalogStore((state) => state.setFilters);
    const updateFilter = useCatalogStore((state) => state.updateFilter);
    const clearFilters = useCatalogStore((state) => state.clearFilters);
    const { data: brandsData } = useGetBrandsLite();
    const { data: facetsData } = useGetVehicleFacets({
        ...filters,
        fields: ["body_shape", "promo"],
    });
    const brands = brandsData?.items ?? [];
    const bodyShapeCounts = new Map(facetsData?.body_shape?.map((facet) => [facet.value, facet.count]) ?? []);
    const promotionCounts = new Map(facetsData?.promo?.map((facet) => [facet.value, facet.count]) ?? []);

    const storeQ = filters.q ?? "";
    const [searchInput, setSearchInput] = useState(storeQ);
    const [prevStoreQ, setPrevStoreQ] = useState(storeQ);

    if (storeQ !== prevStoreQ) {
        setPrevStoreQ(storeQ);
        setSearchInput(storeQ);
    }

    const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

    useEffect(() => {
        const next = debouncedSearch.trim();
        updateFilter("q", next.length > 0 ? next : undefined);
    }, [debouncedSearch, updateFilter]);

    function handleClearAll() {
        setSearchInput("");
        clearFilters();
        if (preserveOnClear && Object.keys(preserveOnClear).length > 0) {
            setFilters(preserveOnClear);
        }
    }

    function setOptionalNumber(key: keyof BrowseCatalogFilters, raw: string) {
        if (raw.trim() === "") {
            updateFilter(key, undefined);
            return;
        }
        const n = Number(raw);
        updateFilter(key, Number.isFinite(n) ? (n as never) : undefined);
    }

    return (
        <div className="border-muted sticky top-24 w-full rounded-xl border bg-white p-5">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    {facetsData ? <Badge variant="secondary">{facetsData.total} matches</Badge> : null}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleClearAll} className="text-muted-foreground h-8 text-xs">
                    Clear All
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <Label>Search</Label>
                    <Input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search makes, models..."
                        className="bg-muted/50"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <Label>Brand</Label>
                    <Select
                        value={filters.brand_id != null ? String(filters.brand_id) : ANY}
                        onValueChange={(val) => updateFilter("brand_id", val === ANY ? undefined : Number(val))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>Any Brand</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={String(brand.id)}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-3">
                    <Label>Condition</Label>
                    <Select
                        value={filters.condition ?? ANY}
                        onValueChange={(val) => updateFilter("condition", val === ANY ? undefined : (val as "new" | "used"))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="New and Used" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>New and Used</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-3">
                    <Label>Drivetrain</Label>
                    <Select value={filters.drivetrain ?? ANY} onValueChange={(val) => updateFilter("drivetrain", val === ANY ? undefined : val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any Drivetrain" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>Any Drivetrain</SelectItem>
                            {DRIVETRAINS.map((drivetrain) => (
                                <SelectItem key={drivetrain} value={drivetrain}>
                                    {drivetrain}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Accordion type="multiple" defaultValue={["promotion", "type", "price"]}>
                    <AccordionItem value="promotion" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Promotion</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-3 pt-2">
                                {PROMOTIONS.map((promotion) => {
                                    const checked = (filters.promo ?? []).includes(promotion.value);
                                    return (
                                        <div key={promotion.value} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`promotion-${promotion.value}`}
                                                checked={checked}
                                                onCheckedChange={(isChecked) => {
                                                    const current = filters.promo ?? [];
                                                    const next = isChecked
                                                        ? [...current, promotion.value]
                                                        : current.filter((value) => value !== promotion.value);
                                                    updateFilter("promo", next.length > 0 ? next : undefined);
                                                }}
                                            />
                                            <label
                                                htmlFor={`promotion-${promotion.value}`}
                                                className="text-muted-foreground flex flex-1 items-center justify-between text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                <span>{promotion.label}</span>
                                                <Badge variant="secondary">{promotionCounts.get(promotion.value) ?? 0}</Badge>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="type" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Type</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-3 pt-2">
                                {BODY_SHAPES.map((shape) => {
                                    const checked = (filters.body_shape ?? []).includes(shape);
                                    return (
                                        <div key={shape} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`shape-${shape}`}
                                                checked={checked}
                                                onCheckedChange={(isChecked) => {
                                                    const current = filters.body_shape ?? [];
                                                    const next = isChecked ? [...current, shape] : current.filter((s) => s !== shape);
                                                    updateFilter("body_shape", next.length > 0 ? next : undefined);
                                                }}
                                            />
                                            <label
                                                htmlFor={`shape-${shape}`}
                                                className="text-muted-foreground flex flex-1 items-center justify-between text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                <span>{shape}</span>
                                                <Badge variant="secondary">{bodyShapeCounts.get(shape) ?? 0}</Badge>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="year" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Year</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-4 pt-2 pb-1">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={filters.year_min ?? ""}
                                        onChange={(e) => setOptionalNumber("year_min", e.target.value)}
                                        placeholder="Min year"
                                        className="bg-muted/50 h-10 text-sm"
                                    />
                                    <span className="text-muted-foreground px-1 text-xs font-medium">to</span>
                                    <Input
                                        type="number"
                                        value={filters.year_max ?? ""}
                                        onChange={(e) => setOptionalNumber("year_max", e.target.value)}
                                        placeholder="Max year"
                                        className="bg-muted/50 h-10 text-sm"
                                    />
                                </div>
                                <Slider
                                    min={1990}
                                    max={new Date().getFullYear() + 1}
                                    step={1}
                                    value={[
                                        filters.year_min ? Number(filters.year_min) : 1990,
                                        filters.year_max ? Number(filters.year_max) : new Date().getFullYear() + 1,
                                    ]}
                                    onValueChange={(val) => {
                                        setFilters({ year_min: val[0], year_max: val[1] });
                                    }}
                                    className="px-1"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="mileage" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Mileage</AccordionTrigger>
                        <AccordionContent>
                            <div className="pt-2">
                                <Select
                                    value={filters.mileage_max != null ? String(filters.mileage_max) : ANY}
                                    onValueChange={(val) => updateFilter("mileage_max", val === ANY ? undefined : Number(val))}
                                >
                                    <SelectTrigger className="bg-muted/50 w-full">
                                        <SelectValue placeholder="Any Mileage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ANY}>Any Mileage</SelectItem>
                                        <SelectItem value="10000">Under 10,000 miles</SelectItem>
                                        <SelectItem value="30000">Under 30,000 miles</SelectItem>
                                        <SelectItem value="60000">Under 60,000 miles</SelectItem>
                                        <SelectItem value="100000">Under 100,000 miles</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="price" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Price</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-4 pt-2 pb-1">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={filters.price_min ?? ""}
                                        onChange={(e) => setOptionalNumber("price_min", e.target.value)}
                                        placeholder="Min price"
                                        className="bg-muted/50 h-10 text-sm"
                                    />
                                    <span className="text-muted-foreground px-1 text-xs font-medium">to</span>
                                    <Input
                                        type="number"
                                        value={filters.price_max ?? ""}
                                        onChange={(e) => setOptionalNumber("price_max", e.target.value)}
                                        placeholder="Max price"
                                        className="bg-muted/50 h-10 text-sm"
                                    />
                                </div>
                                <Slider
                                    min={0}
                                    max={150000}
                                    step={500}
                                    value={[
                                        filters.price_min ? Number(filters.price_min) : 0,
                                        filters.price_max ? Number(filters.price_max) : 150000,
                                    ]}
                                    onValueChange={(val) => {
                                        setFilters({ price_min: val[0], price_max: val[1] });
                                    }}
                                    className="px-1"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
