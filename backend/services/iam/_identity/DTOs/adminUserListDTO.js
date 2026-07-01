/**
 * This function maps the admin user list item to a representable format.
 * Combines first and last name into full_name for display.
 * @param {object} row DAO row
 * @returns {{
 *   user_id: number,
 *   full_name: string,
 *   email: string,
 *   phone_number: string|null,
 *   role: string,
 *   is_deleted: boolean,
 *   created_at: string
 * }}
 */
function toAdminUserListDTO(row) {
    return {
        user_id: row.user_id,
        full_name: `${row.first_name} ${row.last_name}`.trim(),
        email: row.email,
        phone_number: row.phone_number ?? null,
        role: row.role ?? row.role_name,
        is_deleted: row.deleted_at != null,
        created_at: row.created_at,
    };
}

export { toAdminUserListDTO };
