import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Star, ArrowUpRight, BadgeCheck } from "lucide-react";
import { createReviewSchema, type CreateReviewFormValues } from "@/zod/create-review";
import { useSubmitReview } from "@/hooks/api/review/use-review-mutations";
import { useGetCustomerReviews } from "@/hooks/api/review/use-customer-reviews";
import { useAuthStatus } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LeaveReviewForm({ cid }: { cid: number }) {
    const [hoverRating, setHoverRating] = useState(0);
    const { user, status } = useAuthStatus();
    const isCustomer = status === "authenticated" && user?.role === "customer";
    const submitReview = useSubmitReview(cid);

    const { data: myReviewsData } = useGetCustomerReviews(1, 100, {
        enabled: isCustomer,
    });
    const existingReview = myReviewsData?.items.find((review) => review.catalog_item.cid === cid) ?? null;
    const alreadyReviewed = existingReview != null;

    const formik = useFormik<CreateReviewFormValues>({
        initialValues: {
            title: "",
            body: "",
            rating: 0,
        },
        validationSchema: toFormikValidationSchema(createReviewSchema),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            if (alreadyReviewed) {
                setSubmitting(false);
                return;
            }

            try {
                const title = values.title?.trim();
                await submitReview.mutateAsync({
                    body: {
                        title: title ? title : null,
                        body: values.body.trim(),
                        rating: values.rating,
                    },
                });
                resetForm();
                setHoverRating(0);
            } catch {
                // Toast handled in mutation onError
            } finally {
                setSubmitting(false);
            }
        },
    });

    if (status === "unknown") {
        return null;
    }

    if (status !== "authenticated" || user == null) {
        return (
            <div className="border-border bg-card mt-16 max-w-3xl rounded-2xl border p-6 shadow-sm md:p-10">
                <h4 className="mb-2 text-2xl font-bold">Leave a Review</h4>
                <p className="text-muted-foreground mb-6 text-sm">Sign in with a customer account to share your experience with this vehicle.</p>
                <Button asChild>
                    <Link to="/auth/login">Sign in to review</Link>
                </Button>
            </div>
        );
    }

    if (user.role !== "customer") {
        return (
            <div className="border-border bg-card mt-16 max-w-3xl rounded-2xl border p-6 shadow-sm md:p-10">
                <h4 className="mb-2 text-2xl font-bold">Leave a Review</h4>
                <p className="text-muted-foreground text-sm">Only customer accounts can publish reviews on catalog items.</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "border-border bg-card relative mt-16 max-w-3xl overflow-hidden rounded-2xl border p-6 shadow-sm md:p-10",
                alreadyReviewed && "border-amber-300 ring-2 ring-amber-400/25"
            )}
        >
            {alreadyReviewed ? (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
                    <BadgeCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold">You already reviewed this vehicle</p>
                        <p className="mt-1 text-sm text-amber-900/80">
                            {existingReview.title ? (
                                <>
                                    Your review <span className="font-medium">“{existingReview.title}”</span> is published
                                </>
                            ) : (
                                "Your review is published"
                            )}
                            {existingReview.rating ? ` · ${existingReview.rating}/5 stars` : null}. Only one review is allowed per vehicle.
                        </p>
                    </div>
                </div>
            ) : null}

            <div className={cn(alreadyReviewed && "pointer-events-none select-none blur-[2px]")}>
                <h4 className="mb-2 text-2xl font-bold">Leave a Review</h4>
                <p className="text-muted-foreground mb-8 text-sm">Required fields are marked *</p>

                <form
                    onSubmit={formik.handleSubmit}
                    aria-disabled={alreadyReviewed}
                    className="flex flex-col gap-6"
                >
                    <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground text-sm font-semibold">Your Rating *</span>
                        <div className="flex cursor-pointer items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    disabled={alreadyReviewed}
                                    className="p-1 transition-transform hover:scale-110 disabled:hover:scale-100"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => formik.setFieldValue("rating", star)}
                                    aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                                >
                                    <Star
                                        className={`size-6 ${
                                            star <= (hoverRating || formik.values.rating) ? "fill-primary text-primary" : "fill-muted text-muted"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {formik.touched.rating && formik.errors.rating ? (
                            <span className="text-destructive text-xs font-medium">{formik.errors.rating as string}</span>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground ml-1 text-xs font-semibold" htmlFor={`review-title-${cid}`}>
                            Title
                        </label>
                        <input
                            id={`review-title-${cid}`}
                            type="text"
                            name="title"
                            placeholder="Good Cars"
                            disabled={alreadyReviewed}
                            value={formik.values.title || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`border-input bg-background ring-offset-background focus-visible:ring-ring flex h-12 w-full rounded-lg border px-4 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60 ${
                                formik.touched.title && formik.errors.title ? "border-destructive" : ""
                            }`}
                        />
                        {formik.touched.title && formik.errors.title ? (
                            <span className="text-destructive ml-1 text-xs">{formik.errors.title as string}</span>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground ml-1 text-xs font-semibold" htmlFor={`review-body-${cid}`}>
                            Comment *
                        </label>
                        <textarea
                            id={`review-body-${cid}`}
                            name="body"
                            placeholder="Write your comment here..."
                            rows={6}
                            disabled={alreadyReviewed}
                            value={formik.values.body}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`border-input bg-background ring-offset-background focus-visible:ring-ring flex w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60 ${
                                formik.touched.body && formik.errors.body ? "border-destructive" : ""
                            }`}
                        />
                        {formik.touched.body && formik.errors.body ? (
                            <span className="text-destructive ml-1 text-xs">{formik.errors.body as string}</span>
                        ) : null}
                    </div>

                    <div className="mt-2">
                        <button
                            type="submit"
                            disabled={alreadyReviewed || formik.isSubmitting || submitReview.isPending}
                            className="text-primary-foreground focus-visible:ring-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-medium shadow transition-colors hover:bg-blue-600/90 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        >
                            {formik.isSubmitting || submitReview.isPending ? "Posting..." : "Post Comment"}
                            <ArrowUpRight className="size-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
