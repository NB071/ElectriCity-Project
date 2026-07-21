import { useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Car, CarFront, CarTaxiFront, Search, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CONDITIONS = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
];

const MAKES = ["Tesla", "BMW", "Audi", "Hyundai", "Kia", "Nissan", "Volkswagen"];

const MODELS = ["Model 3", "Model Y", "i4", "e-tron", "Ioniq 5", "EV6", "Leaf", "ID.4"];

const PRICES = [
    { value: "0-30000", label: "Under $30,000" },
    { value: "30000-50000", label: "$30,000 - $50,000" },
    { value: "50000-80000", label: "$50,000 - $80,000" },
    { value: "80000-", label: "Over $80,000" },
];

const BODY_TYPES = [
    { label: "SUV", icon: Truck },
    { label: "Sedan", icon: Car },
    { label: "Hatchback", icon: CarTaxiFront },
    { label: "Coupe", icon: CarFront },
    { label: "Hybrid", icon: Zap },
];

function Hero() {
    const navigate = useNavigate();
    const [condition, setCondition] = useState("all");
    const [make, setMake] = useState<string | undefined>();
    const [model, setModel] = useState<string | undefined>();
    const [price, setPrice] = useState<string | undefined>();

    function onSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        void navigate({ to: "/catalog" });
    }

    return (
        <section className="sticky top-0 overflow-hidden bg-[#54576b] pt-20 text-white">
            {/* Hero image */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <img src="/hero_image.jpg" alt="Hero image" className="size-full object-cover object-center" loading="eager" fetchPriority="high" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-950/80" />
            </div>

            <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 pt-14 pb-20 md:gap-8 md:pt-24 md:pb-32">
                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-white/80">Find cars for sale and for rent near you</p>
                    <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">Find Your Perfect Car</h1>
                </div>

                <Tabs value={condition} onValueChange={setCondition}>
                    <TabsList variant="line">
                        {CONDITIONS.map((c) => (
                            <TabsTrigger
                                key={c.value}
                                value={c.value}
                                className="text-white/70 after:bg-white hover:text-white data-active:text-white"
                            >
                                {c.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <form onSubmit={onSubmit} className="w-full">
                    {/* Mobile: stacked card */}
                    <Card className="text-foreground mx-auto w-full max-w-sm rounded-3xl border-none md:hidden">
                        <CardContent className="p-4">
                            <FieldGroup className="gap-4">
                                <Field>
                                    <FieldLabel htmlFor="hero-make-m" className="text-muted-foreground text-xs">
                                        Any Makes
                                    </FieldLabel>
                                    <Select value={make} onValueChange={setMake}>
                                        <SelectTrigger id="hero-make-m" className="w-full">
                                            <SelectValue placeholder="All Makes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {MAKES.map((m) => (
                                                    <SelectItem key={m} value={m}>
                                                        {m}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="hero-model-m" className="text-muted-foreground text-xs">
                                        Any Models
                                    </FieldLabel>
                                    <Select value={model} onValueChange={setModel}>
                                        <SelectTrigger id="hero-model-m" className="w-full">
                                            <SelectValue placeholder="All Models" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {MODELS.map((m) => (
                                                    <SelectItem key={m} value={m}>
                                                        {m}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="hero-price-m" className="text-muted-foreground text-xs">
                                        Any Price
                                    </FieldLabel>
                                    <Select value={price} onValueChange={setPrice}>
                                        <SelectTrigger id="hero-price-m" className="w-full">
                                            <SelectValue placeholder="All Price" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {PRICES.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Button type="submit" size="sm" className="w-full rounded-full">
                                    <Search data-icon="inline-start" />
                                    Search
                                </Button>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    {/* Desktop: pill row */}
                    <div className="text-foreground mx-auto hidden h-14 w-full max-w-2xl items-center gap-1 rounded-full bg-white p-1.5 pl-3 shadow-lg md:flex">
                        <Select value={make} onValueChange={setMake}>
                            <SelectTrigger
                                aria-label="Any makes"
                                className="flex-1 border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                            >
                                <SelectValue placeholder="Any Makes" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    {MAKES.map((m) => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Separator orientation="vertical" className="h-6!" />
                        <Select value={model} onValueChange={setModel}>
                            <SelectTrigger
                                aria-label="Any models"
                                className="flex-1 border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                            >
                                <SelectValue placeholder="Any Models" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    {MODELS.map((m) => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Separator orientation="vertical" className="h-6!" />
                        <Select value={price} onValueChange={setPrice}>
                            <SelectTrigger
                                aria-label="Any price"
                                className="flex-1 border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                            >
                                <SelectValue placeholder="Any Price" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    {PRICES.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button type="submit" size="lg" className="m-auto h-11 shrink-0 rounded-full px-5">
                            <Search className="ml-1 size-4" data-icon="inline-start" />
                            Search
                        </Button>
                    </div>
                </form>

                <div className="flex w-full flex-col items-center gap-4">
                    <p className="text-sm text-white/90">Or Browse Featured Model</p>
                    <ScrollArea className="w-full" scrollHideDelay={100} about="Featured models">
                        <div className="mx-auto flex w-max gap-3 px-1 pb-2">
                            {BODY_TYPES.map(({ label, icon: Icon }) => (
                                <Button
                                    key={label}
                                    type="button"
                                    variant="secondary"
                                    onClick={() => void navigate({ to: "/catalog" })}
                                    className={cn(
                                        "rounded-full border-white/20 bg-white/15 text-white backdrop-blur-md transition-all duration-500",
                                        "hover:bg-white/25 aria-expanded:bg-white/25"
                                    )}
                                >
                                    <Icon className="ml-1 size-4" data-icon="inline-start" />
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="opacity-0" />
                    </ScrollArea>
                </div>
            </div>
        </section>
    );
}

export { Hero };
