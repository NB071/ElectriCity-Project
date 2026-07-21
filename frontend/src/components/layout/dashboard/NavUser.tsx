"use client";

import { ChevronUp, LogOut, Settings, User2 } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { user, clear } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clear();
        navigate({ to: "/" });
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg border">
                                <User2 className="size-4" />
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5 px-1 text-left leading-none">
                                <span className="text-sm font-medium">
                                    {user?.first_name} {user?.last_name}
                                </span>
                                <span className="text-muted-foreground max-w-32.5 truncate text-xs">{user?.email}</span>
                            </div>
                            <ChevronUp className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side={isMobile ? "bottom" : "right"} className="w-[--radix-popper-anchor-width]">
                        <DropdownMenuItem onClick={() => Navigate({ to: "/dashboard/settings/profile" })}>
                            <Settings className="mr-2 size-4" />
                            <span>Account Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 size-4" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
