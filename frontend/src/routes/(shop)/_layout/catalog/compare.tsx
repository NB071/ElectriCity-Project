import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Gauge, Calendar, DollarSign, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryError } from "@/components/common/QueryError";
import { useCompareStore } from "@/stores/compare-store";
import { useCompareCatalogItems, type CompareCell } from "@/hooks/api/catalog/use-compare";
import { formatMileage, formatPrice } from "@/components/shop/VehicleCard";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(shop)/_layout/catalog/compare")({
    component: RouteComponent,
});

const FIELD_META: Record<string, { label: string; icon: typeof Car }> = {
    price: { label: "Price", icon: DollarSign },
    year: { label: "Year", icon: Calendar },
    mileage: { label: "Mileage", icon: Gauge },
    condition: { label: "Condition", icon: ShieldCheck },
};

function formatCellValue(field: string, value: unknown): string {
    if (value == null || value === "") return "-";

    if (field === "price" && typeof value === "number") {
        return formatPrice(value);
    }
    if (field === "mileage" && typeof value === "number") {
        return formatMileage(value);
    }
    if (field === "year") {
        return String(value);
    }
    if (field === "condition" && typeof value === "string") {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return String(value);
}

function cellClassName(cell: CompareCell): string {
    if (cell.isBest) return "bg-emerald-50 text-emerald-800 font-semibold";
    if (cell.isTied) return "bg-amber-50 text-amber-900 font-medium";
    if (cell.isWorse) return "text-slate-500";
    return "text-slate-900";
}

function RouteComponent() {
    const items = useCompareStore((s) => s.items);
    const removeVehicle = useCompareStore((s) => s.remove);

    const numericCids = items.map((item) => Number(item.cid)).filter((id) => Number.isFinite(id) && id > 0);
    const imageByCid = new Map(items.map((item) => [item.cid, item.primary_image_url]));

    const { data, isLoading, isError, error, refetch, isFetching } = useCompareCatalogItems(numericCids);

    const columns = data?.columns ?? [];
    const rows = data?.rows ?? [];
    const canCompare = numericCids.length >= 2;

    return (
        <div className="min-h-screen bg-white pt-20 pb-16 lg:pt-24 lg:pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-4 flex items-center text-sm font-medium text-slate-500">
                    <Link to="/" className="text-primary hover:underline">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <Link to="/catalog" className="transition-colors hover:text-slate-900">
                        Cars for Sale
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-slate-900">Compare</span>
                </div>

                <div className="mb-12">
                    <h1 className="text-left text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">Compare Vehicle</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Side-by-side specs for {numericCids.length} selected vehicle{numericCids.length === 1 ? "" : "s"}.
                    </p>
                </div>

                {!canCompare ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-500">
                        <Car className="h-12 w-12 text-slate-300" />
                        <h2 className="text-xl font-medium">
                            {numericCids.length === 0 ? "No vehicles to compare" : "Add at least one more vehicle"}
                        </h2>
                        <p className="max-w-sm text-center text-sm text-slate-400">
                            {numericCids.length === 0
                                ? "Select vehicles from the catalog using Compare, then open this page."
                                : "Comparison needs at least two vehicles. Keep browsing and add another to your list."}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                            {numericCids.length === 1 ? (
                                <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800">
                                    Selected: #{numericCids[0]}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 h-7 text-slate-500"
                                        onClick={() => removeVehicle(String(numericCids[0]))}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : null}
                            <Link to="/catalog">
                                <Button variant="outline">Browse Catalog</Button>
                            </Link>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
                    </div>
                ) : isError ? (
                    <QueryError title="Could not load comparison" error={error} onRetry={() => void refetch()} isRetrying={isFetching} />
                ) : (
                    <div className="hide-scrollbar w-full overflow-x-auto pb-8">
                        <div className="min-w-200">
                            <div
                                className="mb-10 grid items-stretch gap-6"
                                style={{ gridTemplateColumns: `200px repeat(${columns.length}, minmax(0, 1fr))` }}
                            >
                                <div className="flex items-end pb-2 text-sm font-semibold text-slate-400">Vehicle</div>

                                {columns.map((col) => {
                                    const imageSrc = mediaUrl(imageByCid.get(String(col.id)));

                                    return (
                                        <div
                                            key={col.id}
                                            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm transition-shadow duration-300 hover:shadow-md"
                                        >
                                            <div className="relative h-40 w-full overflow-hidden bg-slate-200 sm:h-44">
                                                {imageSrc ? (
                                                    <img
                                                        src={imageSrc}
                                                        alt={col.label}
                                                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                        <Car className="size-10" />
                                                    </div>
                                                )}

                                                <div className="to-transparent-md pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/55 via-black/20 mask-[linear-gradient(to_top,black,transparent)]" />

                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    onClick={() => removeVehicle(String(col.id))}
                                                    className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/95 text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-red-500"
                                                    aria-label={`Remove ${col.label} from compare`}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>

                                            <div className="border-t border-slate-200 bg-white px-3 py-2.5">
                                                <Link
                                                    to="/catalog/$cid"
                                                    params={{ cid: String(col.id) }}
                                                    className="line-clamp-2 text-center text-sm font-bold text-slate-900 hover:underline"
                                                >
                                                    {col.label}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col">
                                {rows.map((row, rowIdx) => {
                                    const meta = FIELD_META[row.field];
                                    const Icon = meta?.icon ?? Car;
                                    const label = meta?.label ?? row.field;

                                    return (
                                        <div
                                            key={row.field}
                                            className={cn("grid items-stretch gap-6 py-3", rowIdx !== rows.length - 1 && "border-b border-slate-100")}
                                            style={{ gridTemplateColumns: `200px repeat(${columns.length}, minmax(0, 1fr))` }}
                                        >
                                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                                                {label}
                                            </div>

                                            {row.cells.map((cell, cellIdx) => (
                                                <div
                                                    key={`${row.field}-${columns[cellIdx]?.id ?? cellIdx}`}
                                                    className={cn("flex items-center rounded-lg px-4 py-3 text-sm font-medium", cellClassName(cell))}
                                                >
                                                    {formatCellValue(row.field, cell.value)}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
