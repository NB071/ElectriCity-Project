import { z } from "zod";

export const baseCheckoutSchema = z.object({
    firstName: z.string().min(1, "First Name is required").max(50, "First Name is too long"),
    lastName: z.string().min(1, "Last Name is required").max(50, "Last Name is too long"),
    companyName: z.string().optional(),
    country: z
        .string()
        .min(1, "Country / Region is required")
        .regex(/^[^0-9]*$/, "Numbers are not allowed"),
    street: z.string().min(1, "House number and street name are required").max(100, "Street is too long"),
    apartment: z.string().optional(),
    city: z
        .string()
        .min(1, "Town / City is required")
        .max(50, "City is too long")
        .regex(/^[^0-9]*$/, "Numbers are not allowed"),
    province: z
        .string()
        .min(1, "State is required")
        .max(50, "State is too long")
        .regex(/^[^0-9]*$/, "Numbers are not allowed"),
    postal_code: z.string().min(1, "Zip Code is required").max(20, "Zip Code is too long"),
    phone: z.string().max(30, "Phone is too long").optional(),
    shipping_country: z
        .string()
        .regex(/^[^0-9]*$/, "Numbers are not allowed")
        .optional(),
    shipping_street: z.string().optional(),
    shipping_city: z
        .string()
        .regex(/^[^0-9]*$/, "Numbers are not allowed")
        .optional(),
    shipping_province: z
        .string()
        .regex(/^[^0-9]*$/, "Numbers are not allowed")
        .optional(),
    shipping_postal_code: z.string().optional(),
    sameAsPersonal: z.boolean().default(true),
    additional_information: z.string().max(1000, "Notes are too long").optional(),
    paymentMethod: z.enum(["credit", "debit", "apple_pay"] as const, {
        message: "Please select a payment method",
    }),
    card_number: z.string().optional(),
    expiry_month: z.string().optional(),
    expiry_year: z.string().optional(),
    cvv: z.string().optional(),
    cardholder_name: z.string().optional(),
});

export const getCheckoutSchema = (isGuest: boolean) =>
    baseCheckoutSchema
        .extend({
            email: isGuest
                ? z.email({ message: "Invalid email address" })
                : z.email({ message: "Invalid email address" }).optional().or(z.literal("")),
        })
        .superRefine((data, ctx) => {
            if (data.paymentMethod === "credit" || data.paymentMethod === "debit") {
                if (!data.card_number || data.card_number.replace(/\s/g, "").length < 13 || data.card_number.replace(/\s/g, "").length > 19) {
                    ctx.addIssue({ code: "custom", message: "Valid card number required", path: ["card_number"] });
                }
                const month = parseInt(data.expiry_month || "0", 10);
                if (!data.expiry_month || data.expiry_month.length > 2 || month < 1 || month > 12) {
                    ctx.addIssue({ code: "custom", message: "Valid month (01-12) required", path: ["expiry_month"] });
                }
                if (!data.expiry_year || data.expiry_year.length < 2 || data.expiry_year.length > 4) {
                    ctx.addIssue({ code: "custom", message: "Valid year required", path: ["expiry_year"] });
                }
                if (!data.cvv || data.cvv.length < 3 || data.cvv.length > 4) {
                    ctx.addIssue({ code: "custom", message: "Valid CVV (3-4 digits) required", path: ["cvv"] });
                }
                if (!data.cardholder_name || data.cardholder_name.trim() === "") {
                    ctx.addIssue({ code: "custom", message: "Cardholder name is required", path: ["cardholder_name"] });
                } else if (/\d/.test(data.cardholder_name)) {
                    ctx.addIssue({ code: "custom", message: "Cardholder name cannot contain numbers", path: ["cardholder_name"] });
                }
            }

            if (!data.sameAsPersonal) {
                if (!data.shipping_street || data.shipping_street.trim() === "") {
                    ctx.addIssue({ code: "custom", message: "Mailing Address is required", path: ["shipping_street"] });
                }
                if (!data.shipping_city || data.shipping_city.trim() === "") {
                    ctx.addIssue({ code: "custom", message: "City is required", path: ["shipping_city"] });
                }
                if (!data.shipping_postal_code || data.shipping_postal_code.trim() === "") {
                    ctx.addIssue({ code: "custom", message: "Post Code is required", path: ["shipping_postal_code"] });
                }
                if (!data.shipping_country || data.shipping_country.trim() === "") {
                    ctx.addIssue({ code: "custom", message: "Country is required", path: ["shipping_country"] });
                }
                if (!data.shipping_province || data.shipping_province.trim() === "") {
                    ctx.addIssue({ code: "custom", message: "Region/State is required", path: ["shipping_province"] });
                }
            }
        });

export type CheckoutFormValues = z.infer<typeof baseCheckoutSchema> & { email?: string; sameAsPersonal: boolean };
