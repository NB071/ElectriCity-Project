import { Link, useLocation } from "@tanstack/react-router";
import { useCompareStore } from "@/stores/compare-store";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompareItemsFAB() {
    const location = useLocation();
    const compareCount = useCompareStore((s) => s.items.length);
    const showLimitWarning = useCompareStore((s) => s.showLimitWarning);

    if (compareCount < 2 || location.pathname.startsWith("/catalog/compare")) return null;

    return (
        <Link
            to="/catalog/compare"
            className={cn(
                "fixed right-6 bottom-16 z-10 flex items-center justify-center gap-3 rounded-full text-white shadow-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl",
                showLimitWarning
                    ? "h-16 animate-[wiggle_400ms_ease-in-out_2] bg-red-500 px-8"
                    : "h-14 bg-linear-to-r from-blue-600/80 to-indigo-600/80 px-6"
            )}
        >
            <Scale className={cn("transition-all duration-300", showLimitWarning ? "size-6" : "size-5")} />

            <div className="flex flex-col items-center justify-center overflow-hidden transition-all duration-500">
                <span className="text-center leading-tight font-semibold whitespace-nowrap">Compare ({compareCount}/4)</span>

                <div
                    className={cn(
                        "grid transition-all duration-500",
                        showLimitWarning ? "mt-0.5 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="min-h-0 overflow-hidden">
                        <span className="block pb-0.5 text-[10px] leading-none font-bold tracking-widest whitespace-nowrap uppercase sm:text-xs">
                            Maximum limit reached
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
