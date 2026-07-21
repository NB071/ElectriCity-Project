import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, Ban, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/_layout/admin/users")({
    component: RouteComponent,
});

type AdminUserListDTO = {
    user_id: number;
    full_name: string;
    email: string;
    phone_number: string | null;
    role: string;
    is_deleted: boolean;
    created_at: string;
};

const MOCK_ADMIN_USERS: AdminUserListDTO[] = [
    {
        user_id: 1,
        full_name: "Admin User",
        email: "admin@electricity.com",
        phone_number: "+1(555)999-9999",
        role: "admin",
        is_deleted: false,
        created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
    },
    {
        user_id: 42,
        full_name: "Sarah Connor",
        email: "sarahc@example.com",
        phone_number: null,
        role: "customer",
        is_deleted: false,
        created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
    },
    {
        user_id: 88,
        full_name: "John Smith",
        email: "jsmith@business.com",
        phone_number: "+1(555)222-1111",
        role: "customer",
        is_deleted: true,
        created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
    },
    {
        user_id: 104,
        full_name: "Emma Davis",
        email: "edavis_99@xyz.com",
        phone_number: "+1(555)123-4567",
        role: "customer",
        is_deleted: false,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
];

function RouteComponent() {
    const { openModal } = useUiStore();
    const [data] = useState<AdminUserListDTO[]>(MOCK_ADMIN_USERS);
    const [globalFilter, setGlobalFilter] = useState("");

    const columns = useMemo(
        () => [
            {
                accessorKey: "user_id",
                header: "ID",
                cell: (info: any) => <span className="text-muted-foreground font-mono">{info.getValue()}</span>,
            },
            {
                accessorKey: "full_name",
                header: "Name",
                cell: (info: any) => <span className="font-medium">{info.getValue()}</span>,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: (info: any) => <span className="text-sm">{info.getValue()}</span>,
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: (info: any) => {
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
                cell: (info: any) => {
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
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Joined" />,
                cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    return (
                        <div className="flex justify-end pr-2">
                            <Button variant="outline" size="sm" onClick={() => openModal("userDetail", { userData: row.original })}>
                                View Details
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [openModal]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <ContentSection
            title="Platform Users"
            desc="Manage the entire ElectriCity userbase."
            withRefresh
            RefreshFunction={() => console.log("Refresh Users")}
        >
            <div className="mt-4 space-y-4">
                {/* Search Bar */}
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <div className="relative w-full">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-8 shadow-sm"
                        />
                    </div>
                </div>

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
