import { toPaymentAttemptCore } from "./paymentSharedDTO.js";

/**
 * This function maps the admin payment attempt fields to a representable format.
 * @param {object} row DAO row
 * @returns {object}
 */
function toAdminPaymentAttemptDTO(row) {
    const dto = {
        ...toPaymentAttemptCore(row),
        user_id: row.user_id,
    };

    if (row.email != null) {
        dto.user = {
            user_id: row.user_id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
        };
    }

    return dto;
}

export { toAdminPaymentAttemptDTO };
