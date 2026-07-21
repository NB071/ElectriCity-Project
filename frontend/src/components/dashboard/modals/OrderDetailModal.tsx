import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, CreditCard, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";

export function OrderDetailModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.orderDetail;
    const orderData = data?.orderData;

    const handleOpenChange = (open: boolean) => {
        if (!open) closeModal("orderDetail");
    };

    if (!orderData) return null;

    let statusVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
    if (orderData.order_status === "delivered") statusVariant = "default";
    else if (orderData.order_status === "processing" || orderData.order_status === "shipped") statusVariant = "secondary";
    else if (orderData.order_status === "cancelled") statusVariant = "destructive";

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="flex h-160 flex-col overflow-hidden p-0 sm:max-w-[700px]">
                <DialogHeader className="border-b px-6 pt-6 pb-2">
                    <DialogTitle className="mr-10 flex items-center justify-between">
                        <span>Order Details</span>
                        <Badge variant={statusVariant} className="capitalize shadow-sm">
                            {orderData.order_status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Order ID: <span className="font-mono text-xs">{orderData.order_id}</span> <br />
                        Placed on {new Date(orderData.created_at).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="min-h-0 w-full flex-1 px-6">
                    <div className="flex flex-col gap-6 py-4 pb-6">
                        {/* Order Meta Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h4 className="flex items-center gap-2 text-sm font-medium">
                                    <CreditCard className="text-muted-foreground h-4 w-4" /> Payment
                                </h4>
                                <p className="text-sm capitalize">{orderData.payment_status}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="flex items-center gap-2 text-sm font-medium">
                                    <Package className="text-muted-foreground h-4 w-4" /> Items
                                </h4>
                                <p className="text-sm">{orderData.item_count} items</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment History */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold">Payment History</h3>
                            {orderData.payment_attempts && orderData.payment_attempts.length > 0 ? (
                                <div className="space-y-3">
                                    {orderData.payment_attempts.map((attempt: any) => (
                                        <div
                                            key={attempt.attempt_id}
                                            className="bg-muted/10 flex items-center justify-between gap-4 rounded-md border p-3 text-sm"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            attempt.status === "success"
                                                                ? "default"
                                                                : attempt.status === "failed"
                                                                  ? "destructive"
                                                                  : "secondary"
                                                        }
                                                        className="h-5 text-[10px] tracking-wider uppercase"
                                                    >
                                                        {attempt.status}
                                                    </Badge>
                                                    <span className="text-foreground text-[10px] font-semibold tracking-widest uppercase">
                                                        {attempt.payment_method.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <span className="text-muted-foreground mt-1 text-xs">
                                                    {new Date(attempt.attempted_at).toLocaleString()}
                                                </span>
                                                <span className="text-muted-foreground font-mono text-[10px] opacity-50">{attempt.attempt_id}</span>
                                            </div>
                                            <span className="font-semibold">${Number(attempt.amount).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty className="border p-6">
                                    <EmptyMedia variant="icon">
                                        <CreditCard />
                                    </EmptyMedia>
                                    <EmptyTitle>No payments recorded</EmptyTitle>
                                    <EmptyDescription>There are no transaction attempts attached to this order.</EmptyDescription>
                                </Empty>
                            )}
                        </div>

                        <Separator />

                        {/* Addresses */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold">Addresses</h3>
                            {orderData.addresses && orderData.addresses.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {orderData.addresses.map((address: any, idx: number) => (
                                        <div key={idx} className="space-y-1">
                                            <h4 className="flex items-center gap-2 text-sm font-medium capitalize">
                                                <MapPin className="text-muted-foreground h-4 w-4" /> {address.address_type} Address
                                            </h4>
                                            <p className="text-muted-foreground text-sm">
                                                {address.full_name} <br />
                                                {address.phone_number && (
                                                    <>
                                                        {address.phone_number} <br />
                                                    </>
                                                )}
                                                {address.street} <br />
                                                {address.city}, {address.province} {address.postal_code} <br />
                                                {address.country}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty className="border p-6">
                                    <EmptyMedia variant="icon">
                                        <MapPin />
                                    </EmptyMedia>
                                    <EmptyTitle>No addresses saved</EmptyTitle>
                                    <EmptyDescription>This order has no shipping or billing details recorded.</EmptyDescription>
                                </Empty>
                            )}
                        </div>
                        <Separator />

                        {/* Items List */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold">Ordered Items</h3>
                            {orderData.items && orderData.items.length > 0 ? (
                                <div className="space-y-3">
                                    {orderData.items.map((item: any) => (
                                        <div key={item.order_item_id} className="flex flex-col gap-3 rounded-md border p-4 text-sm">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-foreground font-semibold">{item.catalog_item?.name}</span>
                                                        {item.catalog_item?.is_active === true && (
                                                            <Badge
                                                                variant="outline"
                                                                className="h-5 border-green-600/30 bg-green-600/10 text-[10px] text-green-600 uppercase"
                                                            >
                                                                Active
                                                            </Badge>
                                                        )}
                                                        {item.catalog_item?.is_active === false && (
                                                            <Badge variant="outline" className="text-muted-foreground h-5 text-[10px] uppercase">
                                                                Discontinued
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                                        <span>{item.catalog_item?.cid}</span> &bull;{" "}
                                                        <span className="capitalize">{item.catalog_item?.item_type}</span>
                                                        {item.catalog_item?.base_price !== undefined && (
                                                            <span>&bull; Base: ${Number(item.catalog_item.base_price).toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold">${Number(item.line_total).toFixed(2)}</span>
                                                    <div className="text-muted-foreground mt-0.5 text-xs">
                                                        Qty: {item.quantity} &times; ${Number(item.unit_price).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {(item.configuration?.options?.length > 0 || item.configuration?.config_id) && (
                                                <div className="bg-muted/40 border-border/50 mt-1 flex flex-col gap-1 rounded border p-3 text-xs">
                                                    <div className="text-muted-foreground border-border/50 mb-1 flex justify-between border-b pb-1 font-medium">
                                                        <span>
                                                            Configuration {item.configuration?.config_id && `(${item.configuration.config_id})`}
                                                        </span>
                                                        {item.configuration?.total_price && (
                                                            <span>${Number(item.configuration.total_price).toFixed(2)} Build Cost</span>
                                                        )}
                                                    </div>
                                                    {item.configuration?.options?.map((opt: any, idx: number) => (
                                                        <div key={idx} className="text-muted-foreground flex justify-between py-0.5">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="text-foreground/70 font-semibold">{opt.category_name}:</span>
                                                                <span>{opt.name}</span>
                                                                {opt.select_type && (
                                                                    <span className="text-[10px] opacity-60">({opt.select_type})</span>
                                                                )}
                                                            </span>
                                                            <span>+{Number(opt.price_delta || 0).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty className="border p-6">
                                    <EmptyMedia variant="icon">
                                        <Package />
                                    </EmptyMedia>
                                    <EmptyTitle>No items found</EmptyTitle>
                                    <EmptyDescription>There are no valid items attached to this order record.</EmptyDescription>
                                </Empty>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                {/* Cost Breakdown Footer */}
                <div className="bg-muted/20 rounded-b-lg border-t px-6 py-4">
                    <div className="ml-auto w-1/2 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">${Number(orderData.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-medium">${Number(orderData.tax).toFixed(2)}</span>
                        </div>
                        <Separator className="my-1.5" />
                        <div className="flex justify-between text-sm font-bold">
                            <span>Total</span>
                            <span>${Number(orderData.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
