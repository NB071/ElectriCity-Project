import { createFileRoute, redirect } from "@tanstack/react-router";
import { dashboardHomeFor, ensureAuthUser } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/_layout/")({
    beforeLoad: async ({ context }) => {
        const user = await ensureAuthUser(context.queryClient);
        throw redirect({ to: dashboardHomeFor(user) });
    },
});
