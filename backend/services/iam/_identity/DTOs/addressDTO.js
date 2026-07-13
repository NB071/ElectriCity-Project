/**
 * This function maps an address database row to a representable format.
 * @param {object} row DAO row
 * @returns {object}
 */
function toAddressDTO(row) {
    return {
        address_id: row.address_id,
        street: row.street,
        city: row.city,
        province: row.province,
        country: row.country,
        postal_code: row.postal_code,
        is_default: Boolean(row.is_default),
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export { toAddressDTO };
