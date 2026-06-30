import { RouterProvider } from "@tanstack/react-router";
import { getContext as getTanStackQueryContext } from "./integrations/tanstack-query/query-client.ts";
import { Provider as TanStackQueryProvider } from "./integrations/tanstack-query/root-provider.tsx";
import { router } from "./router.ts";

const tanStackQueryContext = getTanStackQueryContext();

export function AppProvider() {
    return (
        <TanStackQueryProvider {...tanStackQueryContext}>
            <RouterProvider router={router} />
        </TanStackQueryProvider>
    );
}
