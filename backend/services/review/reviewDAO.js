import BaseDAO from "../../utils/BaseDAO.js";

// Shared SQL fragments
const ACTIVE_AUTHOR_JOIN = `JOIN users u ON u.user_id = r.user_id AND u.deleted_at IS NULL`;
const ALL_AUTHORS_JOIN = `JOIN users u ON u.user_id = r.user_id`;

const CATALOG_CONTEXT_JOIN = `
    JOIN catalog_items ci ON ci.cid = r.cid
    JOIN models m         ON m.model_id = ci.model_id
    JOIN brands b         ON b.brand_id = m.brand_id
    LEFT JOIN (
        SELECT cid, MIN(media_id) AS media_id
        FROM catalog_images
        WHERE is_primary = TRUE
        GROUP BY cid
    ) primary_img ON primary_img.cid = r.cid
    LEFT JOIN media pm ON pm.media_id = primary_img.media_id`;

const CATALOG_CONTEXT_COLUMNS = `
    r.cid,
    ci.item_type,
    b.name AS brand_name,
    m.name AS model_name,
    pm.url AS primary_image_url`;

/**
 * @private
 * @param {boolean} includeDeletedAuthors
 * @returns {string}
 */
function authorJoin(includeDeletedAuthors) {
    return includeDeletedAuthors ? ALL_AUTHORS_JOIN : ACTIVE_AUTHOR_JOIN;
}

/**
 * @private
 * @param {boolean} includeAdminFields
 * @returns {string}
 */
function authorColumns(includeAdminFields) {
    const base = `u.user_id, u.first_name, u.last_name`;
    return includeAdminFields ? `${base}, u.email, u.deleted_at` : base;
}

/**
 * This class is used to interact with the reviews database.
 */
class ReviewDAO extends BaseDAO {
    // #########################
    // Read operations
    // #########################

    /**
     * This method returns review_count and avg_rating for a catalog item.
     * Only counts reviews from active (non-deleted) authors.
     * @param {number} cid
     * @returns {Promise<{ review_count: number, avg_rating: number|null }>}
     * @throws {DatabaseError} On database failures
     */
    async getCatalogReviewSummary(cid) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS review_count, AVG(r.rating) AS avg_rating
             FROM reviews r
             ${ACTIVE_AUTHOR_JOIN}
             WHERE r.cid = ?`,
            [cid],
        );
        const count = Number(rows[0].review_count);
        const avg = rows[0].avg_rating;

        return {
            review_count: count,
            avg_rating: count === 0 ? null : Number(Number(avg).toFixed(2)),
        };
    }

    /**
     * This method counts reviews for a catalog item.
     * @param {number} cid
     * @param {object} [options]
     * @param {boolean} [options.includeDeletedAuthors=false]
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countByCatalogItem(cid, { includeDeletedAuthors = false } = {}) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total
             FROM reviews r
             ${authorJoin(includeDeletedAuthors)}
             WHERE r.cid = ?`,
            [cid],
        );
        return Number(rows[0].total);
    }

    /**
     * This method returns paginated reviews for a catalog item (newest first).
     * @param {number} cid
     * @param {number} limit
     * @param {number} offset
     * @param {object} [options]
     * @param {boolean} [options.includeDeletedAuthors=false]
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findByCatalogItem(
        cid,
        limit,
        offset,
        { includeDeletedAuthors = false } = {},
    ) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);
        const [rows] = await this._query(
            `SELECT
                r.review_id,
                r.title,
                r.body,
                r.rating,
                r.created_at,
                ${authorColumns(includeDeletedAuthors)}
             FROM reviews r
             ${authorJoin(includeDeletedAuthors)}
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
        return Number(rows[0].total);
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
     * This method counts all reviews across the platform (admin includes deleted authors).
     * @param {object} [options]
     * @param {boolean} [options.includeDeletedAuthors=true]
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countAllReviews({ includeDeletedAuthors = true } = {}) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total
             FROM reviews r
             ${authorJoin(includeDeletedAuthors)}`,
        );
        return Number(rows[0].total);
    }

    /**
     * This method returns a paginated admin list of all reviews (newest first).
     * @param {number} limit
     * @param {number} offset
     * @param {object} [options]
     * @param {boolean} [options.includeDeletedAuthors=true]
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findAllReviews(limit, offset, { includeDeletedAuthors = true } = {}) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);
        const [rows] = await this._query(
            `SELECT
                r.review_id,
                r.title,
                r.body,
                r.rating,
                r.created_at,
                ${authorColumns(includeDeletedAuthors)},
                ${CATALOG_CONTEXT_COLUMNS}
             FROM reviews r
             ${authorJoin(includeDeletedAuthors)}
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
     * Admin reads include reviews whose authors have been soft-deleted.
     * @param {number} reviewId
     * @param {object} [options]
     * @param {boolean} [options.includeDeletedAuthors=true]
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the review is not found
     * @throws {DatabaseError} On database failures
     */
    async findByIdWithAuthor(reviewId, { includeDeletedAuthors = true } = {}) {
        const [rows] = await this._query(
            `SELECT
                r.review_id,
                r.title,
                r.body,
                r.rating,
                r.created_at,
                ${authorColumns(includeDeletedAuthors)},
                ${CATALOG_CONTEXT_COLUMNS}
             FROM reviews r
             ${authorJoin(includeDeletedAuthors)}
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
     * @returns {Promise<{ reviewId: number, createdAt: Date }>}
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

        const [rows] = await this._query(
            `SELECT created_at FROM reviews WHERE review_id = ?`,
            [result.insertId],
            { suppressNotFound: true },
        );

        return {
            reviewId: result.insertId,
            createdAt: rows[0].created_at,
        };
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
