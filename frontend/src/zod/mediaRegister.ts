import { z } from "zod";

export const mediaRegisterSchema = z.object({
    url: z.url("Must be a valid URL").max(500, "URL exceeds 500 characters"),
    file_type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"], {
        error: "Please select a valid file format",
    }),
    alt_text: z.string().max(255, "Alt text exceeds 255 characters").optional(),
    cid: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().int().positive("Catalog ID must be a positive integer").optional()
    ),
});

export type MediaRegisterValues = z.infer<typeof mediaRegisterSchema>;
