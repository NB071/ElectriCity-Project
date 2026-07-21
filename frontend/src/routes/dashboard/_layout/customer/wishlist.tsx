import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ImageOff } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/dashboard/_layout/customer/wishlist")({
    component: RouteComponent,
});

type WishlistCatalogItemDTO = {
    cid: string;
    item_type: string;
    name: string;
    base_price: number;
    quantity: number;
    is_active: boolean;
    primary_image_url: string | null;
};

type WishlistItemDTO = {
    cid: string;
    added_at: string;
    catalog_item: WishlistCatalogItemDTO;
};

const MOCK_WISHLIST: WishlistItemDTO[] = [
    {
        cid: "cat_101",
        added_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        catalog_item: {
            cid: "cat_101",
            item_type: "vehicle",
            name: "ElectriCity Model Z",
            base_price: 43000.0,
            quantity: 2,
            is_active: true,
            primary_image_url: null,
        },
    },
    {
        cid: "cat_801",
        added_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        catalog_item: {
            cid: "cat_801",
            item_type: "energy",
            name: "Solar Roof Tile Module",
            base_price: 350.0,
            quantity: 50,
            is_active: true,
            primary_image_url: null,
        },
    },
    {
        cid: "cat_201",
        added_at: new Date(Date.now() - 86400000 * 25).toISOString(),
        catalog_item: {
            cid: "cat_201",
            item_type: "accessory",
            name: "Wall Connector Cover (Discontinued)",
            base_price: 200.0,
            quantity: 0,
            is_active: false,
            primary_image_url: null,
        },
    },
];

function RouteComponent() {
    const { openModal } = useUiStore();
    const [data] = useState<WishlistItemDTO[]>(MOCK_WISHLIST);

    const columns = useMemo(
        () => [
            {
                accessorKey: "catalog_item.primary_image_url",
                header: "Image",
                cell: (info: any) => {
                    const url = info.getValue();
                    const name = info.row.original.catalog_item.name;
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="bg-muted/50 flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border">
                                    {url ? (
                                        <img src={url} alt="Item" className="h-full w-full object-cover" />
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
                accessorKey: "catalog_item.name",
                header: "Product",
                cell: (info: any) => {
                    const item = info.row.original.catalog_item;
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex max-w-[200px] flex-col gap-0.5">
                                    <span className="truncate text-sm font-semibold">{info.getValue()}</span>
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <span className="text-muted-foreground truncate font-mono">{item.cid}</span>
                                        <Badge variant="secondary" className="h-4 px-1 text-[8px] tracking-widest uppercase">
                                            {item.item_type}
                                        </Badge>
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="flex flex-col">
                                <p className="font-medium">{info.getValue()}</p>
                                <p className="text-muted-foreground font-mono text-xs">{item.cid}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                },
            },
            {
                accessorKey: "added_at",
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Date Added" />,
                cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
            },
            {
                accessorKey: "catalog_item.is_active",
                header: "Status",
                cell: (info: any) => {
                    const isActive = info.getValue() as boolean;
                    const stock = info.row.original.catalog_item.quantity;
                    if (!isActive) {
                        return (
                            <Badge variant="outline" className="text-muted-foreground">
                                Discontinued
                            </Badge>
                        );
                    }
                    if (stock <= 0) {
                        return (
                            <Badge variant="secondary" className="text-destructive">
                                Out of Stock
                            </Badge>
                        );
                    }
                    if (stock < 5) {
                        return (
                            <Badge variant="default" className="border-amber-600/30 bg-amber-600/10 text-amber-600">
                                Low Stock ({stock})
                            </Badge>
                        );
                    }
                    return (
                        <Badge variant="default" className="border-green-600/30 bg-green-600/10 text-green-600">
                            Available ({stock})
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "catalog_item.base_price",
                header: () => <div className="text-right">Starting Price</div>,
                cell: (info: any) => {
                    const total = Number(info.getValue());
                    return <div className="text-right font-medium">${total.toFixed(2)}</div>;
                },
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    const item = row.original.catalog_item;
                    return (
                        <div className="flex justify-end pr-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => openModal("wishlistDelete", { cid: item.cid, itemName: item.name })}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
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
            title="My Wishlist"
            desc="Keep track of products, configurations, and vehicles you're planning to purchase."
            withRefresh
            RefreshFunction={() => console.log("Refresh Wishlist")}
        >
            <div className="mt-4 space-y-4">
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
