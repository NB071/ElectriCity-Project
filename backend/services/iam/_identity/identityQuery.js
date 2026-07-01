// IAM Identity Management
// CQRS - Queries

import accountDAO from "./accountDAO.js";
import {
    validateUserId,
    validateGetUserOptions,
    validateAdminUserSearchQuery,
} from "./identityValidator.js";
import { DEFAULTS } from "./constants.js";
import { toUserDTO } from "./DTOs/userDTO.js";
import { toAdminUserListDTO } from "./DTOs/adminUserListDTO.js";
import { ValidationError } from "../../../utils/errors.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../../utils/pagination.js";

/**
 * This function returns user information by id with optional field projection.
 * Use fields to limit the response (e.g. order service requesting only email).
 * @param {number|string} userId
 * @param {object} [options]
 * @param {string|string[]} [options.fields] Subset of profile fields to return
 * @returns {Promise<object>}
 * @throws {ValidationError} If userId or field filters are invalid
 * @throws {NotFoundError} If the user does not exist or is soft-deleted
 * @throws {DatabaseError} On database failures
 */
async function getUserById(userId, options = {}) {
    try {
        const id = validateUserId(userId);
        const { fields } = validateGetUserOptions(options);
        const selectedFields =
            fields.length > 0 ? fields : DEFAULTS.PROFILE_FIELDS;
        const row = await accountDAO.findById(id, selectedFields);
        return toUserDTO(row);
    } catch (err) {
        console.error(
            "[Service: IAM Identity] getUserById failed:",
            err.message,
        );
        throw err;
    }
}

/**
 * This function returns the authenticated user's full profile
 * @param {number|string} userId authenticated user's id
 * @returns {Promise<object>} Authenticated user's profile
 * @throws {ValidationError} If userId is invalid
 * @throws {NotFoundError} If the user does not exist or is soft-deleted
 * @throws {DatabaseError} On database failures
 */
async function getCurrentUserProfile(userId) {
    return getUserById(userId);
}

/**
 * This function returns a paginated list of all platform users for admins.
 * @param {object} [queryParams] Raw query params (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If pagination parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function viewAllUsers(queryParams = {}) {
    try {
        if (!validatePaginationParams(queryParams)) {
            throw new ValidationError("Invalid pagination parameters.");
        }

        const pagination = parsePaginationQuery(queryParams);
        const total = await accountDAO.countAllUsers();
        const rows = await accountDAO.findAllUsers(
            pagination.limit,
            pagination.offset,
        );

        return {
            items: rows.map(toAdminUserListDTO),
            pagination: paginationMeta({ ...pagination, total }),
        };
    } catch (err) {
        console.error(
            "[Service: IAM Identity] viewAllUsers failed:",
            err.message,
        );
        throw err;
    }
}

/**
 * This function searches platform users by [name, email, phone, created date, or deleted status].
 * @param {object} [queryParams] Raw query params (q, page, limit)
 * @returns {Promise<{ items: object[], pagination: object, q: string }>}
 * @throws {ValidationError} If search or pagination parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function searchUsers(queryParams = {}) {
    try {
        if (!validatePaginationParams(queryParams)) {
            throw new ValidationError("Invalid pagination parameters.");
        }

        const { q } = validateAdminUserSearchQuery(queryParams);
        const pagination = parsePaginationQuery(queryParams);
        const total = await accountDAO.countSearchUsers(q);
        const rows = await accountDAO.searchUsers(
            q,
            pagination.limit,
            pagination.offset,
        );

        return {
            items: rows.map(toAdminUserListDTO),
            pagination: paginationMeta({ ...pagination, total }),
            q,
        };
    } catch (err) {
        console.error(
            "[Service: IAM Identity] searchUsers failed:",
            err.message,
        );
        throw err;
    }
}

export { getUserById, getCurrentUserProfile, viewAllUsers, searchUsers };
