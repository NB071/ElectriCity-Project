import { useState } from "react";
import { Car, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnderlineLinkButton } from "@/components/common/underline-link-button";
import { QueryError } from "@/components/common/QueryError";
import { EmptyState } from "@/components/common/EmptyState";
import { VehicleCard, type CatalogListItem } from "@/components/shop/VehicleCard";
import { useBrowseVehicles } from "@/hooks/api/catalog/use-vehicles";
import { toCatalogListItem, type PromoCategory } from "@/lib/map-catalog-vehicle";

const TABS = [
    { value: "featured", label: "Featured" },
    { value: "hot_deal", label: "Hot Deals" },
    { value: "seasonal", label: "Seasonal" },
    { value: "clearance", label: "Clearance" },
] as const;

type PromoTab = (typeof TABS)[number]["value"];

const LANDING_PAGE_SIZE = 8;

function Vehicles() {
    const [tab, setTab] = useState<PromoTab>("hot_deal");

    const { data, isLoading, isError, error, refetch, isFetching } = useBrowseVehicles({ promo: [tab], sort: "added_desc" }, 1, LANDING_PAGE_SIZE);

    const items = (data?.items ?? [])
        .map((vehicle) => toCatalogListItem(vehicle, tab as PromoCategory))
        .filter((item): item is CatalogListItem => item != null);

    return (
        <section className="bg-background pb-16 md:pb-24">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <Tabs value={tab} onValueChange={(v) => setTab(v as PromoTab)}>
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col gap-3">
                            <Badge variant="outline" className="text-foreground h-7 w-fit rounded-full bg-white px-3 text-xs font-medium">
                                Vehicles
                            </Badge>
                            <h2 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Explore Vehicle Promotions</h2>
                            <TabsList variant="line" className="mt-2 w-full justify-start sm:w-auto">
                                {TABS.map((t) => (
                                    <TabsTrigger key={t.value} value={t.value}>
                                        {t.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <UnderlineLinkButton
                            to="/catalog/deals"
                            search={{ promo: tab }}
                            lineOffset="after:bottom-1"
                            className="mb-1 self-start md:self-auto"
                        >
                            View All
                        </UnderlineLinkButton>
                    </div>

                    {TABS.map((t) => (
                        <TabsContent key={t.value} value={t.value} className="mt-6">
                            {t.value !== tab ? null : isLoading ? (
                                <div className="flex h-64 w-full items-center justify-center">
                                    <Loader2 className="text-muted-foreground size-6 animate-spin" />
                                </div>
                            ) : isError ? (
                                <QueryError
                                    title="Couldn't load vehicles"
                                    message="We couldn't load vehicle promotions right now."
                                    error={error}
                                    onRetry={() => void refetch()}
                                    isRetrying={isFetching}
                                />
                            ) : items.length > 0 ? (
                                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {items.map((item) => (
                                        <li key={item.id}>
                                            <VehicleCard item={item} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState
                                    icon={Car}
                                    title="No vehicles found"
                                    description={`We currently don't have any vehicles listed for ${t.label.toLowerCase()}.`}
                                    className="border"
                                />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    );
}

export { Vehicles };
