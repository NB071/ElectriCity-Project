import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatPrice, formatMileage } from "@/components/shop/VehicleCard";
import { MOCK_VEHICLES } from "@/components/shop/catalog/mockVehicles";
import {
    Loader2,
    Calendar,
    Gauge,
    Settings2,
    Share,
    Bookmark,
    BatteryCharging,
    ChevronLeft,
    Car,
    Fuel,
    Zap,
    Star,
    Check,
    Tag,
    Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeaveReviewForm } from "@/components/shop/catalog/LeaveReviewForm";
import { ReviewList } from "@/components/shop/catalog/ReviewList";
import { useCustomizationStore, useRecentlyViewedStore } from "@/stores";
import { useUiStore } from "@/stores/ui-store";
import { RecentlyViewedItems } from "@/components/shop/catalog/RecentlyViewedItems";

export const Route = createFileRoute("/(shop)/_layout/catalog/$cid")({
    component: VehicleDetailsRoute,
});

type VehicleDetailsDTO = {
    id: number;
    item_type: "vehicle";
    name: string;
    description: string | null;
    base_price: number;
    stock: number;
    is_active: boolean;
    review_count: number;
    avg_rating: number | null;
    brand: {
        id: number;
        name: string;
        country: string | null;
        is_featured: boolean;
        display_order: number | null;
        logo: {
            media_id: number;
            url: string | null;
            file_type: string | null;
            alt_text: string | null;
        } | null;
    };
    model: { id: number; name: string; release_year: number | null };
    vehicle: {
        year: number | null;
        condition: "new" | "used";
        mileage: number | null;
        exterior_color: string | null;
        interior_color: string | null;
        body_shape: string | null;
        door_count: number | null;
        drivetrain: string | null;
    };
    equipped_options: { option_id: number; category_name: string; name: string; price_delta: number }[];
    customizations: {
        category_id: number;
        name: string;
        select_type: "SINGLE" | "MULTI";
        options: { option_id: number; name: string; price_delta: number }[];
    }[];
    promotions: { promo_id: number; name: string; description: string | null; discount_amount: number }[];
    history: {
        has_accidents: boolean;
        owners_count: number;
        report: { media_id: number; url: string; alt_text: string | null } | null;
    } | null;
    images: { media_id: number; url: string; alt_text: string | null; display_order: number; is_primary: boolean }[];
};

