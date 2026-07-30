import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkoutKeys, type CheckoutResponse } from "@/hooks/api/order/use-checkout";
import { useAuthStatus } from "@/hooks/use-me";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { formatCad } from "@/lib/checkout";

export const Route = createFileRoute("/(shop)/_layout/checkout-success")({
    component: CheckoutSuccessPage,
});

function paymentMethodLabel(method: string | undefined) {
    switch (method) {
        case "credit_card":
            return "Credit Card";
        case "debit_card":
            return "Debit Card";
        case "apple_pay":
            return "Apple Pay";
        default:
            return method?.replaceAll("_", " ") || "-";
    }
}

function CheckoutSuccessPage() {
    const { status, user } = useAuthStatus();
    const isCustomer = status === "authenticated" && user?.role === "customer";
    const orderData = queryClient.getQueryData<CheckoutResponse>(checkoutKeys.result);
    const [today] = useState(() =>
        new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    );

    if (!orderData) {
        return (
            <div className="mx-auto mt-16 flex max-w-lg flex-col items-center px-4 py-12 text-center">
                <h1 className="text-2xl font-bold tracking-tight">No recent order found</h1>
                <p className="text-muted-foreground mt-2 text-sm">Place an order from checkout to see your confirmation here.</p>
                <Button asChild className="mt-6">
                    <Link to="/catalog">Browse catalog</Link>
                </Button>
            </div>
        );
    }

    const items = orderData.items ?? [];

    return (
        <div className="mx-auto mt-16 max-w-4xl px-4 py-12 md:px-6">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Check strokeWidth={3} className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your order is completed!</h1>
                <p className="text-muted-foreground mt-3 text-lg">Thank you. Your order has been received.</p>
                <p className="text-muted-foreground mt-1 text-sm">A confirmation email with your order details is on its way.</p>
            </div>

            <div className="mt-12">
                <div className="rounded-xl border-2 border-dashed border-blue-200/60 bg-blue-50/50 p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Order Number</span>
                            <span className="text-foreground font-semibold">{orderData.order_id}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Date</span>
                            <span className="text-foreground font-semibold">{today}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Total</span>
                            <span className="text-foreground font-semibold">{formatCad(orderData.total)}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase">Payment Method</span>
                            <span className="text-foreground font-semibold">{paymentMethodLabel(orderData.payment?.payment_method)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card mt-8 rounded-xl border p-6 shadow-sm md:p-8">
                    <h2 className="mb-6 text-xl font-bold tracking-tight">Order details</h2>
                    <div className="space-y-4 text-sm">
                        <div className="text-muted-foreground flex justify-between border-b pb-3 font-medium">
                            <span>Product</span>
                            <span>Subtotal</span>
                        </div>

                        {items.length > 0 ? (
                            items.map((item) => (
                                <div key={`${item.cid}-${item.config_id ?? "base"}`} className="flex justify-between gap-4 border-b py-3">
                                    <div className="min-w-0">
                                        <Link
                                            to="/catalog/$cid"
                                            params={{ cid: String(item.cid) }}
                                            className="text-primary font-medium hover:underline"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {formatCad(item.unit_price)} × {item.quantity}
                                            {item.config_id != null ? ` · Config #${item.config_id}` : null}
                                        </p>
                                    </div>
                                    <span className="shrink-0 font-medium">{formatCad(item.line_total)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground py-2 text-xs">Line items were not included with this confirmation.</p>
                        )}

                        <div className="flex justify-between pt-2">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">{formatCad(orderData.subtotal)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-medium">{formatCad(orderData.tax)}</span>
                        </div>
                        <div className="flex justify-between pt-1 text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCad(orderData.total)}</span>
                        </div>
                        <p className="text-muted-foreground pt-2 text-xs">
                            Status: {orderData.order_status} · Payment: {orderData.payment_status}
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-3">
                    <Button asChild variant="outline">
                        <Link to="/catalog">Continue shopping</Link>
                    </Button>
                    {isCustomer ? (
                        <Button asChild>
                            <Link to="/dashboard/customer/orders">View orders</Link>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
