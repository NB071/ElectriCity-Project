import AuthLayout from "@/components/layout/auth/AuthLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_layout")({
    component: AuthLayout,
});
