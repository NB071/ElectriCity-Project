import BaseDAO from "../../utils/BaseDAO.js";

// Shared SQL fragments for joining a review to its catalog item context
// (brand + model name and primary image), mirroring the catalog/wishlist joins.
const CATALOG_CONTEXT_JOIN = `
    JOIN catalog_items ci ON ci.cid = r.cid
    JOIN models m         ON m.model_id = ci.model_id
    JOIN brands b         ON b.brand_id = m.brand_id
    LEFT JOIN catalog_images ci_img
        ON ci_img.cid = r.cid AND ci_img.is_primary = TRUE
    LEFT JOIN media pm ON pm.media_id = ci_img.media_id`;

const CATALOG_CONTEXT_COLUMNS = `
    r.cid,
    ci.item_type,
    b.name AS brand_name,
    m.name AS model_name,
    pm.url AS primary_image_url`;

/**
 * This class is used to interact with the reviews database.
 */
class ReviewDAO extends BaseDAO {
    // #########################
    // Read operations
    // #########################
    /**
     * This method counts reviews for a catalog item.
     * @param {number} cid
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countByCatalogItem(cid) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM reviews WHERE cid = ?`,
            [cid],
        );
        return rows[0].total;
    }

    /**
     * This method returns paginated reviews for a catalog item (newest first),
     * joined with the author for display.
     * @param {number} cid
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findByCatalogItem(cid, limit, offset) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);
        const [rows] = await this._query(
            `SELECT
                r.review_id,
                r.title,
                r.body,
                r.rating,
                r.created_at,
                u.user_id,
                u.first_name,
                u.last_name,
                u.email
             FROM reviews r
             JOIN users u ON u.user_id = r.user_id
             WHERE r.cid = ?
             ORDER BY r.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [cid],
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method counts reviews authored by a user.
     * @param {number} userId
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countByUser(userId) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM reviews WHERE user_id = ?`,
            [userId],
        );
        return rows[0].total;
    }

    /**
     * This method returns paginated reviews authored by a user (newest first),
     * joined with catalog item context.
     * @param {number} userId
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findByUser(userId, limit, offset) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);
        const [rows] = await this._query(
            `SELECT
                r.review_id,
                r.title,
                r.body,
                r.rating,
                r.created_at,
                ${CATALOG_CONTEXT_COLUMNS}
             FROM reviews r
             ${CATALOG_CONTEXT_JOIN}
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [userId],
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method counts all reviews across the platform.
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countAllReviews() {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM reviews`,
        );
        return rows[0].total;
    }

    /**
     * This method returns a paginated admin list of all reviews (newest first),
     * joined with author and catalog item context.
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findAllReviews(limit, offset) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);
        const [rows] = await this._query(
            `SELECT
                r.review_id,
                r.title,
                r.body,
                r.rating,
                r.created_at,
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                ${CATALOG_CONTEXT_COLUMNS}
             FROM reviews r
             JOIN users u ON u.user_id = r.user_id
             ${CATALOG_CONTEXT_JOIN}
             ORDER BY r.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [],
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method returns one review with author + catalog item context.
     * @param {number} reviewId
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the review is not found
     * @throws {DatabaseError} On database failures
     */
    async findByIdWithAuthor(reviewId) {
        const [rows] = await this._query(
            `SELECT
                r.review_id,
                r.title,
                r.body,
                r.rating,
                r.created_at,
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                ${CATALOG_CONTEXT_COLUMNS}
             FROM reviews r
             JOIN users u ON u.user_id = r.user_id
             ${CATALOG_CONTEXT_JOIN}
             WHERE r.review_id = ?`,
            [reviewId],
            { notFoundResource: "Review" },
        );
        return rows[0];
    }

    // #########################
    // Write operations
    // #########################
    /**
     * This method inserts a new review.
     * Relies on UNIQUE KEY (cid, user_id) for one review per user per item.
     * @param {object} review
     * @param {number} review.user_id
     * @param {number} review.cid
     * @param {string|null} review.title
     * @param {string} review.body
     * @param {number} review.rating
     * @returns {Promise<number>} The inserted review_id
     * @throws {ConflictError} If the user already reviewed this item
     * @throws {DatabaseError} On database failures
     */
    async insertReview({ user_id, cid, title = null, body, rating }) {
        const [result] = await this._query(
            `INSERT INTO reviews (user_id, cid, title, body, rating)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, cid, title, body, rating],
            {
                conflictMessage: "You have already reviewed this item.",
                conflictDetails: { cid, user_id },
            },
        );
        return result.insertId;
    }

    /**
     * This method hard-deletes a review by review_id.
     * @param {number} reviewId
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the review is not found
     * @throws {DatabaseError} On database failures
     */
    async deleteById(reviewId) {
        await this._query(
            `DELETE FROM reviews WHERE review_id = ?`,
            [reviewId],
            { notFoundResource: "Review" },
        );
    }
}

const reviewDAO = new ReviewDAO();
export default reviewDAO;
