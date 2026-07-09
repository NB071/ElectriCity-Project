// Review Service
// CQRS - Query side (reads)

import reviewDAO from "./reviewDAO.js";
import catalogService from "../catalog/catalog.service.js";
import {
    validateReviewId,
    validateCatalogItemId,
    validateUserId,
} from "./reviewValidator.js";
import {
    parsePaginationQuery,
    paginationMeta,
} from "../../utils/pagination.js";
import { toCatalogReviewDTO } from "./DTOs/catalogReviewDTO.js";
import { toCustomerReviewDTO } from "./DTOs/customerReviewDTO.js";
import { toReviewDetailDTO } from "./DTOs/reviewDetailDTO.js";
import {
    toAdminReviewListDTO,
    toAdminCatalogReviewDTO,
} from "./DTOs/adminReviewListDTO.js";
import { toReviewSummaryDTO } from "./DTOs/reviewSummaryDTO.js";

/**
 * This function returns review_count and avg_rating for a catalog item.
 * We only count reviews from active (non-deleted) authors.
 * @param {number|string} cid Catalog item id
 * @returns {Promise<{ review_count: number, avg_rating: number|null }>}
 * @throws {ValidationError} If the catalog item id is invalid
 * @throws {DatabaseError} On database failures
 */
async function getCatalogReviewSummary(cid) {
    const validCid = validateCatalogItemId(cid);
    const summary = await reviewDAO.getCatalogReviewSummary(validCid);
    return toReviewSummaryDTO(summary);
}

/**
 * This function returns paginated reviews for one catalog item (detail page).
 * @requiredRole N/A (public)
 * @param {number|string} cid Catalog item id from route params
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the catalog item does not exist or is inactive
 * @throws {DatabaseError} On database failures
 */
async function viewCatalogReviews(cid, paginationQuery = {}) {
    const validCid = validateCatalogItemId(cid);
    await catalogService.ensureCatalogItemExists(validCid, {
        requireActive: true,
    });

    const { page, limit, offset } = parsePaginationQuery(paginationQuery);

    const total = await reviewDAO.countByCatalogItem(validCid);
    const rows =
        total === 0
            ? []
            : await reviewDAO.findByCatalogItem(validCid, limit, offset);

    return {
        items: rows.map(toCatalogReviewDTO),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns paginated reviews authored by the current user.
 * @requiredRole customer
 * @param {number|string} userId Authenticated user id from req.user.user_id
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
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
        items: rows.map(toCustomerReviewDTO),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns paginated reviews for one catalog item (admin view).
 * We include reviews from soft-deleted authors for moderation.
 * @requiredRole admin
 * @param {number|string} cid Catalog item id from route params
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the catalog item does not exist or is inactive
 * @throws {DatabaseError} On database failures
 */
async function viewAllCatalogReviews(cid, paginationQuery = {}) {
    const validCid = validateCatalogItemId(cid);
    await catalogService.ensureCatalogItemExists(validCid, {
        requireActive: true,
    });
    const { page, limit, offset } = parsePaginationQuery(paginationQuery);

    const total = await reviewDAO.countByCatalogItem(validCid, {
        includeDeletedAuthors: true,
    });
    const rows =
        total === 0
            ? []
            : await reviewDAO.findByCatalogItem(validCid, limit, offset, {
                  includeDeletedAuthors: true,
              });

    return {
        items: rows.map(toAdminCatalogReviewDTO),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns paginated reviews across all users (admin view).
 * We include reviews from soft-deleted authors for moderation.
 * @requiredRole admin
 * @param {object} [paginationQuery] Raw query params from req.query (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {DatabaseError} On database failures
 */
async function viewAllReviews(paginationQuery = {}) {
    const { page, limit, offset } = parsePaginationQuery(paginationQuery);

    const total = await reviewDAO.countAllReviews({
        includeDeletedAuthors: true,
    });
    const rows =
        total === 0
            ? []
            : await reviewDAO.findAllReviews(limit, offset, {
                  includeDeletedAuthors: true,
              });

    return {
        items: rows.map(toAdminReviewListDTO),
        pagination: paginationMeta({ page, limit, total }),
    };
}

/**
 * This function returns full detail for one review keyed by rid (review_id).
 * We include reviews whose authors have been soft-deleted.
 * @requiredRole admin
 * @param {number|string} rid Review id from route params (maps to reviews.review_id)
 * @returns {Promise<object>}
 * @throws {ValidationError} If the review id is invalid
 * @throws {NotFoundError} If the review is not found
 * @throws {DatabaseError} On database failures
 */
async function viewReviewDetail(rid) {
    const validRid = validateReviewId(rid);
    const row = await reviewDAO.findByIdWithAuthor(validRid, {
        includeDeletedAuthors: true,
    });
    return toReviewDetailDTO(row);
}

export {
    getCatalogReviewSummary,
    viewCatalogReviews,
    viewCustomerReviews,
    viewAllCatalogReviews,
    viewAllReviews,
    viewReviewDetail,
};
