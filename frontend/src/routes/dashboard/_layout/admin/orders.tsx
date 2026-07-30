import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { QueryError } from "@/components/common/QueryError";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUiStore } from "@/stores/ui-store";
import {
    getAllowedOrderStatusTransitions,
    getAllowedPaymentStatusTransitions,
    ORDER_STATUS_TRANSITIONS,
    updateAdminOrderPaymentStatusVariables,
    updateAdminOrderStatusVariables,
    useGetAdminOrders,
    useUpdateAdminOrderPaymentStatus,
    useUpdateAdminOrderStatus,
    type AdminOrderListItem,
    type OrderStatus,
    type PaymentStatus,
} from "@/hooks/api/order/use-admin-orders";

export const Route = createFileRoute("/dashboard/_layout/admin/orders")({
    component: RouteComponent,
});

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    unpaid: "Unpaid",
    paid: "Paid",
    failed: "Failed",
};

function orderStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    if (status === "delivered") return "default";
    if (status === "confirmed" || status === "shipped") return "secondary";
    if (status === "cancelled") return "destructive";
    return "outline";
}

function paymentStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    if (status === "paid") return "default";
    if (status === "failed") return "destructive";
    return "outline";
}

function pendingOrderIdFromUrl(url: string | undefined, suffix: string) {
    if (!url) return null;
    const match = url.match(new RegExp(`/orders/(\\d+)/${suffix}`));
    return match ? Number(match[1]) : null;
}

