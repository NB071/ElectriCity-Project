import { createFileRoute } from "@tanstack/react-router";
import { useUiStore } from "@/stores/ui-store";
import { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTablePagination, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/_layout/customer/orders")({
    component: RouteComponent,
});

type OrderListItemDTO = {
    order_id: string;
    order_status: string;
    payment_status: string;
    subtotal: number;
    tax: number;
    total: number;
    item_count: number;
    created_at: string;
    updated_at: string;
    // Mock detailed fields
    items?: any[];
    addresses?: any[];
    payment_attempts?: any[];
};

const MOCK_ORDERS: OrderListItemDTO[] = [
    {
        order_id: "ord_10203040",
        order_status: "processing",
        payment_status: "paid",
        subtotal: 100.0,
        tax: 15.0,
        total: 115.0,
        item_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        addresses: [
            {
                address_type: "shipping",
                full_name: "Jane Doe",
                phone_number: "+1 555-555-1234",
                street: "123 Solar Panel Way",
                city: "Austin",
                province: "TX",
                country: "USA",
                postal_code: "73301",
            },
            {
                address_type: "billing",
                full_name: "Jane Doe",
                phone_number: "+1 555-555-1234",
                street: "123 Solar Panel Way",
                city: "Austin",
                province: "TX",
                country: "USA",
                postal_code: "73301",
            },
        ],
        items: [
            {
                order_item_id: 1,
                cid: "cat_999",
                config_id: null,
                quantity: 2,
                unit_price: 50.0,
                line_total: 100.0,
                catalog_item: {
                    cid: "cat_999",
                    item_type: "accessory",
                    name: "Tesla Model S Floor Mats",
                    base_price: 50.0,
                    is_active: true,
                },
                configuration: null,
            },
        ],
        payment_attempts: [
            {
                attempt_id: "pa_889",
                amount: 115.0,
                payment_method: "credit_card",
                status: "success",
                attempted_at: new Date(Date.now() - 3600000).toISOString(),
            },
        ],
    },
    {
        order_id: "ord_20304050",
        order_status: "shipped",
        payment_status: "paid",
        subtotal: 51000.0,
        tax: 5100.0,
        total: 56100.0,
        item_count: 2,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        addresses: [
            {
                address_type: "shipping",
                full_name: "Jane Doe",
                phone_number: null,
                street: "456 Silicon Ave",
                city: "San Jose",
                province: "CA",
                country: "USA",
                postal_code: "95112",
            },
        ],
        items: [
            {
                order_item_id: 2,
                cid: "cat_101",
                config_id: "conf_888",
                quantity: 1,
                unit_price: 50500.0,
                line_total: 50500.0,
                catalog_item: {
                    cid: "cat_101",
                    item_type: "vehicle",
                    name: "ElectriCity Model Z",
                    base_price: 43000.0,
                    is_active: false,
                },
                configuration: {
                    config_id: "conf_888",
                    total_price: 50500.0,
                    created_at: new Date().toISOString(),
                    options: [
                        {
                            category_id: "catg_1",
                            category_name: "Battery",
                            select_type: "single",
                            option_id: "opt_1",
                            name: "Long Range Plus",
                            price_delta: 5000.0,
                        },
                        {
                            category_id: "catg_2",
                            category_name: "Wheels",
                            select_type: "single",
                            option_id: "opt_w3",
                            name: '20" Cyber Aero',
                            price_delta: 1500.0,
                        },
                        {
                            category_id: "catg_3",
                            category_name: "Paint",
                            select_type: "single",
                            option_id: "opt_p4",
                            name: "Midnight Silver Metallic",
                            price_delta: 1000.0,
                        },
                    ],
                },
            },
            {
                order_item_id: 3,
                cid: "cat_105",
                config_id: null,
                quantity: 1,
                unit_price: 500.0,
                line_total: 500.0,
                catalog_item: {
                    cid: "cat_105",
                    item_type: "charger",
                    name: "Wall Connector Gen 3",
                    base_price: 500.0,
                    is_active: true,
                },
                configuration: null,
            },
        ],
        payment_attempts: [
            {
                attempt_id: "pa_9001",
                amount: 56100.0,
                payment_method: "debit_card",
                status: "success",
                attempted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
        ],
    },
    {
        order_id: "ord_30405060",
        order_status: "delivered",
        payment_status: "paid",
        subtotal: 1200.0,
        tax: 120.0,
        total: 1320.0,
        item_count: 3,
        created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        addresses: [],
        items: [
            {
                order_item_id: 4,
                cid: "cat_801",
                config_id: "conf_92",
                quantity: 3,
                unit_price: 400.0,
                line_total: 1200.0,
                catalog_item: {
                    cid: "cat_801",
                    item_type: "energy",
                    name: "Solar Roof Tile Module",
                    base_price: 350.0,
                    is_active: true,
                },
                configuration: {
                    config_id: "conf_92",
                    total_price: 400.0,
                    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
                    options: [
                        {
                            category_id: "catg_8",
                            category_name: "Finish",
                            select_type: "single",
                            option_id: "opt_f2",
                            name: "Textured Glass",
                            price_delta: 50.0,
                        },
                    ],
                },
            },
        ],
        payment_attempts: [
            {
                attempt_id: "pa_1001",
                amount: 1320.0,
                payment_method: "apple_pay",
                status: "failed",
                attempted_at: new Date(Date.now() - 86400000 * 13).toISOString(),
            },
            {
                attempt_id: "pa_1002",
                amount: 1320.0,
                payment_method: "credit_card",
                status: "success",
                attempted_at: new Date(Date.now() - 86400000 * 12).toISOString(),
            },
        ],
    },
    {
        order_id: "ord_40506070",
        order_status: "cancelled",
        payment_status: "refunded",
        subtotal: 200.0,
        tax: 26.0,
        total: 226.0,
        item_count: 0,
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 28).toISOString(),
        addresses: [
            {
                address_type: "billing",
                full_name: "Bruce Wayne",
                phone_number: "+1 222-333-4444",
                street: "1007 Mountain Drive",
                city: "Gotham",
                province: "NJ",
                country: "USA",
                postal_code: "12345",
            },
        ],
        items: [
            {
                order_item_id: 5,
                cid: "cat_201",
                config_id: null,
                quantity: 1,
                unit_price: 200.0,
                line_total: 200.0,
                catalog_item: {
                    cid: "cat_201",
                    item_type: "accessory",
                    name: "Wall Connector Cover",
                    base_price: 200.0,
                    is_active: false,
                },
                configuration: null,
            },
        ],
        payment_attempts: [
            {
                attempt_id: "pa_2001",
                amount: 226.0,
                payment_method: "credit_card",
                status: "success",
                attempted_at: new Date(Date.now() - 86400000 * 29).toISOString(),
            },
        ],
    },
    {
        order_id: "ord_50607080",
        order_status: "processing",
        payment_status: "pending",
        subtotal: 75.0,
        tax: 9.75,
        total: 84.75,
        item_count: 1,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        addresses: [
            {
                address_type: "billing",
                full_name: "John Smith",
                phone_number: "+1 415-999-8888",
                street: "789 Redwood Blvd",
                city: "San Francisco",
                province: "CA",
                country: "USA",
                postal_code: "94103",
            },
        ],
        items: [
            {
                order_item_id: 6,
                cid: "cat_301",
                config_id: null,
                quantity: 1,
                unit_price: 75.0,
                line_total: 75.0,
                catalog_item: {
                    cid: "cat_301",
                    item_type: "apparel",
                    name: "ElectriCity Logo Tee",
                    base_price: 75.0,
                    is_active: true,
                },
                configuration: null,
            },
        ],
        payment_attempts: [
            {
                attempt_id: "pa_3001",
                amount: 84.75,
                payment_method: "apple_pay",
                status: "pending",
                attempted_at: new Date().toISOString(),
            },
        ],
    },
];

