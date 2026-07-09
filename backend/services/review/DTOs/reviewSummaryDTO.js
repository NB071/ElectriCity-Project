/**
 * This function maps catalog review aggregate stats to a representable format.
 * @param {object} summary
 * @param {number} summary.review_count
 * @param {number|null} summary.avg_rating
 * @returns {{ review_count: number, avg_rating: number|null }}
 */
function toReviewSummaryDTO({ review_count, avg_rating }) {
    return {
        review_count: Number(review_count),
        avg_rating: avg_rating == null ? null : Number(avg_rating),
    };
}

export { toReviewSummaryDTO };
