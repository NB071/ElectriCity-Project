/**
 * This function maps the wishlist entry fields to a representable format.
 * @param {object} row DAO row
 * @returns {{ user_id: number, cid: number, added_at: string }}
 */
function toWishlistEntryDTO(row) {
    return {
        user_id: row.user_id,
        cid: row.cid,
        added_at: row.added_at,
    };
}

export { toWishlistEntryDTO };
