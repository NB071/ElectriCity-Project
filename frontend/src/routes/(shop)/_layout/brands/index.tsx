import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Loader2, MapPin } from "lucide-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { SimplePagination } from "@/components/data-table/simple-pagination";
import { QueryError } from "@/components/common/QueryError";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mediaUrl } from "@/lib/media";
import { useGetBrands, type Brand } from "@/hooks/api/catalog/use-brands";

export const Route = createFileRoute("/(shop)/_layout/brands/")({
    component: RouteComponent,
});

const PAGE_SIZE = 12;

function RouteComponent() {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });
    const { data, isLoading, isError, error, refetch, isFetching } = useGetBrands(pagination.pageIndex + 1, pagination.pageSize);

    const brands = data?.items ?? [];
    const total = data?.pagination.total ?? 0;

    const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
    const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total);

    return (
        <div className="bg-background mt-12 min-h-screen py-10 md:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-foreground mb-8 text-3xl font-bold tracking-tight md:text-4xl">Brands</h1>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : isError ? (
                    <QueryError
                        title="Couldn't load brands"
                        message="We couldn't load brands right now."
                        error={error}
                        onRetry={() => void refetch()}
                        isRetrying={isFetching}
                    />
                ) : (
                    <BrandsList brands={brands} total={total} from={from} to={to} pagination={pagination} onPaginationChange={setPagination} />
                )}
            </div>
        </div>
    );
}

type BrandsListProps = {
    brands: Brand[];
    total: number;
    from: number;
    to: number;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
};

function BrandsList({ brands, total, from, to, pagination, onPaginationChange }: BrandsListProps) {
    "use no memo";

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table opted out via "use no memo"
    const table = useReactTable({
        data: brands,
        columns: [],
        pageCount: Math.max(1, Math.ceil(total / pagination.pageSize)),
        state: { pagination },
        onPaginationChange,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="text-muted-foreground mb-6 text-sm">
                <p>
                    Showing {from} to {to} of {total} brands
                </p>
            </div>

            {brands.length === 0 ? (
                <p className="text-muted-foreground py-16 text-center text-sm">No brands to show yet.</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {brands.map((brand) => (
                        <BrandCard key={brand.id} brand={brand} />
                    ))}
                </div>
            )}

            {total > PAGE_SIZE ? (
                <div className="mt-12 flex flex-col items-center justify-center gap-4">
                    <SimplePagination table={table} totalRows={total} />
                </div>
            ) : null}
        </>
    );
}

function BrandCard({ brand }: { brand: Brand }) {
    const [failed, setFailed] = useState(false);
    const logoSrc = mediaUrl(brand.logo?.url);
    const showImage = Boolean(logoSrc) && !failed;

    return (
        <div className="group border-muted flex flex-col items-center justify-between rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:border-black hover:shadow-md">
            <div className="flex w-full flex-col items-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center">
                    {showImage ? (
                        <img
                            src={logoSrc!}
                            alt={`${brand.name} logo`}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            onError={() => setFailed(true)}
                        />
                    ) : (
                        <span className="bg-muted text-muted-foreground flex size-20 items-center justify-center rounded-full text-lg font-semibold">
                            {brand.name.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
                    <h3 className="text-foreground text-center text-base font-semibold">{brand.name}</h3>
                    {brand.is_featured ? (
                        <Badge variant="secondary" className="text-[10px]">
                            Featured
                        </Badge>
                    ) : null}
                </div>
                <p className="text-muted-foreground mb-8 flex items-center gap-1.5 text-center text-xs leading-relaxed">
                    {brand.country ? (
                        <>
                            <MapPin className="size-3.5 shrink-0" aria-hidden />
                            {brand.country}
                        </>
                    ) : (
                        "-"
                    )}
                </p>
            </div>
            <Link to="/brands/$bid" params={{ bid: String(brand.id) }} className="w-full">
                <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white"
                >
                    See More
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}
