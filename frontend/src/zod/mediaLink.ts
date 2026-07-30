import { z } from "zod";

export const mediaLinkSchema = z.object({
    cid: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number({ error: "Target CID is required" }).int().positive("Catalog ID must be a positive integer")
    ),
});

export type MediaLinkValues = z.infer<typeof mediaLinkSchema>;
