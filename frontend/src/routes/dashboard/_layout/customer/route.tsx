import { createFileRoute, Outlet } from "@tanstack/react-router";
import withRoleGuard from "@/lib/roleGuard";

export const Route = createFileRoute("/dashboard/_layout/customer")({
    ...withRoleGuard(["customer"]),
    component: () => <Outlet />,
});
