import { createFileRoute } from "@tanstack/react-router";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-01";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const Route = createFileRoute("/dashboard/_layout/admin/analytics")({
    component: RouteComponent,
});

const MOCK_ADMIN_OVERVIEW = {
    kpis: {
        totalRevenue: 1245900.5,
        totalOrders: 14502,
        newUsers: 1845,
        averageOrderValue: 85.91,
    },
    revenueTrend: [
        { date: "2026-07-01", revenue: 45000 },
        { date: "2026-07-02", revenue: 52000 },
        { date: "2026-07-03", revenue: 48000 },
        { date: "2026-07-04", revenue: 61000 },
        { date: "2026-07-05", revenue: 59000 },
        { date: "2026-07-06", revenue: 65000 },
        { date: "2026-07-07", revenue: 71000 },
    ],
};

const MOCK_EVENT_BREAKDOWN = [
    { code: "vehicle_details_view", name: "Vehicle Details View", total: 45020 },
    { code: "hot_deals_view", name: "Hot Deals View", total: 12450 },
    { code: "cart_add", name: "Add to Cart", total: 4200 },
    { code: "wishlist_add", name: "Add to Wishlist", total: 2800 },
    { code: "review_publish", name: "Publish Review", total: 850 },
];

const MOCK_VIEW_TREND = [
    { date: "2026-07-01", count: 5200 },
    { date: "2026-07-02", count: 6100 },
    { date: "2026-07-03", count: 5800 },
    { date: "2026-07-04", count: 7100 },
    { date: "2026-07-05", count: 6900 },
    { date: "2026-07-06", count: 8200 },
    { date: "2026-07-07", count: 8600 },
];

const MOCK_TOP_ITEMS = [
    { name: "Tesla Model S Plaid", views: 4200 },
    { name: "Rivian R1T Launch", views: 3850 },
    { name: "Lucid Air Sapphire", views: 2900 },
    { name: "Ford F-150 Lightning", views: 2450 },
    { name: "Porsche Taycan 4S", views: 1800 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const revenueConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
};

function RouteComponent() {
    return (
        <ContentSection
            title="Advanced Analytics"
            desc="System-wide telemetry mapping encompassing complete behavioral tracking and fiscal aggregates."
            withRefresh
            RefreshFunction={() => window.location.reload()}
        >
            <div className="mt-4 flex flex-col gap-8">
                {/* Top KPIs */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Lifetime Revenue</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="$" end={MOCK_ADMIN_OVERVIEW.kpis.totalRevenue} decimals={2} />
                            </div>
                            <p className="text-muted-foreground text-xs">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Global Network Orders</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="+" end={MOCK_ADMIN_OVERVIEW.kpis.totalOrders} />
                            </div>
                            <p className="text-muted-foreground text-xs">+12.5% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Adoptions</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="+" end={MOCK_ADMIN_OVERVIEW.kpis.newUsers} />
                            </div>
                            <p className="text-muted-foreground text-xs">+180 new accounts this week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                            <Activity className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <NumberTicker prefix="$" end={MOCK_ADMIN_OVERVIEW.kpis.averageOrderValue} decimals={2} />
                            </div>
                            <p className="text-muted-foreground text-xs">+1.2% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Revenue Area Chart using ChartContainer */}
                    <Card className="col-span-4 flex flex-col">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>Daily revenue across the trailing fiscal window.</CardDescription>
                        </CardHeader>
                        <CardContent className="relative w-full flex-1">
                            <ChartContainer config={revenueConfig} className="absolute inset-0 h-full min-h-[300px] w-full pr-6 pb-6">
                                <AreaChart data={MOCK_ADMIN_OVERVIEW.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(5).replace("-", "/")}
                                    />
                                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
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

                    {/* Event Breakdown Pie Chart */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Event Breakdown</CardTitle>
                            <CardDescription>Summation of tracked user actions across the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={MOCK_EVENT_BREAKDOWN}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="total"
                                    >
                                        {MOCK_EVENT_BREAKDOWN.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: number, name: string) => [val.toLocaleString(), name]}
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="bottom"
                                        align="center"
                                        wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 pb-12 md:grid-cols-2 lg:grid-cols-7">
                    {/* Traffic Trend Line Chart */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Traffic Trend</CardTitle>
                            <CardDescription>Daily page views signaling platform engagement.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={MOCK_VIEW_TREND}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.split("-").slice(1).join("/")}
                                    />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        formatter={(val: number) => [val.toLocaleString(), "Views"]}
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Line type="step" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Items Bar Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Top Catalog Items</CardTitle>
                            <CardDescription>Products generating the most organic views and engagement.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={MOCK_TOP_ITEMS} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                    />
                                    <Tooltip
                                        formatter={(val: number) => [val.toLocaleString(), "Views"]}
                                        cursor={{ fill: "transparent" }}
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Bar dataKey="views" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ContentSection>
    );
}
