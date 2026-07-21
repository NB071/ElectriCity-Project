import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/data-table";
import { MoreHorizontal, Plus, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/dashboard/_layout/settings/addresses")({
    component: RouteComponent,
});

// Mocked DTO based on backend structure
type AddressDTO = {
    address_id: number;
    street: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
    is_default: boolean;
};

const MOCK_ADDRESSES: AddressDTO[] = [
    {
        address_id: 1,
        street: "123 Tesla Blvd",
        city: "Austin",
        province: "TX",
        country: "USA",
        postal_code: "73301",
        is_default: true,
    },
    {
        address_id: 2,
        street: "456 Silicon Ave",
        city: "San Jose",
        province: "CA",
        country: "USA",
        postal_code: "95112",
        is_default: false,
    },
    {
        address_id: 3,
        street: "789 Innovation Dr",
        city: "Seattle",
        province: "WA",
        country: "USA",
        postal_code: "98101",
        is_default: false,
    },
    {
        address_id: 4,
        street: "101 Tech Way",
        city: "Boston",
        province: "MA",
        country: "USA",
        postal_code: "02108",
        is_default: false,
    },
    {
        address_id: 5,
        street: "112 Future St",
        city: "New York",
        province: "NY",
        country: "USA",
        postal_code: "10001",
        is_default: false,
    },
    {
        address_id: 6,
        street: "123 Tesla Blvd",
        city: "Austin",
        province: "TX",
        country: "USA",
        postal_code: "73301",
        is_default: false,
    },
    {
        address_id: 7,
        street: "456 Silicon Ave",
        city: "San Jose",
        province: "CA",
        country: "USA",
        postal_code: "95112",
        is_default: false,
    },
    {
        address_id: 8,
        street: "789 Innovation Dr",
        city: "Seattle",
        province: "WA",
        country: "USA",
        postal_code: "98101",
        is_default: false,
    },
    {
        address_id: 9,
        street: "101 Tech Way",
        city: "Boston",
        province: "MA",
        country: "USA",
        postal_code: "02108",
        is_default: false,
    },
    {
        address_id: 10,
        street: "112 Future St",
        city: "New York",
        province: "NY",
        country: "USA",
        postal_code: "10001",
        is_default: false,
    },
];

function RouteComponent() {
    const { openModal } = useUiStore();
    const [data] = useState<AddressDTO[]>(MOCK_ADDRESSES);

    const columns = useMemo(
        () => [
            {
                accessorKey: "street",
                header: "Address",
                cell: (info: any) => {
                    const row = info.row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">{row.street}</span>
                            {row.is_default && <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">Default</span>}
                        </div>
                    );
                },
            },
            {
                accessorKey: "city",
                header: "City",
            },
            {
                accessorKey: "province",
                header: "State/Province",
            },
            {
                accessorKey: "postal_code",
                header: "Zip/Postal Code",
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    const address = row.original;
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
                                <DropdownMenuItem onClick={() => openModal("addressForm", { mode: "edit", addressData: address })}>
                                    Edit Address
                                </DropdownMenuItem>
                                {!address.is_default && (
                                    <DropdownMenuItem onClick={() => console.log("Set Default", address.address_id)}>Set as Default</DropdownMenuItem>
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
                pageSize: 5,
            },
        },
    });

    return (
        <ContentSection
            title="Addresses"
            desc="Manage your saved addresses"
            withCTA
            ctaText="Add Address"
            ctaFunction={() => openModal("addressForm", { mode: "add" })}
            ctaIcon={<Plus />}
            withRefresh
            RefreshFunction={() => console.log("Refresh")}
        >
            <div className="mt-4 space-y-4">
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
                                        No addresses saved.
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
