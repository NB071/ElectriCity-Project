// Analytics Validation
// This file is used for validation of analytics data

import { z } from "zod";
import { EVENT_IDS, EVENT_LIST, REPORT_DEFAULTS } from "../constants.js";
import { ValidationError } from "../../../utils/errors.js";

// array of all valid event IDs
const ALL_VALID_EVENT_IDS = Array.from(EVENT_IDS);

/**
 * Treat empty query-string values as omitted filters.
 * @helper_function
 * @private
 * @param {unknown} value
 * @returns {unknown}
 */
function emptyToUndefined(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return value;
}

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

// schema definition(s)
const eventSchema = z.object({
  event_type_id: z
    .number({ required_error: "event_type_id is required." })
    .int("event_type_id must be an integer.")
    .refine((id) => ALL_VALID_EVENT_IDS.includes(id), {
      message: `Unknown event_type_id. Allowed: ${ALL_VALID_EVENT_IDS.join(", ")}`,
    }),

  user_id: z.number().int().positive().nullable().optional(),

  cid: z.number().int().positive().nullable().optional(),

  ip_address: z.string().max(45).nullable().optional(),

  // dynamic json payload
  meta: z.record(z.string(), z.any()).nullable().optional(),
});

const reportParamsSchema = z
  .object({
    start: z.coerce
      .date({ error: "start must be a valid date (YYYY-MM-DD)." })
      .default(() => {
        const d = new Date();
        d.setDate(d.getDate() - REPORT_DEFAULTS.DAYS);
        return d;
      }),

    end: z.coerce
      .date({ error: "end must be a valid date (YYYY-MM-DD)." })
      .default(() => new Date()),

    limit: z.coerce
      .number()
      .int("limit must be an integer.")
      .positive("limit must be positive.")
      .max(100, "limit must not exceed 100.")
      .default(REPORT_DEFAULTS.LIMIT),
  })
  .refine((d) => d.start <= d.end, {
    message: "start date must be on or before end date.",
    path: ["start"],
  })
  .refine(
    (d) =>
      (d.end - d.start) / (1000 * 60 * 60 * 24) <=
      REPORT_DEFAULTS.MAX_RANGE_DAYS,
    {
      message: `date range must not exceed ${REPORT_DEFAULTS.MAX_RANGE_DAYS} days.`,
      path: ["end"],
    },
  )
  .transform((d) => ({
    start: d.start.toISOString().slice(0, 10),
    end: d.end.toISOString().slice(0, 10),
    limit: d.limit,
  }));

const eventListParamsSchema = z
  .object({
    start: z.coerce
      .date({ error: "start must be a valid date (YYYY-MM-DD)." })
      .default(() => {
        const d = new Date();
        d.setDate(d.getDate() - REPORT_DEFAULTS.DAYS);
        return d;
      }),

    end: z.coerce
      .date({ error: "end must be a valid date (YYYY-MM-DD)." })
      .default(() => new Date()),

    event_type_id: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int("event_type_id must be an integer.")
        .refine((id) => ALL_VALID_EVENT_IDS.includes(id), {
          message: `Unknown event_type_id. Allowed: ${ALL_VALID_EVENT_IDS.join(", ")}`,
        })
        .optional(),
    ),

    user_id: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int("user_id must be an integer.")
        .positive("user_id must be a positive integer.")
        .optional(),
    ),

    cid: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int("cid must be an integer.")
        .positive("cid must be a positive integer.")
        .optional(),
    ),

    q: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .min(
          EVENT_LIST.SEARCH.MIN_LENGTH,
          `q must be at least ${EVENT_LIST.SEARCH.MIN_LENGTH} character.`,
        )
        .max(
          EVENT_LIST.SEARCH.MAX_LENGTH,
          `q must be at most ${EVENT_LIST.SEARCH.MAX_LENGTH} characters.`,
        )
        .optional(),
    ),
  })
  .refine((d) => d.start <= d.end, {
    message: "start date must be on or before end date.",
    path: ["start"],
  })
  .refine(
    (d) =>
      (d.end - d.start) / (1000 * 60 * 60 * 24) <=
      REPORT_DEFAULTS.MAX_RANGE_DAYS,
    {
      message: `date range must not exceed ${REPORT_DEFAULTS.MAX_RANGE_DAYS} days.`,
      path: ["end"],
    },
  )
  .transform((d) => ({
    start: d.start.toISOString().slice(0, 10),
    end: d.end.toISOString().slice(0, 10),
    event_type_id: d.event_type_id,
    user_id: d.user_id,
    cid: d.cid,
    q: d.q,
  }));

// Validators
/**
 * This function validates the input for a new event record.
 * @param {object} eventData The event data to validate
 * @returns {object} The validated event data
 * @throws {ValidationError} If the event data is invalid
 */
function validateEvent(eventData) {
  const parsed = eventSchema.safeParse(eventData);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates an event log primary key.
 * @param {number|string} eventId
 * @returns {number}
 * @throws {ValidationError} If the event id is invalid
 */
function validateEventId(eventId) {
  const parsed = z.coerce
    .number()
    .int("event_id must be an integer.")
    .positive("event_id must be a positive integer.")
    .safeParse(eventId);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates the input for the report parameters.
 * @param {object} params The report parameters to validate
 * @returns {object} The validated report parameters
 * @throws {ValidationError} If the report parameters are invalid
 */
function validateReportParams(params) {
  const parsed = reportParamsSchema.safeParse(params);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates filters for the admin event log list.
 * Pagination (`page`, `limit`) is handled separately via pagination helpers.
 * @param {object} params The list query parameters
 * @returns {object} The validated list filters
 * @throws {ValidationError} If the list parameters are invalid
 */
function validateEventListParams(params) {
  const parsed = eventListParamsSchema.safeParse(params);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

export {
  validateEvent,
  validateEventId,
  validateReportParams,
  validateEventListParams,
};
