import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Minus, Plus, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/(shop)/_layout/cart")({
    component: CartComponent,
});

import { MOCK_ITEMS, resolveUnitPrice } from "@/lib/mock-cart";

// Backend pagination response mock builder
function getMockPagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit) || 0;
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

function CartComponent() {
    const [mockItems, setMockItems] = useState(MOCK_ITEMS);
    const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
    const authStatus = useAuthStore((state) => state.status);

    const handleUpdateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setUpdatingItems((prev) => ({ ...prev, [id]: true }));

        // Simulate network API request to PUT /api/shop/cart/:id
        await new Promise((resolve) => setTimeout(resolve, 400));

        setMockItems(mockItems.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)));
        setUpdatingItems((prev) => ({ ...prev, [id]: false }));
    };

    const handleRemoveItem = async (id: string) => {
        setUpdatingItems((prev) => ({ ...prev, [id]: true }));

        // Simulate network API request to DELETE /api/shop/cart/:id
        await new Promise((resolve) => setTimeout(resolve, 400));

        setMockItems(mockItems.filter((i) => i.id !== id));
        // No need to clear updating status since the item unmounts
    };
    const [page, setPage] = useState(1);
    const limit = 2; // strictly limit 2 per page for mocking

    // Simulated Backend Query
    const total = mockItems.length;
    const pagination = getMockPagination(page, limit, total);

    // Slice data explicitly matching backend SQL OFFSET + LIMIT limits
    const currentItems = mockItems.slice((page - 1) * limit, page * limit);

    // Totals Math
    const subtotal = mockItems.reduce((sum, item) => sum + resolveUnitPrice(item) * item.quantity, 0);
    const taxRate = 0.0825; // 8.25% mock tax
    const estimatedTax = subtotal * taxRate;
    const finalTotal = subtotal + estimatedTax;

    return (
        <div className="container mx-auto mt-16 max-w-7xl px-4 py-8 md:py-12">
            <div className="mb-4">
                <Breadcrumbs />
            </div>

            <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">Shop Cart</h1>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                {/* Main Cart Area */}
                <div className="w-full flex-1">
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
                        {currentItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`grid grid-cols-1 items-center gap-4 py-6 md:grid-cols-[3fr_1fr_1fr_1fr_auto] ${index !== currentItems.length - 1 ? "border-border/60 border-b" : ""}`}
                            >
                                {/* Mobile Header / Product */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-muted border-border/40 flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border p-2">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-contain opacity-50 grayscale" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-foreground text-sm leading-tight font-semibold md:text-base">{item.name}</span>
                                            <span className="text-muted-foreground mt-1 text-xs font-medium">
                                                Base Price: ${item.base_price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {item.configuration && item.configuration.options.length > 0 && (
                                        <div className="text-muted-foreground bg-muted/30 border-border/40 mt-1 ml-24 flex w-fit flex-col gap-1.5 rounded-lg border p-2.5 text-xs">
                                            <span className="text-muted-foreground/70 mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                                                Configuration
                                            </span>
                                            {item.configuration.options.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
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

                                {/* Price */}
                                <div className="flex items-center justify-between md:justify-center">
                                    <span className="text-muted-foreground text-sm md:hidden">Unit Price</span>
                                    <span className="text-foreground font-medium">${resolveUnitPrice(item).toLocaleString()}</span>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center justify-between md:justify-center">
                                    <span className="text-muted-foreground text-sm md:hidden">Quantity</span>
                                    <div className="border-border bg-background flex items-center rounded-full border p-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            disabled={updatingItems[item.id]}
                                            className="hover:bg-muted text-muted-foreground h-7 w-7 rounded-full"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-semibold">
                                            {updatingItems[item.id] ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : item.quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            disabled={updatingItems[item.id]}
                                            className="hover:bg-muted text-muted-foreground h-7 w-7 rounded-full"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Line Total */}
                                <div className="flex items-center justify-between md:justify-end md:pr-6">
                                    <span className="text-muted-foreground text-sm md:hidden">Line Total</span>
                                    <span className="text-foreground text-base font-bold">
                                        ${(resolveUnitPrice(item) * item.quantity).toLocaleString()}
                                    </span>
                                </div>

                                {/* Remove Button */}
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveItem(item.id)}
                                        disabled={updatingItems[item.id]}
                                        className="border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 h-9 w-9 rounded-full transition-colors"
                                    >
                                        {updatingItems[item.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

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
                </div>

                {/* Sidebar Total */}
                <div className="w-full shrink-0 lg:w-[380px]">
                    <div className="border-border bg-card text-card-foreground sticky top-28 rounded-xl border p-6 shadow-sm md:p-8">
                        <h2 className="mb-6 text-xl font-bold tracking-tight">Cart Totals</h2>

                        <div className="border-border/60 flex items-center justify-between border-b py-4">
                            <span className="text-muted-foreground text-sm">Subtotal</span>
                            <span className="text-foreground font-bold">
                                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="border-border/60 flex items-center justify-between border-b py-4">
                            <span className="text-muted-foreground text-sm">Estimated Tax (8.25%)</span>
                            <span className="text-foreground text-sm font-bold">
                                ${estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="mb-4 flex items-center justify-between py-4">
                            <span className="text-muted-foreground text-sm">Total</span>
                            <span className="text-foreground text-xl font-bold">
                                ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {authStatus === "authenticated" ? (
                            <Button asChild className="bg-primary text-primary-foreground group h-12 w-full rounded-md text-base font-medium">
                                <Link to="/checkout">
                                    Proceed to Checkout
                                    <ArrowUpRight className="ml-2 h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" strokeWidth={2.5} />
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
        </div>
    );
}
