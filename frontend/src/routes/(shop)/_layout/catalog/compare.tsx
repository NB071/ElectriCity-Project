import { createFileRoute, Link } from "@tanstack/react-router";
import {
    Car,
    Gauge,
    Fuel,
    Calendar,
    Settings,
    Activity,
    ShieldCheck,
    Wrench,
    DoorOpen,
    Settings2,
    Palette,
    Trash2,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useCompareStore } from "@/stores/compare-store";
import { MOCK_VEHICLES } from "@/components/shop/catalog/mockVehicles";
import { formatMileage } from "@/components/shop/VehicleCard";

export const Route = createFileRoute("/(shop)/_layout/catalog/compare")({
    component: RouteComponent,
});

const FIELD_ICONS: Record<string, any> = {
    Body: Car,
    Mileage: Gauge,
    "Fuel Type": Fuel,
    Year: Calendar,
    Transmission: Settings,
    "Drive Type": Activity,
    Condition: ShieldCheck,
    "Engine Size": Wrench,
    Doors: DoorOpen,
    Cylinders: Settings2,
    Color: Palette,
};

function RouteComponent() {
    const cids = useCompareStore((s) => s.cids);
    const removeVehicle = useCompareStore((s) => s.remove);

    const { data: vehicles = [], isLoading } = useQuery({
        queryKey: ["compare-vehicles", cids],
        queryFn: async () => {
            if (cids.length === 0) return [];
            await new Promise((r) => setTimeout(r, 400));

            return cids
                .map((cid) => {
                    const mockMatch = MOCK_VEHICLES.find((v) => String(v.id) === cid);
                    if (mockMatch) {
                        return {
                            id: mockMatch.id,
                            name: `${mockMatch.vehicle.year} ${mockMatch.brand.name} ${mockMatch.model.name}`,
                            vehicle: mockMatch.vehicle,
                            images: mockMatch.primary_image_url ? [{ url: mockMatch.primary_image_url }] : [],
                        };
                    }
                    return null;
                })
                .filter((v): v is NonNullable<typeof v> => v !== null);
        },
    });

    const columns = vehicles.map((v) => ({
        id: v.id,
        label: v.name,
        image: v.images?.[0]?.url || "",
    }));

    const rows = [
        {
            field: "Body",
            cells: vehicles.map((v) => ({ value: v.vehicle.body_shape || "N/A" })),
        },
        {
            field: "Mileage",
            cells: vehicles.map((v) => ({ value: formatMileage(v.vehicle.mileage ?? 0) })),
        },
        {
            field: "Fuel Type",
            cells: vehicles.map(() => ({ value: "Electric" })), // Assuming EVs
        },
        {
            field: "Year",
            cells: vehicles.map((v) => ({ value: String(v.vehicle.year) })),
        },
        {
            field: "Transmission",
            cells: vehicles.map(() => ({ value: "Automatic" })),
        },
        {
            field: "Drive Type",
            cells: vehicles.map((v) => ({ value: v.vehicle.drivetrain || "N/A" })),
        },
        {
            field: "Condition",
            cells: vehicles.map((v) => ({ value: v.vehicle.condition.toUpperCase() })),
        },
        {
            field: "Engine Size",
            cells: vehicles.map(() => ({ value: "Dual Motor" })),
        },
        {
            field: "Doors",
            cells: vehicles.map((v) => ({ value: `${v.vehicle.door_count || "N/A"}-door` })),
        },
        {
            field: "Cylinders",
            cells: vehicles.map(() => ({ value: "N/A (EV)" })),
        },
        {
            field: "Color",
            cells: vehicles.map((v) => ({ value: v.vehicle.exterior_color || "N/A" })),
        },
    ];

    return (
        <div className="min-h-screen bg-white pt-20 pb-16 lg:pt-24 lg:pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb Context */}
                <div className="animate-in fade-in slide-in-from-bottom-4 mb-4 flex items-center text-sm font-medium text-slate-500 duration-500">
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

                <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mb-12 delay-100 duration-500">
                    <h1 className="text-left text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">Compare Vehicle</h1>
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
                    </div>
                ) : cids.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-500">
                        <Car className="h-12 w-12 text-slate-300" />
                        <h2 className="text-xl font-medium">No vehicles to compare</h2>
                        <Link to="/catalog">
                            <Button variant="outline" className="mt-4">
                                Browse Catalog
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="hide-scrollbar w-full overflow-x-auto pb-8">
                        <div className="min-w-200">
                            <div
                                className="mb-8 grid items-end gap-6"
                                style={{ gridTemplateColumns: `200px repeat(${columns.length}, minmax(0, 1fr))` }}
                            >
                                <div />

                                {columns.map((col, idx) => (
                                    <div
                                        key={col.id}
                                        className={`animate-in fade-in slide-in-from-bottom-8 fill-mode-both relative flex flex-col items-center justify-center rounded-2xl bg-slate-100 p-8 shadow-sm transition-all duration-300 hover:shadow-md delay-[${(idx + 2) * 100}ms]`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeVehicle(String(col.id))}
                                            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white text-slate-400 shadow-sm transition-all hover:border-red-200 hover:text-red-500"
                                            aria-label="Remove vehicle"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <img src={col.image} alt={col.label} className="mb-4 h-28 w-28 object-contain mix-blend-multiply" />

                                        <h3 className="text-center font-bold text-slate-900">{col.label}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both flex flex-col delay-500 duration-700">
                                {rows.map((row, rowIdx) => {
                                    const Icon = FIELD_ICONS[row.field] || ChevronRight;

                                    return (
                                        <div
                                            key={row.field}
                                            className={`grid items-center gap-6 py-4 ${rowIdx !== rows.length - 1 ? "border-b border-slate-100" : ""}`}
                                            style={{ gridTemplateColumns: `200px repeat(${columns.length}, minmax(0, 1fr))` }}
                                        >
                                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                                                {row.field}
                                            </div>

                                            {row.cells.map((cell, cellIdx) => (
                                                <div key={`${row.field}-${cellIdx}`} className="px-4 text-sm font-medium text-slate-900">
                                                    {cell.value || "-"}
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
