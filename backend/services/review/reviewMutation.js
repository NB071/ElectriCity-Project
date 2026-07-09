// Review Service
// CQRS - Mutations

import reviewDAO from "./reviewDAO.js";
import catalogService from "../catalog/catalog.service.js";
import { validatePublishReview, validateReviewId } from "./reviewValidator.js";
import { toPublishReviewResponseDTO } from "./DTOs/publishReviewResponseDTO.js";

/**
 * This function creates a review for the authenticated user.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.cid
 * @param {string|null} [data.title]
 * @param {string} data.body
 * @param {number} data.rating
 * @returns {Promise<object>} The created review summary
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the catalog item does not exist or is inactive
 * @throws {ConflictError} If the user already reviewed this item
 * @throws {DatabaseError} On database failures
 */
async function publishReview({ userId, cid, title, body, rating }) {
    const validated = validatePublishReview({
        userId,
        cid,
        title,
        body,
        rating,
    });

    await catalogService.ensureCatalogItemExists(validated.cid, {
        requireActive: true,
    });

    const { reviewId, createdAt } = await reviewDAO.insertReview({
        user_id: validated.userId,
        cid: validated.cid,
        title: validated.title ?? null,
        body: validated.body,
        rating: validated.rating,
    });

    return toPublishReviewResponseDTO({
        reviewId,
        cid: validated.cid,
        title: validated.title ?? null,
        body: validated.body,
        rating: validated.rating,
        createdAt,
    });
}

/**
 * This function hard-deletes a review by rid (review_id).
 * @requiredRole admin
 * @param {number|string} rid
 * @returns {Promise<void>}
 * @throws {ValidationError} If the review id is invalid
 * @throws {NotFoundError} If the review is not found
 * @throws {DatabaseError} On database failures
 */
async function deleteReview(rid) {
    const validRid = validateReviewId(rid);
    await reviewDAO.deleteById(validRid);
}

export { publishReview, deleteReview };
