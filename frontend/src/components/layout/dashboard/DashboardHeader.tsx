import { DateRangeDisplay } from "@/components/dashboard/DateRangeDisplay";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader() {
    return (
        <header className="bg-background flex h-16 shrink-0 items-center gap-2 overflow-hidden rounded-t-xl px-4">
            <SidebarTrigger />
            <div className="ml-2 flex flex-1 items-center gap-6">
                <Separator orientation="vertical" className="h-6" />
                <Breadcrumbs />
            </div>
            <div>
                <DateRangeDisplay />
            </div>
        </header>
    );
}
