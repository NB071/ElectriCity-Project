import { useApiMutation, useApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { toast } from "sonner";

// Endpoints:
// [GET] /api/dashboard/admin/analytics/overview
// [GET] /api/dashboard/admin/analytics/reports/breakdown
// [GET] /api/dashboard/admin/analytics/reports/trend/:eventTypeId
// [GET] /api/dashboard/admin/analytics/reports/top-items/:eventTypeId
// [GET] /api/dashboard/admin/analytics/events
// [GET] /api/dashboard/admin/analytics/events/:eventId
// [GET] /api/dashboard/admin/analytics/event-types
// [PATCH] /api/dashboard/admin/analytics/event-types/:eventTypeId/active

export type AnalyticsReportParams = {
    start?: string;
    end?: string;
    limit?: number;
};

export type AdminOverviewKpis = {
    totalRevenue: number;
    totalOrders: number;
    newUsers: number;
    averageOrderValue: number;
};

export type AdminOrderStatusCount = {
    status: string;
    count: number;
};

export type AdminRecentOrder = {
    orderId: string;
    customerName: string | null;
    total: number;
    status: string;
    createdAt: string;
};

export type AdminRevenueTrendPoint = {
    date: string;
    revenue: number;
};

export type AdminAnalyticsOverview = {
    kpis: AdminOverviewKpis;
    ordersByStatus: AdminOrderStatusCount[];
    recentActivity: AdminRecentOrder[];
    revenueTrend: AdminRevenueTrendPoint[];
};

export type EventTypeBreakdownItem = {
    event_type_id?: number;
    code: string;
    name: string;
    total: number;
};

export type EventTrendPoint = {
    day: string;
    total: number;
};

export type TopCatalogItem = {
    cid: number | null;
    name: string;
    item_type: string;
    total: number;
};

export type EventDetailCatalogItem = {
    cid: number;
    item_type: string;
    base_price: number;
    quantity: number;
    is_active: boolean;
    brand: string | null;
    model: string | null;
    model_type: string | null;
    vehicle?: {
        year: number | null;
        condition: string | null;
        mileage: number | null;
    };
};

export type AdminEventListItem = {
    event_id: number;
    event_code: string;
    event_type_name: string;
    user_id: number | null;
    cid: number | null;
    catalog_name: string | null;
    ip: string | null;
    generated_at: string;
};

export type AdminEventListParams = {
    page?: number;
    limit?: number;
    start?: string;
    end?: string;
    event_type_id?: number;
    user_id?: number;
    cid?: number;
    q?: string;
};

export type AdminEventListResponse = {
    items: AdminEventListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};

export type AdminEventDetail = {
    event_id: number;
    event_code: string;
    event_type_name: string;
    user_id: number | null;
    cid: EventDetailCatalogItem | null;
    meta: Record<string, unknown>;
    ip: string | null;
    generated_at: string;
};

export type AdminEventType = {
    event_type_id: number;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
};

export type SetEventTypeActivePayload = {
    is_active: boolean;
};

export type SetEventTypeActiveResponse = {
    event_type_id: number;
    is_active: boolean;
};

const adminAnalyticsKeys = {
    all: ["admin", "analytics"] as const,
    overview: () => [...adminAnalyticsKeys.all, "overview"] as const,
    breakdown: (params: AnalyticsReportParams) => [...adminAnalyticsKeys.all, "breakdown", params] as const,
    trend: (eventTypeId: number, params: AnalyticsReportParams) => [...adminAnalyticsKeys.all, "trend", eventTypeId, params] as const,
    topItems: (eventTypeId: number, params: AnalyticsReportParams) => [...adminAnalyticsKeys.all, "top-items", eventTypeId, params] as const,
    events: (params: AdminEventListParams) => [...adminAnalyticsKeys.all, "events", params] as const,
    event: (eventId: number) => [...adminAnalyticsKeys.all, "event", eventId] as const,
    eventTypes: () => [...adminAnalyticsKeys.all, "event-types"] as const,
};

function reportParams(params: AnalyticsReportParams = {}) {
    return {
        ...(params.start ? { start: params.start } : {}),
        ...(params.end ? { end: params.end } : {}),
        ...(params.limit != null ? { limit: params.limit } : {}),
    };
}

// Admin dashboard home overview KPIs, status mix, recent orders, revenue trend
export const useGetAdminAnalytics = () => {
    return useApiQuery<AdminAnalyticsOverview>({
        queryKey: adminAnalyticsKeys.overview(),
        url: "/api/dashboard/admin/analytics/overview",
        method: "get",
        staleTime: 1000 * 60,
    });
};

// Event-type totals over an optional date window
export const useGetAdminEventTypeBreakdown = (params: AnalyticsReportParams = {}) => {
    return useApiQuery<EventTypeBreakdownItem[]>({
        queryKey: adminAnalyticsKeys.breakdown(params),
        url: "/api/dashboard/admin/analytics/reports/breakdown",
        method: "get",
        params: reportParams(params),
        staleTime: 1000 * 60,
    });
};

// Daily time series for one event type
export const useGetAdminEventTrend = (eventTypeId: number, params: AnalyticsReportParams = {}) => {
    return useApiQuery<EventTrendPoint[]>({
        queryKey: adminAnalyticsKeys.trend(eventTypeId, params),
        url: `/api/dashboard/admin/analytics/reports/trend/${eventTypeId}`,
        method: "get",
        params: reportParams(params),
        enabled: Number.isFinite(eventTypeId) && eventTypeId > 0,
        staleTime: 1000 * 60,
    });
};

// Top catalog items contributing to one event type
export const useGetAdminTopCatalogItems = (eventTypeId: number, params: AnalyticsReportParams = {}) => {
    return useApiQuery<TopCatalogItem[]>({
        queryKey: adminAnalyticsKeys.topItems(eventTypeId, params),
        url: `/api/dashboard/admin/analytics/reports/top-items/${eventTypeId}`,
        method: "get",
        params: reportParams(params),
        enabled: Number.isFinite(eventTypeId) && eventTypeId > 0,
        staleTime: 1000 * 60,
    });
};

// Paginated analytics event log list
export const useGetAdminEvents = (params: AdminEventListParams = {}) => {
    return useApiQuery<AdminEventListResponse>({
        queryKey: adminAnalyticsKeys.events(params),
        url: "/api/dashboard/admin/analytics/events",
        method: "get",
        params: {
            ...(params.page != null ? { page: params.page } : {}),
            ...(params.limit != null ? { limit: params.limit } : {}),
            ...(params.start ? { start: params.start } : {}),
            ...(params.end ? { end: params.end } : {}),
            ...(params.event_type_id != null ? { event_type_id: params.event_type_id } : {}),
            ...(params.user_id != null ? { user_id: params.user_id } : {}),
            ...(params.cid != null ? { cid: params.cid } : {}),
            ...(params.q ? { q: params.q } : {}),
        },
        staleTime: 1000 * 60,
    });
};

// Single analytics event log detail
export const useGetAdminEventDetail = (eventId: number) => {
    return useApiQuery<AdminEventDetail>({
        queryKey: adminAnalyticsKeys.event(eventId),
        url: `/api/dashboard/admin/analytics/events/${eventId}`,
        method: "get",
        enabled: Number.isFinite(eventId) && eventId > 0,
    });
};

// All event types with tracking status
export const useGetAdminEventTypes = () => {
    return useApiQuery<AdminEventType[]>({
        queryKey: adminAnalyticsKeys.eventTypes(),
        url: "/api/dashboard/admin/analytics/event-types",
        method: "get",
        staleTime: 1000 * 60,
    });
};

// Toggle whether an event type is actively tracked
export const useSetAdminEventTypeActive = () => {
    return useApiMutation<SetEventTypeActiveResponse, SetEventTypeActivePayload>({
        url: "/api/dashboard/admin/analytics/event-types",
        method: "patch",
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminAnalyticsKeys.eventTypes() });
            toast.success("Event type updated");
        },
        onError: (error) => {
            toast.error(error.message || "Could not update event type");
        },
    });
};

export const setAdminEventTypeActiveVariables = (eventTypeId: number | string, isActive: boolean) => ({
    url: `/api/dashboard/admin/analytics/event-types/${eventTypeId}/active`,
    body: { is_active: isActive } satisfies SetEventTypeActivePayload,
});

export { adminAnalyticsKeys };
