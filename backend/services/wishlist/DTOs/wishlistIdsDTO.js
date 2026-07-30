/**
 * This function maps wishlist cid rows to a representable format.
 * @param {object[]} rows DAO rows with cid
 * @returns {{ cids: number[] }}
 */
function toWishlistIdsDTO(rows) {
    return {
        cids: rows.map((row) => Number(row.cid)),
    };
}

export { toWishlistIdsDTO };
