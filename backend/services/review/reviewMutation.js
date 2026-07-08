// Review Service
// CQRS - Mutations

import reviewDAO from "./reviewDAO.js";
import { validatePublishReview, validateReviewId } from "./reviewValidator.js";

/**
 * This function creates a review for the authenticated user.
 * userId must come from req.user.user_id, not the request body.
 * Idempotent-safe against UNIQUE KEY (user_id, cid).
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.cid
 * @param {string|null} [data.title]
 * @param {string} data.body
 * @param {number} data.rating
 * @returns {Promise<object>} The created or existing review
 * @throws {Error} If validation fails or the insert fails
 */
async function publishReview({ userId, cid, title, body, rating }) {
    const validated = validatePublishReview({
        userId,
        cid,
        title,
        body,
        rating,
    });

    const reviewId = await reviewDAO.insertReview({
        user_id: validated.userId,
        cid: validated.cid,
        title: validated.title ?? null,
        body: validated.body,
        rating: validated.rating,
    });

    return {
        review_id: reviewId,
        cid: validated.cid,
        title: validated.title ?? null,
        body: validated.body,
        rating: validated.rating,
    };
}

/**
 * This function hard-deletes a review by rid (review_id).
 * @requiredRole admin
 * @param {number|string} rid
 * @returns {Promise<void>}
 * @throws {Error} If the review id is invalid, not found, or the delete fails
 */
async function deleteReview(rid) {
    const validRid = validateReviewId(rid);
    await reviewDAO.deleteById(validRid);
}

export { publishReview, deleteReview };
