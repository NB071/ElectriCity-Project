// Chatbot Prompt Validation
// This file is used for validation of prompt templates used within the prompt builder

import { z } from "zod";
import { ValidationError } from "../../utils/errors.js";
import { VALIDATIONS } from "./constants.js";

const ALL_TEMPLATE_NAMES = VALIDATIONS.TEMPLATE_NAMES;

/**
 * @helper_function
 * @private
 * @param {import("zod").ZodError} zodError
 * @throws {ValidationError}
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

// schema(s)
const REQUIRED_VARS = {
    "product-inquiry": z.object({
        cid: z.coerce
            .number({ required_error: "cid is required." })
            .int("cid must be an integer.")
            .positive("cid must be a positive integer."),
        item_name: z.string().min(1, "item_name is required.").optional(),
        base_price: z.coerce.number().min(0).optional(),
    }),

    "cart-assist": z.object({
        cart_id: z.coerce
            .number()
            .int("cart_id must be an integer.")
            .positive("cart_id must be a positive integer.")
            .optional(),
        item_count: z.coerce
            .number()
            .int("item_count must be an integer.")
            .min(0)
            .optional(),
    }),

    "general-support": z.object({}),
};

const contextBlockSchema = z
    .string()
    .min(1, "Context block cannot be blank.")
    .max(
        VALIDATIONS.CONTEXT_BLOCK.MAX_LENGTH,
        `Context block exceeds maximum length of ${VALIDATIONS.CONTEXT_BLOCK.MAX_LENGTH} characters.`,
    );

const chatPromptSchema = z.object({
    template: z.enum(ALL_TEMPLATE_NAMES, {
        error: () => ({
            message: `Unknown template. Allowed: ${ALL_TEMPLATE_NAMES.join(", ")}`,
        }),
    }),

    userMessage: z
        .string({ required_error: "userMessage is required." })
        .min(VALIDATIONS.USER_MESSAGE.MIN, "userMessage cannot be blank.")
        .max(
            VALIDATIONS.USER_MESSAGE.MAX,
            `userMessage exceeds maximum length of ${VALIDATIONS.USER_MESSAGE.MAX} characters.`,
        ),

    vars: z.record(z.string(), z.any()).default({}),

    context: z
        .array(contextBlockSchema)
        .max(
            VALIDATIONS.CONTEXT_BLOCK.MAX,
            `context cannot contain more than ${VALIDATIONS.CONTEXT_BLOCK.MAX} blocks.`,
        )
        .default([]),
});

/**
 * This function validates chat prompt input before the director builds messages.
 * @param {object} promptData
 * @param {string} promptData.template
 * @param {string} promptData.userMessage
 * @param {object} [promptData.vars]
 * @param {string[]} [promptData.context]
 * @returns {object} Validated prompt data
 * @throws {ValidationError} If the prompt data is invalid
 */
function validateChatPrompt(promptData) {
    const parsed = chatPromptSchema.safeParse(promptData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    const { template, vars } = parsed.data;
    const varsSchema = REQUIRED_VARS[template];
    const varsParsed = varsSchema.safeParse(vars);

    if (!varsParsed.success) {
        const message = varsParsed.error.issues
            .map(
                (issue) =>
                    `"${issue.path.join(".")}" for template "${template}": ${issue.message}`,
            )
            .join(", ");

        throw new ValidationError(message, varsParsed.error.issues);
    }

    return {
        ...parsed.data,
        vars: varsParsed.data,
    };
}

export default validateChatPrompt;

export { validateChatPrompt };
