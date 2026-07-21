/* eslint-disable */
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/_layout/customer/payments")({
    component: RouteComponent,
});

type CustomerPaymentAttemptDTO = {
    attempt_id: string;
    order_id: string;
    amount: number;
    payment_method: string;
    status: string;
    attempted_at: string;
};

const MOCK_PAYMENTS: CustomerPaymentAttemptDTO[] = [
    {
        attempt_id: "pa_9001",
        order_id: "ord_20304050",
        amount: 56100.0,
        payment_method: "debit_card",
        status: "success",
        attempted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        attempt_id: "pa_1002",
        order_id: "ord_30405060",
        amount: 1320.0,
        payment_method: "credit_card",
        status: "success",
        attempted_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
        attempt_id: "pa_1001",
        order_id: "ord_30405060",
        amount: 1320.0,
        payment_method: "apple_pay",
        status: "failed",
        attempted_at: new Date(Date.now() - 86400000 * 13).toISOString(),
    },
    {
        attempt_id: "pa_2001",
        order_id: "ord_40506070",
        amount: 226.0,
        payment_method: "credit_card",
        status: "success",
        attempted_at: new Date(Date.now() - 86400000 * 29).toISOString(),
    },
    {
        attempt_id: "pa_889",
        order_id: "ord_10203040",
        amount: 115.0,
        payment_method: "credit_card",
        status: "success",
        attempted_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        attempt_id: "pa_3001",
        order_id: "ord_50607080",
        amount: 84.75,
        payment_method: "apple_pay",
        status: "pending",
        attempted_at: new Date().toISOString(),
    },
];

function RouteComponent() {
    const [data] = useState<CustomerPaymentAttemptDTO[]>(MOCK_PAYMENTS);

    const columns = useMemo(
        () => [
            {
                accessorKey: "attempt_id",
                header: "Attempt ID",
                cell: (info: any) => <span className="font-mono text-xs opacity-80">{info.getValue()}</span>,
            },
            {
                accessorKey: "order_id",
                header: "Order ID",
                cell: (info: any) => <span className="font-mono text-xs opacity-80">{info.getValue()}</span>,
            },
            {
                accessorKey: "attempted_at",
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Date" />,
                cell: (info: any) => new Date(info.getValue()).toLocaleString(),
            },
            {
                accessorKey: "payment_method",
                header: "Method",
                cell: (info: any) => (
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                        {(info.getValue() as string).replace("_", " ")}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: (info: any) => {
                    const status = info.getValue() as string;
                    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

                    if (status === "success") variant = "default";
                    else if (status === "failed") variant = "destructive";
                    else if (status === "pending") variant = "secondary";

                    return (
                        <Badge variant={variant} className="h-5 text-[10px] tracking-wider uppercase">
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "amount",
                header: () => <div className="text-right">Amount</div>,
                cell: (info: any) => {
                    const total = Number(info.getValue());
                    return <div className="text-right font-medium">${total.toFixed(2)}</div>;
                },
            },
        ],
        []
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
            title="My Payments"
            desc="View your transaction history across all your orders."
            withRefresh
            RefreshFunction={() => console.log("Refresh Payments")}
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
