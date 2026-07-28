import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { MOCK_ITEMS, resolveUnitPrice } from "@/lib/mock-cart";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { useGetCustomerOrderById } from "@/hooks/api/order/use-customer-orders";

export const Route = createFileRoute("/(shop)/_layout/checkout-success")({
    component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
    const orderData = queryClient.getQueryData(["checkout-data"]) as any;
    const finalTotal = 100;

    const orderId = orderData?.order_id;
    const [today] = useState(() =>
        new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    );

    return (
        <div className="mx-auto mt-16 max-w-4xl px-4 py-12 md:px-6">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Check strokeWidth={3} className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your order is completed!</h1>
                <p className="text-muted-foreground mt-3 text-lg">Thank you. Your order has been received.</p>
            </div>

            <div className="mt-12">
                {/* Information Box */}
                <div className="rounded-xl border-2 border-dashed border-blue-200/60 bg-blue-50/50 p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Order Number</span>
                            <span className="text-foreground font-semibold">{orderId}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Date</span>
                            <span className="text-foreground font-semibold">{today}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Total</span>
                            <span className="text-foreground font-semibold">
                                ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Payment Method</span>
                            <span className="text-foreground font-semibold">Credit Card</span>
                        </div>
                    </div>
                </div>

                {/* Order Details Details */}

                {/* <div className="bg-card mt-8 rounded-xl border p-6 shadow-sm md:p-8">
                    <h2 className="mb-6 text-xl font-bold tracking-tight">Order details</h2>

                    <div className="space-y-4 text-sm">
                        <div className="text-foreground flex justify-between border-b pb-4 font-semibold">
                            <span>Product</span>
                            <span>Subtotal</span>
                        </div>

                        {MOCK_ITEMS.map((item) => (
                            <div key={item.id} className="flex flex-col border-b py-2 pb-4">
                                <div className="flex justify-between pb-1">
                                    <span className="text-primary hover:underline">
                                        {item.name} <span className="text-muted-foreground text-xs">x {item.quantity}</span>
                                    </span>
                                    <span className="text-foreground font-medium">
                                        $
                                        {(resolveUnitPrice(item) * item.quantity).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                {item.configuration && item.configuration.options.length > 0 && (
                                    <div className="text-muted-foreground mt-1 flex flex-col gap-1.5 pl-2 text-xs">
                                        {item.configuration.options.map((opt, i) => (
                                            <div key={i} className="flex justify-between pr-4">
                                                <span>
                                                    - {opt.category_name}: {opt.name}
                                                </span>
                                                <span className="text-muted-foreground/70 text-[10px]">(+${opt.price_delta.toLocaleString()})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex justify-between pt-2">
                            <span className="text-foreground font-semibold">Subtotal</span>
                            <span className="text-muted-foreground font-medium">
                                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between border-b py-2 pb-4">
                            <span className="text-foreground font-semibold">Shipping</span>
                            <span className="text-muted-foreground font-medium">
                                ${shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 text-lg font-bold">
                            <span>Total</span>
                            <span>${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