function VehicleDetailsRoute() {
    const { cid } = Route.useParams();
    const [vehicle, setVehicle] = useState<VehicleDetailsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const { selections, toggleOption } = useCustomizationStore();
    const { openModal } = useUiStore();
    const selectedOptions = selections[cid] || [];

    useEffect(() => {
        const fetchVehicle = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/shop/catalog/vehicles/${cid}`).catch(() => null);
                if (!res || !res.ok) throw new Error("Fallback to mock");

                const data = await res.json();
                if (data.success && data.data) {
                    setVehicle(data.data);
                    useRecentlyViewedStore.getState().track(cid);
                } else {
                    throw new Error("Invalid response");
                }
            } catch (err) {
                // Fallback to our extensive mock array mapping format explicitly
                console.log("Using mock data as fallback for vehicle details");
                await new Promise((r) => setTimeout(r, 400));
                const mockMatch = MOCK_VEHICLES.find((v) => String(v.id) === cid);

                if (mockMatch) {
                    const domainMap: Record<string, string> = {
                        Tesla: "tesla.com",
                        Ford: "ford.com",
                        Hyundai: "hyundai.com",
                        Rivian: "rivian.com",
                        Chevrolet: "chevrolet.com",
                        Porsche: "porsche.com",
                        Nissan: "nissanusa.com",
                        Audi: "audi.com",
                        Kia: "kia.com",
                        Lucid: "lucidmotors.com",
                        Polestar: "polestar.com",
                        Volkswagen: "vw.com",
                        Volvo: "volvocars.com",
                        BMW: "bmw.com",
                        "Mercedes-Benz": "mbusa.com",
                    };
                    const domain = domainMap[mockMatch.brand.name] || "example.com";

                    // Populate graceful dummy fields mapped to the exact backend schema expectation
                    const fallback: VehicleDetailsDTO = {
                        id: mockMatch.id,
                        item_type: "vehicle",
                        name: mockMatch.name,
                        description:
                            "Experience the future of driving with the impeccable " +
                            mockMatch.name +
                            ". Designed to thrill while minimizing environmental impact.",
                        base_price: mockMatch.base_price,
                        stock: mockMatch.stock,
                        is_active: mockMatch.is_active,
                        review_count: 12,
                        avg_rating: 4.8,
                        brand: {
                            id: mockMatch.brand.id,
                            name: mockMatch.brand.name,
                            country: "US",
                            is_featured: false,
                            display_order: 1,
                            logo: {
                                media_id: mockMatch.brand.id + 1000,
                                url: `https://logo.clearbit.com/${domain}`,
                                file_type: "image/png",
                                alt_text: `${mockMatch.brand.name} Logo`,
                            },
                        },
                        model: { id: mockMatch.model.id, name: mockMatch.model.name, release_year: mockMatch.vehicle.year },
                        vehicle: mockMatch.vehicle,
                        equipped_options: [
                            { option_id: 111, category_name: "Interior", name: "Premium Leather Seats", price_delta: 0 },
                            { option_id: 112, category_name: "Safety", name: "Advanced Collision Avoidance", price_delta: 0 },
                        ],
                        customizations: [
                            {
                                category_id: 1,
                                name: "Color Finish",
                                select_type: "SINGLE",
                                options: [
                                    { option_id: 101, name: "Pearl White Multi-Coat", price_delta: 0 },
                                    { option_id: 102, name: "Solid Black Metallic", price_delta: 1200 },
                                    { option_id: 103, name: "Deep Blue Metallic", price_delta: 1200 },
                                    { option_id: 104, name: "Red Multi-Coat", price_delta: 2000 },
                                    { option_id: 105, name: "Silver Metallic", price_delta: 1200 },
                                ],
                            },
                            {
                                category_id: 2,
                                name: "Autonomous Driving",
                                select_type: "MULTI",
                                options: [
                                    { option_id: 106, name: "Full Self-Driving Capability", price_delta: 5000 },
                                    { option_id: 107, name: "Enhanced Autopilot", price_delta: 5000 },
                                    { option_id: 108, name: "Autopilot", price_delta: 5000 },
                                ],
                            },
                        ],
                        promotions: mockMatch.promotions,
                        history: {
                            has_accidents: false,
                            owners_count: 1,
                            report: null,
                        },
                        images: [
                            ...(mockMatch.primary_image_url
                                ? [{ media_id: 1, url: mockMatch.primary_image_url, display_order: 0, is_primary: true, alt_text: "Primary View" }]
                                : []),
                            ...(mockMatch.image_urls || []).map((url, i) => ({
                                media_id: i + 2,
                                url,
                                display_order: i + 1,
                                is_primary: false,
                                alt_text: `Alt view ${i}`,
                            })),
                        ],
                    };
                    setVehicle(fallback);
                    useRecentlyViewedStore.getState().track(cid);
                } else {
                    setVehicle(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [cid]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Vehicle Not Found</h2>
                <p className="text-muted-foreground">The vehicle you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    const isSoldOut = vehicle.stock === 0;

    const selectedPriceDelta = vehicle.customizations
        .flatMap((c) => c.options)
        .filter((o) => selectedOptions.includes(o.option_id))
        .reduce((sum, o) => sum + o.price_delta, 0);

    const sortedImages = [...vehicle.images].sort((a, b) => a.display_order - b.display_order);
    const primaryImage = sortedImages.find((img) => img.is_primary) || sortedImages[0];
    const subImages = sortedImages.filter((img) => img !== primaryImage).slice(0, 4);

    return (
        <div className="bg-background min-h-screen pt-20 pb-24 md:pt-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link to="/catalog" className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm transition-colors">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Catalog
                </Link>

                {/* Hero / Header Section */}
                <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{vehicle.name}</h1>
                            {isSoldOut && (
                                <Badge variant="destructive" className="px-2 py-0.5 text-xs tracking-widest uppercase">
                                    Sold Out
                                </Badge>
                            )}
                        </div>

                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                            {vehicle.vehicle.condition.toUpperCase()} · {vehicle.vehicle.exterior_color} {vehicle.vehicle.body_shape} ·{" "}
                            {vehicle.vehicle.drivetrain}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {vehicle.promotions.map((p) => (
                                <Badge
                                    key={p.promo_id}
                                    className="flex items-center gap-1.5 border-transparent bg-rose-600 px-3 py-1 font-medium text-white"
                                >
                                    <Tag className="h-3.5 w-3.5" />
                                    {p.name}
                                </Badge>
                            ))}
                            <Badge
                                variant="secondary"
                                className="bg-secondary/50 text-secondary-foreground flex items-center gap-1.5 border-transparent px-3 py-1 font-medium"
                            >
                                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                {vehicle.vehicle.year}
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="bg-secondary/50 text-secondary-foreground flex items-center gap-1.5 border-transparent px-3 py-1 font-medium"
                            >
                                <Gauge className="h-3.5 w-3.5 text-blue-500" />
                                {formatMileage(vehicle.vehicle.mileage ?? 0)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="h-9 rounded-full px-4 text-xs font-semibold">
                                <Share className="mr-2 h-3.5 w-3.5" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 rounded-full px-4 text-xs font-semibold">
                                <Bookmark className="mr-2 h-3.5 w-3.5" />
                                Save
                            </Button>
                        </div>
                        <div className="text-left md:text-right">
                            <h2 className="text-3xl font-bold md:text-4xl">{formatPrice(vehicle.base_price)}</h2>
                        </div>
                    </div>
                </div>

                {/* Photo Mosaic Gallery */}
                <div className="mb-12 grid h-75 grid-cols-1 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-125 md:grid-cols-3">
                    {/* Main image */}
                    <div className="group bg-muted relative row-span-2 flex items-center justify-center overflow-hidden md:col-span-2">
                        {primaryImage && (
                            <img
                                src={primaryImage.url}
                                alt={primaryImage.alt_text || vehicle.name}
                                className="absolute inset-0 size-full object-cover"
                            />
                        )}
                        <Button
                            variant="secondary"
                            onClick={() => openModal("imageGallery", { images: sortedImages })}
                            className="bg-background/80 hover:bg-background absolute bottom-4 left-4 z-10 gap-2 rounded-md font-bold backdrop-blur-md duration-300"
                        >
                            <Camera className="size-4" /> All Photos
                        </Button>
                    </div>
                    {/* Sub images */}
                    {subImages.map((img, i) => (
                        <div key={i} className="group bg-muted relative hidden items-center justify-center overflow-hidden md:flex">
                            <img src={img.url} alt={img.alt_text || "Vehicle view"} className="absolute inset-0 size-full object-cover" />
                        </div>
                    ))}
                    {/* Fallback spacers if less than 4 sub images exist */}
                    {Array.from({ length: Math.max(0, 4 - subImages.length) }).map((_, i) => (
                        <div key={`spacer-${i}`} className="group bg-muted relative hidden items-center justify-center md:flex" />
                    ))}
                </div>

                <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Left Column: Overview and Desc */}
                    <div className="space-y-12 lg:col-span-2">
                        {/* Car Overview */}
                        <section>
                            <h3 className="mb-6 text-2xl font-bold">Car Overview</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3">
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Car className="h-4 w-4" /> Body
                                    </div>
                                    <span className="text-sm font-semibold capitalize">{vehicle.vehicle.body_shape || "N/A"}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Settings2 className="h-4 w-4" /> Condition
                                    </div>
                                    <span className="text-sm font-semibold capitalize">{vehicle.vehicle.condition}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Gauge className="h-4 w-4" /> Mileage
                                    </div>
                                    <span className="text-sm font-semibold">{formatMileage(vehicle.vehicle.mileage ?? 0)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <BatteryCharging className="h-4 w-4" /> Motor Size
                                    </div>
                                    <span className="text-sm font-semibold">Dual Motor (AWD)</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Fuel className="h-4 w-4" /> Fuel Type
                                    </div>
                                    <span className="text-sm font-semibold">Electric / Battery</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Settings2 className="h-4 w-4" /> Doors
                                    </div>
                                    <span className="text-sm font-semibold">{vehicle.vehicle.door_count || "N/A"}-door</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4" /> Year
                                    </div>
                                    <span className="text-sm font-semibold">{vehicle.vehicle.year}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Settings2 className="h-4 w-4" /> Drive Type
                                    </div>
                                    <span className="text-sm font-semibold capitalize">{vehicle.vehicle.drivetrain || "N/A"}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Zap className="h-4 w-4" /> Color
                                    </div>
                                    <span className="text-sm font-semibold capitalize">{vehicle.vehicle.exterior_color || "N/A"}</span>
                                </div>
                            </div>
                        </section>

                        <hr className="border-border" />

                        <section>
                            <h3 className="mb-6 text-2xl font-bold">Description</h3>
                            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
                                <p>{vehicle.description}</p>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-4">
                                {vehicle.history?.report && (
                                    <Button
                                        variant="secondary"
                                        className="hover:bg-secondary"
                                        onClick={() => window.open(vehicle.history!.report!.url, "_blank")}
                                    >
                                        View Vin Report
                                    </Button>
                                )}
                            </div>
                        </section>

                        {vehicle.equipped_options.length > 0 && (
                            <>
                                <hr className="border-border" />
                                <section>
                                    <h3 className="mb-6 text-2xl font-bold">Equipped Options</h3>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                                        {vehicle.equipped_options.map((opt) => (
                                            <div key={opt.option_id} className="bg-muted/20 flex items-center gap-2 rounded-lg border p-3">
                                                <Badge variant="outline" className="bg-background text-xs">
                                                    {opt.category_name}
                                                </Badge>
                                                <span className="text-sm font-medium">{opt.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    {/* Right Column: Customizations & Cart Widget Sidebar */}
                    <div className="space-y-8 lg:sticky lg:top-28 lg:col-span-1 lg:self-start">
                        {/* Brand Box */}
                        <Link
                            to="/brands/$bid"
                            params={{ bid: vehicle.brand.id.toString() }}
                            className="border-border bg-card hover:border-primary/50 hover:bg-muted/30 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                {vehicle.brand.logo && (
                                    <div className="border-border flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white p-1 shadow-sm">
                                        <img
                                            src={vehicle.brand.logo.url!}
                                            alt={vehicle.brand.logo.alt_text || "Brand Logo"}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Manufacturer</span>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xl font-bold tracking-tight">{vehicle.brand.name}</h4>
                                        {vehicle.brand.is_featured && (
                                            <Badge variant="default" className="px-1.5 py-0 text-[10px]">
                                                Featured
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {vehicle.brand.country && (
                                <Badge variant="secondary" className="shrink-0 px-3 py-1.5">
                                    {vehicle.brand.country}
                                </Badge>
                            )}
                        </Link>

                        {vehicle.customizations.length > 0 && (
                            <section>
                                <h3 className="mb-6 text-2xl font-bold">Customizations</h3>
                                <div className="border-border bg-muted/30 rounded-xl border p-6">
                                    <div className="space-y-8">
                                        {vehicle.customizations.map((category) => (
                                            <div key={category.category_id} className="flex flex-col gap-3">
                                                <div className="text-muted-foreground flex items-center justify-between text-xs font-bold tracking-widest uppercase">
                                                    <span>{category.name}</span>
                                                    <span className="bg-background rounded-full border px-2 py-0.5 opacity-70">
                                                        {category.select_type}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {category.options.map((opt) => {
                                                        const isSelected = selectedOptions.includes(opt.option_id);
                                                        return (
                                                            <button
                                                                key={opt.option_id}
                                                                className={`hover:bg-muted/80 flex w-full items-center justify-between rounded-lg border p-4 text-sm font-semibold transition-all ${
                                                                    isSelected ? "border-primary bg-primary/5 text-primary" : "border-border bg-card"
                                                                }`}
                                                                onClick={() =>
                                                                    toggleOption(
                                                                        cid,
                                                                        opt.option_id,
                                                                        category.category_id,
                                                                        category.select_type,
                                                                        vehicle.customizations
                                                                    )
                                                                }
                                                            >
                                                                <span className="text-left">{opt.name}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className={isSelected ? "text-primary" : "text-muted-foreground"}>
                                                                        +{formatPrice(opt.price_delta)}
                                                                    </span>
                                                                    {isSelected ? (
                                                                        <Check className="h-4 w-4 shrink-0" />
                                                                    ) : (
                                                                        <div className="border-muted-foreground/30 h-4 w-4 shrink-0 rounded-full border-2" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <hr className="border-border my-6" />

                                    <div className="space-y-4">
                                        <div className="flex w-full items-center justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Base Price</span>
                                            <span className="font-semibold">{formatPrice(vehicle.base_price)}</span>
                                        </div>
                                        <div className="flex w-full items-center justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Options Total</span>
                                            <span className="font-semibold">{formatPrice(selectedPriceDelta)}</span>
                                        </div>
                                        <div className="flex w-full items-end justify-between pt-2">
                                            <span className="text-lg font-bold">Total Request</span>
                                            <span className="text-primary text-2xl font-bold">
                                                {formatPrice(vehicle.base_price + selectedPriceDelta)}
                                            </span>
                                        </div>

                                        {isSoldOut ? (
                                            <Button
                                                size="lg"
                                                className="bg-muted-foreground/20 text-muted-foreground mt-6 w-full text-base font-bold"
                                                disabled
                                            >
                                                Sold Out
                                            </Button>
                                        ) : (
                                            <Button size="lg" className="mt-6 w-full text-base font-bold">
                                                Add to Cart
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                        {/* Fallback button if no customizations block is rendered */}
                        {vehicle.customizations.length === 0 && (
                            <div className="border-border bg-muted/30 mt-6 flex flex-col gap-4 rounded-xl border p-6">
                                <div className="flex w-full items-end justify-between">
                                    <span className="text-lg font-bold">Total Request</span>
                                    <span className="text-primary text-2xl font-bold">{formatPrice(vehicle.base_price)}</span>
                                </div>
                                {isSoldOut ? (
                                    <Button size="lg" className="bg-muted-foreground/20 text-muted-foreground w-full text-base font-bold" disabled>
                                        Sold Out
                                    </Button>
                                ) : (
                                    <Button size="lg" className="w-full text-base font-bold">
                                        Add to Cart
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Financing Calculator */}
                <hr className="border-border my-16" />
                <section>
                    <h3 className="mb-8 text-2xl font-bold">Financing Calculator</h3>
                    <div className="mb-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-muted-foreground text-xs font-semibold">Vehicle Price ($)</label>
                            <input
                                type="number"
                                readOnly
                                value={vehicle.base_price}
                                className="border-input bg-background/50 ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-muted-foreground text-xs font-semibold">Interest rate (%)</label>
                            <input
                                type="number"
                                defaultValue="4.5"
                                className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-muted-foreground text-xs font-semibold">Period (months)</label>
                            <input
                                type="number"
                                defaultValue="36"
                                className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-muted-foreground text-xs font-semibold">Down Payment ($)</label>
                            <input
                                type="number"
                                defaultValue="4000"
                                className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <Button className="mb-10 w-40">Calculate</Button>

                    <div className="flex flex-wrap items-center gap-12 text-sm font-semibold">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground text-xs">Monthly Payment</span>
                            <span className="text-lg">{formatPrice(Math.round(((vehicle.base_price - 4000) * 1.045) / 36))}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground text-xs">Total Amount to Pay</span>
                            <span className="text-lg">{formatPrice(Math.round((vehicle.base_price - 4000) * 1.045 + 4000))}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground text-xs">Total Interest Payment</span>
                            <span className="text-lg">{formatPrice(Math.round((vehicle.base_price - 4000) * 0.045))}</span>
                        </div>
                    </div>
                </section>

                {/* Customer Reviews Section */}
                <hr className="border-border my-16" />
                <section className="mb-24">
                    <h3 className="mb-10 text-2xl font-bold">Customer Reviews</h3>

                    {vehicle.review_count > 0 ? (
                        <div className="bg-card mb-16 flex w-max items-center gap-8 rounded-xl border px-6 py-8">
                            <div className="border-primary/10 bg-background/50 relative flex size-32 shrink-0 flex-col items-center justify-center rounded-full border-4">
                                <span className="text-primary text-4xl font-bold">{vehicle.avg_rating?.toFixed(1)}</span>
                                <span className="text-muted-foreground mt-1 text-[10px] font-bold tracking-widest uppercase">Out Of 5</span>

                                {/* Overlay pseudo border visualization */}
                                <svg className="pointer-events-none absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="48"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="text-primary"
                                        strokeDasharray="300"
                                        strokeDashoffset={300 - (300 * (vehicle.avg_rating || 0)) / 5}
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <div className="mb-2 flex origin-left scale-125 items-center gap-1.5 opacity-90">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`size-4 ${i < Math.round(vehicle.avg_rating || 0) ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-muted-foreground font-semibold">Based on {vehicle.review_count} user reviews</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/20 rounded-xl border px-6 py-8 text-center">
                            <p className="text-muted-foreground font-semibold">
                                No community reviews have been recorded for this {vehicle.brand.name} yet.
                            </p>
                        </div>
                    )}

                    <ReviewList cid={vehicle.id} />

                    <LeaveReviewForm cid={vehicle.id} />
                </section>

                <RecentlyViewedItems currentCid={cid} />
            </div>
        </div>
    );
}
