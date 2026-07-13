import { USER_FIELDS } from "../constants.js";

/**
 * This function maps a user database row to a safe API representation.
 * Only includes keys that were selected in the query.
 * @param {object} row DAO row
 * @returns {object}
 */
function toUserDTO(row) {
    const dto = {};

    const directFields = [
        USER_FIELDS.USER_ID,
        USER_FIELDS.FIRST_NAME,
        USER_FIELDS.LAST_NAME,
        USER_FIELDS.EMAIL,
        USER_FIELDS.PHONE_NUMBER,
        USER_FIELDS.CREATED_AT,
        USER_FIELDS.UPDATED_AT,
    ];

    for (const field of directFields) {
        if (row[field] !== undefined) {
            dto[field] = row[field];
        }
    }

    if (row[USER_FIELDS.ROLE] !== undefined) {
        dto[USER_FIELDS.ROLE] = row[USER_FIELDS.ROLE];
    }

    return dto;
}

export { toUserDTO };
