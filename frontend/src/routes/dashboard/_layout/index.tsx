import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/dashboard/_layout/")({
    beforeLoad: () => {
        const user = useAuthStore.getState().user;
        if (user?.role === "admin") {
            throw redirect({ to: "/dashboard/admin" });
        }
        throw redirect({ to: "/dashboard/customer" });
    },
});
