import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export function DateRangeDisplay() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const endYear = endDate.getFullYear();
    const startYear = startDate.getFullYear();

    let dateRangeStr = "";
    if (endYear === startYear) {
        dateRangeStr = `${startDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}, ${endYear}`;
    } else {
        dateRangeStr = `${startDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`;
    }

    return (
        <Button variant="outline" size="sm" className="text-foreground hidden h-8 gap-2 text-sm font-normal md:flex">
            <Calendar className="size-4 opacity-70" />
            {dateRangeStr}
        </Button>
    );
}
