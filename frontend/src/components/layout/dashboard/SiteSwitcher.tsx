import { Store, LayoutDashboard, ChevronsUpDown } from "lucide-react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useMe } from "@/hooks/use-me";
import { dashboardHomeFor } from "@/lib/auth";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function SiteSwitcher() {
    const { isMobile } = useSidebar();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: user } = useMe();

    const roleLabel = user?.role === "admin" ? "Admin Portal" : "Customer Portal";

    const sites = [
        {
            name: "Dashboard",
            plan: roleLabel,
            logo: LayoutDashboard,
            url: dashboardHomeFor(user),
        },
        {
            name: "Storefront",
            plan: "Shop Landing",
            logo: Store,
            url: "/",
        },
    ];

    const activeSite = location.pathname.startsWith("/dashboard") ? sites[0] : sites[1];

    if (!activeSite) return null;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <activeSite.logo className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{activeSite.name}</span>
                                <span className="truncate text-xs">{activeSite.plan}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">Portals</DropdownMenuLabel>
                        {sites.map((site) => (
                            <DropdownMenuItem key={site.name} onClick={() => navigate({ to: site.url })} className="cursor-pointer gap-2 p-2">
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <site.logo className="size-4 shrink-0" />
                                </div>
                                {site.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