function RouteComponent() {
    const { openModal } = useUiStore();
    const [data] = useState<OrderListItemDTO[]>(MOCK_ORDERS);

    const columns = useMemo(
        () => [
            {
                accessorKey: "order_id",
                header: "Order ID",
                cell: (info: any) => <span className="font-semibold">{info.getValue()}</span>,
            },
            {
                accessorKey: "created_at",
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Date Placed" />,
                cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
            },
            {
                accessorKey: "item_count",
                header: "Items",
                cell: (info: any) => `${info.getValue()} items`,
            },
            {
                accessorKey: "order_status",
                header: "Status",
                cell: (info: any) => {
                    const status = info.getValue() as string;
                    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

                    if (status === "delivered") variant = "default";
                    else if (status === "processing" || status === "shipped") variant = "secondary";
                    else if (status === "cancelled") variant = "destructive";

                    return (
                        <Badge variant={variant} className="capitalize">
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "total",
                header: () => <div className="text-right">Total</div>,
                cell: (info: any) => {
                    const total = Number(info.getValue());
                    return <div className="text-right font-medium">${total.toFixed(2)}</div>;
                },
            },
            {
                id: "actions",
                cell: ({ row }: any) => {
                    const order = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open actions menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openModal("orderDetail", { orderData: order })}>View Details</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    });

    return (
        <ContentSection
            title="My Orders"
            desc="View your past transactions and track current shipments."
            withRefresh
            RefreshFunction={() => console.log("Refresh Orders")}
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
                                        No orders found.
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
