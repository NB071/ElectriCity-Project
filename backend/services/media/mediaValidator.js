// Media Validation
// This file is used for validation of media uploads and catalog image linking

import { z } from "zod";
import { VALIDATIONS } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";

const ALL_ALLOWED_TYPES = [
    ...VALIDATIONS.ALLOWED_FILE_TYPES.IMAGE,
    ...VALIDATIONS.ALLOWED_FILE_TYPES.PDF,
];

const mediaUrlSchema = z
    .string({ required_error: "Media URL is required." })
    .min(1, "Media URL cannot be blank.")
    .max(
        VALIDATIONS.MAX_URL_LENGTH,
        `Media URL must not exceed ${VALIDATIONS.MAX_URL_LENGTH} characters.`,
    );

const mediaAltTextSchema = z
    .string()
    .max(
        VALIDATIONS.MAX_ALT_TEXT_LENGTH,
        `Alt text must not exceed ${VALIDATIONS.MAX_ALT_TEXT_LENGTH} characters.`,
    )
    .nullable()
    .optional();

const mediaSchema = z.object({
    url: mediaUrlSchema,

    file_type: z.enum(ALL_ALLOWED_TYPES, {
        error: () => ({
            message: `Unsupported file type. Allowed: ${ALL_ALLOWED_TYPES.join(", ")}`,
        }),
    }),

    alt_text: mediaAltTextSchema,
});

const imageMediaSchema = z.object({
    url: mediaUrlSchema,

    file_type: z.enum(VALIDATIONS.ALLOWED_FILE_TYPES.IMAGE, {
        error: () => ({
            message: `Unsupported image file type. Allowed: ${VALIDATIONS.ALLOWED_FILE_TYPES.IMAGE.join(", ")}`,
        }),
    }),

    alt_text: mediaAltTextSchema,
});

const pdfMediaSchema = z.object({
    url: mediaUrlSchema,

    file_type: z.enum(VALIDATIONS.ALLOWED_FILE_TYPES.PDF, {
        error: () => ({
            message: `Unsupported PDF file type. Allowed: ${VALIDATIONS.ALLOWED_FILE_TYPES.PDF.join(", ")}`,
        }),
    }),

    alt_text: mediaAltTextSchema,

    is_primary: z
        .boolean()
        .refine((value) => value !== true, {
            message: "PDF media cannot be set as the primary catalog image.",
        })
        .optional(),
});

const catalogImageSchema = z.object({
    cid: z
        .coerce.number({ required_error: "Catalog item ID (cid) is required." })
        .int("cid must be an integer.")
        .positive("cid must be a positive integer."),

    media_id: z.coerce
        .number({ required_error: "Media ID is required." })
        .int("media_id must be an integer.")
        .positive("media_id must be a positive integer."),

    display_order: z
        .number()
        .int("display_order must be an integer.")
        .min(0, "display_order must be at least 0.")
        .max(
            VALIDATIONS.MAX_DISPLAY_ORDER,
            `display_order must not exceed ${VALIDATIONS.MAX_DISPLAY_ORDER}.`,
        )
        .optional(),

    is_primary: z.boolean().optional(),
});

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

// Validators

/**
 * This function validates the input for a new media record.
 * @param {object} mediaData The media data to validate
 * @returns {object} The validated media data
 * @throws {ValidationError} If the media data is invalid
 */
function validateMediaInput(mediaData) {
    const parsed = mediaSchema.safeParse(mediaData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates image media input for ImageStrategy.record().
 * @param {object} mediaData
 * @returns {object}
 * @throws {ValidationError} If the media data is invalid
 */
function validateImageMediaInput(mediaData) {
    const parsed = imageMediaSchema.safeParse(mediaData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates PDF media input for PdfStrategy.record().
 * @param {object} mediaData
 * @returns {object}
 * @throws {ValidationError} If the media data is invalid
 */
function validatePdfMediaInput(mediaData) {
    const parsed = pdfMediaSchema.safeParse(mediaData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates the input for a new catalog image record.
 * @param {object} linkData The catalog image data to validate
 * @returns {object} The validated catalog image data
 * @throws {ValidationError} If the catalog image data is invalid
 */
function validateCatalogImageInput(linkData) {
    const parsed = catalogImageSchema.safeParse(linkData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export {
    validateMediaInput,
    validateImageMediaInput,
    validatePdfMediaInput,
    validateCatalogImageInput,
};
