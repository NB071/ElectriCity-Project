import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { ChatbotFAB } from "@/components/dashboard/ChatbotFAB";

type DashboardLayoutProps = {
    children?: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader />
                <section className="container mx-auto">{children ?? <Outlet />}</section>
                <ChatbotFAB />
            </SidebarInset>
        </SidebarProvider>
    );
}
