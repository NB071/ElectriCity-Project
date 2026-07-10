// Chatbot Prompt Validation
// Validates chat prompts and Gemini tool call arguments

import { z } from "zod";
import { ValidationError } from "../../utils/errors.js";
import { aiConfig } from "../../configs/ai.js";
import { TOOLS, VALIDATIONS } from "./constants.js";

const ALL_TEMPLATE_NAMES = VALIDATIONS.TEMPLATE_NAMES;
const TOOL_NAMES = VALIDATIONS.TOOL_NAMES;

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
const positiveInt = z.coerce.number().int().positive();
const nonNegativeNumber = z.coerce.number().min(0);

const vehicleFilterArgsSchema = z.object({
    brand_id: positiveInt.optional(),
    model_id: positiveInt.optional(),
    condition: z.enum(VALIDATIONS.TOOL_ARGS.VEHICLE_CONDITIONS).optional(),
    year_min: z.coerce.number().int().optional(),
    year_max: z.coerce.number().int().optional(),
    price_min: nonNegativeNumber.optional(),
    price_max: nonNegativeNumber.optional(),
    mileage_max: z.coerce.number().int().min(0).optional(),
    body_shape: z.string().min(1).optional(),
    drivetrain: z.string().min(1).optional(),
    sort: z.enum(VALIDATIONS.TOOL_ARGS.SORT_VALUES).optional(),
    page: z.coerce
        .number()
        .int()
        .min(VALIDATIONS.TOOL_ARGS.PAGE_MIN)
        .max(VALIDATIONS.TOOL_ARGS.PAGE_MAX)
        .optional(),
    limit: z.coerce
        .number()
        .int()
        .min(VALIDATIONS.TOOL_ARGS.LIMIT_MIN)
        .max(VALIDATIONS.TOOL_ARGS.LIMIT_MAX)
        .optional(),
});

const vehicleReferenceArgsSchema = z
    .object({
        cid: positiveInt.optional(),
        model_name: z
            .string()
            .min(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MIN)
            .max(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MAX)
            .optional(),
        brand_name: z
            .string()
            .min(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MIN)
            .max(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MAX)
            .optional(),
        condition: z.enum(VALIDATIONS.TOOL_ARGS.VEHICLE_CONDITIONS).optional(),
        year: z.coerce.number().int().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.cid == null && !data.model_name?.trim()) {
            ctx.addIssue({
                code: "custom",
                message: "Either cid or model_name is required.",
                path: ["model_name"],
            });
        }
    });

const TOOL_ARG_SCHEMAS = {
    [TOOLS.BROWSE_VEHICLES]: vehicleFilterArgsSchema,

    [TOOLS.SEARCH_VEHICLES]: vehicleFilterArgsSchema.extend({
        q: z
            .string({ required_error: "q is required." })
            .min(
                VALIDATIONS.TOOL_ARGS.SEARCH_MIN,
                "Search query cannot be blank.",
            )
            .max(
                VALIDATIONS.TOOL_ARGS.SEARCH_MAX,
                `Search query must not exceed ${VALIDATIONS.TOOL_ARGS.SEARCH_MAX} characters.`,
            ),
    }),

    [TOOLS.GET_VEHICLE_DETAILS]: vehicleReferenceArgsSchema,

    [TOOLS.GET_CUSTOMIZATION_OPTIONS]: vehicleReferenceArgsSchema,

    [TOOLS.COMPARE_VEHICLES]: z
        .object({
            cids: z
                .array(positiveInt)
                .max(VALIDATIONS.TOOL_ARGS.COMPARE_MAX)
                .optional(),
            models: z
                .array(
                    z.object({
                        model_name: z
                            .string()
                            .min(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MIN)
                            .max(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MAX),
                        brand_name: z
                            .string()
                            .min(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MIN)
                            .max(VALIDATIONS.TOOL_ARGS.MODEL_NAME_MAX)
                            .optional(),
                        condition: z
                            .enum(VALIDATIONS.TOOL_ARGS.VEHICLE_CONDITIONS)
                            .optional(),
                        year: z.coerce.number().int().optional(),
                    }),
                )
                .max(VALIDATIONS.TOOL_ARGS.COMPARE_MAX)
                .optional(),
        })
        .superRefine((data, ctx) => {
            const cidCount = data.cids?.length ?? 0;
            const modelCount = data.models?.length ?? 0;
            const total = cidCount + modelCount;

            if (total < VALIDATIONS.TOOL_ARGS.COMPARE_MIN) {
                ctx.addIssue({
                    code: "custom",
                    message: `Compare requires at least ${VALIDATIONS.TOOL_ARGS.COMPARE_MIN} vehicles via cids and/or models.`,
                    path: ["models"],
                });
            }

            if (total > VALIDATIONS.TOOL_ARGS.COMPARE_MAX) {
                ctx.addIssue({
                    code: "custom",
                    message: `Compare supports at most ${VALIDATIONS.TOOL_ARGS.COMPARE_MAX} vehicles.`,
                    path: ["models"],
                });
            }
        }),

    [TOOLS.GET_STORE_FAQ]: z
        .object({
            topic: z.enum(VALIDATIONS.TOOL_ARGS.FAQ_TOPICS).optional(),
            query: z
                .string()
                .min(VALIDATIONS.TOOL_ARGS.FAQ_QUERY_MIN)
                .max(VALIDATIONS.TOOL_ARGS.FAQ_QUERY_MAX)
                .optional(),
        })
        .superRefine((data, ctx) => {
            if (!data.topic && !data.query?.trim()) {
                ctx.addIssue({
                    code: "custom",
                    message: "Either topic or query is required.",
                    path: ["query"],
                });
            }
        }),
};

