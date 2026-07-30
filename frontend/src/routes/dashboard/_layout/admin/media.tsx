import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
} from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { QueryError } from "@/components/common/QueryError";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as LinkIcon, MoreHorizontal, Plus, Star, Trash, Unlink } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { mediaUrl } from "@/lib/media";
import {
    setPrimaryAdminMediaVariables,
    unlinkAdminMediaVariables,
    useGetAdminMedia,
    useSetPrimaryAdminMedia,
    useUnlinkAdminMedia,
    type AdminMediaListItem,
} from "@/hooks/api/media/use-admin-media";

export const Route = createFileRoute("/dashboard/_layout/admin/media")({
    component: RouteComponent,
});

function isImageFileType(fileType: string | null) {
    return Boolean(fileType?.startsWith("image/"));
}

function RouteComponent() {
    "use no memo";

    const { openModal } = useUiStore();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const mediaQuery = useGetAdminMedia(pagination.pageIndex + 1, pagination.pageSize);
    const setPrimaryMutation = useSetPrimaryAdminMedia();
    const unlinkMutation = useUnlinkAdminMedia();
    const data = mediaQuery.data?.items ?? [];

    const pendingPrimaryKey =
        setPrimaryMutation.isPending && setPrimaryMutation.variables?.url
            ? setPrimaryMutation.variables.url
            : null;
    const pendingUnlinkKey =
        unlinkMutation.isPending && unlinkMutation.variables?.url ? unlinkMutation.variables.url : null;

    function handleSetPrimary(item: AdminMediaListItem) {
        if (item.linked_cid == null || item.is_primary) {
            return;
        }
        setPrimaryMutation.mutate(setPrimaryAdminMediaVariables(item.linked_cid, item.media_id));
    }

    function handleUnlink(item: AdminMediaListItem) {
        if (item.linked_cid == null) {
            return;
        }
        unlinkMutation.mutate(unlinkAdminMediaVariables(item.linked_cid, item.media_id));
    }

    const columns = useMemo<ColumnDef<AdminMediaListItem>[]>(
        () => [
            {
                id: "preview",
                header: "Preview",
                cell: ({ row }) => {
                    const item = row.original;
                    const src = mediaUrl(item.url);

                    if (isImageFileType(item.file_type) && src) {
                        return (
                            <div className="bg-muted size-12 overflow-hidden rounded-md border sm:w-16">
                                <img src={src} alt={item.alt_text ?? "Media preview"} className="size-full object-cover" />
                            </div>
                        );
                    }

                    return (
                        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-md border text-xs sm:w-16">
                            DOC
                        </div>
                    );
                },
            },
            {
                id: "metadata",
                header: "Metadata",
                cell: ({ row }) => {
                    const item = row.original;
                    const href = mediaUrl(item.url) ?? item.url;

                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{item.alt_text || "No Alt Text"}</span>
                            <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground block max-w-50 truncate text-xs underline-offset-4 hover:underline"
                            >
                                {item.url}
                            </a>
                        </div>
                    );
                },
            },
            {
                accessorKey: "file_type",
                header: "File Type",
                cell: ({ getValue }) => {
                    const fileType = getValue<string | null>() ?? "unknown";
                    const label = fileType.includes("/") ? fileType.split("/")[1] : fileType;
                    return (
                        <Badge variant="outline" className="uppercase">
                            {label}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "linked_cid",
                header: "Catalog Link",
                cell: ({ row }) => {
                    const item = row.original;
                    if (item.linked_cid == null) {
                        return <span className="text-muted-foreground text-xs">Unlinked</span>;
                    }

                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">CID: {item.linked_cid}</span>
                            {item.is_primary ? <Badge variant="secondary">Primary</Badge> : null}
                        </div>
                    );
                },
            },
            {
                accessorKey: "uploaded_at",
                header: "Uploaded On",
                cell: ({ getValue }) => {
                    const value = getValue<string>();
                    return (
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {new Date(value).toLocaleDateString(undefined, {
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
                cell: ({ row }) => {
                    const item = row.original;
                    const primaryPending =
                        pendingPrimaryKey ===
                        `/api/dashboard/admin/catalog/${item.linked_cid}/media/${item.media_id}/primary`;
                    const unlinkPending =
                        pendingUnlinkKey ===
                        `/api/dashboard/admin/catalog/${item.linked_cid}/media/${item.media_id}`;

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
                                    <DropdownMenuLabel>Media Actions</DropdownMenuLabel>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                openModal("mediaLink", {
                                                    mediaId: item.media_id,
                                                    label: item.alt_text ?? undefined,
                                                })
                                            }
                                        >
                                            <LinkIcon />
                                            Link to Catalog Item
                                        </DropdownMenuItem>
                                        {item.linked_cid != null && !item.is_primary ? (
                                            <DropdownMenuItem
                                                disabled={primaryPending}
                                                onClick={() => handleSetPrimary(item)}
                                            >
                                                <Star />
                                                {primaryPending ? "Setting primary..." : "Set as Primary Image"}
                                            </DropdownMenuItem>
                                        ) : null}
                                        {item.linked_cid != null ? (
                                            <DropdownMenuItem
                                                disabled={unlinkPending}
                                                onClick={() => handleUnlink(item)}
                                            >
                                                <Unlink />
                                                {unlinkPending ? "Unlinking..." : "Unlink from Catalog"}
                                            </DropdownMenuItem>
                                        ) : null}
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                openModal("mediaDelete", {
                                                    mediaId: item.media_id,
                                                    label: item.alt_text ?? undefined,
                                                })
                                            }
                                        >
                                            <Trash />
                                            Delete Asset
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers intentionally omitted
        [openModal, pendingPrimaryKey, pendingUnlinkKey],
    );

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        rowCount: mediaQuery.data?.pagination.total ?? 0,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <ContentSection
            title="Media Library"
            desc="Global repository for image assets and documents linked to the platform catalog."
            withRefresh
            RefreshFunction={() => void mediaQuery.refetch()}
        >
            <div className="mt-4 flex flex-col gap-4">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-sm">
                        Direct physical uploads are disabled. Register assets by public or local URL reference.
                    </p>
                    <Button onClick={() => openModal("mediaRegister")}>
                        <Plus data-icon="inline-start" />
                        Register External URL
                    </Button>
                </div>

                {mediaQuery.isError ? (
                    <QueryError
                        title="Couldn't load media library"
                        error={mediaQuery.error}
                        onRetry={() => void mediaQuery.refetch()}
                        isRetrying={mediaQuery.isFetching}
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
                            {mediaQuery.isPending ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                                        Loading media assets...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={mediaQuery.isFetching ? "opacity-60" : undefined}
                                    >
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
