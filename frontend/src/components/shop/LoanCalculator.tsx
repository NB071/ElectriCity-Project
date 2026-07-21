import { useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { loanSchema } from "@/zod/loan";

type Props = {
    transparent?: boolean;
};

export function LoanCalculator({ transparent = false }: Props) {
    const [result, setResult] = useState<number | null>(null);

    const formik = useFormik({
        initialValues: {
            price: "45000",
            rate: "5",
            period: "36",
            down: "5000",
        },
        validationSchema: toFormikValidationSchema(loanSchema),
        onSubmit: (values) => {
            const p = parseFloat(values.price);
            const r = parseFloat(values.rate);
            const n = parseInt(values.period, 10);
            const d = parseFloat(values.down);

            const principal = p - d;
            if (principal <= 0) {
                setResult(0);
                return;
            }

            const monthlyRate = r / 100 / 12;
            if (monthlyRate === 0) {
                setResult(principal / n);
                return;
            }

            const exactResult = (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
            setResult(exactResult);
        },
    });

    const handleReset = () => {
        formik.resetForm();
        setResult(null);
    };

    return (
        <section className={cn("py-16 md:py-24", transparent ? "bg-transparent" : "bg-background")}>
            <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div
                    className={cn(
                        "flex w-full flex-col overflow-hidden rounded-xl shadow-sm lg:flex-row",
                        transparent ? "bg-transparent" : "bg-[#0B1121]"
                    )}
                >
                    {/* Left side image */}
                    <div className="bg-muted relative min-h-[300px] w-full rounded-r-4xl lg:w-1/3">
                        <img
                            src="/loan_calulator_image.png"
                            alt="Loan Calculator Graphic"
                            className="absolute inset-0 size-full rounded-r-4xl object-cover"
                        />
                    </div>

                    {/* Right side calculator */}
                    <div className={cn("flex w-full flex-col justify-center p-8 lg:w-2/3 lg:p-16", transparent ? "bg-transparent" : "bg-[#0B1121]")}>
                        <div className="mb-10 flex flex-col gap-3">
                            <div
                                className={cn(
                                    "flex w-fit items-center justify-center rounded-full border px-3 py-1 shadow-sm",
                                    transparent ? "border-foreground/20 bg-foreground/10" : "border-white/20 bg-white/10"
                                )}
                            >
                                <span className={cn("text-xs font-medium", transparent ? "text-foreground/90" : "text-white/90")}>Financing</span>
                            </div>
                            <h2 className={cn("font-heading text-3xl font-bold tracking-tight", transparent ? "text-foreground" : "text-white")}>
                                Auto Loan Calculator
                            </h2>
                            <p className={cn("text-sm leading-relaxed", transparent ? "text-muted-foreground" : "text-white/70")}>
                                Use this car payment calculator to estimate monthly payments on your next new or used auto loan.
                            </p>
                        </div>

                        <form className="flex flex-col gap-6" onSubmit={formik.handleSubmit}>
                            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                <div
                                    className={cn(
                                        "relative flex h-16 flex-col justify-center rounded-md border px-4 transition-colors",
                                        transparent ? "bg-background border-border" : "border-transparent bg-white",
                                        formik.touched.price && formik.errors.price ? "border-destructive!" : ""
                                    )}
                                >
                                    <label
                                        htmlFor="price"
                                        className={cn(
                                            "text-[10px] font-medium transition-colors sm:text-xs",
                                            formik.touched.price && formik.errors.price
                                                ? "text-destructive"
                                                : transparent
                                                  ? "text-muted-foreground"
                                                  : "text-gray-500"
                                        )}
                                    >
                                        Vehicle Price ($)
                                    </label>
                                    <input
                                        id="price"
                                        name="price"
                                        type="text"
                                        value={formik.values.price}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={cn(
                                            "h-6 w-full cursor-text border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 focus:outline-none",
                                            transparent ? "text-foreground" : "text-black"
                                        )}
                                    />
                                    {formik.touched.price && formik.errors.price && (
                                        <span className="text-destructive absolute -bottom-5 left-0 text-[10px]">{formik.errors.price}</span>
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "relative flex h-16 flex-col justify-center rounded-md border px-4 transition-colors",
                                        transparent ? "bg-background border-border" : "border-transparent bg-white",
                                        formik.touched.rate && formik.errors.rate ? "border-destructive!" : ""
                                    )}
                                >
                                    <label
                                        htmlFor="rate"
                                        className={cn(
                                            "text-[10px] font-medium transition-colors sm:text-xs",
                                            formik.touched.rate && formik.errors.rate
                                                ? "text-destructive"
                                                : transparent
                                                  ? "text-muted-foreground"
                                                  : "text-gray-500"
                                        )}
                                    >
                                        Interest Rate (%)
                                    </label>
                                    <input
                                        id="rate"
                                        name="rate"
                                        type="text"
                                        value={formik.values.rate}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={cn(
                                            "h-6 w-full cursor-text border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 focus:outline-none",
                                            transparent ? "text-foreground" : "text-black"
                                        )}
                                    />
                                    {formik.touched.rate && formik.errors.rate && (
                                        <span className="text-destructive absolute -bottom-5 left-0 text-[10px]">{formik.errors.rate}</span>
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "relative flex h-16 flex-col justify-center rounded-md border px-4 transition-colors",
                                        transparent ? "bg-background border-border" : "border-transparent bg-white",
                                        formik.touched.period && formik.errors.period ? "border-destructive!" : ""
                                    )}
                                >
                                    <label
                                        htmlFor="period"
                                        className={cn(
                                            "text-[10px] font-medium transition-colors sm:text-xs",
                                            formik.touched.period && formik.errors.period
                                                ? "text-destructive"
                                                : transparent
                                                  ? "text-muted-foreground"
                                                  : "text-gray-500"
                                        )}
                                    >
                                        Period (months)
                                    </label>
                                    <input
                                        id="period"
                                        name="period"
                                        type="text"
                                        value={formik.values.period}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={cn(
                                            "h-6 w-full cursor-text border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 focus:outline-none",
                                            transparent ? "text-foreground" : "text-black"
                                        )}
                                    />
                                    {formik.touched.period && formik.errors.period && (
                                        <span className="text-destructive absolute -bottom-5 left-0 text-[10px]">{formik.errors.period}</span>
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "relative flex h-16 flex-col justify-center rounded-md border px-4 transition-colors",
                                        transparent ? "bg-background border-border" : "border-transparent bg-white",
                                        formik.touched.down && formik.errors.down ? "border-destructive!" : ""
                                    )}
                                >
                                    <label
                                        htmlFor="down"
                                        className={cn(
                                            "text-[10px] font-medium transition-colors sm:text-xs",
                                            formik.touched.down && formik.errors.down
                                                ? "text-destructive"
                                                : transparent
                                                  ? "text-muted-foreground"
                                                  : "text-gray-500"
                                        )}
                                    >
                                        Down Payment ($)
                                    </label>
                                    <input
                                        id="down"
                                        name="down"
                                        type="text"
                                        value={formik.values.down}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={cn(
                                            "h-6 w-full cursor-text border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 focus:outline-none",
                                            transparent ? "text-foreground" : "text-black"
                                        )}
                                    />
                                    {formik.touched.down && formik.errors.down && (
                                        <span className="text-destructive absolute -bottom-5 left-0 text-[10px]">{formik.errors.down}</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <Button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 flex-1 items-center justify-center gap-2 rounded-md font-medium"
                                >
                                    Calculate <ArrowUpRight className="size-4" strokeWidth={2.5} />
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleReset}
                                    className={cn(
                                        "h-12 w-12 rounded-md",
                                        transparent
                                            ? "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                    )}
                                    title="Reset calculator"
                                >
                                    <RotateCcw className="size-4" />
                                </Button>

                                {result !== null && (
                                    <div className="animate-in fade-in zoom-in border-primary/30 bg-primary/10 flex h-12 flex-1 items-center justify-center rounded-md border px-6 duration-300">
                                        <p className={cn("text-sm", transparent ? "text-foreground" : "text-white")}>
                                            Estimated: <strong className="text-primary text-lg">${result.toFixed(2)}</strong> / mo
                                        </p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
