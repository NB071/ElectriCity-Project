// IAM Identity Management
// CQRS - Queries

import accountDAO from "./accountDAO.js";
import addressDAO from "./addressDAO.js";
import {
    validateUserId,
    validateGetUserOptions,
    validateAdminUserSearchQuery,
    validateAddressRef,
} from "./identityValidator.js";
import { DEFAULTS } from "./constants.js";
import { toUserDTO } from "./DTOs/userDTO.js";
import { toAdminUserListDTO } from "./DTOs/adminUserListDTO.js";
import { toAddressDTO } from "./DTOs/addressDTO.js";
import { ValidationError } from "../../../utils/errors.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../../utils/pagination.js";
import log from "../../../utils/logger.js";

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
        log.error("IAM", "getUserById", "getUserById failed", err);
        throw err;
    }
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
        log.error("IAM", "viewAllUsers", "viewAllUsers failed", err);
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
        log.error("IAM", "searchUsers", "searchUsers failed", err);
        throw err;
    }
}

/**
 * This function returns a paginated list of the authenticated user's saved addresses.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {number|string} userId
 * @param {object} [queryParams] Raw query params (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
 */
async function getUserAddresses(userId, queryParams = {}) {
    try {
        const id = validateUserId(userId);

        if (!validatePaginationParams(queryParams)) {
            throw new ValidationError("Invalid pagination parameters.");
        }

        const pagination = parsePaginationQuery(queryParams);
        const total = await addressDAO.countByUserId(id);
        const rows =
            total === 0
                ? []
                : await addressDAO.findByUserId(
                      id,
                      pagination.limit,
                      pagination.offset,
                  );

        return {
            items: rows.map(toAddressDTO),
            pagination: paginationMeta({ ...pagination, total }),
        };
    } catch (err) {
        log.error("IAM", "getUserAddresses", "getUserAddresses failed", err);
        throw err;
    }
}

/**
 * This function returns one of the authenticated user's saved addresses.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.addressId
 * @returns {Promise<object>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the address does not exist or does not belong to the user
 * @throws {DatabaseError} On database failures
 */
async function getUserAddress({ userId, addressId }) {
    try {
        const valid = validateAddressRef({ userId, addressId });
        const row = await addressDAO.findByIdForUser(
            valid.addressId,
            valid.userId,
        );
        return toAddressDTO(row);
    } catch (err) {
        log.error("IAM", "getUserAddress", "getUserAddress failed", err);
        throw err;
    }
}

export {
    getUserById,
    viewAllUsers,
    searchUsers,
    getUserAddresses,
    getUserAddress,
};
