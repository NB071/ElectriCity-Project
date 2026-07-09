/**
 * This function maps a newly created review to a representable format.
 * @param {object} data
 * @param {number} data.reviewId
 * @param {number} data.cid
 * @param {string|null} data.title
 * @param {string} data.body
 * @param {number} data.rating
 * @param {Date|string} data.createdAt
 * @returns {{
 *   review_id: number,
 *   cid: number,
 *   title: string|null,
 *   body: string,
 *   rating: number,
 *   created_at: Date|string
 * }}
 */
function toPublishReviewResponseDTO({
    reviewId,
    cid,
    title,
    body,
    rating,
    createdAt,
}) {
    return {
        review_id: reviewId,
        cid,
        title: title ?? null,
        body,
        rating,
        created_at: createdAt,
    };
}

export { toPublishReviewResponseDTO };
