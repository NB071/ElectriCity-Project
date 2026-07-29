import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Globe, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueryError } from "@/components/common/QueryError";
import { mediaUrl } from "@/lib/media";
import { useGetBrandById } from "@/hooks/api/catalog/use-brands";

export const Route = createFileRoute("/(shop)/_layout/brands/$bid")({
    component: RouteComponent,
});

function RouteComponent() {
    const { bid } = Route.useParams();
    const brandId = Number(bid);
    const { data: brand, isLoading, isError, error, refetch, isFetching } = useGetBrandById(brandId);

    return (
        <div className="bg-background mt-12 min-h-screen py-10 md:py-16">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-foreground mb-10 text-3xl font-bold tracking-tight md:text-4xl">Brand Details</h1>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : isError || !brand ? (
                    <QueryError
                        title="Couldn't load brand"
                        message={!Number.isFinite(brandId) || brandId <= 0 ? "Invalid brand id." : "We couldn't load this brand right now."}
                        error={error}
                        onRetry={() => void refetch()}
                        isRetrying={isFetching}
                    />
                ) : (
                    <BrandDetailView brand={brand} />
                )}
            </div>
        </div>
    );
}

function BrandDetailView({
    brand,
}: {
    brand: NonNullable<ReturnType<typeof useGetBrandById>["data"]>;
}) {
    const [failed, setFailed] = useState(false);
    const logoSrc = mediaUrl(brand.logo?.url);
    const showImage = Boolean(logoSrc) && !failed;
    const description = brand.description?.trim() || "No description available for this brand yet.";

    return (
        <>
            <div className="flex flex-col gap-6 md:flex-row md:items-start lg:gap-10">
                <div className="border-muted flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
                    {showImage ? (
                        <img
                            src={logoSrc!}
                            alt={`${brand.name} logo`}
                            className="max-h-full max-w-full object-contain"
                            onError={() => setFailed(true)}
                        />
                    ) : (
                        <span className="bg-muted text-muted-foreground flex size-24 items-center justify-center rounded-full text-2xl font-semibold">
                            {brand.name.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="flex flex-col">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <h2 className="text-foreground text-2xl font-bold md:text-3xl">{brand.name}</h2>
                        {brand.is_featured ? <Badge>Featured</Badge> : null}
                    </div>

                    <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-4 text-sm font-medium md:gap-8">
                        {brand.country ? (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{brand.country}</span>
                            </div>
                        ) : null}
                        {brand.website_url ? (
                            <a
                                href={brand.website_url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-primary flex items-center gap-2 transition-colors"
                            >
                                <Globe className="h-4 w-4" />
                                <span>Website</span>
                            </a>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Button variant="outline" className="border-blue-600 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" asChild>
                            <Link to="/catalog" search={{ brand_id: String(brand.id) }}>
                                View All Cars
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        {brand.website_url ? (
                            <a href={brand.website_url} target="_blank" rel="noreferrer">
                                <Button className="bg-blue-600 text-white hover:bg-blue-700">Visit Website</Button>
                            </a>
                        ) : null}
                    </div>
                </div>
            </div>

            <hr className="border-muted my-10" />

            <div>
                <h3 className="text-foreground mb-6 text-xl font-bold">Description</h3>
                <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed">
                    {description.split(/\n\n+/).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </div>

            <hr className="border-muted my-10" />
        </>
    );
}
