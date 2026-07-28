import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStatus } from "@/hooks/use-me";
import { useGetCartSummary } from "@/hooks/api/cart/use-cart-queries";
import { mediaUrl } from "@/lib/media";

const PREVIEW_LIMIT = 5;

function formatMoney(value: number) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartSection() {
    const { user, status } = useAuthStatus();
    const isAdmin = status === "authenticated" && user?.role === "admin";
    const canLoadCart = status !== "unknown" && !isAdmin;

    const { data, isPending } = useGetCartSummary(PREVIEW_LIMIT, { enabled: canLoadCart });

    if (isAdmin) return null;

    const items = data?.preview ?? [];
    const count = data?.item_count ?? 0;
    const previewLimit = data?.preview_limit ?? PREVIEW_LIMIT;
    const showingPreview = items.length > 0;
    const hasMore = count > items.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Cart, ${count} items`}
                    className={cn(
                        "relative text-white hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white",
                        "transition-all duration-300"
                    )}
                >
                    <ShoppingCart className="size-6" />
                    {count > 0 ? <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">{count > 99 ? "99+" : count}</Badge> : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/50 w-[320px] overflow-hidden rounded-xl p-0 transition-all duration-300">
                <div className="bg-muted border-border/50 border-b px-4 py-3">
                    <div className="flex items-center justify-between font-semibold">
                        <span>Shopping Cart</span>
                        <Badge variant="secondary" className="hover:bg-secondary rounded-full shadow-none">
                            {isPending ? "..." : `${count} Items`}
                        </Badge>
                    </div>
                    {showingPreview && (
                        <p className="text-muted-foreground mt-1 text-[11px] font-medium">
                            {hasMore
                                ? `Preview of last ${previewLimit} items added`
                                : `Preview · ${items.length} item${items.length === 1 ? "" : "s"}`}
                        </p>
                    )}
                </div>
                {isPending ? (
                    <div className="text-muted-foreground flex items-center justify-center p-8 text-sm">Loading cart...</div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <ShoppingCart className="text-muted-foreground mb-3 size-10 opacity-30" />
                        <p className="text-muted-foreground text-sm font-medium">Your cart is empty.</p>
                    </div>
                ) : (
                    <div className="flex max-h-75 flex-col gap-1 overflow-y-auto p-2">
                        {items.map((item) => {
                            const image = mediaUrl(item.primary_image_url) ?? undefined;
                            return (
                                <DropdownMenuItem
                                    key={item.cart_item_id}
                                    asChild
                                    className="focus:bg-muted/50 rounded-lg p-0 transition-all duration-300"
                                >
                                    <Link to="/cart" className="flex items-start gap-4 p-2">
                                        <div className="bg-background border-border/40 relative z-0 size-12 shrink-0 origin-center overflow-hidden rounded-md border shadow-sm transition-transform duration-300 ease-out hover:z-20 hover:scale-125 hover:shadow-md">
                                            {image ? (
                                                <img src={image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex size-full items-center justify-center">
                                                    <ShoppingCart className="text-muted-foreground/30 size-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-start overflow-hidden">
                                            <span className="truncate text-sm font-semibold">{item.name}</span>
                                            <span className="text-muted-foreground mt-0.5 text-[11px]">Qty {item.quantity}</span>
                                            <span className="text-primary mt-1 text-xs font-bold">{formatMoney(item.line_total)}</span>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })}
                        {hasMore && (
                            <p className="text-muted-foreground px-2 py-1.5 text-center text-xs">
                                +{count - items.length} older item{count - items.length === 1 ? "" : "s"} — view full cart
                            </p>
                        )}
                    </div>
                )}

                <div className="border-border/50 bg-muted/20 border-t p-4">
                    {data != null && data.item_count > 0 && (
                        <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs">
                            <span>Subtotal</span>
                            <span className="text-foreground font-semibold">{formatMoney(data.subtotal)}</span>
                        </div>
                    )}
                    <Button asChild className="bg-primary text-primary-foreground h-11 w-full rounded-lg font-semibold shadow-sm">
                        <Link to="/cart">View Cart</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
