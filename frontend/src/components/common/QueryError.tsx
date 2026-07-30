import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QueryErrorProps = {
    title?: string;
    message?: string;
    error?: Error | null;
    onRetry?: () => void;
    isRetrying?: boolean;
    className?: string;
};

function QueryError({
    title = "Something went wrong",
    message,
    error,
    onRetry,
    isRetrying = false,
    className,
}: QueryErrorProps) {
    const description = message ?? error?.message ?? "Please try again.";

    return (
        <Alert variant="destructive" className={cn(className)}>
            <AlertCircleIcon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
            {onRetry ? (
                <AlertAction>
                    <Button type="button" variant="outline" size="sm" disabled={isRetrying} onClick={onRetry}>
                        <RefreshCwIcon data-icon="inline-start" className={cn(isRetrying && "animate-spin")} />
                        Retry
                    </Button>
                </AlertAction>
            ) : null}
        </Alert>
    );
}

export { QueryError };
export type { QueryErrorProps };
