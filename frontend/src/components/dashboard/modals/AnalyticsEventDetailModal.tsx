import { Activity, Clock, Database, Globe, Package, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useGetAdminEventDetail } from "@/hooks/api/analytics/use-admin-analytics";
import { useUiStore } from "@/stores/ui-store";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/common/QueryError";

function DetailField({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="text-muted-foreground mt-0.5 size-4" />
            <div className="flex min-w-0 flex-col gap-1">
                <span className="text-muted-foreground text-xs font-semibold uppercase">{label}</span>
                <span className="truncate text-sm font-medium">{value}</span>
            </div>
        </div>
    );
}

export function AnalyticsEventDetailModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.analyticsEventDetail;
    const eventId = isOpen ? (data?.eventId ?? 0) : 0;
    const eventQuery = useGetAdminEventDetail(eventId);

    function handleOpenChange(open: boolean) {
        if (!open) closeModal("analyticsEventDetail");
    }

    const event = eventQuery.data;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-162.5">
                <DialogHeader className="border-b px-6 pt-6 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="size-5" />
                        Analytics Event Details
                    </DialogTitle>
                    <DialogDescription>
                        Event ID: <span className="font-mono text-xs">{eventId || "-"}</span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="min-h-0 flex-1 px-6">
                    <div className="flex flex-col gap-6 pb-8">
                        {eventQuery.isPending ? (
                            <div className="flex flex-col gap-4">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-36 w-full" />
                            </div>
                        ) : eventQuery.isError ? (
                            <QueryError
                                title="Couldn't load event details"
                                error={eventQuery.error}
                                onRetry={() => void eventQuery.refetch()}
                                isRetrying={eventQuery.isFetching}
                            />
                        ) : event ? (
                            <>
                                <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                                        <Activity className="size-5" />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <span className="text-muted-foreground text-xs font-medium uppercase">Event type</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="truncate font-semibold">{event.event_type_name}</span>
                                            <Badge variant="secondary" className="font-mono text-[10px]">
                                                {event.event_code}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <DetailField icon={User} label="User ID" value={event.user_id ?? "Anonymous"} />
                                    <DetailField icon={Globe} label="IP Address" value={event.ip ?? "Not recorded"} />
                                    <DetailField icon={Clock} label="Generated At" value={new Date(event.generated_at).toLocaleString()} />
                                    <DetailField
                                        icon={Package}
                                        label="Catalog Item"
                                        value={
                                            event.cid ? (
                                                <Link
                                                    to="/catalog/$cid"
                                                    params={{ cid: String(event.cid.cid) }}
                                                    className="text-primary underline-offset-4 hover:underline"
                                                    onClick={() => closeModal("analyticsEventDetail")}
                                                >
                                                    {`#${event.cid.cid} · ${event.cid.brand ?? ""} ${event.cid.model ?? ""}`.trim()}
                                                </Link>
                                            ) : (
                                                "None"
                                            )
                                        }
                                    />
                                </div>

                                {event.cid ? (
                                    <>
                                        <Separator />
                                        <section className="flex flex-col gap-3">
                                            <h3 className="text-sm font-semibold">Catalog Context</h3>
                                            <div className="bg-muted/30 grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
                                                <span>
                                                    <span className="text-muted-foreground">Type:</span> {event.cid.item_type}
                                                </span>
                                                <span>
                                                    <span className="text-muted-foreground">Base price:</span> $
                                                    {Number(event.cid.base_price).toFixed(2)}
                                                </span>
                                                <span>
                                                    <span className="text-muted-foreground">Quantity:</span> {event.cid.quantity}
                                                </span>
                                                <span>
                                                    <span className="text-muted-foreground">Status:</span>{" "}
                                                    {event.cid.is_active ? "Active" : "Inactive"}
                                                </span>
                                                {event.cid.vehicle ? (
                                                    <>
                                                        <span>
                                                            <span className="text-muted-foreground">Year:</span> {event.cid.vehicle.year ?? "-"}
                                                        </span>
                                                        <span>
                                                            <span className="text-muted-foreground">Condition:</span>{" "}
                                                            {event.cid.vehicle.condition ?? "-"}
                                                        </span>
                                                        <span>
                                                            <span className="text-muted-foreground">Mileage:</span>{" "}
                                                            {event.cid.vehicle.mileage?.toLocaleString() ?? "-"}
                                                        </span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </section>
                                    </>
                                ) : null}

                                <Separator />

                                <section className="flex flex-col gap-3">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                                        <Database className="size-4" />
                                        Metadata
                                    </h3>
                                    <pre className="bg-muted/40 max-h-64 overflow-auto rounded-md border p-4 text-xs whitespace-pre-wrap">
                                        {JSON.stringify(event.meta, null, 2)}
                                    </pre>
                                </section>
                            </>
                        ) : null}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
