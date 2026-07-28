import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/data-table";
import { MoreHorizontal, Plus, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/stores/ui-store";
import { useAddMyAddress, useGetMyAddresses, useSetDefaultMyAddress, type AddressResponse } from "@/hooks/api/iam/use-addresses";

export const Route = createFileRoute("/dashboard/_layout/settings/addresses")({
    component: RouteComponent,
});

function AddressRowActions({ address }: { address: AddressResponse }) {
    const { openModal } = useUiStore();
    const setDefault = useSetDefaultMyAddress(address.address_id);
    const addAddress = useAddMyAddress();

    const duplicateAddress = () => {
        addAddress.mutate({
            body: {
                street: address.street,
                city: address.city,
                province: address.province,
                country: address.country,
                postal_code: address.postal_code,
                is_default: false,
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openModal("addressForm", { mode: "edit", addressData: address })}>Edit Address</DropdownMenuItem>
                <DropdownMenuItem disabled={addAddress.isPending} onClick={duplicateAddress}>
                    {addAddress.isPending ? "Duplicating..." : "Duplicate Address"}
                </DropdownMenuItem>
                {!address.is_default && (
                    <DropdownMenuItem disabled={setDefault.isPending} onClick={() => setDefault.mutate({})}>
                        {setDefault.isPending ? "Setting..." : "Set as Default"}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => openModal("addressDelete", { addressId: address.address_id, label: address.street })}
                >
                    Delete Address
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const addressColumns: ColumnDef<AddressResponse>[] = [
    {
        accessorKey: "street",
        header: "Address",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">{row.original.street}</span>
                {row.original.is_default && <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">Default</span>}
            </div>
        ),
    },
    { accessorKey: "city", header: "City" },
    { accessorKey: "province", header: "State/Province" },
    { accessorKey: "postal_code", header: "Zip/Postal Code" },
    {
        id: "actions",
        cell: ({ row }) => <AddressRowActions address={row.original} />,
    },
];

type AddressesTableProps = {
    rows: AddressResponse[];
    rowCount: number;
    isPending: boolean;
    isFetching: boolean;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
};

function AddressesTable({ rows, rowCount, isPending, isFetching, pagination, onPaginationChange }: AddressesTableProps) {
    "use no memo";

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data: rows,
        columns: addressColumns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        rowCount,
        state: { pagination },
        onPaginationChange,
    });

    return (
        <>
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
                                <TableCell colSpan={addressColumns.length} className="text-muted-foreground h-24 text-center">
                                    Loading addresses...
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
                                <TableCell colSpan={addressColumns.length} className="h-24 text-center">
                                    No addresses saved.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
        </>
    );
}

function RouteComponent() {
    const { openModal } = useUiStore();

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { data, isPending, isError, error, refetch, isFetching } = useGetMyAddresses(pagination.pageIndex + 1, pagination.pageSize);

    const rows = data?.items ?? [];
    const rowCount = data?.pagination.total ?? 0;

    return (
        <ContentSection
            title="Addresses"
            desc="Manage your saved addresses"
            withCTA
            ctaText="Add Address"
            ctaFunction={() => openModal("addressForm", { mode: "add" })}
            ctaIcon={<Plus />}
            withRefresh
            RefreshFunction={() => refetch()}
        >
            <div className="mt-4 space-y-4">
                {isError && (
                    <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {error.message}
                    </p>
                )}
                <AddressesTable
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
