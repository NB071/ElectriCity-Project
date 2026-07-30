// Order Service
// CQRS - Query side (reads)

import orderDAO from "./orderDAO.js";
import cartDAO from "../cart/cartDAO.js";
import {
    validateOrderId,
    validateUserId,
    validateCustomerCalculateInput,
    validateGuestCalculateInput,
} from "./orderValidator.js";
import {
    NotFoundError,
    ForbiddenError,
    ConflictError,
    ValidationError,
} from "../../utils/errors.js";
import { CHECKOUT_ACTORS, VALIDATIONS } from "./constants.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../utils/pagination.js";
import configurationsDAO from "../catalog/_configurations/configurationsDAO.js";
import paymentService from "../payment/payment.service.js";
import { computeOrderTotals } from "./helpers/orderTotals.js";
import { toOrderListItemDTO } from "./DTOs/orderListItemDTO.js";
import { toAdminOrderListItemDTO } from "./DTOs/adminOrderListItemDTO.js";
import { toOrderDetailDTO } from "./DTOs/orderDetailDTO.js";
import { toAdminOrderDetailDTO } from "./DTOs/adminOrderDetailDTO.js";
import { toCheckoutCalculateDTO } from "./DTOs/checkoutCalculateDTO.js";
import log from "../../utils/logger.js";

/**
 * This function builds a config_id -> options[] map for a list of order item rows.
 * @helper_function
 * @private
 * @param {object[]} items Rows with a config_id field
 * @returns {Promise<Map<number, object[]>>}
 */
async function buildOptionsByConfigId(items) {
    const configIds = [
        ...new Set(
            items
                .filter((item) => item.config_id != null)
                .map((item) => item.config_id),
        ),
    ];

    const entries = await Promise.all(
        configIds.map(async (configId) => [
            configId,
            await configurationsDAO.findOptionsByConfigId(configId),
        ]),
    );

    return new Map(entries);
}

/**
 * This function assembles the full detail payload (items, options, addresses, payment attempts)
 * for a single order row.
 * @helper_function
 * @private
 * @param {object} order Order row
 * @returns {Promise<object>}
 */
async function assembleOrderDetail(order) {
    const items = await orderDAO.findItemsByOrderId(order.order_id);
    const [optionsByConfigId, addresses, paymentAttempts] = await Promise.all([
        buildOptionsByConfigId(items),
        orderDAO.findAddressesByOrderId(order.order_id),
        paymentService.getPaymentAttemptsByOrderId(order.order_id),
    ]);

    return { order, items, optionsByConfigId, addresses, paymentAttempts };
}

/**
 * This function ensures an order exists.
 * @param {number|string} orderId
 * @returns {Promise<number>} Validated order id
 * @throws {ValidationError} If the order id is invalid
 * @throws {NotFoundError} If the order does not exist
 * @throws {DatabaseError} On database failures
 */
async function ensureOrderExists(orderId) {
    const id = validateOrderId(orderId);
    const exists = await orderDAO.existsById(id);

    if (!exists) {
        throw new NotFoundError("Order");
    }

    return id;
}

/**
 * This function validates that an order can be paid by the given user for the given amount.
 * @param {object} input
 * @param {number} input.order_id
 * @param {number} input.user_id
 * @param {number} input.amount
 * @returns {Promise<object>} The order row
 * @throws {ValidationError} If ids or amount are invalid
 * @throws {NotFoundError} If the order does not exist
 * @throws {ForbiddenError} If the order does not belong to the user
 * @throws {ConflictError} If the order is already paid or cancelled
 * @throws {DatabaseError} On database failures
 */
async function validateOrderForPayment({ order_id, user_id, amount }) {
    const id = validateOrderId(order_id);

    // find the order by the order id
    const order = await orderDAO.findById(id);
    // if the order is not found, throw a not found error
    if (!order) {
        throw new NotFoundError("Order");
    }
    if (order.user_id == null || Number(order.user_id) !== Number(user_id)) {
        throw new ForbiddenError("You do not have access to this order.");
    }

    if (order.payment_status === VALIDATIONS.PAYMENT_STATUS.PAID) {
        throw new ConflictError("Order is already paid.");
    }

    if (order.order_status === VALIDATIONS.ORDER_STATUS.CANCELLED) {
        throw new ConflictError("Order is cancelled.");
    }

    if (Number(amount) !== Number(order.total)) {
        throw new ValidationError("Payment amount does not match order total.");
    }

    return order;
}

/**
 * This function returns paginated orders for the authenticated user, most recent first.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {number|string} userId
 * @param {object} [queryParams] Raw query params (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
 */
async function listOrdersByUserId(userId, queryParams = {}) {
    const id = validateUserId(userId);

    if (!validatePaginationParams(queryParams)) {
        throw new ValidationError("Invalid pagination parameters.");
    }

    const pagination = parsePaginationQuery(queryParams);
    const total = await orderDAO.countOrdersByUserId(id);
    const rows =
        total === 0
            ? []
            : await orderDAO.findOrdersByUserId(
                  id,
                  pagination.limit,
                  pagination.offset,
              );

    return {
        items: rows.map(toOrderListItemDTO),
        pagination: paginationMeta({ ...pagination, total }),
    };
}

/**
 * This function returns full order detail (items, addresses, payment attempts) for the
 * authenticated user's own order.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {number|string} userId
 * @param {number|string} orderId
 * @returns {Promise<object>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the order does not exist
 * @throws {ForbiddenError} If the order does not belong to the user
 * @throws {DatabaseError} On database failures
 */
