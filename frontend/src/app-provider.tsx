import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import * as Sentry from "@sentry/react";
import { getContext as getTanStackQueryContext } from "./integrations/tanstack-query/query-client.ts";
import { Provider as TanStackQueryProvider } from "./integrations/tanstack-query/root-provider.tsx";
import { setSentryUser } from "./integrations/sentry";
import { useMe } from "./hooks/use-me";
import { router } from "./router.ts";

const tanStackQueryContext = getTanStackQueryContext();

function SentryFallback() {
    return (
        <div className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground max-w-md text-sm">
                An unexpected error occurred in the app. Try refreshing the page. If it keeps happening, contact support.
            </p>
            <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
                onClick={() => window.location.assign("/")}
            >
                Go home
            </button>
        </div>
    );
}

function SentryUserSync() {
    const { data: user } = useMe();

    useEffect(() => {
        setSentryUser(user?.user_id ?? null);
    }, [user?.user_id]);

    return null;
}

export function AppProvider() {
    return (
        <Sentry.ErrorBoundary fallback={SentryFallback} showDialog={false}>
            <TanStackQueryProvider {...tanStackQueryContext}>
                <SentryUserSync />
                <RouterProvider router={router} />
            </TanStackQueryProvider>
        </Sentry.ErrorBoundary>
    );
}
