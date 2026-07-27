import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ModalsContainer } from "@/components/dashboard/modals/ModalsContainer";

export type RouterContext = {
    queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
    component: () => (
        <>
            <Outlet />
            <ModalsContainer />
            <TanStackRouterDevtools position="bottom-right" />
        </>
    ),
});
