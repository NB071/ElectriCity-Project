import { useState } from "react";
import { Star, User, Loader2 } from "lucide-react";
import { QueryError } from "@/components/common/QueryError";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetVehicleReviews } from "@/hooks/api/review/use-vehicle-reviews";
import { useAuthStatus } from "@/hooks/use-me";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function ReviewList({ cid }: { cid: number }) {
    const [page, setPage] = useState(1);
    const { user } = useAuthStatus();
    const { data, isLoading, isError, error, refetch, isFetching } = useGetVehicleReviews(cid, page, PAGE_SIZE);

    const reviews = data?.items ?? [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages ?? 1;

    if (isLoading) {
        return (
            <div className="mt-8 flex items-center justify-center py-12">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="mt-8">
                <QueryError
                    title="Couldn't load reviews"
                    message="We couldn't load reviews for this vehicle."
                    error={error}
                    onRetry={() => void refetch()}
                    isRetrying={isFetching}
                />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-muted/20 mt-8 rounded-xl border px-6 py-8 text-center">
                <p className="text-muted-foreground font-semibold">No community reviews have been recorded for this item yet. Be the first!</p>
            </div>
        );
    }

    return (
        <div className="mt-12 flex flex-col gap-6">
            <div className={cn("flex flex-col gap-4", isFetching && "opacity-60 transition-opacity")}>
                {reviews.map((review) => {
                    const isOwnReview = user != null && review.author.user_id === user.user_id;
                    const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });

                    return (
                        <div
                            key={review.review_id}
                            className={cn(
                                "flex gap-4 rounded-2xl border p-4 sm:gap-6 sm:p-5",
                                isOwnReview
                                    ? "border-amber-200 bg-amber-50 text-amber-950 shadow-sm"
                                    : "border-transparent bg-transparent"
                            )}
                        >
                            <div
                                className={cn(
                                    "border-border flex size-12 shrink-0 items-center justify-center rounded-full border sm:size-16",
                                    isOwnReview ? "border-amber-200 bg-amber-100/80" : "bg-muted/50"
                                )}
                            >
                                <User className={cn("size-6 opacity-50 sm:size-8", isOwnReview ? "text-amber-700" : "text-muted-foreground")} />
                            </div>

                            <div className="flex w-full flex-col">
                                <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="text-base font-bold sm:text-lg">
                                            {review.author.first_name} {review.author.last_name}
                                        </h5>
                                        {isOwnReview ? (
                                            <Badge className="rounded-full border-transparent bg-amber-200/80 px-2 py-0 text-[10px] font-semibold text-amber-900 hover:bg-amber-200/80">
                                                Your review
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`size-3 sm:size-4 ${
                                                    i < review.rating
                                                        ? isOwnReview
                                                            ? "fill-amber-500 text-amber-500"
                                                            : "fill-primary text-primary"
                                                        : "fill-muted text-muted"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className={cn("mb-4 text-xs font-medium", isOwnReview ? "text-amber-800/70" : "text-muted-foreground")}>
                                    {formattedDate}
                                </span>
                                {review.title ? <h6 className="mb-2 text-sm font-bold">{review.title}</h6> : null}
                                <p className={cn("text-sm leading-relaxed", isOwnReview ? "text-amber-950/80" : "text-muted-foreground")}>
                                    {review.body}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-4 pt-4">
                    <Button type="button" variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
                        Previous
                    </Button>
                    <span className="text-muted-foreground text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!pagination?.hasNext || isFetching}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
