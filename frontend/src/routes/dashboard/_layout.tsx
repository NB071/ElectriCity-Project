import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardLayout } from "@/components/layout/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/_layout")({
    beforeLoad: () => {
        const auth = useAuthStore.getState();
        if (auth.status !== "authenticated" || !auth.user) {
            throw redirect({ to: "/auth/login" });
        }
    },
    component: DashboardLayout,
});
