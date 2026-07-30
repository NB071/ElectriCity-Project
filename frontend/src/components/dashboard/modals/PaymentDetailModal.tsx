import { CreditCard, Loader2, ShoppingBag, UserRound } from "lucide-react";
import { QueryError } from "@/components/common/QueryError";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetAdminPaymentById } from "@/hooks/api/payment/use-payments";
import { useUiStore } from "@/stores/ui-store";

export function PaymentDetailModal() {
    const { modals, closeModal, openModal } = useUiStore();
    const { isOpen, data } = modals.paymentDetail;
    const attemptId = data?.attemptId ?? 0;
    const paymentQuery = useGetAdminPaymentById(attemptId, isOpen);
    const payment = paymentQuery.data;

    function handleOpenChange(open: boolean) {
        if (!open) closeModal("paymentDetail");
    }

    function viewOrder() {
        if (!payment) return;
        closeModal("paymentDetail");
        openModal("orderDetail", {
            orderId: payment.order_id,
            scope: "admin",
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Payment Attempt</DialogTitle>
                    <DialogDescription>
                        Attempt <span className="font-mono">#{attemptId}</span>
                    </DialogDescription>
                </DialogHeader>

                {paymentQuery.isPending ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : paymentQuery.isError ? (
                    <QueryError
                        title="Couldn't load payment details"
                        error={paymentQuery.error}
                        onRetry={() => void paymentQuery.refetch()}
                        isRetrying={paymentQuery.isFetching}
                    />
                ) : payment ? (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="text-muted-foreground text-sm">Amount</p>
                                <p className="text-2xl font-semibold">
                                    {payment.amount.toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "CAD",
                                    })}
                                </p>
                            </div>
                            <Badge variant={payment.status === "success" ? "default" : "destructive"} className="capitalize">
                                {payment.status}
                            </Badge>
                        </div>

                        <div className="grid gap-4 text-sm sm:grid-cols-2">
                            <div className="flex gap-3">
                                <CreditCard className="text-muted-foreground size-4 shrink-0" />
                                <div>
                                    <p className="font-medium">Payment Method</p>
                                    <p className="text-muted-foreground capitalize">{payment.payment_method.replaceAll("_", " ")}</p>
                                </div>
                            </div>
                            <button type="button" className="flex gap-3 text-left" onClick={viewOrder}>
                                <ShoppingBag className="text-muted-foreground size-4 shrink-0" />
                                <div>
                                    <p className="font-medium">Order</p>
                                    <p className="text-primary font-mono hover:underline">#{payment.order_id}</p>
                                </div>
                            </button>
                            <div className="flex gap-3 sm:col-span-2">
                                <UserRound className="text-muted-foreground size-4 shrink-0" />
                                <div>
                                    <p className="font-medium">Buyer</p>
                                    {payment.user ? (
                                        <>
                                            <p>
                                                {payment.user.first_name} {payment.user.last_name}
                                            </p>
                                            <p className="text-muted-foreground">{payment.user.email}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">Guest checkout</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Attempted</span>
                            <span>{new Date(payment.attempted_at).toLocaleString()}</span>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
