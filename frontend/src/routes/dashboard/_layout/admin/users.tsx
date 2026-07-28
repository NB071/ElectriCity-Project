import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, Ban, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAdminUsers, useSearchAdminUsers, type AdminUserListDTO } from "@/hooks/api/iam/use-admin-users";

export const Route = createFileRoute("/dashboard/_layout/admin/users")({
    component: RouteComponent,
});

const SEARCH_DEBOUNCE_MS = 300;

function RouteComponent() {
    const { openModal } = useUiStore();
    const [globalFilter, setGlobalFilter] = useState("");
    const [debouncedFilter, setDebouncedFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedFilter(globalFilter.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [globalFilter]);

    useEffect(() => {
        setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    }, [debouncedFilter]);

    const isSearching = debouncedFilter.length > 0;
    const listQuery = useGetAdminUsers(pagination.pageIndex + 1, pagination.pageSize, { enabled: !isSearching });
    const searchQuery = useSearchAdminUsers(debouncedFilter, pagination.pageIndex + 1, pagination.pageSize);
    const activeQuery = isSearching ? searchQuery : listQuery;

    const rows = activeQuery.data?.items ?? [];
    const rowCount = activeQuery.data?.pagination.total ?? 0;

    const columns = useMemo<ColumnDef<AdminUserListDTO>[]>(
        () => [
            {
                accessorKey: "user_id",
                header: "ID",
                cell: (info) => <span className="text-muted-foreground font-mono">{String(info.getValue())}</span>,
            },
            {
                accessorKey: "full_name",
                header: "Name",
                cell: (info) => <span className="font-medium">{String(info.getValue())}</span>,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: (info) => <span className="text-sm">{String(info.getValue())}</span>,
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: (info) => {
                    const role = info.getValue() as string;
                    return (
                        <Badge
                            variant="outline"
                            className={cn("capitalize", {
                                "border-amber-500/30 bg-amber-500/10 text-amber-600": role === "admin",
                                "border-green-500/30 bg-green-500/10 text-green-600": role === "customer",
                            })}
                        >
                            {role === "admin" && <ShieldCheck className="mr-1 h-3 w-3" />}
                            {role === "customer" && <UserCircle className="mr-1 h-3 w-3" />}
                            {role}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "is_deleted",
                header: "Status",
                cell: (info) => {
                    const deleted = info.getValue() as boolean;
                    if (deleted) {
                        return (
                            <Badge variant="destructive" className="flex w-fit gap-1">
                                <Ban className="h-3 w-3" /> Deleted
                            </Badge>
                        );
                    }
                    return (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
                            Active
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
                cell: (info) => new Date(String(info.getValue())).toLocaleDateString(),
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <div className="flex justify-end pr-2">
                        <Button variant="outline" size="sm" onClick={() => openModal("userDetail", { userData: row.original })}>
                            View Details
                        </Button>
                    </div>
                ),
            },
        ],
        [openModal]
    );

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        rowCount,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <ContentSection
            title="Platform Users"
            desc="Manage the entire ElectriCity userbase."
            withRefresh
            RefreshFunction={() => activeQuery.refetch()}
        >
            <div className="mt-4 space-y-4">
                {/* Search Bar */}
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <div className="relative w-full">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-8 shadow-sm"
                        />
                    </div>
                </div>

                {activeQuery.isError && (
                    <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {activeQuery.error.message}
                    </p>
                )}

                {/* Table */}
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
                            {activeQuery.isPending ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className={activeQuery.isFetching ? "opacity-60" : undefined}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No users match your search query.
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
