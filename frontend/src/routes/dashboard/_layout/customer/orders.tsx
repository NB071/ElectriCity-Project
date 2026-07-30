import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { QueryError } from "@/components/common/QueryError";
import { DataTablePagination } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetCustomerOrders, type CustomerOrderListItem } from "@/hooks/api/order/use-customer-orders";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/dashboard/_layout/customer/orders")({
    component: RouteComponent,
});

function orderStatusVariant(status: CustomerOrderListItem["order_status"]): "default" | "secondary" | "destructive" | "outline" {
    if (status === "delivered") return "default";
    if (status === "confirmed" || status === "shipped") return "secondary";
    if (status === "cancelled") return "destructive";
    return "outline";
}

function RouteComponent() {
    "use no memo";

    const { openModal } = useUiStore();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const ordersQuery = useGetCustomerOrders(pagination.pageIndex + 1, pagination.pageSize);
    const data = ordersQuery.data?.items ?? [];

    const columns = useMemo<ColumnDef<CustomerOrderListItem>[]>(
        () => [
            {
                accessorKey: "order_id",
                header: "Order ID",
                cell: ({ getValue }) => <span className="font-mono font-semibold">#{getValue<number>()}</span>,
            },
            {
                accessorKey: "created_at",
                header: "Date Placed",
                cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
            },
            {
                accessorKey: "item_count",
                header: "Items",
                cell: ({ getValue }) => {
                    const count = getValue<number>();
                    return `${count} ${count === 1 ? "item" : "items"}`;
                },
            },
            {
                accessorKey: "order_status",
                header: "Status",
                cell: ({ getValue }) => {
                    const status = getValue<CustomerOrderListItem["order_status"]>();
                    return (
                        <Badge variant={orderStatusVariant(status)} className="capitalize">
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "payment_status",
                header: "Payment",
                cell: ({ getValue }) => {
                    const status = getValue<CustomerOrderListItem["payment_status"]>();
                    return (
                        <Badge variant={status === "paid" ? "default" : status === "failed" ? "destructive" : "outline"} className="capitalize">
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "total",
                header: () => <div className="text-right">Total</div>,
                cell: ({ getValue }) => (
                    <div className="text-right font-medium">
                        {getValue<number>().toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                        })}
                    </div>
                ),
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                    <span className="sr-only">Open actions menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            openModal("orderDetail", {
                                                orderId: row.original.order_id,
                                                scope: "customer",
                                            })
                                        }
                                    >
                                        View Details
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [openModal]
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
            title="My Orders"
            desc="View your past transactions and track current shipments."
            withRefresh
            RefreshFunction={() => void ordersQuery.refetch()}
        >
            <div className="mt-4 flex flex-col gap-4">
                {ordersQuery.isError ? (
                    <QueryError
                        title="Couldn't load your orders"
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
