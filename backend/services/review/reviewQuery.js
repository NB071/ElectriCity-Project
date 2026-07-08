// Review Service
// CQRS - Query side (reads)

import reviewDAO from "./reviewDAO.js";
import {
    validateReviewId,
    validateCatalogItemId,
    validateUserId,
} from "./reviewValidator.js";
import { parsePaginationQuery, paginationMeta } from "../../utils/pagination.js";
import { toCatalogReviewDTO } from "./DTOs/catalogReviewDTO.js";
import { toCustomerReviewDTO } from "./DTOs/customerReviewDTO.js";
import { toReviewDetailDTO } from "./DTOs/reviewDetailDTO.js";
import {
    toAdminReviewListDTO,
    toAdminCatalogReviewDTO,
} from "./DTOs/adminReviewListDTO.js";

/**
 * This function maps a review row to a public catalog listing shape.
 * Used on the catalog item detail page. Do not expose author email.
 * @helper_function
 * @private
 * @param {object} row DAO row (reviews joined with users for display name)
 * @returns {object}
 * @example
 * {
 *     review_id: 1,
 *     title: "Great vehicle",
 *     body: "Smooth ride and excellent range.",
 *     rating: 5,
 *     created_at: "2026-05-01T14:30:00.000Z",
 *     author: {
 *         user_id: 12,
 *         first_name: "Jane",
 *         last_name: "Doe",
 *     },
 * }
 */
function mapCatalogReview(row) {
    return toCatalogReviewDTO(row);
}

/**
 * This function maps a review row to a customer-owned listing shape.
 * Used for "my reviews". Includes catalog item context for each review.
 * @helper_function
 * @private
 * @param {object} row DAO row (reviews joined with catalog_items, brands, models)
 * @returns {object}
 * @example
 * {
 *     review_id: 1,
 *     title: "Great vehicle",
 *     body: "Smooth ride and excellent range.",
 *     rating: 5,
 *     created_at: "2026-05-01T14:30:00.000Z",
 *     catalog_item: {
 *         cid: 5,
 *         item_type: "vehicle",
 *         name: "Tesla Model 3",
 *         primary_image_url: "https://example.com/model-3.jpg",
 *     },
 * }
 */
function mapCustomerReview(row) {
    return toCustomerReviewDTO(row);
}

/**
 * This function maps a review row with author info to an admin detail shape.
 * @helper_function
 * @private
 * @param {object} row DAO row (from reviewDAO.findByIdWithAuthor)
 * @returns {object}
 * @example
 * {
 *     review_id: 1,
 *     title: "Great vehicle",
 *     body: "Smooth ride and excellent range.",
 *     rating: 5,
 *     created_at: "2026-05-01T14:30:00.000Z",
 *     user: {
 *         user_id: 12,
 *         first_name: "Jane",
 *         last_name: "Doe",
 *         email: "jane.doe@example.com",
 *     },
 *     catalog_item: {
 *         cid: 5,
 *         item_type: "vehicle",
 *         name: "Tesla Model 3",
 *     },
 * }
 */
function mapReviewDetail(row) {
    return toReviewDetailDTO(row);
}

/**
 * This function returns paginated reviews for one catalog item (detail page).
 * @requiredRole customer
 * @param {number|string} cid Catalog item id from route params
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {Error} If validation fails or the query fails
 */
async function viewCatalogReviews(cid, paginationQuery = {}) {
    const validCid = validateCatalogItemId(cid);
    const { page, limit, offset } = parsePaginationQuery(paginationQuery);

    const total = await reviewDAO.countByCatalogItem(validCid);
    const rows =
        total === 0
            ? []
            : await reviewDAO.findByCatalogItem(validCid, limit, offset);

    return {
        items: rows.map(mapCatalogReview),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns paginated reviews authored by the current user.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {number|string} userId Authenticated user id from req.user.user_id
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {Error} If validation fails or the query fails
 */
async function viewCustomerReviews(userId, paginationQuery = {}) {
    const validUserId = validateUserId(userId);
    const { page, limit, offset } = parsePaginationQuery(paginationQuery);

    const total = await reviewDAO.countByUser(validUserId);
    const rows =
        total === 0
            ? []
            : await reviewDAO.findByUser(validUserId, limit, offset);

    return {
        items: rows.map(mapCustomerReview),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns paginated reviews for one catalog item (admin view).
 * Same pagination contract as viewCatalogReviews but includes admin fields per item.
 * @requiredRole admin
 * @param {number|string} cid Catalog item id from route params
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {Error} If validation fails or the query fails
 */
async function viewAllCatalogReviews(cid, paginationQuery = {}) {
    const validCid = validateCatalogItemId(cid);
    const { page, limit, offset } = parsePaginationQuery(paginationQuery);

    const total = await reviewDAO.countByCatalogItem(validCid);
    const rows =
        total === 0
            ? []
            : await reviewDAO.findByCatalogItem(validCid, limit, offset);

    return {
        items: rows.map(toAdminCatalogReviewDTO),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns paginated reviews across all users (admin view).
 * @requiredRole admin
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {Error} If validation fails or the query fails
 */
async function viewAllReviews(paginationQuery = {}) {
    const { page, limit, offset } = parsePaginationQuery(paginationQuery);

    const total = await reviewDAO.countAllReviews();
    const rows =
        total === 0 ? [] : await reviewDAO.findAllReviews(limit, offset);

    return {
        items: rows.map(toAdminReviewListDTO),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns full detail for one review keyed by rid (review_id).
 * @requiredRole admin
 * @param {number|string} rid Review id from route params (maps to reviews.review_id)
 * @returns {Promise<object>}
 * @throws {Error} If the review id is invalid, not found, or the query fails
 */
async function viewReviewDetail(rid) {
    const validRid = validateReviewId(rid);
    const row = await reviewDAO.findByIdWithAuthor(validRid);
    return mapReviewDetail(row);
}

export {
    viewCatalogReviews,
    viewCustomerReviews,
    viewAllCatalogReviews,
    viewAllReviews,
    viewReviewDetail,
};
