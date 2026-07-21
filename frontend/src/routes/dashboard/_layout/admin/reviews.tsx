import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_layout/admin/reviews")({
    component: RouteComponent,
});

function RouteComponent() {
    return <p>Admin Reviews</p>;
}
