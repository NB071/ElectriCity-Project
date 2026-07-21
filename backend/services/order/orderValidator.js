// Order Validation

import { z } from "zod";
import { ValidationError } from "../../utils/errors.js";
import { VALIDATIONS } from "./constants.js";
import {
  normalizeCanadianProvince,
  PROVINCE_CODES,
} from "./helpers/resolveTaxRate.js";

const ALL_PAYMENT_STATUSES = Object.values(VALIDATIONS.PAYMENT_STATUS);
const ALL_ORDER_STATUSES = Object.values(VALIDATIONS.ORDER_STATUS);
const ALL_ADDRESS_TYPES = VALIDATIONS.ADDRESS_TYPES;

const PROVINCE_HINT = PROVINCE_CODES.join(", ");

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

// Schema(s)

const guestEmailSchema = z
  .string()
  .trim()
  .max(
    VALIDATIONS.GUEST_EMAIL.MAX_LENGTH,
    `guest_email must be at most ${VALIDATIONS.GUEST_EMAIL.MAX_LENGTH} characters.`,
  )
  .pipe(z.email("guest_email must be a valid email address."));

const checkoutItemSchema = z.object({
  cid: z.coerce
    .number({ required_error: "cid is required." })
    .int("cid must be an integer.")
    .positive("cid must be a positive integer."),
  config_id: z.coerce
    .number()
    .int("config_id must be an integer.")
    .positive("config_id must be a positive integer.")
    .nullable()
    .optional(),
  quantity: z.coerce
    .number({ required_error: "quantity is required." })
    .int("quantity must be an integer.")
    .min(
      VALIDATIONS.QUANTITY.MIN,
      `quantity must be at least ${VALIDATIONS.QUANTITY.MIN}.`,
    )
    .max(
      VALIDATIONS.QUANTITY.MAX,
      `quantity must be at most ${VALIDATIONS.QUANTITY.MAX}.`,
    ),
});

const addressSchema = z.object({
  address_type: z
    .enum(ALL_ADDRESS_TYPES, {
      error: () => ({
        message: `address_type must be one of: ${ALL_ADDRESS_TYPES.join(", ")}`,
      }),
    })
    .optional(),
  full_name: z
    .string({ required_error: "full_name is required." })
    .trim()
    .min(1, "full_name cannot be blank.")
    .max(
      VALIDATIONS.ADDRESS.NAME_MAX_LENGTH,
      `full_name must be at most ${VALIDATIONS.ADDRESS.NAME_MAX_LENGTH} characters.`,
    ),
  phone_number: z
    .string()
    .trim()
    .max(
      VALIDATIONS.ADDRESS.PHONE_MAX_LENGTH,
      `phone_number must be at most ${VALIDATIONS.ADDRESS.PHONE_MAX_LENGTH} characters.`,
    )
    .nullable()
    .optional(),
  street: z
    .string({ required_error: "street is required." })
    .trim()
    .min(1, "street cannot be blank.")
    .max(
      VALIDATIONS.ADDRESS.STREET_MAX_LENGTH,
      `street must be at most ${VALIDATIONS.ADDRESS.STREET_MAX_LENGTH} characters.`,
    ),
  city: z
    .string({ required_error: "city is required." })
    .trim()
    .min(1, "city cannot be blank.")
    .max(
      VALIDATIONS.ADDRESS.CITY_MAX_LENGTH,
      `city must be at most ${VALIDATIONS.ADDRESS.CITY_MAX_LENGTH} characters.`,
    )
    .regex(/^[^0-9]*$/, "city cannot contain numbers."),
  province: z
    .string({ required_error: "province is required." })
    .trim()
    .min(1, "province cannot be blank.")
    .max(
      VALIDATIONS.ADDRESS.PROVINCE_MAX_LENGTH,
      `province must be at most ${VALIDATIONS.ADDRESS.PROVINCE_MAX_LENGTH} characters.`,
    )
    .regex(/^[^0-9]*$/, "province cannot contain numbers.")
    .transform((value, ctx) => {
      const code = normalizeCanadianProvince(value);
      if (code == null) {
        ctx.addIssue({
          code: "custom",
          message: `province must be a Canadian province or territory code or name (e.g. ${PROVINCE_HINT}).`,
        });
        return z.NEVER;
      }
      return code;
    }),
  country: z
    .string({ required_error: "country is required." })
    .trim()
    .min(1, "country cannot be blank.")
    .max(
      VALIDATIONS.ADDRESS.COUNTRY_MAX_LENGTH,
      `country must be at most ${VALIDATIONS.ADDRESS.COUNTRY_MAX_LENGTH} characters.`,
    )
    .regex(/^[^0-9]*$/, "country cannot contain numbers."),
  postal_code: z
    .string({ required_error: "postal_code is required." })
    .trim()
    .min(1, "postal_code cannot be blank.")
    .max(
      VALIDATIONS.ADDRESS.POSTAL_CODE_MAX_LENGTH,
      `postal_code must be at most ${VALIDATIONS.ADDRESS.POSTAL_CODE_MAX_LENGTH} characters.`,
    ),
});

