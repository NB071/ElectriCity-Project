import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Bookmark, Car, Gauge, GitBranch, DoorOpen, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { UnderlineLinkButton } from "@/components/common/underline-link-button";
import { useRecentlyViewedStore, useCompareStore } from "@/stores";
import { useAddToWishlist, useRemoveFromWishlist } from "@/hooks/api/wishlist/use-wishlist-mutations";
import { queryClient } from "@/integrations/tanstack-query/query-client";

export type CatalogListItem = {
    id: number;
    item_type: "vehicle";
    name: string;
    brand: { id: number; name: string };
    model: { id: number; name: string };
    base_price: number;
    stock: number;
    is_active: boolean;
    primary_image_url: string | null;
    image_urls: string[];
    promotions: { promo_id: number; name: string; description: string | null; discount_amount: number }[];
    vehicle: {
        year: number;
        condition: "new" | "used";
        mileage: number;
        exterior_color: string;
        interior_color: string;
        body_shape: string;
        door_count: number;
        drivetrain: string;
    };
    category: "hot_deal" | "seasonal" | "clearance" | "featured";
};

export function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatMileage(miles: number) {
    return `${new Intl.NumberFormat("en-US").format(miles)} miles`;
}

export function salePrice(item: CatalogListItem) {
    const discount = item.promotions.reduce((sum, p) => sum + p.discount_amount, 0);
    return Math.max(0, item.base_price - discount);
}

export function cardBadge(item: CatalogListItem): { label: string; bg: string } {
    let label = item.category as string;
    let bg = "bg-primary";
    switch (item.category) {
        case "hot_deal":
            label = "Hot Deal";
            bg = "bg-rose-600";
            break;
        case "seasonal":
            label = "Seasonal";
            bg = "bg-emerald-600";
            break;
        case "clearance":
            label = "Clearance";
            bg = "bg-amber-600";
            break;
        case "featured":
            label = "Featured";
            bg = "bg-sky-600";
            break;
    }
    return { label, bg };
}

export function CarouselDots({ count }: { count: number }) {
    const { api } = useCarousel();
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        if (!api) return;
        const onSelect = () => setSelected(api.selectedScrollSnap());
        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);
        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);

    if (count < 2) return null;

    return (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
            {Array.from({ length: count }, (_, i) => (
                <button
                    key={i}
                    type="button"
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === selected}
                    onClick={() => api?.scrollTo(i)}
                    className={cn("size-1.5 rounded-full bg-white/60 transition-all duration-300", i === selected && "w-4 bg-white")}
                />
            ))}
        </div>
    );
}

