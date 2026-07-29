import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { QueryError } from "@/components/common/QueryError";
import { UnderlineLinkButton } from "../common/underline-link-button";
import { useGetFeaturedBrands } from "@/hooks/api/catalog/use-brands";

type BrandsProps = {
    /** Landing overlaps the hero; about and other pages should use a flat section. */
    overlap?: boolean;
};

function Brands({ overlap = true }: BrandsProps) {
    const { data, isLoading, isError, error, refetch, isFetching } = useGetFeaturedBrands();
    const brands = data?.items ?? [];

    return (
        <section
            className={cn(
                "bg-background relative pt-12 pb-16 md:pt-16 md:pb-20",
                overlap && "-mt-6 rounded-t-[2rem] md:-mt-10 md:rounded-t-[3rem]"
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3">
                    <Badge variant="outline" className="text-foreground h-7 rounded-full bg-white px-3 text-xs font-medium">
                        Brands
                    </Badge>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Explore Our Premium Brands</h2>
                        <UnderlineLinkButton to="/brands" lineOffset="after:bottom-1">
                            Show All Brands
                        </UnderlineLinkButton>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-36 w-full items-center justify-center">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : isError ? (
                    <QueryError
                        title="Couldn't load brands"
                        message="We couldn't load premium brands right now."
                        error={error}
                        onRetry={() => void refetch()}
                        isRetrying={isFetching}
                    />
                ) : brands.length === 0 ? (
                    <p className="text-muted-foreground py-10 text-center text-sm">No premium brands to show yet.</p>
                ) : (
                    <ScrollArea className="w-full" scrollHideDelay={100} about="Featured brands">
                        <ul className="flex w-max gap-4 pb-3" aria-label="Featured brands">
                            {brands.map((brand) => (
                                <li key={brand.id} className="shrink-0 p-1">
                                    <Link
                                        to="/catalog"
                                        search={{ brand_id: brand.id } as never}
                                        className="focus-visible:ring-ring/50 block h-full rounded-xl outline-none focus-visible:ring-3"
                                    >
                                        <Card
                                            size="sm"
                                            className={cn(
                                                "h-36 w-44 items-center justify-center gap-3 py-6 shadow-none transition-all duration-500",
                                                "ring-border hover:text-primary hover:ring-primary hover:-translate-y-0.5 hover:shadow-lg"
                                            )}
                                        >
                                            <CardContent className="flex flex-col items-center gap-3 px-4">
                                                <BrandLogo name={brand.name} logoUrl={mediaUrl(brand.logo?.url)} />
                                                <span className="text-center text-sm font-medium">{brand.name}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </div>
        </section>
    );
}

function BrandLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(logoUrl) && !failed;

    if (!showImage) {
        return (
            <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full text-sm font-semibold" aria-hidden>
                {name.slice(0, 2).toUpperCase()}
            </span>
        );
    }

    return <img src={logoUrl!} alt="" className="size-14 object-contain" loading="lazy" onError={() => setFailed(true)} />;
}

export { Brands };
