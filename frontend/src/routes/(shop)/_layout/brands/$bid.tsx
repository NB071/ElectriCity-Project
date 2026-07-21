import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Globe, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// This mimics the exact data structure available in the backend `brands` table
const MOCK_BRAND = {
    id: 1,
    name: "Audi Paris",
    logoUrl: "/temp/audi.jpg",
    country: "Australia",
    website_url: "https://audi.example.com",
    description:
        "Quisque imperdiet dignissim enim dictum finibus. Sed consectetur convallis enim eget laoreet. Aenean vitae nisl mollis, porta risus vel, dapibus lectus. Etiam ac suscipit eros, eget maximus.\n\nEtiam sit amet ex pharetra, venenatis ante vehicula, gravida sapien. Fusce eleifend vulputate nibh, non cursus augue placerat pellentesque. Sed venenatis risus nec felis mollis, in pharetra urna euismod. Morbi aliquam ut turpis sit amet ultrices. Vestibulum mattis blandit nisl, et tristique elit scelerisque nec. Fusce eleifend laoreet dui eget aliquet. Ut rutrum risus et nunc pretium scelerisque.",
};

export const Route = createFileRoute("/(shop)/_layout/brands/$bid")({
    component: RouteComponent,
});

function RouteComponent() {
    // Normally fetched from backend API using the $bid route parameter
    const brand = MOCK_BRAND;

    return (
        <div className="bg-background mt-12 min-h-screen py-10 md:py-16">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-foreground mb-10 text-3xl font-bold tracking-tight md:text-4xl">Brand Details</h1>

                {/* Top Info Card */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start lg:gap-10">
                    <div className="border-muted flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
                        <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/logo192.png";
                            }}
                        />
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-foreground mb-4 text-2xl font-bold md:text-3xl">{brand.name}</h2>

                        <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-4 text-sm font-medium md:gap-8">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{brand.country}</span>
                            </div>
                            {brand.website_url && (
                                <a
                                    href={brand.website_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-primary flex items-center gap-2 transition-colors"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span>Website</span>
                                </a>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button variant="outline" className="border-blue-600 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
                                View All Cars
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                            {brand.website_url && (
                                <a href={brand.website_url} target="_blank" rel="noreferrer">
                                    <Button className="bg-blue-600 text-white hover:bg-blue-700">Visit Website</Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="border-muted my-10" />

                {/* Description Section */}
                <div>
                    <h3 className="text-foreground mb-6 text-xl font-bold">Description</h3>
                    <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed">
                        {brand.description.split("\n\n").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <hr className="border-muted my-10" />
            </div>
        </div>
    );
}
