import { createFileRoute, redirect } from "@tanstack/react-router";
import { ensureAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/_layout")({
    beforeLoad: async ({ context, location }) => {
        const user = await ensureAuthUser(context.queryClient);
        if (!user) {
            throw redirect({ to: "/auth/login", search: { redirect: location.href } });
        }
        return { user };
    },
    component: DashboardLayout,
});
