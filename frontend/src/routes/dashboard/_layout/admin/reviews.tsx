import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Star, ImageOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/ui-store";
import { useGetAdminReviews } from "@/hooks/api/review/use-admin-reviews";
import type { AdminReviewListDTO } from "@/hooks/api/review/types";
import { mediaUrl } from "@/lib/media";

export const Route = createFileRoute("/dashboard/_layout/admin/reviews")({
    component: RouteComponent,
});

type ReviewsTableProps = {
    rows: AdminReviewListDTO[];
    rowCount: number;
    isPending: boolean;
    isFetching: boolean;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
};

function ReviewsTable({ rows, rowCount, isPending, isFetching, pagination, onPaginationChange }: ReviewsTableProps) {
    "use no memo";

    const { openModal } = useUiStore();

    const columns = useMemo<ColumnDef<AdminReviewListDTO>[]>(
        () => [
            {
                id: "thumbnail",
                header: "",
                cell: ({ row }) => {
                    const item = row.original.catalog_item;
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="bg-muted/50 flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border">
                                    {item.primary_image_url ? (
                                        <img
                                            src={mediaUrl(item.primary_image_url) ?? undefined}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <ImageOff className="text-muted-foreground/50 h-4 w-4" />
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Thumbnail for {item.name}</p>
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
                        <div className="flex max-w-50 flex-col gap-0.5">
                            <span className="truncate text-sm font-semibold">{item.name}</span>
                            <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground truncate font-mono">{item.cid}</span>
                                <Badge variant="secondary" className="h-4 px-1 text-[8px] tracking-widest uppercase">
                                    {item.item_type}
                                </Badge>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: "author",
                header: "Author",
                cell: ({ row }) => {
                    const user = row.original.user;
                    return (
                        <div className="flex max-w-45 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium">
                                {user.first_name} {user.last_name}
                                {user.is_deleted && <span className="text-destructive ml-1 text-[10px]">(deleted)</span>}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                        </div>
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
                cell: ({ row }) => (
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
                ),
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
                cell: (info) => new Date(String(info.getValue())).toLocaleDateString(),
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <div className="flex justify-end pr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                                openModal("reviewDelete", { reviewId: row.original.review_id, reviewTitle: row.original.title ?? undefined })
                            }
                        >
                            <span className="sr-only">Delete review</span>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [openModal]
    );

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data: rows,
        columns,
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
                                    <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                                        Loading reviews...
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
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No reviews have been published yet.
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
    const { data, isPending, isError, error, isFetching, refetch } = useGetAdminReviews(pagination.pageIndex + 1, pagination.pageSize);

    const rows = data?.items ?? [];
    const rowCount = data?.pagination.total ?? 0;

    return (
        <ContentSection title="Reviews" desc="Moderate customer feedback across the entire catalog." withRefresh RefreshFunction={() => refetch()}>
            <div className="mt-4 space-y-4">
                {isError && (
                    <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {error.message}
                    </p>
                )}
                <ReviewsTable
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
