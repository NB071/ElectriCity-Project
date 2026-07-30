import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";
import { DollarSign, Package, CheckCircle2, Heart, Loader2 } from "lucide-react";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-01";
import formatNumber from "@/lib/formatNumber";
import { EmptyState } from "@/components/common/EmptyState";
import { QueryError } from "@/components/common/QueryError";
import { useGetCustomerAnalytics } from "@/hooks/api/analytics/use-customer-analytics";

export const Route = createFileRoute("/dashboard/_layout/customer/")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, isPending, isError, error, refetch, isFetching } = useGetCustomerAnalytics();

    const overview = data ?? {
        accountSummary: {
            status: "active",
            memberSince: new Date().toISOString(),
            totalAmountSpent: 0,
        },
        orderStats: {
            totalOrders: 0,
            activeOrders: 0,
            completedOrders: 0,
        },
        wishlistStats: {
            itemCount: 0,
        },
        recentOrders: [],
    };

    const orderChartData = [
        { status: "Active", count: overview.orderStats.activeOrders, fill: "var(--color-active)" },
        { status: "Completed", count: overview.orderStats.completedOrders, fill: "var(--color-completed)" },
    ];
    const hasOrderChartData = orderChartData.some((row) => row.count > 0);

    const chartConfig = {
        active: { label: "Active Orders", color: "hsl(var(--chart-1))" },
        completed: { label: "Completed Orders", color: "hsl(var(--chart-2))" },
    };

    return (
        <ContentSection title="Customer Dashboard" desc="Overview of usage" withRefresh RefreshFunction={() => void refetch()}>
            <div className="mt-4 flex flex-col gap-8">
                {isError ? (
                    <QueryError title="Couldn't load customer overview" error={error} onRetry={() => void refetch()} isRetrying={isFetching} />
                ) : null}

                {isPending ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid w-full gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                                    <DollarSign className="text-muted-foreground h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        <NumberTicker
                                            prefix="$"
                                            end={overview.accountSummary.totalAmountSpent}
                                            decimals={2}
                                            format={formatNumber}
                                        />
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
                                        <NumberTicker end={overview.orderStats.activeOrders} format={formatNumber} />
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
                                        <NumberTicker end={overview.orderStats.completedOrders} format={formatNumber} />
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
                                        <NumberTicker end={overview.wishlistStats.itemCount} format={formatNumber} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                    <CardDescription>Breakdown of your orders</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {hasOrderChartData ? (
                                        <ChartContainer config={chartConfig} className="h-62.5 w-full">
                                            <BarChart data={orderChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="status" tickLine={false} axisLine={false} />
                                                <YAxis hide />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <Bar dataKey="count" radius={4}>
                                                    <LabelList dataKey="count" position="top" />
                                                </Bar>
                                            </BarChart>
                                        </ChartContainer>
                                    ) : (
                                        <EmptyState
                                            icon={Package}
                                            title="No orders yet"
                                            description="Place an order to see your active vs completed breakdown here."
                                            className="h-62.5 border-none"
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Recent Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {overview.recentOrders.length > 0 ? (
                                        <Table>
                                            <TableHeader className="bg-muted rounded-xl">
                                                <TableRow>
                                                    <TableHead>Order ID</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Items</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {overview.recentOrders.map((order) => (
                                                    <TableRow key={order.orderId}>
                                                        <TableCell className="font-medium">{order.orderId}</TableCell>
                                                        <TableCell className="capitalize">{order.status}</TableCell>
                                                        <TableCell>{order.itemCount}</TableCell>
                                                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-right">${Number(order.total).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <EmptyState
                                            icon={Package}
                                            title="No recent orders"
                                            description="Your latest purchases will show up here once you place an order."
                                            className="h-62.5 border-none"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </ContentSection>
    );
}