function RouteComponent() {
    "use no memo";

    const { openModal } = useUiStore();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const ordersQuery = useGetAdminOrders(pagination.pageIndex + 1, pagination.pageSize);
    const updateOrderStatus = useUpdateAdminOrderStatus();
    const updatePaymentStatus = useUpdateAdminOrderPaymentStatus();
    const data = ordersQuery.data?.items ?? [];

    const pendingStatusOrderId = updateOrderStatus.isPending ? pendingOrderIdFromUrl(updateOrderStatus.variables?.url, "status") : null;
    const pendingPaymentOrderId = updatePaymentStatus.isPending ? pendingOrderIdFromUrl(updatePaymentStatus.variables?.url, "payment-status") : null;

    function handleOrderStatusChange(order: AdminOrderListItem, nextStatus: string) {
        const allowed = getAllowedOrderStatusTransitions(order.order_status, order.payment_status);
        if (!allowed.includes(nextStatus as OrderStatus) || nextStatus === order.order_status) {
            return;
        }
        updateOrderStatus.mutate(updateAdminOrderStatusVariables(order.order_id, nextStatus as OrderStatus));
    }

    function handlePaymentStatusChange(order: AdminOrderListItem, nextStatus: string) {
        const allowed = getAllowedPaymentStatusTransitions(order.payment_status);
        if (!allowed.includes(nextStatus as PaymentStatus) || nextStatus === order.payment_status) {
            return;
        }
        updatePaymentStatus.mutate(updateAdminOrderPaymentStatusVariables(order.order_id, nextStatus as PaymentStatus));
    }

    const columns = useMemo<ColumnDef<AdminOrderListItem>[]>(
        () => [
            {
                accessorKey: "order_id",
                header: "Order ID",
                cell: ({ getValue }) => <span className="font-mono font-medium">#{getValue<number>()}</span>,
            },
            {
                id: "buyer",
                header: "Buyer",
                cell: ({ row }) => {
                    const order = row.original;
                    if (order.user) {
                        return (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {order.user.first_name} {order.user.last_name}
                                </span>
                                <span className="text-muted-foreground text-xs">{order.user.email}</span>
                            </div>
                        );
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Guest Checkout</span>
                            <span className="text-muted-foreground text-xs">{order.guest_email ?? "Unregistered"}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "created_at",
                header: "Date",
                cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
            },
            {
                accessorKey: "total",
                header: "Total",
                cell: ({ getValue }) =>
                    getValue<number>().toLocaleString("en-US", {
                        style: "currency",
                        currency: "CAD",
                    }),
            },
            {
                accessorKey: "payment_status",
                header: "Payment",
                cell: ({ row }) => {
                    const order = row.original;
                    const status = order.payment_status;
                    const allowed = getAllowedPaymentStatusTransitions(status);
                    const isUpdating = pendingPaymentOrderId === order.order_id;
                    const options = [status, ...allowed.filter((value) => value !== status)];

                    if (allowed.length === 0) {
                        return (
                            <Badge variant={paymentStatusBadgeVariant(status)} className="capitalize">
                                {PAYMENT_STATUS_LABELS[status] ?? status}
                            </Badge>
                        );
                    }

                    return (
                        <Select value={status} disabled={isUpdating} onValueChange={(value) => handlePaymentStatusChange(order, value)}>
                            <SelectTrigger size="sm" className="w-28 capitalize">
                                <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {options.map((value) => (
                                        <SelectItem key={value} value={value} disabled={value === status}>
                                            {PAYMENT_STATUS_LABELS[value] ?? value}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    );
                },
            },
            {
                accessorKey: "order_status",
                header: "Status",
                cell: ({ row }) => {
                    const order = row.original;
                    const status = order.order_status;
                    const rawTransitions = isOrderStatusSafe(status) ? ORDER_STATUS_TRANSITIONS[status] : [];
                    const allowed = getAllowedOrderStatusTransitions(status, order.payment_status);
                    const isUpdating = pendingStatusOrderId === order.order_id;
                    const options = [status, ...allowed.filter((value) => value !== status)];
                    const needsPaymentForNextStep =
                        order.payment_status !== "paid" && rawTransitions.some((value) => value === "shipped" || value === "delivered");

                    if (allowed.length === 0) {
                        return (
                            <div className="flex flex-col gap-1">
                                <Badge variant={orderStatusBadgeVariant(status)} className="w-fit capitalize">
                                    {ORDER_STATUS_LABELS[status] ?? status}
                                </Badge>
                                {needsPaymentForNextStep ? <span className="text-muted-foreground text-xs">Mark paid to ship</span> : null}
                            </div>
                        );
                    }

                    return (
                        <div className="flex flex-col gap-1">
                            <Select value={status} disabled={isUpdating} onValueChange={(value) => handleOrderStatusChange(order, value)}>
                                <SelectTrigger size="sm" className="w-32 capitalize">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {options.map((value) => (
                                            <SelectItem key={value} value={value} disabled={value === status}>
                                                {ORDER_STATUS_LABELS[value] ?? value}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {needsPaymentForNextStep ? <span className="text-muted-foreground text-xs">Mark paid to ship</span> : null}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <div className="flex justify-end pr-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                openModal("orderDetail", {
                                    orderId: row.original.order_id,
                                    scope: "admin",
                                })
                            }
                        >
                            View Details
                        </Button>
                    </div>
                ),
            },
        ],
        // Handlers close over stable mutation.mutate; pending ids drive disabled state.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers intentionally omitted
        [openModal, pendingPaymentOrderId, pendingStatusOrderId]
    );

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        rowCount: ordersQuery.data?.pagination.total ?? 0,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <ContentSection
            title="All Orders"
            desc="Global view of all store orders including customer and guest checkouts."
            withRefresh
            RefreshFunction={() => void ordersQuery.refetch()}
        >
            <div className="mt-4 flex flex-col gap-4">
                {ordersQuery.isError ? (
                    <QueryError
                        title="Couldn't load orders"
                        error={ordersQuery.error}
                        onRetry={() => void ordersQuery.refetch()}
                        isRetrying={ordersQuery.isFetching}
                    />
                ) : null}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {ordersQuery.isPending ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                                        Loading orders...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className={ordersQuery.isFetching ? "opacity-60" : undefined}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination table={table} />
            </div>
        </ContentSection>
    );
}

function isOrderStatusSafe(value: string): value is OrderStatus {
    return value in ORDER_STATUS_LABELS;
}
