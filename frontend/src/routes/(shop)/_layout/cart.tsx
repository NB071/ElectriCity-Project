import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStatus } from "@/hooks/use-me";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ExternalLink, Minus, Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { useUpdateCartItem, useRemoveCartItem, type CartLine } from "@/hooks/api/cart/use-cart-mutations";
import { useGetCart } from "@/hooks/api/cart/use-cart-queries";
import { mediaUrl } from "@/lib/media";

const PAGE_LIMIT = 5;
const TOTALS_LIMIT = 100;
const QUANTITY_MIN = 1;
const QUANTITY_MAX = 99;

export const Route = createFileRoute("/(shop)/_layout/cart")({
    component: CartComponent,
});

function formatMoney(value: number) {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CartComponent() {
    const [page, setPage] = useState(1);
    const [updatingItems, setUpdatingItems] = useState<Record<number, boolean>>({});
    const { user, status: authStatus } = useAuthStatus();
    const isAdmin = authStatus === "authenticated" && user?.role === "admin";

    const { data: cartData, isLoading, isError, error } = useGetCart(page, PAGE_LIMIT, undefined, { enabled: !isAdmin });
    // Totals over the full cart (API max limit), not just the current page
    const { data: allCartData } = useGetCart(1, TOTALS_LIMIT, undefined, { enabled: !isAdmin });

    const updateCartItem = useUpdateCartItem();
    const removeCartItem = useRemoveCartItem();

    const items = cartData?.items ?? [];
    const pagination = cartData?.pagination;
    const allItems = allCartData?.items ?? items;
    const subtotal = allItems.reduce((sum, item) => sum + item.line_total, 0);

    if (isAdmin) {
        return (
            <div className="container mx-auto mt-16 max-w-7xl px-4 py-8 md:py-12">
                <div className="mb-4">
                    <Breadcrumbs />
                </div>
                <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">Shop Cart</h1>
                <div className="border-border/60 flex flex-col items-center justify-center gap-3 rounded-lg border py-16 text-center">
                    <ShoppingCart className="text-muted-foreground/40 size-10" />
                    <p className="text-muted-foreground text-sm font-medium">Admin accounts cannot shop or use a cart.</p>
                    <Button asChild variant="outline" className="mt-2">
                        <Link to="/dashboard/admin">Go to admin dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const handleUpdateQuantity = async (cartItemId: number, currentQuantity: number, newQuantity: number) => {
        if (newQuantity < QUANTITY_MIN || newQuantity > QUANTITY_MAX) return;
        if (newQuantity === currentQuantity) return;

        setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }));

        try {
            await updateCartItem.mutateAsync({
                url: `/api/shop/cart/items/${cartItemId}`,
                body: { quantity: newQuantity },
            });
        } finally {
            setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }));
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }));

        try {
            await removeCartItem.mutateAsync({
                url: `/api/shop/cart/items/${cartItemId}`,
            });
            if (items.length === 1 && page > 1) {
                setPage((p) => p - 1);
            }
        } catch {
            setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }));
        }
    };

    const mutationError = updateCartItem.error ?? removeCartItem.error;

    return (
        <div className="container mx-auto mt-16 max-w-7xl px-4 py-8 md:py-12">
            <div className="mb-4">
                <Breadcrumbs />
            </div>

            <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">Shop Cart</h1>

            {isLoading ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-16">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading your cart...</span>
                </div>
            ) : isError ? (
                <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-6 text-sm">
                    {error?.message ?? "Could not load your cart. Please try again."}
                </div>
            ) : items.length === 0 ? (
                <div className="border-border/60 flex flex-col items-center justify-center gap-3 rounded-lg border py-16 text-center">
                    <ShoppingCart className="text-muted-foreground/40 size-10" />
                    <p className="text-muted-foreground text-sm font-medium">Your cart is empty.</p>
                    <Button asChild variant="outline" className="mt-2">
                        <Link to="/catalog">Continue shopping</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                    {/* Main Cart Area */}
                    <div className="w-full flex-1">
                        {mutationError && <p className="text-destructive mb-4 text-sm">{mutationError.message}</p>}

                        {/* Header */}
                        <div className="text-primary hidden grid-cols-[3fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-lg bg-blue-100/60 p-5 text-sm font-medium md:grid dark:bg-blue-900/10 dark:text-blue-400">
                            <div>Product</div>
                            <div className="text-center">Price</div>
                            <div className="text-center">Quantity</div>
                            <div className="pr-6 text-right">Subtotal</div>
                            <div className="w-8"></div>
                        </div>

                        {/* Items */}
                        <div className="flex flex-col gap-6 md:gap-0">
                            {items.map((item: CartLine, index: number) => {
                                const imageSrc = mediaUrl(item.catalog_item.primary_image_url) ?? "/logo192.png";
                                const busy = Boolean(updatingItems[item.cart_item_id]);
                                const maxQty = Math.min(QUANTITY_MAX, item.catalog_item.stock || QUANTITY_MAX);
                                const canDecrement = item.quantity > QUANTITY_MIN;
                                const canIncrement = item.quantity < maxQty;

                                return (
                                    <div
                                        key={item.cart_item_id}
                                        className={`grid grid-cols-1 items-center gap-4 py-6 md:grid-cols-[3fr_1fr_1fr_1fr_auto] ${index !== items.length - 1 ? "border-border/60 border-b" : ""}`}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    to="/catalog/$cid"
                                                    params={{ cid: String(item.cid) }}
                                                    aria-label={`View ${item.catalog_item.name} details`}
                                                    className="group bg-muted border-border/40 relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border shadow-sm"
                                                >
                                                    <img
                                                        src={imageSrc}
                                                        alt={item.catalog_item.name}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                                                        <ExternalLink className="size-5 text-white" aria-hidden="true" />
                                                    </span>
                                                </Link>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground text-sm leading-tight font-semibold md:text-base">
                                                        {item.catalog_item.name}
                                                    </span>
                                                    <span className="text-muted-foreground mt-1 text-xs font-medium">
                                                        Base Price: ${item.catalog_item.base_price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Configuration */}
                                            {item.configuration && item.configuration.options.length > 0 && (
                                                <div className="text-muted-foreground bg-muted/30 border-border/40 mt-1 ml-24 flex w-fit flex-col gap-1.5 rounded-lg border p-2.5 text-xs">
                                                    <span className="text-muted-foreground/70 mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                                                        Configuration
                                                    </span>
                                                    {item.configuration.options.map((opt) => (
                                                        <div key={opt.option_id} className="flex gap-2">
                                                            <span className="text-foreground/70 font-medium">{opt.category_name}:</span>
                                                            <span>{opt.name}</span>
                                                            <span className="text-primary/70 font-mono text-[11px] font-semibold">
                                                                (+${opt.price_delta.toLocaleString()})
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Unit Price */}
                                        <div className="flex items-center justify-between md:justify-center">
                                            <span className="text-muted-foreground text-sm md:hidden">Unit Price</span>
                                            <span className="text-foreground font-medium">${formatMoney(item.unit_price)}</span>
                                        </div>

                                        {/* Quantity */}
                                        <div className="flex items-center justify-between md:justify-center">
                                            <span className="text-muted-foreground text-sm md:hidden">Quantity</span>
                                            <div className="flex flex-col items-end gap-1 md:items-center">
                                                <div className="border-border bg-background flex items-center rounded-full border p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleUpdateQuantity(item.cart_item_id, item.quantity, item.quantity - 1)
                                                        }
                                                        disabled={busy || !canDecrement}
                                                        aria-label="Decrease quantity"
                                                        className="hover:bg-muted text-muted-foreground h-7 w-7 rounded-full disabled:opacity-40"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-semibold">
                                                        {busy ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleUpdateQuantity(item.cart_item_id, item.quantity, item.quantity + 1)
                                                        }
                                                        disabled={busy || !canIncrement}
                                                        aria-label="Increase quantity"
                                                        className="hover:bg-muted text-muted-foreground h-7 w-7 rounded-full disabled:opacity-40"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <span className="text-muted-foreground text-[10px] font-medium tracking-wide">
                                                    Max {maxQty}
                                                    <span className="text-muted-foreground/70"> · {maxQty < QUANTITY_MAX ? "stock" : "limit"}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Line Total */}
                                        <div className="flex items-center justify-between md:justify-end md:pr-6">
                                            <span className="text-muted-foreground text-sm md:hidden">Line Total</span>
                                            <span className="text-foreground text-base font-bold">${formatMoney(item.line_total)}</span>
                                        </div>

                                        {/* Remove Item */}
                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleRemoveItem(item.cart_item_id)}
                                                disabled={busy}
                                                className="border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 h-9 w-9 rounded-full transition-colors"
                                            >
                                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="border-border/60 mt-2 flex items-center justify-between border-t pt-6">
                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => p - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="h-9 transition-colors"
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-foreground/70 px-2 text-sm font-medium">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={!pagination.hasNext}
                                        className="h-9 transition-colors"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Total */}
                    <div className="w-full shrink-0 lg:w-95">
                        <div className="border-border bg-card text-card-foreground sticky top-28 rounded-xl border p-6 shadow-sm md:p-8">
                            <h2 className="mb-6 text-xl font-bold tracking-tight">Cart Totals</h2>

                            <div className="border-border/60 flex items-center justify-between border-b py-4">
                                <span className="text-muted-foreground text-sm">Subtotal</span>
                                <span className="text-foreground font-bold">${formatMoney(subtotal)}</span>
                            </div>

                            <div className="border-border/60 flex items-center justify-between border-b py-4">
                                <span className="text-muted-foreground text-sm">Tax</span>
                                <span className="text-foreground text-sm font-bold">-</span>
                            </div>

                            <div className="mb-4 flex items-center justify-between py-4">
                                <span className="text-muted-foreground text-sm">Total</span>
                                <span className="text-foreground text-xl font-bold">${formatMoney(subtotal)}</span>
                            </div>

                            {authStatus === "authenticated" ? (
                                <Button asChild className="bg-primary text-primary-foreground group h-12 w-full rounded-md text-base font-medium">
                                    <Link to="/checkout">
                                        Proceed to Checkout
                                        <ArrowUpRight
                                            className="ml-2 h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100"
                                            strokeWidth={2.5}
                                        />
                                    </Link>
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button asChild className="bg-primary text-primary-foreground group h-12 w-full rounded-md text-base font-medium">
                                        <Link to="/auth/login">Sign In to Checkout</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="text-foreground group border-border/80 hover:bg-muted h-12 w-full rounded-md text-base font-medium"
                                    >
                                        <Link to="/checkout">
                                            Checkout as Guest
                                            <ArrowUpRight
                                                className="ml-2 h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100"
                                                strokeWidth={2.5}
                                            />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
