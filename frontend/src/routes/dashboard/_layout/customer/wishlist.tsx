import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { ImageOff, Trash2 } from "lucide-react";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { QueryError } from "@/components/common/QueryError";
import { DataTablePagination } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetWishlist, type WishlistItem } from "@/hooks/api/wishlist/use-wishlist";
import { mediaUrl } from "@/lib/media";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/dashboard/_layout/customer/wishlist")({
    component: RouteComponent,
});

function stockBadge(isActive: boolean, quantity: number) {
    if (!isActive) {
        return (
            <Badge variant="outline" className="text-muted-foreground">
                Discontinued
            </Badge>
        );
    }
    if (quantity <= 0) {
        return (
            <Badge variant="secondary" className="text-destructive">
                Out of Stock
            </Badge>
        );
    }
    if (quantity < 5) {
        return (
            <Badge variant="outline" className="border-amber-600/30 bg-amber-600/10 text-amber-700">
                Low Stock ({quantity})
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="border-green-600/30 bg-green-600/10 text-green-700">
            Available ({quantity})
        </Badge>
    );
}

function RouteComponent() {
    "use no memo";

    const { openModal } = useUiStore();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const wishlistQuery = useGetWishlist(pagination.pageIndex + 1, pagination.pageSize);
    const data = wishlistQuery.data?.items ?? [];

    const columns = useMemo<ColumnDef<WishlistItem>[]>(
        () => [
            {
                id: "image",
                header: "Image",
                cell: ({ row }) => {
                    const item = row.original.catalog_item;
                    const src = mediaUrl(item.primary_image_url);
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="bg-muted/50 flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border">
                                    {src ? (
                                        <img src={src} alt={item.name} className="size-full object-cover" />
                                    ) : (
                                        <ImageOff className="text-muted-foreground/50 size-4" />
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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex max-w-50 flex-col gap-0.5">
                                    <Link
                                        to="/catalog/$cid"
                                        params={{ cid: String(item.cid) }}
                                        className="truncate text-sm font-semibold hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <span className="text-muted-foreground truncate font-mono">#{item.cid}</span>
                                        <Badge variant="secondary" className="h-4 px-1 text-[8px] tracking-widest uppercase">
                                            {item.item_type}
                                        </Badge>
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="flex flex-col">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-muted-foreground font-mono text-xs">#{item.cid}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                },
            },
            {
                accessorKey: "added_at",
                header: "Date Added",
                cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
            },
            {
                id: "status",
                header: "Status",
                cell: ({ row }) => {
                    const item = row.original.catalog_item;
                    return stockBadge(item.is_active, item.quantity);
                },
            },
            {
                id: "price",
                header: () => <div className="text-right">Starting Price</div>,
                cell: ({ row }) => (
                    <div className="text-right font-medium">
                        {row.original.catalog_item.base_price.toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                        })}
                    </div>
                ),
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const item = row.original.catalog_item;
                    return (
                        <div className="flex justify-end pr-2">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Remove ${item.name} from wishlist`}
                                onClick={() =>
                                    openModal("wishlistDelete", {
                                        cid: item.cid,
                                        itemName: item.name,
                                    })
                                }
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    );
                },
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
        rowCount: wishlistQuery.data?.pagination.total ?? 0,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <ContentSection
            title="My Wishlist"
            desc="Keep track of products, configurations, and vehicles you're planning to purchase."
            withRefresh
            RefreshFunction={() => void wishlistQuery.refetch()}
        >
            <div className="mt-4 flex flex-col gap-4">
                {wishlistQuery.isError ? (
                    <QueryError
                        title="Couldn't load your wishlist"
                        error={wishlistQuery.error}
                        onRetry={() => void wishlistQuery.refetch()}
                        isRetrying={wishlistQuery.isFetching}
                    />
                ) : null}

                <TooltipProvider delayDuration={300}>
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
                                {wishlistQuery.isPending ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                                            Loading wishlist...
                                        </TableCell>
                                    </TableRow>
                                ) : table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className={wishlistQuery.isFetching ? "opacity-60" : undefined}>
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
                                            Your wishlist is empty.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TooltipProvider>

                <DataTablePagination table={table} />
            </div>
        </ContentSection>
    );
}
