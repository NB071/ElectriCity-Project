import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, YAxis, LabelList } from "recharts";
import { DollarSign, ShoppingCart, Users, Activity } from "lucide-react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-01";

export const Route = createFileRoute("/dashboard/_layout/admin/")({
    component: RouteComponent,
});

function RouteComponent() {
    const overview = {
        kpis: {
            totalRevenue: 125430.5,
            totalOrders: 1420,
            newUsers: 85,
            averageOrderValue: 88.33,
        },
        ordersByStatus: [
            { status: "processing", count: 45, fill: "var(--color-processing)" },
            { status: "shipped", count: 120, fill: "var(--color-shipped)" },
            { status: "delivered", count: 1250, fill: "var(--color-delivered)" },
            { status: "cancelled", count: 5, fill: "var(--color-cancelled)" },
        ],
        recentActivity: [
            { orderId: "ORD-1420", customerName: "John Doe", total: 150.0, status: "processing", createdAt: new Date().toISOString() },
            {
                orderId: "ORD-1419",
                customerName: "Jane Smith",
                total: 1200.5,
                status: "shipped",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                orderId: "ORD-1418",
                customerName: "Alice Walker",
                total: 85.0,
                status: "delivered",
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
                orderId: "ORD-1417",
                customerName: "Bob Singer",
                total: 12.5,
                status: "cancelled",
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            },
        ],
        revenueTrend: [
            { date: "2026-07-15", revenue: 5400.0 },
            { date: "2026-07-16", revenue: 6100.5 },
            { date: "2026-07-17", revenue: 5900.25 },
            { date: "2026-07-18", revenue: 7200.0 },
            { date: "2026-07-19", revenue: 8430.25 },
        ],
    };

    const statusChartConfig = {
        processing: { label: "Processing", color: "hsl(var(--chart-1))" },
        shipped: { label: "Shipped", color: "hsl(var(--chart-2))" },
        delivered: { label: "Delivered", color: "hsl(var(--chart-3))" },
        cancelled: { label: "Cancelled", color: "hsl(var(--chart-4))" },
    };

    const revenueConfig = {
        revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "orderId",
                header: "Order ID",
                cell: (info: any) => <span className="font-medium">{info.getValue()}</span>,
            },
            {
                accessorKey: "customerName",
                header: "Customer",
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: (info: any) => <span className="capitalize">{info.getValue()}</span>,
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
        data: overview.recentActivity,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <ContentSection title="Admin Dashboard" desc="Overview of usage" withRefresh={true} RefreshFunction={() => window.location.reload()}>
            <div className="mt-4 flex flex-col gap-8">
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="$" end={overview.kpis.totalRevenue} decimals={2} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker end={overview.kpis.totalOrders} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Users</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="+" end={overview.kpis.newUsers} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                            <Activity className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="$" end={overview.kpis.averageOrderValue} decimals={2} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Revenue Trend Chart */}
                    <Card className="col-span-4 flex flex-col">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>Daily revenue over the past 5 days</CardDescription>
                        </CardHeader>
                        <CardContent className="relative w-full flex-1">
                            <ChartContainer config={revenueConfig} className="absolute inset-0 w-full pr-6 pb-6">
                                <AreaChart data={overview.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(value) => value.slice(5)} />
                                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        fill="var(--color-revenue)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-revenue)"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Orders by Status Chart */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Orders by Status</CardTitle>
                            <CardDescription>Current state of all active orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={statusChartConfig} className="h-[250px] w-full">
                                <BarChart data={overview.ordersByStatus} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="status"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        className="capitalize"
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                    <Bar dataKey="count" radius={4}>
                                        <LabelList dataKey="count" position="right" />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Table using TanStack Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest orders placed in the store.</CardDescription>
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
        </ContentSection>
    );
}
