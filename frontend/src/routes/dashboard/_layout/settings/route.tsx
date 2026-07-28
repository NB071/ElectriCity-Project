import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { settingsSidebarItems } from "@/components/layout/data/sidebar-data";

export const Route = createFileRoute("/dashboard/_layout/settings")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <div className="mt-5 space-y-0.5 px-10">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
            </div>
            <Separator className="my-4 lg:my-6" />
            <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="top-0 pl-10 lg:sticky lg:w-1/5">
                    <SidebarNav items={settingsSidebarItems} />
                </aside>
                <div className="flex w-full overflow-y-hidden p-1">
                    <Outlet />
                </div>
            </div>
        </>
    );
}
