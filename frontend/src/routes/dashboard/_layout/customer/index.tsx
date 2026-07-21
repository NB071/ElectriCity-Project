import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";
import { DollarSign, Package, CheckCircle2, Heart } from "lucide-react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-01";

export const Route = createFileRoute("/dashboard/_layout/customer/")({
    component: RouteComponent,
});

function RouteComponent() {
    const overview = {
        accountSummary: {
            status: "active",
            memberSince: "2024-01-15T00:00:00.000Z",
            totalAmountSpent: 3450.75,
        },
        orderStats: {
            totalOrders: 12,
            activeOrders: 1,
            completedOrders: 11,
        },
        wishlistStats: {
            itemCount: 4,
        },
        recentOrders: [
            { orderId: "ORD-1420", total: 150.0, status: "processing", itemCount: 2, createdAt: new Date().toISOString() },
            { orderId: "ORD-1312", total: 85.5, status: "delivered", itemCount: 1, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
        ],
    };

    const orderChartData = [
        { status: "Active", count: overview.orderStats.activeOrders, fill: "var(--color-active)" },
        { status: "Completed", count: overview.orderStats.completedOrders, fill: "var(--color-completed)" },
    ];

    const chartConfig = {
        active: { label: "Active Orders", color: "hsl(var(--chart-1))" },
        completed: { label: "Completed Orders", color: "hsl(var(--chart-2))" },
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "orderId",
                header: "Order ID",
                cell: (info: any) => <span className="font-medium">{info.getValue()}</span>,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: (info: any) => <span className="capitalize">{info.getValue()}</span>,
            },
            {
                accessorKey: "itemCount",
                header: "Items",
            },
            {
                accessorKey: "createdAt",
                header: "Date",
                cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
            },
            {
                accessorKey: "total",
                header: () => <div className="text-right">Total</div>,
                cell: (info: any) => <div className="text-right">${Number(info.getValue()).toFixed(2)}</div>,
            },
        ],
        []
    );

    const table = useReactTable({
        data: overview.recentOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <ContentSection title="Customer Dashboard" desc="Overview of usage" withRefresh={true} RefreshFunction={() => window.location.reload()}>
            <div className="mt-4 flex flex-col gap-8">
                {/* Summary Cards */}
                <div className="grid w-full gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="$" end={overview.accountSummary.totalAmountSpent} decimals={2} />
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Member since {new Date(overview.accountSummary.memberSince).getFullYear()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                            <Package className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker end={overview.orderStats.activeOrders} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker end={overview.orderStats.completedOrders} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                            <Heart className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker end={overview.wishlistStats.itemCount} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                    {/* Orders Overview Chart */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Breakdown of your orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart data={orderChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="status" tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" radius={4}>
                                        <LabelList dataKey="count" position="top" />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Orders Table with TanStack */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-muted rounded-xl">
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
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ContentSection>
    );
}