// payment_method/payment_details are only shape-checked here; paymentService/paymentValidator
// owns the real enum + gateway-specific validation, per the "no double validation" rule.
const paymentInputSchema = z.object({
  payment_method: z
    .string({ required_error: "payment_method is required." })
    .min(1, "payment_method cannot be blank."),
  payment_details: z.object({}).passthrough().optional(),
});

const optionalSessionTokenSchema = z.preprocess(
  (value) =>
    value === undefined || value === null || value === "" ? null : value,
  z.union([
    z.string().uuid("sessionToken must be a valid UUID.").length(36),
    z.null(),
  ]),
);

const customerCheckoutSchema = z
  .object({
    userId: z.coerce
      .number({ required_error: "userId is required." })
      .int("userId must be an integer.")
      .positive("userId must be a positive integer."),
    shipping_address: addressSchema,
    billing_address: addressSchema.optional(),
    additional_information: z.string().trim().max(1000).optional(),
  })
  .merge(paymentInputSchema);

const guestCheckoutSchema = z
  .object({
    sessionToken: optionalSessionTokenSchema.optional(),
    guest_email: guestEmailSchema,
    items: z.array(checkoutItemSchema).min(1).optional(),
    shipping_address: addressSchema,
    billing_address: addressSchema.optional(),
    additional_information: z.string().trim().max(1000).optional(),
  })
  .merge(paymentInputSchema)
  .superRefine((data, ctx) => {
    const hasItems = data.items && data.items.length > 0;
    const hasSession = data.sessionToken != null;
    if (!hasItems && !hasSession) {
      ctx.addIssue({
        code: "custom",
        message: "Guest checkout requires items or an X-Cart-Session cart.",
        path: ["items"],
      });
    }
  });

/**
 * This function validates an order primary key.
 * @param {number|string} orderId
 * @returns {number}
 * @throws {ValidationError} If the order id is invalid
 */
function validateOrderId(orderId) {
  const parsed = z.coerce
    .number({ required_error: "Order ID is required." })
    .int("Order ID must be an integer.")
    .positive("Order ID must be a positive integer.")
    .safeParse(orderId);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates an order payment_status value.
 * @param {string} paymentStatus
 * @returns {string}
 * @throws {ValidationError} If the payment status is invalid
 */
function validateOrderPaymentStatus(paymentStatus) {
  const parsed = z
    .enum(ALL_PAYMENT_STATUSES, {
      error: () => ({
        message: `payment_status must be one of: ${ALL_PAYMENT_STATUSES.join(", ")}`,
      }),
    })
    .safeParse(paymentStatus);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates a user primary key.
 * userId must come from req.user.user_id, not the request body.
 * @param {number|string} userId
 * @returns {number}
 * @throws {ValidationError} If the user id is invalid
 */
function validateUserId(userId) {
  const parsed = z.coerce
    .number({ required_error: "User ID is required." })
    .int("User ID must be an integer.")
    .positive("User ID must be a positive integer.")
    .safeParse(userId);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates an order_status value.
 * @param {string} orderStatus
 * @returns {string}
 * @throws {ValidationError} If the order status is invalid
 */
function validateOrderStatus(orderStatus) {
  const parsed = z
    .enum(ALL_ORDER_STATUSES, {
      error: () => ({
        message: `order_status must be one of: ${ALL_ORDER_STATUSES.join(", ")}`,
      }),
    })
    .safeParse(orderStatus);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates checkout input for the authenticated customer strategy.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {object} Validated checkout input
 * @throws {ValidationError} If the checkout data is invalid
 */
function validateCustomerCheckoutInput(data) {
  const parsed = customerCheckoutSchema.safeParse(data);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return parsed.data;
}

/**
 * This function validates checkout input for the guest strategy.
 * @param {object} data
 * @returns {object} Validated checkout input
 * @throws {ValidationError} If the checkout data is invalid
 */
function validateGuestCheckoutInput(data) {
  const parsed = guestCheckoutSchema.safeParse(data);

  if (!parsed.success) {
    throwValidationError(parsed.error);
  }

  return {
    ...parsed.data,
    sessionToken: parsed.data.sessionToken ?? null,
  };
}

export {
  validateOrderId,
  validateOrderPaymentStatus,
  validateUserId,
  validateOrderStatus,
  validateCustomerCheckoutInput,
  validateGuestCheckoutInput,
};
