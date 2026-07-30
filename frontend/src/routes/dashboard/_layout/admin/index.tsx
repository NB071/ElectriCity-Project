import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, YAxis, LabelList } from "recharts";
import { DollarSign, ShoppingCart, Users, Activity, Loader2 } from "lucide-react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-01";
import formatNumber from "@/lib/formatNumber";
import { QueryError } from "@/components/common/QueryError";
import { useGetAdminAnalytics, type AdminRecentOrder } from "@/hooks/api/analytics/use-admin-analytics";

export const Route = createFileRoute("/dashboard/_layout/admin/")({
    component: RouteComponent,
});

const STATUS_FILLS: Record<string, string> = {
    pending: "var(--color-processing)",
    processing: "var(--color-processing)",
    confirmed: "var(--color-shipped)",
    shipped: "var(--color-shipped)",
    delivered: "var(--color-delivered)",
    cancelled: "var(--color-cancelled)",
};

function RouteComponent() {
    const { data, isPending, isError, error, refetch, isFetching } = useGetAdminAnalytics();

    const overview = data ?? {
        kpis: {
            totalRevenue: 0,
            totalOrders: 0,
            newUsers: 0,
            averageOrderValue: 0,
        },
        ordersByStatus: [],
        recentActivity: [],
        revenueTrend: [],
    };

    const ordersByStatus = overview.ordersByStatus.map((row) => ({
        ...row,
        fill: STATUS_FILLS[row.status] ?? "var(--color-processing)",
    }));

    const statusChartConfig = {
        processing: { label: "Processing", color: "hsl(var(--chart-1))" },
        shipped: { label: "Shipped", color: "hsl(var(--chart-2))" },
        delivered: { label: "Delivered", color: "hsl(var(--chart-3))" },
        cancelled: { label: "Cancelled", color: "hsl(var(--chart-4))" },
    };

    const revenueConfig = {
        revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
    };

    const columns = useMemo<ColumnDef<AdminRecentOrder>[]>(
        () => [
            {
                accessorKey: "orderId",
                header: "Order ID",
                cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? "")}</span>,
            },
            {
                accessorKey: "customerName",
                header: "Customer",
                cell: ({ getValue }) => String(getValue() ?? "-"),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => <span className="capitalize">{String(getValue() ?? "")}</span>,
            },
            {
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ getValue }) => {
                    const value = getValue();
                    return value ? new Date(String(value)).toLocaleDateString() : "-";
                },
            },
            {
                accessorKey: "total",
                header: () => <div className="text-right">Total</div>,
                cell: ({ getValue }) => <div className="text-right">${Number(getValue() ?? 0).toFixed(2)}</div>,
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
        <ContentSection title="Admin Dashboard" desc="Overview of usage" withRefresh RefreshFunction={() => void refetch()}>
            <div className="mt-4 flex flex-col gap-8">
                {isError ? (
                    <QueryError title="Couldn't load admin overview" error={error} onRetry={() => void refetch()} isRetrying={isFetching} />
                ) : null}

                {isPending ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="text-muted-foreground h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        <NumberTicker prefix="$" end={overview.kpis.totalRevenue} decimals={2} format={formatNumber} />
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
                                        <NumberTicker end={overview.kpis.totalOrders} format={formatNumber} />
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
                                        <NumberTicker prefix="+" end={overview.kpis.newUsers} format={formatNumber} />
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
                                        <NumberTicker prefix="$" end={overview.kpis.averageOrderValue} decimals={2} format={formatNumber} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4 flex flex-col">
                                <CardHeader>
                                    <CardTitle>Revenue Trend</CardTitle>
                                    <CardDescription>Daily revenue over the recent window</CardDescription>
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

                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Orders by Status</CardTitle>
                                    <CardDescription>Current state of all active orders</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={statusChartConfig} className="h-[250px] w-full">
                                        <BarChart data={ordersByStatus} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
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
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
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
                    </>
                )}
            </div>
        </ContentSection>
    );
}
