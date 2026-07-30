import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { MoreHorizontal, ShoppingBag } from "lucide-react";
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
import { useGetCustomerPayments, type CustomerPaymentAttempt } from "@/hooks/api/payment/use-payments";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/dashboard/_layout/customer/payments")({
    component: RouteComponent,
});

function RouteComponent() {
    "use no memo";

    const { openModal } = useUiStore();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const paymentsQuery = useGetCustomerPayments(pagination.pageIndex + 1, pagination.pageSize);
    const data = paymentsQuery.data?.items ?? [];

    const columns = useMemo<ColumnDef<CustomerPaymentAttempt>[]>(
        () => [
            {
                accessorKey: "attempt_id",
                header: "Attempt ID",
                cell: ({ getValue }) => <span className="font-mono text-xs">#{getValue<number>()}</span>,
            },
            {
                accessorKey: "order_id",
                header: "Order",
                cell: ({ getValue }) => <span className="font-mono font-medium">#{getValue<number>()}</span>,
            },
            {
                accessorKey: "attempted_at",
                header: "Date",
                cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
            },
            {
                accessorKey: "payment_method",
                header: "Method",
                cell: ({ getValue }) => (
                    <span className="text-xs font-semibold tracking-wider capitalize">
                        {getValue<CustomerPaymentAttempt["payment_method"]>().replaceAll("_", " ")}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => {
                    const status = getValue<CustomerPaymentAttempt["status"]>();
                    return (
                        <Badge variant={status === "success" ? "default" : "destructive"} className="capitalize">
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "amount",
                header: () => <div className="text-right">Amount</div>,
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
                                <DropdownMenuLabel>Payment Actions</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            openModal("orderDetail", {
                                                orderId: row.original.order_id,
                                                scope: "customer",
                                            })
                                        }
                                    >
                                        <ShoppingBag />
                                        View Order Details
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [openModal],
    );

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        rowCount: paymentsQuery.data?.pagination.total ?? 0,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <ContentSection
            title="My Payments"
            desc="View your transaction history across all your orders."
            withRefresh
            RefreshFunction={() => void paymentsQuery.refetch()}
        >
            <div className="mt-4 flex flex-col gap-4">
                {paymentsQuery.isError ? (
                    <QueryError
                        title="Couldn't load your payments"
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
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {paymentsQuery.isPending ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                                        Loading transactions...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className={paymentsQuery.isFetching ? "opacity-60" : undefined}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No transactions found.
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
