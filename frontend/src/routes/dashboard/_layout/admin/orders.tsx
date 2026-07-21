import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/_layout/admin/orders")({
    component: RouteComponent,
});

type AdminOrderListItemDTO = {
    order_id: number;
    order_status: string;
    payment_status: string;
    subtotal: number;
    tax: number;
    total: number;
    item_count: number;
    created_at: string;
    updated_at: string;
    user_id: number | null;
    guest_email: string | null;
    user?: {
        user_id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
};

const MOCK_ADMIN_ORDERS: AdminOrderListItemDTO[] = [
    {
        order_id: 8492,
        order_status: "processing",
        payment_status: "paid",
        subtotal: 54990.0,
        tax: 3849.3,
        total: 58839.3,
        item_count: 1,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        user_id: 1,
        guest_email: null,
        user: {
            user_id: 1,
            first_name: "Admin",
            last_name: "User",
            email: "admin@electricity.com",
        },
    },
    {
        order_id: 8493,
        order_status: "shipped",
        payment_status: "paid",
        subtotal: 120.0,
        tax: 8.4,
        total: 128.4,
        item_count: 3,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        user_id: null,
        guest_email: "guest_buyer@example.com",
    },
    {
        order_id: 8494,
        order_status: "pending",
        payment_status: "unpaid",
        subtotal: 450.0,
        tax: 31.5,
        total: 481.5,
        item_count: 2,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        user_id: 44,
        guest_email: null,
        user: {
            user_id: 44,
            first_name: "Sarah",
            last_name: "Connor",
            email: "sarahc@example.com",
        },
    },
];

function RouteComponent() {
    const { openModal } = useUiStore();
    const [data, setData] = useState<AdminOrderListItemDTO[]>(MOCK_ADMIN_ORDERS);

    const handleStatusChange = (orderId: number, newStatus: string) => {
        // Implementation for API update would go here
        console.log(`Patching Order ${orderId} status to ${newStatus}`);

        setData((prevData) => prevData.map((order) => (order.order_id === orderId ? { ...order, order_status: newStatus } : order)));
    };

    const handlePaymentStatusChange = (orderId: number, newStatus: string) => {
        console.log(`Patching Order ${orderId} payment status to ${newStatus}`);

        setData((prevData) => prevData.map((order) => (order.order_id === orderId ? { ...order, payment_status: newStatus } : order)));
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "order_id",
                header: "Order ID",
                cell: (info: any) => <span className="font-mono font-medium">#{info.getValue()}</span>,
            },
            {
                id: "buyer",
                header: "Buyer",
                cell: ({ row }: any) => {
                    const original = row.original;
                    if (original.user) {
                        return (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {original.user.first_name} {original.user.last_name}
                                </span>
                                <span className="text-muted-foreground text-xs">{original.user.email}</span>
                            </div>
                        );
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="text-foreground/80 text-sm font-medium">Guest Checkout</span>
                            <span className="text-muted-foreground text-xs">{original.guest_email}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "created_at",
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Date" />,
                cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
            },
            {
                accessorKey: "total",
                header: "Total",
                cell: (info: any) => `$${info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                accessorKey: "payment_status",
                header: "Payment",
                cell: ({ row, getValue }: any) => {
                    const status = getValue() as string;
                    const orderId = row.original.order_id;
                    return (
                        <Select value={status} onValueChange={(val) => handlePaymentStatusChange(orderId, val)}>
                            <SelectTrigger
                                className={cn("h-6 w-[90px] rounded-md px-2.5 py-0.5 text-xs capitalize shadow-none transition-colors focus:ring-0", {
                                    "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400": status === "paid",
                                    "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400": status === "unpaid" || status === "failed",
                                })}
                            >
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    );
                },
            },
            {
                accessorKey: "order_status",
                header: "Status",
                cell: ({ row, getValue }: any) => {
                    const status = getValue() as string;
                    const orderId = row.original.order_id;
                    return (
                        <Select value={status} onValueChange={(val) => handleStatusChange(orderId, val)}>
                            <SelectTrigger
                                className={cn(
                                    "h-6 w-[110px] rounded-md px-2.5 py-0.5 text-xs capitalize shadow-none transition-colors focus:ring-0",
                                    {
                                        "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400":
                                            status === "delivered" || status === "shipped",
                                        "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400": status === "processing",
                                        "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400": status === "cancelled",
                                        "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400": status === "pending",
                                    }
                                )}
                            >
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    return (
                        <div className="flex justify-end pr-2">
                            <Button variant="outline" size="sm" onClick={() => openModal("orderDetail", { orderData: row.original })}>
                                View Details
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [openModal]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <ContentSection
            title="All Orders"
            desc="Global view of all store orders including customer and guest checkouts."
            withRefresh
            RefreshFunction={() => console.log("Refresh Admin Orders")}
        >
            <div className="mt-4 space-y-4">
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
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
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
