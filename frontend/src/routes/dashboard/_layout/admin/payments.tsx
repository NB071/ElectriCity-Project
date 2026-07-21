import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/_layout/admin/payments")({
    component: RouteComponent,
});

type AdminPaymentAttemptDTO = {
    attempt_id: string;
    order_id: number;
    amount: number;
    payment_method: string;
    status: string;
    attempted_at: string;
    user_id: number | null;
    user?: {
        user_id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
};

const MOCK_ADMIN_PAYMENTS: AdminPaymentAttemptDTO[] = [
    {
        attempt_id: "pay_xyz98s7df6g5h4",
        order_id: 8492,
        amount: 58839.3,
        payment_method: "credit_card",
        status: "success",
        attempted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        user_id: 1,
        user: {
            user_id: 1,
            first_name: "Admin",
            last_name: "User",
            email: "admin@electricity.com",
        },
    },
    {
        attempt_id: "pay_qwe12r3t4y5u",
        order_id: 8493,
        amount: 128.4,
        payment_method: "paypal",
        status: "success",
        attempted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        user_id: null,
    },
    {
        attempt_id: "pay_asd98f7g6h5j",
        order_id: 8494,
        amount: 481.5,
        payment_method: "credit_card",
        status: "failed",
        attempted_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        user_id: 44,
        user: {
            user_id: 44,
            first_name: "Sarah",
            last_name: "Connor",
            email: "sarahc@example.com",
        },
    },
    {
        attempt_id: "pay_zxc56v7b8n9m",
        order_id: 8494,
        amount: 481.5,
        payment_method: "bank_transfer",
        status: "pending",
        attempted_at: new Date(Date.now() - 86400000 * 9).toISOString(),
        user_id: 44,
        user: {
            user_id: 44,
            first_name: "Sarah",
            last_name: "Connor",
            email: "sarahc@example.com",
        },
    },
];

function RouteComponent() {
    const [data] = useState<AdminPaymentAttemptDTO[]>(MOCK_ADMIN_PAYMENTS);

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "attempt_id",
                header: "Attempt ID",
                cell: (info: any) => {
                    const val = info.getValue();
                    return (
                        <span className="font-mono text-xs opacity-70" title={val}>
                            {val.substring(0, 16)}...
                        </span>
                    );
                },
            },
            {
                accessorKey: "order_id",
                header: "Order",
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
                            <span className="text-muted-foreground text-xs">Unregistered</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "payment_method",
                header: "Method",
                cell: (info: any) => <span className="text-xs font-semibold tracking-wider capitalize">{info.getValue().replace("_", " ")}</span>,
            },
            {
                accessorKey: "amount",
                header: "Amount",
                cell: (info: any) => `$${info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: (info: any) => {
                    const status = info.getValue() as string;
                    return (
                        <Badge
                            variant="outline"
                            className={cn("capitalize shadow-none", {
                                "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400": status === "success",
                                "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400": status === "pending",
                                "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400": status === "failed",
                            })}
                        >
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "attempted_at",
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Date" />,
                cell: (info: any) => new Date(info.getValue()).toLocaleString(),
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    const payment = row.original;
                    return (
                        <div className="flex justify-end pr-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleCopyId(payment.attempt_id)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Attempt ID
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
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
            title="Payment Logs"
            desc="Global ledger of every transaction attempt cross-linked to user profiles and orders."
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
                                        No transaction records fit the global filter bounds.
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
