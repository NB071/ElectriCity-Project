import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/shadcn-space/number-ticker/number-ticker-01";

const FEATURES = [
    "Curated inventory of new and used electric vehicles",
    "Transparent pricing with verified vehicle history",
    "EV specialists and chatbot guidance when you need it",
] as const;

const STATS = [
    { end: 2.4, decimals: 1, suffix: "K+", label: "EVs for sale" },
    { end: 18, decimals: 0, suffix: "K+", label: "Customer reviews" },
    { end: 45, decimals: 0, suffix: "K", label: "Visitors per day" },
    { end: 320, decimals: 0, suffix: "+", label: "Verified dealers" },
] as const;

function About() {
    return (
        <section className="bg-background pb-16 md:pb-24">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <ImageMosaic />

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <Badge variant="outline" className="text-foreground h-7 rounded-full bg-white px-3 text-xs font-medium">
                                About Us
                            </Badge>
                            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                                Drive Electric With Confidence
                                <span className="block">Shop ElectriCity Today</span>
                            </h2>
                        </div>

                        <p className="text-muted-foreground max-w-lg text-base leading-relaxed">
                            We are committed to helping drivers switch to electric with exceptional service, competitive pricing, and a wide range of
                            trusted EV brands.
                        </p>

                        <ul className="flex flex-col gap-3">
                            {FEATURES.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm md:text-base">
                                    <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                                        <Check className="size-3" strokeWidth={3} aria-hidden />
                                    </span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div>
                            <Button asChild size="lg" className="group h-14 gap-2 rounded-lg px-8 text-base">
                                <Link to="/catalog">
                                    Get Started
                                    <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <dl className="grid grid-cols-2 gap-8 pt-10 md:grid-cols-4 md:gap-4">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                            <dt className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                                <NumberTicker
                                    end={stat.end}
                                    decimals={stat.decimals}
                                    suffix={stat.suffix}
                                    duration={2}
                                    className="font-heading text-3xl font-semibold tracking-tight md:text-4xl"
                                />
                            </dt>
                            <dd className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{stat.label}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

function ImageMosaic() {
    return (
        <div className="grid aspect-square max-w-lg grid-cols-2 grid-rows-[1fr_0.5fr_1fr] gap-3 sm:gap-12 lg:max-w-none" aria-hidden>
            <MosaicTile src="/about_us_1.jpg" alt="About us 1" className="col-start-1 row-span-2 row-start-1 mt-18" />
            <MosaicTile src="/about_us_2.jpg" alt="About us 2" className="col-start-2 row-span-2 row-start-2" />
            <MosaicTile src="/about_us_3.jpg" alt="About us 3" className="col-start-1 row-start-3 mt-5 ml-8" />
        </div>
    );
}

function MosaicTile({ src, className, alt }: { src: string; className?: string; alt: string }) {
    return (
        <div className={cn("bg-muted relative overflow-hidden rounded-2xl", className)}>
            <img src={src} alt={alt} className="absolute inset-0 size-full object-cover shadow-lg" loading="lazy" fetchPriority="low" />
        </div>
    );
}

export { About };
