import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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
import formatNumber from "@/lib/formatNumber";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CalendarIcon, CreditCard, DollarSign, Eye, Loader2, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { EmptyState } from "@/components/common/EmptyState";
import { QueryError } from "@/components/common/QueryError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table";
import { useUiStore } from "@/stores/ui-store";
import {
    adminAnalyticsKeys,
    setAdminEventTypeActiveVariables,
    useGetAdminAnalytics,
    useGetAdminEvents,
    useGetAdminEventTypes,
    useGetAdminEventTrend,
    useGetAdminEventTypeBreakdown,
    useGetAdminTopCatalogItems,
    useSetAdminEventTypeActive,
    type AdminEventListItem,
    type AdminEventType,
    type EventTypeBreakdownItem,
} from "@/hooks/api/analytics/use-admin-analytics";
import { queryClient } from "@/integrations/tanstack-query/query-client";

export const Route = createFileRoute("/dashboard/_layout/admin/analytics")({
    component: RouteComponent,
});

const ANALYTICS_EVENT_TYPES = [
    { id: 1, code: "hot_deals_view", label: "Hot deals view" },
    { id: 2, code: "vehicle_details_view", label: "Vehicle details view" },
    { id: 3, code: "cart_add", label: "Cart add" },
    { id: 4, code: "cart_remove", label: "Cart remove" },
    { id: 5, code: "purchase", label: "Purchase" },
    { id: 6, code: "edit_profile", label: "Edit profile" },
    { id: 7, code: "delete_account", label: "Delete account" },
    { id: 8, code: "publish_review", label: "Publish review" },
    { id: 9, code: "delete_review", label: "Delete review" },
    { id: 10, code: "wishlist_add", label: "Wishlist add" },
    { id: 11, code: "wishlist_remove", label: "Wishlist remove" },
] as const;

type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

const CATALOG_EVENT_TYPES = ANALYTICS_EVENT_TYPES.filter((type) => [2, 3, 4, 5, 8, 10, 11].includes(type.id));

const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 366;
const DEFAULT_EVENT_TYPE_ID = 2;

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const revenueConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
};

function resolveEventTypeId(item: EventTypeBreakdownItem) {
    return item.event_type_id ?? ANALYTICS_EVENT_TYPES.find((type) => type.code === item.code)?.id;
}

