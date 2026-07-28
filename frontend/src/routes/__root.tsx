import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import type { AuthUser } from "@/hooks/use-me";
import { ModalsContainer } from "@/components/dashboard/modals/ModalsContainer";
import { Toaster } from "@/components/ui/sonner";

export type RouterContext = {
    queryClient: QueryClient;
    user?: AuthUser;
};

export const Route = createRootRouteWithContext<RouterContext>()({
    component: () => (
        <>
            <Outlet />
            <ModalsContainer />
            <Toaster richColors closeButton position="top-right" />
            {import.meta.env.DEV && (
                <>
                    <TanStackRouterDevtools position="bottom-right" />
                    <ReactQueryDevtools buttonPosition="bottom-right" />
                </>
            )}
        </>
    ),
});
