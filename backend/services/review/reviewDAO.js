import BaseDAO from "../../utils/BaseDAO.js";

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
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method returns paginated reviews for a catalog item.
     * @param {number} cid
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the catalog item has no reviews
     */
    async findByCatalogItem(cid, limit, offset) {
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method counts reviews authored by a user.
     * @param {number} userId
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countByUser(userId) {
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method returns paginated reviews authored by a user.
     * @param {number} userId
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the user has no reviews
     */
    async findByUser(userId, limit, offset) {
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method returns one review with author info (join users).
     * @param {number} reviewId
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the review is not found
     */
    async findByIdWithAuthor(reviewId) {
        // TODO:
        throw new Error("Not implemented");
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
     * @throws {DatabaseError} On database failures
     * @throws {ConflictError} If the review already exists
     */
    async insertReview({ user_id, cid, title = null, body, rating }) {
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method hard-deletes a review by review_id.
     * @param {number} reviewId
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the review is not found
     */
    async deleteById(reviewId) {
        // TODO:
        throw new Error("Not implemented");
    }
}

const reviewDAO = new ReviewDAO();
export default reviewDAO;
