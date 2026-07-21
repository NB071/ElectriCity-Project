import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Star, ImageOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/dashboard/_layout/customer/reviews")({
    component: RouteComponent,
});

type CustomerReviewDTO = {
    review_id: number;
    title: string | null;
    body: string | null;
    rating: number;
    created_at: string;
    catalog_item: {
        cid: string;
        item_type: string;
        name: string;
        primary_image_url: string | null;
    };
};

const MOCK_REVIEWS: CustomerReviewDTO[] = [
    {
        review_id: 1,
        title: "Incredible Performance",
        body: "The vehicle exceeds all my expectations. The acceleration is incredibly smooth, and the autopilot features have practically driven me through all cross-state trips. Highly recommend grabbing the extended battery pack.",
        rating: 5,
        created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
        catalog_item: {
            cid: "cat_101",
            item_type: "vehicle",
            name: "ElectriCity Model Z",
            primary_image_url: null,
        },
    },
    {
        review_id: 32,
        title: "Good but could be sturdier",
        body: "Looks slick covering the wall connector, but the plastic feels slightly thinner than I anticipated for outdoor weathering. It works fine so far, just slightly disappointed.",
        rating: 3,
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        catalog_item: {
            cid: "cat_201",
            item_type: "accessory",
            name: "Wall Connector Cover",
            primary_image_url: null,
        },
    },
    {
        review_id: 18,
        title: "Perfect Integration",
        body: "Hooks straight up to the dashboard! The electricity output perfectly bridges into the grid offsetting practically my entire summer electrical cost.",
        rating: 5,
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        catalog_item: {
            cid: "cat_801",
            item_type: "energy",
            name: "Solar Roof Tile Module",
            primary_image_url: null,
        },
    },
];

function RouteComponent() {
    const { openModal } = useUiStore();
    const [data] = useState<CustomerReviewDTO[]>(MOCK_REVIEWS);

    const columns = useMemo(
        () => [
            {
                accessorKey: "catalog_item.primary_image_url",
                header: "",
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
                accessorKey: "rating",
                header: "Rating",
                cell: (info: any) => {
                    const rating = info.getValue();
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
                cell: ({ row }: any) => {
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex max-w-[280px] flex-col gap-1 py-1 text-left">
                                    {row.original.title && <span className="truncate text-xs font-medium">{row.original.title}</span>}
                                    {row.original.body && <span className="text-muted-foreground line-clamp-2 text-xs">{row.original.body}</span>}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[400px] whitespace-normal">
                                {row.original.title && <p className="mb-1 text-sm font-semibold">{row.original.title}</p>}
                                <p className="text-muted-foreground text-xs leading-relaxed">{row.original.body}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                },
            },
            {
                accessorKey: "created_at",
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Date" />,
                cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    return (
                        <div className="flex justify-end pr-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => openModal("reviewDelete", { reviewId: row.original.review_id, reviewTitle: row.original.title })}
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
            title="My Reviews"
            desc="Manage your product feedback and view ratings you've left across your orders."
            withRefresh
            RefreshFunction={() => console.log("Refresh Reviews")}
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
                                            You haven't written any reviews yet.
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
