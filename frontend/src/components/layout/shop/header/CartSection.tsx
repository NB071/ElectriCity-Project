import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const SAMPLE_CART = {
    count: 2,
    items: [
        { id: "1", name: "Tesla Model 3", price: "$54,990", image: "/logo192.png" },
        { id: "2", name: "Hyundai Ioniq 5", price: "$54,999", image: "/logo192.png" },
    ],
};

export function CartSection({ count, items }: { count: number; items: { id: string; name: string; price: string; image?: string }[] }) {
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
                <div className="bg-muted border-border/50 flex items-center justify-between border-b px-4 py-3 font-semibold">
                    <span>Shopping Cart</span>
                    <Badge variant="secondary" className="hover:bg-secondary rounded-full shadow-none">
                        {count} Items
                    </Badge>
                </div>
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <ShoppingCart className="text-muted-foreground mb-3 size-10 opacity-30" />
                        <p className="text-muted-foreground text-sm font-medium">Your cart is empty.</p>
                    </div>
                ) : (
                    <div className="flex max-h-75 flex-col gap-1 overflow-y-auto p-2">
                        {items.map((item) => (
                            <DropdownMenuItem key={item.id} className="focus:bg-muted/50 flex cursor-pointer items-start gap-4 rounded-lg p-2">
                                <div className="bg-background border-border/40 flex size-12 shrink-0 items-center justify-center rounded-md border p-1">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="h-full w-full object-contain opacity-70 grayscale" />
                                    ) : (
                                        <ShoppingCart className="text-muted-foreground/30 size-5" />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-start overflow-hidden">
                                    <span className="truncate text-sm font-semibold">{item.name}</span>
                                    <span className="text-primary mt-1 text-xs font-bold">{item.price}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
                <div className="border-border/50 bg-muted/20 border-t p-4">
                    <Button asChild className="bg-primary text-primary-foreground h-11 w-full rounded-lg font-semibold shadow-sm">
                        <Link to="/cart">Proceed to Checkout</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
