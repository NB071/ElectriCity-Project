import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { QueryError } from "@/components/common/QueryError";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, MoreHorizontal, ShoppingBag } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAdminPayments, type AdminPaymentAttempt } from "@/hooks/api/payment/use-payments";
import { useUiStore } from "@/stores/ui-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/_layout/admin/payments")({
    component: RouteComponent,
});

function RouteComponent() {
    "use no memo";

    const { openModal } = useUiStore();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const paymentsQuery = useGetAdminPayments(pagination.pageIndex + 1, pagination.pageSize);
    const data = paymentsQuery.data?.items ?? [];

    const columns = useMemo<ColumnDef<AdminPaymentAttempt>[]>(
        () => [
            {
                accessorKey: "attempt_id",
                header: "Attempt ID",
                cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue<number>())}</span>,
            },
            {
                accessorKey: "order_id",
                header: "Order",
                cell: ({ getValue }) => <span className="font-mono font-medium">#{getValue<number>()}</span>,
            },
            {
                id: "buyer",
                header: "Buyer",
                cell: ({ row }) => {
                    const payment = row.original;
                    if (payment.user) {
                        return (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {payment.user.first_name} {payment.user.last_name}
                                </span>
                                <span className="text-muted-foreground text-xs">{payment.user.email}</span>
                            </div>
                        );
                    }
                    return (
                        <div className="flex flex-col">
                            <span className="text-foreground/80 text-sm font-medium">Guest Checkout</span>
                            <span className="text-muted-foreground text-xs">Unregistered</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "payment_method",
                header: "Method",
                cell: ({ getValue }) => (
                    <span className="text-xs font-semibold tracking-wider capitalize">{getValue<string>().replaceAll("_", " ")}</span>
                ),
            },
            {
                accessorKey: "amount",
                header: "Amount",
                cell: ({ getValue }) =>
                    getValue<number>().toLocaleString("en-US", {
                        style: "currency",
                        currency: "CAD",
                    }),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => {
                    const status = getValue<AdminPaymentAttempt["status"]>();

                    return (
                        <Badge variant={status === "success" ? "default" : "destructive"} className="capitalize">
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "attempted_at",
                header: "Date",
                cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const payment = row.original;
                    return (
                        <div className="flex justify-end pr-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon-sm">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                openModal("paymentDetail", {
                                                    attemptId: payment.attempt_id,
                                                })
                                            }
                                        >
                                            <Eye />
                                            View Payment Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                openModal("orderDetail", {
                                                    orderId: payment.order_id,
                                                    scope: "admin",
                                                })
                                            }
                                        >
                                            <ShoppingBag />
                                            View Order Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                void navigator.clipboard
                                                    .writeText(String(payment.attempt_id))
                                                    .then(() => toast.success("Attempt ID copied"))
                                                    .catch(() => toast.error("Could not copy attempt ID"));
                                            }}
                                        >
                                            <Copy />
                                            Copy Attempt ID
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                void navigator.clipboard
                                                    .writeText(String(payment.order_id))
                                                    .then(() => toast.success("Order ID copied"))
                                                    .catch(() => toast.error("Could not copy order ID"));
                                            }}
                                        >
                                            <Copy />
                                            Copy Order ID
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
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
        rowCount: paymentsQuery.data?.pagination.total ?? 0,

        state: {
            pagination,
        },
        onPaginationChange: setPagination,
    });

    return (
        <ContentSection
            title="Payment Logs"
            desc="Global ledger of every transaction attempt cross-linked to user profiles and orders."
            withRefresh
            RefreshFunction={() => void paymentsQuery.refetch()}
        >
            <div className="mt-4 flex flex-col gap-4">
                {paymentsQuery.isError ? (
                    <QueryError
                        title="Couldn't load payment logs"
                        error={paymentsQuery.error}
                        onRetry={() => void paymentsQuery.refetch()}
                        isRetrying={paymentsQuery.isFetching}
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
                            {paymentsQuery.isPending ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Loading transactions...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className={paymentsQuery.isFetching ? "opacity-60" : undefined}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No transactions found in global ledger.
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
