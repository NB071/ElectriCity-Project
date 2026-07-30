import { useRecentlyViewedStore } from "@/stores";
import { VehicleCard } from "@/components/shop/VehicleCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Loader2 } from "lucide-react";
import { useGetVehicleDetailsMany } from "@/hooks/api/catalog/use-vehicles";
import { vehicleDetailsToCatalogListItem } from "@/lib/map-catalog-vehicle";

type RecentlyViewedItemsProps = {
    currentCid?: string;
};

export function RecentlyViewedItems({ currentCid }: RecentlyViewedItemsProps) {
    const { cids } = useRecentlyViewedStore();

    const displayedCids = cids.filter((id) => id !== currentCid);
    const numericCids = displayedCids.map(Number).filter((id) => Number.isFinite(id) && id > 0);
    const detailQueries = useGetVehicleDetailsMany(numericCids);
    const isLoading = detailQueries.some((query) => query.isPending);
    const items = detailQueries
        .map((query) => query.data)
        .filter((vehicle) => vehicle != null)
        .map(vehicleDetailsToCatalogListItem);

    if (displayedCids.length === 0) return null;

    if (!isLoading && items.length === 0) return null;

    return (
        <section className="mt-24 border-t pt-16">
            <h3 className="mb-8 text-2xl font-bold">Recently Viewed Items</h3>
            <div className="px-12">
                {isLoading && items.length === 0 ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : (
                    <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent className="mx-2 my-6">
                            {items.map((item) => (
                                <CarouselItem key={item.id} className="basis-full pl-6 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <VehicleCard item={item} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                )}
            </div>
        </section>
    );
}
