// IAM Identity Management
// CQRS - Mutations

import bcrypt from "bcrypt";
import accountDAO from "./accountDAO.js";
import emailAdapter from "../emailAdaptor.js";
import {
    validateUpdateProfile,
    validateDeleteProfile,
} from "./identityValidator.js";
import { DEFAULTS, USER_FIELDS } from "./constants.js";
import { getUserById } from "./identityQuery.js";
import { ConflictError, UnauthorizedError } from "../../../utils/errors.js";

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
        console.error(
            "[Service: IAM Identity] updateProfile failed:",
            err.message,
        );
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
        console.error(
            "[Service: IAM Identity] deleteProfile failed:",
            err.message,
        );
        throw err;
    }
}

export { updateProfile, deleteProfile };