export function CardImageCarousel({ images, alt }: { images: string[]; alt: string }) {
    const [autoplay] = useState(() => Autoplay({ delay: 2500, playOnInit: false, stopOnInteraction: false }));

    const resolved = images.map((src) => mediaUrl(src)).filter((src): src is string => Boolean(src));

    if (resolved.length === 0) {
        return (
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
                <div className="size-14 rounded-full bg-black/10" />
                <div className="absolute size-0 border-r-24 border-b-40 border-l-24 border-r-transparent border-b-black/15 border-l-transparent" />
            </div>
        );
    }

    return (
        <Carousel
            plugins={[autoplay]}
            opts={{ loop: true }}
            className="absolute inset-0 size-full **:data-[slot=carousel-content]:h-full"
            onMouseEnter={() => autoplay.play()}
            onMouseLeave={() => autoplay.stop()}
        >
            <CarouselContent className="ml-0 h-full">
                {resolved.map((src, i) => (
                    <CarouselItem key={src} className="h-full basis-full pl-0">
                        <img src={src} alt={i === 0 ? alt : ""} className="size-full object-cover" loading="lazy" />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 size-7 border-none bg-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 disabled:hidden" />
            <CarouselNext className="right-2 size-7 border-none bg-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 disabled:hidden" />
            <CarouselDots count={resolved.length} />
        </Carousel>
    );
}

export function VehicleCard({ item, saved, onToggleSave }: { item: CatalogListItem; saved: boolean; onToggleSave: () => void }) {
    const authData = queryClient.getQueryData<any>(["user"]); 
    const userId = authData?.user_id || authData?.id || "";
    const addToWishlist = useAddToWishlist(String(userId))
    const removeFromWishlist = useRemoveFromWishlist(String(userId));
    const { lastViewedId } = useRecentlyViewedStore();
    const compareStore = useCompareStore();
    const isComparing = compareStore.has(String(item.id));
    const isLastViewed = lastViewedId === String(item.id);
    const badge = cardBadge(item);
    const current = salePrice(item);
    const hasDiscount = current < item.base_price;
    const subtitle = `${item.vehicle.year} ${item.model.name} · ${item.vehicle.condition} · ${item.vehicle.exterior_color}`;

    return (
        <Card className="group ring-border relative flex h-full flex-col gap-0 overflow-hidden py-0 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="bg-muted relative aspect-4/3 shrink-0 overflow-hidden">
                <CardImageCarousel images={item.image_urls} alt={`${item.brand.name} ${item.model.name}`} />

                {isLastViewed && (
                    <Badge
                        variant="secondary"
                        className="absolute -top-1 left-1/2 z-20 -translate-x-1/2 rounded-t-none bg-gray-500/90 px-3 py-4 font-semibold text-white shadow-xl hover:bg-gray-500/90"
                    >
                        Last Viewed
                    </Badge>
                )}

                <Badge className={cn("absolute top-3 left-3 z-10 animate-pulse border-none text-white shadow-sm", badge.bg)}>{badge.label}</Badge>

                <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                    aria-pressed={saved}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (saved){
                            removeFromWishlist.mutate({})
                        }
                        else{
                            addToWishlist.mutate({})
                        }
                        onToggleSave();
                    }}
                    className="absolute top-3 right-3 z-10 size-8 rounded-full bg-white/95 shadow-sm hover:bg-white"
                >
                    <Bookmark className={cn("size-4", saved && "fill-foreground")} />
                </Button>

                <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    aria-label={isComparing ? "Remove from compare" : "Add to compare"}
                    aria-pressed={isComparing}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (isComparing) {
                            compareStore.remove(String(item.id));
                        } else {
                            compareStore.add({
                                cid: String(item.id),
                                primary_image_url: item.primary_image_url ?? item.image_urls[0] ?? null,
                            });
                        }
                    }}
                    className="absolute top-12 right-3 z-10 size-8 rounded-full bg-white/95 shadow-sm hover:bg-white"
                >
                    <Scale className={cn("size-4", isComparing && "text-blue-600")} />
                </Button>
            </div>

            <CardContent className="flex flex-1 flex-col gap-2 px-7 py-4">
                <div className="mb-2 flex w-[95%] flex-col gap-0.5">
                    <p className="truncate font-semibold">
                        {item.brand.name}, {item.model.name}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">{subtitle}</p>
                </div>

                <Separator orientation="horizontal" />

                <ul className="text-muted-foreground flex flex-wrap items-center justify-between py-1 text-xs">
                    <li className="mx-1 flex flex-col items-center gap-0.5">
                        <Gauge className="size-3.5 shrink-0" aria-hidden />
                        {formatMileage(item.vehicle.mileage)}
                    </li>
                    <li className="mx-1 flex flex-col items-center gap-0.5">
                        <Car className="size-3.5 shrink-0" aria-hidden />
                        {item.vehicle.body_shape}
                    </li>
                    <li className="mx-1 flex flex-col items-center gap-0.5">
                        <GitBranch className="size-3.5 shrink-0" aria-hidden />
                        {item.vehicle.drivetrain}
                    </li>
                    <li className="mx-1 flex flex-col items-center gap-0.5">
                        <DoorOpen className="size-3.5 shrink-0" aria-hidden />
                        {item.vehicle.door_count} doors
                    </li>
                </ul>

                <Separator orientation="horizontal" />

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col">
                        <span className={cn("text-muted-foreground text-[0.75rem] line-through", hasDiscount ? "visible" : "invisible")}>
                            {formatPrice(item.base_price)}
                        </span>
                        <span className="text-base font-semibold">{formatPrice(current)}</span>
                    </div>
                    <UnderlineLinkButton
                        to="/catalog/$cid"
                        params={{ cid: String(item.id) }}
                        lineOffset="after:-bottom-0.5"
                        className="text-primary h-auto px-0 text-sm"
                    >
                        View Details
                    </UnderlineLinkButton>
                </div>
            </CardContent>
        </Card>
    );
}
