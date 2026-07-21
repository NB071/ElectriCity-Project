import { z } from "zod";

export const ValidSortValues = ["price_asc", "price_desc", "year_desc", "year_asc", "mileage_asc", "mileage_desc", "added_desc"] as const;

export type SortValue = (typeof ValidSortValues)[number];

export const VehicleConditions = ["new", "used"] as const;

export const BrowseCatalogSchema = z
    .object({
        q: z.string().optional(),
        brand_id: z.number().positive().optional(),
        model_id: z.number().positive().optional(),
        condition: z.enum(VehicleConditions).optional(),
        year_min: z.number().int().min(1900).optional(),
        year_max: z
            .number()
            .int()
            .max(new Date().getFullYear() + 1)
            .optional(),
        price_min: z.number().min(0).optional(),
        price_max: z.number().min(0).optional(),
        mileage_max: z.number().int().min(0).optional(),
        body_shape: z.array(z.string()).optional(),
        drivetrain: z.string().optional(),
        exterior_color: z.string().optional(),
        interior_color: z.string().optional(),
        promo: z.enum(["hot_deal", "seasonal", "clearance", "featured"]).optional(),
        sort: z.enum(ValidSortValues).default("added_desc"),
    })
    .refine(
        (data) => {
            if (data.year_min && data.year_max) {
                return data.year_min <= data.year_max;
            }
            return true;
        },
        {
            message: "Minimum year must be less than or equal to maximum year",
            path: ["year_min"],
        }
    )
    .refine(
        (data) => {
            if (data.price_min && data.price_max) {
                return data.price_min <= data.price_max;
            }
            return true;
        },
        {
            message: "Minimum price must be less than or equal to maximum price",
            path: ["price_min"],
        }
    );

export type BrowseCatalogFilters = z.infer<typeof BrowseCatalogSchema>;
