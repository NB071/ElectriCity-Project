// Payment Service
// CQRS - Query side (reads)

import paymentDAO from "./paymentDAO.js";
import {
    validateAttemptId,
    validateUserId,
} from "./paymentValidator.js";
import { validateOrderId } from "../order/orderValidator.js";
import { ValidationError } from "../../utils/errors.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../utils/pagination.js";
import { toCustomerPaymentAttemptDTO } from "./DTOs/customerPaymentAttemptDTO.js";
import { toAdminPaymentAttemptDTO } from "./DTOs/adminPaymentAttemptDTO.js";

/**
 * This function returns paginated payment attempts across all users (admin view).
 * @requiredRole admin
 * @param {object} [paginationQuery] Raw query params (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
 */
async function viewAllPaymentAttempts(paginationQuery = {}) {
    if (!validatePaginationParams(paginationQuery)) {
        throw new ValidationError("Invalid pagination parameters.");
    }

    const pagination = parsePaginationQuery(paginationQuery);
    const total = await paymentDAO.countAllAttempts();
    const rows =
        total === 0
            ? []
            : await paymentDAO.findAllAttempts(
                  pagination.limit,
                  pagination.offset,
              );

    return {
        items: rows.map(toAdminPaymentAttemptDTO),
        pagination: paginationMeta({ ...pagination, total }),
    };
}

/**
 * This function returns one payment attempt by attempt_id.
 * @requiredRole admin
 * @param {number|string} attempt_id
 * @returns {Promise<object>}
 * @throws {ValidationError} If the attempt id is invalid
 * @throws {NotFoundError} If the attempt is not found
 * @throws {DatabaseError} On database failures
 */
async function getPaymentAttemptById(attempt_id) {
    const validAttemptId = validateAttemptId(attempt_id);
    const row = await paymentDAO.findAttemptByIdWithUser(validAttemptId);
    return toAdminPaymentAttemptDTO(row);
}

/**
 * This function returns all payment attempts for an order.
 * @requiredRole admin
 * @param {number|string} order_id
 * @returns {Promise<object[]>}
 * @throws {ValidationError} If the order id is invalid
 * @throws {DatabaseError} On database failures
 */
async function getPaymentAttemptsByOrderId(order_id) {
    const validOrderId = validateOrderId(order_id);
    const rows = await paymentDAO.findAttemptsByOrderId(validOrderId);
    return rows.map(toAdminPaymentAttemptDTO);
}

/**
 * This function returns paginated payment attempts for a user.
 * user_id must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {number|string} user_id
 * @param {object} [paginationQuery] Raw query params (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
 */
async function getPaymentAttemptsByUserId(user_id, paginationQuery = {}) {
    const validUserId = validateUserId(user_id);

    if (!validatePaginationParams(paginationQuery)) {
        throw new ValidationError("Invalid pagination parameters.");
    }

    const pagination = parsePaginationQuery(paginationQuery);
    const total = await paymentDAO.countAttemptsByUserId(validUserId);
    const rows =
        total === 0
            ? []
            : await paymentDAO.findAttemptsByUserId(
                  validUserId,
                  pagination.limit,
                  pagination.offset,
              );

    return {
        items: rows.map(toCustomerPaymentAttemptDTO),
        pagination: paginationMeta({ ...pagination, total }),
    };
}

export {
    viewAllPaymentAttempts,
    getPaymentAttemptById,
    getPaymentAttemptsByOrderId,
    getPaymentAttemptsByUserId,
};
