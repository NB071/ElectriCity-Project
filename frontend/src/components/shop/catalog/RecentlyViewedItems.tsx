import { useRecentlyViewedStore } from "@/stores";
import { MOCK_VEHICLES } from "@/components/shop/catalog/mockVehicles";
import { VehicleCard } from "@/components/shop/VehicleCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type RecentlyViewedItemsProps = {
    currentCid?: string;
};

export function RecentlyViewedItems({ currentCid }: RecentlyViewedItemsProps) {
    const { cids } = useRecentlyViewedStore();

    const displayedCids = cids.filter((id) => id !== currentCid);

    if (displayedCids.length === 0) return null;

    const items = displayedCids.map((id) => MOCK_VEHICLES.find((v) => String(v.id) === id)).filter(Boolean) as typeof MOCK_VEHICLES;

    if (items.length === 0) return null;

    return (
        <section className="mt-24 border-t pt-16">
            <h3 className="mb-8 text-2xl font-bold">Recently Viewed Items</h3>
            <div className="px-12">
                <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent className="mx-2 my-6">
                        {items.map((item) => (
                            <CarouselItem key={item.id} className="basis-full pl-6 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <VehicleCard item={item} saved={false} onToggleSave={() => {}} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>
    );
}
