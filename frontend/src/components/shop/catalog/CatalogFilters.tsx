import { useEffect } from "react";
import { Formik, Form, useFormikContext } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { BrowseCatalogSchema, type BrowseCatalogFilters } from "@/zod/browse-catalog";
import { useCatalogStore } from "@/stores";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const BODY_SHAPES = ["SUV", "Sedan", "Hatchback", "Coupe", "Convertible"];

function AutoSubmit() {
    const { values } = useFormikContext<BrowseCatalogFilters>();
    const setFilters = useCatalogStore((state) => state.setFilters);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(values);
        }, 400);
        return () => clearTimeout(timer);
    }, [values, setFilters]);

    return null;
}

export function CatalogFilters() {
    const filters = useCatalogStore((state) => state.filters);
    const clearFilters = useCatalogStore((state) => state.clearFilters);

    const initialValues: BrowseCatalogFilters = {
        q: filters.q ?? "",
        condition: filters.condition,
        body_shape: filters.body_shape ?? [],
        year_min: filters.year_min,
        year_max: filters.year_max,
        price_min: filters.price_min,
        price_max: filters.price_max,
        mileage_max: filters.mileage_max,
        drivetrain: filters.drivetrain ?? "",
        promo: filters.promo,
        sort: filters.sort || "added_desc",
    } as any;

    return (
        <div className="border-muted sticky top-24 w-full rounded-xl border bg-white p-5">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-8 text-xs">
                    Clear All
                </Button>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={toFormikValidationSchema(BrowseCatalogSchema)}
                onSubmit={() => {}}
                enableReinitialize
            >
                {({ values, setFieldValue, handleChange }) => (
                    <Form className="space-y-6">
                        <AutoSubmit />

                        <div className="space-y-3">
                            <Label>Search</Label>
                            <Input
                                type="text"
                                name="q"
                                value={values.q ?? ""}
                                onChange={handleChange}
                                placeholder="Search makes, models..."
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Condition</Label>
                            <Select
                                value={values.condition || "all"}
                                onValueChange={(val) => setFieldValue("condition", val === "all" ? undefined : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="New and Used" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">New and Used</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="used">Used</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Promotion</Label>
                            <Select value={values.promo || "all"} onValueChange={(val) => setFieldValue("promo", val === "all" ? undefined : val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any Deal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Promotion</SelectItem>
                                    <SelectItem value="hot_deal">Hot Deal</SelectItem>
                                    <SelectItem value="seasonal">Seasonal</SelectItem>
                                    <SelectItem value="clearance">Clearance</SelectItem>
                                    <SelectItem value="featured">Featured</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Accordion type="multiple" defaultValue={["type", "price"]}>
                            <AccordionItem value="type" className="border-b-0">
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">Type</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-3 pt-2">
                                        {BODY_SHAPES.map((shape) => (
                                            <div key={shape} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`shape-${shape}`}
                                                    checked={(values.body_shape ?? []).includes(shape)}
                                                    onCheckedChange={(checked) => {
                                                        const current = values.body_shape ?? [];
                                                        setFieldValue(
                                                            "body_shape",
                                                            checked ? [...current, shape] : current.filter((s) => s !== shape)
                                                        );
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`shape-${shape}`}
                                                    className="text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {shape}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="year" className="border-b-0">
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">Year</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-4 pt-2 pb-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-full space-y-1">
                                                <Input
                                                    type="number"
                                                    name="year_min"
                                                    value={values.year_min ?? ""}
                                                    onChange={handleChange}
                                                    placeholder="Min year"
                                                    className="bg-muted/50 h-10 text-sm"
                                                />
                                            </div>
                                            <span className="text-muted-foreground px-1 text-xs font-medium">to</span>
                                            <div className="w-full space-y-1">
                                                <Input
                                                    type="number"
                                                    name="year_max"
                                                    value={values.year_max ?? ""}
                                                    onChange={handleChange}
                                                    placeholder="Max year"
                                                    className="bg-muted/50 h-10 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <Slider
                                            min={1990}
                                            max={new Date().getFullYear() + 1}
                                            step={1}
                                            value={[
                                                values.year_min ? Number(values.year_min) : 1990,
                                                values.year_max ? Number(values.year_max) : new Date().getFullYear() + 1,
                                            ]}
                                            onValueChange={(val) => {
                                                setFieldValue("year_min", val[0]);
                                                setFieldValue("year_max", val[1]);
                                            }}
                                            className="px-1"
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="mileage" className="border-b-0">
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">Mileage</AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-2">
                                        <Select
                                            value={values.mileage_max ? String(values.mileage_max) : "any"}
                                            onValueChange={(val) => setFieldValue("mileage_max", val === "any" ? undefined : Number(val))}
                                        >
                                            <SelectTrigger className="bg-muted/50">
                                                <SelectValue placeholder="Any Mileage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">Any Mileage</SelectItem>
                                                <SelectItem value="10000">Under 10,000 miles</SelectItem>
                                                <SelectItem value="30000">Under 30,000 miles</SelectItem>
                                                <SelectItem value="60000">Under 60,000 miles</SelectItem>
                                                <SelectItem value="100000">Under 100,000 miles</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="price" className="border-b-0">
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">Price</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-4 pt-2 pb-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-full space-y-1">
                                                <Input
                                                    type="number"
                                                    name="price_min"
                                                    value={values.price_min ?? ""}
                                                    onChange={handleChange}
                                                    placeholder="Min price"
                                                    className="bg-muted/50 h-10 text-sm"
                                                />
                                            </div>
                                            <span className="text-muted-foreground px-1 text-xs font-medium">to</span>
                                            <div className="w-full space-y-1">
                                                <Input
                                                    type="number"
                                                    name="price_max"
                                                    value={values.price_max ?? ""}
                                                    onChange={handleChange}
                                                    placeholder="Max price"
                                                    className="bg-muted/50 h-10 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <Slider
                                            min={0}
                                            max={150000}
                                            step={500}
                                            value={[
                                                values.price_min ? Number(values.price_min) : 0,
                                                values.price_max ? Number(values.price_max) : 150000,
                                            ]}
                                            onValueChange={(val) => {
                                                setFieldValue("price_min", val[0]);
                                                setFieldValue("price_max", val[1]);
                                            }}
                                            className="px-1"
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