function EventTypeSelect({
    value,
    onValueChange,
    includeAll = false,
    eventTypes = ANALYTICS_EVENT_TYPES,
}: {
    value: number | null;
    onValueChange: (value: number | null) => void;
    includeAll?: boolean;
    eventTypes?: readonly AnalyticsEventType[];
}) {
    return (
        <Select value={value == null ? "all" : String(value)} onValueChange={(next) => onValueChange(next === "all" ? null : Number(next))}>
            <SelectTrigger className="w-full sm:w-52" size="sm">
                <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {includeAll ? <SelectItem value="all">All event types</SelectItem> : null}
                    {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                            {type.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

type EventLogsTableProps = {
    rows: AdminEventListItem[];
    rowCount: number;
    isPending: boolean;
    isFetching: boolean;
    pagination: PaginationState;
    onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
};

function EventLogsTable({ rows, rowCount, isPending, isFetching, pagination, onPaginationChange }: EventLogsTableProps) {
    "use no memo";

    const { openModal } = useUiStore();

    const columns: ColumnDef<AdminEventListItem>[] = [
        {
            accessorKey: "event_id",
            header: "Event ID",
            cell: (info) => <span className="text-muted-foreground font-mono text-xs">#{String(info.getValue())}</span>,
        },
        {
            id: "event",
            header: "Event",
            cell: ({ row }) => (
                <div className="flex max-w-64 flex-col gap-1">
                    <span className="truncate text-sm font-medium">{row.original.event_type_name}</span>
                    <Badge variant="outline" className="w-fit font-mono text-[10px]">
                        {row.original.event_code}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: "user_id",
            header: "User",
            cell: (info) =>
                info.getValue() == null ? (
                    <span className="text-muted-foreground">Anonymous</span>
                ) : (
                    <span className="font-mono text-xs">#{String(info.getValue())}</span>
                ),
        },
        {
            id: "catalog",
            header: "Catalog Item",
            cell: ({ row }) =>
                row.original.cid == null ? (
                    <span className="text-muted-foreground">-</span>
                ) : (
                    <div className="flex max-w-56 flex-col gap-0.5">
                        <span className="truncate text-sm">{row.original.catalog_name ?? `Item #${row.original.cid}`}</span>
                        <span className="text-muted-foreground font-mono text-xs">#{row.original.cid}</span>
                    </div>
                ),
        },
        {
            accessorKey: "ip",
            header: "IP Address",
            cell: (info) => <span className="text-muted-foreground font-mono text-xs">{String(info.getValue() ?? "-")}</span>,
        },
        {
            accessorKey: "generated_at",
            header: "Generated",
            cell: (info) => <span className="text-sm whitespace-nowrap">{new Date(String(info.getValue())).toLocaleString()}</span>,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => openModal("analyticsEventDetail", { eventId: row.original.event_id })}>
                        <Eye data-icon="inline-start" />
                        View Details
                    </Button>
                </div>
            ),
        },
    ];

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        rowCount,
        state: { pagination },
        onPaginationChange,
    });

    return (
        <div className="flex flex-col gap-4">
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
                                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                                    Loading event logs...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className={isFetching ? "opacity-60" : undefined}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No analytics events were recorded in this period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}

function EventTypeTrackingSettings() {
    const eventTypesQuery = useGetAdminEventTypes();
    const setActiveMutation = useSetAdminEventTypeActive();
    const eventTypes = eventTypesQuery.data ?? [];

    const pendingEventTypeId = (() => {
        if (!setActiveMutation.isPending || !setActiveMutation.variables?.url) {
            return null;
        }
        const match = setActiveMutation.variables.url.match(/event-types\/(\d+)\/active/);
        return match ? Number(match[1]) : null;
    })();

    function handleToggle(eventType: AdminEventType, checked: boolean) {
        if (eventType.is_active === checked) {
            return;
        }
        setActiveMutation.mutate(setAdminEventTypeActiveVariables(eventType.event_type_id, checked));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Type Tracking</CardTitle>
                <CardDescription>Enable or disable which event types are recorded by the analytics pipeline.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
                {eventTypesQuery.isError ? (
                    <QueryError
                        title="Couldn't load event types"
                        error={eventTypesQuery.error}
                        onRetry={() => void eventTypesQuery.refetch()}
                        isRetrying={eventTypesQuery.isFetching}
                    />
                ) : eventTypesQuery.isPending ? (
                    <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
                        <Loader2 className="size-4 animate-spin" />
                        Loading event types...
                    </div>
                ) : eventTypes.length === 0 ? (
                    <EmptyState icon={Activity} title="No event types" description="No analytics event types are configured yet." className="py-10" />
                ) : (
                    <FieldGroup className="gap-4">
                        {eventTypes.map((eventType, index) => {
                            const switchId = `event-type-${eventType.event_type_id}`;
                            const isToggling = pendingEventTypeId === eventType.event_type_id;

                            return (
                                <div key={eventType.event_type_id} className="flex flex-col gap-4">
                                    {index > 0 ? <Separator /> : null}
                                    <Field orientation="horizontal" data-disabled={isToggling || undefined}>
                                        <FieldContent>
                                            <FieldLabel htmlFor={switchId}>{eventType.name}</FieldLabel>
                                            <FieldDescription>
                                                {eventType.description ? `${eventType.description} (${eventType.code})` : eventType.code}
                                            </FieldDescription>
                                        </FieldContent>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={eventType.is_active ? "secondary" : "outline"}>
                                                {eventType.is_active ? "Active" : "Off"}
                                            </Badge>
                                            <Switch
                                                id={switchId}
                                                checked={eventType.is_active}
                                                disabled={isToggling}
                                                onCheckedChange={(checked) => handleToggle(eventType, checked)}
                                                aria-label={`Toggle ${eventType.name}`}
                                            />
                                        </div>
                                    </Field>
                                </div>
                            );
                        })}
                    </FieldGroup>
                )}
            </CardContent>
        </Card>
    );
}

function startOfDay(date: Date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function sameCalendarDay(left?: Date, right?: Date) {
    if (!left && !right) return true;
    if (!left || !right) return false;
    return format(left, "yyyy-MM-dd") === format(right, "yyyy-MM-dd");
}

function RouteComponent() {
    const [maxSelectableDate] = useState(() => startOfDay(new Date()));
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const end = startOfDay(new Date());
        return {
            from: subDays(end, DEFAULT_RANGE_DAYS),
            to: end,
        };
    });
    const [dateRangeError, setDateRangeError] = useState<string | null>(null);
    const [eventTypeId, setEventTypeId] = useState<number>(DEFAULT_EVENT_TYPE_ID);
    const [catalogEventTypeId, setCatalogEventTypeId] = useState<number>(DEFAULT_EVENT_TYPE_ID);
    const [logEventTypeId, setLogEventTypeId] = useState<number | null>(null);
    const [eventPagination, setEventPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const eventLogsRef = useRef<HTMLDivElement>(null);

    const rangeStart = dateRange?.from ?? subDays(maxSelectableDate, DEFAULT_RANGE_DAYS);
    const rangeEnd = dateRange?.to ?? rangeStart;
    const reportStart = format(rangeStart, "yyyy-MM-dd");
    const reportEnd = format(rangeEnd, "yyyy-MM-dd");
    const reportRange = { start: reportStart, end: reportEnd };
    const selectedEventType = ANALYTICS_EVENT_TYPES.find((type) => type.id === eventTypeId) ?? ANALYTICS_EVENT_TYPES[1];
    const selectedCatalogEventType = CATALOG_EVENT_TYPES.find((type) => type.id === catalogEventTypeId) ?? CATALOG_EVENT_TYPES[0];
    const selectedLogEventType = ANALYTICS_EVENT_TYPES.find((type) => type.id === logEventTypeId);

    const overviewQuery = useGetAdminAnalytics();
    const breakdownQuery = useGetAdminEventTypeBreakdown({ start: reportStart, end: reportEnd, limit: 10 });
    const trendQuery = useGetAdminEventTrend(eventTypeId, reportRange);
    const topItemsQuery = useGetAdminTopCatalogItems(catalogEventTypeId, { start: reportStart, end: reportEnd, limit: 10 });
    const eventsQuery = useGetAdminEvents({
        page: eventPagination.pageIndex + 1,
        limit: eventPagination.pageSize,
        start: reportStart,
        end: reportEnd,
        ...(logEventTypeId != null ? { event_type_id: logEventTypeId } : {}),
    });

    const isPending = overviewQuery.isPending || breakdownQuery.isPending || trendQuery.isPending || topItemsQuery.isPending;
    const isFetching = overviewQuery.isFetching || breakdownQuery.isFetching || trendQuery.isFetching || topItemsQuery.isFetching;
    const firstError = overviewQuery.error ?? breakdownQuery.error ?? trendQuery.error ?? topItemsQuery.error;
    const isError = overviewQuery.isError || breakdownQuery.isError || trendQuery.isError || topItemsQuery.isError;

    function refreshAll() {
        void Promise.all([
            overviewQuery.refetch(),
            breakdownQuery.refetch(),
            trendQuery.refetch(),
            topItemsQuery.refetch(),
            eventsQuery.refetch(),
            queryClient.invalidateQueries({ queryKey: adminAnalyticsKeys.eventTypes() }),
        ]);
    }

    function handleDateRangeChange(nextRange: DateRange | undefined) {
        if (!nextRange?.from) {
            return;
        }

        if (nextRange.to && differenceInCalendarDays(nextRange.to, nextRange.from) > MAX_RANGE_DAYS) {
            setDateRangeError(`Date range must not exceed ${MAX_RANGE_DAYS} days.`);
            return;
        }

        setDateRangeError(null);
        setDateRange((prev) => {
            if (sameCalendarDay(prev?.from, nextRange.from) && sameCalendarDay(prev?.to, nextRange.to)) {
                return prev;
            }
            return nextRange;
        });
        setEventPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    }

    function handleLogEventTypeChange(value: number | null) {
        setLogEventTypeId(value);
        setEventPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    }

    function handleBreakdownSelection(eventTypeId: number | undefined) {
        if (eventTypeId == null) {
            return;
        }

        handleLogEventTypeChange(eventTypeId);
        requestAnimationFrame(() => {
            eventLogsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            eventLogsRef.current?.focus({ preventScroll: true });
        });
    }

    const overview = overviewQuery.data ?? {
        kpis: {
            totalRevenue: 0,
            totalOrders: 0,
            newUsers: 0,
            averageOrderValue: 0,
        },
        revenueTrend: [],
    };

    const eventBreakdown = breakdownQuery.data ?? [];
    const viewTrend = (trendQuery.data ?? []).map((point) => ({
        date: point.day,
        count: point.total,
    }));
    const topItems = (topItemsQuery.data ?? []).map((item) => ({
        name: item.name,
        count: item.total,
    }));

    return (
        <ContentSection
            title="Advanced Analytics"
            desc="System-wide telemetry mapping encompassing complete behavioral tracking and fiscal aggregates."
            withRefresh
            RefreshFunction={refreshAll}
        >
            <div className="mt-4 flex flex-col gap-8">
                <div className="bg-muted/30 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end sm:justify-between">
                    <Field className="w-full sm:w-auto" data-invalid={Boolean(dateRangeError)}>
                        <FieldLabel htmlFor="analytics-date-range">Reporting period</FieldLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="analytics-date-range"
                                    className="w-full justify-start px-2.5 font-normal sm:w-72"
                                    aria-invalid={Boolean(dateRangeError)}
                                >
                                    <CalendarIcon data-icon="inline-start" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} – {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={handleDateRangeChange}
                                    numberOfMonths={2}
                                    disabled={{ after: maxSelectableDate }}
                                />
                            </PopoverContent>
                        </Popover>
                        {dateRangeError ? <FieldError>{dateRangeError}</FieldError> : null}
                    </Field>
                    <p className="text-muted-foreground text-xs">Maximum reporting window: {MAX_RANGE_DAYS} days</p>
                </div>

                {isError && firstError ? (
                    <QueryError title="Couldn't load analytics" error={firstError} onRetry={refreshAll} isRetrying={isFetching} />
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
                                    <CardTitle className="text-sm font-medium">Total Lifetime Revenue</CardTitle>
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
                                    <CardTitle className="text-sm font-medium">Global Network Orders</CardTitle>
                                    <CreditCard className="text-muted-foreground h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        <NumberTicker prefix="+" end={overview.kpis.totalOrders} format={formatNumber} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
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
                                    <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
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
                                    <CardDescription>Daily revenue across the trailing fiscal window.</CardDescription>
                                </CardHeader>
                                <CardContent className="relative h-75 w-full">
                                    {overview.revenueTrend.length > 0 ? (
                                        <ChartContainer config={revenueConfig} className="absolute inset-0 aspect-auto! h-full w-full pr-6 pb-6">
                                            <AreaChart data={overview.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                    ) : (
                                        <EmptyState
                                            icon={DollarSign}
                                            title="No revenue data"
                                            description="No revenue was recorded for this reporting period."
                                            className="h-75"
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Event Breakdown</CardTitle>
                                    <CardDescription>All tracked actions in the selected date range.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {eventBreakdown.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie
                                                        data={eventBreakdown}
                                                        dataKey="total"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={62}
                                                        outerRadius={88}
                                                        paddingAngle={4}
                                                    >
                                                        {eventBreakdown.map((item, index) => {
                                                            const resolvedEventTypeId = resolveEventTypeId(item);
                                                            return (
                                                                <Cell
                                                                    key={item.code}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                    opacity={
                                                                        logEventTypeId == null || logEventTypeId === resolvedEventTypeId ? 1 : 0.3
                                                                    }
                                                                    className="cursor-pointer transition-opacity"
                                                                    onClick={() => handleBreakdownSelection(resolvedEventTypeId)}
                                                                />
                                                            );
                                                        })}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(val) => [Number(val ?? 0).toLocaleString(), "Events"]}
                                                        contentStyle={{
                                                            borderRadius: "8px",
                                                            border: "none",
                                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            <ScrollArea className="h-36 rounded-md border">
                                                <div className="grid gap-1 p-2 sm:grid-cols-2">
                                                    {eventBreakdown.map((item, index) => {
                                                        const resolvedEventTypeId = resolveEventTypeId(item);
                                                        return (
                                                            <Button
                                                                key={item.code}
                                                                type="button"
                                                                variant={logEventTypeId === resolvedEventTypeId ? "secondary" : "ghost"}
                                                                className="h-auto min-w-0 justify-between gap-2 px-2 py-1.5"
                                                                onClick={() => handleBreakdownSelection(resolvedEventTypeId)}
                                                            >
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span
                                                                        className="size-2.5 shrink-0 rounded-full"
                                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                                        aria-hidden="true"
                                                                    />
                                                                    <span className="truncate text-xs" title={item.name}>
                                                                        {item.name}
                                                                    </span>
                                                                </div>
                                                                <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                                                                    {item.total.toLocaleString()}
                                                                </Badge>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Activity}
                                            title="No event activity"
                                            description="No tracked events were recorded for this reporting period."
                                            className="h-75"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-3">
                                <CardHeader className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <CardTitle>Event Trend</CardTitle>
                                        <CardDescription>Daily volume for {selectedEventType.label.toLowerCase()}.</CardDescription>
                                    </div>
                                    <Field>
                                        <FieldLabel>Trend event type</FieldLabel>
                                        <EventTypeSelect value={eventTypeId} onValueChange={(value) => value != null && setEventTypeId(value)} />
                                    </Field>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    {viewTrend.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={viewTrend}>
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
                                                    formatter={(val) => [Number(val ?? 0).toLocaleString(), selectedEventType.label]}
                                                    contentStyle={{
                                                        borderRadius: "8px",
                                                        border: "none",
                                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                    }}
                                                />
                                                <Line
                                                    type="step"
                                                    dataKey="count"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState
                                            icon={Activity}
                                            title="No trend data"
                                            description={`No ${selectedEventType.label.toLowerCase()} events were recorded in this period.`}
                                            className="h-75"
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="col-span-4">
                                <CardHeader className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <CardTitle>Top Catalog Items</CardTitle>
                                        <CardDescription>Items contributing most to {selectedCatalogEventType.label.toLowerCase()}.</CardDescription>
                                    </div>
                                    <Field>
                                        <FieldLabel>Catalog activity</FieldLabel>
                                        <EventTypeSelect
                                            value={catalogEventTypeId}
                                            onValueChange={(value) => value != null && setCatalogEventTypeId(value)}
                                            eventTypes={CATALOG_EVENT_TYPES}
                                        />
                                    </Field>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    {topItems.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
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
                                                    formatter={(val) => [Number(val ?? 0).toLocaleString(), selectedCatalogEventType.label]}
                                                    cursor={{ fill: "transparent" }}
                                                    contentStyle={{
                                                        borderRadius: "8px",
                                                        border: "none",
                                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                    }}
                                                />
                                                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState
                                            icon={Activity}
                                            title="No catalog activity"
                                            description={`No catalog items contributed to ${selectedCatalogEventType.label.toLowerCase()} in this period.`}
                                            className="h-75"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                <div ref={eventLogsRef} tabIndex={-1} className="scroll-mt-6 outline-none">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Event Logs</CardTitle>
                                <CardDescription>
                                    {selectedLogEventType?.label ?? "All event types"} from {reportRange.start} to {reportRange.end}.
                                </CardDescription>
                            </div>
                            <Field className="w-full sm:w-auto">
                                <FieldLabel>Log event type</FieldLabel>
                                <EventTypeSelect value={logEventTypeId} onValueChange={handleLogEventTypeChange} includeAll />
                            </Field>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {eventsQuery.isError ? (
                                <QueryError
                                    title="Couldn't load event logs"
                                    error={eventsQuery.error}
                                    onRetry={() => void eventsQuery.refetch()}
                                    isRetrying={eventsQuery.isFetching}
                                />
                            ) : null}
                            <EventLogsTable
                                rows={eventsQuery.data?.items ?? []}
                                rowCount={eventsQuery.data?.pagination.total ?? 0}
                                isPending={eventsQuery.isPending}
                                isFetching={eventsQuery.isFetching}
                                pagination={eventPagination}
                                onPaginationChange={setEventPagination}
                            />
                        </CardContent>
                    </Card>
                </div>

                <EventTypeTrackingSettings />
            </div>
        </ContentSection>
    );
}
