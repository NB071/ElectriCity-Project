import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Star, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetCustomerReviews } from "@/hooks/api/review/use-customer-reviews";
import type { CustomerReviewDTO } from "@/hooks/api/review/types";
import { mediaUrl } from "@/lib/media";

export const Route = createFileRoute("/dashboard/_layout/customer/reviews")({
    component: RouteComponent,
});

const reviewColumns: ColumnDef<CustomerReviewDTO>[] = [
    {
        id: "thumbnail",
        header: "",
        cell: ({ row }) => {
            const { primary_image_url: url, name } = row.original.catalog_item;
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="bg-muted/50 flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border">
                            {url ? (
                                <img src={mediaUrl(url) ?? undefined} alt={name} className="h-full w-full object-cover" />
                            ) : (
                                <ImageOff className="text-muted-foreground/50 h-4 w-4" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Thumbnail for {name}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },
    },
    {
        id: "product",
        header: "Product",
        cell: ({ row }) => {
            const item = row.original.catalog_item;
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex max-w-50 flex-col gap-0.5">
                            <span className="truncate text-sm font-semibold">{item.name}</span>
                            <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground truncate font-mono">{item.cid}</span>
                                <Badge variant="secondary" className="h-4 px-1 text-[8px] tracking-widest uppercase">
                                    {item.item_type}
                                </Badge>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground font-mono text-xs">{item.cid}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: (info) => {
            const rating = info.getValue() as number;
            return (
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-500" : "fill-muted text-muted"}`} />
                    ))}
                </div>
            );
        },
    },
    {
        id: "feedback",
        header: "Feedback",
        cell: ({ row }) => {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex max-w-70 flex-col gap-1 py-1 text-left">
                            {row.original.title && <span className="truncate text-xs font-medium">{row.original.title}</span>}
                            {row.original.body && <span className="text-muted-foreground line-clamp-2 text-xs">{row.original.body}</span>}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-100 whitespace-normal">
                        {row.original.title && <p className="mb-1 text-sm font-semibold">{row.original.title}</p>}
                        <p className="text-muted-foreground text-xs leading-relaxed">{row.original.body}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: (info) => new Date(String(info.getValue())).toLocaleDateString(),
    },
];

type CustomerReviewsTableProps = {
    rows: CustomerReviewDTO[];
    rowCount: number;
    isPending: boolean;
    isFetching: boolean;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
};

function CustomerReviewsTable({ rows, rowCount, isPending, isFetching, pagination, onPaginationChange }: CustomerReviewsTableProps) {
    "use no memo";

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data: rows,
        columns: reviewColumns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        rowCount,
        state: { pagination },
        onPaginationChange,
    });

    return (
        <>
            <TooltipProvider delayDuration={300}>
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
                            {isPending ? (
                                <TableRow>
                                    <TableCell colSpan={reviewColumns.length} className="text-muted-foreground h-24 text-center">
                                        Loading your reviews...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className={isFetching ? "opacity-60" : undefined}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={reviewColumns.length} className="h-24 text-center">
                                        You haven't written any reviews yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TooltipProvider>

            <DataTablePagination table={table} />
        </>
    );
}

function RouteComponent() {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { data, isPending, isError, error, isFetching, refetch } = useGetCustomerReviews(pagination.pageIndex + 1, pagination.pageSize);

    const rows = data?.items ?? [];
    const rowCount = data?.pagination.total ?? 0;

    return (
        <ContentSection
            title="My Reviews"
            desc="Manage your product feedback and view ratings you've left across your orders."
            withRefresh
            RefreshFunction={() => refetch()}
        >
            <div className="mt-4 space-y-4">
                {isError && (
                    <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {error.message}
                    </p>
                )}
                <CustomerReviewsTable
                    rows={rows}
                    rowCount={rowCount}
                    isPending={isPending}
                    isFetching={isFetching}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>
        </ContentSection>
    );
}
