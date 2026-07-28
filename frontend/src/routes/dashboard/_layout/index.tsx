import { createFileRoute, redirect } from "@tanstack/react-router";
import { dashboardHomeFor } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/_layout/")({
    beforeLoad: ({ context }) => {
        throw redirect({ to: dashboardHomeFor(context.user) });
    },
});
