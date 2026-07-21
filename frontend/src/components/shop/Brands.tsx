import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { UnderlineLinkButton } from "../common/underline-link-button";

type Brand = {
    id: number;
    name: string;
    logoUrl: string | null;
};

/** Placeholder featured brands until `GET /api/shop/catalog/brands?is_featured=true` is wired. */
const FEATURED_BRANDS: Brand[] = [
    { id: 12, name: "Audi", logoUrl: "/temp/audi.jpg" },
    { id: 11, name: "BMW", logoUrl: "/temp/bmw.jpg" },
    { id: 4, name: "Ford", logoUrl: "/temp/ford.jpg" },
    { id: 1, name: "Tesla", logoUrl: "/temp/tesla.jpg" },
    { id: 15, name: "Volvo", logoUrl: "/temp/volvo.jpg" },
    { id: 9, name: "Volkswagen", logoUrl: "/temp/volkswagen.jpg" },
];

function Brands() {
    return (
        <section className="bg-background relative -mt-6 rounded-t-[2rem] pt-12 pb-16 md:-mt-10 md:rounded-t-[3rem] md:pt-16 md:pb-20">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3">
                    <Badge variant="outline" className="text-foreground h-7 rounded-full bg-white px-3 text-xs font-medium">
                        Brands
                    </Badge>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Explore Our Premium Brands</h2>
                        <UnderlineLinkButton to="/catalog" lineOffset="after:bottom-1">
                            Show All Brands
                        </UnderlineLinkButton>
                    </div>
                </div>

                <ScrollArea className="w-full" scrollHideDelay={100} about="Featured brands">
                    <ul className="flex w-max gap-4 pb-3" aria-label="Featured brands">
                        {FEATURED_BRANDS.map((brand) => (
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
                                            <BrandLogo name={brand.name} logoUrl={brand.logoUrl} />
                                            <span className="text-center text-sm font-medium">{brand.name}</span>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
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
