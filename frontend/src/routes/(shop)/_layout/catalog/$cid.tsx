import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatPrice, formatMileage } from "@/components/shop/VehicleCard";
import {
    Loader2,
    Calendar,
    Gauge,
    Settings2,
    Share,
    Bookmark,
    ChevronLeft,
    Car,
    Zap,
    Star,
    Check,
    Tag,
    Camera,
    Palette,
    ShieldAlert,
    Users,
    Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QueryError } from "@/components/common/QueryError";
import { LeaveReviewForm } from "@/components/shop/catalog/LeaveReviewForm";
import { ReviewList } from "@/components/shop/catalog/ReviewList";
import { useCustomizationStore, useRecentlyViewedStore } from "@/stores";
import { useUiStore } from "@/stores/ui-store";
import { RecentlyViewedItems } from "@/components/shop/catalog/RecentlyViewedItems";
import { useGetVehicleDetails } from "@/hooks/api/catalog/use-vehicles";
import { useCreateConfiguration } from "@/hooks/api/catalog/use-configurations";
import { useAddToCart } from "@/hooks/api/cart/use-cart-mutations";
import { useIsInWishlist } from "@/hooks/api/wishlist/use-wishlist";
import {
    addToWishlistVariables,
    removeFromWishlistVariables,
    useAddToWishlist,
    useRemoveFromWishlist,
} from "@/hooks/api/wishlist/use-wishlist-mutations";
import { useAuthStatus } from "@/hooks/use-me";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/(shop)/_layout/catalog/$cid")({
    component: VehicleDetailsRoute,
});

