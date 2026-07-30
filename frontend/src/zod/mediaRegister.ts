import { z } from "zod";

const mediaPathOrUrl = z
    .string()
    .trim()
    .min(1, "Media URL is required")
    .max(500, "URL exceeds 500 characters")
    .refine((value) => /^https?:\/\//i.test(value) || value.startsWith("/"), {
        message: "Must be an absolute URL or a path starting with /",
    });

export const mediaRegisterSchema = z.object({
    url: mediaPathOrUrl,
    file_type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"], {
        error: "Please select a valid file format",
    }),
    alt_text: z.string().max(255, "Alt text exceeds 255 characters").optional(),
    cid: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().int().positive("Catalog ID must be a positive integer").optional(),
    ),
});

export type MediaRegisterValues = z.infer<typeof mediaRegisterSchema>;
