import { cn } from "@/lib/utils";
import { BadgePercent, Gem, Tag, Wrench } from "lucide-react";

const FEATURES = [
    {
        title: "Special Financing Offers",
        description: "Our stress-free finance department that can find financial solutions to save you money.",
        icon: BadgePercent,
    },
    {
        title: "Trusted Car Dealership",
        description: "Our stress-free finance department that can find financial solutions to save you money.",
        icon: Gem,
    },
    {
        title: "Transparent Pricing",
        description: "Our stress-free finance department that can find financial solutions to save you money.",
        icon: Tag,
    },
    {
        title: "Expert Car Service",
        description: "Our stress-free finance department that can find financial solutions to save you money.",
        icon: Wrench,
    },
];

type WhyUsProps = {
    transparentBG?: boolean;
};

export function WhyUs({ transparentBG = false }: WhyUsProps) {
    return (
        <section className={cn("py-16 md:py-24", transparentBG ? "bg-transparent" : "bg-primary text-primary-foreground")}>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3">
                    <div className="flex w-fit items-center justify-center rounded-full bg-white px-3 py-1 shadow-sm">
                        <span className="text-primary text-xs font-medium">Benefits</span>
                    </div>
                    <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">Why Choose Us?</h2>
                </div>

                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {FEATURES.map((feature, idx) => (
                        <div key={idx} className="flex flex-col gap-5">
                            <feature.icon className="size-8 stroke-[1.5] md:size-10" aria-hidden />
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p
                                    className={cn(
                                        "text-primary-foreground/80 text-sm leading-relaxed text-balance",
                                        transparentBG ? "text-muted-foreground" : "text-primary-foreground/80"
                                    )}
                                >
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
