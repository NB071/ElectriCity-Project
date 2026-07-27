import { useNavigate, useLocation } from "@tanstack/react-router";
import { useMe } from "@/hooks/use-me";
import { ChevronRight } from "lucide-react";
import { sidebarData } from "../data/sidebar-data";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NavUser } from "./NavUser";
import { SiteSwitcher } from "./SiteSwitcher";

export function AppSidebar() {
    const { data: user } = useMe();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = user?.role === "admin" ? sidebarData.adminNav : sidebarData.customerNav;

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SiteSwitcher />
            </SidebarHeader>

            <SidebarContent>
                {navItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) =>
                                    item.items ? (
                                        <Collapsible
                                            key={item.title}
                                            asChild
                                            defaultOpen={item.items.some(
                                                (subItem: any) => location.pathname === subItem.url || location.pathname.startsWith(`${subItem.url}/`)
                                            )}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton tooltip={item.title}>
                                                        {item.icon && <item.icon />}
                                                        <span className="font-semibold">{item.title}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    className="w-full"
                                                                    asChild
                                                                    isActive={
                                                                        location.pathname === subItem.url ||
                                                                        location.pathname.startsWith(`${subItem.url}/`)
                                                                    }
                                                                >
                                                                    <button onClick={() => navigate({ to: subItem.url })}>
                                                                        {subItem.icon && <subItem.icon />}
                                                                        <span>{subItem.title}</span>
                                                                    </button>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={
                                                    location.pathname === item.url ||
                                                    (item.url !== "/dashboard/admin" &&
                                                        item.url !== "/dashboard/customer" &&
                                                        location.pathname.startsWith(`${item.url}/`))
                                                }
                                            >
                                                <button onClick={() => navigate({ to: item.url })}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                </button>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                {/* User Section */}
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