function VehicleDetailsRoute() {
    const { cid } = Route.useParams();
    const numericCid = Number(cid);
    const navigate = useNavigate();
    const { status, user } = useAuthStatus();
    const { data: vehicle, isLoading, isError, error, refetch, isFetching } = useGetVehicleDetails(numericCid);
    const { saved } = useIsInWishlist(numericCid);
    const addToWishlist = useAddToWishlist();
    const removeFromWishlist = useRemoveFromWishlist();
    const { selections, toggleOption } = useCustomizationStore();
    const { openModal } = useUiStore();
    const selectedOptions = selections[cid] || [];
    const createConfiguration = useCreateConfiguration();
    const addToCart = useAddToCart();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const wishlistPending = addToWishlist.isPending || removeFromWishlist.isPending;

    useEffect(() => {
        if (vehicle?.id != null) {
            useRecentlyViewedStore.getState().track(String(vehicle.id));
        }
    }, [vehicle?.id]);

    function handleWishlistToggle() {
        if (status !== "authenticated" || user?.role !== "customer") {
            toast.info("Sign in to save vehicles to your wishlist");
            void navigate({ to: "/auth/login", search: { redirect: `/catalog/${cid}` } });
            return;
        }

        if (saved) {
            removeFromWishlist.mutate(removeFromWishlistVariables(numericCid));
        } else {
            addToWishlist.mutate(addToWishlistVariables(numericCid));
        }
    }

    async function handleAddToCart() {
        if (!vehicle || vehicle.stock === 0 || isAddingToCart) return;

        setIsAddingToCart(true);
        try {
            let configId: number | undefined;

            if (selectedOptions.length > 0) {
                const configuration = await createConfiguration.mutateAsync({
                    body: {
                        cid: vehicle.id,
                        option_ids: selectedOptions,
                    },
                });
                configId = configuration.config_id;
            }

            await addToCart.mutateAsync({
                body: {
                    cid: vehicle.id,
                    quantity: 1,
                    ...(configId != null ? { config_id: configId } : {}),
                },
            });
        } catch {
            // Toast handled by mutation hooks
        } finally {
            setIsAddingToCart(false);
        }
    }
    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <QueryError
                    title="Couldn't load vehicle"
                    message="We couldn't load this vehicle's details right now."
                    error={error}
                    onRetry={() => void refetch()}
                    isRetrying={isFetching}
                    className="w-full"
                />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Vehicle Not Found</h2>
                <p className="text-muted-foreground">The vehicle you are looking for does not exist or has been removed.</p>
                <Link to="/catalog">
                    <Button variant="outline">Back to Catalog</Button>
                </Link>
            </div>
        );
    }

    const isSoldOut = vehicle.stock === 0;
    const promoDiscount = vehicle.promotions.reduce((sum, p) => sum + p.discount_amount, 0);
    const salePrice = Math.max(0, vehicle.base_price - promoDiscount);
    const hasDiscount = salePrice < vehicle.base_price;

    const selectedPriceDelta = vehicle.customizations
        .flatMap((c) => c.options)
        .filter((o) => selectedOptions.includes(o.option_id))
        .reduce((sum, o) => sum + o.price_delta, 0);

    const sortedImages = [...vehicle.images]
        .map((img) => ({ ...img, url: mediaUrl(img.url) ?? img.url }))
        .sort((a, b) => a.display_order - b.display_order);
    const primaryImage = sortedImages.find((img) => img.is_primary) || sortedImages[0];
    const subImages = sortedImages.filter((img) => img !== primaryImage).slice(0, 4);
    const brandLogoUrl = mediaUrl(vehicle.brand.logo?.url);
    const historyReportUrl = mediaUrl(vehicle.history?.report?.url);

    const equippedFlat = vehicle.equipped_options.flatMap((category) =>
        category.options.map((opt) => ({
            ...opt,
            category_name: category.name,
        }))
    );

    const financedPrice = salePrice + selectedPriceDelta;
    const financeDownPayment = 4000;
    const financeRate = 0.045;
    const financeMonths = 36;
    const financePrincipal = Math.max(0, financedPrice - financeDownPayment);
    const financeMonthly = Math.round((financePrincipal * (1 + financeRate)) / financeMonths);
    const financeTotal = Math.round(financePrincipal * (1 + financeRate) + financeDownPayment);
    const financeInterest = Math.round(financePrincipal * financeRate);

    return (
        <div className="bg-background min-h-screen pt-20 pb-24 md:pt-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link to="/catalog" className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm transition-colors">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Catalog
                </Link>

                <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{vehicle.name}</h1>
                            {isSoldOut ? (
                                <Badge variant="destructive" className="px-2 py-0.5 text-xs tracking-widest uppercase">
                                    Sold Out
                                </Badge>
                            ) : (
                                <Badge
                                    variant="secondary"
                                    className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 text-xs font-semibold"
                                >
                                    {vehicle.stock} in stock
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
                            <Badge
                                variant="secondary"
                                className="bg-secondary/50 text-secondary-foreground flex items-center gap-1.5 border-transparent px-3 py-1 font-medium"
                            >
                                <Package className="h-3.5 w-3.5 text-blue-500" />
                                Qty {vehicle.stock}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="h-9 rounded-full px-4 text-xs font-semibold">
                                <Share className="mr-2 h-3.5 w-3.5" />
                                Share
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-full px-4 text-xs font-semibold"
                                aria-pressed={saved}
                                disabled={wishlistPending}
                                onClick={handleWishlistToggle}
                            >
                                <Bookmark className={cn("mr-2 h-3.5 w-3.5", saved && "fill-foreground")} />
                                {saved ? "Saved" : "Save"}
                            </Button>
                        </div>
                        <div className="text-left md:text-right">
                            {hasDiscount ? (
                                <>
                                    <p className="text-muted-foreground text-sm line-through">{formatPrice(vehicle.base_price)}</p>
                                    <h2 className="text-3xl font-bold text-rose-600 md:text-4xl">{formatPrice(salePrice)}</h2>
                                </>
                            ) : (
                                <h2 className="text-3xl font-bold md:text-4xl">{formatPrice(vehicle.base_price)}</h2>
                            )}
                        </div>
                    </div>
                </div>

                {/* Photo Mosaic Gallery */}
                <div className="mb-12 grid h-75 grid-cols-1 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-125 md:grid-cols-3">
                    {/* Main image */}
                    <div className="group bg-muted relative row-span-2 flex items-center justify-center overflow-hidden md:col-span-2">
                        {primaryImage ? (
                            <img
                                src={primaryImage.url}
                                alt={primaryImage.alt_text || vehicle.name}
                                className="absolute inset-0 size-full object-cover"
                            />
                        ) : (
                            <Car className="text-muted-foreground/40 size-16" />
                        )}
                        {sortedImages.length > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => openModal("imageGallery", { images: sortedImages })}
                                className="bg-background/80 hover:bg-background absolute bottom-4 left-4 z-10 gap-2 rounded-md font-bold backdrop-blur-md duration-300"
                            >
                                <Camera className="size-4" /> All Photos
                            </Button>
                        )}
                    </div>
                    {subImages.map((img) => (
                        <div key={img.media_id} className="group bg-muted relative hidden items-center justify-center overflow-hidden md:flex">
                            <img src={img.url} alt={img.alt_text || "Vehicle view"} className="absolute inset-0 size-full object-cover" />
                        </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - subImages.length) }).map((_, i) => (
                        <div key={`spacer-${i}`} className="group bg-muted relative hidden items-center justify-center md:flex" />
                    ))}
                </div>

                <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
                    <div className="space-y-12 lg:col-span-2">
                        <section>
                            <h3 className="mb-6 text-2xl font-bold">Car Overview</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3">
                                <OverviewItem icon={Car} label="Body" value={vehicle.vehicle.body_shape} />
                                <OverviewItem icon={Settings2} label="Condition" value={vehicle.vehicle.condition} />
                                <OverviewItem icon={Gauge} label="Mileage" value={formatMileage(vehicle.vehicle.mileage ?? 0)} />
                                <OverviewItem
                                    icon={Settings2}
                                    label="Doors"
                                    value={vehicle.vehicle.door_count != null ? `${vehicle.vehicle.door_count}-door` : null}
                                />
                                <OverviewItem icon={Calendar} label="Year" value={vehicle.vehicle.year} />
                                <OverviewItem icon={Settings2} label="Drive Type" value={vehicle.vehicle.drivetrain} />
                                <OverviewItem icon={Zap} label="Exterior" value={vehicle.vehicle.exterior_color} />
                                <OverviewItem icon={Palette} label="Interior" value={vehicle.vehicle.interior_color} />
                                {vehicle.history ? (
                                    <>
                                        <OverviewItem icon={Users} label="Prior Owners" value={String(vehicle.history.owners_count)} />
                                        <OverviewItem
                                            icon={ShieldAlert}
                                            label="Accidents"
                                            value={vehicle.history.has_accidents ? "Reported" : "None reported"}
                                        />
                                    </>
                                ) : null}
                            </div>
                        </section>

                        <hr className="border-border" />

                        <section>
                            <h3 className="mb-6 text-2xl font-bold">Description</h3>
                            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
                                <p>{vehicle.description?.trim() || "No description available for this vehicle."}</p>
                            </div>

                            {historyReportUrl ? (
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <Button
                                        variant="secondary"
                                        className="hover:bg-secondary"
                                        onClick={() => window.open(historyReportUrl, "_blank")}
                                    >
                                        View Vehicle History Report
                                    </Button>
                                </div>
                            ) : null}
                        </section>

                        {equippedFlat.length > 0 && (
                            <>
                                <hr className="border-border" />
                                <section>
                                    <h3 className="mb-6 text-2xl font-bold">Equipped Options</h3>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                                        {equippedFlat.map((opt) => (
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

                    <div className="space-y-8 lg:sticky lg:top-28 lg:col-span-1 lg:self-start">
                        <Link
                            to="/brands/$bid"
                            params={{ bid: vehicle.brand.id.toString() }}
                            className="border-border bg-card hover:border-primary/50 hover:bg-muted/30 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                {brandLogoUrl ? (
                                    <div className="border-border flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white p-1 shadow-sm">
                                        <img
                                            src={brandLogoUrl}
                                            alt={vehicle.brand.logo?.alt_text || vehicle.brand.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                ) : null}
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
                                                                type="button"
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
                                            <span className="text-muted-foreground font-medium">Availability</span>
                                            <span className={isSoldOut ? "font-semibold text-rose-600" : "font-semibold text-emerald-700"}>
                                                {isSoldOut ? "Sold out" : `${vehicle.stock} available`}
                                            </span>
                                        </div>
                                        <div className="flex w-full items-center justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Base Price</span>
                                            <span className="font-semibold">{formatPrice(salePrice)}</span>
                                        </div>
                                        <div className="flex w-full items-center justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Options Total</span>
                                            <span className="font-semibold">{formatPrice(selectedPriceDelta)}</span>
                                        </div>
                                        <div className="flex w-full items-end justify-between pt-2">
                                            <span className="text-lg font-bold">Total Request</span>
                                            <span className="text-primary text-2xl font-bold">{formatPrice(salePrice + selectedPriceDelta)}</span>
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
                                            <Button
                                                size="lg"
                                                className="mt-6 w-full text-base font-bold"
                                                disabled={isAddingToCart}
                                                onClick={() => void handleAddToCart()}
                                            >
                                                {isAddingToCart ? (
                                                    <>
                                                        <Loader2 className="size-4 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    "Add to Cart"
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {vehicle.customizations.length === 0 && (
                            <div className="border-border bg-muted/30 mt-6 flex flex-col gap-4 rounded-xl border p-6">
                                <div className="flex w-full items-center justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Availability</span>
                                    <span className={isSoldOut ? "font-semibold text-rose-600" : "font-semibold text-emerald-700"}>
                                        {isSoldOut ? "Sold out" : `${vehicle.stock} available`}
                                    </span>
                                </div>
                                <div className="flex w-full items-end justify-between">
                                    <span className="text-lg font-bold">Total Request</span>
                                    <span className="text-primary text-2xl font-bold">{formatPrice(salePrice)}</span>
                                </div>
                                {isSoldOut ? (
                                    <Button size="lg" className="bg-muted-foreground/20 text-muted-foreground w-full text-base font-bold" disabled>
                                        Sold Out
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="w-full text-base font-bold"
                                        disabled={isAddingToCart}
                                        onClick={() => void handleAddToCart()}
                                    >
                                        {isAddingToCart ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            "Add to Cart"
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-border my-16" />
                <section>
                    <h3 className="mb-8 text-2xl font-bold">Financing Calculator</h3>
                    <div className="mb-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-muted-foreground text-xs font-semibold">Vehicle Price ($)</label>
                            <input
                                type="number"
                                readOnly
                                value={financedPrice}
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
                            <span className="text-lg">{formatPrice(financeMonthly)}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground text-xs">Total Amount to Pay</span>
                            <span className="text-lg">{formatPrice(financeTotal)}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground text-xs">Total Interest Payment</span>
                            <span className="text-lg">{formatPrice(financeInterest)}</span>
                        </div>
                    </div>
                </section>

                <hr className="border-border my-16" />
                <section className="mb-24">
                    <h3 className="mb-10 text-2xl font-bold">Customer Reviews</h3>

                    {vehicle.review_count > 0 ? (
                        <div className="bg-card mb-16 flex w-max items-center gap-8 rounded-xl border px-6 py-8">
                            <div className="border-primary/10 bg-background/50 relative flex size-32 shrink-0 flex-col items-center justify-center rounded-full border-4">
                                <span className="text-primary text-4xl font-bold">{vehicle.avg_rating?.toFixed(1)}</span>
                                <span className="text-muted-foreground mt-1 text-[10px] font-bold tracking-widest uppercase">Out Of 5</span>

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

function OverviewItem({ icon: Icon, label, value }: { icon: typeof Car; label: string; value: string | number | null | undefined }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4" /> {label}
            </div>
            <span className="text-sm font-semibold capitalize">{value ?? "N/A"}</span>
        </div>
    );
}
