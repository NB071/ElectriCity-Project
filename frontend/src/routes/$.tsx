import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center font-sans dark:bg-slate-950">
            <div className="mb-8 w-full max-w-2xl">
                <img
                    src="/404_vector.png"
                    alt="404 Graphic vector mapping a large text display and search glass."
                    className="h-auto w-full object-contain"
                />
            </div>

            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">
                Oops! It looks like you're lost.
            </h1>

            <p className="mx-auto mb-10 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                The page you're looking for isn't available. Try to search again or use the go to.
            </p>

            <Button
                asChild
                variant="outline"
                className="h-10 rounded-md border-blue-500/30 px-6 font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500/50 dark:text-blue-400 dark:hover:bg-blue-500/10"
            >
                <Link to="/">
                    Go back to home <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
