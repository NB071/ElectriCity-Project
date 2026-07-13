import { toOrderListItemDTO } from "./orderListItemDTO.js";

/**
 * This function maps an order row to an admin paginated list item format.
 * @param {object} row DAO row (includes user_id/guest_email/user fields)
 * @returns {object}
 */
function toAdminOrderListItemDTO(row) {
    const dto = {
        ...toOrderListItemDTO(row),
        user_id: row.user_id,
        guest_email: row.guest_email ?? null,
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

export { toAdminOrderListItemDTO };
