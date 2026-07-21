import { z } from "zod";

export const createReviewSchema = z.object({
    title: z.string().max(150, "Title must be at most 150 characters").optional().or(z.literal("")),
    body: z
        .string({
            error: "Comment is required",
        })
        .trim()
        .min(1, "Comment is required")
        .max(1000, "Comment cannot exceed 1000 characters"),
    rating: z.coerce
        .number({
            error: "Please provide a rating",
        })
        .int()
        .min(1, "Please provide a rating")
        .max(5, "Rating cannot exceed 5"),
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;
