import { createRouter } from "@tanstack/react-router";
import { getContext as getTanStackQueryContext } from "./integrations/tanstack-query/query-client.ts";
import { routeTree } from "./routeTree.gen.ts";

const tanStackQueryContext = getTanStackQueryContext();

export const router = createRouter({
    routeTree,
    context: {
        ...tanStackQueryContext,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