const REQUIRED_VARS = {
    "product-inquiry": z.object({
        cid: positiveInt.optional(),
        model_name: z.string().min(1).optional(),
        item_name: z.string().min(1).optional(),
        base_price: nonNegativeNumber.optional(),
    }),

    "cart-assist": z.object({
        cart_id: positiveInt.optional(),
        item_count: z.coerce.number().int().min(0).optional(),
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
 * This function validates the chat prompt.
 * @param {object} promptData
 * @returns {object}
 * @throws {ValidationError}
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

/**
 * This function validates the tool arguments.
 * @param {string} toolName
 * @param {object} args
 * @returns {object}
 * @throws {ValidationError}
 */
function validateToolArgs(toolName, args = {}) {
    if (!TOOL_NAMES.includes(toolName)) {
        throw new ValidationError(
            `Unknown tool "${toolName}". Allowed: ${TOOL_NAMES.join(", ")}`,
        );
    }

    const schema = TOOL_ARG_SCHEMAS[toolName];
    const parsed = schema.safeParse(args);

    if (!parsed.success) {
        const message = parsed.error.issues
            .map(
                (issue) =>
                    `tool "${toolName}" arg "${issue.path.join(".")}": ${issue.message}`,
            )
            .join(", ");

        throw new ValidationError(message, parsed.error.issues);
    }

    return parsed.data;
}

/**
 * Builds a compact summary when a tool result is too large for Gemini.
 * @param {unknown} result
 * @returns {object}
 */
function summarizeToolResult(result) {
    const summary = {};

    if (result == null || typeof result !== "object") {
        return summary;
    }

    for (const [key, value] of Object.entries(result)) {
        if (Array.isArray(value)) {
            summary[`${key}_count`] = value.length;
        }
    }

    if (typeof result.topic === "string") {
        summary.topic = result.topic;
    }

    if (typeof result.title === "string") {
        summary.title = result.title;
    }

    if (typeof result.answer === "string") {
        summary.answer_preview = `${result.answer.slice(0, 240)}...`;
    }

    return summary;
}

/**
 * This function serializes the tool result.
 * @param {unknown} result Result to serialize.
 * @returns {object}
 */
function encodeToolResult(result) {
    const serialized = JSON.stringify(result ?? {});

    if (serialized.length <= aiConfig.maxToolResultChars) {
        return JSON.parse(serialized);
    }

    return {
        truncated: true,
        message: `Tool result exceeded ${aiConfig.maxToolResultChars} characters and was summarized.`,
        original_size_chars: serialized.length,
        ...summarizeToolResult(result),
    };
}

export default validateChatPrompt;

export { validateChatPrompt, validateToolArgs, encodeToolResult };
