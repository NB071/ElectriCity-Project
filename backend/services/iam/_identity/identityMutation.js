// IAM Identity Management
// CQRS - Mutations

import bcrypt from "bcrypt";
import accountDAO from "./accountDAO.js";
import addressDAO from "./addressDAO.js";
import emailAdapter from "../EmailAdaptor.js";
import {
    validateUpdateProfile,
    validateDeleteProfile,
    validateCreateAddress,
    validateUpdateAddress,
    validateAddressRef,
} from "./identityValidator.js";
import { DEFAULTS, USER_FIELDS } from "./constants.js";
import { getUserById } from "./identityQuery.js";
import { toAddressDTO } from "./DTOs/addressDTO.js";
import { ConflictError, UnauthorizedError } from "../../../utils/errors.js";
import log from "../../../utils/logger.js";

/**
 * This function updates profile fields for the authenticated user.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} [data.firstName]
 * @param {string} [data.lastName]
 * @param {string} [data.email]
 * @param {string|null} [data.phoneNumber]
 * @param {string} [data.currentPassword] Required when newPassword is provided
 * @param {string} [data.newPassword]
 * @returns {Promise<object>} Updated user profile
 * @throws {ValidationError} If validation fails
 * @throws {UnauthorizedError} If current_password is incorrect
 * @throws {ConflictError} If the email is already taken
 * @throws {NotFoundError} If the user does not exist or is soft-deleted
 * @throws {DatabaseError} On database failures
 */
async function updateProfile({
    userId,
    firstName,
    lastName,
    email,
    phoneNumber,
    currentPassword,
    newPassword,
}) {
    try {
        const valid = validateUpdateProfile({
            userId,
            firstName,
            lastName,
            email,
            phoneNumber,
            currentPassword,
            newPassword,
        });

        const updates = {};

        if (valid.firstName !== undefined) {
            updates.first_name = valid.firstName;
        }

        if (valid.lastName !== undefined) {
            updates.last_name = valid.lastName;
        }

        if (valid.email !== undefined) {
            const taken = await accountDAO.emailExists(
                valid.email,
                valid.userId,
            );

            if (taken) {
                throw new ConflictError(
                    "Email is already registered to another account.",
                    { email: valid.email },
                );
            }

            updates.email = valid.email;
        }

        if (valid.phoneNumber !== undefined) {
            updates.phone_number = valid.phoneNumber;
        }

        if (valid.newPassword !== undefined) {
            const passwordHash = await accountDAO.findPasswordHashById(
                valid.userId,
            );
            const passwordMatches = await bcrypt.compare(
                valid.currentPassword,
                passwordHash,
            );

            if (!passwordMatches) {
                throw new UnauthorizedError("Current password is incorrect.");
            }

            updates.password_hash = await bcrypt.hash(
                valid.newPassword,
                DEFAULTS.BCRYPT_SALT_ROUNDS,
            );
        }

        await accountDAO.updateById(valid.userId, updates);
        return getUserById(valid.userId);
    } catch (err) {
        log.error("IAM", "updateProfile", "updateProfile failed", err);
        throw err;
    }
}

/**
 * This function soft-deletes the authenticated user's account and sends a confirmation email.
 * @param {object} data
 * @param {number} data.userId
 * @returns {Promise<{ deleted: true }>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the user does not exist or is already deleted
 * @throws {DatabaseError} On database failures
 */
async function deleteProfile({ userId }) {
    try {
        const { userId: id } = validateDeleteProfile({ userId });
        const user = await accountDAO.findById(id, [
            USER_FIELDS.FIRST_NAME,
            USER_FIELDS.EMAIL,
        ]);

        await accountDAO.softDeleteById(id);

        await emailAdapter.sendAccountDeletionEmail(
            user.email,
            user.first_name,
        );

        return { deleted: true };
    } catch (err) {
        log.error("IAM", "deleteProfile", "deleteProfile failed", err);
        throw err;
    }
}

/**
 * This function adds a saved address for the authenticated user.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.street
 * @param {string} data.city
 * @param {string} data.province
 * @param {string} data.country
 * @param {string} data.postalCode
 * @param {boolean} [data.isDefault=false]
 * @returns {Promise<object>} The created address
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
 */
async function addAddress({
    userId,
    street,
    city,
    province,
    country,
    postalCode,
    isDefault,
}) {
    try {
        const valid = validateCreateAddress({
            userId,
            street,
            city,
            province,
            country,
            postalCode,
            isDefault,
        });

        const row = await addressDAO.insert({
            user_id: valid.userId,
            street: valid.street,
            city: valid.city,
            province: valid.province,
            country: valid.country,
            postal_code: valid.postalCode,
            is_default: valid.isDefault,
        });

        return toAddressDTO(row);
    } catch (err) {
        log.error("IAM", "addAddress", "addAddress failed", err);
        throw err;
    }
}

/**
 * This function updates one of the authenticated user's saved addresses.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.addressId
 * @param {string} [data.street]
 * @param {string} [data.city]
 * @param {string} [data.province]
 * @param {string} [data.country]
 * @param {string} [data.postalCode]
 * @param {boolean} [data.isDefault]
 * @returns {Promise<object>} The updated address
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the address does not exist or does not belong to the user
 * @throws {DatabaseError} On database failures
 */
async function updateAddress({
    userId,
    addressId,
    street,
    city,
    province,
    country,
    postalCode,
    isDefault,
}) {
    try {
        const valid = validateUpdateAddress({
            userId,
            addressId,
            street,
            city,
            province,
            country,
            postalCode,
            isDefault,
        });

        await addressDAO.updateById(valid.addressId, valid.userId, {
            street: valid.street,
            city: valid.city,
            province: valid.province,
            country: valid.country,
            postal_code: valid.postalCode,
            is_default: valid.isDefault,
        });

        const row = await addressDAO.findByIdForUser(
            valid.addressId,
            valid.userId,
        );
        return toAddressDTO(row);
    } catch (err) {
        log.error("IAM", "updateAddress", "updateAddress failed", err);
        throw err;
    }
}

/**
 * This function removes one of the authenticated user's saved addresses.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.addressId
 * @returns {Promise<{ address_id: number }>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the address does not exist or does not belong to the user
 * @throws {DatabaseError} On database failures
 */
async function deleteAddress({ userId, addressId }) {
    try {
        const valid = validateAddressRef({ userId, addressId });
        await addressDAO.deleteById(valid.addressId, valid.userId);
        return { address_id: valid.addressId };
    } catch (err) {
        log.error("IAM", "deleteAddress", "deleteAddress failed", err);
        throw err;
    }
}

/**
 * This function marks one of the authenticated user's saved addresses as their default,
 * clearing the default flag from any other address they own.
 * userId must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.addressId
 * @returns {Promise<object>} The now-default address
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the address does not exist or does not belong to the user
 * @throws {DatabaseError} On database failures
 */
async function setDefaultAddress({ userId, addressId }) {
    try {
        const valid = validateAddressRef({ userId, addressId });
        await addressDAO.setDefault(valid.addressId, valid.userId);
        const row = await addressDAO.findByIdForUser(
            valid.addressId,
            valid.userId,
        );
        return toAddressDTO(row);
    } catch (err) {
        log.error(
            "IAM",
            "setDefaultAddress",
            "setDefaultAddress failed",
            err,
        );
        throw err;
    }
}

export {
    updateProfile,
    deleteProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};
