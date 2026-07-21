import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useUiStore } from "@/stores/ui-store";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table";
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Link as LinkIcon, Trash, Star, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/_layout/admin/media")({
    component: RouteComponent,
});

const MOCK_MEDIA = [
    {
        media_id: 101,
        url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
        file_type: "image/jpeg",
        alt_text: "Tesla Model S Plaid Front",
        uploaded_at: "2026-07-20T08:15:00.000Z",
        is_primary: true,
        linked_cid: 55,
    },
    {
        media_id: 102,
        url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
        file_type: "image/jpeg",
        alt_text: "Tesla Model S Plaid Interior",
        uploaded_at: "2026-07-20T08:16:30.000Z",
        is_primary: false,
        linked_cid: 55,
    },
    {
        media_id: 103,
        url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
        file_type: "image/webp",
        alt_text: "Rivian R1T Launch Edition",
        uploaded_at: "2026-07-19T14:22:00.000Z",
        is_primary: true,
        linked_cid: 72,
    },
    {
        media_id: 104,
        url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
        file_type: "image/png",
        alt_text: "Generic EV Charger",
        uploaded_at: "2026-07-18T09:05:00.000Z",
        is_primary: false,
        linked_cid: null,
    },
    {
        media_id: 105,
        url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
        file_type: "image/webp",
        alt_text: "Ford F-150 Lightning Bed",
        uploaded_at: "2026-07-18T16:45:00.000Z",
        is_primary: true,
        linked_cid: 21,
    },
];

function RouteComponent() {
    const [data] = useState(MOCK_MEDIA);
    const { openModal } = useUiStore();

    const columns = useMemo(
        () => [
            {
                accessorKey: "preview",
                header: "Preview",
                cell: ({ row }: any) => {
                    const original = row.original;
                    // For the sake of UI we only attempt to preview typical image links
                    if (original.file_type.includes("image")) {
                        return (
                            <div className="bg-muted h-12 w-16 overflow-hidden rounded-md border">
                                <img src={original.url} alt={original.alt_text} className="h-full w-full object-cover" />
                            </div>
                        );
                    }
                    return <div className="bg-muted flex h-12 w-16 items-center justify-center rounded-md border text-xs">DOC</div>;
                },
            },
            {
                id: "metadata",
                header: "Metadata",
                cell: ({ row }: any) => {
                    const original = row.original;
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{original.alt_text || "No Alt Text"}</span>
                            <a
                                href={original.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block max-w-[200px] truncate text-xs text-blue-500 hover:underline"
                            >
                                {original.url}
                            </a>
                        </div>
                    );
                },
            },
            {
                accessorKey: "file_type",
                header: "File Type",
                cell: (info: any) => (
                    <Badge variant="outline" className="text-xs uppercase">
                        {info.getValue().split("/")[1] || info.getValue()}
                    </Badge>
                ),
            },
            {
                accessorKey: "linked_cid",
                header: "Catalog Link",
                cell: ({ row }: any) => {
                    const original = row.original;
                    if (original.linked_cid) {
                        return (
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">CID: {original.linked_cid}</span>
                                {original.is_primary && (
                                    <Badge className="w-fit bg-amber-500/10 text-[10px] text-amber-500 hover:bg-amber-500/20">Primary</Badge>
                                )}
                            </div>
                        );
                    }
                    return <span className="text-muted-foreground text-xs">Unlinked</span>;
                },
            },
            {
                accessorKey: "uploaded_at",
                header: "Uploaded On",
                cell: (info: any) => {
                    const val = info.getValue();
                    if (!val) return <span className="text-muted-foreground text-sm">--</span>;
                    return (
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {new Date(val).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    const original = row.original;
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
                                    <DropdownMenuLabel>Media Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => openModal("mediaLink", { mediaId: original.media_id, label: original.alt_text })}
                                    >
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        Link to Catalog Item
                                    </DropdownMenuItem>
                                    {original.linked_cid && !original.is_primary && (
                                        <DropdownMenuItem onClick={() => console.log("Set Primary", original.media_id)}>
                                            <Star className="mr-2 h-4 w-4" />
                                            Set as Primary Image
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                        onClick={() => openModal("mediaDelete", { mediaId: original.media_id, label: original.alt_text })}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete Asset
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
            title="Media Library"
            desc="Global repository for image assets and documents linked to the platform catalog."
            withRefresh
            RefreshFunction={() => console.log("Refresh Media")}
        >
            <div className="mt-4 space-y-4">
                {/* Header Actions */}
                <div className="flex w-full items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                        Because direct physical uploads are disabled, all new media operates via public URL reference ingestion.
                    </p>
                    <Button onClick={() => openModal("mediaRegister")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Register External URL
                    </Button>
                </div>

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
                                        No media assets found.
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
