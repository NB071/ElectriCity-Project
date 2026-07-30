import { useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Car, CarFront, CarTaxiFront, Search, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/stores";
import { useGetBrandModels, useGetBrandsLite } from "@/hooks/api/catalog/use-brands";
import { useGetVehicleFacets } from "@/hooks/api/catalog/use-vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CONDITIONS = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
];

const PRICES = [
    { value: "0-30000", label: "Under $30,000" },
    { value: "30000-50000", label: "$30,000 - $50,000" },
    { value: "50000-80000", label: "$50,000 - $80,000" },
    { value: "80000-", label: "Over $80,000" },
];

const BODY_TYPES = [
    { label: "SUV", icon: Truck },
    { label: "Sedan", icon: Car },
    { label: "Hatchback", icon: CarTaxiFront },
    { label: "Coupe", icon: CarFront },
    { label: "Convertible", icon: CarFront },
    { label: "Truck", icon: Truck },
] satisfies { label: string; icon: LucideIcon }[];

function Hero() {
    const navigate = useNavigate();
    const setFilters = useCatalogStore((state) => state.setFilters);
    const resetStore = useCatalogStore((state) => state.resetStore);
    const [condition, setCondition] = useState("all");
    const [make, setMake] = useState<number | undefined>();
    const [model, setModel] = useState<number | undefined>();
    const [price, setPrice] = useState<string | undefined>();
    const { data: brandsData, isLoading: brandsLoading } = useGetBrandsLite();
    const { data: modelsData, isLoading: modelsLoading } = useGetBrandModels(make);
    const [priceMin, priceMax] = price?.split("-") ?? [];
    const { data: facetsData } = useGetVehicleFacets({
        brand_id: make,
        model_id: model,
        condition: condition === "all" ? undefined : (condition as "new" | "used"),
        price_min: priceMin ? Number(priceMin) : undefined,
        price_max: priceMax ? Number(priceMax) : undefined,
        fields: ["condition"],
    });

    const brands = brandsData?.items ?? [];
    const models = modelsData?.items ?? [];

    function onMakeChange(value: string) {
        setMake(Number(value));
        setModel(undefined);
    }

    function onSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const filters = {
            brand_id: make,
            model_id: model,
            condition: condition === "all" ? undefined : (condition as "new" | "used"),
            price_min: priceMin ? Number(priceMin) : undefined,
            price_max: priceMax ? Number(priceMax) : undefined,
        };

        resetStore();
        setFilters(filters);
        void navigate({ to: "/catalog", search: filters });
    }

    function browseBodyType(bodyShape: string) {
        const filters = {
            condition: condition === "all" ? undefined : (condition as "new" | "used"),
            body_shape: bodyShape,
        };

        resetStore();
        setFilters({ ...filters, body_shape: [bodyShape] });
        void navigate({ to: "/catalog", search: filters });
    }

    return (
        <section className="sticky top-0 overflow-hidden bg-[#54576b] pt-20 text-white">
            {/* Hero image */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <img src="/hero_image.jpg" alt="Hero image" className="size-full object-cover object-center" loading="eager" fetchPriority="high" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-950/80" />
            </div>

            <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 pt-14 pb-20 md:gap-8 md:pt-24 md:pb-32">
                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-white/80">Find cars for sale and for rent near you</p>
                    <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">Find Your Perfect Car</h1>
                </div>

                <Tabs value={condition} onValueChange={setCondition}>
                    <TabsList variant="line">
                        {CONDITIONS.map((c) => (
                            <TabsTrigger
                                key={c.value}
                                value={c.value}
                                className="text-white/70 after:bg-white hover:text-white data-active:text-white"
                            >
                                {c.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <form onSubmit={onSubmit} className="w-full">
                    {/* Mobile: stacked card */}
                    <Card className="text-foreground mx-auto w-full max-w-sm rounded-3xl border-none md:hidden">
                        <CardContent className="p-4">
                            <FieldGroup className="gap-4">
                                <Field>
                                    <FieldLabel htmlFor="hero-make-m" className="text-muted-foreground text-xs">
                                        Any Makes
                                    </FieldLabel>
                                    <Select value={make != null ? String(make) : undefined} onValueChange={onMakeChange}>
                                        <SelectTrigger id="hero-make-m" className="w-full">
                                            <SelectValue placeholder={brandsLoading ? "Loading makes..." : "All Makes"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={String(brand.id)}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="hero-model-m" className="text-muted-foreground text-xs">
                                        Any Models
                                    </FieldLabel>
                                    <Select
                                        value={model != null ? String(model) : undefined}
                                        onValueChange={(value) => setModel(Number(value))}
                                        disabled={make == null || modelsLoading}
                                    >
                                        <SelectTrigger id="hero-model-m" className="w-full">
                                            <SelectValue
                                                placeholder={
                                                    make == null ? "Select a make first" : modelsLoading ? "Loading models..." : "All Models"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {models.map((modelItem) => (
                                                    <SelectItem key={modelItem.id} value={String(modelItem.id)}>
                                                        {modelItem.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="hero-price-m" className="text-muted-foreground text-xs">
                                        Any Price
                                    </FieldLabel>
                                    <Select value={price} onValueChange={setPrice}>
                                        <SelectTrigger id="hero-price-m" className="w-full">
                                            <SelectValue placeholder="All Price" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {PRICES.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Button type="submit" size="sm" className="w-full rounded-full">
                                    <Search data-icon="inline-start" />
                                    Search {facetsData ? `(${facetsData.total})` : ""}
                                </Button>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    {/* Desktop: pill row */}
                    <div className="text-foreground mx-auto hidden h-14 w-full max-w-2xl items-center gap-1 rounded-full bg-white p-1.5 pl-3 shadow-lg md:flex">
                        <Select value={make != null ? String(make) : undefined} onValueChange={onMakeChange}>
                            <SelectTrigger
                                aria-label="Any makes"
                                className="flex-1 border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                            >
                                <SelectValue placeholder={brandsLoading ? "Loading makes..." : "Any Makes"} />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={String(brand.id)}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Separator orientation="vertical" />
                        <Select
                            value={model != null ? String(model) : undefined}
                            onValueChange={(value) => setModel(Number(value))}
                            disabled={make == null || modelsLoading}
                        >
                            <SelectTrigger
                                aria-label="Any models"
                                className="flex-1 border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                            >
                                <SelectValue placeholder={make == null ? "Select make" : modelsLoading ? "Loading models..." : "Any Models"} />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    {models.map((modelItem) => (
                                        <SelectItem key={modelItem.id} value={String(modelItem.id)}>
                                            {modelItem.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Separator orientation="vertical" />
                        <Select value={price} onValueChange={setPrice}>
                            <SelectTrigger
                                aria-label="Any price"
                                className="flex-1 border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                            >
                                <SelectValue placeholder="Any Price" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    {PRICES.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button type="submit" size="lg" className="m-auto h-11 shrink-0 rounded-full px-5">
                            <Search data-icon="inline-start" />
                            Search {facetsData ? `(${facetsData.total})` : ""}
                        </Button>
                    </div>
                </form>

                <div className="flex w-full flex-col items-center gap-4">
                    <p className="text-sm text-white/90">Featured body styles</p>
                    <ScrollArea className="w-full" scrollHideDelay={100} about="Featured models">
                        <div className="mx-auto flex w-max gap-3 px-1 pb-2">
                            {BODY_TYPES.map(({ label, icon: Icon }) => (
                                <Button
                                    key={label}
                                    type="button"
                                    variant="secondary"
                                    onClick={() => browseBodyType(label)}
                                    className={cn(
                                        "rounded-full border-white/20 bg-white/15 text-white backdrop-blur-md transition-all duration-500",
                                        "hover:bg-white/25 aria-expanded:bg-white/25"
                                    )}
                                >
                                    <Icon data-icon="inline-start" />
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="opacity-0" />
                    </ScrollArea>
                </div>
            </div>
        </section>
    );
}

export { Hero };
