import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ModalsContainer } from "@/components/dashboard/modals/ModalsContainer";

export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            <ModalsContainer />
            <TanStackRouterDevtools position="bottom-right" />
        </>
    ),
});
