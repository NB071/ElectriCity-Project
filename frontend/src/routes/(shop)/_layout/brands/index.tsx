import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SimplePagination } from "@/components/data-table/simple-pagination";
import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(shop)/_layout/brands/")({
    component: RouteComponent,
});

const DEALERS = [
    { name: "Audi London", logo: "/temp/audi.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "BMW New York", logo: "/temp/bmw.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Ford Istanbul", logo: "/temp/ford.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Mercedes Paris", logo: "/temp/mercedes.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Peugeot London", logo: "/temp/peugeot.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Volkswagen New York", logo: "/temp/volkswagen.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Nissan Istanbul", logo: "/temp/nissan.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Jeep Paris", logo: "/temp/jeep.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Kia London", logo: "/temp/kia.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Volvo New York", logo: "/temp/volvo.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Honda Istanbul", logo: "/temp/honda.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
    { name: "Hyundai Paris", logo: "/temp/hyundai.jpg", address: "Nottingham Road, Alfreton,\nDerbyshire, DE55 4GR" },
];

function RouteComponent() {
    const table = useReactTable({
        data: DEALERS,
        columns: [],
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 12,
            },
        },
    });

    return (
        <div className="bg-background mt-12 min-h-screen py-10 md:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-foreground mb-8 text-3xl font-bold tracking-tight md:text-4xl">Dealer List</h1>

                <div className="text-muted-foreground mb-6 flex flex-col justify-between gap-4 text-sm sm:flex-row sm:items-center">
                    <p>
                        Showing{" "}
                        {Math.min(
                            table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
                            table.getFilteredRowModel().rows.length
                        )}{" "}
                        to{" "}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{" "}
                        of {table.getFilteredRowModel().rows.length} vehicles
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {DEALERS.map((dealer, i) => (
                        <div
                            key={i}
                            className="group border-muted flex flex-col items-center justify-between rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:border-black hover:shadow-md"
                        >
                            <div className="flex w-full flex-col items-center">
                                <div className="mb-6 flex h-24 w-24 items-center justify-center">
                                    <img
                                        src={dealer.logo}
                                        alt={dealer.name}
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/logo192.png"; // Fallback
                                        }}
                                    />
                                </div>
                                <h3 className="text-foreground mb-2 text-center text-base font-semibold">{dealer.name}</h3>
                                <p className="text-muted-foreground mb-8 text-center text-xs leading-relaxed whitespace-pre-line">{dealer.address}</p>
                            </div>
                            <Link to="/brands/$bid" params={{ bid: String(i + 1) }} className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full border-blue-600 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white"
                                >
                                    See More
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center justify-center gap-4">
                    <SimplePagination table={table} />
                </div>
            </div>
        </div>
    );
}
