// Email Template Validation
// This file is used for validattion of email templates used within the email builder

import { z } from "zod";
import { ValidationError } from "../../utils/errors.js";
import { TEMPLATES, VALIDATIONS } from "./constants.js";

const ALL_TEMPLATE_NAMES = VALIDATIONS.TEMPLATE_NAMES;

const REQUIRED_VARS = {
    [TEMPLATES.WELCOME]: z.object({ fname: z.string().min(1) }),
    [TEMPLATES.ORDER_CONFIRM]: z.object({
        fname: z.string().min(1),
        orderId: z.string().min(1),
        items: z.array(
            z.object({
                name: z.string().min(1),
                quantity: z.number().int().min(1),
                price: z.number().min(0),
            }),
        ),
        total: z.number().min(0),
    }),
    [TEMPLATES.ACCOUNT_DELETION]: z.object({ fname: z.string().min(1) }),
};

/**
 * @helper_function
 * @private
 * @param {import("zod").ZodError} zodError
 * @throws {ValidationError}
 * @see https://zod.dev/error-customization
 */
function throwValidationError(zodError) {
    const message = zodError.issues
        .map((issue) =>
            issue.path.length > 0
                ? `"${issue.path.join(".")}" : ${issue.message}`
                : issue.message,
        )
        .join(", ");

    throw new ValidationError(message, zodError.issues);
}

// Email data schema
const emailSchema = z.object({
    to: z.email("Invalid recipient (to) email address."),

    subject: z
        .string({ required_error: "Subject is required." })
        .min(1, "Subject cannot be blank.")
        .max(
            VALIDATIONS.SUBJECT_MAX_LENGTH,
            `Subject exceeds maximum length of ${VALIDATIONS.SUBJECT_MAX_LENGTH} characters.`,
        ),

  // source: https://zod.dev/v4?id=simplified-error-customization#simplified-error-customization
    template: z.enum(ALL_TEMPLATE_NAMES, {
        error: () => ({
            message: `Unknown template. Allowed: ${ALL_TEMPLATE_NAMES.join(", ")}`,
        }),
    }),

    // list of variables for the email template. Will validate against REQUIRED_VARS[template]
    vars: z.record(z.string(), z.any()),
});

/**
 * This function validates the email data.
 * @param {object} emailData The email data to validate.
 * @returns {object} The validated email data.
 * @throws {ValidationError} If the email data is invalid.
 */
function validateEmail(emailData) {
    //1. validate the top-level shape
    const parsed = emailSchema.safeParse(emailData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    //2. validate vars against the specific template's schema
    const { template, vars } = parsed.data;
    const varsSchema = REQUIRED_VARS[template];
    const varsParsed = varsSchema.safeParse(vars);

    if (!varsParsed.success) {
        throwValidationError(varsParsed.error);
    }

    return parsed.data;
}

export default validateEmail;