async function getOrderDetailsForUser(userId, orderId) {
    const id = validateUserId(userId);
    const validOrderId = validateOrderId(orderId);
    const order = await orderDAO.findById(validOrderId);

    if (order.user_id == null || Number(order.user_id) !== Number(id)) {
        throw new ForbiddenError("You do not have access to this order.");
    }

    return toOrderDetailDTO(await assembleOrderDetail(order));
}

/**
 * This function returns paginated orders across all users (admin view), most recent first.
 * @requiredRole admin
 * @param {object} [queryParams] Raw query params (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
 */
async function listAllOrders(queryParams = {}) {
    if (!validatePaginationParams(queryParams)) {
        throw new ValidationError("Invalid pagination parameters.");
    }

    const pagination = parsePaginationQuery(queryParams);
    const total = await orderDAO.countAllOrders();
    const rows =
        total === 0
            ? []
            : await orderDAO.findAllOrders(pagination.limit, pagination.offset);

    return {
        items: rows.map(toAdminOrderListItemDTO),
        pagination: paginationMeta({ ...pagination, total }),
    };
}

/**
 * This function returns full order detail (items, addresses, payment attempts, owner) for any order.
 * @requiredRole admin
 * @param {number|string} orderId
 * @returns {Promise<object>}
 * @throws {ValidationError} If the order id is invalid
 * @throws {NotFoundError} If the order does not exist
 * @throws {DatabaseError} On database failures
 */
async function getOrderDetailsForAdmin(orderId) {
    const validOrderId = validateOrderId(orderId);
    const order = await orderDAO.findByIdWithUser(validOrderId);

    return toAdminOrderDetailDTO(await assembleOrderDetail(order));
}

/**
 * This function resolves the checkout actor for calculate (same rules as checkout).
 * @helper_function
 * @private
 * @param {object} input
 * @returns {string}
 */
function resolveCalculateActor(input) {
    if (input?.actor != null) {
        return input.actor;
    }
    if (input?.userId != null) {
        return CHECKOUT_ACTORS.CUSTOMER;
    }
    return CHECKOUT_ACTORS.GUEST;
}

/**
 * This function resolves priced cart/items for checkout calculate without writing an order.
 * @helper_function
 * @private
 * @param {object} input
 * @param {string} input.actor
 * @param {number|null} [input.userId]
 * @param {string|null} [input.sessionToken]
 * @param {object[]} [input.items]
 * @returns {Promise<object[]>}
 */
async function resolveCalculateLines({
    actor,
    userId = null,
    sessionToken = null,
    items = null,
}) {
    if (actor === CHECKOUT_ACTORS.CUSTOMER) {
        const cart = await cartDAO.findCartByUserId(userId);
        if (!cart) {
            throw new ValidationError("Your cart is empty.");
        }
        return orderDAO.resolvePricedCheckoutLines({ cartId: cart.cart_id });
    }

    if (sessionToken) {
        const cart =
            await cartDAO.findActiveGuestCartBySessionToken(sessionToken);
        if (!cart) {
            throw new ValidationError("Your cart is empty.");
        }
        return orderDAO.resolvePricedCheckoutLines({ cartId: cart.cart_id });
    }

    return orderDAO.resolvePricedCheckoutLines({ items });
}

/**
 * This function calculates checkout subtotal/tax/total with GST/PST/HST breakdown.
 * Read-only preview: does not create an order, lock stock, or process payment.
 * Uses the same pricing + tax helpers as real checkout.
 * @param {object} input
 * @param {string} [input.actor] CHECKOUT_ACTORS.CUSTOMER | CHECKOUT_ACTORS.GUEST
 * @param {number|null} [input.userId] From JWT when authenticated
 * @param {string|null} [input.sessionToken] Guest cart session
 * @param {object[]} [input.items] Guest fallback line items
 * @param {object} input.shipping_address Must include province
 * @returns {Promise<object>} Checkout calculate DTO
 * @throws {ValidationError} If validation fails or the cart is empty
 * @throws {NotFoundError} If a catalog item or configuration is missing
 * @throws {DatabaseError} On database failures
 */
async function calculateCheckoutTotals(input) {
    try {
        const actor = resolveCalculateActor(input);
        let valid;
        let lines;

        if (actor === CHECKOUT_ACTORS.CUSTOMER) {
            valid = validateCustomerCalculateInput(input);
            lines = await resolveCalculateLines({
                actor,
                userId: valid.userId,
            });
        } else if (actor === CHECKOUT_ACTORS.GUEST) {
            valid = validateGuestCalculateInput(input);
            lines = await resolveCalculateLines({
                actor,
                sessionToken: valid.sessionToken,
                items: valid.items,
            });
        } else {
            throw new ValidationError(`Unknown checkout actor: ${actor}`);
        }

        // province is already normalized to a canonical code by the validator
        const province = valid.shipping_address.province;
        const totals = computeOrderTotals(lines, null, province);

        if (!totals.tax_breakdown) {
            throw new ValidationError(
                "province must be a Canadian province or territory.",
            );
        }

        return toCheckoutCalculateDTO({
            items: lines,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            tax_breakdown: totals.tax_breakdown,
        });
    } catch (err) {
        log.error(
            "Order",
            "calculateCheckoutTotals",
            "calculateCheckoutTotals failed",
            err,
        );
        throw err;
    }
}

export {
    ensureOrderExists,
    validateOrderForPayment,
    listOrdersByUserId,
    getOrderDetailsForUser,
    listAllOrders,
    getOrderDetailsForAdmin,
    calculateCheckoutTotals,
};
