import { useState } from "react";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Star, ArrowUpRight } from "lucide-react";
import { createReviewSchema, type CreateReviewFormValues } from "@/zod/create-review";

export function LeaveReviewForm({ cid }: { cid: number }) {
    const [hoverRating, setHoverRating] = useState(0);

    const formik = useFormik<CreateReviewFormValues>({
        initialValues: {
            title: "",
            body: "",
            rating: 0,
        },
        validationSchema: toFormikValidationSchema(createReviewSchema),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log("Submitting review for CID", cid, values);
            // Simulate network request
            await new Promise((r) => setTimeout(r, 800));
            alert("Review submitted successfully! (Mocked)");
            resetForm();
            setHoverRating(0);
            setSubmitting(false);
        },
    });

    return (
        <div className="border-border bg-card mt-16 max-w-3xl rounded-2xl border p-6 shadow-sm md:p-10">
            <h4 className="mb-2 text-2xl font-bold">Leave a Review</h4>
            <p className="text-muted-foreground mb-8 text-sm">Your email address will not be published. Required fields are marked *</p>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                {/* Star Rating Picker */}
                <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground text-sm font-semibold">Your Rating *</span>
                    <div className="flex cursor-pointer items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div
                                key={star}
                                className="p-1 transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => formik.setFieldValue("rating", star)}
                            >
                                <Star
                                    className={`size-6 ${
                                        star <= (hoverRating || formik.values.rating) ? "fill-primary text-primary" : "fill-muted text-muted"
                                    }`}
                                />
                            </div>
                        ))}
                    </div>
                    {formik.touched.rating && formik.errors.rating && (
                        <span className="text-destructive text-xs font-medium">{formik.errors.rating as string}</span>
                    )}
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground ml-1 text-xs font-semibold">Title</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Good Cars"
                        value={formik.values.title || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border-input bg-background ring-offset-background focus-visible:ring-ring flex h-12 w-full rounded-lg border px-4 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                            formik.touched.title && formik.errors.title ? "border-destructive" : ""
                        }`}
                    />
                    {formik.touched.title && formik.errors.title && (
                        <span className="text-destructive ml-1 text-xs">{formik.errors.title as string}</span>
                    )}
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground ml-1 text-xs font-semibold">Comment *</label>
                    <textarea
                        name="body"
                        placeholder="Write your comment here..."
                        rows={6}
                        value={formik.values.body}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border-input bg-background ring-offset-background focus-visible:ring-ring flex w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                            formik.touched.body && formik.errors.body ? "border-destructive" : ""
                        }`}
                    />
                    {formik.touched.body && formik.errors.body && (
                        <span className="text-destructive ml-1 text-xs">{formik.errors.body as string}</span>
                    )}
                </div>

                <div className="mt-2">
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="text-primary-foreground focus-visible:ring-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-medium shadow transition-colors hover:bg-blue-600/90 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                        {formik.isSubmitting ? "Posting..." : "Post Comment"}
                        <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
